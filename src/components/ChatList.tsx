import React from 'react';
import { MessageSquare, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Chat } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  onOpenSupport: () => void;
  currentUserId: string;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat, onOpenSupport, currentUserId }) => {
  return (
    <div className="space-y-4">
      <button
        onClick={onOpenSupport}
        className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 hover:bg-emerald-100 transition-colors text-left group"
      >
        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-emerald-900">Suporte Feira Livre</h3>
          <p className="text-sm text-emerald-700">Precisa de ajuda? Fale com nossa equipe.</p>
        </div>
        <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
      </button>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 mb-2">Nenhuma conversa ainda</h3>
          <p className="text-stone-500 max-w-xs">
            Suas conversas com feirantes aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50">
            <h2 className="font-bold text-stone-800">Minhas Conversas</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors text-left group"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-stone-800 truncate">
                      {chat.type === 'support' ? 'Suporte Feira Livre' : (chat.storeName || 'Conversa')}
                    </h3>
                    {chat.updatedAt && (
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(chat.updatedAt, 'dd/MM HH:mm', { locale: ptBR })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-500 truncate pr-4">
                    {chat.lastMessage || 'Nenhuma mensagem ainda'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
