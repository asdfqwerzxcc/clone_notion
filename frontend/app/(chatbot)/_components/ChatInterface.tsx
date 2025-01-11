// app/components/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  isBot: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: '안녕하세요! 무엇을 도와드릴까요?', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // 사용자 메시지 추가
    const userMessage = {
      id: messages.length + 1,
      content: input,
      isBot: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // 텍스트 영역 높이 초기화
    const textarea = e.target as HTMLFormElement;
    const textareaElement = textarea.querySelector('textarea');
    if (textareaElement) {
      textareaElement.style.height = '50px';  // 초기 높이로 리셋
    }

    // API 호출 예시 (실제 구현 필요)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await response.json();
      
      const botMessage = {
        id: messages.length + 2,
        content: data.message || '죄송합니다. 일시적인 오류가 발생했습니다.',
        isBot: true
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        content: '오류가 발생했습니다. 다시 시도해 주세요.',
        isBot: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-[100vh] w-full bg-zinc-50 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 border-b dark:border-zinc-700 p-4 shadow-sm">
        <h1 className="text-xl font-semibold dark:text-white text-center">AI Assistant</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm whitespace-pre-wrap break-words ${
                message.isBot
                  ? 'bg-white dark:bg-zinc-800 border dark:border-zinc-700 dark:text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 max-w-5xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 p-3 border dark:border-zinc-700 rounded-xl
                     bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     resize-none h-[50px] max-h-[200px] "
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = '50px';
              target.style.height = `${target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 
                     transition-colors focus:outline-none focus:ring-2 
                     focus:ring-blue-500 h-[40px] w-[40px] flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}