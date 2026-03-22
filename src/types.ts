export type UserRole = 'feirante' | 'cliente' | 'admin';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phoneNumber?: string;
  isVerified?: boolean;
  savedStoreIds?: string[];
  createdAt: number;
}

export interface Attendant {
  id: string;
  name: string;
  photoURL?: string;
}

export interface DaySchedule {
  open: string; // HH:mm
  close: string; // HH:mm
  isOpen: boolean;
}

export interface WeeklySchedule {
  [key: string]: DaySchedule; // 'monday', 'tuesday', etc.
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: 'barraca' | 'feira_livre' | 'mercado_livre' | 'restaurante';
  address: string;
  state?: string; // UF do estado
  latitude?: number;
  longitude?: number;
  attendants: Attendant[];
  imageUrl?: string;
  openingHours?: WeeklySchedule;
  createdAt: number;
}

export type ProductUnit = 'kg' | 'g' | 'unidade' | 'saco' | 'prato';
export type ProductCategory = 'verduras' | 'legumes' | 'frutas' | 'carne_boi' | 'carne_galinha' | 'peixe' | 'refeicao';

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  unit: ProductUnit;
  category: ProductCategory;
  imageUrl?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type?: 'text' | 'audio' | 'video';
  mediaUrl?: string;
  isAutoMessage?: boolean;
  isEdited?: boolean;
  createdAt: number;
}

export interface Chat {
  id: string;
  participants: string[]; // [feiranteId, clienteId]
  storeId?: string;
  storeName?: string;
  userName?: string;
  userEmail?: string;
  type: 'direct' | 'support';
  lastMessage?: string;
  updatedAt: number;
}

export interface Review {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: number;
}
