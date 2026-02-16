
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Case, Transaction, Document, User, AppSettings, AuditLogEntry, Reminder, LegalTemplate } from './types';
import { playSound } from './services/audioSystem';

interface StoreData {
  clients: Client[];
  cases: Case[];
  transactions: Transaction[];
  documents: Document[];
  legalTemplates: LegalTemplate[];
  reminders: Reminder[];
  currentUser: User | null;
  settings: AppSettings;
  auditLogs: AuditLogEntry[];
}

interface StoreActions {
  addClient: (client: Client) => boolean;
  addClientsBatch: (clients: Client[]) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addCase: (newCase: Case) => void;
  updateCase: (updatedCase: Case) => void;
  deleteCase: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addDocument: (doc: Document) => void;
  deleteDocument: (id: string) => void;
  addLegalTemplate: (template: LegalTemplate) => void;
  updateLegalTemplate: (template: LegalTemplate) => void;
  deleteLegalTemplate: (id: string) => void;
  addReminder: (reminder: Reminder) => void;
  markReminderDone: (id: string) => void;
  deleteReminder: (id: string) => void;
  login: (role: User['role']) => void;
  logout: () => void;
  updateSettings: (settings: AppSettings) => void;
  exportBackup: () => void;
  importBackup: (jsonString: string) => void;
  resetSystem: () => void;
}

const StoreContext = createContext<(StoreData & StoreActions) | null>(null);

const STORAGE_KEY = 'HELM_PLATINUM_V3';

const INITIAL_TEMPLATES: LegalTemplate[] = [
  { id: 't1', name: 'وكالة قانونية خاصة', description: 'لتمثيل الموكل في قضايا محددة', category: 'وكالات' },
  { id: 't2', name: 'عقد أتعاب محاماة', description: 'تحديد العلاقة المالية وشروط السداد', category: 'عقود' },
];

const INITIAL_SETTINGS: AppSettings = {
  version: 3,
  nightMode: false,
  general: {
    officeNameEn: 'Ahmed Helmy Legal Consulting',
    officeNameAr: 'مكتب المستشار أحمد حلمي للاستشارات القانونية',
    email: 'ahmedhelmy200@gmail.com',
    phone: '05444144149',
    address: 'دبي، الإمارات العربية المتحدة',
    websiteUrl: '',
    licenseNumber: 'CN-H-2025',
    taxId: 'TRN-100200300'
  },
  branding: {
    themeColor: 'slate',
    fontFamily: 'Tajawal',
    pdfTemplate: 'modern',
    enableIceTheme: true,
    footerText: 'سري للغاية - مكتب المستشار أحمد حلمي'
  },
  finance: {
    currency: 'د.إ',
    taxRate: 5,
    enableTax: true,
    invoiceTerms: 'يستحق السداد خلال 7 أيام عمل.'
  },
  workflow: {
    caseStatuses: ['قيد الإعداد', 'جارية', 'رابحة', 'خاسرة'],
    autoNumberPrefix: 'AH-',
    reminderDays: 3
  },
  features: {
    enableWhatsApp: true,
    enableCloudSync: true,
    enableAuditLog: true
  }
};

// دمج قائمة الموكلين الـ 64 مع منع التكرار
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'eid_78419904400406', // تم توحيد المعرف بناءً على الهوية الإماراتية
    fullName: 'سمر اسامة العبد',
    email: 'samar.osama@example.com',
    phone: '05XXXXXXX',
    address: 'المجاز، الشارقة',
    idNumber: '78419904400406',
    idType: 'هوية اماراتية',
    nationality: 'فلسطين',
    category: 'وكيل',
    notes: 'موكل مستورد من كشف حساب Ecash + بيانات الوكالة الرقمية.',
    createdAt: '2025-07-06T00:00:00.000Z'
  },
  {
    id: 'eid_784199298525710',
    fullName: 'أحمد حلمي جمعة رشوان',
    email: 'ahmedhelmy200@gmail.com',
    phone: '0544144149',
    address: 'شارع خليفة محمد بن زايد',
    idNumber: '784199298525710',
    idType: 'هوية اماراتية',
    nationality: 'مصر',
    category: 'وكيل',
    notes: 'نوع الوكالة: وكالة خاصة بالقضايا | أرقام الطلبات: 563081، 531442، 515333.',
    createdAt: '2025-06-20T00:00:00.000Z'
  },
  {
    id: 'eid_784197824262063',
    fullName: 'الشيخ ناصر ماجد سلطان القاسمي',
    phone: '0545171444',
    idNumber: '784197824262063',
    idType: 'هوية اماراتية',
    address: 'الشارقة',
    category: 'موكل',
    createdAt: new Date().toISOString(),
    email: '',
    notes: ''
  },
  {
    id: 'eid_784198449625288',
    fullName: 'شريف ماهر عوض فرج',
    email: 'sharifmaher25@gmail.com',
    phone: '971556252733',
    address: 'دبي',
    idNumber: '784198449625288',
    idType: 'هوية اماراتية',
    nationality: 'مصر',
    category: 'موكل',
    notes: 'وكالة رقمية رقم 551885 بتاريخ 2025-10-06.',
    createdAt: '2025-10-06T00:00:00.000Z'
  },
  {
    id: 'pass_A37601848',
    fullName: 'ابو الحمد محمود ابو الحمد',
    idNumber: 'A37601848',
    idType: 'جواز سفر',
    nationality: 'مصر',
    address: 'عجمان',
    category: 'موكل',
    createdAt: new Date().toISOString(),
    email: '',
    phone: '',
    notes: ''
  },
  { id: 'c_1', fullName: 'احمد ثروت', category: 'موكل', createdAt: new Date().toISOString(), email: '', phone: '', address: '', notes: '' },
  { id: 'c_47', fullName: 'إسلام السيد محمد', email: 'eslamelborhamy@gmail.com', phone: '971502827019', category: 'موكل', createdAt: '2025-10-23T00:00:00.000Z', notes: 'وكالة رقمية 561525', address: '' },
  { id: 'c_55', fullName: 'آية علي عبدالهادي الهريدي', email: 'ayaali545@icloud.com', phone: '971545520416', category: 'موكل', createdAt: '2025-07-06T00:00:00.000Z', notes: 'وكالة رقمية 503497', address: '' },
  { id: 'c_51', fullName: 'محمد جلال عمر عطية', email: 'm.galal961988@gmail.com', phone: '971567565650', category: 'موكل', createdAt: '2025-08-19T00:00:00.000Z', notes: 'وكالة رقمية 527786', address: '' }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  // ربط المعاملات المالية السابقة بـ "سمر أسامة" عبر المعرف الموحد الجديد
  { id: 'tx-1', date: '2025-07-07T09:00:06.000Z', amount: 10.00, type: 'INCOME', category: 'INVOICE', description: 'ADCB Purchase Credit Ref. PHUB507043685', clientId: 'eid_78419904400406', isPaid: true },
  { id: 'tx-2', date: '2025-07-07T09:00:06.000Z', amount: 5.00, type: 'EXPENSE', category: 'OFFICE', description: 'Virtual Account noqodi charges', clientId: 'eid_78419904400406', isPaid: true },
  { id: 'tx-5', date: '2025-07-12T06:00:09.000Z', amount: 5500.00, type: 'INCOME', category: 'INVOICE', description: 'ADCB Purchase Credit Ref. PHUB509385121', clientId: 'eid_78419904400406', isPaid: true },
  { id: 'tx-8', date: '2025-07-12T06:53:46.000Z', amount: 4572.50, type: 'EXPENSE', category: 'GOVERNMENT', description: 'Change Status-SC - Establishments Ref 2144498240', clientId: 'eid_78419904400406', isPaid: true }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StoreData>(() => {
    try {
      const savedString = localStorage.getItem(STORAGE_KEY);
      if (savedString) {
        const parsed = JSON.parse(savedString);
        return {
          ...parsed,
          currentUser: null,
          settings: { ...INITIAL_SETTINGS, ...parsed.settings, nightMode: false }
        };
      }
    } catch (e) {
      console.error("Store initialization error:", e);
    }
    return {
      clients: INITIAL_CLIENTS,
      cases: [],
      transactions: INITIAL_TRANSACTIONS,
      documents: [],
      legalTemplates: INITIAL_TEMPLATES,
      reminders: [],
      currentUser: null,
      settings: INITIAL_SETTINGS,
      auditLogs: []
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("LocalStorage save error:", e);
    }
  }, [data]);

  const addClient = (client: Client) => {
    // خوارزمية منع التكرار: التحقق من الهوية أو الجواز
    const exists = data.clients.find(c => 
        (client.idNumber && c.idNumber === client.idNumber) || 
        (client.fullName.trim() === c.fullName.trim())
    );
    
    if (exists) {
        alert("هذا الموكل مسجل مسبقاً في النظام.");
        return false;
    }

    setData(prev => ({ ...prev, clients: [...prev.clients, client] }));
    playSound('success');
    return true;
  };

  const addClientsBatch = (newClients: Client[]) => {
      setData(prev => {
          const uniqueNewClients = newClients.filter(newC => 
            !prev.clients.some(oldC => 
                (newC.idNumber && oldC.idNumber === newC.idNumber) || 
                (newC.fullName.trim() === oldC.fullName.trim())
            )
          );
          return { ...prev, clients: [...prev.clients, ...uniqueNewClients] };
      });
      playSound('success');
  };

  const updateClient = (client: Client) => {
    setData(prev => ({ ...prev, clients: prev.clients.map(c => c.id === client.id ? client : c) }));
    playSound('success');
  };

  const deleteClient = (id: string) => {
    setData(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id) }));
    playSound('click');
  };

  const addCase = (newCase: Case) => {
    setData(prev => ({ ...prev, cases: [...prev.cases, newCase] }));
    playSound('success');
  };

  const updateCase = (updatedCase: Case) => {
    setData(prev => ({ ...prev, cases: prev.cases.map(c => c.id === updatedCase.id ? updatedCase : c) }));
    playSound('success');
  };

  const deleteCase = (id: string) => {
    setData(prev => ({ ...prev, cases: prev.cases.filter(c => c.id !== id) }));
    playSound('click');
  };

  const addTransaction = (t: Transaction) => {
    setData(prev => ({ ...prev, transactions: [...prev.transactions, t] }));
    playSound('success');
  };

  const updateTransaction = (t: Transaction) => {
    setData(prev => ({ ...prev, transactions: prev.transactions.map(tr => tr.id === t.id ? t : tr) }));
    playSound('success');
  };

  const deleteTransaction = (id: string) => {
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    playSound('click');
  };

  const addDocument = (doc: Document) => {
    setData(prev => ({ ...prev, documents: [...prev.documents, doc] }));
    playSound('success');
  };

  const deleteDocument = (id: string) => {
    setData(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }));
    playSound('click');
  };

  const addLegalTemplate = (template: LegalTemplate) => {
    setData(prev => ({ ...prev, legalTemplates: [...prev.legalTemplates, template] }));
    playSound('success');
  };

  const updateLegalTemplate = (template: LegalTemplate) => {
    setData(prev => ({ ...prev, legalTemplates: prev.legalTemplates.map(t => t.id === template.id ? template : t) }));
    playSound('success');
  };

  const deleteLegalTemplate = (id: string) => {
    setData(prev => ({ ...prev, legalTemplates: prev.legalTemplates.filter(t => t.id !== id) }));
    playSound('click');
  };

  const addReminder = (reminder: Reminder) => {
    setData(prev => ({ ...prev, reminders: [...prev.reminders, reminder] }));
    playSound('notification');
  };

  const markReminderDone = (id: string) => {
    setData(prev => ({ ...prev, reminders: prev.reminders.map(r => r.id === id ? { ...r, isDone: true } : r) }));
    playSound('success');
  };

  const deleteReminder = (id: string) => {
    setData(prev => ({ ...prev, reminders: prev.reminders.filter(r => r.id !== id) }));
    playSound('click');
  };

  const login = (role: User['role']) => {
    const user: User = { 
        id: 'u1', 
        name: role === 'ADMIN' ? 'المستشار أحمد حلمي' : 'فريق العمل', 
        role, 
        email: data.settings.general.email 
    };
    setData(prev => ({ ...prev, currentUser: user }));
    playSound('login');
  };

  const logout = () => {
    setData(prev => ({ ...prev, currentUser: null }));
    playSound('click');
  };

  const updateSettings = (s: AppSettings) => {
    setData(prev => ({ ...prev, settings: s }));
    playSound('success');
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HELM_3D_BACKUP_${new Date().getTime()}.json`;
    a.click();
  };

  const importBackup = (jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString);
      setData({ ...imported, currentUser: null });
      alert('تم استرجاع البيانات بنجاح.');
      window.location.reload();
    } catch (e) {
      alert('ملف النسخ الاحتياطي غير صالح.');
    }
  };

  const resetSystem = () => {
    if (confirm('هل أنت متأكد؟ سيتم مسح كافة البيانات نهائياً.')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  return (
    <StoreContext.Provider value={{ 
      ...data, addClient, addClientsBatch, updateClient, deleteClient, 
      addCase, updateCase, deleteCase, addTransaction, updateTransaction, 
      deleteTransaction, addDocument, deleteDocument, login, logout, 
      updateSettings, exportBackup, importBackup, resetSystem,
      addLegalTemplate, updateLegalTemplate, deleteLegalTemplate,
      addReminder, markReminderDone, deleteReminder
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
