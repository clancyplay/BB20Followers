import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  NEWS_FEED,
  episodeTeaserFor,
  formatCountdown,
  nextEpisodeAt,
} from "./content";
import { HOTSTAR } from "./links";

export default function BroadcastBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const next = useMemo(() => nextEpisodeAt(now), [now]);
  const teaser = useMemo(() => episodeTeaserFor(next), [next]);
  const left = formatCountdown(next.getTime() - now.getTime());

  return (
    <section className="broadcast" aria-label="Tonight on Bigg Boss">
      <div className="broadcast-top">
        <div className="countdown-block">
          <p className="broadcast-kicker">
            <span className="live-dot" /> Next episode · JioHotstar 9:00 PM IST
          </p>
          {left.live ? (
            <p className="countdown-live">LIVE WINDOW · Open Hotstar now</p>
          ) : (
            <div className="countdown-digits" aria-live="polite">
              <div>
                <strong>{left.h}</strong>
                <span>hrs</span>
              </div>
              <div>
                <strong>{left.m}</strong>
                <span>min</span>
              </div>
              <div>
                <strong>{left.s}</strong>
                <span>sec</span>
              </div>
            </div>
          )}
        </div>

        <div className="episode-teaser">
          <span className="teaser-kind">{teaser.kind}</span>
          <h2>{teaser.title}</h2>
          <p>{teaser.blurb}</p>
        </div>

        <div className="broadcast-actions">
          <a
            className="stream-btn"
            href={HOTSTAR.show}
            target="_blank"
            rel="noopener noreferrer"
          >
            ▶ Stream on Hotstar
          </a>
          <a
            className="stream-btn ghost"
            href={HOTSTAR.episodes}
            target="_blank"
            rel="noopener noreferrer"
          >
            Old episodes
          </a>
          <a
            className="stream-btn ghost"
            href={HOTSTAR.vote}
            target="_blank"
            rel="noopener noreferrer"
          >
            Official vote
          </a>
          <Link className="stream-btn games" to="/games">
            🎮 BB Games Arena
          </Link>
        </div>
      </div>

      <div className="news-rail" aria-label="Bigg Boss news">
        <span className="news-label">News</span>
        <div className="news-track">
          {[...NEWS_FEED, ...NEWS_FEED].map((n, i) => (
            <a
              key={`${n.id}-${i}`}
              className="news-chip"
              href={n.href}
              target={n.href.startsWith("http") ? "_blank" : undefined}
              rel={n.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <em>{n.source}</em>
              <span className="news-tag">{n.tag}</span>
              {n.title}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
