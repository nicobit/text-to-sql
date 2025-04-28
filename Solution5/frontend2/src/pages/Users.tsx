import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const users = [
  { id: 1, name: 'John Doe', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', role: 'Developer', status: 'Pending' },
  { id: 3, name: 'Alice Johnson', role: 'Viewer', status: 'Active' },
];

export default function Users() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Users</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">Role: {user.role}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status: {user.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
