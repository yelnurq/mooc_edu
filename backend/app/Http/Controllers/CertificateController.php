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
public function certificates(Request $request)
    {
        $user = $request->user();

        $certificates = Certificate::where('user_id', $user->id)
            // Добавляем course_id в выборку, чтобы оно было доступно в коллекции
            ->with(['course:id,title,category,image']) 
            ->orderBy('issued_at', 'desc')
            ->get()
            ->map(function ($cert) {
                return [
                    'id' => $cert->id,
                    'course_id' => $cert->course_id, // КЛЮЧЕВАЯ СТРОКА: теперь фронтенд увидит ID курса
                    'course_title' => $cert->course->title ?? 'Без названия',
                    'category' => $cert->course->category ?? 'Общее',
                    'preview_image' => $cert->course->image_url ?? null, 
                    'issue_date' => $cert->issued_at->format('d.m.Y'),
                    'uuid' => $cert->certificate_number,
'download_url' => route('certificates.download', ['number' => $cert->certificate_number]),
                ];
            });

        return response()->json($certificates);
    }
public function verifyCertificate($number)
{
    // Ищем сертификат вместе с данными пользователя и курса
    $certificate = Certificate::with(['user:id,name', 'course:id,title'])
        ->where('certificate_number', $number)
        ->first();

    if (!$certificate) {
        return response()->json([
            'valid' => false,
            'message' => 'Сертификат с таким номером не найден'
        ], 404);
    }

    return response()->json([
        'valid' => true,
        'data' => [
            'student_name' => $certificate->user->name,
            'course_title' => $certificate->course->title,
            'issued_at' => $certificate->issued_at->format('d.m.Y'),
            'certificate_number' => $certificate->certificate_number
        ]
    ]);
}
public function downloadCertificate($number)
{
    $user = auth()->user();

    // Ищем сертификат по номеру и принадлежности пользователю
    $certificate = Certificate::where('user_id', $user->id)
        ->where('certificate_number', $number)
        ->firstOrFail();

    // Загружаем связанные данные курса
    $course = $certificate->course; 

    $path = storage_path("app/public/images/certificate_template.jpg");
    
    if (!file_exists($path)) {
        return response()->json(['message' => 'Template not found'], 404);
    }

    $type = pathinfo($path, PATHINFO_EXTENSION);
    $data = file_get_contents($path);
    $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);

    $pdfData = [
        'userName'   => $user->name,
        'courseName' => $course->title,
        'certNumber' => $certificate->certificate_number,
        'date'       => $certificate->issued_at->format('d.m.Y'),
        'image'      => $base64,
    ];

    $pdf = Pdf::loadView('pdf.certificate', $pdfData)->setPaper('a4', 'landscape');
    
    // Название файла теперь тоже может содержать номер
    return $pdf->download("Certificate-{$number}.pdf");
}
}
