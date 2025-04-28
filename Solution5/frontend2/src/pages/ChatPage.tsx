import React from 'react';
import Chat from '../components/Chat';
import ContentTitle from '../components/ContentTitle';
import ChatSidebar from '../components/ChatSideBar';

export default function ChatPage() {
  return (
    <div className="h-[88vh] overflow-hidden">
      
      <div className="flex h-[calc(100%-60px)]">
        <ChatSidebar />
        <div className="flex-grow p-4 flex flex-col w-full box-border overflow-hidden">
          <Chat />
        </div>
      </div>
    </div>
  );
}
