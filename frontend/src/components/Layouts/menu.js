import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Award, 
  Users,          // Для форума
  Sparkles,      // Для ИИ
  User,
  HelpCircle, 
  MessageSquare, // Для чата с куратором
  Settings, 
  Verified
} from 'lucide-react';


export const sidebarMenuItems = [
  { 
    id: 'dashboard', 
    path: '/app/dashboard', 
    icon: <LayoutDashboard size={20} />, 
    label: 'Главная' 
  },
  { 
    id: 'courses', 
    path: '/app/my-courses', 
    icon: <BookOpen size={20} />, 
    label: 'Мои курсы' 
  },
  { 
    id: 'certificates', 
    path: '/app/certificates', 
    icon: <Award size={20} />, 
    label: 'Сертификаты' 
  },
  { 
    id: 'verify', 
    path: '/app/certificates/verify', 
    icon: <Verified size={20} />, 
    label: 'Проверка сертификата' 
  },
  // --- НОВЫЕ РАЗДЕЛЫ ---
  { 
    id: 'mentor-chat', 
    path: '/app/mentor-chat', 
    icon: <MessageSquare size={20} />, 
    label: 'Куратор' 
  },
  { 
    id: 'ai-tutor', 
    path: '/app/ai-tutor', 
    icon: <Sparkles size={20} className="text-blue-500" />, // Можно подсветить синим
    label: 'AI Помощник' 
  },
  { 
    id: 'forum', 
    path: '/app/forum', 
    icon: <Users size={20} />, 
    label: 'Сообщество' 
  },
  // ----------------------
  { 
    id: 'settings', 
    path: '/app/settings', 
    icon: <Settings size={20} />, 
    label: 'Настройки' 
  },
];

// Элементы для поиска (расширенный список)
const allSearchItems = [
  ...sidebarMenuItems.map(item => ({
    ...item,
    type: 'route'
  })),
  {
    id: 'it-support',
    label: 'Технический отдел',
    type: 'department',
    room: 'Кабинет 302',
    phone: '+7 (777) 000-00-01',
    icon: <HelpCircle size={20} />
  },
  {
    id: 'office-reg',
    label: 'Офис регистратор',
    type: 'department',
    room: 'Кабинет 105',
    phone: '+7 (777) 000-00-02',
    icon: <User size={20} />
  }
];

export default allSearchItems;