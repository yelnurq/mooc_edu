<?php

use App\Http\Controllers\ApiLogController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CourseChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CourseResourceController;
use App\Http\Controllers\HelperController;
use App\Http\Controllers\LdapController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\QuizController;


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
        Route::get('/certificates/verify/{number}', [CertificateController::class, 'verifyCertificate']);


    Route::middleware(["token"])->group(function(){

    Route::get('/forum/tags', [ForumController::class, 'getTags']);
    Route::get('/forum/topics', [ForumController::class, 'index']);
    Route::post('/forum/topics', [ForumController::class, 'store']);
    Route::get('/forum/topics/{id}', [ForumController::class, 'show']);
    Route::post('/forum/topics/{id}/comments', [ForumController::class, 'storeComment']);
    Route::get('/course-chats', [CourseChatController::class, 'index']);
    Route::post('/course-chats/start', [CourseChatController::class, 'startChat']);
    Route::get('/course-chats/{roomId}/messages', [CourseChatController::class, 'getMessages']);
    Route::post('/course-chats/messages', [CourseChatController::class, 'sendMessage']);

        Route::get('/user/courses/active', [ChatController::class, 'getStudentCourses']);
        
        Route::post('/ai/chat', ChatController::class);


        Route::get('/user/settings', [StudentController::class, 'settings']);
        Route::put('/user/settings', [StudentController::class, 'updateSettings']);
        Route::get('/my-certificates', [CertificateController::class, 'certificates']);
        Route::get("/student/dashboard-stats", [DashboardController::class, 'getStudentStats']);
        Route::get('/certificates/{number}/download', [CertificateController::class, 'downloadCertificate'])
        ->name('certificates.download');
        
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

        Route::post('/quizzes', [QuizController::class, 'store']);

        Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
        Route::patch('/questions/{question}', [QuestionController::class, 'update']);
        Route::patch('/quizzes/{quiz}', [QuizController::class, 'update']);
        // Route::get('/courses/{course}/structure', [CourseController::class, 'structure']);
        Route::post('/quizzes/{quiz}/questions', [QuestionController::class, 'store']);
        Route::delete('/questions/{question}', [QuestionController::class, 'destroy']);
        Route::get('/logs', [ApiLogController::class, 'index']);
        Route::get('/logs/{id}', [ApiLogController::class, 'show']);

        Route::get('/enrollments', [CourseController::class, 'getEnrollmentData']);
        Route::post('/enroll/approve', [CourseController::class, 'approveEnrollment']);
        
        Route::delete('/enroll/{userId}/{courseId}', [CourseController::class, 'unrollStudent']);
        
        Route::post('/questions/{question}/options', [OptionController::class, 'store']);
    // Обновление текста варианта
    Route::patch('/options/{option}', [OptionController::class, 'update']);
    // Переключение правильного ответа
    Route::patch('/options/{option}/correct', [OptionController::class, 'toggleCorrect']);
    // Удаление варианта
    Route::delete('/options/{option}', [OptionController::class, 'destroy']);
        
        });
        
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
Route::post('quizzes/{quiz}/submit', [QuizController::class, 'submit']);
});
