import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
      {children}
    </h3>
  );
}

export function CardContent({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
