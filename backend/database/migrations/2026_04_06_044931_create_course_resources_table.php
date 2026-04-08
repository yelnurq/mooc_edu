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
       Schema::create('course_resources', function (Blueprint $table) {
        $table->id();
        $table->foreignId('course_id')->constrained()->onDelete('cascade');
        $table->string('title'); 
        $table->enum('type', ['pdf', 'video']);
        $table->string('file_path')->nullable(); 
        $table->string('video_url')->nullable(); 
        
        // Галочка для проморолика
        $table->boolean('is_promo')->default(false);
        
        $table->integer('order')->default(0);
        $table->timestamps();

        // $table->unique(['course_id', 'is_promo'], 'unique_promo_per_course')->where('is_promo', true);
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_resources');
    }
};
