
import React, { useState } from 'react';
import { CopyIcon, RefreshCwIcon, SparklesIcon } from './icons';

interface FinalPromptStepProps {
    finalPrompt: string;
    onReset: () => void;
}

const FinalPromptStep: React.FC<FinalPromptStepProps> = ({ finalPrompt, onReset }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(finalPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full text-center">
            <h2 className="text-2xl font-semibold text-slate-100 mb-2 flex items-center justify-center gap-2">
                <SparklesIcon className="w-6 h-6 text-fuchsia-400" />
                Your Magical Prompt is Ready!
            </h2>
            <p className="text-slate-400 mb-6">Copy this prompt and use it with your favorite LLM.</p>
            
            <div className="relative bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-left">
                <p className="text-slate-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">{finalPrompt}</p>
                <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
                    title="Copy to clipboard"
                >
                    {copied ? <span className="text-xs">Copied!</span> : <CopyIcon className="w-5 h-5" />}
                </button>
            </div>

            <div className="mt-8">
                <button
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-lg hover:bg-slate-500 transition-colors duration-300"
                >
                    <RefreshCwIcon className="w-5 h-5"/>
                    Create Another Prompt
                </button>
            </div>
        </div>
    );
};

export default FinalPromptStep;
