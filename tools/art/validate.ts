// Validates src/assets/manifest.json and the files it lists.
//   npm run art:validate                      # errors fail; placeholders are listed
//   npm run art:validate -- --no-placeholders # also fail on any placeholder (release gate)
// Exits 1 when there are errors, so `npm run build` (and CI) stop on a broken asset.
import { join } from 'node:path';
import { validateAssets } from './validate-assets.ts';

const assetRoot = join(import.meta.dirname, '../../src/assets');
const noPlaceholders = process.argv.includes('--no-placeholders');
const { issues, assetCount, placeholders } = validateAssets({ assetRoot, noPlaceholders });

const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');
for (const i of issues) console.log(`${i.level === 'error' ? '✗ error' : '! warning'}  ${i.asset}: ${i.message}`);

if (placeholders.length > 0 && !noPlaceholders) {
  console.log(`\n${placeholders.length} placeholder asset(s), not final art: ${placeholders.join(', ')}`);
}
const summary = `${assetCount} asset(s) checked: ${errors.length} error(s), ${warnings.length} warning(s).`;
if (errors.length > 0) {
  console.error(`\n✗ ${summary}`);
  process.exit(1);
}
console.log(`\n✓ ${summary}`);
