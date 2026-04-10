<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Course;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Certificate;
class CertificateController extends Controller
{
public function downloadCertificate($id)
{
    $user = auth()->user();
    $certificate = Certificate::where('user_id', $user->id)->where('course_id', $id)->firstOrFail();
    $course = Course::findOrFail($id);

    // Получаем путь к картинке
    $path = storage_path("app/public/images/certificate_template.jpg");
    
    // Проверяем, существует ли файл, чтобы избежать ошибок
    if (!file_exists($path)) {
        return response()->json(['message' => 'Template not found'], 404);
    }

    // Конвертируем в Base64
    $type = pathinfo($path, PATHINFO_EXTENSION);
    $data = file_get_contents($path);
    $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);

    $pdfData = [
        'userName'   => $user->name,
        'courseName' => $course->title,
        'certNumber' => $certificate->certificate_number,
        'date'       => $certificate->issued_at->format('d.m.Y'),
        'image'      => $base64, // Передаем готовую строку
    ];

    $pdf = Pdf::loadView('pdf.certificate', $pdfData)->setPaper('a4', 'landscape');
    return $pdf->download("Certificate.pdf");
}
}
