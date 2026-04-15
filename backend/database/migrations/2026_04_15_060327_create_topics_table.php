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
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('clean_content')->nullable(); // Здесь будет версия с ***
            $table->string('clean_title')->nullable();
            $table->string('title');
            $table->text('content');
            $table->boolean('is_pinned')->default(false); // Закреплена ли тема
            $table->integer('views')->default(0); // Просмотры
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('topics');
    }
};
