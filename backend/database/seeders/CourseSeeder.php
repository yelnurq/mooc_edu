<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\CourseResource;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. СОЗДАНИЕ ГЛАВНОГО КУРСА
        $course = Course::create([
            'title' => 'Профессия: Fullstack Developer на Laravel 11 & React',
            'description' => 'Максимально глубокий курс по современной веб-разработке. От архитектуры БД до деплоя высоконагруженных систем.',
        ]);

        // 2. ОБЩИЕ РЕСУРСЫ КУРСА (Шапка)
        // 1 Промо-ролик + 4 PDF документа
        $course->resources()->createMany([
            [
                'title' => 'Трейлер и обзор курса',
                'type' => 'video',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'order' => 1
            ],
            [
                'title' => 'Полный учебный план (Syllabus)',
                'type' => 'pdf',
                'file_path' => 'courses/resources/syllabus_full.pdf',
                'order' => 2
            ],
            [
                'title' => 'Список рекомендуемого ПО и литературы',
                'type' => 'pdf',
                'file_path' => 'courses/resources/setup_guide.pdf',
                'order' => 3
            ],
            [
                'title' => 'Гайд по карьере и подготовке резюме',
                'type' => 'pdf',
                'file_path' => 'courses/resources/career_roadmap.pdf',
                'order' => 4
            ],
            [
                'title' => 'Шаблон дипломного проекта',
                'type' => 'pdf',
                'file_path' => 'courses/resources/diploma_template.pdf',
                'order' => 5
            ],
        ]);

        // 3. ЗАПОЛНЕНИЕ 10 МОДУЛЕЙ (По 4 видео-лекции в каждом)
        $modulesData = [
            'Окружение и Docker' => 'Настройка рабочего окружения для командной разработки.',
            'Основы Laravel 11' => 'Маршрутизация, Контроллеры и Blade.',
            'Eloquent ORM Глубокое погружение' => 'Сложные связи, оптимизация запросов и коллекции.',
            'Безопасность и Auth' => 'Sanctum, JWT, политики доступа и роли.',
            'API Development' => 'Создание RESTful API, ресурсы и версионирование.',
            'Frontend: React Basics' => 'Компоненты, хуки и состояние приложения.',
            'State Management' => 'Работа с Redux Toolkit и React Query.',
            'Real-time & WebSockets' => 'Laravel Echo, Pusher и чаты в реальном времени.',
            'Тестирование' => 'Unit, Feature и E2E тесты на Pest и Cypress.',
            'Деплой и CI/CD' => 'GitHub Actions, Docker Compose и работа с сервером.',
        ];

        $mOrder = 1;
        foreach ($modulesData as $title => $desc) {
            $module = $course->modules()->create([
                'title' => $title,
                'order' => $mOrder++
            ]);

            // Добавляем по 4 урока в каждый модуль
            for ($i = 1; $i <= 4; $i++) {
                $module->lessons()->create([
                    'title' => "Урок $i. " . $this->getLessonTitle($title, $i),
                    'type' => 'video',
                    'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'order' => $i
                ]);
            }
        }

        $this->command->info('Курс-гигант успешно создан: 10 модулей, 40 уроков и 5 ресурсов!');
    }

    /**
     * Генерация реалистичных названий для уроков
     */
    private function getLessonTitle($module, $num) {
        $titles = [
            1 => 'Теоретическое введение и концепции',
            2 => 'Практическая настройка и первый код',
            3 => 'Продвинутые техники и приемы',
            4 => 'Разбор ошибок и домашнее задание',
        ];
        return $titles[$num];
    }
}