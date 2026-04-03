import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  User, 
  Settings, 
  HelpCircle, 
  MessageSquare,
  Search
} from 'lucide-react';

// Элементы бокового меню
export const sidebarMenuItems = [
  {
    id: 1,
    label: 'Панель управления',
    path: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: 2,
    label: 'Все курсы',
    path: '/courses',
    icon: <BookOpen size={20} />,
  },
  {
    id: 3,
    label: 'Мои курсы',
    path: '/my-courses',
    icon: <MessageSquare size={20} />,
  },
  {
    id: 4,
    label: 'Профиль',
    path: '/profile',
    icon: <User size={20} />,
  },
];

// Данные для глобального поиска (комбинированные)
const allSearchItems = [
  ...sidebarMenuItems.map(item => ({
    ...item,
    type: 'route'
  })),
  // Сюда можно добавить статичные отделы или категории курсов
  {
    id: 'cat-1',
    label: 'Backend Разработка',
    path: '/courses/backend',
    type: 'route',
    icon: <Search size={16} />
  },
  {
    id: 'cat-2',
    label: 'Frontend (React)',
    path: '/courses/frontend',
    type: 'route',
    icon: <Search size={16} />
  }
];

export default allSearchItems;