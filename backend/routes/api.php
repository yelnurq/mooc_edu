<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LdapController;
use App\Http\Controllers\UserController;
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
      Route::prefix('admin/ldap')->group(function () {
            Route::get('/users', [LdapController::class, 'getAllLdapUsers']);
            Route::post('/import-single', [LdapController::class, 'importSingleUser']);
            Route::post('/sync-all', [LdapController::class, 'syncAllLdapUsers']);
        });

    
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::get('/admin/enrollments', [CourseController::class, 'getEnrollmentData']);
    
    Route::post('/logout', [AuthController::class, "logout"]);
    Route::post('/admin/enroll', [CourseController::class, 'adminEnroll']);
    Route::get('/my-courses', [CourseController::class, 'myCourses']);
    
    
    Route::post('/lessons/{lesson}/complete', [CourseController::class, 'completeLesson']);

});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/courses', [CourseController::class, 'index']);           
Route::post('/courses', [CourseController::class, 'store']);           // Создать курс
Route::get('/courses/{id}', [CourseController::class, 'show']);        // Получить всё дерево курса
Route::get('/courses/public/{id}', [CourseController::class, 'showPublic']);        // Получить всё дерево курса
Route::post('/courses/{id}/modules', [CourseController::class, 'addModule']); // Добавить модуль
Route::post('/modules/{id}/lessons', [CourseController::class, 'addLesson']); // Добавить урок (PDF/Видео)