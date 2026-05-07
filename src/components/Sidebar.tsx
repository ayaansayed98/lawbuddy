import React from 'react';
import { Scale, Plus, MessageSquare, X } from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  history: { id: string; title: string }[];
  isOpen: boolean;
  onClose: () => void;
  currentChatId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat, onSelectChat, history, isOpen, onClose, currentChatId }) => {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-header">
          <Scale className="logo-icon" size={28} />
          <h1>LawBuddy AI</h1>
          <button className="mobile-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <button className="new-chat-btn" onClick={() => { onNewChat(); onClose(); }}>
          <Plus size={18} />
          New Case Query
        </button>

        <div className="history-list">
          {history.map((item) => (
            <div 
              key={item.id} 
              className={`history-item ${currentChatId === item.id ? 'active' : ''}`}
              onClick={() => onSelectChat(item.id)}
            >
              <MessageSquare size={16} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
