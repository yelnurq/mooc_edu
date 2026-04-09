<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function store(Request $request, Quiz $quiz)
{
    $question = $quiz->questions()->create([
        'question_text' => $request->question_text,
        'points' => $request->points ?? 1
    ]);

    return response()->json($question, 201);
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
