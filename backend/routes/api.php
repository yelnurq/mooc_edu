<?php

use App\Http\Controllers\AuthController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CourseController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, "register"]);
Route::post('/login', [AuthController::class, "login"]);


Route::middleware(["token"])->group(function(){
    Route::post('/logout', [AuthController::class, "logout"]);
    Route::post('/admin/enroll', [CourseController::class, 'adminEnroll']);
    Route::get('/my-courses', [CourseController::class, 'myCourses']);
    
    Route::get('/admin/users', function () {
            return User::select('id', 'name', 'email')->get();
    });

    Route::post('/lessons/{lesson}/complete', [CourseController::class, 'completeLesson']);

});


Route::get('/courses', [CourseController::class, 'index']);           
Route::post('/courses', [CourseController::class, 'store']);           // Создать курс
Route::get('/courses/{id}', [CourseController::class, 'show']);        // Получить всё дерево курса
Route::post('/courses/{id}/modules', [CourseController::class, 'addModule']); // Добавить модуль
Route::post('/modules/{id}/lessons', [CourseController::class, 'addLesson']); // Добавить урок (PDF/Видео)