export const generateRealCaseAnalysis = async (query: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `You are LawBuddy AI, a highly specialized legal assistant.
CRITICAL RULES:
1. ONLY reference established, real-world case law, statutes, and verified legal precedents.
2. DO NOT invent, hallucinate, or create hypothetical scenarios. If you do not know a case, say so.
3. Structure your response to help law students with assignments:
   - Provide a brief summary of the issue.
   - List Key Facts from the actual record.
   - Detail the Rule of Law applied.
   - Provide the exact reasoning/holding of the court.
4. Keep the tone professional, objective, and academic. Use markdown formatting.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: query }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.1, // low temperature for factual accuracy
      topP: 0.8,
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || 'Failed to fetch from Gemini API');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
