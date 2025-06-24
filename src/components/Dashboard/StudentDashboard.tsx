import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Calendar, Award, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI } from '../../services/api';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Pie } from 'recharts';

interface AttendanceData {
  subject: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: 'excellent' | 'good' | 'bad';
}

interface AttendanceStats {
  subjectName: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: string;
  status: string;
}

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAttendanceData();
    }
  }, [user]);

  const fetchAttendanceData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await attendanceAPI.getStudentAttendance(user.id);
      const { statistics } = response.data;
      
      // Transform statistics to match the expected format
      const transformedData: AttendanceData[] = statistics.map((stat: AttendanceStats) => ({
        subject: stat.subjectName,
        subjectName: stat.subjectName,
        totalClasses: stat.total,
        attendedClasses: stat.present + stat.late,
        percentage: parseFloat(stat.percentage),
        status: stat.status as 'excellent' | 'good' | 'bad'
      }));
      
      setAttendanceData(transformedData);
      setAttendanceData(transformedData);
    } catch (error) {
      // Use mock data if API fails
      setAttendanceData([
        {
          subject: 'Data Structures and Algorithms',
          subjectName: 'Data Structures and Algorithms',
          totalClasses: 45,
          attendedClasses: 42,
          percentage: 93.3,
          status: 'excellent'
        },
        {
          subject: 'Database Management Systems',
          subjectName: 'Database Management Systems',
          totalClasses: 40,
          attendedClasses: 32,
          percentage: 80.0,
          status: 'good'
        },
        {
          subject: 'Operating Systems',
          subjectName: 'Operating Systems',
          totalClasses: 38,
          attendedClasses: 25,
          percentage: 65.8,
          status: 'bad'
        },
        {
          subject: 'Computer Networks',
          subjectName: 'Computer Networks',
          totalClasses: 42,
          attendedClasses: 38,
          percentage: 90.5,
          status: 'excellent'
        },
        {
          subject: 'Software Engineering',
          subjectName: 'Software Engineering',
          totalClasses: 35,
          attendedClasses: 28,
          percentage: 80.0,
          status: 'good'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const monthlyData = [
    { month: 'Jan', attendance: 85 },
    { month: 'Feb', attendance: 78 },
    { month: 'Mar', attendance: 92 },
    { month: 'Apr', attendance: 88 },
    { month: 'May', attendance: 82 },
  ];

  const pieData = [
    { name: 'Present', value: attendanceData.reduce((sum, item) => sum + item.attendedClasses, 0), color: '#10B981' },
    { name: 'Absent', value: attendanceData.reduce((sum, item) => sum + (item.totalClasses - item.attendedClasses), 0), color: '#EF4444' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'bad': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'bad': return 'Needs Improvement';
      default: return 'Unknown';
    }
  };

const overallAttendance = attendanceData.length > 0
  ? attendanceData.reduce((sum, item) => sum + item.percentage, 0) / attendanceData.length
  : 0;


  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'subjects', label: 'Subject Wise', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.username}</p>
            {user?.enrollmentNumber && (
              <p className="text-sm text-gray-500">Enrollment: {user.enrollmentNumber}</p>
            )}
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
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-purple-50'
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading attendance data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Overview</h2>
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Overall Attendance</p>
                          <p className="text-2xl font-bold text-gray-900">{overallAttendance.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                          <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Total Subjects</p>
                          <p className="text-2xl font-bold text-gray-900">{attendanceData.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Classes Attended</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {attendanceData.reduce((sum, item) => sum + item.attendedClasses, 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                      <div className="flex items-center">
                        <div className="bg-orange-100 p-3 rounded-full">
                          <Award className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="text-lg font-bold text-gray-900">
                            {overallAttendance >= 90 ? 'Excellent' : overallAttendance >= 75 ? 'Good' : 'Needs Improvement'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center space-x-6 mt-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Present</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">Absent</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="attendance" stroke="#8B5CF6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'subjects' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Subject-wise Attendance</h2>
                  <div className="space-y-4">
                    {attendanceData.map((subject, index) => (
                      <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{subject.subjectName}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subject.status)}`}>
                            {getStatusText(subject.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{subject.attendedClasses}</p>
                            <p className="text-sm text-gray-600">Attended</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{subject.totalClasses}</p>
                            <p className="text-sm text-gray-600">Total Classes</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{subject.percentage.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">Percentage</p>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              subject.percentage >= 90 ? 'bg-green-500' : 
                              subject.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${subject.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Analytics</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={attendanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="percentage" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-green-800 font-medium">Excellent Performance</span>
                          <span className="text-green-600 font-bold">
                            {attendanceData.filter(item => item.status === 'excellent').length} subjects
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                          <span className="text-yellow-800 font-medium">Good Performance</span>
                          <span className="text-yellow-600 font-bold">
                            {attendanceData.filter(item => item.status === 'good').length} subjects
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-red-800 font-medium">Needs Improvement</span>
                          <span className="text-red-600 font-bold">
                            {attendanceData.filter(item => item.status === 'bad').length} subjects
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {attendanceData
                        .filter(subject => subject.percentage < 75)
                        .map((subject, index) => (
                          <div key={index} className="flex items-start p-4 bg-orange-50 rounded-lg">
                            <Award className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium text-orange-900">
                                Improve attendance in {subject.subjectName}
                              </p>
                              <p className="text-sm text-orange-700">
                                Current: {subject.percentage.toFixed(1)}% - Need to attend more classes to reach 75% minimum
                              </p>
                            </div>
                          </div>
                        ))}
                      {attendanceData.every(subject => subject.percentage >= 75) && (
                        <div className="flex items-start p-4 bg-green-50 rounded-lg">
                          <Award className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-900">Great job!</p>
                            <p className="text-sm text-green-700">
                              You're maintaining good attendance across all subjects. Keep it up!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};