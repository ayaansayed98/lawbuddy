import React from 'react';
import { Scale, Plus, MessageSquare, X } from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
  history: { id: string; title: string }[];
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat, history, isOpen, onClose }) => {
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
            <div key={item.id} className="history-item">
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
