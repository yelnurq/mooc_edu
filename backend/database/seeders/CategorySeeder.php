<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Государственный и иностранный языки',
            'Информационные технологии',
            'Компьютерная инженерия и автоматизация',
            'Дизайн и архитектура', // добавил для разнообразия
            'Экономика и бизнес'
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category)], // Избегаем дубликатов по slug
                ['name' => $category]
            );
        }
    }
}