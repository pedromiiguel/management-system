// Resumo das notas do Lighthouse por página, em Markdown, a partir do
// manifest.json que o lhci grava (upload `filesystem`). Uso:
//   node lighthouse/summary.mjs lighthouse-report >> "$GITHUB_STEP_SUMMARY"
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'lighthouse-report';
const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
const categories = [
  ['performance', 'Desempenho'],
  ['accessibility', 'Acessibilidade'],
  ['best-practices', 'Boas práticas'],
  ['seo', 'SEO'],
];
const score = (value) => {
  if (value == null) return '—';
  const n = Math.round(value * 100);
  return `${n >= 90 ? '🟢' : n >= 50 ? '🟠' : '🔴'} ${n}`;
};

const rows = manifest
  .filter((run) => run.isRepresentativeRun)
  .map((run) => {
    const path = new URL(run.url).pathname;
    const cells = categories.map(([key]) => score(run.summary[key]));
    return `| \`${path}\` | ${cells.join(' | ')} |`;
  });

console.log('## Lighthouse\n');
console.log(`| Página | ${categories.map(([, label]) => label).join(' | ')} |`);
console.log(`| --- | ${categories.map(() => '---:').join(' | ')} |`);
console.log(rows.join('\n'));
console.log('\nRelatórios completos (HTML): artefato `lighthouse` desta execução.');
