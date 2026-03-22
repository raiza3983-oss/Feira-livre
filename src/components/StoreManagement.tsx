import React, { useState } from 'react';
import { MapPin, Store as StoreIcon, Users, Save, Plus, X, Image as ImageIcon, ShoppingBasket, Trash2, Settings, Clock, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Store, Attendant, Product, ProductCategory, ProductUnit, WeeklySchedule, DaySchedule } from '../types';
import { BRAZIL_STATES } from '../constants/brazilData';

interface StoreManagementProps {
  store: Store;
  products: Product[];
  onSave: (updatedStore: Store) => void;
  onUpdateProducts: (updatedProducts: Product[]) => void;
}

export const StoreManagement: React.FC<StoreManagementProps> = ({ store, products, onSave, onUpdateProducts }) => {
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description);
  const [address, setAddress] = useState(store.address);
  const [state, setState] = useState(store.state || '');
  const [latitude, setLatitude] = useState(store.latitude);
  const [longitude, setLongitude] = useState(store.longitude);
  const [isLocating, setIsLocating] = useState(false);
  const [category, setCategory] = useState(store.category);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLocating(false);
        toast.success('Localização obtida com sucesso!');
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        toast.error('Não foi possível obter sua localização. Verifique as permissões.');
        setIsLocating(false);
      }
    );
  };
  
  const defaultSchedule: WeeklySchedule = {
    'segunda': { open: '08:00', close: '18:00', isOpen: true },
    'terca': { open: '08:00', close: '18:00', isOpen: true },
    'quarta': { open: '08:00', close: '18:00', isOpen: true },
    'quinta': { open: '08:00', close: '18:00', isOpen: true },
    'sexta': { open: '08:00', close: '18:00', isOpen: true },
    'sabado': { open: '07:00', close: '13:00', isOpen: true },
    'domingo': { open: '07:00', close: '13:00', isOpen: true },
  };

  const [schedule, setSchedule] = useState<WeeklySchedule>(
    (store.openingHours && typeof store.openingHours === 'object' && !('open' in store.openingHours)) 
      ? store.openingHours as WeeklySchedule 
      : defaultSchedule
  );
  
  const [attendants, setAttendants] = useState<Attendant[]>(store.attendants);
  const [newAttendantName, setNewAttendantName] = useState('');
  const [newAttendantPhoto, setNewAttendantPhoto] = useState('');

  // Product form state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductUnit, setNewProductUnit] = useState<ProductUnit>('kg');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('verduras');
  const [newProductImage, setNewProductImage] = useState('');

  // Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcTotal, setCalcTotal] = useState('');
  const [calcQuantity, setCalcQuantity] = useState('');

  const handleAddAttendant = () => {
    if (newAttendantName.trim()) {
      const newAttendant: Attendant = {
        id: Date.now().toString(),
        name: newAttendantName.trim(),
        photoURL: newAttendantPhoto.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(newAttendantName)}&background=random`
      };
      setAttendants([...attendants, newAttendant]);
      setNewAttendantName('');
      setNewAttendantPhoto('');
    }
  };

  const handleRemoveAttendant = (id: string) => {
    setAttendants(attendants.filter(a => a.id !== id));
  };

  const handleApplyCalculation = () => {
    const total = parseFloat(calcTotal);
    const qty = parseFloat(calcQuantity);
    if (total && qty) {
      setNewProductPrice((total / qty).toFixed(2));
      setShowCalculator(false);
      setCalcTotal('');
      setCalcQuantity('');
    }
  };

  const handleAddProduct = () => {
    if (newProductName.trim() && newProductPrice) {
      if (editingProductId) {
        const updatedProducts = products.map(p => 
          p.id === editingProductId 
            ? {
                ...p,
                name: newProductName.trim(),
                description: newProductDesc.trim(),
                price: parseFloat(newProductPrice),
                unit: newProductUnit,
                category: newProductCategory,
                imageUrl: newProductImage.trim() || p.imageUrl
              }
            : p
        );
        onUpdateProducts(updatedProducts);
        setEditingProductId(null);
      } else {
        const newProduct: Product = {
          id: Date.now().toString(),
          storeId: store.id,
          name: newProductName.trim(),
          description: newProductDesc.trim(),
          price: parseFloat(newProductPrice),
          unit: newProductUnit,
          category: newProductCategory,
          imageUrl: newProductImage.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000',
          createdAt: Date.now()
        };
        onUpdateProducts([...products, newProduct]);
      }
      // Clear form
      setNewProductName('');
      setNewProductDesc('');
      setNewProductPrice('');
      setNewProductImage('');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setNewProductName(product.name);
    setNewProductDesc(product.description);
    setNewProductPrice(product.price.toString());
    setNewProductUnit(product.unit);
    setNewProductCategory(product.category);
    setNewProductImage(product.imageUrl || '');
    // Scroll to form
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setNewProductName('');
    setNewProductDesc('');
    setNewProductPrice('');
    setNewProductImage('');
  };

  const handleRemoveProduct = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateDay = (day: string, updates: Partial<DaySchedule>) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], ...updates }
    }));
  };

  const handleSave = () => {
    onSave({
      ...store,
      name,
      description,
      address,
      state,
      latitude,
      longitude,
      category,
      attendants,
      openingHours: schedule
    });
  };

  return (
    <div className="space-y-8">
      {/* Store Settings */}
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50">
          <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-emerald-600" />
            Configurações da Barraca
          </h3>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                placeholder="Ex: Horta do Zé"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Tipo</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
              >
                <option value="barraca">Barraca</option>
                <option value="feira_livre">Feira Livre</option>
                <option value="mercado_livre">Mercado Livre</option>
                <option value="restaurante">Restaurante / Refeições</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Estado
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
              >
                <option value="">Selecione o estado</option>
                {BRAZIL_STATES.map((s) => (
                  <option key={s.uf} value={s.uf}>
                    {s.name} ({s.uf})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Endereço / Localização
                </div>
                <button
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1"
                >
                  {isLocating ? (
                    <div className="w-2 h-2 border border-emerald-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MapPin className="w-2.5 h-2.5" />
                  )}
                  {latitude ? 'Atualizar GPS' : 'Obter GPS Atual'}
                </button>
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                  placeholder="Ex: Rua das Flores, 123 ou Setor Verde"
                />
                {latitude && longitude && (
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <MapPin className="w-3 h-3" />
                    Coordenadas Salvas: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium min-h-[80px]"
            />
          </div>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Calendário de Funcionamento
              </h4>
            </div>
            
            <div className="space-y-4">
              {(Object.entries(schedule) as [string, DaySchedule][]).map(([day, data]) => (
                <div key={day} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center p-4 bg-white rounded-2xl border border-stone-100">
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <span className="font-bold text-stone-700 capitalize w-20">{day}</span>
                    <button
                      onClick={() => handleUpdateDay(day, { isOpen: !data.isOpen })}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        data.isOpen 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {data.isOpen ? 'ABERTO' : 'FECHADO'}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:col-span-3">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase">Abre às</label>
                      <input
                        type="time"
                        disabled={!data.isOpen}
                        value={data.open}
                        onChange={(e) => handleUpdateDay(day, { open: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-100 rounded-xl outline-none text-sm font-medium disabled:opacity-50"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase">Fecha às</label>
                      <input
                        type="time"
                        disabled={!data.isOpen}
                        value={data.close}
                        onChange={(e) => handleUpdateDay(day, { close: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-100 rounded-xl outline-none text-sm font-medium disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Salvar Dados da Loja
          </button>
        </div>
      </div>

      {/* Product Management */}
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-emerald-50">
          <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <ShoppingBasket className="w-6 h-6 text-emerald-600" />
            Meus Produtos
          </h3>
          <p className="text-stone-500 text-sm">Adicione e gerencie os itens que você vende.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Add Product Form */}
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                {editingProductId ? <Save className="w-5 h-5 text-emerald-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                {editingProductId ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h4>
              <button 
                onClick={() => setShowCalculator(!showCalculator)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                {showCalculator ? 'Fechar Calculadora' : 'Calculadora de Preço'}
              </button>
            </div>

            {showCalculator && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-emerald-100/50 p-4 rounded-2xl border border-emerald-200 space-y-4"
              >
                <p className="text-xs font-medium text-emerald-800">Calcule o preço unitário (ex: preço do saco ÷ peso do saco)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-700 uppercase">Preço Total (R$)</label>
                    <input
                      type="number"
                      value={calcTotal}
                      onChange={(e) => setCalcTotal(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg outline-none text-sm"
                      placeholder="Ex: 100.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-700 uppercase">Quantidade/Peso</label>
                    <input
                      type="number"
                      value={calcQuantity}
                      onChange={(e) => setCalcQuantity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg outline-none text-sm"
                      placeholder="Ex: 20"
                    />
                  </div>
                </div>
                <button
                  onClick={handleApplyCalculation}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                >
                  Aplicar Preço Calculado
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">Nome do Produto</label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Ex: Tomate Cereja"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">Preço (R$)</label>
                <input
                  type="number"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">Unidade</label>
                <select
                  value={newProductUnit}
                  onChange={(e) => setNewProductUnit(e.target.value as any)}
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="kg">Quilo (kg)</option>
                  <option value="unidade">Unidade</option>
                  <option value="saco">Saco</option>
                  <option value="g">Grama (g)</option>
                  <option value="prato">Prato</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">Categoria</label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value as any)}
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="verduras">Verduras</option>
                  <option value="legumes">Legumes</option>
                  <option value="frutas">Frutas</option>
                  <option value="peixe">Peixes</option>
                  <option value="carne_boi">Carne de Boi</option>
                  <option value="carne_galinha">Carne de Galinha</option>
                  <option value="refeicao">Refeições</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">Imagem (URL)</label>
                <input
                  type="text"
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase">Descrição Curta</label>
              <input
                type="text"
                value={newProductDesc}
                onChange={(e) => setNewProductDesc(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Ex: Orgânico e fresquinho"
              />
            </div>

            <div className="flex gap-3">
              {editingProductId && (
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 bg-stone-200 text-stone-700 rounded-xl font-bold hover:bg-stone-300 transition-all"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleAddProduct}
                className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                {editingProductId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingProductId ? 'Salvar Alterações' : 'Adicionar Produto'}
              </button>
            </div>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            <h4 className="font-bold text-stone-900">Produtos Cadastrados ({products.length})</h4>
            <div className="grid grid-cols-1 gap-3">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-bold text-stone-900">{product.name}</h5>
                      <p className="text-xs text-stone-500">
                        R$ {product.price.toFixed(2)} / {product.unit} • <span className="capitalize">{product.category.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Editar"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-3xl">
                  <ShoppingBasket className="w-12 h-12 text-stone-200 mx-auto mb-2" />
                  <p className="text-stone-400">Nenhum produto cadastrado ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Management */}
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50">
          <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Equipe de Atendimento
          </h3>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={newAttendantName}
              onChange={(e) => setNewAttendantName(e.target.value)}
              className="w-full px-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
              placeholder="Nome do atendente"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newAttendantPhoto}
                onChange={(e) => setNewAttendantPhoto(e.target.value)}
                className="w-full px-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium flex-1"
                placeholder="URL da foto"
              />
              <button
                onClick={handleAddAttendant}
                className="p-3 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attendants.map((attendant) => (
              <div key={attendant.id} className="flex items-center justify-between p-3 bg-stone-50 border border-stone-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <img src={attendant.photoURL} alt={attendant.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <span className="font-bold text-stone-700">{attendant.name}</span>
                </div>
                <button onClick={() => handleRemoveAttendant(attendant.id)} className="p-1.5 text-stone-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
