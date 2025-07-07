import React, { useState } from 'react';
import Loader from './Loader';
import { SparklesIcon } from './icons';

interface InitialPromptStepProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

const InitialPromptStep: React.FC<InitialPromptStepProps> = ({ onSubmit, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onSubmit(prompt);
        }
    };
    
    const samplePrompts = [
        "Generate a unicorn picture",
        "Write a short story",
        "Explain quantum physics",
        "Create a logo for a coffee shop"
    ];

    return (
        <div className="w-full">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4 text-center">Start with an idea</h2>
            <p className="text-slate-400 mb-6 text-center">Enter a simple prompt, and we'll ask questions to make it magical.</p>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Write a blog post about renewable energy'"
                    className="w-full h-32 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all duration-300 resize-none"
                    disabled={isLoading}
                />
                <div className="mt-4 text-sm text-slate-500">
                    Or try an example:
                    <div className="flex flex-wrap gap-2 mt-2">
                        {samplePrompts.map(p => (
                            <button 
                                key={p} 
                                type="button"
                                onClick={() => setPrompt(p)}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300 text-xs transition-colors"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-8 flex justify-center">
                    {isLoading ? (
                        <Loader text="Generating Questions..." />
                    ) : (
                        <button
                            type="submit"
                            disabled={!prompt.trim()}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Generate Questions
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default InitialPromptStep;