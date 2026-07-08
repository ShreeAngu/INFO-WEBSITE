export type ProjectStatus = 'In Progress' | 'Completed' | 'On Hold';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export interface Project {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  techStack: string[];
  status: ProjectStatus;
  githubUrl?: string;
  liveUrl?: string;
  challenges?: string;
  learnings?: string;
  createdAt: string;
}

export interface Experiment {
  id: string;
  title: string;
  goal: string;
  whatITried: string;
  whyItFailed: string;
  lessonsLearned: string;
  futureImprovements?: string;
  date: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  description: string;
  techUsed: string[];
  problemsFaced: string;
  solutions: string;
  tasksCompleted: string[];
  keyLearnings: string;
  nextSteps: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string;
  progress: number;
  category: 'Today' | 'Tomorrow' | 'This Week' | 'Later';
  notes?: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Programming' | 'AI/ML' | 'Frameworks' | 'Cloud' | 'Databases' | 'Tools';
  proficiency: number; // 0-100
}

export interface TimelineEvent {
  id: string;
  title: string;
  type: 'Education' | 'Project' | 'Internship' | 'Certification' | 'Achievement';
  date: string;
  description: string;
}

export interface AboutInfo {
  bio: string;
  currentFocus: string;
  goals: string;
  interests: string[];
  favoriteTech: string[];
}

export interface DashboardData {
  projects: Project[];
  experiments: Experiment[];
  journal: JournalEntry[];
  tasks: Task[];
  skills: Skill[];
  timeline: TimelineEvent[];
  about: AboutInfo;
}
