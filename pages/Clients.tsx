
import React, { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Modal, Badge, Select } from '../components/UI';
import { 
  Plus, Search, Trash, Edit, Phone, Mail, MapPin, 
  CreditCard, Globe, Percent, UserPlus, Filter,
  MoreVertical, ExternalLink, ArrowLeft, X,
  Users, Briefcase
} from 'lucide-react';
import { Client } from '../types';

const Clients = () => {
  const { clients, addClient, deleteClient, currentUser, updateClient } = useStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClient, setNewClient] = useState<Partial<Client>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredClients = clients.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(term) || 
      (c.phone && c.phone.includes(term)) ||
      (c.idNumber && c.idNumber.toLowerCase().includes(term)) ||
      (c.nationality && c.nationality.toLowerCase().includes(term))
    );
  });

  const handleSave = () => {
    if (!newClient.fullName) return;

    if (editingId) {
        updateClient({
            ...newClient,
            id: editingId,
            createdAt: newClient.createdAt || new Date().toISOString()
        } as Client);
        setIsModalOpen(false);
    } else {
        const success = addClient({
            ...newClient,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            notes: newClient.notes || '',
        } as Client);
        
        if (success) {
            setIsModalOpen(false);
            setNewClient({});
        }
    }
  };

  const startEdit = (e: React.MouseEvent, client: Client) => {
      e.stopPropagation();
      setEditingId(client.id);
      setNewClient(client);
      setIsModalOpen(true);
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm('هل أنت متأكد من رغبتك في حذف هذا الموكل؟ سيؤدي ذلك لحذف كافة البيانات المرتبطة به.')) {
          deleteClient(id);
      }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">إدارة قاعدة الموكلين</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">تحكم في سجلات الموكلين والوكلاء والبيانات القانونية المرتبطة بهم.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:min-w-[320px] group">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-slate-900 transition-colors" />
                <input 
                    type="text" 
                    placeholder="بحث بالاسم، الهاتف أو الهوية..." 
                    className="pr-12 pl-10 py-3 border-2 border-slate-100 rounded-2xl w-full focus:ring-4 focus:ring-slate-100 focus:border-slate-800 text-right text-sm shadow-sm transition-all outline-none bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
            </div>
            {currentUser?.role !== 'ACCOUNTANT' && (
                <Button 
                  onClick={() => { setNewClient({ category: 'موكل' }); setEditingId(null); setIsModalOpen(true); }} 
                  icon={UserPlus}
                  className="rounded-2xl px-8 shadow-lg shadow-slate-200 py-3"
                >
                  إضافة موكل جديد
                </Button>
            )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            {/* Added missing Users icon fix */}
            <Users className="h-4 w-4" />
            إجمالي السجلات: <span className="text-slate-900">{clients.length}</span>
          </div>
          <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
          <div className="text-slate-900">
            نتائج البحث: {filteredClients.length}
          </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClients.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <Search className="h-12 w-12 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold text-lg">لم يتم العثور على نتائج تطابق بحثك</p>
              <Button variant="ghost" className="mt-2" onClick={() => setSearchTerm('')}>إلغاء الفلتر</Button>
          </div>
        ) : (
          filteredClients.map(client => (
            <div 
              key={client.id} 
              onClick={() => navigate(`/clients/${client.id}`)}
              className="group bg-white rounded-3xl border border-slate-100 p-6 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-slate-50 rounded-full -translate-x-16 -translate-y-16 group-hover:bg-slate-100 transition-colors duration-300"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform duration-300">
                        {client.fullName.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 group-hover:text-slate-800 transition-colors">{client.fullName}</h3>
                        <div className="flex items-center gap-2">
                          <Badge color={client.category === 'وكيل' ? 'indigo' : 'slate'} className="text-[10px] px-2 py-0.5">{client.category || 'موكل'}</Badge>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{client.nationality || 'غير محدد'}</span>
                        </div>
                    </div>
                  </div>

                  {/* Hover Quick Actions */}
                  {currentUser?.role === 'ADMIN' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                          <button 
                            onClick={(e) => startEdit(e, client)} 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="تعديل السجل"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, client.id)} 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="حذف الموكل"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                      </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-slate-50 pt-5">
                    {client.phone && (
                        <div className="flex items-center text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center ml-3">
                              <Phone className="h-4 w-4 text-slate-400" />
                            </div>
                            <span dir="ltr" className="font-bold">{client.phone}</span>
                        </div>
                    )}
                    {client.idNumber && (
                        <div className="flex items-center text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center ml-3">
                              <CreditCard className="h-4 w-4 text-slate-400" />
                            </div>
                            <span className="font-medium">{client.idType || 'هوية'}: <span className="font-black text-slate-900">{client.idNumber}</span></span>
                        </div>
                    )}
                    {client.address && (
                        <div className="flex items-center text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center ml-3">
                              <MapPin className="h-4 w-4 text-slate-400" />
                            </div>
                            <span className="line-clamp-1">{client.address}</span>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div className="flex -space-x-1 space-x-reverse">
                        {/* Placeholder for future features like related cases icons */}
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                          {/* Added missing Briefcase icon fix */}
                          <Briefcase className="h-3 w-3 text-slate-400" />
                        </div>
                    </div>
                    <div className="flex items-center text-[11px] font-black text-slate-400 group-hover:text-slate-900 transition-colors">
                        عرض التفاصيل
                        <ArrowLeft className="h-3 w-3 mr-1 transform group-hover:-translate-x-1 transition-transform" />
                    </div>
                </div>
              </div>

              {/* Commission Indicator (Internal Admin only) */}
              {currentUser?.role === 'ADMIN' && client.category === 'موكل' && client.commissionAmount && (
                   <div className="absolute bottom-0 right-0 left-0 h-1 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "تحديث بيانات السجل القانوني" : "فتح سجل موكل جديد"}>
        <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1 scrollbar-hide">
            <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">نوع السجل</p>
                <div className="flex gap-2">
                    <button 
                      onClick={() => setNewClient({...newClient, category: 'موكل'})}
                      className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all ${newClient.category === 'موكل' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}
                    >
                      موكل
                    </button>
                    <button 
                      onClick={() => setNewClient({...newClient, category: 'وكيل'})}
                      className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all ${newClient.category === 'وكيل' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}
                    >
                      وكيل
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <Input 
                      label="الاسم الكامل (كما في الوثائق الرسمية)" 
                      value={newClient.fullName || ''} 
                      onChange={e => setNewClient({...newClient, fullName: e.target.value})} 
                      placeholder="أدخل الاسم الثلاثي..."
                    />
                </div>
                <Input label="رقم الهاتف" value={newClient.phone || ''} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="05xxxxxxxx" />
                <Input label="البريد الإلكتروني" value={newClient.email || ''} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder="example@mail.com" />
                
                <Select label="نوع الوثيقة التعريفية" value={newClient.idType || ''} onChange={e => setNewClient({...newClient, idType: e.target.value})}>
                    <option value="">-- اختر النوع --</option>
                    <option value="هوية اماراتية">هوية اماراتية</option>
                    <option value="جواز سفر">جواز سفر</option>
                    <option value="رخصة قيادة">رخصة قيادة</option>
                </Select>
                <Input label="رقم الوثيقة" value={newClient.idNumber || ''} onChange={e => setNewClient({...newClient, idNumber: e.target.value})} placeholder="أدخل الرقم المسلسل..." />
                
                <Input label="الجنسية" value={newClient.nationality || ''} onChange={e => setNewClient({...newClient, nationality: e.target.value})} placeholder="مثلاً: إماراتي" />
                <div className="hidden"></div>

                {currentUser?.role === 'ADMIN' && (newClient.category === 'موكل') && (
                    <div className="sm:col-span-2 bg-amber-50 p-5 rounded-2xl border-2 border-amber-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Percent className="h-4 w-4 text-amber-600" />
                          <label className="text-sm font-black text-amber-900 uppercase">العمولة الداخلية المقررة</label>
                        </div>
                        <Input 
                            type="number" 
                            placeholder="مبلغ مقطوع (غير معلن)"
                            value={newClient.commissionAmount || ''} 
                            onChange={e => setNewClient({...newClient, commissionAmount: parseFloat(e.target.value)})} 
                            className="bg-white border-amber-200 focus:ring-amber-500 focus:border-amber-500"
                        />
                        <p className="text-[10px] text-amber-600 font-bold italic mt-1 leading-relaxed">تنبيه: هذا الحقل مخصص للمدير العام فقط لأغراض الموازنة الداخلية، ولن يظهر في أي فواتير رسمية تصدر للموكل.</p>
                    </div>
                )}
            </div>
            
            <Input label="العنوان الجغرافي" value={newClient.address || ''} onChange={e => setNewClient({...newClient, address: e.target.value})} placeholder="المدينة، الحي، المبنى..." />
            
            <div className="mb-4">
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-tighter">ملاحظات الملف والاتفاقيات الخاصة</label>
                <textarea 
                    className="shadow-sm focus:ring-4 focus:ring-slate-100 focus:border-slate-800 block w-full sm:text-sm border-slate-200 rounded-2xl p-4 border min-h-[120px] outline-none transition-all resize-none bg-white" 
                    placeholder="سجل هنا أي تفاصيل قانونية هامة تخص الموكل..."
                    value={newClient.notes || ''} 
                    onChange={e => setNewClient({...newClient, notes: e.target.value})} 
                />
            </div>
            <div className="flex justify-end pt-4 gap-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">إلغاء</Button>
                <Button onClick={handleSave} className="rounded-xl px-12 shadow-xl shadow-slate-200">
                  {editingId ? 'تحديث السجل' : 'إنشاء الموكل'}
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Clients;
