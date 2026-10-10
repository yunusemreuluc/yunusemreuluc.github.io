/**
 * Poster image per episode id (shared by both languages).
 * Real project material where it exists; generated key art otherwise.
 * `contain` frames a screenshot, chart or icon on the poster instead of filling it;
 * `dim` darkens a bright image so it sits with the rest of the dark posters.
 */
export type EpisodeImage = { src: string; fit?: 'cover' | 'contain'; real?: boolean; dim?: boolean };

export const EPISODE_IMAGES: Record<string, EpisodeImage> = {
  // Season 1 — AI Projects
  airon: { src: 'episodes/airon-icon.png', fit: 'contain', real: true }, // the app's own icon
  automation: { src: 'episodes/workflow.webp', real: true, dim: true }, // graphics produced by the pipeline (light background, dimmed)
  'fracture-ai': { src: 'episodes/fracture-roc.webp', fit: 'contain', real: true }, // ROC curves from the repo
  dengue: { src: 'episodes/dengue.webp' },
  // Season 2 — Experience
  'niceo-neo': { src: 'episodes/niceo.webp', real: true }, // NICEO app logo from the repo
  architecture: { src: 'episodes/architecture.webp' },
  // Season 3 — Skills
  programming: { src: 'episodes/programming.webp' },
  'ai-llms': { src: 'episodes/ai-llms.webp' },
  ml: { src: 'episodes/ml.webp' },
  apis: { src: 'episodes/apis.webp' },
  tools: { src: 'episodes/tools.webp' },
  // Season 4 — Education
  degree: { src: 'episodes/degree.webp' },
  thesis: { src: 'episodes/thesis.webp' },
  // Season 5 — Certifications and Languages
  ccna: { src: 'episodes/ccna.webp' },
  languages: { src: 'episodes/languages.webp' },
};
