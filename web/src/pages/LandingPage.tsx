import * as React from 'react';
import { Brain, Rocket, Code, Zap, ChevronRight, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const [error, setError] = React.useState<string | null>(null);

    const handleGetStarted = async () => {
        setLoading(true);
        setError(null);
        try {
            // Try to login as demo user
            try {
                console.log('Attempting login...');
                const res = await api.auth.login('demo@user.com', 'DemoPass123!');
                console.log('Login response:', res);
                if (res.success && res.data.tokens) {
                    localStorage.setItem('auth_token', res.data.tokens.accessToken);
                    navigate('/dashboard');
                    return;
                }
            } catch (e: any) {
                console.warn('Login failed, trying registration...', e);
                // If login fails, try register
                try {
                    const res = await api.auth.register('demo@user.com', 'DemoPass123!');
                    console.log('Register response:', res);
                    if (res.success && res.data.tokens) {
                        localStorage.setItem('auth_token', res.data.tokens.accessToken);
                        navigate('/dashboard');
                        return;
                    }
                } catch (regError: any) {
                    console.error("Auth failed:", regError);
                    setError(regError.message || "Failed to connect to Learning Service. Please check your connection.");
                    // Do NOT redirect to dashboard if auth failed.
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-sky-500/30">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-tr from-sky-400 to-indigo-500 p-2 rounded-lg">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                                AI Learning Assistant
                            </span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:text-sky-400 transition-colors">Features</Link>
                                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:text-sky-400 transition-colors">For Developers</Link>
                                <button onClick={handleGetStarted} className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-sky-500/20">
                                    {loading ? 'Starting...' : 'Get Started'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                        Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">New Skills</span><br />
                        at the Speed of AI
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400 mb-10">
                        Your personalized AI tutor that adapts to your learning style.
                        Code faster, understand deeper, and build better with intelligent guidance.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="flex justify-center gap-4">
                            <button onClick={handleGetStarted} disabled={loading} className="group bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-sky-50 transition-all flex items-center gap-2 shadow-xl shadow-white/10 disabled:opacity-70 disabled:cursor-not-allowed">
                                {loading ? 'Connecting...' : 'Start Learning Free'}
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <Link to="/dashboard" className="px-8 py-4 rounded-full text-lg font-medium border border-slate-700 hover:bg-slate-800 transition-all text-slate-300">
                                View Demo
                            </Link>
                        </div>
                        {error && (
                            <div className="text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30 text-sm animate-pulse">
                                Error: {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-slate-800/50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Choose AI Learning Assistant?</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">We combine advanced AI with proven learning techniques to help you reach your goals faster.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Rocket className="w-8 h-8 text-sky-400" />}
                            title="Hyper-Personalized Path"
                            description="Our AI analyzes your skills and adapts the curriculum in real-time to focus on what you need to learn."
                        />
                        <FeatureCard
                            icon={<Code className="w-8 h-8 text-indigo-400" />}
                            title="Interactive Coding"
                            description="Practice with intelligent code environments that catch errors and offer contextual hints as you type."
                        />
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-amber-400" />}
                            title="Instant Productivity"
                            description="Get instant explanations for complex topics and automate specific documentation tasks."
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-950 py-12 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500">
                    <p>© 2024 AI Learning Assistant. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-sky-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/10 group">
        <div className="mb-6 p-4 rounded-xl bg-slate-800/50 w-fit group-hover:bg-sky-500/10 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-slate-100">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
