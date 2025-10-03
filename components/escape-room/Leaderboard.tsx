"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Target, RefreshCw } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  playerName: string;
  finalScore: number;
  timeCompleted: number;
  stagesCompleted: number;
  gameMode: string;
  createdAt: string;
  completedAt?: string;
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/escape-room/leaderboard?limit=20');
      if (response.ok) {
        const data = await response.json();
        console.log('Leaderboard data loaded:', data);
        setLeaderboard(data);
      } else {
        setError('Failed to load leaderboard');
        console.error('Failed to load leaderboard:', response.status);
      }
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-500">
          {index + 1}
        </span>;
    }
  };

  if (!isOpen) {
    console.log('Leaderboard modal not open');
    return null;
  }

  console.log('Leaderboard modal is open, rendering...');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold flex items-center">
              <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
              Leaderboard
            </CardTitle>
            <CardDescription>
              Top performers in the Escape Room Challenge
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadLeaderboard}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={loadLeaderboard} variant="outline">
                Try Again
              </Button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No scores yet!</p>
              <p className="text-gray-400">Be the first to complete the escape room!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index < 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {getRankIcon(index)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{entry.playerName}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {entry.stagesCompleted} stages
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(entry.timeCompleted)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                            {entry.gameMode}
                          </span>
                          <span className="text-xs">
                            {formatDateTime(entry.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {entry.finalScore}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
