"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Clock, AlertCircle, Trophy, Play, RotateCcw, ChevronLeft, Lightbulb, Star } from 'lucide-react';
import { useEscapeRoom } from '@/hooks/useEscapeRoom';
import { EscapeRoomBackground } from './EscapeRoomBackground';
import { Leaderboard } from './Leaderboard';
import { DifficultyBadge } from './DifficultyBadge';

export const EscapeRoomGame: React.FC = () => {
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);

  const {
    gameState,
    stages,
    isLoaded,
    maxPossibleScore,
    startGame,
    resetGame,
    updateCustomTime,
    updatePlayerName,
    updateUserCode,
    updateCurrentStage,
    checkSolution,
    useHint,
    formatTime,
    getCurrentStage,
    getCurrentStagePoints
  } = useEscapeRoom();

  // Auto-show leaderboard when game ends
  React.useEffect(() => {
    if (gameState.gameWon || gameState.gameLost) {
      const timer = setTimeout(() => {
        setShowLeaderboard(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameWon, gameState.gameLost]);

  if (!isLoaded) {
    return (
      <EscapeRoomBackground gameState="start">
        <div className="flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-[hsl(var(--muted-foreground))] mb-4 animate-spin" />
                <p className="text-[hsl(var(--muted-foreground))]">Loading Escape Room...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </EscapeRoomBackground>
    );
  }

  // Game not started - show start screen
  if (!gameState.timerStarted) {
    return (
      <>
        <EscapeRoomBackground gameState="start">
          <div className="flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <Lock className="w-20 h-20 mx-auto text-[hsl(var(--primary))] mb-4" />
              <CardTitle className="text-4xl font-bold">Code Escape Room</CardTitle>
              <CardDescription className="text-lg">
                Can you code your way out?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="bg-[hsl(var(--muted))]">
                <CardHeader>
                  <CardTitle>The Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-[hsl(var(--muted-foreground))]">
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--primary))] mr-2">•</span>
                      Complete 4 coding challenges to escape
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--primary))] mr-2">•</span>
                      You&apos;ll get 2 Easy, 1 Medium, and 1 Hard question
                    </li>
                    <li className="flex items-start">
                      <span className="text-[hsl(var(--primary))] mr-2">•</span>
                      Click any question number to start (1, 2, 3, or 4)
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--muted))]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Scoring System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-[hsl(var(--muted-foreground))]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Points Distribution</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            Easy: 100-125 points each
                          </li>
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                            Medium: 150-175 points each
                          </li>
                          <li className="flex items-center">
                            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                            Hard: 200-250 points each
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Leaderboard Score</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• 70% based on accuracy</li>
                          <li>• 30% based on speed</li>
                          <li>• -100 penalty for timeout</li>
                          <li>• Max score: 1000 points</li>
                        </ul>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[hsl(var(--border))]">
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        <strong>Pro tip:</strong> Complete questions quickly and accurately for the best leaderboard ranking!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                    Enter Your Name:
                  </label>
                  <input
                    type="text"
                    placeholder="Your name for the leaderboard"
                    value={gameState.playerName}
                    onChange={(e) => updatePlayerName(e.target.value)}
                    className="w-full px-3 py-2 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-md border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                    Set Timer (minutes):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={gameState.customTime}
                    onChange={(e) => updateCustomTime(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-md border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={startGame}
                  className="w-full"
                  size="lg"
                  disabled={!gameState.playerName.trim()}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {!gameState.playerName.trim() ? 'Enter your name to start' : 'Start Challenge'}
                </Button>
                
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </EscapeRoomBackground>

        <Leaderboard 
          isOpen={showLeaderboard} 
          onClose={() => setShowLeaderboard(false)}
          currentPlayerName={gameState.playerName}
        />
      </>
    );
  }

  // Game won - show victory screen
  if (gameState.gameWon) {
    return (
      <>
        <EscapeRoomBackground gameState="won">
          <div className="flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <Trophy className="w-32 h-32 mx-auto text-yellow-500 mb-4 animate-bounce" />
              <CardTitle className="text-5xl font-bold text-green-600">YOU ESCAPED!</CardTitle>
              <CardDescription className="text-2xl">
                Time Remaining: {formatTime(gameState.timeLeft)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="bg-[hsl(var(--muted))]">
                <CardHeader>
                  <CardTitle>Stages Completed:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {stages.map((stage) => (
                      <div key={stage.id} className="flex items-center justify-between text-green-600">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm">{stage.title}</span>
                        </div>
                        <DifficultyBadge 
                          difficulty={stage.difficulty as 'easy' | 'medium' | 'hard'} 
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Button
                  onClick={resetGame}
                  className="w-full"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  View Your Position on Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </EscapeRoomBackground>
        
        <Leaderboard 
          isOpen={showLeaderboard} 
          onClose={() => setShowLeaderboard(false)}
          currentPlayerName={gameState.playerName}
        />
      </>
    );
  }

  // Game lost - show failure screen
  if (gameState.gameLost) {
    return (
      <>
        <EscapeRoomBackground gameState="lost">
          <div className="flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <AlertCircle className="w-32 h-32 mx-auto text-red-500 mb-4" />
              <CardTitle className="text-5xl font-bold text-red-600">GAME OVER</CardTitle>
              <CardDescription className="text-xl">
                {gameState.feedback}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={resetGame}
                className="w-full"
                size="lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={() => setShowLeaderboard(true)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Trophy className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
          </div>
        </EscapeRoomBackground>
        
        <Leaderboard 
          isOpen={showLeaderboard} 
          onClose={() => setShowLeaderboard(false)}
          currentPlayerName={gameState.playerName}
        />
      </>
    );
  }

  // Main game interface
  const currentStage = getCurrentStage();
  const stagePoints = getCurrentStagePoints();
  
  // Show question selection if no specific question is selected
  if (gameState.currentStage === -1) {
    return (
      <>
        <EscapeRoomBackground gameState="playing">
          <div className="p-4">
            <div className="max-w-6xl mx-auto space-y-4">
              {/* Header */}
              <Card className="border-2 border-[hsl(var(--destructive))]">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center">
                      <Lock className="w-8 h-8 text-[hsl(var(--destructive))] mr-3" />
                      <div>
                        <h1 className="text-2xl font-bold text-red-700 text-[hsl(var(--foreground))]">Escape Room</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">Hey {gameState.playerName}, Choose a question to start solving!</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 md:space-x-6">
                      <div className="text-center">
                        <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                        <p className={`text-2xl font-bold ${gameState.timeLeft < 300 ? 'text-red-500' : 'text-[hsl(var(--foreground))]'}`}>
                          {formatTime(gameState.timeLeft)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[hsl(var(--muted-foreground))] text-sm">Progress</p>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                          {gameState.stagesCompleted.length}/{stages.length}
                        </p>
                      </div>
                      <div className="text-center">
                        <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-yellow-500">
                          {gameState.currentPoints}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          / {maxPossibleScore} max
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowLeaderboard(true)}
                        variant="outline"
                        size="sm"
                        className="hidden md:flex"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Leaderboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Selection Grid */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Choose Your Challenge</h2>
                    <p className="text-[hsl(var(--muted-foreground))] mb-2">Click on any question number to start solving</p>
                    <div className="flex justify-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span>2 Easy</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <span>1 Medium</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span>1 Hard</span>
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        Max Score: {maxPossibleScore}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stages.map((stage, idx) => (
                      <button
                        key={stage.id}
                        onClick={() => {
                          updateCurrentStage(idx, stage);
                        }}
                        className={`relative group p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                          gameState.stagesCompleted.includes(stage.id) 
                            ? 'bg-green-50 border-green-300 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700' 
                            : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-6xl font-bold mb-2 ${
                            gameState.stagesCompleted.includes(stage.id) 
                              ? 'text-green-600' 
                              : 'text-[hsl(var(--foreground))]'
                          }`}>
                            {gameState.stagesCompleted.includes(stage.id) ? '✓' : idx + 1}
                          </div>
                          <div className="text-sm font-medium mb-2">
                            {stage.title.split(':')[1]?.trim() || `Question ${idx + 1}`}
                          </div>
                          <DifficultyBadge 
                            difficulty={stage.difficulty as 'easy' | 'medium' | 'hard'} 
                            size="sm"
                          />
                          {gameState.stagesCompleted.includes(stage.id) && (
                            <div className="mt-2 text-xs text-green-600 font-semibold">
                              Completed!
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </EscapeRoomBackground>
        
        <Leaderboard 
          isOpen={showLeaderboard} 
          onClose={() => setShowLeaderboard(false)}
          currentPlayerName={gameState.playerName}
        />
      </>
    );
  }
  
  if (!currentStage) return null;

  return (
    <>
      <EscapeRoomBackground gameState="playing">
        <div className="p-4">
          <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <Card className="border-2 border-[hsl(var(--destructive))]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center">
                <Lock className="w-8 h-8 text-[hsl(var(--destructive))] mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-red-700 text-[hsl(var(--foreground))]">Escape Room</h1>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    Hey {gameState.playerName}, Complete all stages to escape! 
                    <span className="ml-2 text-[hsl(var(--primary))] font-semibold">
                      Currently: Question {gameState.currentStage + 1}
                    </span>
                  </p>
                </div>
              </div>
              {/* --- UI CHANGE APPLIED HERE --- */}
              <div className="flex items-center space-x-4 md:space-x-6">
                <div className="text-center">
                  <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <p className={`text-2xl font-bold ${gameState.timeLeft < 300 ? 'text-red-500' : 'text-[hsl(var(--foreground))]'}`}>
                    {formatTime(gameState.timeLeft)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[hsl(var(--muted-foreground))] text-sm">Progress</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {gameState.stagesCompleted.length}/{stages.length}
                  </p>
                </div>
                      <div className="text-center">
                        <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-yellow-500">
                          {gameState.currentPoints}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          / {maxPossibleScore} max
                        </p>
                      </div>
                {/* Back to Questions Button */}
                <Button
                  onClick={() => {
                    updateCurrentStage(-1); // -1 means show question selection
                  }}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Questions
                </Button>
                
                {/* --- ADDED: Leaderboard Button --- */}
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex" // Hides on small screens, shows on medium and up
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Main Challenge Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Instructions */}
          <Card className="border-2 border-[hsl(var(--primary))]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">{currentStage.title}</CardTitle>
                    <DifficultyBadge difficulty={currentStage.difficulty as 'easy' | 'medium' | 'hard'} />
                  </div>
                  <CardDescription className="text-base">
                    {currentStage.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                    <div className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">Points Available</div>
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {stagePoints.total}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameState.showHint && (
                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
                  <CardContent className="p-4">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 dark:text-yellow-200 font-semibold">Hint:</p>
                        <p className="text-yellow-700 dark:text-yellow-100 text-sm">{currentStage.hint}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {gameState.feedback && (
                <Card className={`${
                  gameState.feedback.includes('✓') ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <CardContent className="p-4">
                    <p className={`${
                      gameState.feedback.includes('✓') ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {gameState.feedback}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={useHint}
                  variant="outline"
                  disabled={gameState.hintsUsed.includes(currentStage.id)}
                  className="flex items-center"
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  {gameState.hintsUsed.includes(currentStage.id) ? 'Hint Used' : 'Hint (-20pts)'}
                </Button>
                <Button
                  onClick={checkSolution}
                  className="flex-1"
                >
                  Submit Solution
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card className="border-2 border-[hsl(var(--primary))]">
            <CardHeader>
              <CardTitle>Code Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={gameState.userCode}
                onChange={(e) => updateUserCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const textarea = e.target as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    const newValue = value.substring(0, start) + '    ' + value.substring(end);
                    updateUserCode(newValue);
                    setTimeout(() => {
                      textarea.selectionStart = textarea.selectionEnd = start + 4;
                    }, 0);
                  }
                }}
                className="w-full h-96 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-mono p-4 rounded-md border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
                spellCheck="false"
                placeholder="Write your code here..."
              />
            </CardContent>
          </Card>
        </div>

        
          </div>
        </div>
      </EscapeRoomBackground>
      
      <Leaderboard 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)}
        currentPlayerName={gameState.playerName}
      />
    </>
  );
};