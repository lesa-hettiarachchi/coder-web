"use client";

import { useState, useEffect, useCallback } from 'react';
import { EscapeRoomGameState, EscapeRoomStage } from '@/types/escapeRoom';
import { escapeRoomService } from '@/service/escapeRoomService';

export const useEscapeRoom = () => {
  const [gameState, setGameState] = useState<EscapeRoomGameState>({
    timeLeft: 1800, 
    customTime: 30,
    timerStarted: false,
    currentStage: 0,
    userCode: '',
    feedback: '',
    stagesCompleted: [],
    gameWon: false,
    gameLost: false,
    currentPoints: 0,
    hintsUsed: [],
    showHint: false,
    playerName: ''
  });

  const [stages, setStages] = useState<EscapeRoomStage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);

  useEffect(() => {
    const loadStages = async () => {
      try {
        const loadedStages = await escapeRoomService.getStages();
        setStages(loadedStages);
        
        const maxScore = loadedStages.reduce((total, stage) => total + stage.points, 0);
        setMaxPossibleScore(maxScore);
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load escape room stages:', error);
        setIsLoaded(true);
      }
    };
    
    loadStages();
  }, []);


  useEffect(() => {
    if (gameState.timerStarted && gameState.timeLeft > 0 && !gameState.gameWon && !gameState.gameLost) {
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.timeLeft === 0 && !gameState.gameWon && !gameState.gameLost) {
      setGameState(prev => ({
        ...prev,
        gameLost: true,
        feedback: "Time's up! You failed to escape. Try again!"
      }));

      if (gameState.playerName.trim()) {
        console.log('Saving to leaderboard - game lost');
        const timeCompleted = gameState.customTime * 60;
        // For game lost, use base points without time bonus
        saveToLeaderboard(gameState.currentPoints, timeCompleted);
      }
    }
  }, [gameState.timeLeft, gameState.timerStarted, gameState.gameWon, gameState.gameLost, gameState.playerName, gameState.currentPoints, gameState.customTime]);

  const getGameMode = useCallback((timeCompleted: number): string => {
    const timeInMinutes = timeCompleted / 60;
    
    if (timeInMinutes <= 5) {
      return 'legend';
    } else if (timeInMinutes <= 20) {
      return 'pro';
    } else if (timeInMinutes <= 60) {
      return 'normal';
    } else {
      return 'noob';
    }
  }, []);

  const calculateLeaderboardScore = useCallback((points: number, maxPoints: number, timeCompleted: number, timeLimit: number): number => {
    // Ensure points don't exceed maximum possible
    const cappedPoints = Math.min(points, maxPoints);
    
    // Rule 1: Accuracy = points gained / maximum points (capped at 1.0)
    const accuracyRatio = maxPoints > 0 ? Math.min(cappedPoints / maxPoints, 1.0) : 0;

    // Rule 2: Time bonus is a ratio from 1.0 (instant) to 0.0 (time up)
    const timeBonusRatio = timeLimit > 0 ? Math.max(0, (timeLimit - timeCompleted) / timeLimit) : 0;

    // Rule 3: Weighted score = accuracy * 0.7 + time bonus * 0.3, scaled to 1000
    const weightedScore = (accuracyRatio * 0.7 + timeBonusRatio * 0.3) * 1000;

    // Rule 4: -100 for time runs out (only if the game was not won)
    const timeoutPenalty = (timeCompleted >= timeLimit && cappedPoints < maxPoints) ? 100 : 0;

    const finalScore = weightedScore - timeoutPenalty;
    
    // Ensure score is a non-negative integer and doesn't exceed 1000
    return Math.round(Math.max(0, Math.min(1000, finalScore)));
  }, []);

  const saveToLeaderboard = useCallback(async (basePoints: number, timeCompleted: number) => {
    const gameMode = getGameMode(timeCompleted);
    const timeLimit = gameState.customTime * 60;
    const leaderboardScore = calculateLeaderboardScore(basePoints, maxPossibleScore, timeCompleted, timeLimit);
    
    console.log('🚀 Attempting to save to leaderboard:', {
      playerName: gameState.playerName,
      basePoints,
      maxPossibleScore,
      timeCompleted,
      timeLimit,
      leaderboardScore,
      stagesCompleted: gameState.stagesCompleted.length,
      gameMode
    });
    
    try {
      const url = '/api/escape-room/leaderboard';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: gameState.playerName,
          finalScore: basePoints,
          leaderboardScore,
          timeCompleted,
          timeLimit,
          maxPossibleScore,
          stagesCompleted: gameState.stagesCompleted.length,
          gameMode
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to save to leaderboard:', response.status, errorText);
      } else {
        const result = await response.json();
        console.log('✅ Successfully saved to leaderboard:', result);
      }
    } catch (error) {
      console.error('💥 Error saving to leaderboard:', error);
    }
  }, [gameState.playerName, gameState.stagesCompleted.length, gameState.customTime, maxPossibleScore, getGameMode, calculateLeaderboardScore]);


  useEffect(() => {
    if (gameState.stagesCompleted.length === stages.length && stages.length > 0 && !gameState.gameWon) {
      console.log('🎉 Game completed! Calculating final score and saving...');

      const timeCompleted = gameState.customTime * 60 - gameState.timeLeft;
      const timeBonusPercentage = Math.floor((gameState.timeLeft / (gameState.customTime * 60)) * 100);
      
      // Calculate time bonus as a percentage of the base score, not additional points
      const timeBonusPoints = Math.floor((gameState.currentPoints * timeBonusPercentage) / 100);
      const finalDisplayScore = Math.min(gameState.currentPoints + timeBonusPoints, maxPossibleScore);

      setGameState(prev => ({
        ...prev,
        gameWon: true,
        currentPoints: finalDisplayScore,
        feedback: `Congratulations! You've escaped! Final Score: ${finalDisplayScore}/${maxPossibleScore} (${prev.currentPoints} base + ${timeBonusPoints} time bonus)`
      }));

      if (gameState.playerName.trim()) {
        console.log('🏆 Saving to leaderboard - game won');
        saveToLeaderboard(finalDisplayScore, timeCompleted);
      }
    }
  }, [gameState.stagesCompleted.length, stages.length, gameState.gameWon, gameState.currentPoints, gameState.timeLeft, gameState.customTime, gameState.playerName, saveToLeaderboard, maxPossibleScore]);

  const startGame = useCallback(async () => {
    try {
      const freshStages = await escapeRoomService.getStages();
      setStages(freshStages);
      
      setGameState({
        timeLeft: gameState.customTime * 60,
        customTime: gameState.customTime,
        timerStarted: true,
        currentStage: -1, 
        userCode: '',
        feedback: '',
        stagesCompleted: [],
        gameWon: false,
        gameLost: false,
        currentPoints: 0,
        hintsUsed: [],
        showHint: false,
        playerName: gameState.playerName
      });
    } catch (error) {
      console.error('Error starting game:', error);
      setGameState(prev => ({
        ...prev,
        timeLeft: prev.customTime * 60,
        timerStarted: true,
        currentStage: -1,
        userCode: '',
        feedback: 'Error loading stages. Please refresh.',
        stagesCompleted: [],
        gameWon: false,
        gameLost: false,
        currentPoints: 0,
        hintsUsed: [],
        showHint: false,
      }));
    }
  }, [gameState.customTime, gameState.playerName]);

  const resetGame = useCallback(() => {
    setGameState({
      timeLeft: 1800, 
      customTime: 30,
      timerStarted: false,
      currentStage: 0,
      userCode: '',
      feedback: '',
      stagesCompleted: [],
      gameWon: false,
      gameLost: false,
      currentPoints: 0,
      hintsUsed: [],
      showHint: false,
      playerName: gameState.playerName
    });
    escapeRoomService.clearGameData();
  }, [gameState.playerName]);

  const updateCustomTime = useCallback((minutes: number) => {
    setGameState(prev => ({
      ...prev,
      customTime: Math.max(1, Math.min(120, minutes))
    }));
  }, []);

  const updateUserCode = useCallback((code: string) => {
    setGameState(prev => ({
      ...prev,
      userCode: code
    }));
  }, []);
  
  const updatePlayerName = useCallback((name: string) => {
    setGameState(prev => ({
      ...prev,
      playerName: name
    }));
  }, []);

  const updateCurrentStage = useCallback((stageIndex: number) => {
    setGameState(prev => ({
      ...prev,
      currentStage: stageIndex,
      userCode: stages[stageIndex]?.starterCode || '',
      feedback: '',
      showHint: false
    }));
  }, [stages]);

  const checkSolution = useCallback(async () => {
    const currentStageData = stages[gameState.currentStage];
    if (!currentStageData || gameState.stagesCompleted.includes(currentStageData.id)) return;

    try {
      const result = await escapeRoomService.checkAnswer(
        currentStageData.id,
        gameState.userCode,
        undefined // sessionId
      );

      if (result.isCorrect) {
        const hintPenalty = gameState.hintsUsed.includes(currentStageData.id) ? 20 : 0;
        const stagePoints = Math.max(0, result.points - hintPenalty);
        
        setGameState(prev => {
          const newPoints = prev.currentPoints + stagePoints;
          // Ensure points don't exceed maximum possible
          const cappedPoints = Math.min(newPoints, maxPossibleScore);
          
          let feedbackMessage = `✓ Correct! +${stagePoints} points (${result.points} base${hintPenalty > 0 ? ` - ${hintPenalty} hint penalty` : ''})`;
          
          // Add linting feedback if available
          if (result.feedback && result.method === 'linting') {
            feedbackMessage += `\n\n${result.feedback}`;
          }
          
          return {
            ...prev,
            feedback: feedbackMessage,
            stagesCompleted: [...new Set([...prev.stagesCompleted, currentStageData.id])],
            currentPoints: cappedPoints
          };
        });

        setTimeout(() => {
          const nextStageIndex = gameState.currentStage + 1;
          if (nextStageIndex < stages.length) {
            updateCurrentStage(nextStageIndex);
          }
        }, 1500);
      } else {
        let feedbackMessage = '✗ Not quite right. Check the hint and try again!';
        
        // Add linting feedback if available
        if (result.feedback && result.method === 'linting') {
          feedbackMessage = result.feedback;
        }
        
        setGameState(prev => ({
          ...prev,
          feedback: feedbackMessage
        }));
      }
    } catch (error) {
      console.error('Error checking solution:', error);
      setGameState(prev => ({
        ...prev,
        feedback: '✗ Error checking solution. Please try again!'
      }));
    }
  }, [gameState.currentStage, gameState.userCode, gameState.stagesCompleted, gameState.hintsUsed, stages, updateCurrentStage]);

  const goToNextStage = useCallback(() => {
    if (gameState.currentStage < stages.length - 1) {
      updateCurrentStage(gameState.currentStage + 1);
    }
  }, [gameState.currentStage, stages.length, updateCurrentStage]);

  const goToPreviousStage = useCallback(() => {
    if (gameState.currentStage > 0) {
      updateCurrentStage(gameState.currentStage - 1);
    }
  }, [gameState.currentStage, updateCurrentStage]);

  const useHint = useCallback(() => {
    const currentStageData = stages[gameState.currentStage];
    if (!currentStageData || gameState.hintsUsed.includes(currentStageData.id)) return;

    setGameState(prev => ({
      ...prev,
      showHint: true,
      hintsUsed: [...new Set([...prev.hintsUsed, currentStageData.id])],
      feedback: `Hint used! A 20 point penalty will be applied for this stage.`
    }));
  }, [gameState.currentStage, gameState.hintsUsed, stages]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getCurrentStage = useCallback((): EscapeRoomStage | null => {
    return stages[gameState.currentStage] || null;
  }, [stages, gameState.currentStage]);

  const getCurrentStagePoints = useCallback(() => {
    const currentStageData = stages[gameState.currentStage];
    if (!currentStageData) return { base: 0, penalty: 0, total: 0 };
    
    const hintPenalty = gameState.hintsUsed.includes(currentStageData.id) ? 20 : 0;
    const basePoints = currentStageData.points;
    const total = Math.max(0, basePoints - hintPenalty);
    
    return {
      base: basePoints,
      penalty: hintPenalty,
      total: total
    };
  }, [gameState.currentStage, gameState.hintsUsed, stages]);

  return {
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
    goToNextStage,
    goToPreviousStage,
    useHint,
    formatTime,
    getCurrentStage,
    getCurrentStagePoints,
    getGameMode,
    calculateLeaderboardScore
  };
};