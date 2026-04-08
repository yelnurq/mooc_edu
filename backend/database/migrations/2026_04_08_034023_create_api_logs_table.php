<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('api_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('method'); // GET, POST, etc.
            $table->string('url');
            $table->json('payload')->nullable(); // Тело запроса
            $table->json('response')->nullable(); // Ответ сервера (по желанию)
            $table->string('ip_address')->nullable();
            $table->integer('duration_ms')->nullable(); // Время выполнения
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_logs');
    }
};
