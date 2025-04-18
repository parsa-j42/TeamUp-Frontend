import { fetchAuthSession } from 'aws-amplify/auth';

// Read the base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("Error: VITE_API_BASE_URL environment variable is not set!");
    // You might want to throw an error here during development
}

interface ApiClientOptions extends RequestInit {
    body?: any; // Allow any body type initially
}

/**
 * Makes authenticated requests to the backend API.
 * Automatically fetches the Cognito ID token and adds it to the Authorization header.
 * Handles JSON request/response bodies and basic error handling.
 */
export async function apiClient<T>(
    endpoint: string, // e.g., '/profiles/me'
    options: ApiClientOptions = {}
): Promise<T> {
    let idToken: string | undefined;

    try {
        // Fetch the current session, which includes tokens
        // forceRefresh: false will use cached tokens if they are still valid
        const session = await fetchAuthSession({ forceRefresh: false });
        idToken = session.tokens?.idToken?.toString(); // Use the ID token

        if (!idToken) {
            console.warn('No ID token found in session. User might not be logged in.');
            // Depending on the endpoint, you might want to throw an error here
            // throw new Error('User is not authenticated.');
        }

    } catch (error) {
        // This catch block usually means no user is signed in or the session is invalid
        console.warn('Could not get user session, proceeding without auth token.', error);
        // Allow request to proceed? Backend will likely reject protected routes with 401.
    }

    // Prepare headers
    const headers = new Headers(options.headers || {});
    // Default to JSON content type if not specified
    if (!headers.has('Content-Type')) {
        headers.append('Content-Type', 'application/json');
    }
    // Add Authorization header if token exists
    if (idToken) {
        headers.append('Authorization', `Bearer ${idToken}`);
    }

    // Prepare fetch configuration
    const config: RequestInit = {
        ...options,
        headers: headers,
    };

    // Stringify body only if it's an object and Content-Type is application/json
    if (options.body && typeof options.body === 'object' && headers.get('Content-Type') === 'application/json') {
        config.body = JSON.stringify(options.body);
    }

    const requestUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`[apiClient] Making ${options.method || 'GET'} request to ${requestUrl}`);

    // Make the request
    const response = await fetch(requestUrl, config);

    // Handle non-OK responses
    if (!response.ok) {
        let errorData: any = { message: `HTTP error! Status: ${response.status}` }; // Default error
        try {
            // Try to parse error response from backend
            const text = await response.text();
            if (text) {
                errorData = JSON.parse(text); // Assume backend sends JSON errors
            }
        } catch (e) {
            // If parsing fails or body is empty, use status text
            errorData = { message: response.statusText || `HTTP error! Status: ${response.status}` };
        }

        // Throw an error object that includes status and backend message
        const error = new Error(errorData?.message || `HTTP error! Status: ${response.status}`) as any;
        error.status = response.status; // Attach status code
        error.data = errorData; // Attach full error data from backend
        console.error("[apiClient] Error Response:", error.status, error.data);
        throw error; // Throw the enriched error object
    }

    // Handle successful responses
    // Check for empty body (e.g., 204 No Content)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType) {
        console.log(`[apiClient] Received ${response.status} No Content or non-JSON response.`);
        return undefined as T; // Return undefined for empty responses
    }

    // Parse JSON body for other successful responses
    if (contentType.includes('application/json')) {
        return response.json() as Promise<T>;
    } else {
        // Handle unexpected content types if necessary
        console.warn(`[apiClient] Received unexpected content type: ${contentType}`);
        return response.text() as unknown as Promise<T>; // Return text if not JSON
    }
}