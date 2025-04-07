import Chat from '../components/Chat';
import ContentTitle from '../components/ContentTitle';
import { Box } from '@mui/material';
import ChatSideBar from '../components/ChatSideBar';

const ChatPage: React.FC = () => {
 
  return (
    <div style={{ height: '88vh', overflow: 'hidden' }}>
      <ContentTitle title="Questions/SQL Query Examples" />
      {/* Adjust the remaining height by subtracting header height (e.g., 60px) */}
      <Box sx={{ display: 'flex', height: 'calc(100% - 60px)' }}>
        <ChatSideBar />
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          <Chat />
        </Box>
      
      </Box>

     
    </div>
  );
};

export default ChatPage;
