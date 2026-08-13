import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, ArrowLeft, Award, HelpCircle } from 'lucide-react';

export const Quiz = ({ quizData, onBack, onRetry }) => {
  const questions = quizData?.data?.questions || quizData?.questions || [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="glass-panel p-8 text-center max-w-lg mx-auto my-8">
        <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="font-heading font-bold text-white text-xl">No Questions Available</h3>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          We couldn't parse quiz questions from the backend. Please try generating the quiz again.
        </p>
        <button onClick={onBack} className="btn btn-secondary text-sm">
          Back to Document
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const userSelected = selectedAnswers[currentIndex];

  const handleSelectOption = (option) => {
    if (userSelected !== undefined) return; // Answer already submitted for this question
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        score += 1;
      }
    });
    return score;
  };

  const score = calculateScore();
  const percentage = Math.round((score / total) * 100);

  if (isCompleted) {
    return (
      <div className="glass-panel p-8 sm:p-12 text-center max-w-xl mx-auto my-6 border-indigo-500/30">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
          <Award className="w-10 h-10 text-white" />
        </div>

        <h2 className="font-heading font-extrabold text-white text-3xl">Quiz Completed!</h2>
        <p className="text-slate-400 mt-2">Here is how you scored on this study set:</p>

        <div className="my-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10 max-w-xs mx-auto">
          <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-heading">
            {score} / {total}
          </div>
          <p className="text-sm font-semibold text-slate-300 mt-2">
            {percentage >= 80 ? '🌟 Excellent Masterclass!' : percentage >= 50 ? '👍 Good Effort! Keep practicing.' : '📖 Review the document and try again.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelectedAnswers({});
                setShowExplanation(false);
                setIsCompleted(false);
                onRetry();
              }}
              className="btn btn-secondary text-sm w-full sm:w-auto px-6 py-2.5 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
          )}

          <button onClick={onBack} className="btn btn-primary text-sm w-full sm:w-auto px-6 py-2.5 gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Document</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 max-w-2xl mx-auto my-4 border-indigo-500/20">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-white/10">
        <button onClick={onBack} className="btn btn-ghost text-xs text-slate-400 hover:text-white px-2 py-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Quiz</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1 rounded-full">
            Question {currentIndex + 1} of {total}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <h3 className="font-heading font-bold text-white text-lg sm:text-xl leading-snug mb-6">
        {currentQ.question}
      </h3>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {currentQ.options?.map((opt, idx) => {
          const isSelected = userSelected === opt;
          const isCorrect = opt === currentQ.answer;
          const hasAnswered = userSelected !== undefined;

          let btnClass = 'w-full p-4 rounded-xl text-left text-sm font-medium border transition-all flex items-center justify-between gap-3 ';

          if (!hasAnswered) {
            btnClass += 'bg-white/[0.02] border-white/10 text-slate-200 hover:bg-white/[0.06] hover:border-indigo-500/40 cursor-pointer';
          } else if (isCorrect) {
            btnClass += 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200';
          } else if (isSelected && !isCorrect) {
            btnClass += 'bg-rose-950/40 border-rose-500/50 text-rose-200';
          } else {
            btnClass += 'bg-white/[0.01] border-white/5 text-slate-500 opacity-60';
          }

          return (
            <button
              key={idx}
              disabled={hasAnswered}
              onClick={() => handleSelectOption(opt)}
              className={btnClass}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0 opacity-80">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-normal">{opt}</span>
              </div>

              {hasAnswered && (
                <div className="shrink-0">
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {showExplanation && currentQ.explanation && (
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 mb-6 text-xs sm:text-sm text-indigo-200 leading-relaxed">
          <p className="font-semibold text-indigo-300 mb-1">💡 Explanation:</p>
          {currentQ.explanation}
        </div>
      )}

      {/* Action Footer */}
      {userSelected !== undefined && (
        <div className="flex justify-end pt-2">
          <button onClick={handleNext} className="btn btn-primary text-sm px-6 py-2.5 gap-2">
            <span>{currentIndex < total - 1 ? 'Next Question' : 'View Score'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
