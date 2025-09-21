import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const logs = [
  { id: 1, message: 'New deployment on Production', timestamp: '5 min ago' },
  { id: 2, message: 'User JohnDoe updated credentials', timestamp: '20 min ago' },
  { id: 3, message: 'Pre-Production database backup completed', timestamp: '1 hour ago' },
];

export default function Logs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">System Logs</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardHeader>
              <CardTitle>{log.message}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">Time: {log.timestamp}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
