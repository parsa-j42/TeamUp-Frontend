import React from 'react';
import {Routes, Route, Navigate, useLocation} from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

import LogInPage from '@components/pages/auth/LogInPage/LogInPage';
import LandingPage from "@components/pages/LandingPage/LandingPage.tsx";
import DashboardPage from "@components/pages/Dashboard/DashboardPage.tsx";
import ProjectPage from "@components/pages/ProjectPage/ProjectPage.tsx";
import SuccessPage from "@components/pages/SuccessPage/SuccessPage.tsx";
import CreateProjectPage from "@components/pages/CreateProjectPage/CreateProjectPage.tsx";
import ProfilePage from "@components/pages/ProfilePage/ProfilePage.tsx";
import AboutUsPage from "@components/static/AboutUs/AboutUs.tsx";
import PrivacyAndTermsPage from "@components/static/PrivacyAndTerms/PrivacyAndTerms.tsx";
import CapConPage from "@components/static/CapConPage/CapConPage.tsx";
import SignUpPage from "@components/pages/auth/SignUpPage/SignUpPage.tsx";
import ConfirmSignUpPage from "@components/pages/auth/ConfirmSignUpPage/ConfirmSignUpPage.tsx";

export const AppRouter: React.FC = () => {
    // Temporary for CapCon
    const standaloneRoutes = ['/CapCon'];
    const location = useLocation();
    const isStandalone = standaloneRoutes.some(route =>
        location.pathname === route || location.pathname.startsWith(`${route}/`)
    );

    if (isStandalone) {
        return <Routes><Route path="/CapCon" element={<CapConPage />} /></Routes>
    }
    // End of Temporary for CapCon

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/AboutUs" element={<AboutUsPage />} />
            <Route path="/Privacy" element={<PrivacyAndTermsPage />} />
            <Route path="/SignUp" element={<SignUpPage />} />
            <Route path="/confirm-signup" element={<ConfirmSignUpPage />} />
            <Route path="/LogIn" element={<LogInPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                {/* --- MODIFIED: Add :projectId parameter --- */}
                <Route path="/project/:projectId" element={<ProjectPage />} />
                {/* --- END MODIFIED --- */}
                <Route path="/submitted" element={<SuccessPage />} />
                <Route path="/create-project" element={<CreateProjectPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* Add route for viewing other user profiles */}
                <Route path="/profile/:userId" element={<ProfilePage />} />

            </Route>

            {/* Redirect root to dashboard if authenticated, otherwise to login */}
            <Route path="/" element={<Navigate to="/landing" replace />} />

            {/* 404 route */}
            {/*<Route path="*" element={<NotFound />} />*/}
        </Routes>
    );
};