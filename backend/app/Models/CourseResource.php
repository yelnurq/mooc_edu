<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseResource extends Model
{
    protected $fillable = ['course_id', 'title', 'type', 'file_path', 'video_url', 'is_promo', 'order'];
}
