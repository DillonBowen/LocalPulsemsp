import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToBot, startChat } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    startChat();
    setMessages([{ text: "Hello! I'm LocalPulse AI. How can I help you find opportunities or use the app today?", sender: 'bot' }]);
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botResponse = await sendMessageToBot(input);
    const botMessage: Message = { text: botResponse, sender: 'bot' };
    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--glow-secondary)] mb-4 text-center" style={{ textShadow: '0 0 8px var(--glow-secondary)' }}>Chat with LocalPulse AI</h2>
      <div className="flex-grow card-style rounded-b-none p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl text-white ${msg.sender === 'user' ? 'bg-[var(--glow-primary)]' : 'bg-[var(--bg-card-solid)] border border-[var(--border-color)]'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start mb-3">
                <div className="max-w-xs px-4 py-2 rounded-xl bg-[var(--bg-card-solid)] border border-[var(--border-color)]">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex card-style rounded-t-none p-2 border-t border-[var(--border-color)]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-grow p-3 input-style"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="ml-2 btn-primary"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
