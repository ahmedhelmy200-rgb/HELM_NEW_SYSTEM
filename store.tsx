
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

const STORAGE_KEY = 'HELM_DATA_V1';

const INITIAL_TEMPLATES: LegalTemplate[] = [
  { id: 't1', name: 'وكالة قانونية خاصة', description: 'لتمثيل الموكل في قضايا محددة أمام المحاكم والدوائر الرسمية', category: 'وكالات' },
  { id: 't2', name: 'عقد اتفاق أتعاب محاماة', description: 'تحديد العلاقة المالية والمهنية وشروط السداد', category: 'عقود' },
  { id: 't3', name: 'إخطار عدلي / إنذار رسمي', description: 'مطالبة قانونية رسمية موجهة للخصم قبل التقاضي', category: 'إخطارات' },
  { id: 't4', name: 'اتفاقية تسوية ودية', description: 'لحل النزاعات ودياً وتجنب إجراءات التقاضي الطويلة', category: 'تسويات' },
  { id: 't5', name: 'مذكرة دفاع أولية', description: 'صياغة أولية للرد على ادعاءات الخصم', category: 'مذكرات' },
];

const INITIAL_SETTINGS: AppSettings = {
  version: 1,
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
    pdfTemplate: 'classic',
    enableIceTheme: false,
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
    if (saved) return { ...saved, isCloudSynced: true, legalTemplates: saved.legalTemplates || INITIAL_TEMPLATES };
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

  const setCloudSync = (status: boolean) => setData(prev => ({ ...prev, isCloudSynced: status }));

  const checkReminders = useCallback(() => {
    const now = new Date();
    const newReminders: Reminder[] = [];

    data.cases.forEach(c => {
      if (c.nextHearingDate) {
        const hDate = new Date(c.nextHearingDate);
        const diffDays = Math.ceil((hDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= data.settings.workflow.reminderDays && diffDays >= 0) {
          const exists = data.reminders.find(r => r.relatedId === c.id && r.type === 'CASE' && !r.isDone);
          if (!exists) {
            newReminders.push({
              id: crypto.randomUUID(),
              title: `جلسة قادمة: ${c.caseNumber}`,
              description: `موعد الجلسة في ${c.court} خلال ${diffDays} يوم.`,
              date: c.nextHearingDate,
              isRead: false,
              isDone: false,
              priority: diffDays <= 1 ? 'HIGH' : 'MEDIUM',
              type: 'CASE',
              relatedId: c.id
            });
          }
        }
      }
    });

    if (newReminders.length > 0) {
      setData(prev => ({ ...prev, reminders: [...newReminders, ...prev.reminders] }));
      playSound('notification');
    }
  }, [data.cases, data.reminders, data.settings.workflow.reminderDays]);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 120000);
    return () => clearInterval(interval);
  }, [checkReminders]);

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
      const exists = data.clients.find(c => c.fullName === client.fullName);
      if (exists) {
          playSound('error');
          alert(`خطأ: هذا الموكل مسجل مسبقاً`);
          return false;
      }
      setData(prev => ({ ...prev, clients: [...prev.clients, client] }));
      logAction('CREATE_CLIENT', `إضافة الموكل: ${client.fullName}`);
      playSound('success');
      return true;
  };

  const addClientsBatch = (newClients: Client[]) => {
      setData(prev => ({ ...prev, clients: [...prev.clients, ...newClients] }));
      logAction('BATCH_IMPORT', `استيراد جماعي لـ ${newClients.length} موكل`);
      playSound('success');
  };

  const updateClient = (client: Client) => {
      setData(prev => ({ ...prev, clients: prev.clients.map(c => c.id === client.id ? client : c) }));
      logAction('UPDATE_CLIENT', `تحديث بيانات الموكل: ${client.fullName}`);
      playSound('success');
  };

  const deleteClient = (id: string) => {
      const client = data.clients.find(c => c.id === id);
      setData(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id) }));
      logAction('DELETE_CLIENT', `حذف الموكل: ${client?.fullName}`);
      playSound('click');
  };

  const addCase = (newCase: Case) => {
      setData(prev => ({ ...prev, cases: [...prev.cases, newCase] }));
      logAction('CREATE_CASE', `فتح قضية جديدة: ${newCase.caseNumber}`);
      playSound('success');
  };
  const updateCase = (updatedCase: Case) => {
      setData(prev => ({ ...prev, cases: prev.cases.map(c => c.id === updatedCase.id ? updatedCase : c) }));
      logAction('UPDATE_CASE', `تحديث القضية رقم: ${updatedCase.caseNumber}`);
      playSound('success');
  };
  const deleteCase = (id: string) => {
      setData(prev => ({ ...prev, cases: prev.cases.filter(c => c.id !== id) }));
      playSound('click');
  };

  const addTransaction = (t: Transaction) => {
      setData(prev => ({ ...prev, transactions: [...prev.transactions, t] }));
      logAction('CREATE_TX', `تسجيل حركة مالية: ${t.description}`);
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
    logAction('CREATE_TEMPLATE', `إضافة قالب جديد: ${t.name}`);
    playSound('success');
  };
  const updateLegalTemplate = (t: LegalTemplate) => {
    setData(prev => ({ ...prev, legalTemplates: prev.legalTemplates.map(item => item.id === t.id ? t : item) }));
    logAction('UPDATE_TEMPLATE', `تحديث القالب: ${t.name}`);
    playSound('success');
  };
  const deleteLegalTemplate = (id: string) => {
    setData(prev => ({ ...prev, legalTemplates: prev.legalTemplates.filter(item => item.id !== id) }));
    logAction('DELETE_TEMPLATE', `حذف القالب المعرف بـ: ${id}`);
    playSound('click');
  };

  const addReminder = (r: Reminder) => {
    setData(prev => ({ ...prev, reminders: [r, ...prev.reminders] }));
    playSound('success');
  };
  const markReminderDone = (id: string) => {
    setData(prev => ({ ...prev, reminders: prev.reminders.map(rem => rem.id === id ? { ...rem, isDone: true, isRead: true } : rem) }));
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
    const user: User = { id: 'u1', name: role === 'ADMIN' ? 'المستشار أحمد حلمي' : role === 'ACCOUNTANT' ? 'المحاسب' : 'المساعد الإداري', role, email: data.settings.general.email };
    setData(prev => ({ ...prev, currentUser: user }));
    logAction('LOGIN', `تسجيل دخول: ${user.name}`);
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
    if (confirm('تحذير: سيتم مسح كافة البيانات. هل أنت متأكد؟')) {
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
      const backupData = { 
          source: 'HELM_LEGAL_OS',
          timestamp: new Date().toISOString(), 
          data: data,
          schemaVersion: INITIAL_SETTINGS.version 
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HELM_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      logAction('EXPORT_BACKUP', 'تم تصدير نسخة احتياطية من النظام');
  };

  const importBackup = (jsonString: string) => {
      try {
          const imported = JSON.parse(jsonString);
          
          // Validation logic for data integrity
          if (!imported.data || !imported.data.clients || !imported.data.cases) {
              throw new Error("تنسيق ملف النسخة الاحتياطية غير صالح.");
          }

          // Merge or Replace logic - Here we replace for full restoration
          const newData = {
              ...imported.data,
              currentUser: null, // Force re-login for security
              isCloudSynced: true
          };

          setData(newData);
          logAction('IMPORT_BACKUP', `تم استعادة البيانات من نسخة بتاريخ ${imported.timestamp}`);
          playSound('success');
          alert("تم استعادة البيانات بنجاح. يرجى تسجيل الدخول مجدداً.");
          window.location.reload();
      } catch (e: any) {
          playSound('error');
          alert(`فشل الاستيراد: ${e.message}`);
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
