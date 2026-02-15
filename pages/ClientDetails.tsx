
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Card, Button, Badge, Modal, Input, Select } from '../components/UI';
import { 
    ArrowRight, Phone, Mail, MapPin, Briefcase, FileText, 
    DollarSign, Calendar, Plus, CreditCard, Activity, MessageCircle, Percent, Edit
} from 'lucide-react';
import { CaseStatus, TransactionType, Transaction, Case, Document, Client } from '../types';
import { sendWhatsAppMessage } from '../services/whatsappService';

const ClientDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { clients, cases, documents, transactions, settings, addCase, addDocument, addTransaction, updateClient, currentUser } = useStore();

    const client = clients.find(c => c.id === id);

    // Modal States
    const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

    // Form States
    const [newCase, setNewCase] = useState<Partial<Case>>({ status: 'PREPARING' });
    const [newDoc, setNewDoc] = useState<Partial<Document>>({});
    const [newTx, setNewTx] = useState<Partial<Transaction>>({ type: 'INCOME', isPaid: true });
    const [editClient, setEditClient] = useState<Partial<Client>>({});

    if (!client) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">الموكل غير موجود</h2>
                <Button variant="ghost" onClick={() => navigate('/clients')} className="mt-4">العودة للقائمة</Button>
            </div>
        );
    }

    const clientCases = cases.filter(c => c.clientId === client.id);
    const clientDocs = documents.filter(d => d.clientId === client.id);
    const clientTx = transactions.filter(t => t.clientId === client.id);

    const totalIncome = clientTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);

    const getStatusColor = (status: CaseStatus) => {
      switch(status) {
          case 'WINNING': return 'green';
          case 'PREPARING': return 'blue';
          case 'ONGOING': return 'yellow';
          case 'LOST': return 'red';
          default: return 'gray';
      }
    };
    
    const translateStatus = (status: CaseStatus) => {
        switch(status) {
          case 'WINNING': return 'رابحة';
          case 'PREPARING': return 'قيد الإعداد';
          case 'ONGOING': return 'جارية';
          case 'LOST': return 'خاسرة';
          default: return status;
      }
    }

    // Quick Action Handlers
    const handleAddCase = () => {
        if (!newCase.title || !newCase.caseNumber) return;
        addCase({
            ...newCase,
            id: crypto.randomUUID(),
            clientId: client.id,
            createdAt: new Date().toISOString(),
            status: newCase.status || 'PREPARING',
            description: newCase.description || ''
        } as Case);
        setIsCaseModalOpen(false);
        setNewCase({ status: 'PREPARING' });
    };

    const handleAddDoc = () => {
        if (!newDoc.title) return;
        addDocument({
            ...newDoc,
            id: crypto.randomUUID(),
            clientId: client.id,
            createdAt: new Date().toISOString(),
            type: 'TEXT',
            tags: newDoc.tags || []
        } as Document);
        setIsDocModalOpen(false);
        setNewDoc({});
    };

    const handleAddTx = () => {
        if (!newTx.amount || !newTx.description) return;
        addTransaction({
            ...newTx,
            id: crypto.randomUUID(),
            clientId: client.id,
            date: newTx.date || new Date().toISOString(),
            category: newTx.category || (newTx.type === 'INCOME' ? 'INVOICE' : 'OFFICE'),
        } as Transaction);
        setIsTxModalOpen(false);
        setNewTx({ type: 'INCOME', isPaid: true });
    };

    const handleUpdateProfile = () => {
        if (!editClient.fullName) return;
        updateClient(editClient as Client);
        setIsEditProfileModalOpen(false);
    };

    const handleWhatsApp = () => {
        if (client.phone) {
            sendWhatsAppMessage(client.phone, `تحية طيبة سيد/ة ${client.fullName}، نود التواصل معكم بخصوص ملفكم القانوني لدى ${settings.general.officeNameAr}.`);
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <Button variant="ghost" icon={ArrowRight} onClick={() => navigate('/clients')}>عودة للموكلين</Button>
                <div className="flex gap-2">
                    {settings.features.enableWhatsApp && client.phone && (
                         <Button variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200" icon={MessageCircle} onClick={handleWhatsApp}>واتساب</Button>
                    )}
                    {currentUser?.role === 'ADMIN' && (
                        <Button variant="secondary" icon={Edit} onClick={() => { setEditClient(client); setIsEditProfileModalOpen(true); }}>تعديل الملف</Button>
                    )}
                    <Button variant="secondary" icon={Briefcase} onClick={() => setIsCaseModalOpen(true)}>قضية جديدة</Button>
                    <Button variant="secondary" icon={FileText} onClick={() => setIsDocModalOpen(true)}>مستند جديد</Button>
                    <Button variant="primary" icon={DollarSign} onClick={() => setIsTxModalOpen(true)}>حركة مالية</Button>
                </div>
            </div>

            {/* Profile Header */}
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-8 sm:flex sm:items-center sm:justify-between bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
                    </div>
                    <div className="sm:flex sm:items-center z-10">
                        <div className="h-20 w-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl font-bold text-amber-400 shadow-inner">
                            {client.fullName.charAt(0)}
                        </div>
                        <div className="mt-4 sm:mt-0 sm:mr-6 text-right">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{client.fullName}</h1>
                                <Badge color={client.category === 'وكيل' ? 'indigo' : 'slate'}>{client.category || 'موكل'}</Badge>
                            </div>
                            <p className="text-slate-400 text-sm mt-1">عضوية نشطة منذ {new Date(client.createdAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-4 z-10">
                        {/* 
                            Rule: Commission Amount is only visible to ADMIN and if category is 'موكل' 
                        */}
                        {currentUser?.role === 'ADMIN' && client.category === 'موكل' && client.commissionAmount && (
                             <div className="flex flex-col items-end bg-amber-900/40 p-4 rounded-xl border border-amber-700/50">
                                <span className="text-xs text-amber-400 uppercase tracking-wider mb-1 flex items-center"><Percent className="h-3 w-3 ml-1" /> عمولة خاصة</span>
                                <span className="text-2xl font-black text-amber-200" dir="ltr">{client.commissionAmount.toLocaleString()} <span className="text-sm font-normal text-amber-400 ml-1">{settings.finance.currency}</span></span>
                             </div>
                        )}
                        <div className="flex flex-col items-end bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">إجمالي الإيرادات</span>
                            <span className="text-3xl font-black text-amber-400" dir="ltr">{totalIncome.toLocaleString()} <span className="text-sm font-normal text-slate-300 ml-1">{settings.finance.currency}</span></span>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div className="flex items-center text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <Mail className="h-4 w-4 ml-3 text-slate-400" /> {client.email || 'البريد غير متوفر'}
                     </div>
                     <div className="flex items-center text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <Phone className="h-4 w-4 ml-3 text-slate-400" /> {client.phone || 'الهاتف غير متوفر'}
                     </div>
                     <div className="flex items-center text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <MapPin className="h-4 w-4 ml-3 text-slate-400" /> {client.address || 'العنوان غير محدد'}
                     </div>
                </div>
                 {client.notes && (
                    <div className="px-6 py-4 border-t border-gray-100">
                         <div className="flex items-start gap-2">
                             <Activity className="h-4 w-4 text-slate-400 mt-1" />
                             <p className="text-sm text-gray-600 leading-relaxed italic">{client.notes}</p>
                         </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cases Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title={`ملف القضايا (${clientCases.length})`} action={<Plus className="h-4 w-4 text-slate-400 cursor-pointer" onClick={() => setIsCaseModalOpen(true)} />}>
                         {clientCases.length === 0 ? (
                             <div className="text-center py-12">
                                 <Briefcase className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                                 <p className="text-gray-400 text-sm">لا توجد قضايا مسجلة حالياً.</p>
                                 <Button variant="ghost" className="mt-2 text-xs" onClick={() => setIsCaseModalOpen(true)}>إضافة أول قضية</Button>
                             </div>
                         ) : (
                             <ul className="divide-y divide-gray-100">
                                 {clientCases.map(c => (
                                     <li key={c.id} className="py-4 flex justify-between items-center hover:bg-slate-50 -mx-6 px-6 transition group cursor-pointer">
                                         <div className="text-right">
                                             <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-slate-900">{c.title}</p>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{c.caseNumber}</span>
                                             </div>
                                             <div className="flex items-center gap-4 mt-1">
                                                <p className="text-xs text-gray-500">{c.court}</p>
                                                {c.nextHearingDate && (
                                                    <p className="text-[11px] text-amber-600 font-medium flex items-center">
                                                        <Calendar className="h-3 w-3 ml-1" /> الجلسة: {new Date(c.nextHearingDate).toLocaleDateString('ar-SA')}
                                                    </p>
                                                )}
                                             </div>
                                         </div>
                                         <Badge color={getStatusColor(c.status)}>{translateStatus(c.status)}</Badge>
                                     </li>
                                 ))}
                             </ul>
                         )}
                    </Card>

                    <Card title={`الحركات المالية`} action={<DollarSign className="h-4 w-4 text-slate-400 cursor-pointer" onClick={() => setIsTxModalOpen(true)} />}>
                        {clientTx.length === 0 ? (
                            <div className="text-center py-12">
                                <CreditCard className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">لم يتم تسجيل أي معاملات مالية.</p>
                            </div>
                        ) : (
                             <ul className="divide-y divide-gray-100">
                                {clientTx.map(t => (
                                    <li key={t.id} className="py-4 flex justify-between items-center -mx-6 px-6 hover:bg-slate-50 transition">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">{t.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-400 uppercase">{new Date(t.date).toLocaleDateString('ar-SA')}</span>
                                                <Badge color="slate">{t.category === 'INVOICE' ? 'فاتورة' : t.category}</Badge>
                                            </div>
                                        </div>
                                        <div className="text-left" dir="ltr">
                                            <span className={`text-base font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-gray-400 ml-1">{settings.finance.currency}</span>
                                        </div>
                                    </li>
                                ))}
                             </ul>
                        )}
                    </Card>
                </div>

                {/* Sidebar Section */}
                <div className="space-y-6">
                    <Card title={`المستندات (${clientDocs.length})`} action={<Plus className="h-4 w-4 text-slate-400 cursor-pointer" onClick={() => setIsDocModalOpen(true)} />}>
                        {clientDocs.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="h-10 w-10 text-slate-100 mx-auto mb-2" />
                                <p className="text-gray-400 text-xs">لا يوجد أرشيف.</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {clientDocs.map(d => (
                                    <li key={d.id} className="flex items-center p-3 bg-white hover:bg-slate-50 rounded-xl border border-gray-100 shadow-sm transition-all group cursor-pointer">
                                        <div className="h-8 w-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="mr-3 overflow-hidden flex-1 text-right">
                                            <p className="text-xs font-bold text-slate-900 truncate">{d.title}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(d.createdAt).toLocaleDateString('ar-SA')}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} title="تعديل بيانات الموكل">
                <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Input label="الاسم الكامل" value={editClient.fullName || ''} onChange={e => setEditClient({...editClient, fullName: e.target.value})} />
                        </div>
                        <Input label="رقم الهاتف" value={editClient.phone || ''} onChange={e => setEditClient({...editClient, phone: e.target.value})} />
                        <Input label="البريد الإلكتروني" value={editClient.email || ''} onChange={e => setEditClient({...editClient, email: e.target.value})} />
                        
                        <Select label="الصفة" value={editClient.category || 'موكل'} onChange={e => setEditClient({...editClient, category: e.target.value})}>
                            <option value="موكل">موكل</option>
                            <option value="وكيل">وكيل</option>
                        </Select>
                        <Input label="الجنسية" value={editClient.nationality || ''} onChange={e => setEditClient({...editClient, nationality: e.target.value})} />

                        {currentUser?.role === 'ADMIN' && editClient.category === 'موكل' && (
                            <div className="col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-200">
                                <Input 
                                    label="العمولة الخاصة (مبلغ مقطوع)" 
                                    type="number" 
                                    value={editClient.commissionAmount || ''} 
                                    onChange={e => setEditClient({...editClient, commissionAmount: parseFloat(e.target.value)})} 
                                />
                            </div>
                        )}
                    </div>
                    <Input label="العنوان" value={editClient.address || ''} onChange={e => setEditClient({...editClient, address: e.target.value})} />
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleUpdateProfile}>تحديث البيانات</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isCaseModalOpen} onClose={() => setIsCaseModalOpen(false)} title="إضافة قضية جديدة للموكل">
                <div className="space-y-4">
                    <Input label="رقم القضية" value={newCase.caseNumber || ''} onChange={e => setNewCase({...newCase, caseNumber: e.target.value})} placeholder="مثال: 2024/123" />
                    <Input label="عنوان الدعوى" value={newCase.title || ''} onChange={e => setNewCase({...newCase, title: e.target.value})} placeholder="مثال: دعوى مطالبة مالية" />
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="حالة القضية" value={newCase.status} onChange={e => setNewCase({...newCase, status: e.target.value as CaseStatus})}>
                            <option value="PREPARING">قيد الإعداد</option>
                            <option value="ONGOING">جارية</option>
                        </Select>
                        <Input label="المحكمة" value={newCase.court || ''} onChange={e => setNewCase({...newCase, court: e.target.value})} placeholder="مثال: محكمة دبي الابتدائية" />
                    </div>
                    <Input label="تاريخ الجلسة (اختياري)" type="date" value={newCase.nextHearingDate || ''} onChange={e => setNewCase({...newCase, nextHearingDate: e.target.value})} />
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleAddCase}>إنشاء القضية</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} title="إضافة مستند للأرشفة">
                <div className="space-y-4">
                    <Input label="عنوان المستند" value={newDoc.title || ''} onChange={e => setNewDoc({...newDoc, title: e.target.value})} placeholder="مثال: نسخة من الهوية، اتفاقية.." />
                    <Select 
                        label="اربط بقضية محددة (اختياري)" 
                        value={newDoc.caseId || ''} 
                        onChange={e => setNewDoc({...newDoc, caseId: e.target.value})}
                    >
                        <option value="">-- عام (بدون قضية) --</option>
                        {clientCases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>)}
                    </Select>
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleAddDoc}>حفظ المستند</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title="تسجيل حركة مالية">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="النوع" value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value as TransactionType})}>
                            <option value="INCOME">إيراد / دفعة من موكل</option>
                            <option value="EXPENSE">مصروف (رسوم، إلخ)</option>
                        </Select>
                        <Input label="المبلغ" type="number" value={newTx.amount || ''} onChange={e => setNewTx({...newTx, amount: parseFloat(e.target.value)})} />
                    </div>
                    <Input label="الوصف" value={newTx.description || ''} onChange={e => setNewTx({...newTx, description: e.target.value})} placeholder="سداد الدفعة الأولى، رسوم فتح ملف.." />
                    <Select 
                        label="اربط بقضية محددة (اختياري)" 
                        value={newTx.caseId || ''} 
                        onChange={e => setNewTx({...newTx, caseId: e.target.value})}
                    >
                        <option value="">-- عام (بدون قضية) --</option>
                        {clientCases.map(c => <option key={c.id} value={c.id}>{c.caseNumber}</option>)}
                    </Select>
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleAddTx}>تسجيل المعاملة</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ClientDetails;
