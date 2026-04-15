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
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Это создаст likeable_id и likeable_type для связи с любыми моделями
            $table->morphs('likeable'); 
            $table->timestamps();
            $table->tinyInteger('value')->default(1); // 1 для лайка, -1 для дизлайка
            // Чтобы один пользователь не мог лайкнуть одну и ту же сущность дважды
            $table->unique(['user_id', 'likeable_id', 'likeable_type']);
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
