import React, { useState } from 'react';
import { ChevronLeftIcon } from './icons'; // Ensure this icon is exported
import Loader from './Loader'; // IMPORT LOADER HERE

interface AnsweringStepProps {
  initialPrompt: string;
  questions: string[];
  onAnswersSubmit: (submittedAnswers: string[]) => void; // CORRECTED PROP TYPE
  onBack: () => void;
  isLoading: boolean;
}

const AnsweringStep: React.FC<AnsweringStepProps> = ({
  questions,
  onAnswersSubmit,
  onBack,
  isLoading,
}) => {
  const [localAnswers, setLocalAnswers] = useState<string[]>(
    Array(questions.length).fill('')
  );

  const handleChange = (index: number, value: string) => {
    const newAnswers = [...localAnswers];
    newAnswers[index] = value;
    setLocalAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnswersSubmit(localAnswers); // This will now correctly pass string[]
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-800/40 border border-slate-700 rounded-lg shadow-xl text-white">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" /> Back
        </button>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 mb-2">
          Refine Your Prompt
        </h2>
        <p className="text-slate-300">
          Provide detailed answers to the questions below to enrich your initial idea.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="flex flex-col">
            <label htmlFor={`answer-${index}`} className="text-slate-300 font-semibold mb-1">
              {question}
            </label>
            <textarea
              id={`answer-${index}`}
              value={localAnswers[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-700/60 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y"
              placeholder="Type your detailed answer here..."
              required
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || localAnswers.some(answer => answer.trim() === '')}
        >
          {isLoading ? (
              <span className="flex items-center">
                <Loader className="h-5 w-5 mr-2" /> Generating
              </span>
          ) : (
              'Generate Final Prompt'
          )}
        </button>
      </form>
    </div>
  );
};

export default AnsweringStep;