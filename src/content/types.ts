export type Lang = 'en' | 'tr';

export type Metric = { value: string; label: string };

export type Episode = {
  id: string;
  title: string;
  /** Short line under the title — role, place or category. */
  tagline: string;
  /** Air date, as printed on the resume. */
  date?: string;
  summary: string;
  points?: string[];
  metrics?: Metric[];
  tags?: string[];
  link?: { label: string; href: string };
};

/** One season per resume section, in the resume's own order. */
export type Season = {
  id: string;
  title: string;
  logline: string;
  episodes: Episode[];
};

export type UI = {
  langLabel: string;
  switchTo: string;
  onAir: string;
  skip: string;
  pilot: string;
  playAll: string;
  play: string;
  downloadCv: string;
  contact: string;
  season: string;
  episode: string;
  episodes: (n: number) => string;
  guideTitle: string;
  guideIntro: string;
  seasonsLabel: string;
  details: string;
  hideDetails: string;
  upNext: string;
  nextIn: (s: number) => string;
  finale: string;
  theEnd: string;
  pause: string;
  resume: string;
  previous: string;
  next: string;
  close: string;
  playerLabel: string;
  progressLabel: string;
  creditsTitle: string;
  starring: string;
  builtWith: string;
  basedIn: string;
  languages: string;
  email: string;
  replay: string;
  licenseNote: string;
  pdfNote?: string;
};

export type Content = {
  name: string;
  role: string;
  location: string;
  email: string;
  links: { github: string; linkedin: string };
  cvFile: string;
  photoAlt: string;
  /** The resume summary — shown as the pilot. */
  pilot: string[];
  highlights: Metric[];
  seasons: Season[];
  spoken: string[];
  stack: string[];
  ui: UI;
};
