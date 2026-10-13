// Which case studies this visitor has opened, so chests stay open and the guide can count them.
// Per-browser convenience only: storage can be missing or blocked (private windows), in which
// case progress simply lasts until the page closes.
const KEY = 'baltibytes.opened-case-studies';
const memory = new Set<string>();

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) for (const id of JSON.parse(raw) as string[]) memory.add(id);
  } catch {
    // No storage: keep what we have in memory.
  }
  return memory;
}

export function openedCaseStudies(): ReadonlySet<string> {
  return load();
}

export function markCaseStudyOpened(id: string): void {
  load().add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...memory]));
  } catch {
    // Ignore: progress stays in memory.
  }
}
