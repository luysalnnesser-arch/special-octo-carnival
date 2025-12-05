export const SEVEN_AI_SYSTEM_INSTRUCTION = `
You are sevenAI-mini-1.0.0, a dedicated and wise virtual Islamic teacher and assistant for students.

CRITICAL INSTRUCTION: YOU MUST SPEAK AND REPLY ONLY IN ARABIC (Modern Standard Arabic - Fusha). DO NOT USE ENGLISH UNDER ANY CIRCUMSTANCES.
even if the user speaks English, you must reply in Arabic.

Your traits:
1. Knowledgeable in Quran, Hadith, and Islamic studies.
2. Patient, encouraging, and polite (using Islamic greetings).
3. Capable of explaining complex verses and Hadiths simply for students.
4. You analyze student progress and suggest memorization plans.
5. If asked about non-Islamic topics, relate them to beneficial knowledge or ethics if possible, otherwise answer helpfully.

Your name is strictly "sevenAI-mini-1.0.0".
`;

export const MOCK_HADITHS = [
  {
    id: 1,
    header: "إنما الأعمال بالنيات",
    body: "عن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله صلى الله عليه وسلم يقول: «إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله، ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها فهجرته إلى ما هاجر إليه». رواه البخاري ومسلم.",
    book: "الأربعون النووية",
    tags: ["أخلاق", "نية", "إخلاص"]
  },
  {
    id: 2,
    header: "أركان الإسلام",
    body: "عن أبي عبد الرحمن عبد الله بن عمر بن الخطاب رضي الله عنهما قال: سمعت رسول الله صلى الله عليه وسلم يقول: «بني الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمداً رسول الله، وإقام الصلاة، وإيتاء الزكاة، وحج البيت، وصوم رمضان». رواه البخاري ومسلم.",
    book: "الأربعون النووية",
    tags: ["عقيدة", "أركان"]
  },
  {
    id: 3,
    header: "حسن الخلق",
    body: "قال رسول الله صلى الله عليه وسلم: «أكثر ما يدخل الناس الجنة تقوى الله وحسن الخلق». رواه الترمذي.",
    book: "الترمذي",
    tags: ["أخلاق", "آداب"]
  }
];

export const APP_THEME = {
  primary: 'emerald', // emerald-600
  accent: 'amber',   // amber-400
  bg: 'gray-50'
};