# Form Components with React Hook Form and Zod

This directory contains our premium form components built with React Hook Form and Zod validation. These components provide a robust, type-safe, and user-friendly form experience.

## Key Features

- 🛡️ **Type-safe validation** with Zod schemas
- 🔄 **Real-time validation** as users type
- 🧩 **Component-based design** for easy composition
- ♿ **Accessibility built-in** with proper ARIA attributes
- 🌐 **Error messages** automatically displayed from schema definitions
- 🎨 **Styled with Tailwind CSS** for easy customization

## Core Components

### Form Container

The `FormContainer` component connects a Zod schema with React Hook Form:

```tsx
import { z } from 'zod';
import { FormContainer } from '@/components/forms/Form';

// Define schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Use the form
<FormContainer 
  schema={loginSchema}
  defaultValues={{ email: '', password: '' }}
  onSubmit={(data) => console.log(data)}
>
  {(form) => (
    // Form fields go here
  )}
</FormContainer>
```

### Form Fields

We provide several field components that integrate with React Hook Form:

- `FormField` - Standard text inputs
- `SelectField` - Dropdown selects
- `CheckboxField` - Checkboxes
- `TextAreaField` - Multi-line text areas

Each field is connected to the form's validation and state:

```tsx
<FormField
  name="email"
  label="Email Address"
  form={form}
  type="email"
  placeholder="you@example.com"
  required
/>
```

## How to Use

### 1. Define Your Schema

Create a Zod schema that describes your form's data structure and validation rules:

```tsx
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  role: z.enum(['user', 'admin']),
  newsletter: z.boolean().default(false),
});

// Get TypeScript type from schema
type UserFormData = z.infer<typeof userSchema>;
```

### 2. Create Your Form

Use the `FormContainer` to create your form:

```tsx
import { FormContainer } from '@/components/forms/Form';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { CheckboxField } from '@/components/forms/CheckboxField';

function UserForm({ onSubmit }) {
  return (
    <FormContainer
      schema={userSchema}
      defaultValues={{
        name: '',
        email: '',
        role: 'user',
        newsletter: false,
      }}
      onSubmit={onSubmit}
    >
      {(form) => (
        <>
          <FormField name="name" label="Name" form={form} />
          <FormField name="email" label="Email" form={form} type="email" />
          <SelectField 
            name="role" 
            label="Role" 
            form={form} 
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]} 
          />
          <CheckboxField 
            name="newsletter" 
            label="Subscribe to newsletter" 
            form={form} 
          />
          <button type="submit">Submit</button>
        </>
      )}
    </FormContainer>
  );
}
```

### 3. Handle Form Submission

The `onSubmit` function receives the validated form data:

```tsx
const handleSubmit = (data: UserFormData) => {
  // Data is already validated and typed!
  console.log(data);
  // Submit to API
};
```

## Advanced Usage

### Custom Field Validation

You can add custom validation to the Zod schema:

```tsx
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // Path determines which field gets the error
});
```

### Conditional Validation

You can create conditional validation rules:

```tsx
const schema = z.object({
  sendNotifications: z.boolean(),
  email: z.string().email().optional()
    .refine(email => {
      // If sendNotifications is true, email is required
      return !sendNotifications || (email && email.length > 0);
    }, 'Email is required when notifications are enabled'),
});
```

### Field Arrays

For dynamic fields, use the `useFieldArray` hook from React Hook Form:

```tsx
import { useFieldArray } from 'react-hook-form';

// Inside your form function:
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "items",
});

// Then render fields:
{fields.map((field, index) => (
  <FormField 
    key={field.id}
    name={`items.${index}.name`}
    form={form}
  />
))}
<button type="button" onClick={() => append({ name: '' })}>
  Add Item
</button>
```

## Example

See the `examples/UserProfileForm.tsx` for a complete example of how to use these components together.

## Best Practices

1. **Define schemas separately** for reuse and better organization
2. **Use typed form data** with `z.infer<typeof schema>`
3. **Group related fields** in the UI for better user experience
4. **Provide helpful error messages** in your schema definitions
5. **Include proper labels and helper text** for accessibility
6. **Use appropriate field types** (email, number, tel, etc.)