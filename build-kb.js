const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'AI-KNOWLEDGE-BASE');
const destDir = path.join(__dirname, 'app/src/data');
const destFile = path.join(destDir, 'knowledgeBase.ts');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
let content = '';

for (const file of files) {
  content += '\n\n--- ' + file + ' ---\n\n';
  content += fs.readFileSync(path.join(dir, file), 'utf8');
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.writeFileSync(destFile, 'export const KNOWLEDGE_BASE = ' + JSON.stringify(content) + ';');
console.log('Knowledge base generated at ' + destFile);
