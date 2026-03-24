import { useState, useEffect, useRef } from 'react';
import { sendMessage, initChat } from '../services/geminiService';

export default function AITeacher({ onHighlight }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm Nocturne, your AI Piano Teacher. I can teach you chords, scales, and songs, and I can even light up the keys on your screen to show you what to play! What would you like to learn?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initChat();
  }, []);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const response = await sendMessage(userMessage);
    let responseText = response.text;
    let highlightedNotes = [];

    // Parse [HIGHLIGHT:C4,E4,G4]
    const highlightRegex = /\[HIGHLIGHT:([A-G#0-9,]+)\]/g;
    const match = highlightRegex.exec(responseText);
    
    if (match) {
        highlightedNotes = match[1].split(',');
        responseText = responseText.replace(highlightRegex, '').trim();
    }

    setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    
    if (highlightedNotes.length > 0) {
        onHighlight(new Set(highlightedNotes));
    } else {
        onHighlight(new Set()); // clear highlights
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-28 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="bg-surface-container-low border border-tertiary/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-2xl w-80 md:w-96 h-[400px] mb-4 flex flex-col overflow-hidden backdrop-blur-3xl animate-in slide-in-from-bottom-5">
          <div className="bg-[#050505] border-b border-white/5 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>psychiatry</span>
               <span className="font-headline font-bold text-sm text-tertiary uppercase tracking-widest">Nocturne AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 piano-scroll">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] rounded-2xl p-3 text-sm font-body leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-on-primary self-end rounded-tr-sm' : 'bg-surface-container-highest text-on-surface self-start rounded-tl-sm border border-white/5'}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-surface-container-highest text-on-surface-variant self-start rounded-2xl rounded-tl-sm p-4 text-sm border border-white/5 flex gap-1 items-center">
                 <div className="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                 <div className="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                 <div className="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-[#050505] border-t border-white/5 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a chord or song..." 
              className="flex-1 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 text-sm rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-tertiary/30 transition-colors"
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="bg-tertiary text-[#050505] w-10 h-10 rounded-xl hover:bg-[#bef264] disabled:opacity-50 disabled:hover:bg-tertiary transition-colors flex items-center justify-center shadow-lg">
               <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-tertiary hover:bg-[#bef264] text-[#050505] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-transform hover:scale-105 active:scale-95"
      >
        <span className="material-symbols-outlined text-[28px]" style={{fontVariationSettings: "'FILL' 0"}}>{isOpen ? 'expand_more' : 'psychiatry'}</span>
      </button>
    </div>
  );
}
