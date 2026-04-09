import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Award, 
  User,
  HelpCircle, 
  Settings 
} from 'lucide-react';

// Элементы бокового меню
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
    id: 'catalog', 
    path: '/app/catalog', 
    icon: <Search size={20} />, 
    label: 'Каталог' 
  },
  { 
    id: 'messages', 
    path: '/app/messages', 
    icon: <MessageCircle size={20} />, 
    label: 'Чат с куратором' 
  },
  { 
    id: 'certificates', 
    path: '/app/certificates', 
    icon: <Award size={20} />, 
    label: 'Сертификаты' 
  },
  { 
    id: 'support', 
    path: '/app/support', 
    icon: <HelpCircle size={20} />, 
    label: 'Помощь' 
  },
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