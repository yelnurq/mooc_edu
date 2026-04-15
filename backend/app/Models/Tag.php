<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = ['name', 'slug'];

    // Связь с темами
    public function topics(): BelongsToMany
    {
        return $this->belongsToMany(Topic::class);
    }
}