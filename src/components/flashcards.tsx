import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, RotateCcw, Zap, Trophy, Flame, Home } from 'lucide-react';

interface FlashcardsProps {
  onPageChange: (page: string) => void;
}

export function Flashcards({ onPageChange }: FlashcardsProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyStreak, setStudyStreak] = useState(7);
  const [xpGained, setXpGained] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const flashcards = [
    {
      id: 1,
      front: "What is Strategic Management?",
      back: "The process of formulating, implementing, and evaluating strategies that enable an organization to achieve its objectives and gain competitive advantage."
    },
    {
      id: 2,
      front: "What are the components of SWOT Analysis?",
      back: "Strengths (internal capabilities), Weaknesses (internal limitations), Opportunities (external factors to exploit), and Threats (external risks)."
    },
    {
      id: 3,
      front: "Name the five forces in Porter's Five Forces Model.",
      back: "Threat of New Entrants, Bargaining Power of Suppliers, Bargaining Power of Buyers, Threat of Substitutes, and Competitive Rivalry."
    },
    {
      id: 4,
      front: "What is Cost Leadership Strategy?",
      back: "A competitive strategy focused on achieving the lowest costs in the industry while maintaining acceptable quality levels."
    },
    {
      id: 5,
      front: "What is Differentiation Strategy?",
      back: "A strategy that creates unique value propositions for customers through distinctive products, services, or brand positioning."
    },
    {
      id: 6,
      front: "What is a Focus Strategy?",
      back: "A competitive strategy that targets a specific, narrow segment of the market with specialized products or cost/differentiation advantages."
    },
    {
      id: 7,
      front: "What are Barriers to Entry?",
      back: "Obstacles that make it difficult for new companies to enter a particular market, such as high capital requirements, regulations, or brand loyalty."
    },
    {
      id: 8,
      front: "What is Competitive Advantage?",
      back: "A condition that puts a company in a favorable business position compared to rivals, enabling superior performance and market position."
    }
  ];

  const currentCard = flashcards[currentCardIndex];
  const progressPercentage = ((currentCardIndex + 1) / flashcards.length) * 100;

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setXpGained(prev => prev + 10);
    } else {
      // Finished deck - trigger confetti
      setXpGained(prev => prev + 50); // Bonus XP for completing
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const resetDeck = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setXpGained(0);
    setShowConfetti(false);
  };

  const isCompleted = currentCardIndex >= flashcards.length - 1 && isFlipped;

  return (
    <div className="flex-1 p-8 space-y-8 animate-fade-in">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Flashcards</h1>
          <p className="text-xl text-muted-foreground">Test your knowledge and earn XP</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gradient-to-r from-[--neon-green]/20 to-[--neon-blue]/20 px-4 py-2 rounded-full">
            <Flame className="h-5 w-5 text-[--neon-green]" />
            <span className="font-semibold">{studyStreak} day streak</span>
          </div>
          
          <div className="flex items-center gap-2 bg-gradient-to-r from-[--neon-purple]/20 to-[--neon-blue]/20 px-4 py-2 rounded-full">
            <Zap className="h-5 w-5 text-[--neon-purple]" />
            <span className="font-semibold">+{xpGained} XP</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Card {Math.min(currentCardIndex + 1, flashcards.length)} of {flashcards.length}
          </span>
          <span className="text-sm font-medium">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-2xl">
          <Card 
            className={`h-80 cursor-pointer transition-all duration-500 transform hover:scale-105 ${
              isFlipped ? 'rotate-y-180' : ''
            } ${showConfetti ? 'animate-confetti' : ''}`}
            onClick={flipCard}
            style={{ 
              transformStyle: 'preserve-3d',
              background: isFlipped 
                ? 'linear-gradient(135deg, var(--neon-purple)/10, var(--neon-green)/10)' 
                : 'linear-gradient(135deg, var(--neon-blue)/10, var(--neon-purple)/10)'
            }}
          >
            <CardContent className="h-full flex items-center justify-center p-8">
              <div 
                className={`text-center space-y-4 transition-opacity duration-300 ${
                  isFlipped ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                <Badge variant="outline" className="border-[--neon-blue]/30">
                  Question
                </Badge>
                <h2 className="text-2xl font-semibold leading-relaxed">
                  {currentCard?.front}
                </h2>
                <p className="text-muted-foreground">Click to reveal answer</p>
              </div>
              
              <div 
                className={`text-center space-y-4 absolute inset-8 flex flex-col justify-center transition-opacity duration-300 ${
                  isFlipped ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ 
                  transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                  backfaceVisibility: 'hidden'
                }}
              >
                <Badge variant="outline" className="border-[--neon-green]/30 self-center">
                  Answer
                </Badge>
                <h2 className="text-xl font-medium leading-relaxed text-center">
                  {currentCard?.back}
                </h2>
                <p className="text-muted-foreground">Click for next question</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={prevCard}
          disabled={currentCardIndex === 0}
          className="border-[--neon-blue]/30 hover:bg-[--neon-blue]/10"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          variant="outline"
          onClick={flipCard}
          className="border-[--neon-purple]/30 hover:bg-[--neon-purple]/10 px-8"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Flip Card
        </Button>
        
        <Button
          onClick={nextCard}
          disabled={currentCardIndex >= flashcards.length - 1 && isFlipped}
          className="bg-gradient-to-r from-[--neon-blue] to-[--neon-purple] hover:from-[--neon-blue]/80 hover:to-[--neon-purple]/80 text-white"
        >
          {currentCardIndex >= flashcards.length - 1 ? 'Complete!' : 'Next'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <Card className="border-[--neon-green]/30 bg-gradient-to-r from-[--neon-green]/5 to-[--neon-blue]/5">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[--neon-green] to-[--neon-blue] rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold gradient-text">Deck Complete! 🎉</h3>
            <p className="text-muted-foreground">
              Great job! You've earned <span className="font-semibold text-[--neon-purple]">+{xpGained} XP</span> and maintained your study streak.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={resetDeck}
                variant="outline"
                className="border-[--neon-blue]/30 hover:bg-[--neon-blue]/10"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Study Again
              </Button>
              <Button
                onClick={() => onPageChange('dashboard')}
                className="bg-gradient-to-r from-[--neon-green] to-[--neon-blue] hover:from-[--neon-green]/80 hover:to-[--neon-blue]/80 text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Tips */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Study Tips 💡</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Try to answer before flipping the card</li>
            <li>• Review cards you find difficult multiple times</li>
            <li>• Study regularly to maintain your streak</li>
            <li>• Focus on understanding concepts, not just memorization</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}