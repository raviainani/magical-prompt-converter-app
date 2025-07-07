
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

interface SignUpProps {
    onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        setError('');
        setLoading(true);
        try {
            await signup(email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to create an account. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4 text-center">Create an Account</h2>
            <p className="text-slate-400 mb-6 text-center">Get started with your own Magical Prompt Converter.</p>
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
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300"
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
            <p className="mt-6 text-center text-slate-400">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="font-semibold text-fuchsia-400 hover:text-fuchsia-300">
                    Sign In
                </button>
            </p>
        </div>
    );
};

export default SignUp;
