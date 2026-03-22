import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, Chrome as Google, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface UserAuthProps {
  onSuccess: () => void;
  initialRole?: 'cliente' | 'feirante';
}

export const UserAuth: React.FC<UserAuthProps> = ({ onSuccess, initialRole }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('Raizapaula@outlook.com.br');
  const [password, setPassword] = useState('551526rz');
  const [name, setName] = useState('Raiza Paula');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const isNewUser = !userDoc.exists();
      
      if (isNewUser) {
        const path = `users/${user.uid}`;
        try {
          const userEmail = user.email?.toLowerCase();
          const role = (userEmail === 'raizapaula@outlook.com.br' || userEmail === 'raiza3983@gmail.com') ? 'admin' : (initialRole || 'cliente');
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: role,
            createdAt: Date.now()
          });

          // Send welcome email for new Google users
          if (user.email) {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: user.email,
                subject: 'Bem-vindo ao Feira Livre!',
                text: `Olá ${user.displayName || 'usuário'}! Sua conta foi criada com sucesso via Google. Aproveite o melhor das feiras livres!`
              })
            }).catch(err => console.error('Erro ao enviar e-mail de boas-vindas:', err));
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
      }
      toast.success('Login realizado com sucesso!');
      onSuccess();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Erro ao entrar com Google: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        const path = `users/${user.uid}`;
        try {
          const role = (email.toLowerCase() === 'raizapaula@outlook.com.br' || email.toLowerCase() === 'raiza3983@gmail.com') ? 'admin' : (initialRole || 'cliente');
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: name,
            role: role,
            createdAt: Date.now()
          });

          // Send confirmation email
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              subject: 'Confirmação de Cadastro - Feira Livre',
              text: `Olá ${name}! Sua conta no Feira Livre foi criada com sucesso. Bem-vindo à nossa comunidade!`
            })
          }).catch(err => console.error('Erro ao enviar e-mail de confirmação:', err));
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
        toast.success('Conta criada com sucesso!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Bem-vindo de volta!');
      }
      onSuccess();
    } catch (error: any) {
      let message = 'Erro na autenticação.';
      if (error.code === 'auth/user-not-found') {
        message = 'Conta não encontrada. Por favor, use a aba "Crie seu cadastro" abaixo para criar seu acesso.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Senha incorreta para este e-mail.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está cadastrado.';
      } else if (error.code === 'auth/weak-password') {
        message = 'A senha deve ter pelo menos 6 caracteres.';
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-stone-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {isRegistering ? <UserPlus className="w-8 h-8" /> : <LogIn className="w-8 h-8" />}
        </div>
        <h2 className="text-2xl font-bold text-stone-900">
          {isRegistering ? 'Criar sua conta' : 'Entrar no Feira Livre'}
        </h2>
        <p className="text-stone-500 mt-2">
          {isRegistering 
            ? 'Junte-se a nós e comece a aproveitar o melhor das feiras.' 
            : 'Acesse sua conta para continuar sua experiência.'}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-white border border-stone-200 rounded-2xl font-bold text-stone-700 hover:bg-stone-50 transition-all flex items-center justify-center gap-3 shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continuar com Google
        </button>
        
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-stone-100"></div>
          <span className="flex-shrink mx-4 text-stone-400 text-xs font-bold uppercase tracking-widest">ou e-mail</span>
          <div className="flex-grow border-t border-stone-100"></div>
        </div>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {isRegistering && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-500 ml-1 uppercase tracking-wider">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="Seu nome"
                required={isRegistering}
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-500 ml-1 uppercase tracking-wider">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-500 ml-1 uppercase tracking-wider">Senha</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {isRegistering ? 'Criar Cadastro' : 'Entrar'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center space-y-4">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Crie seu cadastro'}
        </button>
        
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-stone-500 leading-relaxed">
            Seus dados estão protegidos. Ao continuar, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
};
