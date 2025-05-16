// Generic API request function for client-side usage
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Parse the response
  const data = await response.json();

  // Handle errors
  if (!response.ok) {
    const error = new Error(
      data.message || `API request failed with status ${response.status}`,
    );
    throw error;
  }

  return data;
}
