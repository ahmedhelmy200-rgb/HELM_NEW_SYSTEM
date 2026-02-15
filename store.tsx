
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  isCloudSynced: boolean;
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
  markReminderRead: (id: string) => void;
  deleteReminder: (id: string) => void;

  login: (role: User['role']) => void;
  logout: () => void;
  updateSettings: (settings: AppSettings) => void;
  
  exportBackup: () => void;
  importBackup: (jsonString: string) => void;
  clearAuditLogs: () => void;
  resetSystem: () => void;
  setCloudSync: (status: boolean) => void;
}

const StoreContext = createContext<(StoreData & StoreActions) | null>(null);

const STORAGE_KEY = 'HELM_DATA_V2';

const INITIAL_TEMPLATES: LegalTemplate[] = [
  { id: 't1', name: 'وكالة قانونية خاصة', description: 'لتمثيل الموكل في قضايا محددة أمام المحاكم والدوائر الرسمية', category: 'وكالات' },
  { id: 't2', name: 'عقد اتفاق أتعاب محاماة', description: 'تحديد العلاقة المالية والمهنية وشروط السداد', category: 'عقود' },
  { id: 't3', name: 'إخطار عدلي / إنذار رسمي', description: 'مطالبة قانونية رسمية موجهة للخصم قبل التقاضي', category: 'إخطارات' },
];

const INITIAL_SETTINGS: AppSettings = {
  version: 2,
  nightMode: true,
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
    themeColor: 'cyber',
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
    caseStatuses: ['قيد الإعداد', 'جارية', 'رابحة', 'خاسرة', 'استئناف'],
    autoNumberPrefix: 'AH-CASE-',
    reminderDays: 3
  },
  features: {
    enableWhatsApp: true,
    enableCloudSync: true,
    enableAuditLog: true
  }
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StoreData>(() => {
    const savedString = localStorage.getItem(STORAGE_KEY);
    let saved = savedString ? JSON.parse(savedString) : null;
    if (saved) return { 
        ...saved, 
        isCloudSynced: true, 
        settings: { ...INITIAL_SETTINGS, ...saved.settings }
    };
    return {
      clients: [],
      cases: [],
      transactions: [],
      documents: [],
      legalTemplates: INITIAL_TEMPLATES,
      reminders: [],
      currentUser: null,
      settings: INITIAL_SETTINGS,
      auditLogs: [],
      isCloudSynced: true
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Apply Font Globally
  useEffect(() => {
    document.documentElement.style.fontFamily = `'${data.settings.branding.fontFamily}', sans-serif`;
  }, [data.settings.branding.fontFamily]);

  const setCloudSync = (status: boolean) => setData(prev => ({ ...prev, isCloudSynced: status }));

  const logAction = (action: string, details: string) => {
      if (!data.settings.features.enableAuditLog) return;
      const log: AuditLogEntry = {
          id: crypto.randomUUID(),
          action,
          details,
          userId: data.currentUser?.name || 'النظام',
          timestamp: new Date().toISOString()
      };
      setData(prev => ({ ...prev, auditLogs: [log, ...prev.auditLogs].slice(0, 100) }));
  };

  const addClient = (client: Client) => {
      setData(prev => ({ ...prev, clients: [...prev.clients, client] }));
      logAction('CREATE_CLIENT', `إضافة الموكل: ${client.fullName}`);
      playSound('success');
      return true;
  };

  const addClientsBatch = (newClients: Client[]) => {
      setData(prev => ({ ...prev, clients: [...prev.clients, ...newClients] }));
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
      logAction('CREATE_CASE', `فتح قضية جديدة: ${newCase.caseNumber}`);
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

  const addLegalTemplate = (t: LegalTemplate) => {
    setData(prev => ({ ...prev, legalTemplates: [...prev.legalTemplates, t] }));
    playSound('success');
  };
  const updateLegalTemplate = (t: LegalTemplate) => {
    setData(prev => ({ ...prev, legalTemplates: prev.legalTemplates.map(item => item.id === t.id ? t : item) }));
    playSound('success');
  };
  const deleteLegalTemplate = (id: string) => {
    setData(prev => ({ ...prev, legalTemplates: prev.legalTemplates.filter(item => item.id !== id) }));
    playSound('click');
  };

  const addReminder = (r: Reminder) => {
    setData(prev => ({ ...prev, reminders: [r, ...prev.reminders] }));
    playSound('success');
  };
  const markReminderDone = (id: string) => {
    setData(prev => ({ ...prev, reminders: prev.reminders.map(rem => rem.id === id ? { ...rem, isDone: true } : rem) }));
    playSound('click');
  };
  const markReminderRead = (id: string) => {
    setData(prev => ({ ...prev, reminders: prev.reminders.map(r => r.id === id ? { ...r, isRead: true } : r) }));
  };
  const deleteReminder = (id: string) => {
    setData(prev => ({ ...prev, reminders: prev.reminders.filter(r => r.id !== id) }));
    playSound('click');
  };

  const login = (role: User['role']) => {
    const user: User = { id: 'u1', name: role === 'ADMIN' ? 'المستشار أحمد حلمي' : 'فريق العمل', role, email: data.settings.general.email };
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

  const clearAuditLogs = () => setData(prev => ({ ...prev, auditLogs: [] }));

  const resetSystem = () => {
    if (confirm('هل أنت متأكد؟ سيتم مسح كل شيء.')) {
        setData({
            clients: [],
            cases: [],
            transactions: [],
            documents: [],
            legalTemplates: INITIAL_TEMPLATES,
            reminders: [],
            currentUser: null,
            settings: INITIAL_SETTINGS,
            auditLogs: [],
            isCloudSynced: true
        });
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
  };

  const exportBackup = () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HELM_BACKUP.json`;
      a.click();
  };

  const importBackup = (jsonString: string) => {
      try {
          const imported = JSON.parse(jsonString);
          setData({ ...imported, currentUser: null });
          window.location.reload();
      } catch (e) {
          alert('فشل الاستيراد');
      }
  };

  return (
    <StoreContext.Provider value={{ ...data, addClient, addClientsBatch, updateClient, deleteClient, addCase, updateCase, deleteCase, addTransaction, updateTransaction, deleteTransaction, addDocument, deleteDocument, addLegalTemplate, updateLegalTemplate, deleteLegalTemplate, addReminder, markReminderDone, markReminderRead, deleteReminder, login, logout, updateSettings, exportBackup, importBackup, clearAuditLogs, resetSystem, setCloudSync }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
