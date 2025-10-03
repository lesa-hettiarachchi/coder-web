"use client";

import { useState, useEffect, useCallback } from 'react';
import { EscapeRoomGameState, EscapeRoomStage, EscapeRoomAction } from '@/types/escapeRoom';
import { escapeRoomService } from '@/service/escapeRoomService';

export const useEscapeRoom = () => {
  const [gameState, setGameState] = useState<EscapeRoomGameState>({
    timeLeft: 1800, // 30 minutes default
    customTime: 30,
    timerStarted: false,
    currentStage: 0,
    userCode: '',
    feedback: '',
    stagesCompleted: [],
    gameWon: false,
    gameLost: false
  });

  const [stages, setStages] = useState<EscapeRoomStage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load stages on mount
  useEffect(() => {
    try {
      const loadedStages = escapeRoomService.getStages();
      setStages(loadedStages);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load escape room stages:', error);
      setIsLoaded(true);
    }
  }, []);

  // Timer effect
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
    }
  }, [gameState.timeLeft, gameState.timerStarted, gameState.gameWon, gameState.gameLost]);

  // Check for game completion
  useEffect(() => {
    if (gameState.stagesCompleted.length === stages.length && stages.length > 0) {
      setGameState(prev => ({
        ...prev,
        gameWon: true,
        feedback: "Congratulations! You've escaped the room!"
      }));
    }
  }, [gameState.stagesCompleted.length, stages.length]);

  const startGame = useCallback(() => {
    try {
      const newGame = escapeRoomService.createNewGame();
      setGameState({
        timeLeft: gameState.customTime * 60,
        customTime: gameState.customTime,
        timerStarted: true,
        currentStage: 0,
        userCode: stages[0]?.starterCode || '',
        feedback: '',
        stagesCompleted: [],
        gameWon: false,
        gameLost: false
      });
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  }, [gameState.customTime, stages]);

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
      gameLost: false
    });
    escapeRoomService.clearGameData();
  }, []);

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

  const normalizeCode = useCallback((code: string): string => {
    return code.trim().replace(/\s+/g, ' ').toLowerCase();
  }, []);

  const checkSolution = useCallback(() => {
    if (!stages[gameState.currentStage]) return;

    const currentStageData = stages[gameState.currentStage];
    const userNormalized = normalizeCode(gameState.userCode);
    const solutionNormalized = normalizeCode(currentStageData.solution);

    // More flexible checking - allow variations
    const isCorrect = userNormalized.includes(solutionNormalized.substring(0, 50)) || 
                     solutionNormalized.includes(userNormalized.substring(0, 50));

    if (gameState.userCode.trim() === currentStageData.solution.trim() || isCorrect) {
      const newStagesCompleted = [...gameState.stagesCompleted, currentStageData.id];
      
      setGameState(prev => ({
        ...prev,
        feedback: '✓ Correct! Moving to next stage...',
        stagesCompleted: newStagesCompleted
      }));

      // Move to next stage after delay
      setTimeout(() => {
        if (gameState.currentStage < stages.length - 1) {
          setGameState(prev => ({
            ...prev,
            currentStage: prev.currentStage + 1,
            userCode: stages[gameState.currentStage + 1]?.starterCode || '',
            feedback: ''
          }));
        }
      }, 1500);
    } else {
      setGameState(prev => ({
        ...prev,
        feedback: '✗ Not quite right. Check the hint and try again!'
      }));
    }
  }, [gameState.currentStage, gameState.userCode, gameState.stagesCompleted, stages, normalizeCode]);

  const skipStage = useCallback(() => {
    if (gameState.currentStage < stages.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentStage: prev.currentStage + 1,
        userCode: stages[gameState.currentStage + 1]?.starterCode || '',
        feedback: ''
      }));
    }
  }, [gameState.currentStage, stages]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getCurrentStage = useCallback((): EscapeRoomStage | null => {
    return stages[gameState.currentStage] || null;
  }, [stages, gameState.currentStage]);

  return {
    gameState,
    stages,
    isLoaded,
    startGame,
    resetGame,
    updateCustomTime,
    updateUserCode,
    checkSolution,
    skipStage,
    formatTime,
    getCurrentStage
  };
};
