
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * المحول الذكي لترحيل البيانات من الأنظمة القديمة
 */
export const smartDataMapper = async (rawLegacyData: string) => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `أنت خبير تقني في ترحيل البيانات القانونية لمكتب المستشار أحمد حلمي. 
      قم بتحليل النص التالي المستخرج من نظام قديم واستخراج قائمة بالموكلين في شكل JSON منظم. 
      حاول استنتاج الحقول (الاسم، الهاتف، البريد، العنوان، رقم الهوية، الجنسية) بدقة. 
      إذا كانت البيانات غير واضحة، حاول تخمين الحقل الأنسب.

      النص الخام: "${rawLegacyData}"`,
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              phone: { type: Type.STRING },
              email: { type: Type.STRING },
              address: { type: Type.STRING },
              idNumber: { type: Type.STRING },
              nationality: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["fullName"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Smart Mapping Error:", error);
    return null;
  }
};

/**
 * وضع التفكير العميق لتحليل القضايا القانونية المعقدة
 */
export const deepLegalAnalysis = async (caseText: string) => {
  const ai = getAiClient();
  if (!ai) return "خدمة الذكاء الاصطناعي غير متوفرة حالياً.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `أنت خبير قانوني في مكتب المستشار أحمد حلمي. قم بتحليل القضية التالية بعمق، واذكر الأسانيد القانونية المتوقعة، الثغرات المحتملة، ونسبة نجاح الدعوى بناءً على القوانين المعمول بها في الإمارات.
      
      نص القضية: "${caseText}"`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Deep Analysis Error:", error);
    return "حدث خطأ أثناء التحليل العميق.";
  }
};

/**
 * تحليل الصور (بطاقات هوية، مستندات) لاستخراج البيانات
 */
export const analyzeLegalImage = async (base64Data: string, mimeType: string) => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: "قم باستخراج كافة البيانات القانونية من هذه الصورة (مثل اسم الموكل، رقم الهوية، تاريخ الانتهاء، أو أي بيانات تخص قضية قانونية) وأرجعها في شكل JSON منظم بالعربية."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedName: { type: Type.STRING },
            idNumber: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
            summary: { type: Type.STRING },
            documentType: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return null;
  }
};

export const parseDocumentContent = async (text: string) => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قم بتحليل نص المستند القانوني التالي واستخراج البيانات المنظمة باللغة العربية.
      إذا وجدت اسم موكل، استخرجه.
      إذا وجدت رقم قضية، استخرجه.
      اقترح عنواناً مختصراً للمستند.
      اقترح 3 وسوم (Tags) لتصنيف المستند.
      
      النص: "${text.substring(0, 5000)}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedClientName: { type: Type.STRING },
            suggestedCaseNumber: { type: Type.STRING },
            documentTitle: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return null;
  }
};

export const generateCaseSummary = async (caseDetails: string, notes: string[]) => {
  const ai = getAiClient();
  if (!ai) return "خدمة الذكاء الاصطناعي غير متوفرة";

  try {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `قم بتلخيص الوضع الحالي والنقاط الرئيسية لهذه القضية القانونية لمكتب المستشار أحمد حلمي. اجعل الرد احترافياً وموجزاً باللغة العربية.
        
        التفاصيل: ${caseDetails}
        الملاحظات: ${notes.join("; ")}`
    });
    return response.text;
  } catch (e) {
    return "تعذر إنشاء الملخص.";
  }
}

export const draftLegalDocument = async (templateName: string, clientData: any, additionalNotes: string) => {
  const ai = getAiClient();
  if (!ai) return "خدمة الذكاء الاصطناعي غير متوفرة حالياً.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `أنت خبير قانوني في مكتب المستشار أحمد حلمي. قم بصياغة مستند قانوني احترافي من نوع (${templateName}) بناءً على البيانات التالية:
      اسم الموكل: ${clientData.fullName}
      الجنسية: ${clientData.nationality || 'غير محدد'}
      رقم الهوية: ${clientData.idNumber || 'غير محدد'}
      العنوان: ${clientData.address || 'غير محدد'}
      ملاحظات إضافية: ${additionalNotes}
      
      يجب أن يكون النص رسمياً، دقيقاً قانونياً، وباللغة العربية الفصحى.`
    });
    return response.text;
  } catch (error) {
    console.error("Drafting Error:", error);
    return "حدث خطأ أثناء صياغة المستند.";
  }
};
