import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, Mic, Camera, Paperclip, 
  FileText, Presentation, FileDown, 
  BookOpen, BrainCircuit, RefreshCw, StopCircle, Scale, Menu
} from 'lucide-react';
import pptxgen from 'pptxgenjs';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  isTyping: boolean;
  onToggleSidebar: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping, onToggleSidebar }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState<{show: boolean, type: string}>({show: false, type: ''});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setInput((prev) => prev + " [Voice input transcribed: Explain the recent ruling on digital privacy acts.]");
    } else {
      setIsRecording(true);
    }
  };

  const handleCameraToggle = () => {
    setShowModal({show: true, type: 'Camera Access'});
  };

  const handleFileUpload = () => {
    setShowModal({show: true, type: 'File Upload'});
  };

  const closeModal = () => setShowModal({show: false, type: ''});

  const generateDocx = (content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'application/msword'});
    element.href = URL.createObjectURL(file);
    element.download = "Legal_Analysis.doc";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  const generatePptx = (content: string) => {
    let pres = new pptxgen();
    let slide = pres.addSlide();
    slide.addText("Legal Case Analysis", { x: 1, y: 1, fontSize: 24, bold: true });
    slide.addText(content.substring(0, 300) + "...", { x: 1, y: 2, fontSize: 14 });
    pres.writeFile({ fileName: "Legal_Presentation.pptx" });
  };

  return (
    <div className="main-chat">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="mobile-menu-btn" onClick={onToggleSidebar}>
            <Menu size={24} />
          </button>
          <h2>Real-Time Legal Assistant</h2>
        </div>
        <div className="badge">
          <RefreshCw size={12} />
          <span className="badge-text">Data Synced Today</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="intro-container">
            <Scale size={64} color="var(--primary-accent)" style={{ marginBottom: '24px' }} />
            <h2>LawBuddy AI</h2>
            <p>
              Your specialized legal assistant. I rely strictly on established, real-world 
              case law and statutes. I do not invent hypothetical scenarios unless explicitly 
              prompted. Need help with an assignment or researching a real case? Ask away.
            </p>
            <div className="features-grid">
              <div className="feature-card">
                <BookOpen size={24} />
                <h3>Real Case Law</h3>
                <p>Access factual rulings and precedents.</p>
              </div>
              <div className="feature-card">
                <FileText size={24} />
                <h3>Assignment Help</h3>
                <p>Generate briefs, memos, and documents.</p>
              </div>
              <div className="feature-card">
                <BrainCircuit size={24} />
                <h3>Multi-Modal</h3>
                <p>Use voice, camera, or text to search.</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role}`}>
              <div className={`avatar ${msg.role}`}>
                {msg.role === 'ai' ? <Scale size={20} /> : 'U'}
              </div>
              <div className={`message-bubble ${msg.role}`}>
                {msg.role === 'ai' ? (
                  <>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    <div className="ai-actions">
                      <button className="action-btn" onClick={() => generateDocx(msg.content)}>
                        <FileDown size={14} /> Export Doc
                      </button>
                      <button className="action-btn" onClick={() => generatePptx(msg.content)}>
                        <Presentation size={14} /> Export PPT
                      </button>
                    </div>
                  </>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="message-wrapper ai">
             <div className="avatar ai"><Scale size={20} /></div>
             <div className="message-bubble ai">
               <span style={{ color: 'var(--text-muted)' }}>Retrieving real case data...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area-container">
        <div className="input-box">
          <textarea
            className="textarea"
            placeholder="Ask about a case, legal concept, or upload an assignment..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={Math.min(5, input.split('\n').length || 1)}
          />
          <div className="input-actions">
            <div className="left-actions">
              <button 
                className={`icon-btn ${isRecording ? 'recording' : ''}`} 
                onClick={handleVoiceToggle}
                title="Voice Input"
              >
                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
              </button>
              <button className="icon-btn" onClick={handleCameraToggle} title="Camera Input">
                <Camera size={20} />
              </button>
              <button className="icon-btn" onClick={handleFileUpload} title="Upload File/Image">
                <Paperclip size={20} />
              </button>
            </div>
            <button 
              className="send-btn" 
              onClick={handleSend} 
              disabled={!input.trim() && !isRecording}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {showModal.show && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{showModal.type}</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              In a production environment, this would open the native device {showModal.type.toLowerCase()} 
              dialog to allow capturing or uploading media directly to the context window.
            </p>
            <button className="modal-close" onClick={closeModal}>Close Mock</button>
          </div>
        </div>
      )}
    </div>
  );
};
