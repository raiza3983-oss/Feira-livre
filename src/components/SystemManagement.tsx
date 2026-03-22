import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, LayoutGrid, Users, Store, TrendingUp, LogOut, MessageSquare, Key, AlertCircle, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { BRAZIL_STATES } from '../constants/brazilData';

interface SystemManagementProps {
  isLoggedIn: boolean;
  onLogin: (isLoggedIn: boolean) => void;
}

import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export const SystemManagement: React.FC<SystemManagementProps> = ({ isLoggedIn, onLogin }) => {
  console.log('SystemManagement mounted, isLoggedIn:', isLoggedIn);
  const [email, setEmail] = useState('Raizapaula@outlook.com.br');
  const [password, setPassword] = useState('551526rz');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'messages' | 'users' | 'brazil' | 'marketing'>('stats');
  const [isSendingRandom, setIsSendingRandom] = useState(false);

  const handleSendRandomMessage = async (targetEmail: string) => {
    setIsSendingRandom(true);
    const { getRandomMessage } = await import('../utils/randomMessages');
    const randomMsg = getRandomMessage();

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: "Dica do Dia - Feira Livre Digital 🍎",
          type: 'MENSAGEM_ALEATORIA',
          body: `Olá!\n\n${randomMsg}\n\nEsperamos que seu dia seja produtivo e cheio de saúde!\n\nAtenciosamente,\nEquipe Feira Livre Digital`
        })
      });

      if (response.ok) {
        toast.success(`Mensagem aleatória enviada para ${targetEmail}!`);
      } else {
        throw new Error('Falha ao enviar e-mail');
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem aleatória.');
    } finally {
      setIsSendingRandom(false);
    }
  };

  React.useEffect(() => {
    if (isLoggedIn) {
      // Messages Listener
      const messagesPath = 'contact_messages';
      const messagesQ = query(collection(db, messagesPath), orderBy('createdAt', 'desc'));
      const unsubscribeMessages = onSnapshot(messagesQ, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, messagesPath);
      });

      // Users Listener
      const usersPath = 'users';
      const usersQ = query(collection(db, usersPath), orderBy('createdAt', 'desc'));
      const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, usersPath);
      });

      return () => {
        unsubscribeMessages();
        unsubscribeUsers();
      };
    }
  }, [isLoggedIn]);

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Por favor, insira seu e-mail para redefinir a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('E-mail de redefinição de senha enviado!');
    } catch (error: any) {
      toast.error('Erro ao enviar e-mail de redefinição: ' + error.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check role in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      const isAdminEmail = user.email?.toLowerCase() === 'raiza3983@gmail.com' || user.email?.toLowerCase() === 'raizapaula@outlook.com.br';
      if (isAdminEmail || userData?.role === 'admin') {
        if (isAdminEmail && userData?.role !== 'admin') {
          // Auto-fix role for primary admins
          const path = `users/${user.uid}`;
          try {
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email,
              role: 'admin',
              createdAt: Date.now()
            }, { merge: true });
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
          }
        }
        
        onLogin(true);
        toast.success('Acesso administrativo concedido!');
      } else {
        toast.error('Este usuário não possui permissões administrativas.');
        await auth.signOut();
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        toast.error('Conta não encontrada. Por favor, use a aba "Criar cadastro" abaixo para criar seu acesso administrativo.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Senha incorreta para este e-mail administrativo.');
      } else {
        toast.error('Erro ao acessar o sistema: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const path = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'admin', // Registered via System Management = Admin
          createdAt: Date.now()
        });

        // Send confirmation email
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Bem-vindo ao Painel Administrativo - Feira Livre',
            text: `Olá! Sua conta administrativa no Feira Livre foi criada com sucesso. Você agora tem acesso ao painel de gestão.`
          })
        }).catch(err => console.error('Erro ao enviar e-mail de confirmação:', err));
        
        onLogin(true);
        toast.success('Conta administrativa criada com sucesso!');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já está em uso.');
      } else {
        toast.error('Erro ao criar conta: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl border border-stone-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-stone-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg transform -rotate-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900">
            {isRegistering ? 'Criar Conta Gestor' : 'Acesso Restrito'}
          </h2>
          <p className="text-stone-500 mt-2">
            {isRegistering 
              ? 'Cadastre-se para gerenciar o sistema.' 
              : 'Área exclusiva para gestão do sistema.'}
          </p>
        </div>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 ml-1">E-mail Administrativo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all outline-none"
                placeholder="admin@feiralivre.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 ml-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {!isRegistering && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1"
              >
                <Key className="w-4 h-4" />
                Esqueci minha senha
              </button>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg hover:shadow-stone-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                {isRegistering ? 'Criar Cadastro' : 'Entrar no Sistema'}
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {isRegistering ? 'Já tenho uma conta? Entrar' : 'Não tem conta? Criar cadastro'}
          </button>
        </div>

        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Atenção:</strong> Tentativas de acesso não autorizado são monitoradas e registradas. 
            Apenas pessoal autorizado pela <strong>Feira Livre</strong> possui credenciais válidas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Painel de Gestão</h1>
          <p className="text-stone-500">Visão geral do sistema e controle administrativo.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'stats' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Estatísticas
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'messages' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Mensagens
            </button>
            <button
              onClick={() => setActiveTab('brazil')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'brazil' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Estados
            </button>
            <button
              onClick={() => setActiveTab('marketing')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'marketing' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Marketing
            </button>
          </div>
          <button
            onClick={() => onLogin(false)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-stone-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-1">Total Clientes</h3>
            <p className="text-3xl font-bold text-stone-900">{users.filter(u => u.role === 'cliente').length}</p>
            <div className="mt-2 flex items-center text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3 h-3 mr-1" />
              Ativos no sistema
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-stone-100">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-1">Total Feirantes</h3>
            <p className="text-3xl font-bold text-stone-900">{users.filter(u => u.role === 'feirante').length}</p>
            <div className="mt-2 flex items-center text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3 h-3 mr-1" />
              Bancas cadastradas
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-stone-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h3 className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-1">Total Admins</h3>
            <p className="text-3xl font-bold text-stone-900">{users.filter(u => u.role === 'admin').length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-stone-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-1">Mensagens</h3>
            <p className="text-3xl font-bold text-stone-900">{messages.length}</p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-stone-50">
            <h3 className="text-xl font-bold text-stone-900">Gerenciar Usuários</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-100">
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">E-mail</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Perfil</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Data Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 font-bold text-xs">
                          {u.displayName?.charAt(0) || u.email?.charAt(0)}
                        </div>
                        <span className="font-medium text-stone-900">{u.displayName || 'Usuário'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'feirante' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-stone-900">Mensagens do Fale Conosco</h3>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
              {messages.length} Mensagens
            </span>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma mensagem recebida ainda.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-stone-200">
                          <Mail className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-stone-900">{msg.name} <span className="text-xs font-normal text-stone-400">({msg.state})</span></p>
                          <p className="text-xs text-stone-500">{msg.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {new Date(msg.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Assunto: {msg.subject}</p>
                      <p className="text-sm text-stone-600 bg-white p-3 rounded-xl border border-stone-100">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'brazil' && (
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-stone-900">Estados e Capitais do Brasil</h3>
            <span className="px-3 py-1 bg-stone-900 text-white text-xs font-bold rounded-full">
              {BRAZIL_STATES.length} Unidades Federativas
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-100">
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">UF</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Capital</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Região</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {BRAZIL_STATES.map((state) => (
                  <tr key={state.uf} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-stone-900">{state.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold rounded-md">
                        {state.uf}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-stone-700">{state.capital}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        state.region === 'Norte' ? 'bg-emerald-100 text-emerald-700' :
                        state.region === 'Nordeste' ? 'bg-amber-100 text-amber-700' :
                        state.region === 'Sudeste' ? 'bg-blue-100 text-blue-700' :
                        state.region === 'Sul' ? 'bg-purple-100 text-purple-700' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {state.region}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'marketing' && (
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-stone-50">
            <h3 className="text-xl font-bold text-stone-900">Marketing e Mensagens Aleatórias</h3>
            <p className="text-sm text-stone-500 mt-1">Envie dicas e notificações para os usuários do sistema.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-emerald-900">Enviar Dica do Dia</h4>
                  </div>
                  <p className="text-sm text-emerald-700 mb-6">
                    Selecione um usuário abaixo para enviar uma mensagem aleatória com dicas de mercado, receitas ou ofertas.
                  </p>
                  <div className="space-y-3">
                    {users.slice(0, 5).map(u => (
                      <div key={u.uid} className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-stone-900">{u.displayName || 'Usuário'}</span>
                          <span className="text-[10px] text-stone-500">{u.email}</span>
                        </div>
                        <button
                          onClick={() => handleSendRandomMessage(u.email)}
                          disabled={isSendingRandom}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                          Enviar Dica
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                  <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-stone-400" />
                    Exemplos de Mensagens
                  </h4>
                  <div className="space-y-3">
                    {[
                      "Aproveite as frutas da estação! Esta semana, o morango e a uva estão com preços incríveis.",
                      "Dica do dia: Para manter suas verduras frescas por mais tempo, lave-as e guarde em potes herméticos com papel toalha.",
                      "Você sabia? Comprar de produtores locais ajuda a fortalecer a economia da nossa região."
                    ].map((msg, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-stone-100 text-xs text-stone-600 italic">
                        "{msg}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
