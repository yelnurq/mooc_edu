<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $coursesData = [
            [
                'title' => 'Профессия: Fullstack Developer на Laravel 11 & React',
                'desc' => 'Максимально глубокий курс по современной веб-разработке.',
                'modules' => [
                    'Окружение и Docker', 'Основы Laravel 11', 'Eloquent ORM', 'Безопасность', 'API Dev',
                    'React Basics', 'State Management', 'WebSockets', 'Тестирование', 'Деплой'
                ]
            ],
            [
                'title' => 'Mastering DevOps: Kubernetes & CI/CD',
                'desc' => 'Автоматизация развертывания и масштабирования приложений.',
                'modules' => [
                    'Linux Shell', 'Docker Internals', 'K8s Cluster', 'Helm Charts', 'Jenkins/GitHub Actions'
                ]
            ],
            [
                'title' => 'UI/UX Design для разработчиков',
                'desc' => 'Как создавать интерфейсы, которые нравятся пользователям.',
                'modules' => [
                    'Основы Figma', 'Типографика', 'Сетки и Layout', 'Прототипирование', 'Анимация'
                ]
            ],
            [
                'title' => 'Python для Data Science',
                'desc' => 'Анализ данных, визуализация и основы машинного обучения.',
                'modules' => [
                    'Numpy & Pandas', 'Matplotlib', 'Scikit-learn', 'Нейросети', 'Big Data Intro'
                ]
            ],
        ];

        foreach ($coursesData as $cData) {
            // 1. Создаем курс
            $course = Course::create([
                'title' => $cData['title'],
                'description' => $cData['desc'],
            ]);

            // 2. Общие ресурсы (шапка курса) - одинаковые для всех
            $course->resources()->createMany([
                ['title' => 'Учебный план', 'type' => 'pdf', 'file_path' => '1.pdf', 'order' => 1],
                ['title' => 'Гайд по установке', 'type' => 'pdf', 'file_path' => '1.pdf', 'order' => 2],
            ]);

            // 3. Создаем модули
            $mOrder = 1;
            foreach ($cData['modules'] as $moduleTitle) {
                $module = $course->modules()->create([
                    'title' => $moduleTitle,
                    'order' => $mOrder++
                ]);

                // 4. Добавляем по 4 урока (2 видео + 2 PDF)
                for ($i = 1; $i <= 4; $i++) {
                    // Чередуем: нечетные - видео, четные - PDF
                    $isTypeVideo = $i % 2 !== 0;

                    $module->lessons()->create([
                        'title' => ($isTypeVideo ? "Видео-лекция: " : "Текстовый гайд: ") . $this->getLessonTitle($i),
                        'type' => $isTypeVideo ? 'video' : 'pdf',
                        'video_url' => $isTypeVideo ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
                        'file_path' => $isTypeVideo ? null : '1.pdf',
                        'order' => $i
                    ]);
                }
            }
        }

        $this->command->info('Успешно создано 4 курса с комбинированными уроками (Video/PDF)!');
    }

    private function getLessonTitle($num) {
        $titles = [
            1 => 'Введение в тему и ключевые понятия',
            2 => 'Подробный разбор документации',
            3 => 'Практическая реализация и примеры',
            4 => 'Дополнительные материалы и чеклист',
        ];
        return $titles[$num] ?? 'Дополнительный материал';
    }
}