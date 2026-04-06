<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Token extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    protected $fillable = [
        "token",
        "user_id"
    ];
    public $timestamps = false;
}
