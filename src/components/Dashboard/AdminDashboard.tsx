import React, { useState, useEffect } from 'react';
import { Settings, Users, BookOpen, Calendar, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
//@ts-ignore
import { subjectsAPI, timetableAPI, usersAPI } from '../../services/api';
import { Subject, Timetable, User } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('timetable');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTimetable, setShowAddTimetable] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    department: '',
    credits: 3,
    semester: 1,
    facultyId: '',
    description: ''
  });

  const [newTimetableEntry, setNewTimetableEntry] = useState({
    day: '',
    time: '',
    subject: '',
    faculty: '',
    division: '',
    room: '',
    department: '',
    semester: 1
  });

  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjects();
      fetchFaculty();
    } else if (activeTab === 'timetable') {
      fetchTimetable();
      fetchSubjects();
      fetchFaculty();
    } else if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectsAPI.getSubjects();
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await timetableAPI.getTimetable();
      setTimetable(response.data.timetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await usersAPI.getFaculty();
      setFaculty(response.data.faculty);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getStudents();
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await subjectsAPI.createSubject(newSubject);
      setNewSubject({ 
        name: '', 
        code: '', 
        department: '', 
        credits: 3, 
        semester: 1, 
        facultyId: '', 
        description: '' 
      });
      setShowAddSubject(false);
      fetchSubjects();
    } catch (error) {
      console.error('Error creating subject:', error);
      alert('Error creating subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimetableEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await timetableAPI.createEntry(newTimetableEntry);
      setNewTimetableEntry({ 
        day: '', 
        time: '', 
        subject: '', 
        faculty: '', 
        division: '', 
        room: '', 
        department: '', 
        semester: 1 
      });
      setShowAddTimetable(false);
      fetchTimetable();
    } catch (error) {
      console.error('Error creating timetable entry:', error);
      alert('Error creating timetable entry. Please check for conflicts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectsAPI.deleteSubject(subjectId);
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Error deleting subject. Please try again.');
      }
    }
  };

  const handleDeleteTimetableEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await timetableAPI.deleteEntry(entryId);
        fetchTimetable();
      } catch (error) {
        console.error('Error deleting timetable entry:', error);
        alert('Error deleting timetable entry. Please try again.');
      }
    }
  };

  const tabs = [
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.username}</p>
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
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50'
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
          {activeTab === 'timetable' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Timetable Management</h2>
                <button
                  onClick={() => setShowAddTimetable(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </button>
              </div>

              {showAddTimetable && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
                  <form onSubmit={handleAddTimetableEntry} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                      <select
                        value={newTimetableEntry.day}
                        onChange={(e) => setNewTimetableEntry({...newTimetableEntry, day: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        value={newTimetableEntry.time}
                        onChange={(e) => setNewTimetableEntry({...newTimetableEntry, time: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <select
                        value={newTimetableEntry.subject}
                        onChange={(e) => setNewTimetableEntry({...newTimetableEntry, subject: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                      <select
                        value={newTimetableEntry.faculty}
                        onChange={(e) => setNewTimetableEntry({...newTimetableEntry, faculty: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Faculty</option>
                        {faculty.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            {fac.username} ({fac.department})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        value={newTimetableEntry.department}
                        onChange={(e) => setNewTimetableEntry({...newTimetableEntry, department: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Department</option>
                        <option value="CSE">CSE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="EE">EE</option>
                        <option value="ECE">ECE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                      <select
                        value={newTimetableEntry.semester}
                        onChange={(e) => setNewTimetableEntry({...newTimetableEntry, semester: parseInt(e.target.value)})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {[1,2,3,4,5,6,7,8].map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                      <select
                        value={newTimetableEntry.division}
                        onChange={(e) => setNewTimetableEntry({...newTimetableEntry, division: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Division</option>
                        <option value="A">Division A</option>
                        <option value="B">Division B</option>
                        <option value="C">Division C</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                      <input
                        type="text"
                        value={newTimetableEntry.room}
                        onChange={(e) => setNewTimetableEntry({...newTimetableEntry, room: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Room number"
                      />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : 'Add Entry'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddTimetable(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timetable.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.day}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.subjectName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.facultyName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.division}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.room}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleDeleteTimetableEntry(entry.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Subject Management</h2>
                <button
                  onClick={() => setShowAddSubject(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </button>
              </div>

              {showAddSubject && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
                  <form onSubmit={handleAddSubject} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                      <input
                        type="text"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Subject name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code</label>
                      <input
                        type="text"
                        value={newSubject.code}
                        onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Subject code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        value={newSubject.department}
                        onChange={(e) => setNewSubject({...newSubject, department: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Department</option>
                        <option value="CSE">CSE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="EE">EE</option>
                        <option value="ECE">ECE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                      <select
                        value={newSubject.semester}
                        onChange={(e) => setNewSubject({...newSubject, semester: parseInt(e.target.value)})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {[1,2,3,4,5,6,7,8].map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                      <input
                        type="number"
                        value={newSubject.credits}
                        onChange={(e) => setNewSubject({...newSubject, credits: parseInt(e.target.value)})}
                        required
                        min="1"
                        max="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Faculty</label>
                      <select
                        value={newSubject.facultyId}
                        onChange={(e) => setNewSubject({...newSubject, facultyId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Faculty (Optional)</option>
                        {faculty.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            {fac.username} ({fac.department})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={newSubject.description}
                        onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Subject description (optional)"
                        rows={3}
                      />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : 'Add Subject'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddSubject(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                  <div key={subject.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-600">{subject.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {subject.credits} Credits
                        </span>
                        <button
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Department:</span> {subject.department}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Semester:</span> {subject.semester}
                      </p>
                      {subject.facultyName && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Faculty:</span> {subject.facultyName}
                        </p>
                      )}
                      {subject.description && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Description:</span> {subject.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Student Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.enrollmentNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.division}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
                <p className="text-gray-600">System configuration options will be available here.</p>
                <p className="text-sm text-gray-500 mt-2">This section will include system preferences, security settings, and integration options.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};