import { useState } from "react";
import { Link } from "react-router-dom";

type Node = {
  id: string;
  title: string;
  text: string;
  choices?: { label: string; next: string; score?: number }[];
  end?: "win" | "lose";
};

const NODES: Record<string, Node> = {
  start: {
    id: "start",
    title: "Night in the house",
    text: "Bigg Boss dims the lights. Three doors glow. Rumour: secret room is open tonight.",
    choices: [
      { label: "Kitchen door", next: "kitchen", score: 1 },
      { label: "Garden path", next: "garden", score: 2 },
      { label: "Confession room", next: "confession", score: 0 },
    ],
  },
  kitchen: {
    id: "kitchen",
    title: "Ration raid",
    text: "Someone hid maggi. You hear footsteps. Take the stash or run?",
    choices: [
      { label: "Grab ration + hide", next: "stash", score: 3 },
      { label: "Run to hallway", next: "hallway", score: 1 },
    ],
  },
  garden: {
    id: "garden",
    title: "Garden twist",
    text: "A faint red light pulses near the pool. Captaincy task poster flutters.",
    choices: [
      { label: "Follow the red light", next: "secret", score: 4 },
      { label: "Read the poster", next: "poster", score: 1 },
    ],
  },
  confession: {
    id: "confession",
    title: "Caught on mic",
    text: "You rant about nominations. Bigg Boss plays it in the living room. Awkward.",
    choices: [{ label: "Damage control", next: "hallway", score: -2 }],
  },
  stash: {
    id: "stash",
    title: "Luxury unlocked",
    text: "You bargain the maggi for info. A housemate whispers: ‘pool side panel’.",
    choices: [{ label: "Go to pool", next: "secret", score: 2 }],
  },
  hallway: {
    id: "hallway",
    title: "Nomination board",
    text: "Names on the board. You can erase one… or peek behind the curtain.",
    choices: [
      { label: "Peek behind curtain", next: "secret", score: 3 },
      { label: "Erase a rival’s name", next: "busted", score: -3 },
    ],
  },
  poster: {
    id: "poster",
    title: "Fake clue",
    text: "Poster is old. A tomato hits you from nowhere. Hate drop!",
    choices: [{ label: "Duck & dash", next: "hallway", score: 0 }],
  },
  secret: {
    id: "secret",
    title: "Secret Room",
    text: "Gold lights. Live feed. You made it — secret room unlocked!",
    end: "win",
  },
  busted: {
    id: "busted",
    title: "Bigg Boss warning",
    text: "Camera caught the erase. Eviction danger meter spikes. Adventure over.",
    end: "lose",
  },
};

export default function SecretRoom() {
  const [nodeId, setNodeId] = useState("start");
  const [score, setScore] = useState(0);
  const node = NODES[nodeId];

  function choose(next: string, delta = 0) {
    setScore((s) => s + delta);
    setNodeId(next);
  }

  function restart() {
    setNodeId("start");
    setScore(0);
  }

  return (
    <div className="game-shell">
      <Link className="back-link" to="/games">
        ← All games
      </Link>
      <header className="game-head">
        <p className="eyebrow">Adventure · Secret Room Run</p>
        <h1>{node.title}</h1>
        <p className="adventure-score">Drama points: {score}</p>
      </header>

      <div className="adventure-panel">
        <p>{node.text}</p>
        {node.end === "win" ? (
          <div className="result-banner">
            <h2>Secret room mil gaya 🚪✨</h2>
            <p>Score {score}. Ab Hotstar pe asli episode dekh!</p>
            <button type="button" className="stream-btn" onClick={restart}>
              Play again
            </button>
          </div>
        ) : null}
        {node.end === "lose" ? (
          <div className="result-banner lose">
            <h2>Busted by Bigg Boss</h2>
            <p>Score {score}. Try a safer path next time.</p>
            <button type="button" className="stream-btn" onClick={restart}>
              Restart run
            </button>
          </div>
        ) : null}
        {node.choices ? (
          <div className="choice-row">
            {node.choices.map((c) => (
              <button
                key={c.label}
                type="button"
                className="choice-btn"
                onClick={() => choose(c.next, c.score ?? 0)}
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
