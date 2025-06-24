import React, { useState, useEffect } from 'react';
import { BookOpen, Camera, FileText, Calendar, Users, Play, Download, StopCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subjectsAPI, attendanceAPI, usersAPI } from '../../services/api';
import { Subject, User } from '../../types';
import AttendanceModal from '../components/AttendanceModal';


interface AttendanceSession {
  sessionId: string;
  id: string;
  subject: string;
  subjectName: string;
  division: string;
  totalStudents: number;
  presentStudents: number;
  status: string;
  startTime: string;
}

interface DetectedStudent {
  enrollmentNumber: string;
  name: string;
  confidence?: number;
}


export const FacultyDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('subjects');
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(false);
const [detectedStudents, setDetectedStudents] = useState<DetectedStudent[]>([]);
  const [recognizedStudents, setRecognizedStudents] = useState(0);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);


  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchAssignedSubjects();
    } else if (activeTab === 'attendance') {
      fetchAssignedSubjects();
    }
  }, [activeTab]);

  const fetchAssignedSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectsAPI.getMySubjects();
      console.log('Assigned Subjects:', response);
      setAssignedSubjects(response.data.subjects);
      console.log('Assigned Subjects Data: hameha', response.data);
    } catch (error) {
      console.error('Error fetching assigned subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (department: string, division: string, semester: number) => {
    try {
      const response = await usersAPI.getStudents({ department, division, semester });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStartAttendance = async (subjectId : string) => {
    const subject = assignedSubjects.find(s => s.id === subjectId);
if (!subject) {
    console.error('Subject not found');
    
  }
    try {
      setLoading(true);
      console.log('yehi hai subject id :', subject?.subjectId);
      
      // For demo purposes, we'll use default values
      const sessionData = {
        subjectId: subject?.subjectId,
        division:subject.division, // You might want to make this selectable
        department: subject.department,
        semester: subject.semester
      };
      console.log('Session Data:', sessionData);

      const response = await attendanceAPI.startSession(sessionData);
      console.log('Full response:', response);

      setCurrentSession(response.data.session);
      setSelectedSubject(subject.id);
      setIsAttendanceMode(true);
      setShowAttendanceModal(true);


      
      // Fetch students for this session
      await fetchStudents(subject?.department, subject.division, subject.semester);
      
      // Simulate AI detection progress
      simulateAIDetection();
    } catch (error) {
      console.error('Error starting attendance session:', error);
      alert('Error starting attendance session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStopAttendance = async () => {
  if (!currentSession) return;

  try {
    setLoading(true);

    const presentEnrollmentNumbers = detectedStudents.map(s => s.enrollmentNumber);

const presentStudents = detectedStudents.map(student => ({
  studentName: student.name,
  enrollmentNumber: student.enrollmentNumber,
  subject: currentSession.subject,        // from session
  subjectName: currentSession.subjectName,
  faculty: user.id,                       // from auth context
  facultyName: user.username,
  date: new Date(),
  status: 'present',
  division: currentSession.division,
  department: currentSession.department,
  semester: currentSession.semester,
  sessionId: currentSession.sessionId,
  detectionConfidence: student.confidence || 0,
}));

const absentStudents = students
  .filter(student => !presentEnrollmentNumbers.includes(student.enrollmentNumber))
  .map(student => ({
    studentName: student.name,
    enrollmentNumber: student.enrollmentNumber,
    subject: currentSession.subject,
    subjectName: currentSession.subjectName,
    faculty: user.id,
    facultyName: user.username,
    date: new Date(),
    status: 'absent',
    division: currentSession.division,
    department: currentSession.department,
    semester: currentSession.semester,
    sessionId: currentSession.sessionId,
    detectionConfidence: 0,
  }));

const attendanceData = [...presentStudents, ...absentStudents];

await attendanceAPI.markAttendance(attendanceData);


    // 2️⃣ End session
    const endRes = await attendanceAPI.endSession(currentSession.sessionId);
    console.log('Session ended:', endRes.data);

    // 3️⃣ Reset UI state
    setIsAttendanceMode(false);
    setCurrentSession(null);
    setSelectedSubject('');
    setDetectedStudents([]);
    setRecognizedStudents(0);
  } catch (error) {
    console.error('Failed to stop attendance session:', error);
    alert('Something went wrong!');
  } finally {
    setLoading(false);
  }
};


  const simulateAIDetection = () => {
    // Simulate progressive face detection and recognition
    let detected = 0;
    let recognized = 0;
    
    const detectionInterval = setInterval(() => {
      if (detected < students.length) {
        detected += Math.floor(Math.random() * 3) + 1;
        setDetectedStudents(Math.min(detected, students.length));
      }
      
      if (detected > 5 && recognized < detected - 2) {
        recognized += Math.floor(Math.random() * 2) + 1;
        setRecognizedStudents(Math.min(recognized, detected - 2));
      }
      
      if (detected >= students.length && recognized >= detected - 4) {
        clearInterval(detectionInterval);
      }
    }, 2000);
  };

  const tabs = [
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: Camera },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const handleCloseModal = () => {
    setShowAttendanceModal(false);
    setIsAttendanceMode(false);
    setSelectedSubject('');
    setCurrentSession(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
            <p className="text-gray-600">Welcome back, Prof. {user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-sm min-h-screen border-r border-gray-200 p-6">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-green-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'subjects' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Assigned Subjects</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading subjects...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {assignedSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                    >
                      
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{subject.subjectName}</h3>
                          <p className="text-sm text-gray-600">{subject.code}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {subject.credits} Credits
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {subject.department} - Semester {subject.semester}
                        </div>
                        {subject.description && (
                          <p className="text-sm text-gray-600">{subject.description}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartAttendance(subject.id)}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Take Attendance
                        </button>
                        <button className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors duration-200">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <AttendanceModal
                    isOpen={showAttendanceModal}
                    onClose={handleCloseModal}
                    currentSession={currentSession}
                    students={students}
                    onStopAttendance={handleStopAttendance}
                  />
                </div>
      )}
      </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Attendance Management</h2>
                {!isAttendanceMode && (
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Subject</option>
                    {assignedSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} - {subject.code}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {isAttendanceMode ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Attendance in Progress</h3>
                    <p className="text-gray-600">Camera feed connected - Face recognition active</p>
                    {currentSession && (
                      <p className="text-sm text-gray-500 mt-2">
                        Session: {currentSession.subjectName} - Division {currentSession.division}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-900 rounded-lg aspect-video mb-6 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Live Camera Feed</p>
                      <p className="text-sm opacity-75">AI is detecting and recognizing student faces</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{detectedStudents}</div>
                      <div className="text-sm text-gray-600">Detected</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{recognizedStudents}</div>
                      <div className="text-sm text-gray-600">Recognized</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{detectedStudents - recognizedStudents}</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                  </div>

                 
                </div>
                // start attendance 
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Subject to Begin</h3>
                    <p className="text-gray-600 mb-6">Choose a subject from the dropdown above to start taking attendance using AI-powered face recognition.</p>
                    {selectedSubject && (
                      <button
                        onClick={() => handleStartAttendance(selectedSubject)}
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {loading ? 'Starting...' : 'Start Attendance Session'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Reports</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Subject Report</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="">Select Subject</option>
                        {assignedSubjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} - {subject.code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel Report
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Date Report</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Division (Optional)</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="">All Divisions</option>
                        <option value="A">Division A</option>
                        <option value="B">Division B</option>
                        <option value="C">Division C</option>
                      </select>
                    </div>
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel Report
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance Sessions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Data Structures and Algorithms</h4>
                      <p className="text-sm text-gray-600">Today, 10:30 AM - 28/45 students present</p>
                    </div>
                    <button className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Completed
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Database Management Systems</h4>
                      <p className="text-sm text-gray-600">Yesterday, 2:00 PM - 39/42 students present</p>
                    </div>
                    <button className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Completed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};