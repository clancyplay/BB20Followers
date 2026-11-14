import { useState } from "react";
import { Link } from "react-router-dom";

type Q = {
  q: string;
  options: string[];
  answer: number;
};

const QUESTIONS: Q[] = [
  {
    q: "Bigg Boss 20 primarily streams on which platform?",
    options: ["JioHotstar", "Netflix", "YouTube only", "Disney+ US"],
    answer: 0,
  },
  {
    q: "Weekend Ka Vaar is usually hosted by?",
    options: ["Farah Khan", "Salman Khan", "Rohit Shetty", "Karan Johar"],
    answer: 1,
  },
  {
    q: "This fan board tracks which social metric?",
    options: [
      "YouTube subscribers",
      "Instagram followers",
      "Twitter likes",
      "Spotify monthly",
    ],
    answer: 1,
  },
  {
    q: "Official voting for Bigg Boss is done via?",
    options: [
      "SMS only",
      "Missed call",
      "JioHotstar app",
      "Paper ballot",
    ],
    answer: 2,
  },
  {
    q: "Daily episodes typically drop around what IST time on Hotstar?",
    options: ["6:00 AM", "12:00 PM", "9:00 PM", "3:00 AM"],
    answer: 2,
  },
  {
    q: "What does ‘OUT’ mean on this follower board?",
    options: [
      "On vacation",
      "Evicted / out of the house",
      "Muted on IG",
      "Guest appearance",
    ],
    answer: 1,
  },
];

export default function ChaosQuiz() {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const cur = QUESTIONS[i];

  function choose(opt: number) {
    if (picked !== null || done) return;
    setPicked(opt);
    if (opt === cur.answer) setScore((s) => s + 1);
    window.setTimeout(() => {
      if (i + 1 >= QUESTIONS.length) {
        setDone(true);
      } else {
        setI((n) => n + 1);
        setPicked(null);
      }
    }, 700);
  }

  function restart() {
    setI(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  }

  return (
    <div className="game-shell">
      <Link className="back-link" to="/games">
        ← All games
      </Link>
      <header className="game-head">
        <p className="eyebrow">Trivia · Weekend Chaos Quiz</p>
        <h1>Prove the goss</h1>
        <p>
          {done
            ? `Final score ${score}/${QUESTIONS.length}`
            : `Q ${i + 1} / ${QUESTIONS.length} · Score ${score}`}
        </p>
      </header>

      {!done ? (
        <div className="quiz-panel">
          <h2>{cur.q}</h2>
          <div className="choice-row">
            {cur.options.map((opt, idx) => {
              let cls = "choice-btn";
              if (picked !== null) {
                if (idx === cur.answer) cls += " correct";
                else if (idx === picked) cls += " wrong";
              }
              return (
                <button
                  key={opt}
                  type="button"
                  className={cls}
                  onClick={() => choose(idx)}
                  disabled={picked !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="result-banner">
          <h2>
            {score >= 5
              ? "Top gossiper 🏆"
              : score >= 3
                ? "Decent house intel"
                : "More episodes dekhna padega"}
          </h2>
          <p>
            {score}/{QUESTIONS.length} sahi
          </p>
          <button type="button" className="stream-btn" onClick={restart}>
            Quiz again
          </button>
        </div>
      )}
    </div>
  );
}
