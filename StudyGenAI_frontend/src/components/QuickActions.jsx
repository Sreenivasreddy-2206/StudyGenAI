import React from 'react';
import { HelpCircle, FileText, Zap, MessageSquare, Star } from 'lucide-react';

export const QuickActions = ({ onGenerateQuiz, onQuickPrompt, disabled }) => {
  const actions = [
    {
      id: 'mcqs',
      label: 'Generate MCQs',
      icon: HelpCircle,
      action: onGenerateQuiz,
      highlight: true,
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: FileText,
      prompt: 'Provide a concise summary of the key concepts in this document.',
    },
    {
      id: 'important',
      label: 'Important Questions',
      icon: Star,
      prompt: 'What are the top 5 most important exam questions from this document?',
    },
    {
      id: 'viva',
      label: 'Viva Questions',
      icon: MessageSquare,
      prompt: 'List 5 common viva / interview questions based on this document with short answers.',
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      icon: Zap,
      prompt: 'Create 5 flashcard term and definition pairs from this study material.',
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">
        Quick AI Tools:
      </span>

      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            disabled={disabled}
            onClick={() => {
              if (act.action) {
                act.action();
              } else if (act.prompt && onQuickPrompt) {
                onQuickPrompt(act.prompt);
              }
            }}
            className={`pill-action text-xs ${
              act.highlight
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 hover:text-white'
                : ''
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{act.label}</span>
          </button>
        );
      })}
    </div>
  );
};
