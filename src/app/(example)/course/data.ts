export interface CourseData {
  id: string;
  title: string;
  thumbnail: string;
  lessons: string;
  progress: number;
}

export interface ReminderData {
  id: string;
  title: string;
  date: string;
  progress: number;
  completed: boolean;
}

export interface SubjectStrength {
  subject: string;
  score: number;
}

// Mock course data
export const continueCourses: CourseData[] = [
  {
    id: "1",
    title: "Introduction to Python Programming",
    thumbnail: "🐍",
    lessons: "7/12",
    progress: 58.3,
  },
  {
    id: "2",
    title: "Digital Marketing Fundamentals",
    thumbnail: "📱",
    lessons: "5/9",
    progress: 55.7,
  },
  {
    id: "3",
    title: "Data Science with R",
    thumbnail: "📊",
    lessons: "8/12",
    progress: 75,
  },
  {
    id: "4",
    title: "Graphic Design Essentials",
    thumbnail: "🎨",
    lessons: "10/12",
    progress: 83.3,
  },
];

// Reminders data
export const reminders: ReminderData[] = [
  {
    id: "1",
    title: "Introduction to Python Programming",
    date: "29 oct. 2025 12:00 am",
    progress: 58.3,
    completed: false,
  },
  {
    id: "2",
    title: "Digital Marketing Fundamentals",
    date: "29 oct. 2025 12:00 am",
    progress: 66.7,
    completed: false,
  },
  {
    id: "3",
    title: "Data Science with R",
    date: "29 oct. 2025 12:00 am",
    progress: 75,
    completed: false,
  },
  {
    id: "4",
    title: "Graphic Design Essentials",
    date: "29 oct. 2025 12:00 am",
    progress: 83.3,
    completed: true,
  },
];

// Subject strength data for radar chart
export const subjectStrengths: SubjectStrength[] = [
  { subject: "English", score: 85 },
  { subject: "Math", score: 70 },
  { subject: "History", score: 60 },
  { subject: "Physics", score: 75 },
  { subject: "Geography", score: 55 },
  { subject: "Chinese", score: 80 },
];

// Hours spent data (2018-2023)
export const hoursSpentData = [
  { year: "2018", hours: 30 },
  { year: "2019", hours: 65 },
  { year: "2020", hours: 70 },
  { year: "2021", hours: 90 },
  { year: "2022", hours: 85 },
  { year: "2023", hours: 40 },
];

// Course progress data
export interface CourseProgress {
  label: string;
  value: number;
  color: string;
}

export const courseProgress: CourseProgress[] = [
  { label: "To start", value: 30, color: "#6366F1" },
  { label: "In progress", value: 40, color: "#F59E0B" },
  { label: "Completed", value: 20, color: "#10B981" },
];
