import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth, isFirebaseConfigured } from "./firebase";

// Get API base URL from environment or use current origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper to construct full API URL
function getApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path; // Already a full URL
  }
  return `${API_BASE_URL}${path}`;
}

// Get Firebase ID token for authenticated requests
async function getAuthHeaders(): Promise<Record<string, string>> {
  const baseHeaders: Record<string, string> = {};
  
  // Only try to get Firebase token if Firebase is configured and user is authenticated
  if (isFirebaseConfigured && auth?.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      baseHeaders.Authorization = `Bearer ${idToken}`;
    } catch (error) {
      console.warn('Failed to get Firebase ID token:', error);
      // Don't throw here - let the request proceed and let the backend handle auth
    }
  }
  
  return baseHeaders;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const fullUrl = getApiUrl(url);
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const authHeaders = await getAuthHeaders();
    const url = queryKey.join("/") as string;
    const fullUrl = getApiUrl(url);
    
    const res = await fetch(fullUrl, {
      headers: authHeaders,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
