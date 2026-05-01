import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { generateRealCaseAnalysis } from './lib/gemini';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string }[]>([]);

  const handleNewChat = () => {
    if (messages.length > 0) {
      setHistory(prev => [
        { id: Date.now().toString(), title: messages[0].content.substring(0, 30) + '...' },
        ...prev
      ]);
      setMessages([]);
    }
  };

  const handleSendMessage = async (content: string) => {
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const responseText = await generateRealCaseAnalysis(content);
      const newAiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: responseText };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (error: any) {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: `**Error:** ${error.message}\n\nPlease make sure VITE_GEMINI_API_KEY is configured in Vercel Environment Variables.` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar onNewChat={handleNewChat} history={history} />
      <ChatInterface 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        isTyping={isTyping} 
      />
    </div>
  );
}

export default App;
