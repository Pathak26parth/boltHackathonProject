import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getStudents: (params) => api.get('/users/students', { params }),
  getFaculty: (params) => api.get('/users/faculty', { params }),
  updateProfile: (data) => api.put('/users/profile', data),
  assignSubjects: (userId, subjectIds) => api.put(`/users/${userId}/assign-subjects`, { subjectIds }),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

// Subjects API
export const subjectsAPI = {
  getSubjects: (params) => api.get('/subjects', { params }),
  getMySubjects: () => api.get('/subjects/my-subjects'),
  createSubject: (data) => api.post('/subjects', data),
  updateSubject: (subjectId, data) => api.put(`/subjects/${subjectId}`, data),
  deleteSubject: (subjectId) => api.delete(`/subjects/${subjectId}`),
};

// Timetable API
export const timetableAPI = {
  getTimetable: (params) => api.get('/timetable', { params }),
  getMySchedule: () => api.get('/timetable/my-schedule'),
  createEntry: (data) => api.post('/timetable', data),
  updateEntry: (entryId, data) => api.put(`/timetable/${entryId}`, data),
  deleteEntry: (entryId) => api.delete(`/timetable/${entryId}`),
};

// Attendance API
export const attendanceAPI = {
  startSession: (data) => api.post('/attendance/session/start', data),
  endSession: (sessionId) => api.put(`/attendance/session/${sessionId}/end`),
  markAttendance: (data) => api.post('/attendance/mark', data),
  getStudentAttendance: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  getAttendanceReport: (params) => api.get('/attendance/report', { params }),
  getSessions: (params) => api.get('/attendance/sessions', { params }),
};

export default api;