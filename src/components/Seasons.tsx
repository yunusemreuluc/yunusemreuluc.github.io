import { useId, useRef, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Cursor } from '../App';
import { useRailScroll } from '../hooks/useRailScroll';
import { code, useLang } from '../i18n';
import { EASE, PosterArt, Reveal, SplitTitle } from './fx';

/** Season tabs (resume sections, in order) and a rail of episode posters for the selected season. */
export default function Seasons({ season, onSeason, onOpen }: { season: number; onSeason: (i: number) => void; onOpen: (c: Cursor) => void }) {
  const { t } = useLang();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const rail = useRef<HTMLDivElement | null>(null);
  const railScroll = useRailScroll();
  const tabsScroll = useRailScroll();
  const panel = useRef<HTMLDivElement>(null);
  const railRef = (el: HTMLDivElement | null) => {
    rail.current = el;
    railScroll(el);
  };
  const base = useId();
  const current = t.seasons[season];

  const pick = (i: number) => {
    // Hold the panel's height while the old season animates out, so the page doesn't jump.
    if (i !== season && panel.current) panel.current.style.minHeight = `${panel.current.offsetHeight}px`;
    onSeason(i);
    rail.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  // WAI-ARIA tabs: arrows / Home / End move between seasons.
  const onKey = (e: KeyboardEvent) => {
    const n = t.seasons.length;
    const to = { ArrowRight: season + 1, ArrowLeft: season - 1, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const next = (to + n) % n;
    pick(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="guide" className="seasons" aria-label={t.ui.guideTitle}>
      <Reveal className="section-head">
        <p className="eyebrow mono">{t.ui.guideIntro}</p>
        <SplitTitle text={t.ui.guideTitle} className="section-title" />
      </Reveal>

      <div ref={tabsScroll} className="tabs" role="tablist" aria-label={t.ui.seasonsLabel} onKeyDown={onKey}>
        {t.seasons.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`${base}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === season}
            aria-controls={`${base}-panel`}
            tabIndex={i === season ? 0 : -1}
            onClick={() => pick(i)}
          >
            {i === season && <motion.span layoutId="season-pill" className="tab-pill" transition={{ duration: 0.5, ease: EASE }} />}
            <span className="tab-num mono">S{String(i + 1).padStart(2, '0')}</span>
            <span className="tab-title">{s.title}</span>
          </button>
        ))}
      </div>

      <div ref={panel} id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${season}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.id}-${t.ui.langLabel}`}
            initial={{ opacity: 0, x: 60, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -60, filter: 'blur(10px)' }}
            transition={{ duration: 0.55, ease: EASE }}
            // Release the height lock once the new season has fully entered (also covers interrupted switches).
            onAnimationComplete={(def) => {
              // Fires for the exit too; only the enter animation ends at full opacity.
              if ((def as { opacity?: number }).opacity !== 1 || !panel.current) return;
              panel.current.style.minHeight = '';
            }}
          >
            <div className="season-head">
              <h3 className="season-title">
                <span className="season-outline">S{String(season + 1).padStart(2, '0')}</span> {current.title}
              </h3>
              <p className="season-meta mono">{t.ui.episodes(current.episodes.length)}</p>
              <p className="season-logline">{current.logline}</p>
            </div>

            <div ref={railRef} className="rail">
              {current.episodes.map((ep, i) => (
                <motion.button
                  key={ep.id}
                  type="button"
                  className="poster"
                  onClick={() => onOpen({ season, episode: i })}
                  aria-label={t.ui.openEpisode(ep.title)}
                  initial={{ opacity: 0, y: 40, rotateY: -12 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ duration: 0.7, delay: 0.08 * i, ease: EASE }}
                  whileHover={{ y: -10 }}
                >
                  <motion.div layoutId={`art-${season}-${ep.id}`} className="poster-frame">
                    <PosterArt season={season} episode={i} id={ep.id} />
                  </motion.div>
                  <span className="poster-code mono">{code(season, i)}</span>
                  <span className="poster-play" aria-hidden>
                    ▶
                  </span>
                  <span className="poster-body">
                    <motion.span layoutId={`title-${season}-${ep.id}`} className="poster-title">
                      {ep.title}
                    </motion.span>
                    <span className="poster-tagline">{ep.tagline}</span>
                    {ep.date && <span className="poster-date mono">{ep.date}</span>}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
