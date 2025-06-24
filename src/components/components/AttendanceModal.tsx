import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Square, Users, Clock } from 'lucide-react';
import WebcamFeed from './WebcamFeed';
import StatusIndicator from './StatusIndicator';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: any;
  students: any[];
  onStopAttendance: (attendanceData: any[]) => void;
}

type DetectionStatus = 'processing' | 'taking attendance' | 'no one detected';

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  students,
  onStopAttendance
}) => {
  const [status, setStatus] = useState<DetectionStatus>('processing');
  const [detectedStudents, setDetectedStudents] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen && isRecording) {
      // Start session timer
      intervalRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);

      // Simulate face detection process
      simulateFaceDetection();
    }

    return () => {
      // Clean up all intervals on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isOpen, isRecording]);

  const simulateFaceDetection = () => {
    // Clear any existing detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Initial status update
    setTimeout(() => {
      setStatus('taking attendance');
    }, 1000);

    // Simulate periodic face detection
    detectionIntervalRef.current = setInterval(() => {
      if (!isRecording) {
        clearInterval(detectionIntervalRef.current as number);
        return;
      }

      // Randomly detect some students (simulation)
      const randomStudents = students
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);

      if (randomStudents.length > 0) {
        setStatus('taking attendance');
        
        // Add newly detected students
        setDetectedStudents(prev => {
          const newDetections = randomStudents.filter(student => 
            !prev.some(detected => detected.enrollmentNumber === student.enrollmentNumber)
          ).map(student => ({
            ...student,
            detectionTime: new Date(),
            confidence: Math.floor(Math.random() * 30) + 70 // 70-100% confidence
          }));
          
          return [...prev, ...newDetections];
        });
      } else {
        setStatus('no one detected');
      }
    }, 3000);
  };

  const handleStopAttendance = async () => {
    // Clear all intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    setIsRecording(false);
    setStatus('processing');

    // Prepare attendance data for MongoDB
    const attendanceData = detectedStudents.map(student => ({
      enrollmentNumber: student.enrollmentNumber,
      subject: currentSession.subjectId,
      subjectName: currentSession.subjectName || 'Unknown Subject',
      faculty: currentSession.facultyId,
      facultyName: currentSession.facultyName || 'Unknown Faculty',
      date: new Date(),
      status: 'present',
      division: currentSession.division,
      department: currentSession.department,
      semester: currentSession.semester,
      sessionId: currentSession.id,
      detectionConfidence: student.confidence,
      remarks: `Detected via AI with ${student.confidence}% confidence`
    }));

    // Add absent students
    const presentEnrollmentNumbers = detectedStudents.map(s => s.enrollmentNumber);
    const absentStudents = students
      .filter(student => !presentEnrollmentNumbers.includes(student.enrollmentNumber))
      .map(student => ({
        enrollmentNumber: student.enrollmentNumber,
        subject: currentSession.subjectId,
        subjectName: currentSession.subjectName || 'Unknown Subject',
        faculty: currentSession.facultyId,
        facultyName: currentSession.facultyName || 'Unknown Faculty',
        date: new Date(),
        status: 'absent',
        division: currentSession.division,
        department: currentSession.department,
        semester: currentSession.semester,
        sessionId: currentSession.id,
        detectionConfidence: 0,
        remarks: 'Not detected in camera feed'
      }));

    const allAttendanceData = [...attendanceData, ...absentStudents];

    // Call the parent function to handle API submission
    onStopAttendance(allAttendanceData);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Live Attendance Session</h2>
              <p className="text-sm text-gray-600">
                {currentSession?.subjectName} • Duration: {formatDuration(sessionDuration)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Status Indicator - Fixed */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex-shrink-0">
          <StatusIndicator status={status} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Camera Feed */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <WebcamFeed isRecording={isRecording} />
                  
                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span>LIVE</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Detected Students Panel */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Detected Students
                    </h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      {detectedStudents.length}
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {detectedStudents.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No students detected yet
                      </p>
                    ) : (
                      detectedStudents.map((student, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm text-gray-800">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {student.enrollmentNumber}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-green-600 font-medium">
                                {student.confidence}%
                              </p>
                              <p className="text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {student.detectionTime?.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Session Stats */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Session Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">Total Students:</span>
                      <span className="font-medium">{students.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Present:</span>
                      <span className="font-medium text-green-600">{detectedStudents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Absent:</span>
                      <span className="font-medium text-red-600">
                        {students.length - detectedStudents.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Attendance Rate:</span>
                      <span className="font-medium">
                        {students.length > 0 ? Math.round((detectedStudents.length / students.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stop Button - Fixed at bottom */}
        <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
          <div className="flex justify-center">
            <button
              onClick={handleStopAttendance}
              disabled={!isRecording}
              className="flex items-center justify-center px-8 py-4 bg-red-600 text-white font-semibold text-lg rounded-xl hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Square className="w-6 h-6 mr-3 fill-current" />
              {isRecording ? 'Stop Attendance Session' : 'Session Stopped'}
            </button>
          </div>
          {isRecording && (
            <p className="text-center text-sm text-gray-600 mt-3">
              Click to end the session and save attendance data
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;