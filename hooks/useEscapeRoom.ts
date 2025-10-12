"use client";

import { useState, useEffect, useCallback } from 'react';
import { EscapeRoomGameState, EscapeRoomStage } from '@/types/escapeRoom';
import { escapeRoomService } from '@/service/escapeRoomService';

export const useEscapeRoom = () => {
  const [gameState, setGameState] = useState<EscapeRoomGameState>({
    timeLeft: 600, // 10 minutes default
    customTime: 10,
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

  // Load stages on mount
  useEffect(() => {
    const loadStages = async () => {
      try {
        const loadedStages = await escapeRoomService.getStages();
        setStages(loadedStages);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load escape room stages:', error);
        setIsLoaded(true);
      }
    };
    
    loadStages();
  }, []);

  // Timer effect & Game Lost Logic
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
        saveToLeaderboard(gameState.currentPoints, timeCompleted);
      }
    }
  }, [gameState.timeLeft, gameState.timerStarted, gameState.gameWon, gameState.gameLost]);

  const saveToLeaderboard = useCallback(async (finalScore: number, timeCompleted: number) => {
    console.log('🚀 Attempting to save to leaderboard:', {
      playerName: gameState.playerName,
      finalScore,
      timeCompleted,
      stagesCompleted: gameState.stagesCompleted.length
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
          finalScore,
          timeCompleted,
          stagesCompleted: gameState.stagesCompleted.length,
          gameMode: 'normal'
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
  }, [gameState.playerName, gameState.stagesCompleted.length]);

  // Game completion and save logic (Game Won)
  useEffect(() => {
    if (gameState.stagesCompleted.length === stages.length && stages.length > 0 && !gameState.gameWon) {
      console.log('🎉 Game completed! Calculating final score and saving...');

      const timeBonus = Math.floor((gameState.timeLeft / (gameState.customTime * 60)) * 100);
      const finalScore = gameState.currentPoints + timeBonus;
      const timeCompleted = gameState.customTime * 60 - gameState.timeLeft;

      setGameState(prev => ({
        ...prev,
        gameWon: true,
        currentPoints: finalScore,
        feedback: `Congratulations! You've escaped the room! Final Score: ${finalScore} (${prev.currentPoints} + ${timeBonus} time bonus)`
      }));

      if (gameState.playerName.trim()) {
        console.log('🏆 Saving to leaderboard - game won');
        saveToLeaderboard(finalScore, timeCompleted);
      }
    }
  }, [gameState.stagesCompleted.length, stages.length, gameState.gameWon, gameState.currentPoints, gameState.timeLeft, gameState.customTime, gameState.playerName, saveToLeaderboard]);

  const startGame = useCallback(async () => {
    try {
      // Load fresh questions for each game
      const freshStages = await escapeRoomService.getStages();
      setStages(freshStages);
      
      setGameState({
        timeLeft: gameState.customTime * 60,
        customTime: gameState.customTime,
        timerStarted: true,
        currentStage: 0,
        userCode: freshStages[0]?.starterCode || '',
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
      // Fallback to existing stages
      setGameState({
        timeLeft: gameState.customTime * 60,
        customTime: gameState.customTime,
        timerStarted: true,
        currentStage: 0,
        userCode: stages[0]?.starterCode || '',
        feedback: '',
        stagesCompleted: [],
        gameWon: false,
        gameLost: false,
        currentPoints: 0,
        hintsUsed: [],
        showHint: false,
        playerName: gameState.playerName
      });
    }
  }, [gameState.customTime, gameState.playerName, stages]);

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

  // --- FIX APPLIED HERE ---
  // Enhanced normalizeCode function for more flexible checking.
  const normalizeCode = useCallback((code: string): string => {
    return code
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/[,\[\]]/g, ' ') // Normalize array formatting
      .replace(/\s*,\s*/g, ',') // Normalize comma spacing
      .toLowerCase();
  }, []);

  const checkSolution = useCallback(async () => {
    const currentStageData = stages[gameState.currentStage];
    if (!currentStageData || gameState.stagesCompleted.includes(currentStageData.id)) return;

    try {
      // Use API to check the answer
      const result = await escapeRoomService.checkAnswer(
        currentStageData.id,
        gameState.userCode
      );

      if (result.isCorrect) {
        const newStagesCompleted = [...new Set([...gameState.stagesCompleted, currentStageData.id])];
        const hintPenalty = gameState.hintsUsed.includes(currentStageData.id) ? 20 : 0;
        const stagePoints = result.points - hintPenalty;
        
        setGameState(prev => ({
          ...prev,
          feedback: `✓ Correct! +${stagePoints} points (${result.points} base${hintPenalty > 0 ? ` - ${hintPenalty} hint penalty` : ''})`,
          stagesCompleted: newStagesCompleted,
          currentPoints: prev.currentPoints + stagePoints
        }));

        setTimeout(() => {
          if (gameState.currentStage < stages.length - 1) {
            goToNextStage();
          }
        }, 1500);
      } else {
        setGameState(prev => ({
          ...prev,
          feedback: '✗ Not quite right. Check the hint and try again!'
        }));
      }
    } catch (error) {
      console.error('Error checking solution:', error);
      setGameState(prev => ({
        ...prev,
        feedback: '✗ Error checking solution. Please try again!'
      }));
    }
  }, [gameState.currentStage, gameState.userCode, gameState.stagesCompleted, gameState.hintsUsed, stages]);

  const goToNextStage = useCallback(() => {
    if (gameState.currentStage < stages.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentStage: prev.currentStage + 1,
        userCode: stages[prev.currentStage + 1]?.starterCode || '',
        feedback: '',
        showHint: false
      }));
    }
  }, [gameState.currentStage, stages]);

  const goToPreviousStage = useCallback(() => {
    if (gameState.currentStage > 0) {
      setGameState(prev => ({
        ...prev,
        currentStage: prev.currentStage - 1,
        userCode: stages[prev.currentStage - 1]?.starterCode || '',
        feedback: '',
        showHint: false
      }));
    }
  }, [gameState.currentStage, stages]);

  const useHint = useCallback(() => {
    const currentStageData = stages[gameState.currentStage];
    if (!currentStageData || gameState.hintsUsed.includes(currentStageData.id)) return;

    setGameState(prev => ({
      ...prev,
      showHint: true,
      hintsUsed: [...prev.hintsUsed, currentStageData.id],
      feedback: `Hint used! -20 points deducted.`
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
    if (!currentStageData) return { base: 0, timeBonus: 0, total: 0 };
    
    const timeBonus = Math.floor((gameState.timeLeft / (gameState.customTime * 60)) * 50);
    const hintPenalty = gameState.hintsUsed.includes(currentStageData.id) ? 20 : 0;
    const basePoints = currentStageData.points - hintPenalty;
    
    return {
      base: basePoints,
      timeBonus: timeBonus,
      total: basePoints + timeBonus
    };
  }, [gameState.currentStage, gameState.timeLeft, gameState.customTime, gameState.hintsUsed, stages]);

  return {
    gameState,
    stages,
    isLoaded,
    startGame,
    resetGame,
    updateCustomTime,
    updatePlayerName,
    updateUserCode,
    checkSolution,
    goToNextStage,
    goToPreviousStage,
    useHint,
    formatTime,
    getCurrentStage,
    getCurrentStagePoints
  };
};