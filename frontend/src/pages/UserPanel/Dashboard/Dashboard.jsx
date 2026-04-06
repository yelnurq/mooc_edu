import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, ChevronRight, LayoutDashboard, GraduationCap, 
  Zap, Trophy, Star, ArrowUpRight, Lock, Eye, EyeOff, ShieldCheck
} from 'lucide-react';
import api from '../../../api/axios';

const Dashboard = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Состояния для смены пароля
  const [passLoading, setPassLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  // Слушаем переход из Header (AppLayout)
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
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    try {
      await api.post('/user/change-password', passwords);
      alert('Пароль успешно изменен');
      setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      alert('Ошибка при смене пароля');
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-white custom-scrollbar selection:bg-blue-100 selection:text-blue-700">
      <div className="max-w-[1200px] mx-auto p-6 md:p-12 space-y-12 transition-all duration-500">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'settings' ? 'Settings' : 'Dashboard'}
            </h1>
            <p className="text-slate-500 text-sm font-medium">Welcome back, Yelnur.</p>
          </div>
          
          <nav className="flex items-center p-1 bg-slate-50 rounded-xl border border-slate-100">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'courses', label: `Library (${courses.length})` },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 text-[11px] font-bold uppercase tracking-wider transition-all rounded-lg ${
                  activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {activeTab === 'settings' ? (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <form onSubmit={handlePasswordChange} className="space-y-8">
                <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex justify-between items-center mb-2">
                    <div className="space-y-1">
                      <h3 className="font-black text-xl text-slate-900">Security</h3>
                      <p className="text-slate-400 text-xs font-medium">Update your account password</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</label>
                      <input 
                        type={showPasswords ? "text" : "password"}
                        value={passwords.current_password}
                        onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all" 
                        required
                      />
                    </div>
                    <div className="h-px bg-slate-100 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                        <input 
                          type={showPasswords ? "text" : "password"}
                          value={passwords.new_password}
                          onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm</label>
                        <input 
                          type={showPasswords ? "text" : "password"}
                          value={passwords.new_password_confirmation}
                          onChange={(e) => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all" 
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={passLoading}
                    className="w-full bg-slate-900 text-white p-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {passLoading ? 'Updating...' : <><Lock size={16}/> Update Password</>}
                  </button>
                </section>
             </form>
          </div>
        ) : (
          /* --- DASHBOARD / LIBRARY CONTENT --- */
          courses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
              <div className="lg:col-span-8 space-y-16">
                {activeTab === 'overview' ? (
                  <>
                    <section className="space-y-6">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> Continue Learning
                      </h2>
                      <ActiveCourseHero course={courses[0]} />
                    </section>
                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                      <StatCard title="Lessons Done" value="48" total="120" icon={<BookOpen size={18}/>} />
                      <StatCard title="Avg Score" value="85%" total="100%" icon={<Trophy size={18}/>} />
                    </section>
                  </>
                ) : (
                  <section className="grid grid-cols-1 gap-1">
                    {courses.map(course => <CourseRowItem key={course.id} course={course} />)}
                  </section>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Activity Analytics</h3>
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-8">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Overall Progress</p>
                        <p className="text-4xl font-bold text-slate-900">{calculateTotalProgress(courses)}%</p>
                      </div>
                      <div className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400">
                        <Zap size={20} />
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: `${calculateTotalProgress(courses)}%` }} />
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Star size={14} fill="currentColor" />
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-tight">
                        You've completed <span className="text-slate-900 font-bold">4 modules</span> this week.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )
        )}
      </div>
    </div>
  );
};

/* --- UI COMPONENTS --- */
const StatCard = ({ title, value, total, icon }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all flex items-center gap-6 group">
    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}<span className="text-slate-300 text-base font-medium">/{total}</span></p>
      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mt-0.5">{title}</p>
    </div>
  </div>
);

const ActiveCourseHero = ({ course }) => (
  <div className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-4 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden">
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-1/3 aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-100">
        <img src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
      </div>
      <div className="flex-1 space-y-6 pr-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{course.title}</h3>
          <p className="text-slate-500 text-sm font-medium line-clamp-2 max-w-sm">{course.description || "Continue learning."}</p>
        </div>
        <div className="flex items-center gap-8">
          <Link to={`/app/courses/${course.id}`} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-wider hover:bg-blue-600 transition-all flex items-center gap-3">
            Resume Course <ArrowUpRight size={14} />
          </Link>
          <div className="space-y-1">
            <p className="text-lg font-bold text-slate-900">{course.pivot?.progress || 0}%</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CourseRowItem = ({ course }) => (
  <Link to={`/app/courses/${course.id}`} className="group flex items-center gap-6 p-5 rounded-2xl hover:bg-slate-50 transition-all border-b border-slate-50 last:border-none">
    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
      <BookOpen size={18} className="text-slate-400 group-hover:text-slate-900" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-900 text-sm tracking-tight truncate">{course.title}</h4>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Premium Access</p>
    </div>
    <div className="flex items-center gap-10">
       <div className="w-24 hidden sm:block space-y-1.5">
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${course.pivot?.progress || 0}%` }} />
          </div>
          <p className="text-[9px] font-bold text-slate-400 text-right">{course.pivot?.progress || 0}%</p>
       </div>
       <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
    </div>
  </Link>
);

const EmptyState = () => (
  <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-slate-100">
    <LayoutDashboard size={40} className="text-slate-200 mx-auto mb-4" />
    <h3 className="text-lg font-bold text-slate-900">No courses yet</h3>
  </div>
);

const calculateTotalProgress = (courses) => {
  if (courses.length === 0) return 0;
  const total = courses.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0);
  return Math.round(total / courses.length);
};

export default Dashboard;