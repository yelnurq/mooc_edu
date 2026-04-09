<?php

namespace App\Http\Controllers;

use App\Models\Option;
use App\Models\Question;
use Illuminate\Http\Request;

class OptionController extends Controller
{
    public function store(Request $request, Question $question) {
    return $question->options()->create($request->all());
}

public function update(Request $request, Option $option) {
    $option->update($request->only('option_text'));
    return $option;
}

public function toggleCorrect(Option $option) {
    // Делаем все ответы вопроса НЕ правильными
    $option->question->options()->update(['is_correct' => false]);
    // Делаем текущий правильным
    $option->update(['is_correct' => true]);
    return response()->json(['status' => 'success']);
}

public function destroy(Option $option) {
    $option->delete();
    return response()->json(null, 204);
}
}
