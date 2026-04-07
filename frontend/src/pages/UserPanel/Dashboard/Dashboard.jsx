import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, ChevronRight, LayoutDashboard, GraduationCap, 
  Zap, Trophy, Star, ArrowUpRight, Lock, Eye, EyeOff, 
  ShieldCheck, Clock, Calendar, Bell, User, Search,
  Settings, LogOut, MessageCircle, Flame, CheckCircle2
} from 'lucide-react';
import api from '../../../api/axios';

const Dashboard = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Состояния для безопасности/настроек
  const [passLoading, setPassLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await api.get('/my-courses');
        setCourses(response.data);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  // Фильтрация курсов для вкладки Library
  const filteredCourses = useMemo(() => {
    return courses.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.new_password_confirmation) {
        alert("Passwords do not match!");
        return;
    }
    setPassLoading(true);
    try {
      await api.post('/user/change-password', passwords);
      alert('Password updated successfully');
      setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      alert('Error updating password. Check your current password.');
    } finally {
      setPassLoading(false);
    }
  };

  const calculateTotalProgress = (data) => {
    if (data.length === 0) return 0;
    const total = data.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0);
    return Math.round(total / data.length);
  };

  if (loading) return <LoadingSkeleton />;

  const totalProgress = calculateTotalProgress(courses);

  return (
    <div className="h-full overflow-y-auto bg-white custom-scrollbar selection:bg-blue-100 selection:text-blue-700">
      <div className="max-w-[1440px] mx-auto p-6 md:p-10 space-y-10">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 pb-10">
          <div className="flex items-center gap-6">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <User size={28} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                 <Flame size={14} fill="currentColor" />
                 <span className="text-[10px] font-black uppercase tracking-widest">7 Day Learning Streak</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, Yelnur</h1>
              <p className="text-slate-400 text-sm font-medium">You're in the top 5% of students this month.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
             <nav className="flex items-center p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-100">
                {['overview', 'courses', 'settings'].map((id) => (
                  <button 
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
                      activeTab === id ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {id === 'courses' ? `Library (${courses.length})` : id}
                  </button>
                ))}
             </nav>
             <button className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={20} />
             </button>
          </div>
        </header>

        {activeTab === 'settings' ? (
          <SettingsSection 
            passwords={passwords} 
            setPasswords={setPasswords} 
            handlePasswordChange={handlePasswordChange}
            passLoading={passLoading}
            showPasswords={showPasswords}
            setShowPasswords={setShowPasswords}
          />
        ) : (
          <div className="space-y-12 animate-in fade-in duration-700">
            
            {/* --- TOP STATS --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard title="Total Progress" value={`${totalProgress}%`} icon={<Zap size={20} />} color="text-blue-600" bg="bg-blue-50" />
               <StatCard title="Active Courses" value={courses.length} icon={<BookOpen size={20} />} color="text-orange-500" bg="bg-orange-50" />
               <StatCard title="Certificates" value="2" icon={<Trophy size={20} />} color="text-emerald-500" bg="bg-emerald-50" />
               <StatCard title="Next Milestone" value="80%" icon={<Star size={20} />} color="text-purple-600" bg="bg-purple-50" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* --- MAIN AREA --- */}
              <div className="lg:col-span-8 space-y-12">
                {activeTab === 'overview' ? (
                  <>
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                         <SectionHeader title="Jump Back In" />
                         <span className="text-[10px] font-bold text-slate-300">Last activity: Today, 10:45 AM</span>
                      </div>
                      {courses.length > 0 ? (
                        <ActiveCourseHero course={courses[0]} />
                      ) : (
                        <EmptyState />
                      )}
                    </section>

                    <section className="space-y-6">
                      <SectionHeader title="Learning Productivity" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <ActivityHeatmap />
                         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Focus Mode Tips</p>
                            <div className="space-y-4">
                               <div className="flex items-start gap-4">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                  <p className="text-xs font-medium text-slate-600 leading-relaxed">Turn off notifications for the next 25 minutes to increase retention.</p>
                               </div>
                               <div className="flex items-start gap-4">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                  <p className="text-xs font-medium text-slate-600 leading-relaxed">You learn best in the morning. Try scheduling your next lesson for 9 AM.</p>
                               </div>
                            </div>
                            <button className="w-full py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                               View Personal Insights
                            </button>
                         </div>
                      </div>
                    </section>
                  </>
                ) : (
                  <section className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <SectionHeader title="My Full Library" />
                       <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                          <input 
                            type="text" 
                            placeholder="Search in your library..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 w-full md:w-64 transition-all outline-none"
                          />
                       </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-2 overflow-hidden shadow-sm">
                       {filteredCourses.length > 0 ? (
                         filteredCourses.map(course => <CourseRowItem key={course.id} course={course} />)
                       ) : (
                         <div className="p-20 text-center text-slate-400 font-medium italic">No courses matching your search...</div>
                       )}
                    </div>
                  </section>
                )}
              </div>

              {/* --- SIDEBAR --- */}
              <aside className="lg:col-span-4 space-y-10">
                 <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000 text-white">
                       <MessageCircle size={140} />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                          <MessageCircle size={24} className="text-blue-400" />
                       </div>
                       <h3 className="text-2xl font-black leading-tight tracking-tight">Need help with code?</h3>
                       <p className="text-slate-400 text-xs font-medium leading-relaxed">Our mentors are online and ready to review your module progress.</p>
                       <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:shadow-xl transition-all">
                          Open Support Ticket
                       </button>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <SectionHeader title="Your Badges" />
                    <div className="grid grid-cols-4 gap-4">
                       {[1, 2, 3, 4].map(i => (
                         <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center border-2 transition-all cursor-help ${i < 4 ? 'bg-slate-50 border-slate-100 text-slate-900 hover:scale-110' : 'border-dashed border-slate-200 text-slate-200'}`}>
                            {i < 4 ? <Trophy size={20} /> : <Lock size={20} />}
                         </div>
                       ))}
                    </div>
                 </section>

                 <section className="space-y-6">
                    <SectionHeader title="Next Events" />
                    <div className="bg-slate-50 rounded-[2.5rem] p-6 space-y-4 border border-slate-100">
                       <EventItem title="Workshop: React 19" time="Apr 10, 14:00" icon={<Bell size={14}/>} color="text-orange-500" bg="bg-orange-100" />
                       <EventItem title="Module 4 Submission" time="Apr 12, 23:59" icon={<Clock size={14}/>} color="text-blue-500" bg="bg-blue-100" />
                    </div>
                 </section>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- UI HELPERS --- */

const SectionHeader = ({ title }) => (
  <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-3">
    <span className="w-8 h-[2px] bg-slate-200" /> {title}
  </h2>
);

const StatCard = ({ title, value, icon, color, bg }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all group overflow-hidden relative">
    <div className={`absolute -right-4 -top-4 w-20 h-20 opacity-[0.03] group-hover:scale-150 transition-transform ${color}`}>
      {icon}
    </div>
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mt-0.5">{title}</p>
      </div>
    </div>
  </div>
);

const ActiveCourseHero = ({ course }) => (
  <div className="group bg-white border border-slate-100 rounded-[3rem] p-5 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-[320px] aspect-[16/10] rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner">
        <img src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800'} 
             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
      </div>
      <div className="flex-1 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Ongoing</span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Progress</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{course.title}</h3>
          <p className="text-slate-500 text-sm font-medium line-clamp-2 max-w-md">Continue where you left off and complete this module to earn your next badge.</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Link to={`/app/courses/${course.id}`} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center gap-3">
            Continue Learning <ArrowUpRight size={14} />
          </Link>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-900 font-black text-xs">
                {course.pivot?.progress || 0}%
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Current<br/>Module</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CourseRowItem = ({ course }) => (
  <Link to={`/app/courses/${course.id}`} className="group flex items-center gap-6 py-6 px-6 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0">
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-blue-200 transition-all shadow-sm">
      <BookOpen size={20} className="text-slate-400 group-hover:text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-900 text-base tracking-tight truncate group-hover:text-blue-600 transition-colors">{course.title}</h4>
      <div className="flex items-center gap-3 mt-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Self-Paced</p>
        <span className="w-1 h-1 bg-slate-200 rounded-full" />
        <p className="text-[10px] font-medium text-slate-500 italic">Unlimited Access</p>
      </div>
    </div>
    <div className="flex items-center gap-12">
        <div className="hidden md:block text-right">
           <p className="text-sm font-black text-slate-900">{course.pivot?.progress || 0}%</p>
           <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-slate-900 group-hover:bg-blue-600 transition-all duration-1000" style={{ width: `${course.pivot?.progress || 0}%` }} />
           </div>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-blue-50 text-slate-300 group-hover:text-blue-600 transition-all">
          <ChevronRight size={20} />
        </div>
    </div>
  </Link>
);

const ActivityHeatmap = () => (
  <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-xl">
    <div className="flex justify-between items-center">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Weekly Focus (Hrs)</p>
        <div className="flex gap-1">
           {[1,2,3,4].map(i => <div key={i} className={`w-3 h-3 rounded-sm ${i > 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />)}
        </div>
    </div>
    <div className="flex justify-between items-end gap-2 h-24">
      {[40, 70, 45, 90, 65, 80, 30, 95, 50, 85, 40, 60].map((h, i) => (
        <div key={i} className="flex-1 bg-slate-800 rounded-t-lg relative group transition-all cursor-pointer hover:bg-slate-700">
           <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg group-hover:bg-blue-400" style={{ height: `${h}%` }} />
        </div>
      ))}
    </div>
    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
       <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
    </div>
  </div>
);

const EventItem = ({ title, time, icon, color, bg }) => (
  <div className="flex items-center justify-between p-4 bg-white border border-slate-200/50 rounded-2xl hover:border-slate-300 transition-all shadow-sm">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
    <ArrowUpRight size={14} className="text-slate-300" />
  </div>
);

const SettingsSection = ({ passwords, setPasswords, handlePasswordChange, passLoading, showPasswords, setShowPasswords }) => (
  <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="space-y-4">
         <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200">
            <Settings size={32} />
         </div>
         <h3 className="text-xl font-black text-slate-900">Security</h3>
         <p className="text-sm text-slate-400 font-medium leading-relaxed">Ensure your account is protected with a strong, unique password.</p>
      </div>
      
      <div className="lg:col-span-2">
        <form onSubmit={handlePasswordChange} className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100 space-y-8">
          <div className="flex justify-between items-center border-b border-slate-50 pb-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-600" size={20} />
              <span className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Change Password</span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowPasswords(!showPasswords)}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
            >
              {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Secret</label>
              <input 
                type={showPasswords ? "text" : "password"}
                value={passwords.current_password}
                onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all" 
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                <input 
                  type={showPasswords ? "text" : "password"}
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New</label>
                <input 
                  type={showPasswords ? "text" : "password"}
                  value={passwords.new_password_confirmation}
                  onChange={(e) => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all" 
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={passLoading}
            className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {passLoading ? 'Verifying...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-24 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
      <LayoutDashboard size={28} className="text-slate-200" />
    </div>
    <h3 className="text-2xl font-black text-slate-900 tracking-tight">No courses found</h3>
    <p className="text-slate-400 mt-2 font-medium max-w-xs mx-auto text-sm">Enroll in a course to start your learning journey.</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="h-full p-10 space-y-10 animate-pulse bg-white">
     <div className="h-24 bg-slate-50 rounded-[2rem]" />
     <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-50 rounded-[2rem]" />)}
     </div>
     <div className="grid grid-cols-12 gap-12 pt-10">
        <div className="col-span-8 h-[400px] bg-slate-50 rounded-[3rem]" />
        <div className="col-span-4 h-[400px] bg-slate-50 rounded-[3rem]" />
     </div>
  </div>
);

export default Dashboard;