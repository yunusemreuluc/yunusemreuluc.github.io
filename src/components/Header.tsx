import { useEffect, useState } from 'react';
import { LangSwitch, useLang } from '../i18n';

/** Top bar: wordmark, on-air lamp, season shortcuts, language — plus a playback-style scroll scrubber. */
export default function Header({ onSeason }: { onSeason: (i: number) => void }) {
  const { t } = useLang();
  const progress = useScrollProgress();

  const jump = (i: number) => {
    onSeason(i);
    document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="bar">
      <div className="bar-inner">
        <a className="mark" href="#pilot" aria-label={t.name}>
          <span className="mark-screen" aria-hidden>
            <span />
          </span>
          <span className="mark-name">{t.name}</span>
        </a>
        <span className="onair" aria-hidden>
          <span className="lamp" />
          {t.ui.onAir}
        </span>
        <nav className="bar-seasons" aria-label={t.ui.seasonsLabel}>
          {t.seasons.map((s, i) => (
            <button key={s.id} type="button" onClick={() => jump(i)}>
              <span className="mono">S{String(i + 1).padStart(2, '0')}</span> {s.title}
            </button>
          ))}
        </nav>
        <LangSwitch />
      </div>
      <div className="scrubber" role="progressbar" aria-label={t.ui.progressLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </header>
  );
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      setP(max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return p;
}
