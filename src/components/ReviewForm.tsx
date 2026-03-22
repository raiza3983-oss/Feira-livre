import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface ReviewFormProps {
  storeId: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ storeId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('Você precisa estar logado para avaliar.');
      return;
    }
    if (rating === 0) {
      toast.error('Por favor, selecione uma nota.');
      return;
    }

    setIsLoading(true);
    const reviewId = `${storeId}_${auth.currentUser.uid}`;
    const path = `reviews/${reviewId}`;

    try {
      await setDoc(doc(db, 'reviews', reviewId), {
        id: reviewId,
        storeId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Usuário',
        userPhotoURL: auth.currentUser.photoURL,
        rating,
        comment,
        createdAt: Date.now()
      });

      toast.success('Avaliação enviada com sucesso!');
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="bg-stone-50 p-6 rounded-3xl border border-stone-100 space-y-4">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-stone-700 uppercase tracking-wider">Sua Avaliação</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hover || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Comentário (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none h-24 text-sm"
          placeholder="Conte como foi sua experiência..."
          maxLength={1000}
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            Enviar Avaliação
          </>
        )}
      </motion.button>
    </form>
  );
};
