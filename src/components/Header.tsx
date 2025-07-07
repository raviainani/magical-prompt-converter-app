import React from 'react';
import { MagicWandIcon } from './icons';
import { useAuth } from '../auth/AuthContext'; // Correct path

const Header: React.FC = () => {
    const { currentUser, logout } = useAuth();

    return (
        // Header is relative for absolute positioning of children.
        // pt-4 md:pt-6 for top padding, ensures title is not squished by absolute elements.
        // px-4 md:px-6 for horizontal padding.
        // text-center to center the H1 and P tags.
        <header className="relative text-center pt-4 md:pt-6 px-4 md:px-6 text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex items-center justify-center gap-3">
                <MagicWandIcon className="w-8 h-8 md:w-10 md:h-10" />
                Magical Prompt Converter
            </h1>
            <p className="mt-2 text-md sm:text-lg text-slate-300">
                Transform your simple ideas into powerful, context-rich prompts for any LLM.
            </p>

            {currentUser && (
                // Position the user info and logout button absolutely.
                // top-0: Places it at the very top edge of the header's content box.
                // right-4: Standard right margin.
                // flex items-center gap-3: For internal layout of email and button.
                // z-20: Ensures it's on top of other elements.
                <div className="absolute top-0 right-4 flex items-center gap-3 z-20">
                    <span className="hidden sm:inline text-slate-300 text-sm">
                        {currentUser.email}
                    </span>
                    <button
                        onClick={logout}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg text-sm transition-colors"
                    >
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;