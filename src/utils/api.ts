import { AIRoutine, DashboardStats, SafetyProfile, User, UserProfile } from '../types';

const TOKEN_KEY = 'flowstate_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // LocalStorage write fail
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body.error) errMsg = body.error;
    } catch {
      // Fall back to status text
    }
    throw new Error(errMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async signup(email: string, password: string, name?: string, safetyFlags?: SafetyProfile) {
    const data = await request<{ token: string; user: User; profile: UserProfile }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, safetyFlags })
    });
    setStoredToken(data.token);
    return data;
  },

  async login(email: string, password: string) {
    const data = await request<{ token: string; user: User; profile: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async loginGuest(safetyFlags?: SafetyProfile) {
    const data = await request<{ token: string; user: User; profile: UserProfile }>('/api/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ safetyFlags })
    });
    setStoredToken(data.token);
    return data;
  },

  logout() {
    setStoredToken(null);
  },

  async getMe(): Promise<{ user: User; profile: UserProfile } | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      return await request<{ user: User; profile: UserProfile }>('/api/auth/me');
    } catch {
      setStoredToken(null);
      return null;
    }
  },

  async updateProfile(profileData: Partial<UserProfile>) {
    return request<{ profile: UserProfile }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  async getDashboard(): Promise<{ stats: DashboardStats; profile: UserProfile; generatedRoutines: any[] }> {
    return request('/api/user/dashboard');
  },

  // Mood
  async logMood(mood: string, targetZones?: string[]) {
    try {
      return await request<{ log: any }>('/api/mood/log', {
        method: 'POST',
        body: JSON.stringify({ mood, targetZones })
      });
    } catch (e) {
      console.warn('Could not persist mood to server:', e);
      return null;
    }
  },

  // Sessions
  async completeSession(params: {
    sessionId: string;
    sessionTitle: string;
    sessionType: string;
    durationMinutes: number;
    rating?: string;
  }) {
    try {
      return await request<{ completedSession: any }>('/api/sessions/complete', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    } catch (e) {
      console.warn('Could not persist completed session to server:', e);
      return null;
    }
  },

  // AI Chat routine generator with post-LLM filter
  async generateAIRoutine(prompt: string, safetyFlags?: SafetyProfile): Promise<{
    routine: AIRoutine;
    filteredNotices: string[];
    safetyFlagsApplied: string[];
  }> {
    return request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, safetyFlags })
    });
  },

  // AI Conversational Guide
  async askGuide(message: string, userContext: { safetyFlags?: SafetyProfile; currentScreen?: string }): Promise<{ reply: string }> {
    return request('/api/guide', {
      method: 'POST',
      body: JSON.stringify({ message, userContext })
    });
  },

  // Fetch saved AI generated routines (last 10)
  async getSavedRoutines(): Promise<{ routines: any[] }> {
    return request('/api/routines/saved');
  }
};
