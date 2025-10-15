import React from 'react';
import { motion } from 'framer-motion';
import { Question } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface QuestionComponentProps {
  question: Question;
  selectedAnswer?: number | null;
  textAnswer?: string;
  onOptionSelect?: (index: number) => void;
  onTextChange?: (text: string) => void;
  showFeedback: boolean;
  isCorrect?: boolean;
}

// Çoktan Seçmeli Soru
export function MultipleChoiceQuestion({ 
  question, 
  selectedAnswer = null, 
  onOptionSelect = () => {}, 
  showFeedback, 
  isCorrect 
}: QuestionComponentProps) {
  const getOptionClass = (index: number) => {
    if (!showFeedback) {
      return selectedAnswer === index ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 hover:border-blue-300";
    }
    
    if (index === question.correctAnswer) {
      return "bg-green-500 text-white border-green-500";
    }
    
    if (selectedAnswer === index && index !== question.correctAnswer) {
      return "bg-red-500 text-white border-red-500";
    }
    
    return "border-gray-200 opacity-50";
  };

  return (
    <div className="space-y-3">
      {(question.options as Array<{text: string, letter: string}>).map((option, index) => (
        <motion.button
          key={index}
          className={`w-full p-4 text-left rounded-xl border-2 transition-all ${getOptionClass(index)}`}
          onClick={() => onOptionSelect(index)}
          disabled={showFeedback}
          whileHover={{ scale: showFeedback ? 1 : 1.02 }}
          whileTap={{ scale: showFeedback ? 1 : 0.98 }}
          data-testid={`option-${index}`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              selectedAnswer === index && !showFeedback ? "bg-white text-blue-500" : 
              index === question.correctAnswer && showFeedback ? "bg-white text-green-500" :
              selectedAnswer === index && showFeedback && index !== question.correctAnswer ? "bg-white text-red-500" :
              "bg-gray-200 text-gray-600"
            }`}>
              {option.letter || String.fromCharCode(65 + index)}
            </div>
            <span className={`font-medium ${
              (selectedAnswer === index && !showFeedback) || 
              (index === question.correctAnswer && showFeedback) ||
              (selectedAnswer === index && showFeedback && index !== question.correctAnswer)
                ? "text-white" : "text-gray-900"
            }`}>
              {option.text}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Boşluk Doldurma Sorusu
export function FillInBlankQuestion({ 
  question, 
  textAnswer = "", 
  onTextChange = () => {}, 
  showFeedback, 
  isCorrect 
}: QuestionComponentProps) {
  const correctAnswer = (question.options as Array<{text: string}>)[question.correctAnswer]?.text || "";
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Input
          type="text"
          value={textAnswer}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Cevabını buraya yaz..."
          className={`text-center text-lg font-semibold ${
            showFeedback 
              ? isCorrect 
                ? "border-green-500 bg-green-50" 
                : "border-red-500 bg-red-50"
              : "border-blue-300"
          }`}
          disabled={showFeedback}
          data-testid="fill-blank-input"
        />
      </div>
      
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center p-3 rounded-lg ${
            isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isCorrect ? (
            <span>🎉 Doğru! "{correctAnswer}"</span>
          ) : (
            <span>❌ Doğru cevap: "{correctAnswer}"</span>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Doğru/Yanlış Sorusu
export function TrueFalseQuestion({ 
  question, 
  selectedAnswer = null, 
  onOptionSelect = () => {}, 
  showFeedback, 
  isCorrect 
}: QuestionComponentProps) {
  const options = [
    { text: "Doğru", letter: "D" },
    { text: "Yanlış", letter: "Y" }
  ];

  const getOptionClass = (index: number) => {
    if (!showFeedback) {
      return selectedAnswer === index ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 hover:border-blue-300";
    }
    
    if (index === question.correctAnswer) {
      return "bg-green-500 text-white border-green-500";
    }
    
    if (selectedAnswer === index && index !== question.correctAnswer) {
      return "bg-red-500 text-white border-red-500";
    }
    
    return "border-gray-200 opacity-50";
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((option, index) => (
        <motion.button
          key={index}
          className={`p-6 text-center rounded-xl border-2 transition-all ${getOptionClass(index)}`}
          onClick={() => onOptionSelect(index)}
          disabled={showFeedback}
          whileHover={{ scale: showFeedback ? 1 : 1.05 }}
          whileTap={{ scale: showFeedback ? 1 : 0.95 }}
          data-testid={`true-false-${index}`}
        >
          <div className="text-2xl mb-2">
            {option.letter === "D" ? "✓" : "✗"}
          </div>
          <div className="font-bold text-lg">
            {option.text}
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Görsel Soru
export function VisualQuestion({ 
  question, 
  selectedAnswer = null, 
  onOptionSelect = () => {}, 
  showFeedback, 
  isCorrect 
}: QuestionComponentProps) {
  const getOptionClass = (index: number) => {
    if (!showFeedback) {
      return selectedAnswer === index ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 hover:border-blue-300";
    }
    
    if (index === question.correctAnswer) {
      return "bg-green-500 text-white border-green-500";
    }
    
    if (selectedAnswer === index && index !== question.correctAnswer) {
      return "bg-red-500 text-white border-red-500";
    }
    
    return "border-gray-200 opacity-50";
  };

  return (
    <div className="space-y-6">
      {/* Görsel */}
      {question.imageUrl && (
        <div className="text-center">
          <img 
            src={question.imageUrl} 
            alt="Soru görseli" 
            className="max-w-full h-auto max-h-64 mx-auto rounded-lg shadow-md"
            data-testid="question-image"
          />
        </div>
      )}
      
      {/* Seçenekler */}
      <div className="space-y-3">
        {(question.options as Array<{text: string, letter: string}>).map((option, index) => (
          <motion.button
            key={index}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${getOptionClass(index)}`}
            onClick={() => onOptionSelect(index)}
            disabled={showFeedback}
            whileHover={{ scale: showFeedback ? 1 : 1.02 }}
            whileTap={{ scale: showFeedback ? 1 : 0.98 }}
            data-testid={`visual-option-${index}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                selectedAnswer === index && !showFeedback ? "bg-white text-blue-500" : 
                index === question.correctAnswer && showFeedback ? "bg-white text-green-500" :
                selectedAnswer === index && showFeedback && index !== question.correctAnswer ? "bg-white text-red-500" :
                "bg-gray-200 text-gray-600"
              }`}>
                {option.letter || String.fromCharCode(65 + index)}
              </div>
              <span className={`font-medium ${
                (selectedAnswer === index && !showFeedback) || 
                (index === question.correctAnswer && showFeedback) ||
                (selectedAnswer === index && showFeedback && index !== question.correctAnswer)
                  ? "text-white" : "text-gray-900"
              }`}>
                {option.text}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}