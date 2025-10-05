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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');

  // Load stages on mount
  useEffect(() => {
    const loadStages = async () => {
      try {
        const response = await fetch('/api/escape-room/stages');
        if (response.ok) {
          const loadedStages = await response.json();
          setStages(loadedStages);
        } else {
          // Fallback to local storage
          const loadedStages = escapeRoomService.getStages();
          setStages(loadedStages);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load escape room stages:', error);
        // Fallback to local storage
        const loadedStages = escapeRoomService.getStages();
        setStages(loadedStages);
        setIsLoaded(true);
      }
    };

    loadStages();
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
      
      // Add to leaderboard
      addToLeaderboard();
    }
  }, [gameState.stagesCompleted.length, stages.length]);

  const addToLeaderboard = useCallback(async () => {
    if (!playerName.trim() || !sessionId) return;

    try {
      const finalScore = calculateScore();
      const timeCompleted = (gameState.customTime * 60) - gameState.timeLeft;
      
      await fetch('/api/escape-room/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName.trim(),
          finalScore,
          timeCompleted,
          stagesCompleted: gameState.stagesCompleted.length,
          gameMode: 'normal',
        }),
      });
    } catch (error) {
      console.error('Failed to add to leaderboard:', error);
    }
  }, [playerName, sessionId, gameState]);

  const calculateScore = useCallback(() => {
    const baseScore = gameState.stagesCompleted.length * 100;
    const timeBonus = Math.max(0, gameState.timeLeft * 2); // 2 points per second remaining
    const completionBonus = gameState.stagesCompleted.length === stages.length ? 500 : 0;
    return baseScore + timeBonus + completionBonus;
  }, [gameState, stages.length]);

  const startGame = useCallback(async () => {
    if (!playerName.trim()) {
      setGameState(prev => ({
        ...prev,
        feedback: 'Please enter your name to start the game!'
      }));
      return;
    }

    try {
      // Create database session
      const response = await fetch('/api/escape-room/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName.trim(),
          timeLimit: gameState.customTime,
          timeLeft: gameState.customTime * 60,
        }),
      });

      if (response.ok) {
        const session = await response.json();
        setSessionId(session.id);
        
        // Log game start event
        await fetch('/api/escape-room/sessions/' + session.id + '/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventType: 'game_started',
            eventData: { timeLimit: gameState.customTime, playerName: playerName.trim() },
          }),
        });
      }

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
  }, [gameState.customTime, stages, playerName]);

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
    setSessionId(null);
    escapeRoomService.clearGameData();
  }, []);

  const saveGame = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/escape-room/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentStage: gameState.currentStage,
          timeLeft: gameState.timeLeft,
          stagesCompleted: gameState.stagesCompleted,
          userCode: gameState.userCode,
          gameWon: gameState.gameWon,
          gameLost: gameState.gameLost,
        }),
      });

      if (response.ok) {
        console.log('Game saved successfully');
      }
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }, [sessionId, gameState]);

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
    // Normalize code by removing extra whitespace but preserving line structure
    return code
      .trim()
      .split('\n')
      .map(line => line.trim()) // Trim each line
      .filter(line => line.length > 0) // Remove empty lines
      .join('\n');
  }, []);

  const checkSolution = useCallback(() => {
    if (!stages[gameState.currentStage]) return;

    const currentStageData = stages[gameState.currentStage];
    const userCode = gameState.userCode.trim();
    const solution = currentStageData.solution.trim();

    console.log('Checking solution for stage:', currentStageData.title);
    console.log('User code:', JSON.stringify(userCode));
    console.log('Expected solution:', JSON.stringify(solution));

    // First check for exact match
    if (userCode === solution) {
      console.log('Exact match found!');
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
      return;
    }

    // For more flexible checking, normalize both codes
    const userNormalized = normalizeCode(userCode);
    const solutionNormalized = normalizeCode(solution);

    console.log('User normalized:', JSON.stringify(userNormalized));
    console.log('Solution normalized:', JSON.stringify(solutionNormalized));

    // Special handling for Stage 3 (Generate Numbers) - very simple case
    if (currentStageData.id === 3) {
      // For stage 3, check if the user code contains the essential parts
      const hasRange = userNormalized.includes('range(1001)');
      const hasPrint = userNormalized.includes('print(i)');
      const hasFor = userNormalized.includes('for i in');
      
      if (hasRange && hasPrint && hasFor) {
        console.log('Stage 3 special case match found!');
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
        return;
      }
    }

    // Check if the normalized versions are similar enough
    // This is more strict than before - require at least 80% similarity
    const similarity = calculateSimilarity(userNormalized, solutionNormalized);
    console.log('Similarity score:', similarity);
    
    if (similarity >= 0.8) {
      console.log('Similarity match found!');
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
      console.log('No match found - similarity too low');
      setGameState(prev => ({
        ...prev,
        feedback: '✗ Not quite right. Check the hint and try again!'
      }));
    }
  }, [gameState.currentStage, gameState.userCode, gameState.stagesCompleted, stages, normalizeCode]);

  // Helper function to calculate similarity between two strings
  const calculateSimilarity = useCallback((str1: string, str2: string): number => {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    // For very short strings, be more lenient
    if (str1.length < 10 || str2.length < 10) {
      // Check if one contains the other
      if (str1.includes(str2) || str2.includes(str1)) {
        return 0.9;
      }
    }
    
    // Simple Levenshtein distance-based similarity
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }, []);

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

  const goToPreviousStage = useCallback(() => {
    if (gameState.currentStage > 0) {
      setGameState(prev => ({
        ...prev,
        currentStage: prev.currentStage - 1,
        userCode: stages[gameState.currentStage - 1]?.starterCode || '',
        feedback: ''
      }));
    }
  }, [gameState.currentStage, stages]);

  const goToNextStage = useCallback(() => {
    if (gameState.currentStage < stages.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentStage: prev.currentStage + 1,
        userCode: stages[gameState.currentStage + 1]?.starterCode || '',
        feedback: ''
      }));
    }
  }, [gameState.currentStage, stages]);

  return {
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
    getCurrentStage
  };
};
