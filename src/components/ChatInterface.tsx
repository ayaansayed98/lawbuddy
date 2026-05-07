import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, Mic, Paperclip, 
  Presentation, FileDown, 
  BookOpen, RefreshCw, StopCircle, Scale, Menu,
  Languages, PenTool, Headphones, FileStack
} from 'lucide-react';
import pptxgen from 'pptxgenjs';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  attachment?: { name: string; data: string; mimeType: string };
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (msg: string, mode?: string, attachment?: { name: string; data: string; mimeType: string }) => void;
  isTyping: boolean;
  onToggleSidebar: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping, onToggleSidebar }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeMode, setActiveMode] = useState('Research');
  const [attachment, setAttachment] = useState<{name: string, data: string, mimeType: string} | null>(null);
  const [recognition, setRecognition] = useState<unknown>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const sr = new SpeechRecognition();
      sr.continuous = true;
      sr.interimResults = false;
      sr.onresult = (e: unknown) => {
        const event = e as { resultIndex: number, results: { isFinal: boolean, [key: number]: { transcript: string } }[] };
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => (prev + ' ' + finalTranscript).trim());
        }
      };
      sr.onend = () => setIsRecording(false);
      sr.onerror = (e: unknown) => { console.error(e); setIsRecording(false); };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecognition(sr);
    }
  }, []);

  const modes = [
    { name: 'Research', icon: <BookOpen size={16} /> },
    { name: 'Drafting', icon: <PenTool size={16} /> },
    { name: 'Translation', icon: <Languages size={16} /> },
    { name: 'Meeting Assistant', icon: <Headphones size={16} /> },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim() || attachment) {
      onSendMessage(input, activeMode, attachment ? attachment : undefined);
      setInput('');
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (!recognition) return alert('Speech recognition not supported in this browser.');
    const rec = recognition as { start: () => void, stop: () => void };
    if (isRecording) {
      rec.stop();
      setIsRecording(false);
    } else {
      rec.start();
      setIsRecording(true);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      setAttachment({
        name: file.name,
        data: base64data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

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
    const pres = new pptxgen();
    const slide = pres.addSlide();
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
            <h2>LawBuddy AI <span className="free-badge">PRO Free</span></h2>
            <p>
              Your specialized legal workspace. We've unlocked premium tools for everyone. 
              Draft documents, translate complex legal text, analyze up to 5000-page PDFs, 
              and summarize meetings—all for free.
            </p>
            <div className="features-grid">
              <div className="feature-card">
                <PenTool size={24} />
                <h3>Legal Drafting</h3>
                <p>Generate structured, precise legal drafts in minutes.</p>
              </div>
              <div className="feature-card">
                <Languages size={24} />
                <h3>Translation</h3>
                <p>Translate legal documents preserving specific terminology.</p>
              </div>
              <div className="feature-card">
                <Headphones size={24} />
                <h3>Meeting Assistant</h3>
                <p>Convert meeting audio to transcripts & summaries.</p>
              </div>
              <div className="feature-card">
                <FileStack size={24} />
                <h3>Deep Analysis</h3>
                <p>Analyze and chat with massive documents (5000+ pages).</p>
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
                {msg.attachment && (
                  <div className="message-attachment">
                    <Paperclip size={14} />
                    <span>{msg.attachment.name}</span>
                  </div>
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
        <div className="mode-selector">
          {modes.map(mode => (
            <button 
              key={mode.name}
              className={`mode-btn ${activeMode === mode.name ? 'active' : ''}`}
              onClick={() => setActiveMode(mode.name)}
            >
              {mode.icon} {mode.name}
            </button>
          ))}
        </div>
        <div className="input-box">
          {attachment && (
            <div className="attachment-preview">
              <Paperclip size={14} />
              <span>{attachment.name}</span>
              <button className="remove-attachment" onClick={() => setAttachment(null)}>
                <StopCircle size={14} />
              </button>
            </div>
          )}
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
              <button className="icon-btn" onClick={handleFileUpload} title="Upload File/Image">
                <Paperclip size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />
            </div>
            <button 
              className="send-btn" 
              onClick={handleSend} 
              disabled={(!input.trim() && !attachment) && !isRecording}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
