import React, { useState } from 'react';
import { Mail, Send, User, MessageSquare, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { BRAZIL_STATES } from '../constants/brazilData';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [subject, setSubject] = useState('Dúvida');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const path = 'contact_messages';
    try {
      // 1. Save to Firestore
      await addDoc(collection(db, path), {
        name,
        email,
        state,
        subject,
        message,
        createdAt: Date.now()
      });
      
      // 2. Call backend to "send" confirmation email
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: `Confirmação de Contato - Feira Livre Digital: ${subject}`,
            type: 'CONFIRMACAO_CLIENTE',
            body: `Olá ${name},\n\nRecebemos sua mensagem sobre "${subject}".\n\nSua mensagem: "${message}"\n\nNossa equipe entrará em contato em breve.\n\nAtenciosamente,\nEquipe Feira Livre Digital`
          })
        });
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de confirmação:', emailError);
      }

      toast.success('Mensagem enviada com sucesso! Verifique seu e-mail.');
      setIsSuccess(true);
      setIsSending(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      setIsSending(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-12 bg-white rounded-3xl shadow-xl border border-stone-100 text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-stone-900 mb-4">Mensagem Enviada!</h2>
        <p className="text-stone-600 mb-8 leading-relaxed">
          Obrigado pelo seu contato, <span className="font-bold text-emerald-600">{name}</span>. 
          Enviamos uma confirmação para <span className="font-bold text-stone-800">{email}</span>. 
          Fique atento à sua caixa de entrada!
        </p>
        <button
          onClick={() => {
            setIsSuccess(false);
            setName('');
            setEmail('');
            setMessage('');
          }}
          className="px-8 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg"
        >
          Enviar Nova Mensagem
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-stone-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-stone-900">Fale Conosco</h2>
        <p className="text-stone-500 mt-2">
          Tem alguma dúvida, sugestão ou reclamação? Envie uma mensagem para nossa equipe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
              placeholder="Seu nome"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              E-mail para Contato
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Estado
            </label>
            <select
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
            >
              <option value="">Selecione seu estado</option>
              {BRAZIL_STATES.map((s) => (
                <option key={s.uf} value={s.uf}>
                  {s.name} ({s.uf})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Assunto</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
            >
              <option value="Dúvida">Dúvida</option>
              <option value="Sugestão">Sugestão</option>
              <option value="Reclamação">Reclamação</option>
              <option value="Parceria">Parceria</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Sua Mensagem
          </label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium min-h-[150px] transition-all"
            placeholder="Como podemos ajudar?"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSending}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar Mensagem
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-12 pt-8 border-t border-stone-100 text-center">
        <p className="text-stone-400 text-sm">
          Você também pode nos contatar diretamente pelo e-mail:<br />
          <span className="text-emerald-600 font-bold">suporte@feiralivre.com</span>
        </p>
      </div>
    </div>
  );
};
