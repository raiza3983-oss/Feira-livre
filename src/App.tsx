import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, where, orderBy, addDoc } from 'firebase/firestore';
import { RoleSelector } from './components/RoleSelector';
import { Chat } from './components/Chat';
import { ChatList } from './components/ChatList';
import { StoreCard } from './components/StoreCard';
import { ProductCard } from './components/ProductCard';
import { ReviewForm } from './components/ReviewForm';
import { LogoSmall } from './components/Logo';
import { UserAuth } from './components/UserAuth';
import { StoreManagement } from './components/StoreManagement';
import { SystemManagement } from './components/SystemManagement';
import { ContactForm } from './components/ContactForm';
import { UserRole, Store, Product, ProductCategory, ChatMessage, UserProfile, WeeklySchedule, DaySchedule, Chat as ChatType, Review } from './types';
import { ShoppingBasket, Store as StoreIcon, MessageSquare, Plus, LogOut, Search, User as UserIcon, Settings, MapPin, Heart, Clock, LayoutGrid, ShieldCheck, Mail, Globe, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from './utils/firestoreErrorHandler';
import { BRAZIL_STATES } from './constants/brazilData';

// Mock Data for initial preview
const MOCK_STORES: Store[] = [
  {
    id: '1',
    ownerId: 'f1',
    name: 'Horta do Zé',
    description: 'Verduras fresquinhas colhidas no dia. Qualidade e preço justo.',
    category: 'barraca',
    address: 'Rua das Flores, 123 - Setor Verde',
    state: 'SP',
    attendants: [
      { id: 'a1', name: 'José', photoURL: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' },
      { id: 'a2', name: 'Maria', photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1488459711615-de64ef5996f6?auto=format&fit=crop&q=80&w=1000',
    openingHours: {
      'segunda': { open: '07:00', close: '13:00', isOpen: true },
      'terca': { open: '07:00', close: '13:00', isOpen: true },
      'quarta': { open: '07:00', close: '13:00', isOpen: true },
      'quinta': { open: '07:00', close: '13:00', isOpen: true },
      'sexta': { open: '07:00', close: '13:00', isOpen: true },
      'sabado': { open: '07:00', close: '13:00', isOpen: true },
      'domingo': { open: '07:00', close: '13:00', isOpen: true },
    },
    createdAt: Date.now()
  },
  {
    id: '2',
    ownerId: 'f2',
    name: 'Peixaria Central',
    description: 'Os melhores peixes e frutos do mar da região.',
    category: 'mercado_livre',
    address: 'Av. Central, 456 - Setor Azul',
    state: 'RJ',
    attendants: [
      { id: 'a3', name: 'Pedro', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
      { id: 'a4', name: 'Ana', photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c41ab4c5e636?auto=format&fit=crop&q=80&w=1000',
    openingHours: {
      'segunda': { open: '08:00', close: '18:00', isOpen: true },
      'terca': { open: '08:00', close: '18:00', isOpen: true },
      'quarta': { open: '08:00', close: '18:00', isOpen: true },
      'quinta': { open: '08:00', close: '18:00', isOpen: true },
      'sexta': { open: '08:00', close: '18:00', isOpen: true },
      'sabado': { open: '08:00', close: '18:00', isOpen: true },
      'domingo': { open: '08:00', close: '18:00', isOpen: true },
    },
    createdAt: Date.now()
  },
  {
    id: '3',
    ownerId: 'f3',
    name: 'Feira do Produtor',
    description: 'Feira semanal com produtores locais. Frutas, legumes e artesanato.',
    category: 'feira_livre',
    address: 'Praça da Matriz, S/N - Centro',
    state: 'MG',
    attendants: [
      { id: 'a5', name: 'João', photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=1000',
    openingHours: {
      'segunda': { open: '06:00', close: '12:00', isOpen: true },
      'terca': { open: '06:00', close: '12:00', isOpen: false },
      'quarta': { open: '06:00', close: '12:00', isOpen: false },
      'quinta': { open: '06:00', close: '12:00', isOpen: false },
      'sexta': { open: '06:00', close: '12:00', isOpen: false },
      'sabado': { open: '06:00', close: '12:00', isOpen: true },
      'domingo': { open: '06:00', close: '12:00', isOpen: true },
    },
    createdAt: Date.now()
  },
  {
    id: '4',
    ownerId: 'f4',
    name: 'Restaurante da Feira',
    description: 'Pratos feitos, marmitas e refeições completas com tempero caseiro.',
    category: 'restaurante',
    address: 'Praça da Matriz, 10 - Centro',
    state: 'MG',
    attendants: [
      { id: 'a6', name: 'Maria', photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000',
    openingHours: {
      'segunda': { open: '11:00', close: '15:00', isOpen: true },
      'terca': { open: '11:00', close: '15:00', isOpen: true },
      'quarta': { open: '11:00', close: '15:00', isOpen: true },
      'quinta': { open: '11:00', close: '15:00', isOpen: true },
      'sexta': { open: '11:00', close: '15:00', isOpen: true },
      'sabado': { open: '11:00', close: '15:00', isOpen: true },
      'domingo': { open: '11:00', close: '15:00', isOpen: true },
    },
    createdAt: Date.now()
  }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    storeId: '1',
    name: 'Alface Crespa',
    description: 'Maço de alface crespa orgânica.',
    price: 3.50,
    unit: 'unidade',
    category: 'verduras',
    imageUrl: 'https://images.unsplash.com/photo-1622206141580-579f30d716af?auto=format&fit=crop&q=80&w=1000',
    createdAt: Date.now()
  },
  {
    id: 'p2',
    storeId: '1',
    name: 'Tomate Italiano',
    description: 'Tomates maduros selecionados.',
    price: 8.90,
    unit: 'kg',
    category: 'legumes',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1000',
    createdAt: Date.now()
  },
  {
    id: 'p3',
    storeId: '4',
    name: 'Prato Feito - Frango Grelhado',
    description: 'Arroz, feijão, frango grelhado, salada e fritas.',
    price: 25.00,
    unit: 'prato',
    category: 'refeicao',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000',
    createdAt: Date.now()
  },
  {
    id: 'p4',
    storeId: '4',
    name: 'Marmitex Executiva',
    description: 'Nossa famosa marmitex com carne de panela.',
    price: 22.00,
    unit: 'unidade',
    category: 'refeicao',
    imageUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&q=80&w=1000',
    createdAt: Date.now()
  }
];

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  type View = 'stores' | 'products' | 'chat' | 'chats_list' | 'management' | 'search' | 'saved' | 'system_management' | 'contact';
  const [view, setViewOriginal] = useState<View>('stores');
  const setView = (v: View) => {
    console.log('View changing to:', v);
    setViewOriginal(v);
  };
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState<'all' | 'barraca' | 'feira_livre' | 'mercado_livre' | 'restaurante'>('all');
  const [productFilter, setProductFilter] = useState<ProductCategory | 'all'>('all');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [savedStoreIds, setSavedStoreIds] = useState<string[]>([]);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);

  const deg2rad = (deg: number) => deg * (Math.PI/180);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
        toast.success('Localização obtida! Agora você pode ver as bancas mais próximas.');
      },
      (error) => {
        console.error('Erro:', error);
        toast.error('Erro ao obter localização.');
        setIsLocating(false);
      }
    );
  };

  // Firebase Auth Listener
  React.useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const path = `users/${firebaseUser.uid}`;
        
        // Use onSnapshot for real-time profile updates
        unsubscribeUser = onSnapshot(doc(db, 'users', firebaseUser.uid), async (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setUser(userData);
            setRole(userData.role);
            if (userData.savedStoreIds) setSavedStoreIds(userData.savedStoreIds);
            if (userData.role === 'admin') setIsSystemAdmin(true);
          } else {
            // New user or incomplete profile - only create if not already exists (safety)
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              role: 'cliente', // Default role
              createdAt: Date.now()
            };
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              // The snapshot listener will pick this up
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, path);
            }
          }
          setIsAuthReady(true);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          setIsAuthReady(true);
        });
      } else {
        if (unsubscribeUser) unsubscribeUser();
        setUser(null);
        setRole(null);
        setIsSystemAdmin(false);
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  // Real-time Stores Listener
  React.useEffect(() => {
    if (!isAuthReady) return;
    const path = 'stores';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const storesData = snapshot.docs.map(doc => doc.data() as Store);
      if (storesData.length > 0) setStores(storesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [isAuthReady]);

  // Real-time Products Listener
  React.useEffect(() => {
    if (!isAuthReady) return;
    const path = 'products';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const productsData = snapshot.docs.map(doc => doc.data() as Product);
      if (productsData.length > 0) setProducts(productsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [isAuthReady]);

  // Real-time Reviews Listener
  React.useEffect(() => {
    if (!isAuthReady || !selectedStore) {
      setReviews([]);
      return;
    }
    const path = 'reviews';
    const q = query(collection(db, path), where('storeId', '==', selectedStore.id), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(reviewsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [isAuthReady, selectedStore]);

  // Real-time Messages Listener
  React.useEffect(() => {
    if (!isAuthReady || !activeChatId) return;
    const path = `chats/${activeChatId}/messages`;
    const q = query(collection(db, path), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [isAuthReady, activeChatId]);

  // Real-time Chats Listener
  React.useEffect(() => {
    if (!isAuthReady || !user) return;
    const path = 'chats';
    const q = query(
      collection(db, path),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatType));
      setChats(chatsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setRole(null);
      setUser(null);
      setView('stores');
      setShowAuth(false);
      toast.success('Sessão encerrada');
    } catch (error) {
      toast.error('Erro ao sair');
    }
  };

  const handleRoleSelect = async (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (user) {
      const updatedUser = { ...user, role: selectedRole };
      const path = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), updatedUser);
        setUser(updatedUser);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }

    if (selectedRole === 'feirante' && !user) {
      setShowAuth(true);
    } else if (selectedRole === 'feirante') {
      setView('management');
    } else {
      setView('stores');
    }
  };

  const handleToggleSaveStore = (e: React.MouseEvent, storeId: string) => {
    e.stopPropagation();
    if (!user) {
      setShowAuth(true);
      toast.error('Entre para salvar suas lojas favoritas');
      return;
    }
    const newSavedIds = savedStoreIds.includes(storeId)
      ? savedStoreIds.filter(id => id !== storeId)
      : [...savedStoreIds, storeId];
    
    setSavedStoreIds(newSavedIds);
    
    const path = `users/${user.uid}`;
    setDoc(doc(db, 'users', user.uid), {
      savedStoreIds: newSavedIds
    }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, path));

    if (savedStoreIds.includes(storeId)) {
      toast.success('Loja removida dos salvos');
    } else {
      toast.success('Loja salva com sucesso!');
    }
  };

  const handleUpdateStore = (updatedStore: Store) => {
    const existingStore = stores.find(s => s.id === updatedStore.id);
    if (existingStore) {
      setStores(stores.map(s => s.id === updatedStore.id ? updatedStore : s));
    } else {
      setStores([...stores, updatedStore]);
    }
    setSelectedStore(updatedStore);
    setView('stores');
    toast.success('Informações da barraca atualizadas!');
  };

  const handleUpdateProducts = (storeId: string, updatedStoreProducts: Product[]) => {
    setProducts(prev => {
      const otherProducts = prev.filter(p => p.storeId !== storeId);
      return [...otherProducts, ...updatedStoreProducts];
    });
    toast.success('Produtos atualizados com sucesso!');
  };

  const handleSendMessage = async (text: string, isAuto = false, type: 'text' | 'audio' | 'video' = 'text', mediaUrl?: string) => {
    if (!user || !activeChatId) return;
    const path = `chats/${activeChatId}/messages`;
    try {
      await addDoc(collection(db, path), {
        chatId: activeChatId,
        senderId: user.uid,
        text,
        type,
        mediaUrl: mediaUrl || null,
        isAutoMessage: isAuto,
        createdAt: Date.now()
      });
      
      // Update chat last message
      await setDoc(doc(db, 'chats', activeChatId), {
        lastMessage: type === 'text' ? text : `[${type === 'audio' ? 'Áudio' : 'Vídeo'}]`,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!activeChatId) return;
    const path = `chats/${activeChatId}/messages/${messageId}`;
    try {
      await setDoc(doc(db, 'chats', activeChatId, 'messages', messageId), {
        text: newText,
        isEdited: true,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleOpenSupportChat = () => {
    if (!user) {
      setShowAuth(true);
      toast.error('Entre para falar com o suporte');
      return;
    }
    const chatId = `${user.uid}_support`;
    setActiveChatId(chatId);
    
    // Ensure chat document exists
    const path = `chats/${chatId}`;
    setDoc(doc(db, 'chats', chatId), {
      id: chatId,
      participants: [user.uid, 'admin'],
      userName: user.displayName,
      userEmail: user.email,
      type: 'support',
      updatedAt: Date.now()
    }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, path));
    
    setView('chat');
  };

  const handleOpenStoreChat = (store: Store) => {
    if (!user) {
      setShowAuth(true);
      toast.error('Entre para falar com a loja');
      return;
    }
    const chatId = `${user.uid}_${store.ownerId}`;
    setActiveChatId(chatId);
    
    // Ensure chat document exists
    const path = `chats/${chatId}`;
    setDoc(doc(db, 'chats', chatId), {
      id: chatId,
      participants: [user.uid, store.ownerId],
      userName: user.displayName,
      userEmail: user.email,
      storeName: store.name,
      storeId: store.id,
      type: 'direct',
      updatedAt: Date.now()
    }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, path));
    
    setView('chat');
  };

  const handleCreateStore = () => {
    if (!user) return;
    const newStore: Store = {
      id: Date.now().toString(),
      ownerId: user.uid,
      name: '',
      description: '',
      category: 'barraca',
      address: '',
      state: '',
      attendants: [],
      createdAt: Date.now()
    };
    setSelectedStore(newStore);
    setView('management');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Toaster position="top-right" />
      
      {/* Top Utility Bar */}
      <div className="bg-stone-900 text-white py-2 px-4 text-[10px] sm:text-xs font-medium tracking-wide uppercase">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-stone-400">Bem-vindo à Feira Livre Digital</span>
            <span className="sm:hidden text-stone-400">Feira Livre Digital</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              {!role ? (
                <>
                  <button 
                    onClick={() => handleRoleSelect('cliente')} 
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <UserIcon className="w-3 h-3" />
                    Entrar Cliente
                  </button>
                  <div className="w-px h-3 bg-stone-700" />
                  <button 
                    onClick={() => handleRoleSelect('feirante')} 
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <StoreIcon className="w-3 h-3" />
                    Entrar Feirante
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setRole(null)} 
                  className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors group"
                  title="Trocar Perfil"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${role === 'feirante' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="text-stone-300">
                    Acesso: <span className="text-white group-hover:text-emerald-400 transition-colors">{role === 'feirante' ? 'Feirante' : 'Cliente'}</span>
                  </span>
                  <Settings className="w-3 h-3 text-stone-500 group-hover:text-white transition-colors" />
                </button>
              )}
              
              <div className="w-px h-3 bg-stone-700" />
              <button 
                onClick={() => { 
                  console.log('Opening system management...');
                  setView('system_management'); 
                  setSelectedStore(null); 
                  setActiveChatId(null); 
                }} 
                className="bg-stone-800 hover:bg-stone-700 text-emerald-400 px-2 py-1 rounded-md transition-all flex items-center gap-1.5 border border-stone-700"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-bold">Gestão do Sistema</span>
              </button>

              {role && (
                <>
                  <div className="w-px h-3 bg-stone-700" />
                  <button 
                    onClick={handleLogout} 
                    className="hover:text-red-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <LogOut className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    Sair
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => { setView('stores'); setStoreFilter('all'); setSelectedStore(null); }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <LogoSmall />
            </button>

            {role && (
              <nav className="hidden lg:flex items-center gap-8">
                <button 
                  onClick={() => { setView('stores'); setStoreFilter('all'); setSelectedStore(null); }}
                  className={`text-sm font-bold tracking-tight transition-all relative py-2 ${view === 'stores' && storeFilter === 'all' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-900'}`}
                >
                  Lojas
                  {view === 'stores' && storeFilter === 'all' && <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => { setView('stores'); setStoreFilter('feira_livre'); setSelectedStore(null); }}
                  className={`text-sm font-bold tracking-tight transition-all relative py-2 ${view === 'stores' && storeFilter === 'feira_livre' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-900'}`}
                >
                  Feiras Livres
                  {view === 'stores' && storeFilter === 'feira_livre' && <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => { setView('search'); setSelectedStore(null); }}
                  className={`text-sm font-bold tracking-tight transition-all relative py-2 ${view === 'search' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-900'}`}
                >
                  Pesquisar
                  {view === 'search' && <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => { setView('saved'); setSelectedStore(null); }}
                  className={`text-sm font-bold tracking-tight transition-all relative py-2 ${view === 'saved' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-900'}`}
                >
                  Salvas
                  {view === 'saved' && <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setView('chat')}
                  className={`text-sm font-bold tracking-tight transition-all relative py-2 ${view === 'chat' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-900'}`}
                >
                  Conversas
                  {view === 'chat' && <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setView('contact')}
                  className={`text-sm font-bold tracking-tight transition-all relative py-2 ${view === 'contact' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-900'}`}
                >
                  Fale Conosco
                  {view === 'contact' && <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setView('system_management')}
                  className={`text-sm font-bold tracking-tight transition-all relative py-2 ${view === 'system_management' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-900'}`}
                >
                  Gestão do Sistema
                  {view === 'system_management' && <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                {role === 'feirante' && (
                  <button 
                    onClick={() => {
                      const myStore = stores.find(s => s.ownerId === user?.uid);
                      if (myStore) {
                        setSelectedStore(myStore);
                        setView('management');
                      } else {
                        toast.error('Você ainda não tem uma loja criada.');
                      }
                    }}
                    className={`text-sm font-bold tracking-tight transition-all relative py-2 ${view === 'management' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-900'}`}
                  >
                    Gestão
                    {view === 'management' && <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                  </button>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {role && (
              <div className="hidden sm:flex items-center bg-stone-50 rounded-2xl px-4 py-2 border border-stone-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all">
                <Search className="w-5 h-5 text-stone-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Buscar lojas ou produtos..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (view !== 'search' && e.target.value.length > 0) {
                      setView('search');
                    }
                  }}
                  className="bg-transparent border-none text-sm focus:ring-0 outline-none w-48 xl:w-64 font-medium text-stone-900 placeholder:text-stone-400"
                />
              </div>
            )}
            
            {/* Mobile Menu Button (Placeholder for now) */}
            <button className="lg:hidden p-2 text-stone-500 hover:bg-stone-100 rounded-xl transition-colors">
              <LayoutGrid className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 ${role ? 'pb-24 lg:pb-6' : ''}`}>
        <AnimatePresence mode="wait">
          {!role ? (
            <motion.div
              key="role-selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RoleSelector onSelect={handleRoleSelect} />
            </motion.div>
          ) : showAuth && !user ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12"
            >
              <UserAuth 
                onSuccess={() => {
                  setShowAuth(false);
                  if (role === 'feirante') setView('management');
                }} 
                initialRole={role}
              />
              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    setRole(null);
                    setShowAuth(false);
                  }}
                  className="text-stone-400 hover:text-stone-600 text-sm font-medium transition-colors"
                >
                  ← Voltar para seleção de perfil
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {view === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-stone-900 mb-2">Pesquisar Lojas</h1>
                  <p className="text-stone-500">Encontre as melhores barracas e feiras da região.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400" />
                  <input 
                    type="text"
                    placeholder="Digite o nome da loja ou produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border border-stone-200 rounded-3xl shadow-xl shadow-stone-200/50 focus:ring-2 focus:ring-emerald-500/20 outline-none text-lg transition-all"
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400" />
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border border-stone-200 rounded-3xl shadow-xl shadow-stone-200/50 focus:ring-2 focus:ring-emerald-500/20 outline-none text-lg transition-all appearance-none"
                  >
                    <option value="">Todos os Estados</option>
                    {BRAZIL_STATES.map((s) => (
                      <option key={s.uf} value={s.uf}>
                        {s.name} ({s.uf})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 pb-2 mb-8">
                <button 
                  onClick={() => setStoreFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${storeFilter === 'all' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Todas
                  {storeFilter === 'all' && <motion.div layoutId="search-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setStoreFilter('barraca')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${storeFilter === 'barraca' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Barracas Livres
                  {storeFilter === 'barraca' && <motion.div layoutId="search-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setStoreFilter('mercado_livre')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${storeFilter === 'mercado_livre' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Mercados Livres
                  {storeFilter === 'mercado_livre' && <motion.div layoutId="search-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setStoreFilter('feira_livre')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${storeFilter === 'feira_livre' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Feiras Livres
                  {storeFilter === 'feira_livre' && <motion.div layoutId="search-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setStoreFilter('restaurante')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${storeFilter === 'restaurante' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Restaurantes / Refeições
                  {storeFilter === 'restaurante' && <motion.div layoutId="search-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores
                  .filter(s => {
                    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        s.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesState = stateFilter === '' || s.state === stateFilter;
                    const matchesCategory = storeFilter === 'all' || s.category === storeFilter;
                    return matchesSearch && matchesState && matchesCategory;
                  })
                  .map(store => (
                    <StoreCard 
                      key={store.id} 
                      store={store} 
                      isSaved={savedStoreIds.includes(store.id)}
                      onToggleSave={handleToggleSaveStore}
                      onClick={() => { setSelectedStore(store); setView('products'); }} 
                    />
                  ))}
                {stores.filter(s => {
                    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        s.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesState = stateFilter === '' || s.state === stateFilter;
                    const matchesCategory = storeFilter === 'all' || s.category === storeFilter;
                    return matchesSearch && matchesState && matchesCategory;
                  }).length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-20 h-20 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Nenhuma loja encontrada</h3>
                    <p className="text-stone-500">Tente buscar por outros termos ou estados.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'stores' && !selectedStore && (
            <motion.div
              key="stores"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-stone-900">
                    {storeFilter === 'all' ? 'Explore as Feiras' : 
                     storeFilter === 'barraca' ? 'Barracas Livres' :
                     storeFilter === 'mercado_livre' ? 'Mercados Livres' : 'Feiras Livres'}
                  </h2>
                  <p className="text-stone-500">
                    {storeFilter === 'all' 
                      ? 'Encontre os melhores produtos frescos perto de você.' 
                      : `Confira as ${storeFilter.replace('_', ' ')} acontecendo agora.`}
                  </p>
                </div>
                {role === 'feirante' && (
                  <button 
                    onClick={handleCreateStore}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors shadow-xl shadow-stone-900/10"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Minha Loja
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 pb-2">
                <button 
                  onClick={() => setStoreFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${storeFilter === 'all' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Todas
                  {storeFilter === 'all' && <motion.div layoutId="store-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setStoreFilter('barraca')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${storeFilter === 'barraca' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Barracas Livres
                  {storeFilter === 'barraca' && <motion.div layoutId="store-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setStoreFilter('mercado_livre')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${storeFilter === 'mercado_livre' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Mercados Livres
                  {storeFilter === 'mercado_livre' && <motion.div layoutId="store-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setStoreFilter('feira_livre')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${storeFilter === 'feira_livre' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Feiras Livres
                  {storeFilter === 'feira_livre' && <motion.div layoutId="store-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {stores
                    .filter(s => storeFilter === 'all' || s.category === storeFilter)
                    .map(store => (
                      <StoreCard 
                        key={store.id} 
                        store={store} 
                        isSaved={savedStoreIds.includes(store.id)}
                        onToggleSave={handleToggleSaveStore}
                        onClick={(s) => { setSelectedStore(s); setView('products'); }} 
                      />
                    ))}
                </div>
            </motion.div>
          )}

          {view === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-stone-900 mb-2">Lojas Salvas</h1>
                <p className="text-stone-500">Suas barracas e feiras favoritas em um só lugar.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores
                  .filter(s => savedStoreIds.includes(s.id))
                  .map(store => (
                    <StoreCard 
                      key={store.id} 
                      store={store} 
                      isSaved={true}
                      onToggleSave={handleToggleSaveStore}
                      onClick={() => { setSelectedStore(store); setView('products'); }} 
                    />
                  ))}
                {savedStoreIds.length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-20 h-20 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Nenhuma loja salva</h3>
                    <p className="text-stone-500">Explore as feiras e salve suas lojas favoritas!</p>
                    <button 
                      onClick={() => setView('stores')}
                      className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Explorar Feiras
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'products' && selectedStore && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setSelectedStore(null); setView('stores'); }}
                    className="p-2 hover:bg-stone-200 rounded-full transition-colors"
                  >
                    <LogOut className="w-5 h-5 rotate-180" />
                  </button>
                  <div>
                    <h2 className="text-3xl font-bold text-stone-900">{selectedStore.name}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      {reviews.length > 0 && (
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-700">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                          </span>
                          <span className="text-[10px] text-amber-600/60">({reviews.length})</span>
                        </div>
                      )}
                      <p className="text-stone-500 flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        {selectedStore.address}
                      </p>
                      <p className="text-stone-500 flex items-center gap-1 text-sm">
                        <UserIcon className="w-4 h-4 text-emerald-600" />
                        Atendentes: {selectedStore.attendants.map(a => a.name).join(', ')}
                      </p>
                      {selectedStore.openingHours && (
                        <div className="group relative">
                          <div className="flex items-center gap-1 text-sm text-stone-500 cursor-help hover:text-stone-900 transition-colors">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <span>
                              {(() => {
                                const daysMap: { [key: number]: string } = {
                                  0: 'domingo', 1: 'segunda', 2: 'terca', 3: 'quarta', 4: 'quinta', 5: 'sexta', 6: 'sabado'
                                };
                                const today = daysMap[new Date().getDay()];
                                const schedule = selectedStore.openingHours[today];
                                return schedule?.isOpen ? `Hoje: ${schedule.open} - ${schedule.close}` : 'Fechado hoje';
                              })()}
                            </span>
                          </div>
                          
                          {/* Full Weekly Schedule Tooltip */}
                          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <h4 className="font-bold text-stone-900 mb-3 text-xs uppercase tracking-wider">Horários da Semana</h4>
                            <div className="space-y-2">
                              {(Object.entries(selectedStore.openingHours) as [string, DaySchedule][]).map(([day, data]) => (
                                <div key={day} className="flex justify-between items-center text-xs">
                                  <span className="capitalize text-stone-500">{day}</span>
                                  <span className={`font-medium ${data.isOpen ? 'text-stone-900' : 'text-red-400'}`}>
                                    {data.isOpen ? `${data.open} - ${data.close}` : 'Fechado'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleOpenStoreChat(selectedStore)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 text-stone-900 rounded-2xl font-bold hover:bg-stone-50 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Conversar
                  </button>
                  {role === 'feirante' && (
                    <button 
                      onClick={() => setView('management')}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-xl shadow-emerald-600/20"
                    >
                      <Plus className="w-5 h-5" />
                      Novo Produto
                    </button>
                  )}
                </div>
              </div>

              {/* Product Category Filters */}
              <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-stone-100 pb-2">
                <button 
                  onClick={() => setProductFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${productFilter === 'all' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Todos
                  {productFilter === 'all' && <motion.div layoutId="product-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setProductFilter('refeicao')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${productFilter === 'refeicao' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Refeições
                  {productFilter === 'refeicao' && <motion.div layoutId="product-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setProductFilter('verduras')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${productFilter === 'verduras' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Verduras
                  {productFilter === 'verduras' && <motion.div layoutId="product-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setProductFilter('frutas')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${productFilter === 'frutas' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Frutas
                  {productFilter === 'frutas' && <motion.div layoutId="product-filter-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products
                  .filter(p => p.storeId === selectedStore.id && (productFilter === 'all' || p.category === productFilter))
                  .map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>

              {/* Reviews Section */}
              <div className="mt-16 pt-16 border-t border-stone-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-900 mb-2">Avaliações dos Clientes</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-5 h-5 ${star <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? 'fill-current' : 'text-stone-200'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-lg font-bold text-stone-900">
                        {reviews.length > 0 
                          ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                          : '0.0'}
                      </span>
                      <span className="text-stone-400 text-sm">({reviews.length} avaliações)</span>
                    </div>
                  </div>
                  
                  {user && role === 'cliente' && (
                    <div className="w-full md:w-96">
                      <ReviewForm storeId={selectedStore.id} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-stone-50 rounded-3xl border border-stone-100">
                      <Star className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-500">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="p-6 bg-white rounded-3xl border border-stone-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {review.userPhotoURL ? (
                              <img src={review.userPhotoURL} alt={review.userName} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 font-bold">
                                {review.userName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-stone-900">{review.userName}</p>
                              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-3 h-3 ${star <= review.rating ? 'fill-current' : 'text-stone-100'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-stone-600 leading-relaxed italic">
                            "{review.comment}"
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-800">
                  {activeChatId?.endsWith('_support') ? 'Suporte Feira Livre' : 'Chat com a Loja'}
                </h2>
                <button 
                  onClick={() => { setView('chats_list'); setActiveChatId(null); }}
                  className="text-sm text-stone-500 hover:text-stone-800"
                >
                  Voltar para Conversas
                </button>
              </div>
              <Chat 
                messages={messages}
                currentUserId={user?.uid || 'guest'}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                attendants={activeChatId?.endsWith('_support') ? [{ id: 'admin', name: 'Equipe de Suporte', photoURL: 'https://picsum.photos/seed/support/100/100' }] : selectedStore?.attendants}
              />
            </motion.div>
          )}

          {view === 'chats_list' && (
            <motion.div
              key="chats_list"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <ChatList 
                chats={chats}
                onSelectChat={(chatId) => {
                  setActiveChatId(chatId);
                  setView('chat');
                }}
                onOpenSupport={handleOpenSupportChat}
                currentUserId={user?.uid || 'guest'}
              />
            </motion.div>
          )}

          {view === 'management' && selectedStore && (
            <motion.div
              key="management"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <StoreManagement 
                store={selectedStore}
                products={products.filter(p => p.storeId === selectedStore.id)}
                onSave={handleUpdateStore}
                onUpdateProducts={(updatedStoreProducts) => handleUpdateProducts(selectedStore.id, updatedStoreProducts)}
              />
            </motion.div>
          )}

          {view === 'system_management' && (
            <motion.div
              key="system_management"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <SystemManagement 
                isLoggedIn={isSystemAdmin}
                onLogin={(isLoggedIn) => {
                  setIsSystemAdmin(isLoggedIn);
                  if (!isLoggedIn) setView('stores');
                }}
              />
            </motion.div>
          )}

          {view === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <ContactForm />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={`bg-white border-t border-stone-200 py-8 mt-12 ${role ? 'mb-20 lg:mb-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LogoSmall />
          </div>
          <p className="text-stone-400 text-sm mb-4">© 2026 Feira Livre. Conectando produtores e consumidores.</p>
          <button 
            onClick={() => { setView('system_management'); setSelectedStore(null); setActiveChatId(null); }}
            className="text-xs font-bold text-stone-300 hover:text-emerald-500 transition-colors flex items-center gap-1 mx-auto uppercase tracking-widest"
          >
            <ShieldCheck className="w-3 h-3" />
            Acesso Gestão do Sistema
          </button>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      {role && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-2 flex items-center justify-between z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => { setView('stores'); setStoreFilter('all'); setSelectedStore(null); setActiveChatId(null); }}
            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${view === 'stores' ? 'text-emerald-600' : 'text-stone-400'}`}
          >
            <StoreIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Lojas</span>
          </button>
          <button 
            onClick={() => { setView('search'); setSelectedStore(null); setActiveChatId(null); }}
            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${view === 'search' ? 'text-emerald-600' : 'text-stone-400'}`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Busca</span>
          </button>
          <button 
            onClick={() => { setView('saved'); setSelectedStore(null); setActiveChatId(null); }}
            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${view === 'saved' ? 'text-emerald-600' : 'text-stone-400'}`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Salvas</span>
          </button>
          <button 
            onClick={() => { setView('chats_list'); setSelectedStore(null); setActiveChatId(null); }}
            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${view === 'chats_list' || view === 'chat' ? 'text-emerald-600' : 'text-stone-400'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Conversas</span>
          </button>
          <button 
            onClick={() => { setView('contact'); setActiveChatId(null); }}
            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${view === 'contact' ? 'text-emerald-600' : 'text-stone-400'}`}
          >
            <Mail className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Contato</span>
          </button>
          <button 
            onClick={() => { setView('system_management'); setSelectedStore(null); setActiveChatId(null); }}
            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${view === 'system_management' ? 'text-emerald-600' : 'text-stone-400'}`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Gestão</span>
          </button>
        </nav>
      )}
    </div>
  );
}
