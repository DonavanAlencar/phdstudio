import React from 'react';
import { sanitizeText } from '../../utils/mobileChatUtils';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface MobileChatMessageProps {
  message: Message;
}

const MobileChatMessage: React.FC<MobileChatMessageProps> = ({ message }) => {
  // Sanitizar texto para prevenir XSS
  const sanitizedText = sanitizeText(message.text);

  return (
    <div
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          message.sender === 'user'
            ? 'bg-brand-red text-white rounded-br-none'
            : 'bg-white/10 text-gray-100 border border-white/10 rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {sanitizedText}
        </p>
        <span
          className={`text-xs mt-1 block ${
            message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
          }`}
        >
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
};

export default MobileChatMessage;

