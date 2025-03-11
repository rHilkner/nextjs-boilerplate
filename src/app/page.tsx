import React from 'react';
import { Hero } from '@/components/marketing/Hero';
import { metadata as rootMetadata } from '@/app/layout';

export const metadata = {
  ...rootMetadata,
  title: 'Next.js SaaS Boilerplate - Home',
  description: 'A production-ready starter kit for building SaaS applications with Next.js, Tailwind CSS, and TypeScript.',
};

export default function HomePage() {
  return (
    <div>
      <Hero />
      
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to build your SaaS
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              This boilerplate includes everything you need to get started building your SaaS application.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'Authentication',
    description: 'Built-in authentication with Google OAuth and JWT, with support for other providers coming soon.',
    icon: IconComponent,
  },
  {
    name: 'Database',
    description: 'Integrated with Prisma ORM for type-safe database access and easy migrations.',
    icon: IconComponent,
  },
  {
    name: 'UI Components',
    description: 'Pre-built UI components using Tailwind CSS for rapid development.',
    icon: IconComponent,
  },
  {
    name: 'API Routes',
    description: 'RESTful API routes with proper error handling and validation.',
    icon: IconComponent,
  },
  {
    name: 'Logging',
    description: 'Structured logging for both client and server-side code.',
    icon: IconComponent,
  },
  {
    name: 'TypeScript',
    description: 'Full TypeScript support for type-safe development.',
    icon: IconComponent,
  },
];

function IconComponent({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}