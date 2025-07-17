
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

interface LoginProps {
    onSwitchToSignUp: () => void;
}

const GoogleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
);


const Login: React.FC<LoginProps> = ({ onSwitchToSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signInWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
            setLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google.');
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4 text-center">Welcome Back</h2>
            <p className="text-slate-400 mb-6 text-center">Sign in to continue to the Magical Prompt Converter.</p>
            {error && <p className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300"
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
             <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-slate-700 flex-grow"></div>
                <span className="text-slate-500">OR</span>
                <div className="h-px bg-slate-700 flex-grow"></div>
            </div>
            <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 transition-colors"
            >
                <GoogleIcon className="w-6 h-6" />
                Sign In with Google
            </button>
            <p className="mt-6 text-center text-slate-400">
                Don't have an account?{' '}
                <button onClick={onSwitchToSignUp} className="font-semibold text-fuchsia-400 hover:text-fuchsia-300">
                    Sign Up
                </button>
            </p>
        </div>
    );
};

export default Login;
