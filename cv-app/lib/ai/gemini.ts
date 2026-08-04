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

// -----------------------------------------------------------------------------
// MOCK INTERVIEW FEATURES
// -----------------------------------------------------------------------------

export interface InterviewQuestionResult {
  questions: {
    id: string;
    questionText: string;
    expectedKeywords: string[];
    orderIndex: number;
  }[];
}

const interviewQuestionsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          questionText: { type: Type.STRING },
          expectedKeywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          orderIndex: { type: Type.INTEGER }
        },
        required: ["id", "questionText", "expectedKeywords", "orderIndex"]
      }
    }
  },
  required: ["questions"]
};

export async function generateInterviewQuestions(
  cvData: unknown,
  jobDescription: string
): Promise<InterviewQuestionResult> {
  const prompt = `
    You are an expert technical interviewer. I will give you a candidate's CV data (JSON) and a Job Description.
    Your task is to generate exactly 3 highly relevant interview questions.
    Question 1: A behavioral or culture-fit question based on their experience.
    Question 2: A technical or domain-specific question based on the Job Description and their skills.
    Question 3: A situational or problem-solving question combining their past experience and the new role.
    
    For each question, provide a list of "expectedKeywords" you would listen for in a good answer.
    Assign a unique string ID and orderIndex (1, 2, 3) to each question.

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
        responseSchema: interviewQuestionsSchema,
        temperature: 0.7,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as InterviewQuestionResult;
    }
    throw new Error("AI returned empty response");
  } catch (error) {
    console.error("Gemini Generate Questions failed:", error);
    throw error;
  }
}

export interface InterviewEvaluationResult {
  score: number; // 0-10
  feedback: string;
}

const interviewEvaluationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "Score from 0 to 10" },
    feedback: { type: Type.STRING, description: "Constructive feedback and correct approach" }
  },
  required: ["score", "feedback"]
};

export async function evaluateInterviewAnswer(
  questionText: string,
  expectedKeywords: string[],
  answerText: string
): Promise<InterviewEvaluationResult> {
  const prompt = `
    You are an expert technical interviewer evaluating a candidate's answer.
    
    ### Question asked:
    ${questionText}
    
    ### Expected concepts/keywords:
    ${expectedKeywords.join(", ")}
    
    ### Candidate's Answer:
    ${answerText}
    
    Evaluate the candidate's answer based on correctness, clarity, and whether they hit the expected concepts.
    Provide a score out of 10 and constructive feedback. If the score is low, explain what was missing.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: interviewEvaluationSchema,
        temperature: 0.2,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as InterviewEvaluationResult;
    }
    throw new Error("AI returned empty response");
  } catch (error) {
    console.error("Gemini Evaluation failed:", error);
    throw error;
  }
}
