<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
public function store(Request $request, Quiz $quiz)
{
    // Создаем вопрос и сразу 4 опции к нему одной транзакцией
    return DB::transaction(function () use ($quiz) {
        $question = $quiz->questions()->create([
            'question_text' => 'НОВЫЙ ВОПРОС',
            'points' => 1
        ]);

        $options = [];
        for ($i = 1; $i <= 4; $i++) {
            $options[] = [
                'option_text' => "Вариант $i",
                'is_correct' => $i === 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        $question->options()->createMany($options);
        
        // Возвращаем вопрос со всеми созданными опциями
        return $question->load('options');
    });
}
public function update(Request $request, Question $question)
{
    $question->update($request->only('question_text', 'points'));
    return response()->json($question);
}
public function destroy(Question $question)
{
    $question->delete();
    return response()->json(null, 204);
}
}
