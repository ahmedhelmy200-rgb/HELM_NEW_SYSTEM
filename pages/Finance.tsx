
import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input, Select, Badge, Modal, Switch } from '../components/UI';
import { Plus, Download, Filter, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Transaction, TransactionType, ExpenseCategory } from '../types';

const Finance = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, clients, cases, settings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({ type: 'INCOME', isPaid: true });
  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const handleSave = () => {
    if (!newTx.amount || !newTx.description) return;
    addTransaction({
        ...newTx,
        id: crypto.randomUUID(),
        date: newTx.date || new Date().toISOString(),
        category: newTx.category || (newTx.type === 'INCOME' ? 'INVOICE' : 'OFFICE'),
        isPaid: newTx.isPaid ?? true
    } as Transaction);
    setIsModalOpen(false);
    setNewTx({ type: 'INCOME', isPaid: true });
  };

  const togglePaidStatus = (t: Transaction) => {
    updateTransaction({ ...t, isPaid: !t.isPaid });
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      deleteTransaction(id);
    }
  };

  const filteredTx = transactions.filter(t => activeTab === 'ALL' || t.type === activeTab);
  const totalBalance = transactions.reduce((acc, t) => t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 0);

  // Filter cases based on selected client in modal
  const modalCases = newTx.clientId ? cases.filter(c => c.clientId === newTx.clientId) : cases;

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">المالية والمحاسبة</h1>
        <div className="flex gap-2">
             <Button variant="secondary" icon={Download}>تصدير تقرير</Button>
             <Button onClick={() => setIsModalOpen(true)} icon={Plus}>إضافة حركة</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="bg-slate-800 text-white">
               <p className="text-slate-400 text-sm">صافي الرصيد</p>
               <h3 className="text-2xl font-bold" dir="ltr">{totalBalance.toLocaleString()} {settings.finance.currency}</h3>
           </Card>
           <Card>
               <p className="text-gray-500 text-sm">إجمالي الدخل</p>
               <h3 className="text-2xl font-bold text-green-600" dir="ltr">
                   + {transactions.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0).toLocaleString()} {settings.finance.currency}
               </h3>
           </Card>
           <Card>
               <p className="text-gray-500 text-sm">إجمالي المصروفات</p>
               <h3 className="text-2xl font-bold text-red-600" dir="ltr">
                   - {transactions.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0).toLocaleString()} {settings.finance.currency}
               </h3>
           </Card>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex px-4 space-x-8" aria-label="Tabs">
              {['ALL', 'INCOME', 'EXPENSE'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`${activeTab === tab ? 'border-slate-500 text-slate-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab === 'ALL' ? 'دفتر الأستاذ العام' : tab === 'INCOME' ? 'الفواتير والإيرادات' : 'المصروفات'}
                </button>
              ))}
            </nav>
          </div>
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                     <tr>
                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموكل/القضية</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                         <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                     </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                     {filteredTx.map(t => {
                         const client = clients.find(c => c.id === t.clientId);
                         const kase = cases.find(c => c.id === t.caseId);
                         return (
                             <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                   <div>{new Date(t.date).toLocaleDateString('ar-SA')}</div>
                                   {t.dueDate && !t.isPaid && (
                                     <div className="text-[10px] text-red-500 font-bold mt-1">يستحق: {new Date(t.dueDate).toLocaleDateString('ar-SA')}</div>
                                   )}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                   <div className="text-sm font-medium text-gray-900">{t.description}</div>
                                   <div className="text-xs text-gray-400">{t.category}</div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                                   {t.isPaid ? (
                                     <Badge color="green">تم السداد</Badge>
                                   ) : (
                                     <Badge color="red">معلق</Badge>
                                   )}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     {client ? (
                                         <span className="flex flex-col text-right">
                                             <span>{client.fullName}</span>
                                             {kase && <span className="text-xs text-gray-400">{kase.caseNumber}</span>}
                                         </span>
                                     ) : '-'}
                                 </td>
                                 <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-left ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
                                     {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-center">
                                   <div className="flex justify-center gap-2">
                                     <button 
                                      onClick={() => togglePaidStatus(t)}
                                      className={`p-1.5 rounded-lg transition-colors ${t.isPaid ? 'text-gray-400 hover:text-amber-600 bg-gray-50' : 'text-green-600 hover:bg-green-50 bg-green-50/50'}`}
                                      title={t.isPaid ? "تغيير إلى معلق" : "تعليم كمؤدى"}
                                     >
                                       {t.isPaid ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                     </button>
                                     <button 
                                      onClick={() => handleDelete(t.id)}
                                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                      title="حذف"
                                     >
                                       <Trash2 className="h-4 w-4" />
                                     </button>
                                   </div>
                                 </td>
                             </tr>
                         )
                     })}
                 </tbody>
             </table>
          </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل حركة مالية">
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <Select label="النوع" value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value as TransactionType})}>
                      <option value="INCOME">دخل / فاتورة</option>
                      <option value="EXPENSE">مصروفات</option>
                  </Select>
                  <Select label="التصنيف" value={newTx.category || ''} onChange={e => setNewTx({...newTx, category: e.target.value as any})}>
                      {newTx.type === 'INCOME' ? (
                          <>
                            <option value="INVOICE">سداد فاتورة</option>
                            <option value="RECEIPT">سند قبض عام</option>
                            <option value="UNKNOWN">إيداع مجهول</option>
                          </>
                      ) : (
                          <>
                            <option value="OFFICE">مصاريف مكتبية</option>
                            <option value="PERSONAL">مسحوبات شخصية</option>
                            <option value="GOVERNMENT">رسوم حكومية</option>
                            <option value="TRANSPORT">مواصلات وانتقال</option>
                            <option value="OTHER">أخرى</option>
                          </>
                      )}
                  </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="المبلغ" type="number" value={newTx.amount || ''} onChange={e => setNewTx({...newTx, amount: parseFloat(e.target.value)})} />
                <div className="pt-7">
                  <Switch label="تم السداد فوراً" checked={newTx.isPaid || false} onChange={v => setNewTx({...newTx, isPaid: v})} />
                </div>
              </div>
              
              <Input label="الوصف" value={newTx.description || ''} onChange={e => setNewTx({...newTx, description: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="تاريخ المعاملة" type="date" value={newTx.date ? newTx.date.split('T')[0] : ''} onChange={e => setNewTx({...newTx, date: new Date(e.target.value).toISOString()})} />
                <Input label="تاريخ الاستحقاق (اختياري)" type="date" value={newTx.dueDate || ''} onChange={e => setNewTx({...newTx, dueDate: e.target.value})} />
              </div>

              <Select label="الموكل (اختياري)" value={newTx.clientId || ''} onChange={e => setNewTx({...newTx, clientId: e.target.value, caseId: undefined})}>
                 <option value="">لا يوجد</option>
                 {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
             </Select>
             <Select label="القضية (اختياري)" value={newTx.caseId || ''} onChange={e => setNewTx({...newTx, caseId: e.target.value})} disabled={!newTx.clientId}>
                 <option value="">لا يوجد</option>
                 {modalCases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>)}
             </Select>
              
              <div className="flex justify-end pt-2">
                <Button onClick={handleSave}>حفظ الحركة</Button>
            </div>
          </div>
      </Modal>
    </div>
  );
};

export default Finance;
