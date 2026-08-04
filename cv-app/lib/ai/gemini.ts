import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-build", 
});

export interface MatchAnalysisResult {
  overallScore: number;
  keywordMatch: number;
  experienceMatch: number;
  skillsMatch: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
}

const matchAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { 
      type: Type.INTEGER, 
      description: "Overall match score out of 100" 
    },
    keywordMatch: { 
      type: Type.INTEGER, 
      description: "Keyword match score out of 100" 
    },
    experienceMatch: { 
      type: Type.INTEGER, 
      description: "Experience match score out of 100" 
    },
    skillsMatch: { 
      type: Type.INTEGER, 
      description: "Skills match score out of 100" 
    },
    matchedKeywords: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Keywords from the JD that are present in the CV"
    },
    missingKeywords: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Important keywords from the JD that are missing in the CV"
    },
    recommendations: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Specific actionable advice to improve the CV for this JD"
    },
  },
  required: [
    "overallScore", 
    "keywordMatch", 
    "experienceMatch", 
    "skillsMatch", 
    "matchedKeywords", 
    "missingKeywords", 
    "recommendations"
  ],
};

export async function analyzeResumeMatch(
  resumeText: string, 
  jobDescription: string
): Promise<MatchAnalysisResult> {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) and senior technical recruiter.
    Analyze the provided CV against the provided Job Description.
    Extract key requirements from the JD and evaluate how well the CV meets them.
    Return a structured JSON object scoring the match.
    
    ### CV:
    ${resumeText}
    
    ### Job Description:
    ${jobDescription}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: matchAnalysisSchema,
        temperature: 0.2, // Low temperature for consistent formatting
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as MatchAnalysisResult;
    }
    
    throw new Error("AI returned empty response");
  } catch (error) {
    console.error("Gemini AI Analysis failed:", error);
    throw error;
  }
}

export interface OptimizationResult {
  improvedSummary: string;
  improvedExperiences: {
    id: string; // The original experience ID
    suggestedDescription: string;
  }[];
}

const optimizationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    improvedSummary: {
      type: Type.STRING,
      description: "A rewritten professional summary optimized for the JD"
    },
    improvedExperiences: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          suggestedDescription: { type: Type.STRING }
        },
        required: ["id", "suggestedDescription"]
      }
    }
  },
  required: ["improvedSummary", "improvedExperiences"]
};

export async function optimizeResume(
  cvData: unknown,
  jobDescription: string
): Promise<OptimizationResult> {
  const prompt = `
    You are an expert ATS copywriter. I will give you a candidate's CV data (JSON) and a Job Description.
    Your task is to rewrite the "summary" and the "description" of each item in "experiences" to better align with the Job Description.
    Ensure you use powerful action verbs, metrics where possible, and naturally integrate ATS keywords.
    
    ### CV Data:
    ${JSON.stringify(cvData, null, 2)}
    
    ### Job Description:
    ${jobDescription}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: optimizationSchema,
        temperature: 0.4,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as OptimizationResult;
    }
    
    throw new Error("AI returned empty response");
  } catch (error) {
    console.error("Gemini Optimization failed:", error);
    throw error;
  }
}
