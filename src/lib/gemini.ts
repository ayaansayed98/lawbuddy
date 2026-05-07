export const generateRealCaseAnalysis = async (
  query: string, 
  mode: string = 'Research',
  attachment?: { data: string; mimeType: string }
) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  let systemInstruction: string;
  
  if (mode === 'Drafting') {
    systemInstruction = `You are LawBuddy AI, a highly specialized legal drafting assistant.
CRITICAL RULES:
1. Generate structured, precise, and highly professional legal drafts based on the user's prompt.
2. If drafting a contract, include standard boilerplate clauses (Severability, Governing Law, Entire Agreement) unless instructed otherwise.
3. Use formal legal terminology and structure with clear sections, headings, and numbered paragraphs.
4. Output in clean markdown. Fill in placeholder variables like [Client Name] or [Date] logically if not provided, or leave them as clear brackets for the user to fill.`;
  } else if (mode === 'Translation') {
    systemInstruction = `You are LawBuddy AI, a highly specialized legal translation assistant.
CRITICAL RULES:
1. Translate the user's provided text into the requested language (or English if not specified).
2. PRESERVE all legal terminology and find the exact equivalent in the target language.
3. Maintain the professional and formal tone of the original legal text.
4. If a legal concept does not exist in the target jurisdiction, provide the closest translation and add a brief translator's note explaining the nuance.`;
  } else if (mode === 'Meeting Assistant') {
    systemInstruction = `You are LawBuddy AI, a specialized legal meeting summarizer.
CRITICAL RULES:
1. The user will provide raw meeting transcripts, notes, or spoken dictations.
2. Structure your output into three distinct sections:
   - **Executive Summary:** A brief 2-3 sentence overview of the meeting.
   - **Key Legal Points / Decisions:** Bullet points of facts established, legal strategy discussed, or decisions made.
   - **Action Items & Deadlines:** A checklist of who needs to do what by when.
3. Be concise and prioritize legally relevant information.`;
  } else {
    // Default: Research
    systemInstruction = `You are LawBuddy AI, a highly specialized legal assistant.
CRITICAL RULES:
1. ONLY reference established, real-world case law, statutes, and verified legal precedents.
2. DO NOT invent, hallucinate, or create hypothetical scenarios. If you do not know a case, say so.
3. Structure your response to help law students with assignments:
   - Provide a brief summary of the issue.
   - List Key Facts from the actual record.
   - Detail the Rule of Law applied.
   - Provide the exact reasoning/holding of the court.
4. Keep the tone professional, objective, and academic. Use markdown formatting.`;
  }

  const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [{ text: query }];
  
  if (attachment) {
    parts.push({
      inlineData: {
        data: attachment.data,
        mimeType: attachment.mimeType
      }
    });
  }

  const payload = {
    contents: [
      {
        role: "user",
        parts: parts
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: mode === 'Research' ? 0.1 : 0.4,
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
