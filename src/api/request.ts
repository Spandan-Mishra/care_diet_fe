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

export async function request<Response>(
  path: string,
  options?: RequestInit
): Promise<Response> {
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
  if (response.status !== 204) {
    try {
        data = await response.json();
    } catch (e) {
        console.error("Response was not valid JSON.", e);
        // If we can't parse the JSON, throw a more specific error
        if (!response.ok) {
            throw new APIError(
                `Failed to parse response from server: ${response.statusText}`,
                null,
                response.status
            );
        }
    }
  }

  if (!response.ok) {
    const errorMessage = data?.detail || 
                         (data ? JSON.stringify(data) : response.statusText) || 
                         "Something went wrong";
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