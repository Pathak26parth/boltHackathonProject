export interface User {
  id: string;
  username: string;
  email: string;
  department: 'CSE' | 'ME' | 'CE' | 'EE' | 'ECE';
  role: 'admin' | 'faculty' | 'student';
  createdAt: Date;
  enrollmentNumber?: string;
  employeeId?: string;
  division?: 'A' | 'B' | 'C';
  semester?: number;
  isActive?: boolean;
  assignedSubjects?: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  semester: number;
  facultyId?: string;
  facultyName?: string;
  description?: string;
  isActive?: boolean;
}

export interface Timetable {
  id: string;
  day: string;
  time: string;
  subject: string;
  subjectName: string;
  faculty: string;
  facultyName: string;
  division: string;
  room: string;
  department: string;
  semester: number;
  duration?: number;
  isActive?: boolean;
}

export interface AttendanceRecord {
  id: string;
  student: string;
  studentName: string;
  enrollmentNumber: string;
  subject: string;
  subjectName: string;
  faculty: string;
  facultyName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  division: string;
  department: string;
  semester: number;
  sessionId: string;
  detectionConfidence?: number;
  remarks?: string;
  timestamp: Date;
}

export interface AttendanceSession {
  id: string;
  sessionId: string;
  subject: string;
  subjectName: string;
  faculty: string;
  facultyName: string;
  date: string;
  startTime: string;
  endTime?: string;
  division: string;
  department: string;
  semester: number;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  status: 'active' | 'completed' | 'cancelled';
  aiDetectionEnabled?: boolean;
  cameraFeed?: string;
}