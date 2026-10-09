import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Pilot from './components/Pilot';
import Guide from './components/Guide';
import Player from './components/Player';
import Credits from './components/Credits';
import { useLang } from './i18n';

export type Cursor = { season: number; episode: number };

export default function App() {
  const { t } = useLang();
  const [season, setSeason] = useState(0);
  const [playing, setPlaying] = useState<Cursor | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const page = useRef<HTMLDivElement>(null);

  // While the player is open the page behind it can't be focused or read out.
  useEffect(() => {
    if (page.current) page.current.inert = playing !== null;
    // Focus goes back to whatever opened the player, once the page is focusable again.
    if (playing === null && opener.current) {
      // The opening button may be gone (another season is shown now) — fall back to the active season tab.
      const target = opener.current.isConnected ? opener.current : document.querySelector<HTMLElement>('[role=tab][aria-selected=true]');
      target?.focus();
    }
  }, [playing]);

  const play = useCallback((from: Cursor = { season: 0, episode: 0 }) => {
    opener.current = document.activeElement as HTMLElement | null;
    setPlaying(from);
  }, []);

  const stop = useCallback((last: Cursor | null) => {
    setPlaying(null);
    // Leave the guide on the season the viewer stopped at.
    if (last) setSeason(last.season);
  }, []);

  return (
    <>
      <div ref={page}>
        <a className="skip" href="#guide">
          {t.ui.skip}
        </a>
        <Header onSeason={setSeason} />
        <main>
          <Pilot onPlay={() => play()} />
          <Guide season={season} onSeason={setSeason} onPlay={play} />
          <Credits />
        </main>
      </div>
      {playing && <Player start={playing} onClose={stop} />}
    </>
  );
}
