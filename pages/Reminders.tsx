
import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input, Modal, Badge, Select } from '../components/UI';
import { Plus, Bell, CheckCircle, Trash2, Calendar, AlertCircle, Filter, Clock, MessageSquare } from 'lucide-react';
import { Reminder, ReminderPriority, ReminderType } from '../types';
import { sendWhatsAppMessage, getReminderTemplate } from '../services/whatsappService';

const RemindersPage = () => {
  const { reminders, addReminder, markReminderDone, deleteReminder, clients, settings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'PENDING' | 'DONE' | 'ALL'>('PENDING');
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
      priority: 'MEDIUM',
      type: 'CUSTOM',
      date: new Date().toISOString().split('T')[0]
  });

  const filteredReminders = reminders.filter(r => {
      if (filter === 'PENDING') return !r.isDone;
      if (filter === 'DONE') return r.isDone;
      return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSave = () => {
    if (!newReminder.title || !newReminder.date) return;
    addReminder({
        ...newReminder,
        id: crypto.randomUUID(),
        isRead: false,
        isDone: false,
    } as Reminder);
    setIsModalOpen(false);
    setNewReminder({ priority: 'MEDIUM', type: 'CUSTOM', date: new Date().toISOString().split('T')[0] });
  };

  const handleWhatsAppReminder = (reminder: Reminder) => {
      let client = null;
      if (reminder.type === 'CASE') {
          // محاولة استخراج الموكل من القضية المرتبطة
          const kase = settings.workflow.caseStatuses.length > 0 ? null : null; // Logic check
          // Simplified: Search relatedId in clients or cases
          const foundCase = clients.flatMap(c => []).find(x => true); // Placeholder
      }

      // البحث عن الموكل المرتبط
      // ملاحظة: للتسهيل، سنبحث عن الموكل الذي قد يكون مرتبطاً بالقضية
      // في الواقع نحتاج لربط أدق، لكن هنا سنحاول البحث
      const relatedClient = clients.find(c => c.id === reminder.relatedId);
      
      if (relatedClient && relatedClient.phone) {
          const msg = getReminderTemplate(settings.general.officeNameAr, relatedClient.fullName, reminder.title, reminder.date);
          sendWhatsAppMessage(relatedClient.phone, msg);
      } else {
          alert("لا يمكن العثور على موكل مرتبط بهذا التنبيه أو لا يوجد رقم هاتف.");
      }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 text-right">مركز التنبيهات والتذكيرات</h1>
            <p className="text-sm text-gray-500 mt-1 text-right">إدارة المواعيد، الجلسات، والاستحقاقات المالية</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex bg-white border rounded-lg p-1">
                <button 
                    onClick={() => setFilter('PENDING')}
                    className={`px-4 py-1.5 text-sm rounded-md transition-all ${filter === 'PENDING' ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    القائمة الحالية
                </button>
                <button 
                    onClick={() => setFilter('DONE')}
                    className={`px-4 py-1.5 text-sm rounded-md transition-all ${filter === 'DONE' ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    المنجزات
                </button>
            </div>
            <Button onClick={() => setIsModalOpen(true)} icon={Plus}>تذكير يدوي</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredReminders.length === 0 ? (
            <div className="bg-white py-16 text-center rounded-xl border border-dashed border-gray-200">
                <div className="flex justify-center mb-4">
                    <div className="bg-slate-50 p-4 rounded-full">
                        <Clock className="h-10 w-10 text-slate-300" />
                    </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">لا توجد تنبيهات</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-1">كل شيء تحت السيطرة! لا توجد مواعيد معلقة في هذه القائمة.</p>
            </div>
        ) : (
            filteredReminders.map(r => (
                <Card key={r.id} className={`transition-all ${r.isDone ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4 items-start">
                            <div className={`p-3 rounded-xl ${
                                r.type === 'CASE' ? 'bg-blue-50 text-blue-600' :
                                r.type === 'FINANCE' ? 'bg-emerald-50 text-emerald-600' :
                                'bg-purple-50 text-purple-600'
                            }`}>
                                {r.type === 'CASE' ? <AlertCircle className="h-6 w-6" /> : 
                                 r.type === 'FINANCE' ? <CheckCircle className="h-6 w-6" /> : 
                                 <Bell className="h-6 w-6" />}
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-lg font-bold ${r.isDone ? 'line-through text-gray-400' : 'text-slate-900'}`}>{r.title}</h3>
                                    <Badge color={r.priority === 'HIGH' ? 'red' : r.priority === 'MEDIUM' ? 'yellow' : 'gray'}>
                                        {r.priority === 'HIGH' ? 'عاجل جداً' : r.priority === 'MEDIUM' ? 'مهم' : 'عادي'}
                                    </Badge>
                                </div>
                                <p className="text-gray-600 mt-1">{r.description}</p>
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {new Date(r.date).toLocaleDateString('ar-SA')}
                                    </span>
                                    <span className="flex items-center gap-1 uppercase">
                                        <Filter className="h-3 w-3" /> {r.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {settings.features.enableWhatsApp && !r.isDone && (r.type === 'CASE' || r.type === 'FINANCE') && (
                                <button 
                                    onClick={() => handleWhatsAppReminder(r)}
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                    title="تنبيه واتساب"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </button>
                            )}
                            {!r.isDone && (
                                <button 
                                    onClick={() => markReminderDone(r.id)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="تم الإنجاز"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                </button>
                            )}
                            <button 
                                onClick={() => deleteReminder(r.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                title="حذف التنبيه"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </Card>
            ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة تذكير مخصص">
          <div className="space-y-4">
              <Input 
                label="عنوان التذكير" 
                placeholder="مثلاً: الاتصال بموكل، مراجعة عقد..." 
                value={newReminder.title || ''} 
                onChange={e => setNewReminder({...newReminder, title: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-4">
                <Select 
                    label="الأولوية" 
                    value={newReminder.priority} 
                    onChange={e => setNewReminder({...newReminder, priority: e.target.value as ReminderPriority})}
                >
                    <option value="LOW">منخفضة</option>
                    <option value="MEDIUM">متوسطة</option>
                    <option value="HIGH">عاجل</option>
                </Select>
                <Input 
                    label="تاريخ التذكير" 
                    type="date" 
                    value={newReminder.date || ''} 
                    onChange={e => setNewReminder({...newReminder, date: e.target.value})} 
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تفاصيل إضافية</label>
                  <textarea 
                    className="w-full border rounded-lg p-3 text-sm focus:ring-slate-500 focus:border-slate-500 text-right" 
                    rows={3}
                    placeholder="اكتب تفاصيل أكثر هنا..."
                    value={newReminder.description || ''}
                    onChange={e => setNewReminder({...newReminder, description: e.target.value})}
                  />
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSave}>جدولة التذكير</Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default RemindersPage;
