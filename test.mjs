// White-box tests: build a handful of hand-written sites and compare with expected trees recorded from the
// reference build (goldens.json). They catch the rules the drawn cases rarely reach: every Unicode whitespace
// in reading time, literal-markdown escapes, nested inline marks, month names, broken-link deduplication, slugs
// that collide or hit a reserved name, template scope and falsiness, and the exact report lines of refusals.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { run } from './solve.js';

const goldens = JSON.parse(readFileSync(new URL('./goldens.json', import.meta.url), 'utf8'));
const template = '{{ page.title }}|{{ page.date_long }}|{{ page.reading_minutes }}|{{{ page.content }}}';
const base = {
  site: { title: 'Test & Site', base_url: 'https://example.test/blog/', per_page: 5, recent: 3 },
  templates: { page: template, post: template, index: '{{ site.title }}', tag: '{{ tag.name }}', tags: '{{ tags }}' },
};
const site = (files, templates = base.templates) => ({ ...base, templates, files });
const cases = {
  whitespace: () =>
    site([{ path: 'sample.md', content: '---\ntitle: Sample\n---\n' + Array.from({ length: 201 }, () => 'word').join('\u1680') }]),
  inline: () =>
    site([
      {
        path: 'sample.md',
        content: '---\ntitle: Sample\n---\n\\*literal\\* **strong *nested*** [escaped \\*](#anchor) `a&<b>`\n\n> \\>quote\n\n3. one\n4. two\n  continued\n\n```js\n<&>\n```',
      },
    ]),
  months: () =>
    site(
      Array.from({ length: 12 }, (_, n) => ({
        path: `posts/${n}.md`,
        content: `---\ntitle: Month ${n}\ndate: 2024-${String(n + 1).padStart(2, '0')}-01\n---\nbody`,
      })),
    ),
  broken: () => site([{ path: 'sample.md', content: '---\ntitle: Sample\n---\n[a](missing.md) [b](missing.md)\n\n[c](missing.md)' }]),
  slugs: () =>
    site(
      ['café', 'cafe', '東京', 'posts', 'tags', 'page', 'Ｗｉｄｅ', '𝟙 𝟚', 'x'.repeat(63) + ' abc'].map((title, i) => ({
        path: `${i}.md`,
        content: `---\ntitle: ${title}\n---\n## café\n## cafe\ntext`,
      })),
    ),
  scope: () =>
    site(
      [
        { path: 'sample.md', content: '---\ntitle: Sample\n---\nbody' },
        { path: 'posts/a.md', content: '---\ntitle: Post\ndate: 2024-02-29\ntags: [C++, C#]\n---\nhello' },
      ],
      {
        ...base.templates,
        page: '{% for t in tags %}{{ t.name }}{% endfor %}{% if not page.tags %}no tags{% endif %}{% include "nested" %}',
        nested: '{% for p in recent %}{{ loop.index }}:{{ p.title }}{% include "tail" %}{% endfor %}',
        tail: '{{ loop.last }}|{{ p.tags }}',
      },
    ),
  refusals: () => {
    const files = [{ path: 'sample.md', content: '---\ntitle: Sample\n---\nbody' }];
    for (const [i, extra] of ['date: 2025-02-29', 'title: Duplicate', 'unknown: x', 'tags: [one, "two"]', 'draft: yes', 'layout: bad'].entries()) {
      files.push({ path: `bad${i}.md`, content: `---\ntitle: Bad\n${extra}\n---\nx` });
    }
    return site(files, { ...base.templates, bad: '{% if page %}unclosed' });
  },
};

for (const [name, make] of Object.entries(cases)) {
  test(`matches the reference tree: ${name}`, () => {
    assert.deepEqual(run(make()), goldens[name]);
  });
}

test('runs are pure: no input mutation, no state carried between builds', () => {
  const a = site([{ path: 'sample.md', content: '---\ntitle: Sample\n---\n## Some **title**\n\nbody' }]);
  const b = site([{ path: 'other.md', content: '---\ntitle: Other\n---\n## another\n\nnew' }]);
  const copy = structuredClone(a);
  const first = run(a);
  run(b);
  assert.deepEqual(run(a), first);
  assert.deepEqual(a, copy);
});
