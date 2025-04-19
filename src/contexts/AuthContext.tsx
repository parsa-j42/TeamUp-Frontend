import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCurrentUser, fetchAuthSession, signOut, type AuthUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { apiClient } from '@utils/apiClient'; // Import apiClient
import { UserDto } from '../types/api'; // Import UserDto type

// Define the shape of the context data
interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser | null; // Cognito user object
    userDetails: UserDto | null; // User details from our backend DB
    tokens: { idToken?: string; accessToken?: string } | null;
    isLoading: boolean; // True during initial check AND subsequent checks
    initialCheckComplete: boolean; // True once the first checkAuthStatus has finished
    checkAuthStatus: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userDetails, setUserDetails] = useState<UserDto | null>(null); // State for backend user details
    const [tokens, setTokens] = useState<{ idToken?: string; accessToken?: string } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [initialCheckComplete, setInitialCheckComplete] = useState<boolean>(false);

    // Function to fetch user details from backend API
    const fetchUserDetails = async () => {
        console.log('[AuthContext] Fetching user details from backend...');
        try {
            // Assuming apiClient handles adding the auth token
            const data = await apiClient<UserDto>('/users/me');
            setUserDetails(data);
            console.log('[AuthContext] User details fetched:', data);
        } catch (error) {
            console.error('[AuthContext] Failed to fetch user details:', error);
            // Don't clear auth state here, just failed to get details
            setUserDetails(null);
        }
    };

    const checkAuthStatus = useCallback(async () => {
        console.log('[AuthContext] Checking auth status...');
        setIsLoading(true);
        let isAuthenticated = false; // Track if authentication succeeds
        try {
            const currentUser = await getCurrentUser();
            const session = await fetchAuthSession({ forceRefresh: false });
            setUser(currentUser);
            setTokens({
                idToken: session.tokens?.idToken?.toString(),
                accessToken: session.tokens?.accessToken?.toString(),
            });
            isAuthenticated = true; // Mark as authenticated
            console.log('[AuthContext] User is authenticated via Cognito:', currentUser.username);
        } catch (error) {
            console.log('[AuthContext] checkAuthStatus error (likely not authenticated):', error);
            setUser(null);
            setTokens(null);
            setUserDetails(null); // Clear backend details if auth fails
            isAuthenticated = false;
        } finally {
            // Fetch backend details ONLY if Cognito auth succeeded
            if (isAuthenticated) {
                await fetchUserDetails(); // Fetch details after confirming auth
            }
            setIsLoading(false);
            setInitialCheckComplete(true);
        }
    }, []); // Removed fetchUserDetails from dependencies

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    useEffect(() => {
        const hubListener = (data: any) => {
            switch (data.payload.event) {
                case 'signedIn':
                    console.log('[AuthContext] Hub: signedIn. Re-checking auth status.');
                    checkAuthStatus(); // This will now also trigger fetchUserDetails if auth succeeds
                    break;
                case 'signedOut':
                    console.log('[AuthContext] Hub: signedOut. Clearing state.');
                    setUser(null); setTokens(null); setUserDetails(null); setIsLoading(false);
                    break;
                case 'tokenRefresh':
                    console.log('[AuthContext] Hub: tokenRefresh. Re-checking auth status.');
                    checkAuthStatus(); // Re-check to potentially update details if needed
                    break;
                case 'tokenRefresh_failure':
                    console.error('[AuthContext] Hub: tokenRefresh_failure. Clearing state.');
                    setUser(null); setTokens(null); setUserDetails(null); setIsLoading(false);
                    break;
                default:
                    break;
            }
        };
        const unsubscribe = Hub.listen('auth', hubListener);
        return () => { unsubscribe(); };
    }, [checkAuthStatus]);

    const logout = async () => {
        console.log('[AuthContext] Attempting sign out...');
        try {
            await signOut({ global: true });
            // Hub listener will clear state
        } catch (error) {
            console.error('[AuthContext] Error signing out: ', error);
            setUser(null); setTokens(null); setUserDetails(null); setIsLoading(false); // Force clear state
        }
    };

    // Determine final authentication status based on checks and user object
    const finalIsAuthenticated = initialCheckComplete && !isLoading && !!user;

    return (
        <AuthContext.Provider value={{
            isAuthenticated: finalIsAuthenticated, // Use derived value
            user,
            userDetails, // Provide backend user details
            tokens,
            isLoading,
            initialCheckComplete,
            checkAuthStatus,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) { throw new Error('useAuth must be used within an AuthProvider'); }
    return context;
};