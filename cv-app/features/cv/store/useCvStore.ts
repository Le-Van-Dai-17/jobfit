import { create } from "zustand";
import { CvData, ExperienceData, EducationData, SkillData } from "../schemas/cv.schema";

type LegacyCvData = Partial<CvData> & {
  education?: CvData["educations"];
};

interface CvStoreState {
  cvData: CvData;
  isDirty: boolean;
  
  // Actions
  setCvData: (data: LegacyCvData) => void;
  updatePersonalInfo: (data: Partial<CvData["personalInfo"]>) => void;
  
  // Array Operations
  addExperience: (exp: ExperienceData) => void;
  updateExperience: (id: string, data: Partial<ExperienceData>) => void;
  removeExperience: (id: string) => void;
  
  addEducation: (edu: EducationData) => void;
  updateEducation: (id: string, data: Partial<EducationData>) => void;
  removeEducation: (id: string) => void;
  
  addSkill: (skill: SkillData) => void;
  removeSkill: (id: string) => void;
  
  resetDirty: () => void;
}

const defaultCvData: CvData = {
  personalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  },
  experiences: [],
  educations: [],
  skills: [],
};

export function normalizeCvData(data: LegacyCvData): CvData {
  return {
    personalInfo: {
      ...defaultCvData.personalInfo,
      ...(data.personalInfo ?? {}),
    },
    experiences: data.experiences ?? [],
    educations: data.educations ?? data.education ?? [],
    skills: data.skills ?? [],
  };
}

export const useCvStore = create<CvStoreState>((set) => ({
  cvData: defaultCvData,
  isDirty: false,

  setCvData: (data) => set({ cvData: normalizeCvData(data), isDirty: false }),
  
  updatePersonalInfo: (data) => 
    set((state) => ({ 
      cvData: { ...state.cvData, personalInfo: { ...state.cvData.personalInfo, ...data } },
      isDirty: true
    })),

  addExperience: (exp) =>
    set((state) => ({
      cvData: { ...state.cvData, experiences: [...state.cvData.experiences, exp] },
      isDirty: true
    })),
    
  updateExperience: (id, data) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experiences: state.cvData.experiences.map((exp) => 
          exp.id === id ? { ...exp, ...data } : exp
        ),
      },
      isDirty: true
    })),

  removeExperience: (id) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experiences: state.cvData.experiences.filter((exp) => exp.id !== id),
      },
      isDirty: true
    })),

  addEducation: (edu) =>
    set((state) => ({
      cvData: { ...state.cvData, educations: [...state.cvData.educations, edu] },
      isDirty: true
    })),

  updateEducation: (id, data) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        educations: state.cvData.educations.map((edu) => 
          edu.id === id ? { ...edu, ...data } : edu
        ),
      },
      isDirty: true
    })),

  removeEducation: (id) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        educations: state.cvData.educations.filter((edu) => edu.id !== id),
      },
      isDirty: true
    })),

  addSkill: (skill) =>
    set((state) => ({
      cvData: { ...state.cvData, skills: [...state.cvData.skills, skill] },
      isDirty: true
    })),

  removeSkill: (id) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        skills: state.cvData.skills.filter((skill) => skill.id !== id),
      },
      isDirty: true
    })),

  resetDirty: () => set({ isDirty: false }),
}));
