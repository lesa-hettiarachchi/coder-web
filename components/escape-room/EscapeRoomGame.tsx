"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Clock, AlertCircle, Trophy, Play, RotateCcw, ChevronLeft, ChevronRight, Lightbulb, Star } from 'lucide-react';
import { useEscapeRoom } from '@/hooks/useEscapeRoom';
import { EscapeRoomBackground } from './EscapeRoomBackground';

export const EscapeRoomGame: React.FC = () => {
  const {
    gameState,
    stages,
    isLoaded,
    startGame,
    resetGame,
    updateCustomTime,
    updateUserCode,
    checkSolution,
    goToNextStage,
    goToPreviousStage,
    useHint,
    formatTime,
    getCurrentStage,
    getCurrentStagePoints
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
                    Complete 4 coding challenges to escape
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
                </ul>
              </CardContent>
            </Card>

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

            <Button
              onClick={startGame}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Challenge
            </Button>
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

            <Button
              onClick={resetGame}
              className="w-full"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </CardContent>
        </Card>
        </div>
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
  const stagePoints = getCurrentStagePoints();
  if (!currentStage) return null;

  return (
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
                  <p className="text-[hsl(var(--muted-foreground))]">Complete all stages to escape!</p>
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
                <div className="text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-yellow-500">
                    {gameState.currentPoints}
                  </p>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm">Points</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              {stages.map((stage, idx) => (
                <div key={stage.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    gameState.stagesCompleted.includes(stage.id) ? 'bg-green-500 text-white' :
                    idx === gameState.currentStage ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' :
                    'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                  }`}>
                    {gameState.stagesCompleted.includes(stage.id) ? '✓' : idx + 1}
                  </div>
                  {idx < stages.length - 1 && (
                    <div className={`w-12 h-1 ${
                      gameState.stagesCompleted.includes(stage.id) && gameState.stagesCompleted.includes(stages[idx + 1]?.id) ? 'bg-green-500' : 'bg-[hsl(var(--muted))]'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Challenge Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Instructions */}
          <Card className="border-2 border-[hsl(var(--primary))]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{currentStage.title}</CardTitle>
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
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">
                      {stagePoints.base} base + {stagePoints.timeBonus} time bonus
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
                  onClick={goToPreviousStage}
                  variant="outline"
                  disabled={gameState.currentStage === 0}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
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
                <Button
                  onClick={goToNextStage}
                  variant="outline"
                  disabled={gameState.currentStage === stages.length - 1}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
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
                className="w-full h-96 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-mono p-4 rounded-md border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
                spellCheck="false"
                placeholder="Write your code here..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-[hsl(var(--muted))] rounded">
                <span className="font-semibold">Your Score</span>
                <span className="text-yellow-500 font-bold">{gameState.currentPoints} points</span>
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] text-center">
                Complete stages without hints for maximum points!
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </EscapeRoomBackground>
  );
};
