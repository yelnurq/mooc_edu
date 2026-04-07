<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Получаем все категории, которые создал CategorySeeder
        $categories = Category::all();

        if ($categories->isEmpty()) {
            $this->command->error('Сначала запустите CategorySeeder!');
            return;
        }

        $coursesData = [
            [
                'title' => 'Профессия: Fullstack Developer на Laravel 11 & React',
                'desc' => 'Максимально глубокий курс по современной веб-разработке.',
                'image' => '1.jpg',
                'author' => 'Zeynolla Elnur',
                'category_name' => 'Информационные технологии', // Привязка по имени
                'modules' => [
                    'Окружение и Docker', 'Основы Laravel 11', 'Eloquent ORM', 'Безопасность', 'API Dev',
                    'React Basics', 'State Management', 'WebSockets', 'Тестирование', 'Деплой'
                ]
            ],
            [
                'title' => 'Mastering DevOps: Kubernetes & CI/CD',
                'desc' => 'Автоматизация развертывания и масштабирования приложений.',
                'image' => '1.jpg',
                'author' => 'DevOps Community',
                'category_name' => 'Компьютерная инженерия и автоматизация',
                'modules' => [
                    'Linux Shell', 'Docker Internals', 'K8s Cluster', 'Helm Charts', 'Jenkins/GitHub Actions'
                ]
            ],
            [
                'title' => 'Английский для IT-специалистов',
                'desc' => 'Технический английский для работы в международных компаниях.',
                'image' => '1.jpg',
                'author' => 'Language School',
                'category_name' => 'Государственный и иностранный языки',
                'modules' => [
                    'IT Terminology', 'Technical Writing', 'Interview Prep', 'Daily Standups'
                ]
            ],
            [
                'title' => 'Python для Data Science',
                'desc' => 'Анализ данных, визуализация и основы машинного обучения.',
                'image' => '1.jpg',
                'author' => 'Data Insight Team',
                'category_name' => 'Информационные технологии',
                'modules' => [
                    'Numpy & Pandas', 'Matplotlib', 'Scikit-learn', 'Нейросети', 'Big Data Intro'
                ]
            ],
        ];

        foreach ($coursesData as $cData) {
            // Ищем категорию по имени из массива данных или берем рандомную, если не нашли
            $category = $categories->where('name', $cData['category_name'])->first() ?? $categories->random();

            // 1. Создаем курс
            $course = Course::create([
                'title' => $cData['title'],
                'description' => $cData['desc'],
                'image' => $cData['image'],
                'category_id' => $category->id, // ПРИВЯЗКА КАТЕГОРИИ
                'author_type' => 'custom',
                'custom_author_name' => $cData['author'],
                'author_id' => null,
            ]);

            // 2. Общие ресурсы
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

                // 4. Добавляем по 4 урока
                for ($i = 1; $i <= 4; $i++) {
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

        $this->command->info('Успешно создано курсы с привязанными категориями!');
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