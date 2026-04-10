<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CourseUser extends Pivot
{
    protected $table = 'course_user';

    public static function boot()
    {
        parent::boot();

        static::updated(function ($model) {
            // Если прогресс стал 100 и раньше сертификата не было
            if ($model->progress >= 100) {
                Certificates::firstOrCreate([
                    'user_id' => $model->user_id,
                    'course_id' => $model->course_id,
                ], [
                    'certificate_number' => 'ID-' . $model->user_id . '-' . $model->course_id . '-' . time(),
                ]);
            }
        });
    }
}