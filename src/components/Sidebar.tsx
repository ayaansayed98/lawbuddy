import React from 'react';
import { Scale, Plus, MessageSquare } from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
  history: { id: string; title: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat, history }) => {
  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="sidebar-header">
        <Scale className="logo-icon" size={28} />
        <h1>LawBuddy AI</h1>
      </div>
      
      <button className="new-chat-btn" onClick={onNewChat}>
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
  );
};
