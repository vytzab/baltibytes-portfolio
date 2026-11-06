// Run with `npm test`. Ninelight's privacy policy, terms and changelog are Markdown rendered at build
// time by a deliberately small converter: these check what it supports, that it refuses everything
// else (so a pasted-in policy can't render wrong without failing the build), and that the real
// documents render.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markdownToHtml, renderNinelightDoc, renderNinelightHome } from '../../src/ninelight/render.ts';

const ROOT = new URL('../../', import.meta.url).pathname;

test('headings, paragraphs, lists, bold and links', () => {
  const html = markdownToHtml(
    '# Privacy Policy\n\n**App:** Ninelight\n**Contact:** a@b.c\n\n## What it stores\n\n- **Results** only\n- See [Google](https://policies.google.com/privacy?hl=en&x=1)\n',
  );
  assert.equal(
    html,
    [
      '<h1>Privacy Policy</h1>',
      '<p><strong>App:</strong> Ninelight<br />\n<strong>Contact:</strong> a@b.c</p>',
      '<h2 id="what-it-stores">What it stores</h2>',
      '<ul>\n  <li><strong>Results</strong> only</li>\n  <li>See <a href="https://policies.google.com/privacy?hl=en&amp;x=1">Google</a></li>\n</ul>',
    ].join('\n'),
  );
});

test('text is escaped', () => {
  assert.equal(markdownToHtml('Tom & Jerry <script>'), '<p>Tom &amp; Jerry &lt;script&gt;</p>');
});

test('unsupported Markdown fails instead of rendering wrong', () => {
  for (const md of [
    '1. first\n2. second',
    '| a | b |\n|---|---|',
    '> a quote',
    '```\ncode\n```',
    '- item\n  - nested',
    'text\n- a list without a blank line',
    '#### Too deep',
    'some *italic* text',
    'some `code`',
    '<b>html</b>',
  ]) {
    assert.throws(() => markdownToHtml(md), /Unsupported Markdown/, md);
  }
});

test('the privacy policy, the terms and the changelog render', () => {
  for (const doc of ['privacy', 'terms', 'changelog'] as const) {
    const html = renderNinelightDoc(ROOT, doc);
    assert.match(html, /<h1>.+<\/h1>/, doc);
    assert.match(html, /baltibytes@gmail\.com/, doc);
  }
});

test('the home page lists all nine skills with their icons', () => {
  const html = renderNinelightHome(ROOT);
  assert.equal(html.match(/class="nl-skill"/g)?.length, 9);
  assert.equal(html.match(/<svg aria-hidden="true"/g)?.length, 9);
  assert.doesNotMatch(html, /#[0-9a-fA-F]{6}/, 'icon colours come from the tile');
});
