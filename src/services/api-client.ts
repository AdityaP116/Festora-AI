/**
 * Festora AI - Centralized Frontend API Client
 * Adheres to API_CONTRACTS.md and ARCHITECTURE.md.
 * Manages request headers, authentication tokens, timeouts, retries, and error normalization.
 */

import type { AIPlanProposal, EventDocument } from '../types';
import type { ValidatedEventInput } from '../domain/ai-schema';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export class ApiError extends Error {
  code: string;
  requestId?: string;
  status: number;

  constructor(message: string, code = 'INTERNAL', status = 500, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

// Token provider callback to avoid circular imports with AuthContext
let idTokenProvider: (() => Promise<string | null>) | null = null;

export function registerTokenProvider(provider: () => Promise<string | null>) {
  idTokenProvider = provider;
}

// Get the base API URL from environment, emulator or default local port
export function getApiBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return (import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, '');
  }
  // Default emulator or local functions server endpoint
  return 'http://127.0.0.1:5001';
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  requiresAuth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 20000, requiresAuth = true, headers = {}, ...rest } = options;
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const requestId = generateRequestId();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': requestId,
    ...(headers as Record<string, string>),
  };

  if (requiresAuth && idTokenProvider) {
    try {
      const token = await idTokenProvider();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Failed to retrieve token
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      let errorCode = 'INTERNAL';
      let errorMessage = `Request failed with status ${response.status}`;

      if (isJson) {
        try {
          const errorBody = (await response.json()) as ApiErrorResponse;
          if (errorBody?.error) {
            errorCode = errorBody.error.code || errorCode;
            errorMessage = errorBody.error.message || errorMessage;
          }
        } catch {
          // JSON parsing failed, use fallback message
        }
      } else {
        const textBody = await response.text();
        if (textBody) {
          errorMessage = textBody.slice(0, 200);
        }
      }

      throw new ApiError(errorMessage, errorCode, response.status, requestId);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check network connectivity.', 'RESOURCE_EXHAUSTED', 408, requestId);
    }

    const message = err instanceof Error ? err.message : 'Network connectivity error';
    throw new ApiError(`Unable to reach backend service: ${message}`, 'AI_PROVIDER_UNAVAILABLE', 503, requestId);
  }
}

export const ApiClient = {
  /**
   * Health check endpoint
   */
  async checkHealth(): Promise<{ status: string; service: string; version: string }> {
    return request('/health', { method: 'GET', requiresAuth: false, timeoutMs: 5000 });
  },

  /**
   * Generates a structured event plan proposal (API_CONTRACTS.md Section 2)
   */
  async generateEventPlan(
    eventInput: ValidatedEventInput,
    requestId?: string
  ): Promise<{
    proposalId: string;
    schemaVersion: 1;
    plan: AIPlanProposal;
    warnings: string[];
  }> {
    return request('/generateEventPlan', {
      method: 'POST',
      body: JSON.stringify({ eventInput, requestId }),
      timeoutMs: 30000,
    });
  },

  /**
   * Applies an AI plan proposal to an event (API_CONTRACTS.md Section 3)
   */
  async applyEventPlan(
    eventId: string,
    proposalId: string,
    plan: AIPlanProposal,
    changeSummary?: string
  ): Promise<{
    success: boolean;
    versionId: string;
    tasksImported: number;
    budgetCategoriesUpdated: number;
  }> {
    return request('/applyEventPlan', {
      method: 'POST',
      body: JSON.stringify({ eventId, proposalId, plan, changeSummary }),
      timeoutMs: 20000,
    });
  },

  /**
   * Proposes a targeted plan revision (API_CONTRACTS.md Section 4)
   */
  async proposePlanRevision(
    eventId: string,
    currentPlanVersion: number,
    revisionPrompt: string,
    sections?: string[]
  ): Promise<{ revisedPlan: AIPlanProposal; changeSummary: string }> {
    return request('/proposePlanRevision', {
      method: 'POST',
      body: JSON.stringify({
        eventId,
        currentPlanVersion,
        request: revisionPrompt,
        sections,
      }),
      timeoutMs: 25000,
    });
  },

  /**
   * Lists authenticated user's events (API_CONTRACTS.md Section 5)
   */
  async getEvents(): Promise<EventDocument[]> {
    const res = await request<{ events: EventDocument[] }>('/events', { method: 'GET' });
    return res.events || [];
  },

  /**
   * Retrieves an event by ID
   */
  async getEventById(eventId: string): Promise<EventDocument> {
    return request<EventDocument>(`/events?eventId=${encodeURIComponent(eventId)}`, { method: 'GET' });
  },

  /**
   * Creates a new event
   */
  async createEvent(eventData: Partial<EventDocument>): Promise<EventDocument> {
    return request<EventDocument>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  /**
   * Deletes an event
   */
  async deleteEvent(eventId: string): Promise<{ success: boolean; deletedEventId: string }> {
    return request<{ success: boolean; deletedEventId: string }>(
      `/events?eventId=${encodeURIComponent(eventId)}`,
      { method: 'DELETE' }
    );
  },
};
