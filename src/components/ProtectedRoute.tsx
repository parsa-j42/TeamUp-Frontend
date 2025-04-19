import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path if needed
import { Loader, Center } from '@mantine/core'; // Import Loader/Center for loading state

interface ProtectedRouteProps {
    redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                                  redirectPath = '/login'
                                                              }) => {
    const { isAuthenticated, isLoading } = useAuth(); // Get isLoading state
    const location = useLocation();

    // --- MODIFIED: Handle Loading State ---
    if (isLoading) {
        // Show a loading indicator while authentication status is being determined
        return (
            <Center style={{ height: '100vh' }}> {/* Adjust styling as needed */}
                <Loader />
            </Center>
        );
    }
    // --- END MODIFIED ---

    // Redirect only if loading is complete AND user is not authenticated
    if (!isLoading && !isAuthenticated) {
        console.log('[ProtectedRoute] Not authenticated, redirecting to login.');
        // Redirect to login page, passing the current location to redirect back later
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    // If loading is complete and user is authenticated, render the child route
    return <Outlet />;
};