<!DOCTYPE html>
<html lang="ru">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Сертификат</title>
    <style>
        /* 1. Настройки страницы A4 Альбомная */
        @page {
            size: a4 landscape;
            margin: 0; /* Убираем стандартные отступы PDF */
        }

        body {
            font-family: 'DejaVu Sans', sans-serif; /* Шрифт с поддержкой кириллицы */
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
        }
    .cert-container {
        position: relative;
        width: 100%;
        height: 100%;
        /* Используем переменную с Base64 */
        background-image: url('{{ $image }}');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
    }
        /* 3. Общий стиль для всех текстовых блоков (поверх шаблона) */
        .text-overlay {
            position: absolute;
            text-align: center;
            /* Включаем, если нужно видеть границы блоков при отладке */
            /* border: 1px solid red; */
        }

        /* 4. Позиционирование конкретных текстовых полей */
        
        /* Поле "ФИО Студента" */
        .student-name {
            top: 45%; /* Позиция сверху (в % от высоты листа) */
            left: 10%; /* Позиция слева */
            width: 80%; /* Ширина блока для центрирования текста */
            
            font-size: 48px;
            font-black: black;
            font-weight: bold;
            text-transform: uppercase; /* Все заглавные */
            letter-spacing: 2px;
        }

        /* Поле "Название Курса" */
        .course-name {
            top: 65%;
            left: 15%;
            width: 70%;
            
            font-size: 28px;
            color: #4f46e5; /* Пример цвета (Indigo 600) */
            font-style: italic;
        }

        /* Поле "Дата выдачи" */
        .issued-date {
            bottom: 10%; /* Позиция снизу */
            right: 10%;
            width: 200px;
            
            font-size: 16px;
            color: #64748b; /* Slate 500 */
        }

    </style>
</head>
<body>
    <div class="cert-container">
        <div class="text-overlay student-name">
            {{ $userName }}
        </div>

        <div class="text-overlay course-name">
            {{ $courseName }}
        </div>

        <div class="text-overlay issued-date">
            {{ $date }}
        </div>
        <div class="text-overlay cert-number">
    № {{ $certNumber }}
</div>
    </div>
</body>
</html>