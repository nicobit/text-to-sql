import { useMsal } from "@azure/msal-react";

import HealthStatusDashboard from '@/components/health/HealthStatusDashboard';

export default function StatusPage() {
    const { instance } = useMsal();
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 h-full">
            {/* Active Users Widget 
            <Card>
                <CardHeader>
                    <CardTitle>Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">1,245</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Compared to last week: +5%</p>
                </CardContent>
            </Card>

            {/* Environment Status Widget 
            <Card>
                <CardHeader>
                    <CardTitle>Environment Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-500">Operational</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">All systems healthy</p>
                </CardContent>
            </Card>

            {/* New Deployments Widget 
            <Card>
                <CardHeader>
                    <CardTitle>New Deployments</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">8</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Last 24 hours</p>
                </CardContent>
            </Card>

            {/* Pending Approvals Widget 
            <Card>
                <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">3</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Waiting for review</p>
                </CardContent>
            </Card> */}
            <div className="col-span-full h-full">
                {/* Pass the required 'instance' prop to HealthStatusDashboard */}
                <HealthStatusDashboard instance={instance} />
            </div>
        </div>
    );
}
