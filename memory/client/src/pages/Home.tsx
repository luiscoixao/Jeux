import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

/**
 * Jeu de Memory - Alphabet Français
 * Design: Minimalisme Géométrique Moderne
 * Palette: Blanc, Bleu électrique, Rose vif
 * Typographie: Poppins (titre), JetBrains Mono (lettres)
 */

interface Card {
  id: number;
  letter: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALPHABET_FR = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);

  // Initialiser le jeu
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Créer les paires de cartes
    const cardPairs: Card[] = [];
    ALPHABET_FR.forEach((letter, index) => {
      cardPairs.push({
        id: index * 2,
        letter,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: index * 2 + 1,
        letter,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Mélanger les cartes
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameWon(false);
  };

  const handleCardClick = (id: number) => {
    // Ignorer si la carte est déjà appairée ou retournée
    if (
      cards[id].isMatched ||
      flippedCards.includes(id) ||
      flippedCards.length === 2
    ) {
      return;
    }

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    // Vérifier si nous avons 2 cartes retournées
    if (newFlipped.length === 2) {
      setMoves(moves + 1);

      const [first, second] = newFlipped;
      if (cards[first].letter === cards[second].letter) {
        // Paire trouvée!
        const newCards = cards.map((card, index) => {
          if (index === first || index === second) {
            return { ...card, isMatched: true };
          }
          return card;
        });
        setCards(newCards);
        setMatchedPairs(matchedPairs + 1);
        setFlippedCards([]);

        // Vérifier si le jeu est terminé
        if (matchedPairs + 1 === ALPHABET_FR.length) {
          setGameWon(true);
        }
      } else {
        // Pas de correspondance, retourner les cartes après un délai
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4" style={{
      backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663424594289/QCMzSPcMFfC7H3HS3uxT7x/memory-hero-bg-9SWQpJuy82tUhntvqLCTrs.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <main className="flex flex-col items-center justify-center gap-8">
        {/* Titre */}
        <div className="text-center">
          <h1 className="memory-title mb-2">Memory</h1>
          <p className="text-gray-600 text-lg font-poppins">Alphabet Français</p>
        </div>

        {/* Statistiques */}
        <div className="flex gap-8 text-center">
          <div className="flex flex-col items-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider">Paires trouvées</p>
            <p className="text-3xl font-bold text-blue-600">{matchedPairs}/{ALPHABET_FR.length}</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider">Coups</p>
            <p className="text-3xl font-bold text-pink-600">{moves}</p>
          </div>
        </div>

        {/* Grille de cartes */}
        <div className="memory-grid">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`memory-card transition-all duration-300 ${
                flippedCards.includes(index) || card.isMatched ? 'flipped' : ''
              } ${card.isMatched ? 'matched' : ''}`}
              disabled={gameWon}
            >
              {(flippedCards.includes(index) || card.isMatched) && card.letter}
            </button>
          ))}
        </div>

        {/* Message de victoire */}
        {gameWon && (
          <div className="text-center animate-bounce">
            <p className="text-2xl font-bold text-green-600 mb-4">🎉 Bravo! Vous avez gagné! 🎉</p>
            <p className="text-gray-600 mb-4">Vous avez trouvé toutes les paires en {moves} coups.</p>
          </div>
        )}

        {/* Bouton réinitialiser */}
        <Button
          onClick={initializeGame}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-poppins font-semibold flex items-center gap-2"
        >
          <RotateCcw size={20} />
          Nouvelle partie
        </Button>
      </main>
    </div>
  );
}
