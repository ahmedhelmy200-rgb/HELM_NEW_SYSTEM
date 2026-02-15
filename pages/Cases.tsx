
import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input, Select, Badge, Modal } from '../components/UI';
import { Plus, Search, Gavel, Briefcase, User, Edit, Trash2, Wand2 } from 'lucide-react';
import { Case, CaseStatus } from '../types';

const Cases = () => {
  const { cases, clients, addCase, updateCase, deleteCase, currentUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCase, setNewCase] = useState<Partial<Case>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.caseNumber.includes(searchTerm)
  );

  const handleSave = () => {
      if (!newCase.title || !newCase.clientId) return;
      if (newCase.id) {
          updateCase(newCase as Case);
      } else {
          addCase({
              ...newCase,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              status: newCase.status || 'PREPARING',
          } as Case);
      }
      setIsModalOpen(false);
      setNewCase({});
  };

  return (
    <div className="space-y-8" dir="rtl">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">إدارة القضايا القانونية</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">عرض وتتبع كافة ملفات التقاضي والخصوم</p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:min-w-[320px]">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input 
                    type="text" 
                    placeholder="بحث برقم القضية أو العنوان..." 
                    className="pr-12 pl-4 py-4 border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white rounded-2xl w-full focus:ring-4 focus:ring-sky-500/20 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {currentUser?.role !== 'ACCOUNTANT' && (
                <Button onClick={() => { setNewCase({}); setIsModalOpen(true); }} icon={Plus} className="rounded-2xl px-8 shadow-xl">فتح ملف قضية</Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
          {filteredCases.map((c) => {
              const client = clients.find(cl => cl.id === c.clientId);
              return (
                  <Card key={c.id} className="hover:border-sky-500/50 transition-all dark:bg-slate-900/40">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                  <Badge color="slate">{c.caseNumber}</Badge>
                                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{c.title}</h3>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-slate-400 font-bold">
                                  <span className="flex items-center gap-2"><User className="h-4 w-4" /> {client?.fullName || 'غير مرتبط'}</span>
                                  <span className="flex items-center gap-2"><Gavel className="h-4 w-4" /> {c.court}</span>
                              </div>
                          </div>
                          <Badge color={c.status === 'WINNING' ? 'green' : 'yellow'}>{c.status}</Badge>
                      </div>
                  </Card>
              )
          })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل ملف قضائي جديد">
        <div className="space-y-6">
             <div className="bg-sky-500/5 p-6 rounded-[32px] border-2 border-sky-500/10 mb-4">
                <Select 
                    label="الموكل المرتبط (ضروري)" 
                    value={newCase.clientId || ''} 
                    onChange={e => setNewCase({...newCase, clientId: e.target.value})}
                >
                    <option value="">-- اختر الموكل من القائمة --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </Select>
                <p className="text-[10px] text-sky-600 font-bold mt-2 mr-2">* يجب إضافة الموكل أولاً في صفحة الموكلين ليظهر هنا.</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="رقم القضية" value={newCase.caseNumber || ''} onChange={e => setNewCase({...newCase, caseNumber: e.target.value})} placeholder="مثال: 2024/123/د" />
                <Select label="حالة القضية" value={newCase.status || 'PREPARING'} onChange={e => setNewCase({...newCase, status: e.target.value as CaseStatus})}>
                    <option value="PREPARING">قيد الإعداد</option>
                    <option value="ONGOING">جارية</option>
                    <option value="WINNING">رابحة</option>
                    <option value="LOST">خاسرة</option>
                </Select>
             </div>
             
             <Input label="عنوان الدعوى" value={newCase.title || ''} onChange={e => setNewCase({...newCase, title: e.target.value})} placeholder="مثال: دعوى مطالبة عمالية" />
             <Input label="المحكمة المختصة" value={newCase.court || ''} onChange={e => setNewCase({...newCase, court: e.target.value})} placeholder="مثال: محاكم دبي" />
             
             <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="px-12 rounded-2xl shadow-xl">تثبيت ملف القضية</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cases;
