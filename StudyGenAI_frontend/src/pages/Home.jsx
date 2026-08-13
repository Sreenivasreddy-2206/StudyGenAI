import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { UploadCloud, MessageSquareText, GraduationCap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const Home = () => {
  const slides = [
    {
      id: 1,
      title: 'Upload your PDF',
      subtitle: 'Seamlessly upload lecture slides, textbooks, and notes into your workspace.',
      icon: UploadCloud,
      tag: 'Step 1 • Upload',
    },
    {
      id: 2,
      title: 'Ask questions',
      subtitle: 'Query your material directly with natural conversation and get instant context.',
      icon: MessageSquareText,
      tag: 'Step 2 • Interact',
    },
    {
      id: 3,
      title: 'Learn from your document',
      subtitle: 'Generate MCQs, key summaries, and practice quizzes tailored to your study set.',
      icon: GraduationCap,
      tag: 'Step 3 • Master',
    },
    {
      id: 4,
      title: 'Your documents stay private',
      subtitle: 'All study materials are stored securely with strict user-level data isolation.',
      icon: ShieldCheck,
      tag: 'Step 4 • Secure',
    },
  ];

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Smooth automatic slide transition
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeSlideIndex];
  const Icon = activeSlide.icon;

  return (
    <div className="min-h-screen flex flex-col justify-between pt-20">
      <Navbar />

      {/* Main Hero & Product Presentation */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 py-12 text-center">
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI-Powered Document Workspace</span>
        </div>

        {/* Main Title */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-slate-900 tracking-tight max-w-3xl leading-[1.15]">
          Learn smarter with your documents.
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mt-4 leading-relaxed font-normal">
          Upload your study material and interact with it using AI-powered document intelligence.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/register" className="btn-signup-glass text-sm px-6 py-2.5 shadow-md">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-glass text-sm px-6 py-2.5">
            Login
          </Link>
        </div>

        {/* Subtle Animated Product Presentation Box */}
        <div className="w-full max-w-2xl mt-14">
          <div className="glass-panel p-8 sm:p-10 relative overflow-hidden transition-all duration-500 border-slate-200/80 bg-white/70 shadow-xl">
            {/* Animated Content Transition */}
            <div key={activeSlide.id} className="animate-fade-in flex flex-col items-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-full mb-4">
                {activeSlide.tag}
              </span>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                <Icon className="w-7 h-7" />
              </div>

              <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900">
                {activeSlide.title}
              </h2>

              <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                {activeSlide.subtitle}
              </p>
            </div>

            {/* Slide Navigation Indicators */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeSlideIndex
                      ? 'w-8 bg-indigo-600'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/60 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} StudyGen AI — Built for modern document learning.</p>
      </footer>
    </div>
  );
};
