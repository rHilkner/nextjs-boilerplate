import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError, z, ZodType } from 'zod';
import { logger } from '../logging';

/**
 * Types for authentication context
 */
export type AuthContext = {
  userId: string | null;
  role: string | null;
  valid: false;
} | ValidAuthContext;

export type ValidAuthContext = {
  userId: string;
  role: string;
  valid: true;
  has: (criteria: { role?: string }) => boolean;
};

/**
 * Function signatures for public and protected endpoints
 */
export type RequestFnPublicParams = {
  authCtx: AuthContext;
  data: unknown;
  query: Record<string, string>;
  headers: Record<string, string>;
  req: NextRequest;
};

export type RequestFnProtectedParams = {
  authCtx: ValidAuthContext;
  data: unknown;
  query: Record<string, string>;
  headers: Record<string, string>;
  req: NextRequest;
};

export type RequestFnPublic<T extends ZodType<unknown>> = (
  params: RequestFnPublicParams,
  data: z.infer<T> | undefined,
) => Promise<NextResponse>;

export type RequestFnProtected<T extends ZodType<unknown>> = (
  params: RequestFnProtectedParams,
  data: z.infer<T> | undefined,
) => Promise<NextResponse>;

type RequestHandlerOptionsWithSchema<T extends ZodSchema> = {
  schema: T;
  isPublicEndpoint?: boolean;
  requiredRole?: string;
};

type RequestHandlerOptionsWithoutSchema = {
  schema?: undefined;
  isPublicEndpoint?: boolean;
  requiredRole?: string;
};

// Overload for endpoints with a schema
export function requestHandler<T extends ZodSchema>(
  options: RequestHandlerOptionsWithSchema<T> & { isPublicEndpoint: true },
  requestFn: (
    params: RequestFnPublicParams,
    data: z.infer<T>,
  ) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse>;

export function requestHandler<T extends ZodSchema>(
  options: RequestHandlerOptionsWithSchema<T> & { isPublicEndpoint?: false },
  requestFn: (
    params: RequestFnProtectedParams,
    data: z.infer<T>,
  ) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse>;

// Overload for endpoints without a schema
export function requestHandler(
  options: RequestHandlerOptionsWithoutSchema & { isPublicEndpoint: true },
  requestFn: (
    params: RequestFnPublicParams,
    data: unknown,
  ) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse>;

export function requestHandler(
  options: RequestHandlerOptionsWithoutSchema & { isPublicEndpoint?: false },
  requestFn: (
    params: RequestFnProtectedParams,
    data: unknown,
  ) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse>;

/**
 * Creates a request handler that:
 *   - Checks authentication based on the endpoint type (public/protected) and required role.
 *   - Optionally validates the request body against a Zod schema.
 *   - Invokes the provided request function.
 *
 * @param options - Options that control validation and authentication.
 * @param requestFn - The request function to handle the business logic.
 * @returns A function that accepts a NextRequest and returns a NextResponse.
 */
export function requestHandler<T extends ZodType<unknown>>(
  options: RequestHandlerOptionsWithSchema<T> | RequestHandlerOptionsWithoutSchema,
  requestFn: RequestFnPublic<T> | RequestFnProtected<T>,
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Get request ID from headers or generate a new one
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    const log = logger.child({ requestId });
    
    log.info({
      method: req.method,
      url: req.nextUrl.pathname,
    }, 'Incoming request');

    const { schema, isPublicEndpoint, requiredRole } = options;
    const authCtx = getAuth(req);

    // Check authentication for protected endpoints
    const authError = checkAuth(authCtx, isPublicEndpoint, requiredRole);
    if (authError) return authError;

    // Parse request body
    const body = await parseRequestBody(req);
    if (!body.ok) return body.error;

    let data = body.data;

    // If a schema is provided and data is not undefined, perform validation
    if (schema && data !== undefined) {
      const validation = validateData(schema, data);
      if (!validation.ok) return validation.error;
      data = validation.data;
    }

    const query = Object.fromEntries(req.nextUrl.searchParams.entries());
    const headers = Object.fromEntries(req.headers.entries());
    const params = { authCtx, query, headers, req };

    try {
      if (isPublicEndpoint) {
        return await (requestFn as RequestFnPublic<T>)(
          params as RequestFnPublicParams,
          data,
        );
      } else {
        return await (requestFn as RequestFnProtected<T>)(
          params as RequestFnProtectedParams,
          data,
        );
      }
    } catch (handlerError: unknown) {
      log.error({ error: handlerError }, 'Internal server error');
      return NextResponse.json(
        { message: 'Internal server error. Please try again later.' },
        { status: 500 },
      );
    }
  };
}

/**
 * Gets authentication context from the request
 */
function getAuth(req: NextRequest): AuthContext {
  const userId = req.headers.get('x-user-id');
  const role = req.headers.get('x-user-role');

  if (!userId || !role) {
    return { userId: null, role: null, valid: false };
  }

  return {
    userId,
    role,
    valid: true,
    has: (criteria: { role?: string }) => {
      if (criteria.role) {
        return role === criteria.role;
      }
      return true;
    },
  };
}

/**
 * Checks authentication and role requirements for protected endpoints.
 * Returns a NextResponse with an error if the authentication is not valid.
 */
function checkAuth(
  authCtx: AuthContext,
  isPublicEndpoint?: boolean,
  requiredRole?: string,
): NextResponse | undefined {
  if (isPublicEndpoint) return;

  if (!authCtx.valid) {
    return NextResponse.json(
      {
        message: 'Unauthorized. Please log in to access this resource.',
      },
      { status: 401 },
    );
  }

  if (requiredRole && !authCtx.has({ role: requiredRole })) {
    return NextResponse.json(
      {
        message: 'Forbidden. You do not have the necessary permissions to access this resource.',
      },
      { status: 403 },
    );
  }
  return;
}

type ParseResult =
  | { ok: true; data: unknown }
  | { ok: false; error: NextResponse };

/**
 * Parses the request body according to its content type
 */
async function parseRequestBody(req: NextRequest): Promise<ParseResult> {
  const contentTypeHeader = req.headers.get('content-type') || '';
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);

  // For GET requests or empty bodies, skip parsing
  if (req.method === 'GET' || contentLength === 0) {
    return { ok: true, data: undefined };
  }

  // Normalize the media type
  const mediaType = contentTypeHeader.split(';')[0].trim().toLowerCase();

  try {
    let data: unknown;
    switch (mediaType) {
      case 'application/json':
        data = await req.json();
        break;
      case 'application/x-www-form-urlencoded':
      case 'multipart/form-data':
        const result: Record<string, unknown> = {};
        const formData = await req.formData();
        for (const [key, value] of formData.entries()) {
          result[key] = value;
        }
        data = result;
        break;
      default:
        // For unsupported content types, skip parsing
        data = undefined;
        break;
    }
    return { ok: true, data };
  } catch (error: unknown) {
    logger.warn(`Error parsing ${mediaType} body:`, error);
    return {
      ok: false,
      error: NextResponse.json(
        {
          message:
            mediaType === 'application/json'
              ? 'Invalid JSON body.'
              : `Invalid ${mediaType} body.`,
        },
        { status: 400 },
      ),
    };
  }
}

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: NextResponse };

/**
 * Validates data against the provided Zod schema
 */
function validateData<T>(
  schema: ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedErrors = formatZodError(result.error);
    logger.warn('Validation error:', formattedErrors);
    return {
      ok: false,
      error: NextResponse.json(
        {
          message: 'Validation error. Please review your request payload.',
          errors: formattedErrors,
        },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: result.data };
}

/**
 * Formats a ZodError into a record of error messages
 */
function formatZodError(error: ZodError): Record<string, string[]> {
  return error.issues.reduce(
    (acc, issue) => {
      const path = issue.path.join('.') || 'root-object';
      acc[path] = acc[path] ? [...acc[path], issue.message] : [issue.message];
      return acc;
    },
    {} as Record<string, string[]>,
  );
}