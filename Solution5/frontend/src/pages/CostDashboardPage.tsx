import { useMsal } from "@azure/msal-react";

import CostsDashboard from '@/components/costs/costDashboard';

export default function CostsDashboardPage() {
    const { instance } = useMsal();
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 h-full">
           
            <div className="col-span-full h-full">
                {/* Pass the required 'instance' prop to CostsDashboard */}
                <CostsDashboard instance={instance} />
            </div>
        </div>
    );
}
