const CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY = "care_access_token";

export class APIError extends Error {
  message: string;
  data: unknown;
  status: number;

  constructor(message: string, data: unknown, status: number) {
    super(message);
    this.name = "APIError";
    this.message = message;
    this.data = data;
    this.status = status;
  }
}

// Get the API URL 
function getApiUrl(): string {
  // For development, use localhost to avoid CORS issues
  if (import.meta.env.DEV) {
    return "http://localhost:9000";
  }
  
  // For production, try to get from the core app's careConfig
  if (typeof window !== 'undefined' && (window as any).careConfig?.apiUrl) {
    return (window as any).careConfig.apiUrl;
  }
  
  // Fallback to environment variable or default
  return import.meta.env.REACT_CARE_API_URL || "";
}

export async function request<Response>(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${getApiUrl()}${path}`;

  const defaultHeaders = {
    Authorization: `Bearer ${localStorage.getItem(
      CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY
    )}`,
    "Content-Type": "application/json",
  };

  const requestInit = {
    ...(options ?? {}),
    headers: {
      ...defaultHeaders,
      ...(options?.headers ?? {}),
    },
  };

  const response = await fetch(url, requestInit);

  let data: any = null;
  if (response.status !== 204) {
    try {
        data = await response.json();
    } catch (e) {
        console.error("Response was not valid JSON.", e);
    }
  }

  if (!response.ok) {
    const errorMessage = data?.detail || JSON.stringify(data) || "Something went wrong";
    throw new APIError(
      errorMessage,
      data,
      response.status
    );
  }

  return data as Response;
}

export const queryString = (
  params?: Record<string, any>
) => {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      query.append(key, params[key]);
    }
  }
  const str = query.toString();
  return str ? `?${str}` : "";
};