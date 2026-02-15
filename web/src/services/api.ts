const API_URL = 'http://localhost:3000'; // Bypass local proxy issues

export interface HealthResponse {
    status: string;
    services: {
        [key: string]: string;
    };
}

export const api = {
    getHealth: async (): Promise<HealthResponse> => {
        try {
            // Note: This endpoint (/health) might not be proxied if it's not under /api
            // The Gateway serves /health, but Vite proxy is configured for /api
            // Recommendation: Change Frontend to use /api/health (but Gateway needs to listen there or rewrite)
            // For now, let's assume /api/health acts as a gateway health check wrapper if possible,
            // or we must update vite config to proxy /health.
            const response = await fetch(`${API_URL}/api/health`); // Changed to /api/health to match proxy
            if (!response.ok) return { status: 'unknown', services: {} };
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { status: 'down', services: {} };
        }
    },

    analyzeCode: async (code: string, language: string) => {
        try {
            const response = await fetch(`${API_URL}/api/productivity/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            });
            if (!response.ok) throw new Error('Analysis failed');
            return await response.json();
        } catch (error) {
            console.error('Analysis Error:', error);
            throw error;
        }
    },

    auth: {
        login: async (email: string, password: string) => {
            const response = await fetch(`${API_URL}/api/learning/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) throw new Error('Login failed');
            return response.json();
        },
        register: async (email: string, password: string) => {
            const response = await fetch(`${API_URL}/api/learning/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) throw new Error('Registration failed');
            return response.json();
        }
    },

    chat: async (message: string, context?: any) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/learning/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message, context })
            });
            if (!response.ok) throw new Error('Chat failed');
            return await response.json();
        } catch (error) {
            console.error('Chat Error:', error);
            // Fallback for demo if offline
            return {
                success: true,
                data: {
                    message: "I'm having trouble connecting to the Learning Brain right now. Please try again later.",
                    suggestions: ["Retry connection"]
                }
            };
        }
    },

    getRecommendations: async () => {
        try {
            const token = localStorage.getItem('auth_token');
            // Try to hit real endpoint if it exists in Learning Service
            const response = await fetch(`${API_URL}/api/learning/recommendations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                return await response.json();
            }

            // Fallback mock if 404 or backend not ready
            return {
                status: 'success',
                data: [
                    { topic: 'React Pattern Optimization', reason: 'Based on your recent code analysis' },
                    { topic: 'TypeScript Generics', reason: 'Advanced topic for your level' },
                    { topic: 'Microservices Architecture', reason: 'Recommended next step' }
                ]
            };
        } catch (error) {
            console.warn('Learning API Error (using fallback):', error);
            return {
                status: 'success',
                data: []
            };
        }
    },

    graph: {
        createConcept: async (name: string, description: string) => {
            try {
                const response = await fetch(`${API_URL}/api/knowledge/concepts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description })
                });
                return response.json();
            } catch (e) { console.error(e); return { success: false }; }
        },
        getRelationship: async (name: string) => {
            try {
                const response = await fetch(`${API_URL}/api/knowledge/concepts/${name}/related`);
                if (!response.ok) return { data: [] };
                return response.json();
            } catch (e) { console.error(e); return { data: [] }; }
        }
    },

    content: {
        list: async () => {
            try {
                const response = await fetch(`${API_URL}/api/content/materials`);
                if (!response.ok) {
                    console.error('Content API failed:', response.status);
                    return { success: false, data: [] };
                }
                const json = await response.json();
                return json.data ? json : { success: true, data: json }; // Handle variable response structure
            } catch (e) {
                console.error('Content Load Error:', e);
                return { success: false, data: [] };
            }
        }
    },

    analytics: {
        getDashboard: async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_URL}/api/analytics/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Analytics might not need it based on schema but good practice
                    }
                });
                if (!response.ok) return { data: { completedSessions: 0, activeNow: 0, users: 0 } };
                return response.json();
            } catch (e) { return { data: { completedSessions: 0, activeNow: 0, users: 0 } }; }
        }
    }
};
