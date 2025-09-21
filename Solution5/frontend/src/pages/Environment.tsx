import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const environments = [
  { name: 'Production', status: 'Healthy', updated: '5 min ago' },
  { name: 'Pre-Production', status: 'Healthy', updated: '10 min ago' },
  { name: 'Testing', status: 'Maintenance', updated: '1 hour ago' },
];

export default function Environment() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Environment Status</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {environments.map((env, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{env.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{env.status}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {env.updated}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
