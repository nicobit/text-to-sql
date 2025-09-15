import { useState } from 'react';
import Chat from '../components/Chat';
import ChatSidebar from '../components/ChatSideBar';
import { Menu as FaBars, X as FaTimes } from 'lucide-react'; // Import icons

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-[87vh] overflow-hidden">
      <div className="flex h-[calc(100%-60px)]">
        <div className="relative flex">
            {isSidebarOpen && (
            <div className="w-64 overflow-hidden transition-all duration-300">
              <ChatSidebar />
            </div>
            )}
            <button
            className={`top-4 ${isSidebarOpen ? 'left-48' : 'left-0'} p-2 h-8 bg-gray-300 dark:bg-gray-800 text-white rounded-full shadow-lg z-10 transition-all duration-300`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
            {isSidebarOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
            </button>
        </div>
        <div className="flex-grow p-4 flex flex-col w-full box-border overflow-hidden">
          <Chat />
        </div>
      </div>
    </div>
  );
}
