import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layouts/MainLayout'; // Укажи правильный путь к файлу лейаута
import CoursesPage from './pages/UserPanel/Courses/AllCoursesPage/Courses';
import './App.css';
import HomePage from './pages/UserPanel/Home/HomePage';

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
            <Route path="/courses/:id" element={<div>Страница конкретного курса</div>} />
            
            {/* Другие разделы, если понадобятся (новости, о нас и т.д.) */}
            <Route path="/news" element={<div className="p-10">Раздел новостей</div>} />
          </Route>

          {/* Отдельные маршруты без общего лейаута (например, логин) */}
          <Route path="/login" element={<div>Страница входа</div>} />

          {/* 404 Страница */}
          <Route path="*" element={<div className="p-10 text-center font-bold">404: Страница не найдена</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;