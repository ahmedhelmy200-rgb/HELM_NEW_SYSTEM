
export type Role = 'ADMIN' | 'ASSISTANT' | 'ACCOUNTANT';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

export type CaseStatus = 'WINNING' | 'PREPARING' | 'ONGOING' | 'LOST' | string;

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  idNumber?: string;
  idType?: string;
  nationality?: string;
  category?: string; // موكل / وكيل
  commissionAmount?: number; // مبلغ العمولة الخاص (مخفي عن غير الإداريين)
  createdAt: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  clientId: string;
  title: string;
  status: CaseStatus;
  court: string;
  nextHearingDate?: string;
  description: string;
  createdAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';
export type ExpenseCategory = 'OFFICE' | 'PERSONAL' | 'GOVERNMENT' | 'TRANSPORT' | 'OTHER';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory | 'INVOICE' | 'RECEIPT' | 'UNKNOWN';
  description: string;
  clientId?: string;
  caseId?: string;
  dueDate?: string;
  isPaid: boolean;
}

export interface LegalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  clientId?: string;
  caseId?: string;
  tags: string[];
  content?: string;
  createdAt: string;
}

export type ReminderPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ReminderType = 'CASE' | 'FINANCE' | 'CUSTOM' | 'SYSTEM';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  isDone: boolean;
  priority: ReminderPriority;
  type: ReminderType;
  relatedId?: string;
}

export interface AppSettings {
  version: number;
  general: {
    officeNameEn: string;
    officeNameAr: string;
    email: string;
    phone: string;
    address: string;
    websiteUrl: string;
    licenseNumber: string;
    taxId: string;
  };
  branding: {
    themeColor: 'slate' | 'blue' | 'indigo' | 'rose' | 'emerald';
    logoUrl?: string;
    stampUrl?: string;
    signatureUrl?: string;
    pdfTemplate: 'classic' | 'modern';
    enableIceTheme: boolean; // الخاصية الجديدة
    footerText: string;
  };
  finance: {
    currency: string;
    taxRate: number;
    enableTax: boolean;
    invoiceTerms: string;
  };
  workflow: {
    caseStatuses: string[];
    autoNumberPrefix: string;
    reminderDays: number;
  };
  features: {
    enableWhatsApp: boolean;
    enableCloudSync: boolean;
    enableAuditLog: boolean;
  };
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  userId: string;
  timestamp: string;
}
