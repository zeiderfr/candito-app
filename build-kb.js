const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'AI-KNOWLEDGE-BASE');

// --- Destination 1 : Client (app/src/data) ---
const clientDir = path.join(__dirname, 'app/src/data');
const clientFile = path.join(clientDir, 'knowledgeBase.ts');

// --- Destination 2 : Worker (functions/api) ---
const workerDir = path.join(__dirname, 'functions/api');
const workerFile = path.join(workerDir, '_kb-data.ts');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
let content = '';

for (const file of files) {
  content += '\n\n--- ' + file + ' ---\n\n';
  content += fs.readFileSync(path.join(dir, file), 'utf8');
}

// Generate client file
if (!fs.existsSync(clientDir)) {
  fs.mkdirSync(clientDir, { recursive: true });
}
fs.writeFileSync(clientFile, 'export const KNOWLEDGE_BASE = ' + JSON.stringify(content) + ';');
console.log('✅ Client KB  → ' + clientFile);

// Generate worker file
if (!fs.existsSync(workerDir)) {
  fs.mkdirSync(workerDir, { recursive: true });
}
fs.writeFileSync(workerFile, '/** Auto-generated — do not edit. Run `node build-kb.js` to regenerate. */\nexport const KNOWLEDGE_BASE = ' + JSON.stringify(content) + ';\n');
console.log('✅ Worker KB  → ' + workerFile);
