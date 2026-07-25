# Java Interview Prep

Статический сайт для подготовки к Java interview. Главная страница `index.html` объединяет четыре PDF-раздела, отдельную алгоритмическую секцию, исходный PDF и дополнительные схемы.

## Локальный просмотр

Открой `index.html` в браузере из корня проекта.

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

## Алгоритмическая секция

Файл `algorithmic_section.html` содержит 18 задач Tinkoff с CodeJeet: 7 Easy, 11 Medium, 0 Hard. Это отдельный источник от PDF, поэтому он не входит в расчет покрытия `516/516` по PDF-вопросам.
