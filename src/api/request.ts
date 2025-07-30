// This is the key that the main Care app uses to store the auth token.
const CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY = "care_access_token";

// This is a direct copy of the working APIError class from the other plugin.
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

// This is the core API request function, adapted from the working example.
// It will correctly get the API URL and the auth token.
export async function request<Response>(
  path: string,
  options?: RequestInit
): Promise<Response> {
  // This global variable is set by the main care-fe application.
  const url = `${(window as any).__CORE_ENV__?.apiUrl || ""}${path}`;

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
  if (response.status !== 204) { // 204 No Content has no body
    try {
        data = await response.json();
    } catch (e) {
        // Handle cases where response is not JSON
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

// A simple utility to build a query string from an object.
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