<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@admin.admin'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin@admin.admin'), // Укажите свой надежный пароль
                'role' => 'super_admin',
                'mobile' => '77777777777',
                'academic_specialization' => 'System Administration',
                'faculty_id' => null,
                'department_id' => null,
            ]
        );

        $this->command->info('Администратор успешно создан: admin@gmail.com / password123');
    }
}