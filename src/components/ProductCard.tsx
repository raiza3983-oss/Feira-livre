import React from 'react';
import { ShoppingCart, Plus, Minus, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, ProductUnit } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = React.useState(1);

  const unitLabels: Record<ProductUnit, string> = {
    kg: 'kg',
    g: 'g',
    unidade: 'un',
    saco: 'saco',
    prato: 'prato'
  };

  const categoryIcons: Record<string, string> = {
    verduras: '🥬',
    legumes: '🥕',
    frutas: '🍎',
    carne_boi: '🥩',
    carne_galinha: '🍗',
    peixe: '🐟',
    refeicao: '🍱'
  };

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col bg-white rounded-3xl shadow-lg shadow-stone-200/40 border border-stone-100 overflow-hidden text-left transition-all hover:border-emerald-200"
    >
      <div className="aspect-square w-full bg-stone-50 relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-200 text-6xl">
            {categoryIcons[product.category] || '🍎'}
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-800 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {product.category.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-stone-500 text-xs line-clamp-1 mb-4">
          {product.description}
        </p>
        
        <div className="flex items-end justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Preço por {unitLabels[product.unit]}</span>
            <span className="text-2xl font-bold text-stone-900">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <div className="flex items-center bg-stone-100 rounded-full p-1 border border-stone-200">
            <button 
              onClick={handleDecrement}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-stone-600"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-stone-800 text-sm">{quantity}</span>
            <button 
              onClick={handleIncrement}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-stone-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => onAddToCart?.(product, quantity)}
          className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <ShoppingCart className="w-4 h-4" />
          Adicionar ao Carrinho
        </button>
      </div>
    </motion.div>
  );
};
