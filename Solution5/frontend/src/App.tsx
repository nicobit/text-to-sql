import { Navigate,BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Dashboard from '@/pages/Dashboard';
import Login from './pages/Login';
import Settings from '@/pages/Settings';
import { useMsal } from "@azure/msal-react";
import Environment from '@/pages/Environment';
import ChatPage from '@/pages/ChatPage';
import QuestionQueryExamplePage from '@/pages/QuestionQueryExamplePage';
import StatusPage from '@/pages/StatusPage';
import CostsDashboardPage from '@/pages/CostDashboardPage';


import Logs from '@/pages/Logs';
import User from '@/pages/User';

import { useAuthZ, AdminOnly } from "@/auth/useAuthZ";



export default function App() {

    const { accounts } = useMsal();
    const isAuthenticated = accounts && accounts.length > 0;

    if (!isAuthenticated) {
        console.log("User is not authenticated");
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
          </Router>
        );
      }else{
        console.log("User is authenticated");
    
      }
  
  return (
    <Router>
      <ThemeProvider>
        <SidebarProvider>
          <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Topbar */}
              <Topbar />

              {/* Pages */}
              <main className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/question" element={<QuestionQueryExamplePage />} />
                  <Route path="/settings" element={<AdminOnly><Settings /></AdminOnly>} />
                  <Route path="/environment" element={<Environment />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/User" element={<User />} />
                  <Route path="/status" element={<StatusPage />} />
                  <Route path="/costs" element={<CostsDashboardPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </Router>
  );
}
