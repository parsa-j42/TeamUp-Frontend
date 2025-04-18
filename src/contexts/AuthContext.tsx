import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCurrentUser, fetchAuthSession, signOut, type AuthUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils'; // Import HubPayload for better typing

// Define the shape of the context data
interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser | null; // Store Cognito user object
    tokens: { idToken?: string; accessToken?: string } | null; // Store tokens
    isLoading: boolean; // Indicate if auth state is being checked
    checkAuthStatus: () => Promise<void>; // Function to manually re-check
    logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [tokens, setTokens] = useState<{ idToken?: string; accessToken?: string } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially

    // Function to check authentication status
    const checkAuthStatus = useCallback(async () => {
        // Avoid checking if already loading
        // Note: This might need adjustment if rapid checks are required, but prevents overlaps.
        // if (isLoading) return;

        setIsLoading(true);
        console.log('[AuthContext] Checking auth status...');
        try {
            // Check if a user is currently signed in locally
            const currentUser = await getCurrentUser();
            // Fetch session details (includes tokens)
            // forceRefresh: false uses cached tokens if not expired, true forces refresh
            const session = await fetchAuthSession({ forceRefresh: false });

            setUser(currentUser);
            setTokens({
                // Access tokens safely using optional chaining and toString()
                idToken: session.tokens?.idToken?.toString(),
                accessToken: session.tokens?.accessToken?.toString(),
            });
            console.log('[AuthContext] User is authenticated:', currentUser.username);

        } catch (error) {
            // Error means no authenticated user found (or session expired and refresh failed)
            console.log('[AuthContext] User is not authenticated or session invalid.');
            setUser(null);
            setTokens(null);
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies needed if it doesn't rely on external state/props

    // Check status on initial mount
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]); // Run when checkAuthStatus function reference changes (should be stable with useCallback)

    // Listen for auth events using Amplify Hub
    useEffect(() => {
        // Define the listener callback
        const hubListener = (data: any) => {
            switch (data.payload.event) {
                case 'signedIn':
                    console.log('[AuthContext] Hub detected signedIn event. Re-checking auth status.');
                    checkAuthStatus(); // Re-check status to get user/token info
                    break;
                case 'signedOut':
                    console.log('[AuthContext] Hub detected signedOut event. Clearing user state.');
                    setUser(null); // Clear user state on sign-out
                    setTokens(null);
                    setIsLoading(false); // Ensure loading is false after sign out
                    break;
                // Amplify v6 might trigger 'tokenRefresh' events if configured/needed
                case 'tokenRefresh':
                    console.log('[AuthContext] Hub detected tokenRefresh event. Session likely updated.');
                    // Optionally re-fetch session if needed, but checkAuthStatus often covers this
                    // fetchAuthSession({ forceRefresh: false }).then(session => {
                    //     setTokens({
                    //         idToken: session.tokens?.idToken?.toString(),
                    //         accessToken: session.tokens?.accessToken?.toString(),
                    //     });
                    // }).catch(() => { /* Handle error */ });
                    break;
                case 'tokenRefresh_failure':
                    console.error('[AuthContext] Hub detected tokenRefresh_failure event. Clearing user state.');
                    // Treat token refresh failure as potentially signed out state
                    setUser(null);
                    setTokens(null);
                    setIsLoading(false);
                    break;
                // You might not need to handle signInWithRedirect explicitly here if using standard signIn
                // case 'signInWithRedirect':
                //    console.log('[AuthContext] Hub detected signInWithRedirect. Auth flow initiated.');
                //    break;
                // case 'signInWithRedirect_failure':
                //    console.error('[AuthContext] Hub detected signInWithRedirect_failure.');
                //     setUser(null);
                //     setTokens(null);
                //     setIsLoading(false);
                //    break;
                default:
                    // console.log('[AuthContext] Hub event received:', data.payload.event); // Log other events if needed
                    break;
            }
        };

        // Subscribe to the 'auth' channel
        const unsubscribe = Hub.listen('auth', hubListener);

        // Cleanup function to remove the listener on component unmount
        return () => {
            console.log('[AuthContext] Unsubscribing from Hub listener.');
            unsubscribe();
        };
    }, [checkAuthStatus]); // Dependency array includes checkAuthStatus

    // Logout function
    const logout = async () => {
        // Don't start loading here, let the Hub event handle it after signOut completes
        // setIsLoading(true);
        console.log('[AuthContext] Attempting sign out...');
        try {
            await signOut({ global: true }); // Sign out globally (invalidates tokens everywhere)
            // The Hub listener ('signedOut') should handle clearing the state.
            console.log('[AuthContext] Sign out successful via Amplify.');
        } catch (error) {
            console.error('[AuthContext] Error signing out: ', error);
            // Force clear local state even if Amplify throws an error during sign out
            setUser(null);
            setTokens(null);
            setIsLoading(false);
        }
    };

    // Provide the context value
    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!user && !isLoading, // True only if user exists and not loading
            user,
            tokens,
            isLoading,
            checkAuthStatus,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};