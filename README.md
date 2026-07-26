# Java Interview Prep

Статический сайт для подготовки к Java interview. Главная страница `index.html` объединяет четыре PDF-раздела, имитацию интервью, исходный PDF и дополнительные схемы.

## Локальный просмотр

Открой `index.html` в браузере из корня проекта.

## Имитация интервью

Файл `real_interview.html` запускает смешанную сессию Java backend интервью по локальному банку `interview_question_bank.js`. Банк строится только из PDF-вопросов. В конце можно сформировать Markdown/JSON-отчет с вопросами, своими ответами, самооценкой и кратким эталоном, чтобы отдельно проверить качество ответов.

Симулятор ведет статистику завершенных интервью: один сет равен 5 интервью, после закрытия сета показывается текстовый бейдж-награда.

Состояние хранится в `localStorage`:

- `real-interview-session-v1` - текущая сессия с вопросами, ответами и позицией.
- `real-interview-history-v1` - краткая статистика завершенных интервью и сетов.
- `real-interview-archive-v1` - полный архив завершенных интервью с вопросами, ответами, самооценками и эталонами.
- `real-interview-report-draft-v1` - последний сформированный отчет.

На странице интервью есть экспорт/импорт состояния JSON, чтобы переносить или резервировать прогресс.

Банк вопросов пересобирается из текущих HTML-разделов командой:

```bash
node scripts/generate_interview_bank.js
```

## Деплой на Vercel через GitHub

1. Создай GitHub repository.
2. Запушь содержимое этой папки в repository.
3. В Vercel выбери `Add New Project` и импортируй repository.
4. Framework Preset: `Other`.
5. Build Command: пусто.
6. Output Directory: `.`.
7. Нажми `Deploy`.

Пример команд для нового repository:

```bash
git init
git add .
git commit -m "Prepare static Java interview site"
git branch -M main
git remote add origin git@github.com:<user>/<repo>.git
git push -u origin main
```

Прогресс чеклистов, звездочек и тестов хранится в `localStorage` браузера. У локально открытых файлов и у Vercel-домена будут разные хранилища.
