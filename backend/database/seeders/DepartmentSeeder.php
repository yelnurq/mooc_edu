<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Faculty;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faculties = [
            [
                'title' => 'Технологический факультет',
                'short_title' => 'ТФ',
                'dean' => 'Ахметов Бахытжан Куанышевич',
                'short_name' => 'Ахметов Б.К.',
            ],
            [
                'title' => 'Факультет экономики и бизнеса',
                'short_title' => 'ФЭиБ',
                'dean' => 'Оспанова Гульнур Маратовна',
                'short_name' => 'Оспанова Г.М.',
            ],
            [
                'title' => 'Факультет инжиниринга и информационных технологий',
                'short_title' => 'ФИиИТ',
                'dean' => 'Серимбетов Бауыржан Айдарханович',
                'short_name' => 'Серимбетов Б.А.',
            ],
        ];

        foreach ($faculties as $f) {
            Faculty::updateOrCreate(['title' => $f['title']], $f);
        }

        $tf = Faculty::where('short_title', 'ТФ')->first()->id;
        $feb = Faculty::where('short_title', 'ФЭиБ')->first()->id;
        $fiit = Faculty::where('short_title', 'ФИиИТ')->first()->id;

        $deps = [
            [
                'title' => 'Кафедра "Технология и стандартизация"',
                'leader' => 'Абенов Мурат Каримович',
                'short_name' => 'Абенов М.К.',
                'faculty_id' => $tf
            ],
            [
                'title' => 'Кафедра "Технология легкой промышленности и дизайна"',
                'leader' => 'Смагулова Алия Болатовна',
                'short_name' => 'Смагулова А.Б.',
                'faculty_id' => $tf
            ],
            [
                'title' => 'Кафедра "Социально-гуманитарные дисциплины"',
                'leader' => 'Идрисов Канат Саятович',
                'short_name' => 'Идрисов К.С.',
                'faculty_id' => $tf
            ],

            [
                'title' => 'Кафедра "Туризм и сервис"',
                'leader' => 'Мусаева Дана Сериковна',
                'short_name' => 'Мусаева Д.С.',
                'faculty_id' => $feb
            ],
            [
                'title' => 'Кафедра "Экономика и управление"',
                'leader' => 'Байжанов Нуртас Ерланович',
                'short_name' => 'Байжанов Н.Е.',
                'faculty_id' => $feb
            ],
            [
                'title' => 'Кафедра "Финансы и учёт"',
                'leader' => 'Каримова Индира Маратовна',
                'short_name' => 'Каримова И.М.',
                'faculty_id' => $feb
            ],
            [
                'title' => 'Кафедра "Государственный и иностранные языки"',
                'leader' => 'Алдабергенова Г.А.',
                'short_name' => 'Алдабергенова Г.А.',
                'faculty_id' => $feb
            ],

            [
                'title' => 'Кафедра "Информационные технологии"',
                'leader' => 'Утегенов Аскар Саматович',
                'short_name' => 'Утегенов А.С.',
                'faculty_id' => $fiit
            ],
            [
                'title' => 'Кафедра "Компьютерная инженерия и автоматизация"',
                'leader' => 'Жолдасов Берик Талгатович',
                'short_name' => 'Жолдасов Б.Т.',
                'faculty_id' => $fiit
            ],
            [
                'title' => 'Кафедра "Химия, химическая технология и экология"',
                'leader' => 'Есенгалиева А.М.',
                'short_name' => 'Есенгалиева А.М.',
                'faculty_id' => $fiit
            ],
        ];

        foreach ($deps as $dep) {
            Department::updateOrCreate(['title' => $dep['title']], $dep);
        }
    }
}