<?php

use App\Http\Controllers\ApiLogController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CourseResourceController;
use App\Http\Controllers\HelperController;
use App\Http\Controllers\LdapController;
use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CourseController;

Route::middleware("logs")->group(function(){


    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');

    Route::post('/register', [AuthController::class, "register"]);
    Route::post('/login', [AuthController::class, "login"]);


    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/courses', [CourseController::class, 'index']);           
    Route::get('/courses/{id}', [CourseController::class, 'show']);        // Получить всё дерево курса
    Route::get('/courses/public/{id}', [CourseController::class, 'showPublic']);        // Получить всё дерево курса
    Route::post('/courses/{id}/modules', [CourseController::class, 'addModule']); // Добавить модуль
    Route::post('/modules/{id}/lessons', [CourseController::class, 'addLesson']); // Добавить урок (PDF/Видео)

    Route::middleware(["token"])->group(function(){
        Route::prefix('admin/ldap')->group(function () {
                Route::get('/users', [LdapController::class, 'getAllLdapUsers']);
                Route::post('/import-single', [LdapController::class, 'importSingleUser']);
                Route::post('/sync-all', [LdapController::class, 'syncAllLdapUsers']);
            });

        Route::prefix('admin/helpers/options')->group(function () {
                Route::get('/', [HelperController::class, 'getOptions']);
                Route::get('/teachers', [HelperController::class, 'getOptionsWithTeacher']);
                Route::post('/', [HelperController::class, 'postOptions']);
                Route::put('/{id}', [HelperController::class, 'updateOption']);
                Route::delete('/{id}', [HelperController::class, 'deleteOption']);
            });

    Route::prefix('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::get('/logs', [ApiLogController::class, 'index']);
        Route::get('/logs/{id}', [ApiLogController::class, 'show']);

    });
        Route::get('/admin/enrollments', [CourseController::class, 'getEnrollmentData']);
        
        Route::post('/logout', [AuthController::class, "logout"]);
        Route::post('/admin/enroll', [CourseController::class, 'adminEnroll']);
        Route::get('/admin/courses', [CourseController::class, 'indexCourses']);
        Route::get('/my-courses', [CourseController::class, 'myCourses']);
        Route::post('/courses/{id}/enroll', [CourseController::class, 'enroll']);
        
        Route::post('/lessons/{lesson}/complete', [CourseController::class, 'completeLesson']);


    Route::post('/admin/courses', [CourseController::class, 'store']);

    Route::get('/admin/courses/{course}/structure', [CourseController::class, 'getStructure']);
    Route::post('/admin/courses/{course}/modules', [ModuleController::class, 'store']);
    Route::post('/admin/modules/{module}/lessons', [LessonController::class, 'store']);
    Route::post('/admin/courses/{course}/resources', [CourseResourceController::class, 'store']);
    });

});
