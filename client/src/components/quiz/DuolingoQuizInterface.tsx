// Main Duolingo-style Quiz Interface
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Volume2, Pause, Play, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizEngine, QuizEngineQuestion, QuizFeedback as QuizFeedbackType } from '@/lib/quiz-engine';
import { QuestionTypeRouter } from './QuestionTypes';
import { QuizFeedback, XPGainAnimation, StreakDisplay, LivesDisplay } from './QuizFeedback';

interface DuolingoQuizInterfaceProps {
  questions: QuizEngineQuestion[];
  onExit: () => void;
  onComplete: (metrics: any) => void;
}

export function DuolingoQuizInterface({ questions, onExit, onComplete }: DuolingoQuizInterfaceProps) {
  const [quizEngine] = useState(() => new QuizEngine(questions, 5));
  const [quizState, setQuizState] = useState(() => quizEngine.getState());
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<QuizFeedbackType | null>(null);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to quiz engine state changes
  useEffect(() => {
    const unsubscribe = quizEngine.subscribe((state) => {
      setQuizState(state);
      
      if (state.isCompleted || state.lives <= 0) {
        handleQuizComplete();
      }
    });

    return unsubscribe;
  }, []);

  // Timer management
  useEffect(() => {
    if (isPaused || showFeedback) return;

    const currentQuestion = quizEngine.getCurrentQuestion();
    if (!currentQuestion) return;

    setTimeLeft(currentQuestion.timeLimit || 60);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizState.currentQuestionIndex, isPaused, showFeedback]);

  const handleTimeUp = () => {
    if (showFeedback) return;
    
    // Auto-skip when time runs out
    const feedback = quizEngine.submitAnswer(null);
    setFeedback(feedback);
    setShowFeedback(true);
    
    // Show XP animation if gained
    if (feedback.xpGained > 0) {
      setShowXPAnimation(true);
      setTimeout(() => setShowXPAnimation(false), 2000);
    }
    
    // Auto-advance after delay
    feedbackTimeoutRef.current = setTimeout(() => {
      handleNextQuestion();
    }, 2500);
  };

  const handleAnswerSubmit = (answer: any) => {
    if (showFeedback) return;
    
    setCurrentAnswer(answer);
    
    try {
      const feedbackResult = quizEngine.submitAnswer(answer);
      setFeedback(feedbackResult);
      setShowFeedback(true);
      
      // Play sound effect (if audio is enabled)
      playFeedbackSound(feedbackResult.isCorrect);
      
      // Show XP animation if gained
      if (feedbackResult.xpGained > 0) {
        setShowXPAnimation(true);
        setTimeout(() => setShowXPAnimation(false), 2000);
      }
      
      // Auto-advance after delay
      feedbackTimeoutRef.current = setTimeout(() => {
        handleNextQuestion();
      }, feedbackResult.isCorrect ? 2000 : 3000);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNextQuestion = () => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    
    const hasNext = quizEngine.nextQuestion();
    if (hasNext) {
      // Reset for next question
      setCurrentAnswer(null);
      setShowFeedback(false);
      setFeedback(null);
    }
  };

  const handleSkipQuestion = () => {
    if (showFeedback) return;
    
    const hasNext = quizEngine.skipQuestion();
    if (hasNext) {
      setCurrentAnswer(null);
      setShowFeedback(false);
      setFeedback(null);
    }
  };

  const handleQuizComplete = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    
    const metrics = quizEngine.getPerformanceMetrics();
    onComplete(metrics);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const playFeedbackSound = (isCorrect: boolean) => {
    // Audio feedback implementation would go here
    // You could play different sounds for correct/incorrect answers
    try {
      const audio = new Audio(isCorrect ? '/sounds/correct.mp3' : '/sounds/incorrect.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore audio play failures
    } catch (error) {
      // Audio not supported or files not found
    }
  };

  const currentQuestion = quizEngine.getCurrentQuestion();
  const progress = quizEngine.getProgress();
  
  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  const timePercentage = ((currentQuestion.timeLimit || 60) - timeLeft) / (currentQuestion.timeLimit || 60) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 z-50">
      {/* Quiz Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Exit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              className="hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
            
            {/* Progress Bar */}
            <div className="flex-1 mx-6">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium min-w-[4rem]">
                  {quizState.currentQuestionIndex + 1}/{quizState.questions.length}
                </span>
                <div className="flex-1 relative">
                  <Progress value={progress} className="h-3" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50 animate-pulse" />
                </div>
                <span className="text-sm font-bold text-blue-600 min-w-[3rem]">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            
            {/* Timer & Controls */}
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                timeLeft <= 10 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <Clock className={`w-4 h-4 ${
                  timeLeft <= 10 ? 'text-red-600' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  timeLeft <= 10 ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePause}
                className="hover:bg-gray-100"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Time Progress Bar */}
          <div className="mt-2">
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  timeLeft <= 10 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: `${100 - timePercentage}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <LivesDisplay lives={quizState.lives} maxLives={5} />
            <StreakDisplay streak={quizState.streak} />
            <div className="flex items-center space-x-1 text-yellow-600">
              <span className="font-bold">{quizState.xpGained} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {!isPaused && (
          <AnimatePresence mode="wait">
            <motion.div
              key={quizState.currentQuestionIndex}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardContent className="p-8">
                  <QuestionTypeRouter
                    question={currentQuestion}
                    onAnswer={handleAnswerSubmit}
                    showFeedback={showFeedback}
                    userAnswer={currentAnswer}
                    isCorrect={feedback?.isCorrect}
                  />
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handleSkipQuestion}
                      disabled={showFeedback}
                      className="flex items-center space-x-2"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span>Atla</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pause Screen */}
        {isPaused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">⏸️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Quiz Duraklatıldı
                </h2>
                <p className="text-gray-600 mb-6">
                  Hazır olduğunuzda devam edin
                </p>
                <Button
                  onClick={togglePause}
                  className="w-full"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Devam Et
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Feedback Modal */}
      <QuizFeedback
        feedback={feedback}
        isVisible={showFeedback}
      />

      {/* XP Animation */}
      <XPGainAnimation
        xpGain={feedback?.xpGained || 0}
        isVisible={showXPAnimation}
        onComplete={() => setShowXPAnimation(false)}
      />
    </div>
  );
}