import React, { useState, useEffect, useRef } from 'react';
import { Send, Edit2, Check, X, Zap, Users, Mic, Video, Square, Play, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Attendant } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  type?: 'text' | 'audio' | 'video';
  mediaUrl?: string;
  createdAt: number;
  isAutoMessage?: boolean;
  isEdited?: boolean;
}

interface ChatProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (text: string, isAuto?: boolean, type?: 'text' | 'audio' | 'video', mediaUrl?: string) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  autoMessages?: string[];
  attendants?: Attendant[];
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  onEditMessage,
  autoMessages = [
    "Olá! Como posso ajudar?",
    "Qual o valor do quilo hoje?",
    "Está fresquinho?",
    "Pode separar para mim?",
    "Obrigado!"
  ],
  attendants = []
}) => {
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showAutoMessages, setShowAutoMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Recording states
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isRecordingAudio || isRecordingVideo) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecordingAudio, isRecordingVideo]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onSendMessage('Mensagem de áudio', false, 'audio', base64data);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      toast.error('Não foi possível acessar o microfone.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(videoBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onSendMessage('Mensagem de vídeo', false, 'video', base64data);
        };
        stream.getTracks().forEach(track => track.stop());
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
      };

      mediaRecorder.start();
      setIsRecordingVideo(true);
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      toast.error('Não foi possível acessar a câmera.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
    }
  };

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleStartEdit = (message: Message) => {
    setEditingId(message.id);
    setEditText(message.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      onEditMessage(editingId, editText);
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleAutoMessage = (text: string) => {
    onSendMessage(text, true);
    setShowAutoMessages(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden relative">
      {/* Video Preview Overlay */}
      <AnimatePresence>
        {isRecordingVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4"
          >
            <div className="relative w-full max-w-sm aspect-video bg-stone-900 rounded-2xl overflow-hidden shadow-2xl">
              <video 
                ref={videoPreviewRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
                GRAVANDO {formatTime(recordingTime)}
              </div>
            </div>
            <button 
              onClick={stopVideoRecording}
              className="mt-8 flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all shadow-xl"
            >
              <Square className="w-6 h-6 fill-current" />
              Parar e Enviar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {attendants.slice(0, 3).map((attendant) => (
              <img
                key={attendant.id}
                src={attendant.photoURL}
                alt={attendant.name}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                referrerPolicy="no-referrer"
              />
            ))}
            {attendants.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-600">
                +{attendants.length - 3}
              </div>
            )}
            {attendants.length === 0 && (
              <div className="w-8 h-8 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-stone-400">
                <Users className="w-4 h-4" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-stone-800 leading-none">Conversa</h3>
            {attendants.length > 0 && (
              <p className="text-[10px] text-stone-500 mt-1">
                Com: {attendants.map(a => a.name).join(', ')}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAutoMessages(!showAutoMessages)}
          className={cn(
            "p-2 rounded-full transition-colors",
            showAutoMessages ? "bg-emerald-100 text-emerald-600" : "text-stone-400 hover:bg-stone-100"
          )}
          title="Mensagens Automáticas"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Auto Messages Panel */}
      {showAutoMessages && (
        <div className="p-3 bg-emerald-50 border-b border-emerald-100 flex flex-wrap gap-2 animate-in slide-in-from-top duration-200">
          {autoMessages.map((msg, idx) => (
            <button
              key={idx}
              onClick={() => handleAutoMessage(msg)}
              className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 text-sm rounded-full hover:bg-emerald-100 transition-colors"
            >
              {msg}
            </button>
          ))}
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const isEditing = editingId === msg.id;

          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[80%]",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div
                className={cn(
                  "relative group px-4 py-2 rounded-2xl text-sm shadow-sm",
                  isMe
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-white text-stone-800 border border-stone-200 rounded-tl-none"
                )}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-white/10 text-white border border-white/20 rounded p-2 focus:outline-none focus:ring-1 focus:ring-white/50"
                      rows={2}
                    />
                    <div className="flex justify-end gap-1">
                      <button onClick={handleCancelEdit} className="p-1 hover:bg-white/10 rounded">
                        <X className="w-4 h-4" />
                      </button>
                      <button onClick={handleSaveEdit} className="p-1 hover:bg-white/10 rounded">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {msg.type === 'audio' ? (
                      <div className="flex items-center gap-3 min-w-[180px] py-1">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <Mic className="w-4 h-4" />
                        </div>
                        <audio src={msg.mediaUrl} controls className="h-8 max-w-[150px] brightness-100 invert" />
                      </div>
                    ) : msg.type === 'video' ? (
                      <div className="max-w-[240px] rounded-xl overflow-hidden bg-black/10">
                        <video src={msg.mediaUrl} controls className="w-full aspect-video object-cover" />
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                    
                    {isMe && msg.type === 'text' && (
                      <button
                        onClick={() => handleStartEdit(msg)}
                        className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-emerald-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-[10px] text-stone-400">
                  {format(msg.createdAt, 'HH:mm', { locale: ptBR })}
                </span>
                {msg.isAutoMessage && (
                  <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">
                    Automática
                  </span>
                )}
                {msg.isEdited && (
                  <span className="text-[10px] text-stone-400 italic">
                    (editada)
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-100">
        <div className="flex items-center gap-2">
          {isRecordingAudio ? (
            <div className="flex-1 flex items-center justify-between bg-red-50 text-red-600 rounded-full px-4 py-2 text-sm font-bold animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full" />
                Gravando Áudio... {formatTime(recordingTime)}
              </div>
              <button 
                onClick={stopAudioRecording}
                className="p-1 hover:bg-red-100 rounded-full transition-colors"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <button
                  onClick={startAudioRecording}
                  className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                  title="Gravar Áudio"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={startVideoRecording}
                  className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                  title="Gravar Vídeo"
                >
                  <Video className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-stone-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
