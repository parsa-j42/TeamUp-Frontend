import React, { useState } from 'react';
import {
    Paper, Stack, Title, Text, TextInput, Group, PasswordInput,
} from '@mantine/core';
import styles from './LogInPage.module.css';
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { signIn } from 'aws-amplify/auth';
import GradientBackground from "@components/shared/GradientBackground/GradientBackground.tsx";

interface LogInData {
    email?: string;
    password?: string;
}

type LogInErrors = {
    [key in keyof LogInData]?: string | null;
} & {
    apiError?: string | null;
};

export default function LogInPage() {
    const navigate = useNavigate();
    const location = useLocation(); // Get location to access state

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errors, setErrors] = useState<LogInErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // --- Get potential message and redirection info from location state ---
    const locationState = location.state as {
        message?: string;
        nextPath?: string;
        nextPathState?: any;
        from?: { pathname: string }; // For redirecting back after login
    } | null;
    const displayMessage = locationState?.message; // Message from confirmation page

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.currentTarget;
        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);
        setErrors((prev) => ({ ...prev, [name]: null, apiError: null }));
    };

    const validateForm = (): boolean => {
        const newErrors: LogInErrors = {};
        let isValid = true;
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Valid email is required'; isValid = false;
        }
        if (!password.trim()) {
            newErrors.password = 'Password is required'; isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    // --- MODIFIED ---
    const handleLogin = async () => {
        if (isSubmitting || !validateForm()) return;

        setIsSubmitting(true);
        setErrors((prev) => ({ ...prev, apiError: null }));

        try {
            console.log('[LoginPage] Attempting Cognito sign in for:', email);
            const { isSignedIn, nextStep } = await signIn({
                username: email,
                password: password,
            });

            console.log('[LoginPage] Cognito signIn result:', { isSignedIn, nextStep });

            if (isSignedIn) {
                // AuthContext Hub listener will update the global state.
                console.log('[LoginPage] Login successful!');

                // --- CHANGE: Check if we need to redirect to profile completion ---
                if (locationState?.nextPath === '/signup' && locationState?.nextPathState) {
                    console.log('[LoginPage] Redirecting to signup profile completion...');
                    navigate(locationState.nextPath, {
                        replace: true,
                        state: locationState.nextPathState // Pass the state along
                    });
                } else {
                    // Default redirect (e.g., to dashboard or original intended page)
                    const from = locationState?.from?.pathname || '/my-projects';
                    console.log(`[LoginPage] Redirecting to default location: ${from}`);
                    navigate(from, { replace: true });
                }
                // --- END CHANGE ---

            } else {
                console.warn('[LoginPage] Unhandled signIn next step:', nextStep);
                setErrors({ apiError: 'Login requires additional steps (MFA not implemented).' });
                setIsSubmitting(false);
            }

        } catch (error: any) {
            console.error('[LoginPage] Cognito Login failed:', error);
            let errorMessage = 'Login failed. Please check your credentials or sign up.';
            if (error.name === 'UserNotFoundException') { errorMessage = 'User does not exist. Please sign up.'; }
            else if (error.name === 'NotAuthorizedException') { errorMessage = 'Incorrect email or password.'; }
            else if (error.name === 'UserNotConfirmedException') {
                errorMessage = 'Account not verified. Please check your email for a verification code/link.';
                // Navigate to confirmation page if user tries to log in without confirming
                navigate('/confirm-signup', { state: { username: email } });
            } else { errorMessage = error.message || 'An unexpected error occurred.'; }
            setErrors({ apiError: errorMessage });
            setIsSubmitting(false);
        }
    };
    // --- END MODIFIED ---

    const handleCancel = () => { navigate("/landing"); };

    return (
        <GradientBackground className={styles.container}
                            gradient="linear-gradient(180deg, rgba(55, 197, 231, 0.3) 0%, rgba(55, 197, 231, 0.3) 35%,
                             rgba(255, 255, 255, 1) 100%">
            <Paper m="xl" px="xl" shadow="sm" w="600px" radius="lg" pt="50px" pb="40px">
                <Stack justify="flex-end" align="center" mt="lg" mb="xl" pb="xs">
                    <Title order={2} size="30px" fw={600}>Sign In</Title>
                    {/* Display message from confirmation page if present */}
                    <Text size="15px" lh="1.5" ta="center">
                        {displayMessage}
                    </Text>
                </Stack>
                <Stack mt="xl" gap="xl">
                    <TextInput variant="unstyled" label="Email" placeholder="Enter your email" name="email" type="email" required value={email} onChange={handleInputChange} error={errors.email} classNames={{ wrapper: styles.inputWrapper }} />
                    <PasswordInput variant="unstyled" label="Password" placeholder="Enter your password" name="password" required value={password} onChange={handleInputChange} error={errors.password} classNames={{ wrapper: styles.inputWrapper, innerInput: styles.passwordInnerInput }} />
                    {errors.apiError && <Text c="red" size="sm" ta="center">{errors.apiError}</Text>}
                </Stack>
                <Group justify="space-between" mt="100px">
                    <RoundedButton color="mainBlue.6" textColor="mainBlue.6" variant="outline" size="md" fw="400" w="110px" borderWidth="2" onClick={handleCancel} disabled={isSubmitting}> Cancel </RoundedButton>
                    <RoundedButton color="mainBlue.6" textColor="white" variant="filled" size="md" fw="500" w="110px" borderWidth="2" onClick={handleLogin} loading={isSubmitting} disabled={isSubmitting}> Log In </RoundedButton>
                </Group>
            </Paper>
        </GradientBackground>
    );
}