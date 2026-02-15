
export const sendWhatsAppMessage = (phone: string, message: string) => {
  if (!phone) return;
  
  // تنظيف الرقم من المسافات والرموز غير الضرورية
  const cleanPhone = phone.replace(/\D/g, '');
  
  // إضافة مفتاح الدولة إذا لم يكن موجوداً (افتراض الإمارات إذا بدأ بـ 05)
  let finalPhone = cleanPhone;
  if (finalPhone.startsWith('05')) {
    finalPhone = '971' + finalPhone.substring(1);
  } else if (!finalPhone.startsWith('971') && finalPhone.length === 9) {
    finalPhone = '971' + finalPhone;
  }

  const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export const getReminderTemplate = (officeName: string, clientName: string, reminderTitle: string, date: string) => {
  return `السلام عليكم سيد/ة ${clientName}،
نود تذكيركم بموعد: ${reminderTitle}
التاريخ: ${new Date(date).toLocaleDateString('ar-SA')}
مع تحيات ${officeName}`;
};
