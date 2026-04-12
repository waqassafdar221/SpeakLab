// API configuration and utilities
const DEFAULT_API_BASE_URL = 'https://speak-lab-backend-kbrc-2f2ibtl6f-waqas-safdars-projects.vercel.app';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}

// Token management
export const TokenManager = {
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  },
  get: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  },
};

// Generic API fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = TokenManager.get();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: 'An error occurred',
    }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API functions
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: () => {
    TokenManager.remove();
  },
};

// TTS API Types
export interface Voice {
  id: number;
  user_id: number;
  provider_voice_id: string;
  name: string;
  is_cloned: boolean;
}

export interface VoiceMetadata {
  voice_id: string;
  name: string;
  country: string;
  language: string;
  gender: string;
}

export interface PublicVoice {
  [key: string]: VoiceMetadata;
}

export interface TTSRequest {
  text: string;
  voice_id?: number;
  public_voice?: string;
}

export interface TTSResponse {
  job_id: number;
  status: string;
  output_url: string;
  deducted: number;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  credits: number;
  is_admin: boolean;
  created_at: string;
  expiry_date: string | null;
}

// TTS API functions
export const ttsApi = {
  getPublicVoices: async (): Promise<PublicVoice> => {
    return apiFetch<PublicVoice>('/voices/public');
  },

  generateSpeech: async (request: TTSRequest): Promise<TTSResponse> => {
    return apiFetch<TTSResponse>('/tts/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

// User API functions
export const userApi = {
  getMe: async (): Promise<UserInfo> => {
    return apiFetch<UserInfo>('/users/me');
  },
};

// Admin API Types
export interface Package {
  id: number;
  name: string;
  credits_per_period: number;
  demo_char_limit: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  credits: number;
  is_admin: boolean;
  package_id: number | null;
}

export interface AdminStats {
  total_users: number;
  total_credits_allocated: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  package_id?: number;
  initial_credits: number;
}

// Admin API functions
export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    return apiFetch<AdminStats>('/admin/stats');
  },

  listUsers: async (): Promise<AdminUser[]> => {
    return apiFetch<AdminUser[]>('/admin/users');
  },

  createUser: async (request: CreateUserRequest): Promise<{ id: number; username: string }> => {
    return apiFetch<{ id: number; username: string }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  updateUserCredits: async (userId: number, credits: number): Promise<AdminUser> => {
    return apiFetch<AdminUser>(`/admin/users/${userId}/credits?credits=${credits}`, {
      method: 'PATCH',
    });
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  listPackages: async (): Promise<Package[]> => {
    return apiFetch<Package[]>('/admin/packages');
  },
};

export interface ClonedVoice {
  id: number;
  name: string;
  gender: string | null;
  status: string;
  created_at: string;
  provider_voice_id: string;
}

export interface CreateClonedVoiceRequest {
  name: string;
  gender: string;
  provider_voice_id: string;
  status?: string;
}

export const voiceCloningApi = {
  getClonedVoices: async (): Promise<ClonedVoice[]> => {
    return apiFetch<ClonedVoice[]>('/voices/cloned');
  },

  saveClonedVoice: async (request: CreateClonedVoiceRequest): Promise<ClonedVoice> => {
    return apiFetch<ClonedVoice>('/voices/cloned', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

export default apiFetch;
