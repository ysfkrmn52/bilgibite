// Duolingo-style Question Type Components
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { QuizEngineQuestion } from '@/lib/quiz-engine';

// Animation variants
const questionVariants = {
  enter: { opacity: 0, scale: 0.9, y: 20 },
  center: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.1, y: -20 }
};

const optionVariants = {
  idle: { scale: 1, backgroundColor: '#ffffff' },
  hover: { scale: 1.02 },
  selected: { scale: 0.98, backgroundColor: '#dbeafe' },
  correct: { scale: 1, backgroundColor: '#dcfce7' },
  incorrect: { scale: 1, backgroundColor: '#fee2e2' }
};

interface QuestionTypeProps {
  question: QuizEngineQuestion;
  onAnswer: (answer: any) => void;
  showFeedback: boolean;
  userAnswer?: any;
  isCorrect?: boolean;
}

// Multiple Choice Question
export function MultipleChoiceQuestion({ question, onAnswer, showFeedback, userAnswer, isCorrect }: QuestionTypeProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(userAnswer ?? null);
  
  const handleOptionSelect = (optionIndex: number) => {
    if (showFeedback) return;
    setSelectedOption(optionIndex);
    onAnswer(optionIndex);
  };

  const getOptionVariant = (optionIndex: number) => {
    if (!showFeedback) {
      return selectedOption === optionIndex ? 'selected' : 'idle';
    }
    
    if (optionIndex === question.correctAnswer) {
      return 'correct';
    } else if (optionIndex === selectedOption && !isCorrect) {
      return 'incorrect';
    }
    return 'idle';
  };

  return (
    <motion.div
      variants={questionVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4"
    >
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {question.questionText}
      </h2>
      
      <div className="space-y-3">
        {(question.options as Array<{text: string, letter: string}>).map((option, index) => (
          <motion.button
            key={index}
            variants={optionVariants}
            initial="idle"
            animate={getOptionVariant(index)}
            whileHover={showFeedback ? {} : "hover"}
            whileTap={showFeedback ? {} : { scale: 0.95 }}
            onClick={() => handleOptionSelect(index)}
            disabled={showFeedback}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
              getOptionVariant(index) === 'selected' ? 'border-blue-400' :
              getOptionVariant(index) === 'correct' ? 'border-green-400' :
              getOptionVariant(index) === 'incorrect' ? 'border-red-400' :
              'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  getOptionVariant(index) === 'correct' ? 'bg-green-500 text-white' :
                  getOptionVariant(index) === 'incorrect' ? 'bg-red-500 text-white' :
                  getOptionVariant(index) === 'selected' ? 'bg-blue-500 text-white' :
                  'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                {option.letter || String.fromCharCode(65 + index)}
              </motion.div>
              <span className={`font-medium ${
                getOptionVariant(index) === 'correct' || getOptionVariant(index) === 'incorrect' 
                  ? 'text-white' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {option.text}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// True/False Question
export function TrueFalseQuestion({ question, onAnswer, showFeedback, userAnswer, isCorrect }: QuestionTypeProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(userAnswer ?? null);
  
  const handleAnswerSelect = (answer: boolean) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    onAnswer(answer ? 1 : 0); // Convert to index for consistency
  };

  const getButtonVariant = (isTrue: boolean) => {
    const answer = isTrue ? 1 : 0;
    const selected = selectedAnswer === isTrue;
    
    if (!showFeedback) {
      return selected ? 'selected' : 'idle';
    }
    
    if (answer === question.correctAnswer) {
      return 'correct';
    } else if (selected && !isCorrect) {
      return 'incorrect';
    }
    return 'idle';
  };

  return (
    <motion.div
      variants={questionVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-6"
    >
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        {question.questionText}
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          variants={optionVariants}
          initial="idle"
          animate={getButtonVariant(true)}
          whileHover={showFeedback ? {} : "hover"}
          whileTap={showFeedback ? {} : { scale: 0.95 }}
          onClick={() => handleAnswerSelect(true)}
          disabled={showFeedback}
          className={`p-6 rounded-xl border-2 text-lg font-bold transition-all ${
            getButtonVariant(true) === 'correct' ? 'border-green-400 bg-green-50 text-green-800' :
            getButtonVariant(true) === 'incorrect' ? 'border-red-400 bg-red-50 text-red-800' :
            getButtonVariant(true) === 'selected' ? 'border-blue-400 bg-blue-50 text-blue-800' :
            'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-gray-300'
          }`}
        >
          ✓ DOĞRU
        </motion.button>
        
        <motion.button
          variants={optionVariants}
          initial="idle"
          animate={getButtonVariant(false)}
          whileHover={showFeedback ? {} : "hover"}
          whileTap={showFeedback ? {} : { scale: 0.95 }}
          onClick={() => handleAnswerSelect(false)}
          disabled={showFeedback}
          className={`p-6 rounded-xl border-2 text-lg font-bold transition-all ${
            getButtonVariant(false) === 'correct' ? 'border-green-400 bg-green-50 text-green-800' :
            getButtonVariant(false) === 'incorrect' ? 'border-red-400 bg-red-50 text-red-800' :
            getButtonVariant(false) === 'selected' ? 'border-blue-400 bg-blue-50 text-blue-800' :
            'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-gray-300'
          }`}
        >
          ✗ YANLIŞ
        </motion.button>
      </div>
    </motion.div>
  );
}

// Fill in the Blank Question
export function FillBlankQuestion({ question, onAnswer, showFeedback, userAnswer, isCorrect }: QuestionTypeProps) {
  const [inputValue, setInputValue] = useState(userAnswer || '');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showFeedback) return;
    const value = e.target.value;
    setInputValue(value);
    onAnswer(value);
  };

  const parts = question.questionText.split('___');
  
  return (
    <motion.div
      variants={questionVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: 'auto' }}
                className="inline-block mx-2"
              >
                <Input
                  value={inputValue}
                  onChange={handleInputChange}
                  disabled={showFeedback}
                  className={`inline-block w-32 mx-1 text-center font-bold border-2 ${
                    showFeedback
                      ? isCorrect
                        ? 'border-green-400 bg-green-50 text-green-800'
                        : 'border-red-400 bg-red-50 text-red-800'
                      : 'border-blue-400 focus:border-blue-500'
                  }`}
                  placeholder="..."
                />
              </motion.span>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {showFeedback && question.interactiveData?.correctAnswers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
        >
          <p className="text-blue-800 dark:text-blue-200">
            <strong>Doğru cevap{question.interactiveData.correctAnswers.length > 1 ? 'lar' : ''}:</strong>{' '}
            {question.interactiveData.correctAnswers.join(', ')}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Matching Question
export function MatchingQuestion({ question, onAnswer, showFeedback, userAnswer, isCorrect }: QuestionTypeProps) {
  const [matches, setMatches] = useState<{[key: string]: string}>(userAnswer || {});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  
  const leftItems = question.interactiveData?.leftItems || [];
  const rightItems = question.interactiveData?.rightItems || [];
  const correctPairs = question.interactiveData?.correctPairs || {};
  
  const handleLeftItemClick = (item: string) => {
    if (showFeedback) return;
    setSelectedLeft(selectedLeft === item ? null : item);
  };
  
  const handleRightItemClick = (item: string) => {
    if (showFeedback || !selectedLeft) return;
    
    const newMatches = { ...matches };
    
    // Remove any existing match for this right item
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === item) {
        delete newMatches[key];
      }
    });
    
    newMatches[selectedLeft] = item;
    setMatches(newMatches);
    setSelectedLeft(null);
    onAnswer(newMatches);
  };
  
  const getLeftItemClass = (item: string) => {
    if (showFeedback) {
      const isCorrectMatch = correctPairs[item] === matches[item];
      return isCorrectMatch ? 'bg-green-100 border-green-400 text-green-800' : 
             matches[item] ? 'bg-red-100 border-red-400 text-red-800' :
             'bg-gray-100 border-gray-300 text-gray-600';
    }
    
    return selectedLeft === item ? 'bg-blue-100 border-blue-400 text-blue-800' :
           matches[item] ? 'bg-green-50 border-green-300 text-green-700' :
           'bg-white border-gray-200 text-gray-900 dark:text-white hover:border-gray-300';
  };
  
  const getRightItemClass = (item: string) => {
    if (showFeedback) {
      const matchedLeft = Object.keys(matches).find(left => matches[left] === item);
      if (matchedLeft) {
        const isCorrectMatch = correctPairs[matchedLeft] === item;
        return isCorrectMatch ? 'bg-green-100 border-green-400 text-green-800' :
               'bg-red-100 border-red-400 text-red-800';
      }
      return 'bg-gray-100 border-gray-300 text-gray-600';
    }
    
    const isMatched = Object.values(matches).includes(item);
    return isMatched ? 'bg-green-50 border-green-300 text-green-700' :
           'bg-white border-gray-200 text-gray-900 dark:text-white hover:border-gray-300';
  };

  return (
    <motion.div
      variants={questionVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-6"
    >
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
        {question.questionText}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Sol taraf</h3>
          {leftItems.map((item: string, index: number) => (
            <motion.button
              key={index}
              whileHover={{ scale: showFeedback ? 1 : 1.02 }}
              whileTap={{ scale: showFeedback ? 1 : 0.98 }}
              onClick={() => handleLeftItemClick(item)}
              disabled={showFeedback}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${getLeftItemClass(item)}`}
            >
              <span className="font-medium">{item}</span>
              {matches[item] && (
                <span className="ml-2 text-sm opacity-75">→ {matches[item]}</span>
              )}
            </motion.button>
          ))}
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Sağ taraf</h3>
          {rightItems.map((item: string, index: number) => (
            <motion.button
              key={index}
              whileHover={{ scale: showFeedback ? 1 : 1.02 }}
              whileTap={{ scale: showFeedback ? 1 : 0.98 }}
              onClick={() => handleRightItemClick(item)}
              disabled={showFeedback}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${getRightItemClass(item)}`}
            >
              <span className="font-medium">{item}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {selectedLeft && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <p className="text-blue-800 dark:text-blue-200">
            "<strong>{selectedLeft}</strong>" için eşleşme seçin
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Question Type Router
export function QuestionTypeRouter(props: QuestionTypeProps) {
  switch (props.question.type) {
    case 'multiple-choice':
      return <MultipleChoiceQuestion {...props} />;
    case 'true-false':
      return <TrueFalseQuestion {...props} />;
    case 'fill-blank':
      return <FillBlankQuestion {...props} />;
    case 'matching':
      return <MatchingQuestion {...props} />;
    default:
      return <MultipleChoiceQuestion {...props} />;
  }
}