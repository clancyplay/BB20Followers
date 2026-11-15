import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { SOCIAL } from "../links";
import LoveHateGame from "./LoveHateGame";
import CaptaincyRace from "./CaptaincyRace";
import MemoryMatch from "./MemoryMatch";
import SecretRoom from "./SecretRoom";
import ChaosQuiz from "./ChaosQuiz";
import HouseChaosPage from "./house-chaos/HouseChaosPage";
import "../App.css";
import "./games.css";

const GAMES = [
  {
    id: "house-chaos",
    title: "Ghar",
    kind: "Main",
    blurb: "Live house arena — collect, fight bosses, hit rivals.",
    emoji: "🏠",
    tone: "adventure",
  },
  {
    id: "love-hate",
    title: "Pyar vs Hate",
    kind: "Social",
    blurb: "Send love to your favourite. Roast your least favourite.",
    emoji: "❤️",
    tone: "love",
  },
  {
    id: "captaincy",
    title: "Captaincy Dash",
    kind: "Sports",
    blurb: "Tap race — first housemate to the captain’s chair wins.",
    emoji: "🏃",
    tone: "sport",
  },
  {
    id: "memory",
    title: "Face Match",
    kind: "Puzzle",
    blurb: "Flip cards. Match housemate faces before the timer ends.",
    emoji: "🧩",
    tone: "puzzle",
  },
  {
    id: "secret-room",
    title: "Secret Room Run",
    kind: "Adventure",
    blurb: "Pick the right doors. Find ration, twists, and the secret room.",
    emoji: "🚪",
    tone: "adventure",
  },
  {
    id: "quiz",
    title: "Weekend Chaos Quiz",
    kind: "Trivia",
    blurb: "Quick-fire BB20 questions. Prove you’re the real gossiper.",
    emoji: "🎤",
    tone: "quiz",
  },
] as const;

function GamesHub() {
  return (
    <div className="games-hub">
      <header className="games-hero">
        <Link className="back-link" to="/">
          ← Follower board
        </Link>
        <p className="eyebrow">
          <span className="live-dot" /> Bigg Boss 20 · Fan Arena
        </p>
        <h1>BB Games Arena</h1>
        <p className="games-sub">
          Sports, adventure, puzzles &amp; pure house drama. Pick a game —
          pyar do, hate do, captaincy jeeto.
        </p>
        <a
          className="social-btn ig"
          href={SOCIAL.instagram}
          target="_blank"
          rel="noopener noreferrer"
        >
          {SOCIAL.instagramHandle}
        </a>
      </header>

      <div className="games-grid">
        {GAMES.map((g) => (
          <Link
            key={g.id}
            className={`game-card tone-${g.tone}`}
            to={`/games/${g.id}`}
          >
            <span className="game-emoji" aria-hidden="true">
              {g.emoji}
            </span>
            <span className="game-kind">{g.kind}</span>
            <strong>{g.title}</strong>
            <p>{g.blurb}</p>
            <span className="play-cta">Play →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function GameRouter() {
  const { gameId } = useParams();
  switch (gameId) {
    case "house-chaos":
      return <HouseChaosPage />;
    case "love-hate":
      return <LoveHateGame />;
    case "captaincy":
      return <CaptaincyRace />;
    case "memory":
      return <MemoryMatch />;
    case "secret-room":
      return <SecretRoom />;
    case "quiz":
      return <ChaosQuiz />;
    default:
      return <Navigate to="/games" replace />;
  }
}

export default function GamesPage() {
  return (
    <div className="page games-page">
      <div className="atmosphere" aria-hidden="true">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="scanlines" />
      </div>
      <Routes>
        <Route index element={<GamesHub />} />
        <Route path=":gameId" element={<GameRouter />} />
      </Routes>
    </div>
  );
}
