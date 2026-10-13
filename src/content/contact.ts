// Contact details for the Exit Portal and the résumé page.
//
// DRAFT (2026-10-13): the owner confirms each line. Empty URLs are left out of the game and the
// résumé.

export interface ContactLink {
  label: string;
  /** Shown text, e.g. "github.com/vytzab". */
  text: string;
  url: string;
}

export const CONTACT = {
  email: 'baltibytes@gmail.com',
  /** One line on what you're open to. */
  availability: 'TODO: e.g. "Open to software engineering roles, in Vilnius or remote."',
  location: 'TODO: e.g. Vilnius, Lithuania',
  links: [
    { label: 'GitHub', text: 'github.com/vytzab', url: 'https://github.com/vytzab' },
    { label: 'LinkedIn', text: 'TODO', url: '' }, // TODO: your profile URL
  ] as ContactLink[],
  resume: {
    /** The printable page built from the content in this folder. */
    page: '/resume.html',
    /** Your own PDF instead, if you prefer: put it in public/ and set e.g. '/resume.pdf'. */
    pdf: null as string | null,
  },
};

export const contactLinks = (): ContactLink[] => CONTACT.links.filter((l) => l.url);
