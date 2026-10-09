import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import en from './content/en';
import tr from './content/tr';
import type { Content, Lang } from './content/types';

const CONTENT: Record<Lang, Content> = { en, tr };
const KEY = 'yunus-series:lang';

function pickInitial(): Lang {
  try {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (fromUrl === 'en' || fromUrl === 'tr') return fromUrl;
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'tr') return saved;
  } catch {
    // Storage can be blocked (private mode); fall back to the browser language.
  }
  return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

const LangContext = createContext<{ lang: Lang; t: Content; setLang: (l: Lang) => void } | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(pickInitial);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'tr' ? 'Yunus Emre Uluç — Dizi' : 'Yunus Emre Uluç — The Series';
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      // Not persisted; the choice still applies for this visit.
    }
  }, [lang]);

  const value = useMemo(() => ({ lang, t: CONTENT[lang], setLang }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang needs <LangProvider>');
  return ctx;
}

export function LangSwitch() {
  const { lang, setLang, t } = useLang();
  return (
    <div className="lang" role="group" aria-label={t.ui.switchTo}>
      {(['tr', 'en'] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** "S01E03" style code for a season/episode index pair. */
export const code = (season: number, episode: number) => `S${String(season + 1).padStart(2, '0')}E${String(episode + 1).padStart(2, '0')}`;

export const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;
