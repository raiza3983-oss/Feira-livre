import React, { useEffect, useState } from 'react';
import { Store as StoreIcon, MapPin, ChevronRight, Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Store } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface StoreCardProps {
  store: Store;
  isSaved?: boolean;
  distance?: number;
  onToggleSave?: (e: React.MouseEvent, storeId: string) => void;
  onClick: (store: Store) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, isSaved, distance, onToggleSave, onClick }) => {
  const categoryLabels = {
    barraca: 'Barraca',
    feira_livre: 'Feira Livre',
    mercado_livre: 'Mercado Livre',
    restaurante: 'Restaurante'
  };

  const [ratingInfo, setRatingInfo] = useState<{ average: number; count: number }>({ average: 0, count: 0 });

  useEffect(() => {
    const q = query(collection(db, 'reviews'), where('storeId', '==', store.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => doc.data());
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        setRatingInfo({
          average: sum / reviews.length,
          count: reviews.length
        });
      } else {
        setRatingInfo({ average: 0, count: 0 });
      }
    });
    return () => unsubscribe();
  }, [store.id]);

  const isCurrentlyOpen = () => {
    if (!store.openingHours) return true;
    
    const daysMap: { [key: number]: string } = {
      0: 'domingo',
      1: 'segunda',
      2: 'terca',
      3: 'quarta',
      4: 'quinta',
      5: 'sexta',
      6: 'sabado'
    };
    
    const now = new Date();
    const dayName = daysMap[now.getDay()];
    const daySchedule = store.openingHours[dayName];
    
    if (!daySchedule || !daySchedule.isOpen) return false;
    
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
  };

  const openStatus = isCurrentlyOpen();

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(store)}
      className="group relative flex flex-col bg-white rounded-3xl shadow-lg shadow-stone-200/40 border border-stone-100 overflow-hidden text-left transition-all hover:border-emerald-200 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(store);
        }
      }}
    >
      <div className="aspect-video w-full bg-stone-100 relative overflow-hidden">
        {store.imageUrl ? (
          <img
            src={store.imageUrl}
            alt={store.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <StoreIcon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-800 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm w-fit">
            {categoryLabels[store.category]}
          </span>
          {ratingInfo.count > 0 && (
            <span className="px-3 py-1 bg-amber-400/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm w-fit flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {ratingInfo.average.toFixed(1)} ({ratingInfo.count})
            </span>
          )}
          <span className={`px-3 py-1 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm w-fit ${
            openStatus ? 'bg-emerald-500/90' : 'bg-red-500/90'
          }`}>
            {openStatus ? 'Aberto' : 'Fechado'}
          </span>
        </div>
        {onToggleSave && (
          <button
            onClick={(e) => onToggleSave(e, store.id)}
            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all shadow-sm z-10 ${
              isSaved ? 'bg-red-500 text-white' : 'bg-white/80 text-stone-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-emerald-600 transition-colors">
          {store.name}
        </h3>
        <p className="text-stone-500 text-sm line-clamp-2 mb-4">
          {store.description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-stone-50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center text-stone-400 text-[10px] uppercase font-bold tracking-wider">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate max-w-[150px]">{store.address}{store.state ? ` - ${store.state}` : ''}</span>
            </div>
            {distance !== undefined && (
              <span className="text-emerald-600 text-[10px] font-bold">
                A {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`} de você
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );
};
