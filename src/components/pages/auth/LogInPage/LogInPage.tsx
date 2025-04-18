import React, { useState } from 'react';
import {
    Box,
    Paper,
    Stack,
    Title,
    Text,
    TextInput,
    Group,
    PasswordInput,
    // Anchor
} from '@mantine/core';
import styles from './LogInPage.module.css';
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import { useNavigate, useLocation } from "react-router-dom";
// Removed: import {useAuth} from "@contexts/AuthContext.tsx"; // We don't call login() from context anymore
import { signIn } from 'aws-amplify/auth'; // Import the signIn function

// Define the structure for login form data (no change needed)
interface LogInData {
    email?: string;
    password?: string;
}

// Define the structure for validation errors (no change needed)
type LogInErrors = {
    [key in keyof LogInData]?: string | null;
} & {
    apiError?: string | null;
};

export default function LogInPage() {
    const navigate = useNavigate();
    const location = useLocation();
    // const { login } = useAuth(); // Remove this line

    // --- State ---
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errors, setErrors] = useState<LogInErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // --- Handlers ---
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.currentTarget;
        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);
        // Clear errors on change
        setErrors((prev) => ({ ...prev, [name]: null, apiError: null }));
    };

    const validateForm = (): boolean => {
        const newErrors: LogInErrors = {};
        let isValid = true;
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Valid email is required';
            isValid = false;
        }
        if (!password.trim()) {
            newErrors.password = 'Password is required';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        if (isSubmitting || !validateForm()) return;

        setIsSubmitting(true);
        setErrors((prev) => ({ ...prev, apiError: null })); // Clear previous API error

        try {
            console.log('Attempting Cognito sign in for:', email);
            const { isSignedIn, nextStep } = await signIn({
                username: email, // Use email as the username
                password: password,
            });

            console.log('Cognito signIn result:', { isSignedIn, nextStep });

            if (isSignedIn) {
                // AuthContext Hub listener will automatically detect 'signedIn'
                // and update the global state via checkAuthStatus.
                console.log('Login successful!');
                // Redirect to intended page or dashboard
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
            } else {
                // Handle MFA, custom challenges, etc. if configured in Cognito
                // For now, we'll treat unexpected next steps as an error.
                console.warn('Unhandled signIn next step:', nextStep);
                setErrors({ apiError: 'Login requires additional steps (MFA not implemented).' });
                setIsSubmitting(false);
            }

        } catch (error: any) {
            console.error('Cognito Login failed:', error);
            // Handle specific Cognito errors
            let errorMessage = 'Login failed. Please check your credentials or sign up.';
            if (error.name === 'UserNotFoundException') {
                errorMessage = 'User does not exist. Please sign up.';
            } else if (error.name === 'NotAuthorizedException') {
                errorMessage = 'Incorrect email or password.';
            } else if (error.name === 'UserNotConfirmedException') {
                errorMessage = 'Account not verified. Please check your email for a verification code/link.';
                // Optionally navigate to a confirmation page:
                // navigate('/confirm-signup', { state: { username: email } });
            } else {
                errorMessage = error.message || 'An unexpected error occurred.';
            }
            setErrors({ apiError: errorMessage });
            setIsSubmitting(false); // Stop loading on error
        }
        // No finally block needed for setIsSubmitting(false) because navigation on success unmounts
    };

    const handleCancel = () => {
        navigate("/landing");
    };

    // --- Render Logic ---
    return (
        <Box className={styles.container} bg="bgPurple.6">
            <Paper m="xl" p="xl" shadow="sm" w="600px" radius="lg">
                <Stack justify="flex-end" align="center" mt="lg" mb="xl">
                    <Title order={2} size="32px" fw={400} c="mainPurple.6">Welcome Back</Title>
                    <Text size="15px" lh="1.5" ta="center">Please enter your credentials to log in.</Text>
                </Stack>
                <Stack mt="md" gap="xl">
                    <TextInput
                        variant="unstyled"
                        label="Email"
                        placeholder="Enter your email"
                        name="email" type="email" required // Add required attribute
                        value={email} onChange={handleInputChange} error={errors.email}
                        classNames={{ wrapper: styles.inputWrapper }}
                    />
                    <PasswordInput
                        variant="unstyled"
                        label="Password"
                        placeholder="Enter your password"
                        name="password" required // Add required attribute
                        value={password} onChange={handleInputChange} error={errors.password}
                        classNames={{ wrapper: styles.inputWrapper, innerInput: styles.passwordInnerInput }}
                    />
                    {/* Add Forgot Password Link */}
                    {/*<Group justify="flex-start">*/}
                    {/*    <Anchor component="button" type="button" c="dimmed" onClick={() => navigate('/forgot-password')} size="sm">*/}
                    {/*        Forgot password?*/}
                    {/*    </Anchor>*/}
                    {/*</Group>*/}

                    {errors.apiError && <Text c="red" size="sm" ta="center">{errors.apiError}</Text>}
                </Stack>
                <Group justify="space-between" mt="xl">
                    <RoundedButton color="mainPurple.6" textColor="black" variant="outline" size="md" fw="400" w="110px" borderWidth="2" onClick={handleCancel} disabled={isSubmitting}>
                        Cancel
                    </RoundedButton>
                    <RoundedButton color="mainPurple.6" textColor="white" variant="filled" size="md" fw="500" w="110px" borderWidth="2" onClick={handleLogin} loading={isSubmitting} disabled={isSubmitting}>
                        Log In
                    </RoundedButton>
                </Group>
            </Paper>
        </Box>
    );
}