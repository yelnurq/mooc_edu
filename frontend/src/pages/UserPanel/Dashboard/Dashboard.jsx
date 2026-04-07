import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, ChevronRight, LayoutDashboard, 
  Zap, Trophy, Star, ArrowUpRight, Lock, Eye, EyeOff, 
  ShieldCheck, User, Search,
  Settings, Flame
} from 'lucide-react';
import api from '../../../api/axios';

const Dashboard = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCourses = useMemo(() => {
    return courses.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const totalProgress = useMemo(() => {
    if (courses.length === 0) return 0;
    const total = courses.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0);
    return Math.round(total / courses.length);
  }, [courses]);

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
      alert('Error updating password.');
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

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
                 <span className="text-[10px] font-black uppercase tracking-widest">Learning Mode Active</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back!</h1>
              <p className="text-slate-400 text-sm font-medium">Track your progress and continue your courses.</p>
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
               <StatCard title="Average Progress" value={`${totalProgress}%`} icon={<Zap size={20} />} color="text-blue-600" bg="bg-blue-50" />
               <StatCard title="My Courses" value={courses.length} icon={<BookOpen size={20} />} color="text-orange-500" bg="bg-orange-50" />
               <StatCard title="Certificates" value="Locked" icon={<Trophy size={20} />} color="text-emerald-500" bg="bg-emerald-50" />
               <StatCard title="Target" value="100%" icon={<Star size={20} />} color="text-purple-600" bg="bg-purple-50" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-12">
                {activeTab === 'overview' ? (
                  <section className="space-y-6">
                    <SectionHeader title="Jump Back In" />
                    {courses.length > 0 ? (
                      <ActiveCourseHero course={courses[0]} />
                    ) : (
                      <EmptyState />
                    )}
                  </section>
                ) : (
                  <section className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <SectionHeader title="My Full Library" />
                       <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            placeholder="Filter courses..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold text-slate-900 w-full md:w-64 outline-none"
                          />
                       </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-2 overflow-hidden shadow-sm">
                       {filteredCourses.length > 0 ? (
                         filteredCourses.map(course => <CourseRowItem key={course.id} course={course} />)
                       ) : (
                         <div className="p-20 text-center text-slate-400 font-medium">No courses found.</div>
                       )}
                    </div>
                  </section>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-10">
                 <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 space-y-6">
                       <h3 className="text-2xl font-black leading-tight">Mangystau Travel Project</h3>
                       <p className="text-slate-400 text-xs font-medium">Your current development ecosystem is being tracked. Keep it up!</p>
                       <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-[65%]" />
                       </div>
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

const ActiveCourseHero = ({ course }) => (
  <div className="group bg-white border border-slate-100 rounded-[3rem] p-5 hover:shadow-2xl transition-all duration-500">
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-[320px] aspect-[16/10] rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner">
        <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
      </div>
      <div className="flex-1 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{course.category || 'General'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.lessons_count} Lessons</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{course.title}</h3>
          <p className="text-slate-500 text-sm font-medium line-clamp-2 max-w-md">{course.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Link to={`/app/courses/${course.id}`} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 shadow-lg">
            Continue Learning <ArrowUpRight size={14} />
          </Link>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-900 font-black text-xs">
                {course.pivot?.progress || 0}%
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Total<br/>Progress</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CourseRowItem = ({ course }) => (
  <Link to={`/app/courses/${course.id}`} className="group flex items-center gap-6 py-6 px-6 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0">
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-blue-200 transition-all shadow-sm overflow-hidden">
      <img src={course.image} className="w-full h-full object-cover" alt="" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-900 text-base tracking-tight truncate group-hover:text-blue-600 transition-colors">{course.title}</h4>
      <div className="flex items-center gap-3 mt-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.modules_count} Modules</p>
        <span className="w-1 h-1 bg-slate-200 rounded-full" />
        <p className="text-[10px] font-medium text-slate-500">{course.lessons_count} total lessons</p>
      </div>
    </div>
    <div className="flex items-center gap-12">
        <div className="hidden md:block text-right">
           <p className="text-sm font-black text-slate-900">{course.pivot?.progress || 0}%</p>
           <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${course.pivot?.progress || 0}%` }} />
           </div>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-blue-50 text-slate-300 group-hover:text-blue-600 transition-all">
          <ChevronRight size={20} />
        </div>
    </div>
  </Link>
);

const SectionHeader = ({ title }) => (
  <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-3">
    <span className="w-8 h-[2px] bg-slate-200" /> {title}
  </h2>
);

const StatCard = ({ title, value, icon, color, bg }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group overflow-hidden relative">
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
        <form onSubmit={handlePasswordChange} className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
          <div className="flex justify-between items-center border-b border-slate-50 pb-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-600" size={20} />
              <span className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Change Password</span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-slate-400 hover:text-blue-600"
            >
              {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Current Password</label>
              <input 
                type={showPasswords ? "text" : "password"}
                value={passwords.current_password}
                onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-bold focus:border-blue-500 outline-none transition-all" 
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">New Password</label>
                <input 
                  type={showPasswords ? "text" : "password"}
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-bold focus:border-blue-500 outline-none transition-all" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Confirm New</label>
                <input 
                  type={showPasswords ? "text" : "password"}
                  value={passwords.new_password_confirmation}
                  onChange={(e) => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-bold focus:border-blue-500 outline-none transition-all" 
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={passLoading}
            className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all disabled:opacity-50"
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
    <LayoutDashboard size={28} className="text-slate-200 mx-auto mb-6" />
    <h3 className="text-2xl font-black text-slate-900">No courses joined</h3>
    <p className="text-slate-400 mt-2 text-sm">Join a course to start tracking your progress here.</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="h-full p-10 space-y-10 animate-pulse bg-white">
     <div className="h-24 bg-slate-50 rounded-[2rem]" />
     <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-50 rounded-[2rem]" />)}
     </div>
  </div>
);

export default Dashboard;