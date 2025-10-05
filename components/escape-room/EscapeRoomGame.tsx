"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Clock, AlertCircle, Trophy, Play, RotateCcw, Save, BarChart3 } from 'lucide-react';
import { useEscapeRoom } from '@/hooks/useEscapeRoom';
import { EscapeRoomBackground } from './EscapeRoomBackground';
import { Leaderboard } from './Leaderboard';

export const EscapeRoomGame: React.FC = () => {
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);

  React.useEffect(() => {
    console.log('showLeaderboard state changed:', showLeaderboard);
  }, [showLeaderboard]);

  // Handle leaderboard button clicks
  const handleLeaderboardClick = () => {
    console.log('Leaderboard button clicked');
    setShowLeaderboard(true);
  };

  // Handle tab key in text inputs
  const handleTabKey = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, currentValue: string, setValue: (value: string) => void) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      const newValue = currentValue.substring(0, start) + '  ' + currentValue.substring(end);
      setValue(newValue);
      
      // Use requestAnimationFrame to ensure the DOM is updated before setting cursor position
      requestAnimationFrame(() => {
        target.setSelectionRange(start + 2, start + 2);
        target.focus();
      });
    }
  };
  
  const {
    gameState,
    stages,
    isLoaded,
    sessionId,
    playerName,
    setPlayerName,
    startGame,
    resetGame,
    saveGame,
    updateCustomTime,
    updateUserCode,
    checkSolution,
    skipStage,
    goToPreviousStage,
    goToNextStage,
    formatTime,
    getCurrentStage,
    calculateScore
  } = useEscapeRoom();

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
                    Complete 5 coding challenges to escape
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--primary))] mr-2">•</span>
                    Format code correctly
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--primary))] mr-2">•</span>
                    Debug broken code
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--primary))] mr-2">•</span>
                    Generate number sequences
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--primary))] mr-2">•</span>
                    Convert data formats
                  </li>
                  <li className="flex items-start">
                    <span className="text-[hsl(var(--primary))] mr-2">•</span>
                    Implement algorithms
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Your Name:
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => handleTabKey(e, playerName, setPlayerName)}
                  placeholder="Enter your name to start"
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

            <div className="space-y-3">
              <Button
                onClick={startGame}
                className="w-full"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Challenge
              </Button>
              <Button
                onClick={handleLeaderboardClick}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </EscapeRoomBackground>
    );
  }

  // Game won - show victory screen
  if (gameState.gameWon) {
    return (
      <EscapeRoomBackground gameState="won">
        <div className="flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <Trophy className="w-32 h-32 mx-auto text-yellow-500 mb-4 animate-bounce" />
            <CardTitle className="text-5xl font-bold text-green-600">YOU ESCAPED!</CardTitle>
            <CardDescription className="text-2xl">
              Time Remaining: {formatTime(gameState.timeLeft)}
            </CardDescription>
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                🎉 Congratulations {playerName}! You've been added to the leaderboard!
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                Your score: {calculateScore()} points
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="bg-[hsl(var(--muted))]">
              <CardHeader>
                <CardTitle>Stages Completed:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {stages.map((stage) => (
                    <div key={stage.id} className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm">{stage.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={resetGame}
                className="w-full"
                size="lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={handleLeaderboardClick}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
        
        {/* Leaderboard Modal for victory screen */}
        {showLeaderboard && (
          <Leaderboard 
            isOpen={showLeaderboard} 
            onClose={() => {
              console.log('Closing leaderboard from victory screen');
              setShowLeaderboard(false);
            }} 
          />
        )}
      </EscapeRoomBackground>
    );
  }

  // Game lost - show failure screen
  if (gameState.gameLost) {
    return (
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
          <CardContent>
            <Button
              onClick={resetGame}
              className="w-full"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
        </div>
      </EscapeRoomBackground>
    );
  }

  // Main game interface
  const currentStage = getCurrentStage();
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
                  <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Code Escape Room</h1>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    {playerName ? `Welcome, ${playerName}! Complete all stages to escape!` : 'Complete all stages to escape!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
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
                <div className="flex gap-2">
                  {sessionId && (
                    <Button
                      onClick={saveGame}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Game
                    </Button>
                  )}
                  <Button
                    onClick={handleLeaderboardClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Leaderboard
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              {stages.map((stage, idx) => {
                const isCompleted = gameState.stagesCompleted.includes(stage.id);
                const isCurrent = idx === gameState.currentStage;
                
                // Check if this stage is completed AND the next stage is also completed
                // OR if this stage is completed and it's the last stage
                const shouldShowGreenLine = isCompleted && (
                  idx === stages.length - 1 || // Last stage, always show if completed
                  gameState.stagesCompleted.includes(stages[idx + 1].id) // Next stage is also completed
                );
                
                return (
                  <div key={stage.id} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' :
                      'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    {idx < stages.length - 1 && (
                      <div className={`w-12 h-1 ${
                        shouldShowGreenLine ? 'bg-green-500' : 'bg-[hsl(var(--muted))]'
                      }`} />
                    )}
                  </div>
                );
              })}
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
                  <CardTitle className="text-2xl">{currentStage.title}</CardTitle>
                  <CardDescription className="text-base">
                    {currentStage.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={goToPreviousStage}
                    variant="outline"
                    size="sm"
                    disabled={gameState.currentStage === 0}
                    className="flex items-center"
                  >
                    ← Prev
                  </Button>
                  <span className="text-sm text-[hsl(var(--muted-foreground))] font-medium px-2">
                    {gameState.currentStage + 1}/{stages.length}
                  </span>
                  <Button
                    onClick={goToNextStage}
                    variant="outline"
                    size="sm"
                    disabled={gameState.currentStage === stages.length - 1}
                    className="flex items-center"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
                <CardContent className="p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 dark:text-yellow-200 font-semibold">Hint:</p>
                      <p className="text-yellow-700 dark:text-yellow-100 text-sm">{currentStage.hints}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                  onClick={checkSolution}
                  className="flex-1"
                >
                  Submit Solution
                </Button>
                <Button
                  onClick={skipStage}
                  variant="outline"
                >
                  Skip
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
                onKeyDown={(e) => handleTabKey(e, gameState.userCode, updateUserCode)}
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
    
    {/* Leaderboard Modal - Outside background for proper z-index */}
    <Leaderboard 
      isOpen={showLeaderboard} 
      onClose={() => {
        console.log('Closing leaderboard');
        setShowLeaderboard(false);
      }} 
    />
  </>
  );
};
