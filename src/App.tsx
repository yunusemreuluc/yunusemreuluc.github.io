import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import Intro from './components/Intro';
import Header from './components/Header';
import Hero from './components/Hero';
import Seasons from './components/Seasons';
import EpisodeModal from './components/EpisodeModal';
import Player from './components/Player';
import Credits from './components/Credits';
import { EASE } from './components/fx';
import { useLang } from './i18n';

export type Cursor = { season: number; episode: number };

const SEEN = 'yunus-series:intro-seen';

function introSeen() {
  try {
    return sessionStorage.getItem(SEEN) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const { t } = useLang();
  const [intro, setIntro] = useState(() => !introSeen());
  const [season, setSeason] = useState(0);
  const [open, setOpen] = useState<Cursor | null>(null);
  const [playing, setPlaying] = useState<Cursor | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const page = useRef<HTMLDivElement>(null);
  const overlay = intro || open !== null || playing !== null;

  // Anything behind an overlay can't be focused or read out; focus returns to what opened it.
  useEffect(() => {
    if (page.current) page.current.inert = overlay;
    if (!overlay && opener.current) {
      const target = opener.current.isConnected ? opener.current : document.querySelector<HTMLElement>('[role=tab][aria-selected=true]');
      target?.focus({ preventScroll: true });
      opener.current = null;
    }
  }, [overlay]);

  const remember = () => {
    if (!opener.current) opener.current = document.activeElement as HTMLElement | null;
  };

  const endIntro = useCallback(() => {
    setIntro(false);
    try {
      sessionStorage.setItem(SEEN, '1');
    } catch {
      // The intro will simply play again next visit.
    }
  }, []);

  const openEpisode = useCallback((c: Cursor) => {
    remember();
    setOpen(c);
  }, []);

  const play = useCallback((from: Cursor = { season: 0, episode: 0 }) => {
    remember();
    setOpen(null);
    setPlaying(from);
  }, []);

  const stop = useCallback((last: Cursor | null) => {
    setPlaying(null);
    if (last) setSeason(last.season);
  }, []);

  return (
    <LayoutGroup>
      <div className="grain" aria-hidden />
      <AnimatePresence>{intro && <Intro key="intro" onDone={endIntro} />}</AnimatePresence>

      <motion.div
        ref={page}
        initial={false}
        animate={intro ? { opacity: 0, scale: 1.03, filter: 'blur(10px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none', transform: 'none' } }}
        transition={{ duration: 1, ease: EASE }}
      >
        <a className="skip" href="#guide">
          {t.ui.skip}
        </a>
        <Header onSeason={setSeason} />
        <main>
          <Hero key={intro ? 'waiting' : 'live'} onPlay={() => play()} />
          <Seasons season={season} onSeason={setSeason} onOpen={openEpisode} />
          <Credits
            onReplay={() => {
              remember();
              scrollTo({ top: 0 });
              setIntro(true);
            }}
          />
        </main>
      </motion.div>

      <AnimatePresence>
        {open && <EpisodeModal key="episode" at={open} onClose={() => setOpen(null)} onMove={setOpen} onPlay={play} />}
      </AnimatePresence>
      <AnimatePresence>{playing && <Player key="player" start={playing} onClose={stop} />}</AnimatePresence>
    </LayoutGroup>
  );
}
