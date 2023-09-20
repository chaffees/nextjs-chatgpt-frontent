import ChatComponent from '../src/components/ChatComponent';

function Home() {
  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--chat-container-bg)' }}>
      <ChatComponent />
    </div>
  );
}

export default Home;
