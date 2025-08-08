export type Profession = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

export type Role = {
  id: number;
  title: string;
  professionId: number;
  description?: string;
  requiredSkills?: string[]; // still used for display if needed
  skills: string[]; // for filtering
  companies?: string[];
  salaryRange?: string; // optional display format (e.g., "$70k–$100k")
  salary: number;       // normalized value used for filtering/sorting
  educationLevel: "High School" | "Bachelor" | "Master" | "PhD";
  popularity: number;   // 1–10 scale for sorting
};

export interface Opportunity {
  id?: number;
  title: string;
  description: string;
  user_id: string;
  mentor_name?: string;
  mentor_title?: string;
  format?: string;
  duration?: string;
  date?: string;
  location?: string;
  requirements?: string;
  created_at?: string;
};

export interface Mentor {
  id?: number;
  user_id: string;
  name: string;
  bio?: string;
  photo_url?: string;
  specialties?: string[];
  skills?: string[];
  location?: string;
  created_at?: string;
};

export interface ShadowSession {
  id: number;
  date_time: string;
  user_id: string;
  opportunity_id: number;
  opportunities?: {
    title: string;
  };

}

