import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Heart, Star, Flame, Forward, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Question } from "@shared/schema";
import { formatTime, getDifficultyColor, getSubjectColor } from "@/lib/quiz-data";

interface QuizInterfaceProps {
  questions: Question[];
  onExit: () => void;
  onComplete: (score: number, timeSpent: number) => void;
}

export default function QuizInterface({ questions, onExit, onComplete }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleQuizComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleOptionSelect = (optionIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setShowFeedback(true);

    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
      setStreak(prev => prev + 1);
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
    }

    setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        handleQuizComplete();
      }
    }, 2000);
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete(score, timeSpent);
  };

  const getOptionClass = (optionIndex: number) => {
    if (!showFeedback) {
      return selectedAnswer === optionIndex ? "selected" : "";
    }
    
    if (optionIndex === currentQuestion.correctAnswer) {
      return "correct";
    } else if (optionIndex === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
      return "incorrect";
    }
    return "";
  };

  return (
    <div className="fixed inset-0 bg-bg-soft z-50" data-testid="quiz-interface">
      {/* Quiz Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              data-testid="button-exit-quiz"
            >
              <X className="text-xl" />
            </Button>
            
            {/* Progress Bar */}
            <div className="flex-1 mx-6">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">
                  Soru <span data-testid="current-question">{currentQuestionIndex + 1}</span>/
                  <span data-testid="total-questions">{questions.length}</span>
                </span>
                <div className="flex-1">
                  <Progress value={progressPercentage} className="h-3" />
                </div>
                <div className="text-sm font-bold text-primary" data-testid="progress-percentage">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
              <Clock className="text-gray-600 w-4 h-4" />
              <span className="text-sm font-medium text-text-dark" data-testid="time-remaining">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question Card */}
            <Card className="bg-white shadow-sm mb-6">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge className={getSubjectColor(currentQuestion.subject)} data-testid="question-subject">
                      {currentQuestion.subject}
                    </Badge>
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)} data-testid="question-difficulty">
                      {currentQuestion.difficulty === "easy" ? "Kolay" : 
                       currentQuestion.difficulty === "medium" ? "Orta" : "Zor"}
                    </Badge>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-text-dark mb-4" data-testid="question-text">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                {/* Quiz Options */}
                <div className="space-y-3">
                  {(currentQuestion.options as Array<{text: string, letter: string}>).map((option, index: number) => (
                    <motion.button
                      key={index}
                      className={`w-full p-4 text-left rounded-xl border-2 border-gray-200 quiz-option ${getOptionClass(index)}`}
                      onClick={() => handleOptionSelect(index)}
                      disabled={showFeedback}
                      whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                      whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                      data-testid={`option-${index}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          getOptionClass(index) ? "bg-white text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                          {option.letter || String.fromCharCode(65 + index)}
                        </div>
                        <span className={`font-medium ${
                          getOptionClass(index) ? "text-white" : "text-text-dark"
                        }`}>
                          {option.text}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Explanation */}
                {showFeedback && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                    data-testid="question-explanation"
                  >
                    <p className="text-blue-800">{currentQuestion.explanation}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSkipQuestion}
                disabled={showFeedback}
                data-testid="button-skip"
              >
                <Forward className="mr-2 w-4 h-4" />
                Atla
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white btn-primary"
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || showFeedback}
                data-testid="button-submit"
              >
                <Check className="mr-2 w-4 h-4" />
                Cevapla
              </Button>
            </div>

            {/* Bottom Stats */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2" data-testid="lives-remaining">
                <Heart className="text-error w-4 h-4" />
                <span>{lives}</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="points-earned">
                <Star className="text-warning w-4 h-4" />
                <span>+{score}</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="streak-count">
                <Flame className="text-accent w-4 h-4" />
                <span>{streak}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
