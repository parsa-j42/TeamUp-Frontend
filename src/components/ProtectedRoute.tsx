import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path if needed
import { Loader, Center } from '@mantine/core';

interface ProtectedRouteProps {
    redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                                  redirectPath = '/login'
                                                              }) => {
    // Use initialCheckComplete in addition to isLoading and isAuthenticated
    const { isAuthenticated, isLoading, initialCheckComplete } = useAuth();
    const location = useLocation();

    // --- MODIFIED: Handle Loading State (Wait for initial check) ---
    if (isLoading || !initialCheckComplete) {
        // Show loading indicator until the *initial* auth check is complete
        return (
            <Center style={{ height: '100vh' }}>
                <Loader />
            </Center>
        );
    }
    // --- END MODIFIED ---

    // Redirect only if initial check is complete AND user is not authenticated
    if (initialCheckComplete && !isAuthenticated) {
        console.log('[ProtectedRoute] Initial check complete, not authenticated, redirecting to login.');
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    // If initial check is complete and user is authenticated, render the child route
    return <Outlet />;
};