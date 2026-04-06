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
        // 1. Создаем первый курс
        $course1 = Course::create([
            'title' => 'Mastering Laravel 11: Архитектура систем',
            'description' => 'Глубокое погружение в разработку современных веб-приложений на PHP.',
        ]);

        // Модуль 1 для Курса 1
        $m1 = $course1->modules()->create(['title' => 'Основы и установка', 'order' => 1]);
        $m1->lessons()->createMany([
            [
                'title' => 'Введение в Laravel 11',
                'type' => 'video',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'order' => 1
            ],
            [
                'title' => 'Конспект: Жизненный цикл запроса',
                'type' => 'pdf',
                'file_path' => 'lessons/sample_lecture.pdf', // Файл должен лежать в storage/app/public/lessons/
                'order' => 2
            ],
        ]);

        // Модуль 2 для Курса 1
        $m2 = $course1->modules()->create(['title' => 'Работа с БД и Eloquent', 'order' => 2]);
        $m2->lessons()->create([
            'title' => 'Связи один-ко-многим',
            'type' => 'video',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'order' => 1
        ]);

        // 2. Создаем второй курс
        $course2 = Course::create([
            'title' => 'React + Next.js: Полный гид по SSR',
            'description' => 'Изучаем серверный рендеринг и оптимизацию React приложений.',
        ]);

        $m3 = $course2->modules()->create(['title' => 'Маршрутизация App Router', 'order' => 1]);
        $m3->lessons()->create([
            'title' => 'Лекция: Архитектура Next.js',
            'type' => 'pdf',
            'file_path' => 'lessons/nextjs_intro.pdf',
            'order' => 1
        ]);

        $this->command->info('База данных успешно заполнена курсами!');
    }
}