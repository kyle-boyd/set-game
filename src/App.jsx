import { useState } from "react";
import "./App.css";

// Helper: shuffle array
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Shape component
function Shape({ shape, color, shading }) {
  const fillColor =
    shading === "solid"
      ? color
      : shading === "striped"
      ? `url(#${color}-stripes)`
      : "none";

  const strokeColor = color;

  const shapeProps = {
    diamond: (
      <polygon
        points="50,5 85,50 50,95 15,50"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="4"
      />
    ),
    oval: (
      <ellipse
        cx="50"
        cy="50"
        rx="30"
        ry="45"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="4"
      />
    ),
    squiggle: (
      <path
        d="M104,15 C112.4,36.9 89.7,60.8 63,54
           C52.3,51.3 42.2,42 27,53
           C9.6,65.6 5.4,58.3 5,40
           C4.6,22 19.1,9.7 36,12
           C59.2,15.2 61.9,31.5 89,14
           C95.3,10 100.9,6.9 104,15"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="4"
        transform="rotate(90 100 50) translate(50 70) scale(.9, .9)"
      />
    ),
  };

  return (
    <svg viewBox="0 0 100 100" className="shape-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id={`${color}-stripes`} patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M0,0 L0,4" stroke={color} strokeWidth="2" />
        </pattern>
      </defs>
      {shapeProps[shape]}
    </svg>
  );
}

function App() {
  const shapes = ["diamond", "squiggle", "oval"];
  const colors = ["#b53628", "#14a371", "#6432a1"];
  const numbers = [1, 2, 3];
  const shadings = ["solid", "striped", "open"];
  const [fadingCards, setFadingCards] = useState([]);
  const [wrongCards, setWrongCards] = useState([]);
  const [hintStep, setHintStep] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Generate full deck
  const generateDeck = () => {
    let id = 0;
    const deck = [];
    for (let shape of shapes) {
      for (let color of colors) {
        for (let number of numbers) {
          for (let shading of shadings) {
            deck.push({ id: id++, shape, color, number, shading });
          }
        }
      }
    }
    return deck;
  };

  const [fullDeckState] = useState(() => shuffleArray(generateDeck()));
  const [deckIndex, setDeckIndex] = useState(12);
  const [cards, setCards] = useState(fullDeckState.slice(0, 12));
  const [selected, setSelected] = useState([]);
  const [hint, setHint] = useState([]);
  const [message, setMessage] = useState("");

  // Check if 3 cards are a set
  const isSet = (c1, c2, c3) => {
    const attrs = ["shape", "color", "number", "shading"];
    return attrs.every((attr) => {
      const values = [c1[attr], c2[attr], c3[attr]];
      const unique = new Set(values).size;
      return unique === 1 || unique === 3;
    });
  };

  // Handle card click
  const toggleSelect = (index) => {
    let newSelected = selected.includes(index)
      ? selected.filter((i) => i !== index)
      : [...selected, index];
    setSelected(newSelected);
    setHintStep(0);
    setMessage("");

    if (newSelected.length === 3) {
      const [a, b, c] = newSelected.map((i) => cards[i]);
      if (isSet(a, b, c)) {
        setFadingCards(newSelected);
        setTimeout(() => {
          const newCards = [...cards];
          let newIndex = deckIndex;

          if (cards.length === 12) {
            newSelected.forEach((selIdx) => {
              if (newIndex < fullDeckState.length) {
                newCards[selIdx] = fullDeckState[newIndex];
                newIndex++;
              } else {
                newCards[selIdx] = null;
              }
            });
          } else {
            newSelected
              .sort((a, b) => b - a)
              .forEach((selIdx) => {
                newCards.splice(selIdx, 1);
              });
          }

          setCards(newCards.filter(Boolean));
          setDeckIndex(newIndex);
          setFadingCards([]);
        }, 300);
      } else {
        setWrongCards(newSelected);
        setTimeout(() => setWrongCards([]), 1000);
      }

      setSelected([]);
      setHint([]);
    }
  };

  const findHint = () => {
    let currentHintSet = hint.length === 3 ? hint : [];

    if (currentHintSet.length === 0) {
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          for (let k = j + 1; k < cards.length; k++) {
            if (isSet(cards[i], cards[j], cards[k])) {
              currentHintSet = [i, j, k];
              break;
            }
          }
          if (currentHintSet.length) break;
        }
        if (currentHintSet.length) break;
      }

      if (currentHintSet.length === 0) {
        setMessage("No sets found! Adding another card");
        setHint([]);
        setHintStep(0);
        return;
      }

      setHint(currentHintSet);
      setHintStep(1);
    } else {
      const nextStep = hintStep + 1;
      if (nextStep <= 3) setHintStep(nextStep);
    }
  };

  const addThreeCards = () => {
    if (deckIndex >= fullDeckState.length) {
      setMessage("No more cards in the deck!");
      return;
    }

    const newCards = [...cards];
    let newIndex = deckIndex;

    for (let i = 0; i < 3; i++) {
      if (newIndex < fullDeckState.length) {
        newCards.push(fullDeckState[newIndex]);
        newIndex++;
      }
    }

    setCards(newCards);
    setDeckIndex(newIndex);
    setSelected([]);
    setHint([]);
  };

  // Reset the game
  const handleNewGameConfirm = () => {
    const shuffled = shuffleArray(generateDeck());
    setCards(shuffled.slice(0, 12));
    setDeckIndex(12);
    setSelected([]);
    setHint([]);
    setHintStep(0);
    setMessage("");
    fullDeckState.splice(0, fullDeckState.length, ...shuffled);
    setShowModal(false);
  };

  return (
    <div className="app-container">
      <h1>Set Game</h1>

      <div className="buttons">
        <button onClick={() => setShowModal(true)}>New Game</button>
        <button onClick={findHint}>Hint</button>
        <button onClick={addThreeCards}>+ 3 Cards</button>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="card-grid">
        {cards.map((card, i) => {
          const isSelected = selected.includes(i);
          const isHinted = hintStep > 0 && hint.includes(i) && hint.indexOf(i) < hintStep;

          return (
            <div
              key={card.id}
              className={`card 
                ${isSelected ? "selected" : ""} 
                ${isHinted && !isSelected ? "hinted" : ""} 
                ${fadingCards.includes(i) ? "fading" : ""} 
                ${wrongCards.includes(i) ? "wrong" : ""}`}
              onClick={() => toggleSelect(i)}
            >
              <div className="card-content">
                {Array.from({ length: card.number }).map((_, idx) => (
                  <Shape key={idx} shape={card.shape} color={card.color} shading={card.shading} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to start a new game?</p>
            <div className="modal-buttons">
              <button className="confirm" onClick={handleNewGameConfirm}>
                Yes, Start Over
              </button>
              <button className="cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
