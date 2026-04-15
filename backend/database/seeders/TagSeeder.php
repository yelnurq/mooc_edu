<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            'Программирование', 
            'Иностранные языки', 
            'Дизайн и графика', 
            'Маркетинг', 
            'Бизнес и стартапы', 
            'Психология', 
            'Личная эффективность', 
            'Аналитика данных', 
            'Управление проектами', 
            'Копирайтинг', 
            'Финансы', 
            'Трудоустройство',
            'Подготовка к экзаменам',
            'Общее обсуждение'
        ];

        foreach ($tags as $tagName) {
            Tag::updateOrCreate(
                ['slug' => Str::slug($tagName)],
                ['name' => $tagName]
            );
        }
    }
}