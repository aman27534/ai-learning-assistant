import React, { useState } from 'react';
import { api } from '../services/api';
// ... imports
import { Code, BookOpen, Activity, Play, Send, Share2, BarChart, Library, TrendingUp, Users, Clock, Plus, Filter } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'learning' | 'productivity' | 'knowledge' | 'content' | 'analytics'>('learning');
    const [sessionActive, setSessionActive] = useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400 mb-8">
                    AI Assistant
                </h1>
                <nav className="space-y-2 flex-1">
                    <SidebarItem
                        icon={<BookOpen className="w-5 h-5" />}
                        label="Learning Path"
                        active={activeTab === 'learning' && !sessionActive}
                        onClick={() => { setActiveTab('learning'); setSessionActive(false); }}
                    />
                    <SidebarItem
                        icon={<Code className="w-5 h-5" />}
                        label="Code Analysis"
                        active={activeTab === 'productivity'}
                        onClick={() => { setActiveTab('productivity'); setSessionActive(false); }}
                    />
                    <SidebarItem
                        icon={<Share2 className="w-5 h-5" />}
                        label="Knowledge Graph"
                        active={activeTab === 'knowledge'}
                        onClick={() => { setActiveTab('knowledge'); setSessionActive(false); }}
                    />
                    <SidebarItem
                        icon={<Library className="w-5 h-5" />}
                        label="Library"
                        active={activeTab === 'content'}
                        onClick={() => { setActiveTab('content'); setSessionActive(false); }}
                    />
                    <SidebarItem
                        icon={<BarChart className="w-5 h-5" />}
                        label="Analytics"
                        active={activeTab === 'analytics'}
                        onClick={() => { setActiveTab('analytics'); setSessionActive(false); }}
                    />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {sessionActive ? (
                    <SessionView onBack={() => setSessionActive(false)} />
                ) : activeTab === 'learning' ? (
                    <LearningView onStartSession={() => setSessionActive(true)} />
                ) : activeTab === 'productivity' ? (
                    <ProductivityView />
                ) : activeTab === 'knowledge' ? (
                    <KnowledgeGraphView />
                ) : activeTab === 'content' ? (
                    <ContentView />
                ) : (
                    <AnalyticsView />
                )}
            </main>
        </div>
    );
};

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

const ProductivityView = () => {
    const [code, setCode] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const analyze = async () => {
        setLoading(true);
        try {
            const res = await api.analyzeCode(code, 'typescript');
            setResult(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Code Analysis</h2>
                <p className="text-slate-400">Get instant feedback and improvement suggestions for your code.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-slate-800 rounded-xl border border-slate-700">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-400">Input Code</span>
                            <button
                                onClick={analyze}
                                disabled={loading || !code}
                                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                Analyze
                            </button>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Paste your code here..."
                            className="w-full h-[400px] bg-slate-900/50 p-4 text-sm font-mono focus:outline-none resize-none text-slate-300"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 h-full min-h-[400px]">
                        <div className="p-4 border-b border-slate-700">
                            <span className="text-sm font-medium text-slate-400">Analysis Results</span>
                        </div>
                        <div className="p-6">
                            {result ? (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3">Complexity</h4>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${result.complexity === 'low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'
                                            }`}>
                                            {result.complexity}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3">Suggestions</h4>
                                        <ul className="space-y-3">
                                            {result.suggestions.map((s: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-slate-300">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                                    <Activity className="w-12 h-12 mb-4" />
                                    <p>Run analysis to see results</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SessionView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [messages, setMessages] = useState<any[]>([
        { role: 'ai', text: "Hello! Today we're learning about Interfaces. They are a powerful way to define the shape of objects." },
        { role: 'ai', text: "Try defining an interface called `User` with a name (string) and age (number)." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.chat(userMsg, { topic: 'Interfaces' });
            if (res.success && res.data) {
                setMessages(prev => [...prev, { role: 'ai', text: res.data.message, suggestions: res.data.suggestions }]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
            <header className="mb-6 flex items-center gap-4">
                <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
                    ← Back
                </button>
                <div>
                    <h2 className="text-2xl font-bold">TypeScript Basics: Interfaces</h2>
                    <p className="text-slate-400 text-sm">Interactive Learning Session</p>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                {/* Chat/Instructions */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-900/30">
                        <span className="font-bold text-sky-400">AI Tutor</span>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                )}
                                <div className={`space-y-2 max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 px-4 py-2 rounded-lg rounded-tr-none text-white' : ''}`}>
                                    <p className={msg.role === 'ai' ? 'text-slate-200 whitespace-pre-wrap' : ''}>{msg.text}</p>
                                    {msg.suggestions && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {msg.suggestions.map((s: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setInput(s)}
                                                    className="bg-slate-700 hover:bg-slate-600 text-xs px-2 py-1 rounded text-sky-300 transition-colors"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
                                    <Activity className="w-4 h-4 animate-spin" />
                                </div>
                                <div className="text-slate-400 text-sm py-2">Helper is thinking...</div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-700 bg-slate-900/30 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask a question..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 transition-colors text-slate-200"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div className="bg-slate-950 rounded-xl border border-slate-700 flex flex-col overflow-hidden font-mono text-sm">
                    <div className="p-2 border-b border-slate-800 bg-slate-900 flex justify-between items-center px-4">
                        <span className="text-slate-400">main.ts</span>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></span>
                            <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></span>
                            <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></span>
                        </div>
                    </div>
                    <textarea
                        className="flex-1 bg-transparent p-6 text-slate-300 focus:outline-none resize-none"
                        defaultValue={`// Define your interface here\n\nconst user: User = {\n  name: "Alice",\n  age: 30\n};\n\nconsole.log(user);`}
                    />
                    <div className="p-4 border-t border-slate-800 flex justify-end">
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                            <Play className="w-4 h-4" /> Run Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LearningView: React.FC<{ onStartSession: () => void }> = ({ onStartSession }) => {
    const [recommendations, setRecommendations] = useState<any[]>([]);

    React.useEffect(() => {
        api.getRecommendations().then(res => {
            if (res && res.data) {
                setRecommendations(res.data);
            }
        }).catch(err => console.error(err));
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold mb-2">My Learning Path</h2>
                <p className="text-slate-400">Track your progress and continue your adaptive learning sessions.</p>
            </header>

            <div className="grid gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-indigo-100 mb-2">Current Session: TypeScript Basics</h3>
                            <p className="text-indigo-200/60 text-sm">Started 2 hours ago • 45% Complete</p>
                        </div>
                        <button
                            onClick={onStartSession}
                            className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            Continue Learning
                        </button>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-[45%] h-full" />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {recommendations.length > 0 ? recommendations.map((item: any, i: number) => (
                        <div
                            key={i}
                            onClick={onStartSession}
                            className="p-6 rounded-xl bg-slate-800 border border-slate-700 hover:border-sky-500/30 transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-slate-700 group-hover:bg-sky-500/20 mb-4 flex items-center justify-center transition-colors">
                                <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-sky-400" />
                            </div>
                            <h4 className="font-bold text-slate-200 group-hover:text-white mb-2">{item.topic}</h4>
                            <p className="text-sm text-slate-500">{item.reason}</p>
                        </div>
                    )) : (
                        <div className="col-span-3 text-center text-slate-500 py-10">
                            Loading recommendations from AI Engine...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const KnowledgeGraphView = () => {
    const [concept, setConcept] = useState('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const search = async () => {
        setLoading(true);
        try {
            const res = await api.graph.getRelationship(concept);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Knowledge Graph</h2>
                <p className="text-slate-400">Explore relationships between concepts.</p>
            </header>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        placeholder="Enter concept name (e.g. React)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 text-slate-200"
                    />
                    <button
                        onClick={search}
                        disabled={loading || !concept}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        {loading ? 'Searching...' : 'Explore'}
                    </button>
                </div>
            </div>

            {data && (
                <div className="grid gap-4">
                    <h3 className="tex-xl font-bold text-slate-200">Related Concepts</h3>
                    {data.length === 0 ? (
                        <p className="text-slate-500">No relationships found.</p>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {data.map((item: any, i: number) => (
                                <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                                    <div>
                                        <p className="font-bold text-slate-200">{item.relationship}</p>
                                        <p className="text-sm text-slate-400">{item.concept.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const ContentView: React.FC = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    React.useEffect(() => {
        setLoading(true);
        api.content.list()
            .then(res => setMaterials(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredMaterials = filter === 'all'
        ? materials
        : materials.filter(m => m.type === filter);

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Learning Library</h2>
                    <p className="text-slate-400">Curated materials for your learning journey.</p>
                </div>
                <button className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Add Material
                </button>
            </header>

            <div className="mb-6 flex gap-2">
                {['all', 'video', 'article', 'quiz'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === type
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-slate-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMaterials.map((item: any) => (
                        <div key={item.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-sky-500/50 transition-colors group">
                            <div className="flex items-start justify-between mb-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${item.type === 'video' ? 'bg-red-500/10 text-red-400' :
                                    item.type === 'article' ? 'bg-blue-500/10 text-blue-400' :
                                        'bg-purple-500/10 text-purple-400'
                                    }`}>
                                    {item.type}
                                </span>
                                <button className="text-slate-500 hover:text-white">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-sky-400 transition-colors">{item.title}</h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {item.tags?.map((tag: string, i: number) => (
                                    <span key={i} className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">#{tag}</span>
                                ))}
                            </div>
                            <a href={item.url} target="_blank" rel="noreferrer" className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                View Content <Send className="w-3 h-3" />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AnalyticsView: React.FC = () => {
    const [stats, setStats] = useState<any>(null);

    React.useEffect(() => {
        api.analytics.getDashboard()
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!stats) return <div className="text-slate-400 p-8">Loading analytics...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold mb-2">My Progress</h2>
                <p className="text-slate-400">Track your learning journey and productivity.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    label="Completed Sessions"
                    value={stats.completedSessions}
                    icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
                    trend="+12% this week"
                />
                <StatCard
                    label="Active Now"
                    value={stats.activeNow}
                    icon={<Activity className="w-5 h-5 text-sky-400" />}
                    trend="Live"
                />
                <StatCard
                    label="Total Users"
                    value={stats.users}
                    icon={<Users className="w-5 h-5 text-purple-400" />}
                    trend="+5 new today"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-sky-400" />
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {stats.recentEvents?.map((event: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 text-sm p-3 bg-slate-700/20 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-sky-500" />
                                <div className="flex-1">
                                    <span className="text-slate-200 font-medium block">{event.type.replace('_', ' ')}</span>
                                    <span className="text-slate-500 text-xs">{new Date(event.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                        {(!stats.recentEvents || stats.recentEvents.length === 0) && (
                            <p className="text-slate-500 text-sm">No recent activity recorded.</p>
                        )}
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-400" />
                        Learning Time Distribution
                    </h3>
                    <div className="flex items-center justify-center h-48 bg-slate-900/30 rounded-lg border border-slate-700 border-dashed">
                        <span className="text-slate-500 text-sm">Visualization Chart Placeholder</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-3 bg-slate-700/20 rounded-lg text-center">
                            <div className="text-xl font-bold text-slate-200">12.5h</div>
                            <div className="text-xs text-slate-500">Total Learning</div>
                        </div>
                        <div className="p-3 bg-slate-700/20 rounded-lg text-center">
                            <div className="text-xl font-bold text-slate-200">45m</div>
                            <div className="text-xs text-slate-500">Avg. Session</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, trend?: string }> = ({ label, value, icon, trend }) => (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium">{label}</span>
            <div className="p-2 bg-slate-700/50 rounded-lg">{icon}</div>
        </div>
        <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-white">{value}</div>
            {trend && <div className="text-xs font-medium text-emerald-400 mb-1.5">{trend}</div>}
        </div>
    </div>
);

export default Dashboard;
