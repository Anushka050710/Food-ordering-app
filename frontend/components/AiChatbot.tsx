'use client';
import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { AI_CHAT } from '../lib/graphql/queries';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I am your food assistant. Ask me anything about restaurants or dishes!' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const [aiChat, { loading }] = useMutation(AI_CHAT);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);

    try {
      const { data } = await aiChat({ variables: { message: userMsg } });
      setMessages((prev) => [...prev, { role: 'assistant', text: data.aiChat }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }]);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl transition-all"
        title="AI Food Assistant"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          <div className="bg-orange-500 text-white px-4 py-3 font-semibold flex items-center gap-2">
            🤖 AI Food Assistant
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-80">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-sm rounded-bl-none">
                  Typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t p-2 flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400"
              placeholder="Ask about food..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
