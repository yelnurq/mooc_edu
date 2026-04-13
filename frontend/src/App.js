import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './components/Layouts/MainLayout';
import CoursesPage from './pages/UserPanel/Courses/AllCoursesPage/Courses';
import HomePage from './pages/UserPanel/Home/HomePage';
import CourseDetailPage from './pages/UserPanel/Courses/CourseDetailPage/Course';
import CourseAppPage from './pages/UserPanel/Courses/CourseDetailPage/CourseApp';
import AppLayout from './components/Layouts/AppLayout';
import LoginPage from './pages/Auth/Login';
import Dashboard from './pages/UserPanel/Dashboard/Dashboard';
import AdminEnrollment from './pages/AdminPanel/Courses/Enroll/Enroll';
import RegisterPage from './pages/Auth/Register';
import './App.css';
import SettingsPage from './pages/UserPanel/Settings/Settings';
import AdminLayout from './components/Layouts/AdminLayout';
import UsersManagement from './pages/AdminPanel/Users/UsersManagement';
import LdapManagement from './pages/AdminPanel/LdapManagement/LdapManagement';
import CategoryManagement from './pages/AdminPanel/Settings/Settings';
import CourseManagement from './components/Course/Courses/CourseManagement';
import CourseEditor from './pages/AdminPanel/Courses/CourseEdit/Edit';
import ApiLogsMonitor from './pages/AdminPanel/Logs/LogMonitor';
import MyCourses from './pages/UserPanel/Courses/MyCourses/MyCourses';
import Certificates from './pages/UserPanel/Courses/Certificates/Certificates';
import QuizEditor from './pages/UserPanel/Courses/QuizEditor/Quiz';
import CertificateVerify from './pages/UserPanel/Certificate/Verify';
import CertificateAppVerify from './pages/UserPanel/Certificate/VerifyApp';

// Локальный компонент для защиты роутов
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  // Если токена нет — отправляем на логин
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* --- ПУБЛИЧНЫЕ РОУТЫ (Доступны всем) --- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/news" element={<div className="p-10">Раздел новостей</div>} />
          <Route path="/verify" element={<CertificateVerify />} />
          </Route>

          {/* --- ЗАЩИЩЕННЫЕ РОУТЫ (Только для авторизованных) --- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/app/courses/:id" element={<CourseAppPage />} />
              <Route path="/app/certificates" element={<Certificates />} />
              <Route path="/app/certificate/verify" element={<CertificateAppVerify />} />
              <Route path="/app/dashboard" element={<Dashboard />} />
              <Route path="/app/my-courses" element={<MyCourses />} />
              <Route path="/app/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<div>asd</div>} />
              <Route path="/admin/settings" element={<CategoryManagement />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/quizzes/:id/edit" element={<QuizEditor />} />
              <Route path="/admin/courses/:id/edit" element={<CourseEditor />} />
              <Route path="/admin/users/" element={<UsersManagement />} />
              <Route path="/admin/users/ldap" element={<LdapManagement />} />
              <Route path="/admin/logs" element={<ApiLogsMonitor />} />
              <Route path="/admin/enroll" element={<AdminEnrollment />} />
            </Route>
          </Route>

          {/* --- АВТОРИЗАЦИЯ --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- 404 --- */}
          <Route path="*" element={<div className="p-10 text-center font-bold uppercase tracking-widest text-slate-400">404: Страница не найдена</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;