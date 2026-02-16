
import { GoogleGenAI, Type } from "@google/genai";

// GUIDELINE FIX: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// GUIDELINE FIX: Create a new GoogleGenAI instance right before making an API call.

export const smartDataMapper = async (rawLegacyData: string) => {
  // Always initialize with named parameter apiKey from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `تحليل واستخراج بيانات الموكلين أو المعاملات المالية من النص التالي بتنسيق JSON.
      النص قد يكون كشف حساب بنكي (Account Statement) أو قائمة أسماء.
      إذا كان كشف حساب، استخرج المعاملات (Transactions) مع تحديد نوعها (INCOME للشحن/الإيداع و EXPENSE للرسوم/الضريبة/السحب).
      النص: "${rawLegacyData}"`,
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING, description: "اسم الموكل إذا وجد" },
              description: { type: Type.STRING, description: "وصف المعاملة" },
              amount: { type: Type.NUMBER, description: "المبلغ" },
              type: { type: Type.STRING, enum: ["INCOME", "EXPENSE"] },
              date: { type: Type.STRING, description: "التاريخ بتنسيق ISO" },
              phone: { type: Type.STRING },
              address: { type: Type.STRING }
            },
            required: ["description"]
          }
        }
      }
    });
    // Property .text is used directly (not a method)
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini smartDataMapper Error:", error);
    return null;
  }
};

export const deepLegalAnalysis = async (caseText: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `تحليل قانوني معمق للقضية: ${caseText}`,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text;
  } catch (e) {
    console.error("Gemini deepLegalAnalysis Error:", e);
    return "الخدمة غير متوفرة حالياً.";
  }
};

export const analyzeLegalImage = async (base64Data: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } }, 
          { text: "استخرج البيانات القانونية من هذه الصورة بتنسيق JSON يحتوي على documentType, summary, extractedName, idNumber, expiryDate." }
        ]
      },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Gemini analyzeLegalImage Error:", e);
    return null;
  }
};

export const parseDocumentContent = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `تحليل المستند واستخراج البيانات بتنسيق JSON (documentTitle, tags): ${text.substring(0, 5000)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Gemini parseDocumentContent Error:", e);
    return null;
  }
};

export const draftLegalDocument = async (templateName: string, clientData: any, notes: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `صياغة مستند قانوني (${templateName}) للموكل ${clientData.fullName}. ملاحظات: ${notes}`
    });
    return response.text;
  } catch (e) {
    console.error("Gemini draftLegalDocument Error:", e);
    return "الخدمة غير متوفرة.";
  }
};
