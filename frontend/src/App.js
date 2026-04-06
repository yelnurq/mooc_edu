import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layouts/MainLayout'; // Укажи правильный путь к файлу лейаута
import CoursesPage from './pages/UserPanel/Courses/AllCoursesPage/Courses';
import './App.css';
import HomePage from './pages/UserPanel/Home/HomePage';
import CourseDetailPage from './pages/UserPanel/Courses/CourseDetailPage/Course';
import CourseAppPage from './pages/UserPanel/Courses/CourseDetailPage/CourseApp';
import AppLayout from './components/Layouts/AppLayout';
import LoginPage from './pages/Auth/Login';
import Dashboard from './pages/UserPanel/Dashboard/Dashboard';
import AdminEnrollment from './pages/AdminPanel/Courses/Enroll/Enroll';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Все маршруты внутри MainLayout будут отображаться с TopBar и Sidebar */}
          <Route element={<MainLayout />}>
            {/* Редирект с корня на курсы */}
            <Route path="/" element={<HomePage/>} />
            
            {/* Страница всех курсов */}
            <Route path="/courses" element={<CoursesPage />} />
            
            {/* Детальная страница курса */}
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/news" element={<div className="p-10">Раздел новостей</div>} />
          </Route>
      <Route element={<AppLayout />}>
        {/* Путь для обучения */}
        <Route path="/app/courses/:id" element={<CourseAppPage />} />
        {/* Здесь же можно добавить Dashboard, Настройки и т.д. */}
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/admin/enroll" element={<AdminEnrollment />} />
      </Route>
          {/* Отдельные маршруты без общего лейаута (например, логин) */}
          <Route path="/login" element={<LoginPage/>} />

          {/* 404 Страница */}
          <Route path="*" element={<div className="p-10 text-center font-bold">404: Страница не найдена</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;