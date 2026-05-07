import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { generateRealCaseAnalysis } from './lib/gemini';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  attachment?: { name: string; data: string; mimeType: string };
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNewChat = () => {
    if (messages.length > 0 && !currentChatId) {
      setHistory(prev => [
        { id: Date.now().toString(), title: messages[0].content.substring(0, 30) + '...', messages: [...messages] },
        ...prev
      ]);
    } else if (messages.length > 0 && currentChatId) {
      setHistory(prev => prev.map(chat => chat.id === currentChatId ? { ...chat, messages: [...messages] } : chat));
    }
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleSelectChat = (id: string) => {
    // Save current before switching if it's new
    if (messages.length > 0 && !currentChatId) {
      setHistory(prev => [
        { id: Date.now().toString(), title: messages[0].content.substring(0, 30) + '...', messages: [...messages] },
        ...prev
      ]);
    } else if (messages.length > 0 && currentChatId) {
       setHistory(prev => prev.map(chat => chat.id === currentChatId ? { ...chat, messages: [...messages] } : chat));
    }

    const session = history.find(c => c.id === id);
    if (session) {
      setMessages(session.messages);
      setCurrentChatId(id);
    }
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (content: string, mode: string = 'Research', attachment?: { name: string; data: string; mimeType: string }) => {
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content, attachment };
    
    let updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const responseText = await generateRealCaseAnalysis(content, mode, attachment);
      const newAiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: responseText };
      updatedMessages = [...updatedMessages, newAiMsg];
      setMessages(updatedMessages);

      // Auto-save to history
      if (!currentChatId) {
         const newId = Date.now().toString();
         setCurrentChatId(newId);
         setHistory(prev => [
           { id: newId, title: content.substring(0, 30) + '...', messages: updatedMessages },
           ...prev
         ]);
      } else {
         setHistory(prev => prev.map(chat => chat.id === currentChatId ? { ...chat, messages: updatedMessages } : chat));
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: `**Error:** ${errorMessage}\n\nPlease make sure VITE_GEMINI_API_KEY is configured in Vercel Environment Variables.` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        onNewChat={handleNewChat} 
        onSelectChat={handleSelectChat}
        history={history} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentChatId={currentChatId}
      />
      <ChatInterface 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        isTyping={isTyping} 
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />
    </div>
  );
}

export default App;
