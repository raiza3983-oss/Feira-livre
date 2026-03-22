import React from 'react';
import { User, Store, ArrowRight, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types';
import { Logo } from './Logo';

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <Logo className="mb-8" />
        <p className="text-stone-500 max-w-md mx-auto">
          Escolha como deseja acessar a plataforma para começar sua jornada.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Cliente Card */}
        <motion.button
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('cliente')}
          className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 text-left overflow-hidden transition-all hover:border-emerald-200"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 relative z-10">
            <User className="w-8 h-8" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-stone-900 mb-2">Sou Cliente</h3>
            <p className="text-stone-500 mb-6">
              Quero encontrar as melhores barracas, produtos frescos e conversar com feirantes.
            </p>
            <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-2 transition-all">
              Entrar como cliente <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </motion.button>

        {/* Feirante Card */}
        <motion.button
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('feirante')}
          className="group relative flex flex-col items-center p-8 bg-stone-900 text-white rounded-3xl shadow-xl shadow-stone-900/20 border border-stone-800 text-left overflow-hidden transition-all hover:border-emerald-500/30"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 relative z-10">
            <Store className="w-8 h-8" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Sou Feirante</h3>
            <p className="text-stone-400 mb-6">
              Quero gerenciar minha barraca, cadastrar produtos e atender meus clientes.
            </p>
            <div className="flex items-center text-emerald-400 font-semibold group-hover:gap-2 transition-all">
              Entrar como feirante <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};
