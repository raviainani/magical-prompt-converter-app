import React, { useState, useCallback } from 'react';
import { AppStep } from "./types";
import Header from './components/Header';
import InitialPromptStep from './components/InitialPromptStep';
import AnsweringStep from './components/AnsweringStep';
import FinalPromptStep from './components/FinalPromptStep';
import { generateQuestions, generateFinalPrompt } from './services/geminiService';
import { useAuth } from './auth/AuthContext';
import Loader from './components/Loader';
import Login from './components/Login'; // IMPORT Login
import SignUp from './components/SignUp'; // IMPORT SignUp

const PromptConverter: React.FC = () => {
    const [step, setStep] = useState<AppStep>(AppStep.INITIAL);
    const [initialPrompt, setInitialPrompt] = useState<string>('');
    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]); // REINTRODUCED 'answers'
    const [finalPrompt, setFinalPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleInitialSubmit = useCallback(async (prompt: string) => {
        setIsLoading(true);
        setError(null);
        setInitialPrompt(prompt);
        try {
            const generatedQuestions = await generateQuestions(prompt);
            setQuestions(generatedQuestions);
            setStep(AppStep.ANSWERING);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAnswersSubmit = useCallback(async (submittedAnswers: string[]) => {
        setIsLoading(true);
        setError(null);
        setAnswers(submittedAnswers); // Update the 'answers' state
        try {
            const qaPairs = questions.map((q, i) => ({ question: q, answer: submittedAnswers[i] }));
            const generatedPrompt = await generateFinalPrompt(initialPrompt, qaPairs);
            setFinalPrompt(generatedPrompt);
            setStep(AppStep.FINAL);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [initialPrompt, questions, answers]); // Add 'answers' to dependency array

    const handleReset = useCallback(() => {
        setStep(AppStep.INITIAL);
        setInitialPrompt('');
        setQuestions([]);
        setAnswers([]); // Clear 'answers' on reset
        setFinalPrompt('');
        setError(null);
    }, []);

    const handleBack = useCallback(() => {
      setStep(AppStep.INITIAL);
      setError(null);
    }, []);

    const renderStep = () => {
        switch (step) {
            case AppStep.INITIAL:
                return <InitialPromptStep onSubmit={handleInitialSubmit} isLoading={isLoading} />;
            case AppStep.ANSWERING:
                return <AnsweringStep initialPrompt={initialPrompt} questions={questions} onAnswersSubmit={handleAnswersSubmit} onBack={handleBack} isLoading={isLoading} />;
            case AppStep.FINAL:
                return <FinalPromptStep finalPrompt={finalPrompt} onReset={handleReset} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl shadow-fuchsia-900/20 p-6 sm:p-8 md:p-10 transition-all duration-500">
            {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
                    <p className="font-bold">An error occurred:</p>
                    <p>{error}</p>
                </div>
            )}
            {renderStep()}
        </div>
    );
};

const AuthGate: React.FC = () => {
    const [view, setView] = useState<'login' | 'signup'>('login');
    const { loading } = useAuth(); // Destructure loading from useAuth

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader text="Authenticating..." />
            </div>
        );
    }

    return (
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl shadow-indigo-900/20 p-6 sm:p-8 md:p-10">
            {view === 'login' ? (
                <Login onSwitchToSignUp={() => setView('signup')} />
            ) : (
                <SignUp onSwitchToLogin={() => setView('login')} />
            )}
        </div>
    );
};

const App: React.FC = () => {
    const { currentUser } = useAuth(); // Destructure loading here too for the main App logic

    const renderContent = () => {
        // Loading handled inside AuthGate or here if entire app needs to wait
        // For now, let AuthGate handle its own loading display
        if (currentUser) {
            return <PromptConverter />;
        }
        return <AuthGate />;
    };

    return (
        <div className="min-h-screen text-white font-sans flex flex-col items-center p-4
                        bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900">
            <div className="relative z-10 w-full max-w-3xl mx-auto pt-16">
                <Header />
                <main className="mt-8">
                    {renderContent()}
                </main>
                <footer className="text-center py-8 text-slate-500 text-sm">
                    <p>Powered by Google Gemini & Firebase. Designed for creative prompt engineering.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;