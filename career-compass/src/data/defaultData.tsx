import type { Profession, Role } from "../types/types";

export const defaultData: {
  professions: Profession[];
  roles: Role[];
} = {
  professions: [
    {
      id: 1,
      name: "Data Science",
      description: "Analyze data to extract insights and build models.",
      imageUrl: "/images/data-science.png",
    },
    {
      id: 2,
      name: "UX Research",
      description: "Study user behavior to improve product experience.",
      imageUrl: "/images/ux-research.png",
    },
  ],
  roles: [
    {
      id: 101,
      title: "Data Analyst",
      professionId: 1,
      description: "Use data to drive business decisions through reporting and analysis.",
      requiredSkills: ["SQL", "Excel", "Data Visualization", "Python"],
      skills: ["SQL", "Excel", "Data Visualization", "Python"],
      companies: ["Google", "Airbnb", "Spotify"],
      salaryRange: "$70,000 - $100,000",
      salary: 85000,
      educationLevel: "Bachelor",
      popularity: 8
    },
    {
      id: 102,
      title: "ML Engineer",
      professionId: 1,
      description: "Build and deploy machine learning systems.",
      requiredSkills: ["Python", "TensorFlow", "Data Pipelines"],
      skills: ["Python", "TensorFlow", "Data Pipelines"],
      companies: ["Meta", "Tesla", "Amazon"],
      salaryRange: "$110,000 - $160,000",
      salary: 135000,
      educationLevel: "Master",
      popularity: 9
    },
    {
      id: 201,
      title: "User Researcher",
      professionId: 2,
      description: "Understand user behavior and inform product design.",
      requiredSkills: ["User Interviews", "Surveys", "Data Synthesis"],
      skills: ["User Interviews", "Surveys", "Data Synthesis"],
      companies: ["Adobe", "Figma", "LinkedIn"],
      salaryRange: "$80,000 - $120,000",
      salary: 100000,
      educationLevel: "Bachelor",
      popularity: 7
    }
  ]
};