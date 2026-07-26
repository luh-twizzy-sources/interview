const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

const pdfSections = [
  {
    moduleKey: 'java-core',
    moduleTitle: 'Java Core',
    href: 'java_core_questions.html',
    accent: '#2563eb',
    file: 'java_core_questions.html'
  },
  {
    moduleKey: 'hibernate-db',
    moduleTitle: 'Hibernate, JPA и базы данных',
    href: 'hibernate_jpa_database_questions.html',
    accent: '#0d9488',
    file: 'hibernate_jpa_database_questions.html'
  },
  {
    moduleKey: 'spring',
    moduleTitle: 'Spring и Spring Boot',
    href: 'spring_questions.html',
    accent: '#16a34a',
    file: 'spring_questions.html'
  },
  {
    moduleKey: 'microservices',
    moduleTitle: 'Microservices, Kafka, Docker и REST',
    href: 'microservices_kafka_docker_rest_questions.html',
    accent: '#be123c',
    file: 'microservices_kafka_docker_rest_questions.html'
  }
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function decodeHtml(value) {
  return String(value)
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDelimited(source, marker, openChar, closeChar) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Marker not found: ${marker}`);
  }

  const start = source.indexOf(openChar, markerIndex);
  if (start === -1) {
    throw new Error(`Opening delimiter not found after marker: ${marker}`);
  }

  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === openChar) {
      depth += 1;
    } else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error(`Closing delimiter not found for marker: ${marker}`);
}

function extractAnswerTexts(html, file) {
  const literal = extractDelimited(html, 'const answerTexts =', '{', '}');
  try {
    return JSON.parse(literal);
  } catch (error) {
    throw new Error(`Cannot parse answerTexts in ${file}: ${error.message}`);
  }
}

function parsePdfSection(section) {
  const html = read(section.file);
  const answerTexts = extractAnswerTexts(html, section.file);
  const entries = [];
  const sectionRegex = /<section class="topic" id="([^"]+)" data-total="(\d+)" style="--accent: ([^;]+);">([\s\S]*?)<\/section>/g;
  let sectionMatch;

  while ((sectionMatch = sectionRegex.exec(html))) {
    const [, topicId, dataTotal, topicAccent, topicHtml] = sectionMatch;
    const topicTitle = decodeHtml((topicHtml.match(/<span class="topic-title">([\s\S]*?)<\/span>/) || [null, 'Без темы'])[1]);
    const topicKicker = decodeHtml((topicHtml.match(/<span class="topic-kicker">([\s\S]*?)<\/span>/) || [null, ''])[1]);
    const difficulty = decodeHtml((topicHtml.match(/<span class="difficulty">([\s\S]*?)<\/span>/) || [null, ''])[1]);
    const questionRegex = /<li class="question"[^>]*>[\s\S]*?<span class="question-number">#(\d+)<\/span>[\s\S]*?<span class="question-text">([\s\S]*?)<\/span>[\s\S]*?<\/li>/g;
    let questionMatch;
    let actualTotal = 0;

    while ((questionMatch = questionRegex.exec(topicHtml))) {
      const number = questionMatch[1];
      const question = decodeHtml(questionMatch[2]);
      const id = `q-${number}`;
      actualTotal += 1;
      entries.push({
        id: `${section.moduleKey}-${id}`,
        sourceId: id,
        sourceNumber: `#${number}`,
        sourceType: 'pdf',
        moduleKey: section.moduleKey,
        moduleTitle: section.moduleTitle,
        topicId,
        topicTitle,
        topicKicker,
        difficulty,
        question,
        answer: answerTexts[id] || '',
        href: `${section.href}#${topicId}`,
        accent: topicAccent || section.accent
      });
    }

    if (actualTotal !== Number(dataTotal)) {
      throw new Error(`${section.file} ${topicId}: expected ${dataTotal}, got ${actualTotal}`);
    }
  }

  return entries;
}

function parseAlgorithmicSection() {
  const html = read('algorithmic_section.html');
  const literal = extractDelimited(html, 'const topicsData =', '[', ']');
  const topics = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });

  return topics.flatMap((topic) => topic.tasks.map((task) => ({
    id: task.id,
    sourceId: task.id,
    sourceNumber: task.number,
    sourceType: 'algorithm',
    moduleKey: 'algorithmic',
    moduleTitle: 'Алгоритмическая секция',
    topicId: topic.id,
    topicTitle: topic.title,
    topicKicker: topic.kicker,
    difficulty: task.difficulty,
    question: `${task.title} (${task.leetcode})`,
    answer: task.answer,
    href: task.url,
    accent: topic.accent,
    leetcode: task.leetcode,
    acceptance: task.acceptance,
    frequency: task.frequency,
    tags: task.topics
  })));
}

const questionBank = [
  ...pdfSections.flatMap(parsePdfSection),
  ...parseAlgorithmicSection()
];

const pdfQuestions = new Set(questionBank.filter((item) => item.sourceType === 'pdf').map((item) => item.sourceId));
const missingPdf = [];
for (let number = 1; number <= 516; number += 1) {
  if (!pdfQuestions.has(`q-${number}`)) {
    missingPdf.push(number);
  }
}

if (missingPdf.length) {
  throw new Error(`Missing PDF questions: ${missingPdf.join(', ')}`);
}

const output = `// Generated by scripts/generate_interview_bank.js from the local study HTML files.\n` +
  `// Do not edit by hand when changing source questions; regenerate this file instead.\n` +
  `window.INTERVIEW_QUESTION_BANK = ${JSON.stringify(questionBank, null, 2)};\n`;

fs.writeFileSync(path.join(root, 'interview_question_bank.js'), output);

console.log(`Generated interview_question_bank.js with ${questionBank.length} entries.`);
console.log(`PDF unique questions: ${pdfQuestions.size}/516.`);
console.log(`Algorithmic tasks: ${questionBank.filter((item) => item.sourceType === 'algorithm').length}.`);
