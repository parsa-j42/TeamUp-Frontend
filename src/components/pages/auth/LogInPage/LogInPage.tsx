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
} from '@mantine/core';

import styles from './LogInPage.module.css';
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import { useNavigate } from "react-router-dom";
import {useAuth} from "@contexts/AuthContext.tsx";

// Define the structure for login form data
interface LogInData {
    email?: string;
    password?: string;
}

// Define the structure for validation errors
type LogInErrors = {
    [key in keyof LogInData]?: string | null; // Specific fields
} & {
    apiError?: string | null; // For general API/login errors
};

export default function LogInPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    // --- State ---
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errors, setErrors] = useState<LogInErrors>({}); // Holds validation errors
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Prevent double clicks and show loading

    // --- Handlers ---

    // Handle input changes for email and password
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.currentTarget;

        if (name === 'email') {
            setEmail(value);
            // Clear email error when user starts typing
            if (errors.email) {
                setErrors((prevErrors) => ({ ...prevErrors, email: null }));
            }
        } else if (name === 'password') {
            setPassword(value);
            // Clear password error when user starts typing
            if (errors.password) {
                setErrors((prevErrors) => ({ ...prevErrors, password: null }));
            }
        }
        // Clear general API error on any input change
        if (errors.apiError) {
            setErrors((prevErrors) => ({ ...prevErrors, apiError: null }));
        }
    };

    // Basic validation logic for the login form
    const validateForm = (): boolean => {
        const newErrors: LogInErrors = {};
        let isValid = true;

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) { // Basic email format check
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle "Log In" button click
    const handleLogin = async () => {
        if (isSubmitting) return; // Prevent multiple submissions

        // Clear previous API errors before validating
        setErrors((prev) => ({ ...prev, apiError: null }));

        const isValid = validateForm();

        if (isValid) {
            setIsSubmitting(true);
            console.log('Attempting mock login with:', { email, password });
            login()

            // --- TODO: Replace with actual Authentication API call (e.g., AWS Amplify/Cognito) ---
            // try {
            //   // Example: const user = await Auth.signIn(email, password);
            //   console.log('Login successful:', user);
            //   // Navigate to the user's dashboard or home page upon successful login
            //   navigate('/dashboard'); // Or appropriate route
            // } catch (error: any) {
            //   console.error('Login failed:', error);
            //   // Handle specific API errors (e.g., wrong password, user not found)
            //   // For now, just show a generic error
            //   setErrors({ apiError: error.message || 'Login failed. Please check your credentials.' });
            //   setIsSubmitting(false); // Stop loading on error
            // }
            // --- End of TODO section ---

            // Mock Login Logic (Success)
            setTimeout(() => {
                console.log('Mock login successful!');
                // In a real app, you'd navigate to the main authenticated area
                navigate('/landing');
                // Don't set isSubmitting false here if navigation happens,
                // the component will unmount or state will reset on navigation.
                // If staying on the page after success (unlikely for login), set it here.
                // setIsSubmitting(false);
            }, 1000); // Simulate network delay

        } else {
            console.log('Validation failed:', errors);
            // isSubmitting remains false if validation fails
        }
    };

    // Handle "Cancel" button click
    const handleCancel = () => {
        navigate("/landing"); // Navigate back to landing or previous public page
    };

    // --- Render Logic ---

    return (
        <Box className={styles.container} bg="bgPurple.6">
            {/* Use Paper component for the card effect, similar to SignUp */}
            <Paper m="xl" p="xl" shadow="sm" w="600px" radius="lg">

                {/* Title and Description */}
                <Stack justify="flex-end" align="center" mt="lg" mb="xl"> {/* Adjusted margins for balance */}
                    <Title order={2} size="32px" fw={400} c="mainPurple.6">Welcome Back</Title>
                    <Text size="15px" lh="1.5" ta="center">Please enter your credentials to log in.</Text>
                </Stack>

                {/* Form Fields */}
                <Stack mt="md" gap="xl">
                    <TextInput
                        variant="unstyled" // Maintain visual consistency
                        label="Email"
                        placeholder="Enter your email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleInputChange}
                        error={errors.email} // Display email error
                        classNames={{ wrapper: styles.inputWrapper }} // Apply bottom border style
                    />
                    <PasswordInput
                        variant="unstyled" // Maintain visual consistency
                        label="Password"
                        placeholder="Enter your password"
                        name="password"
                        value={password}
                        onChange={handleInputChange}
                        error={errors.password} // Display password error
                        classNames={{ wrapper: styles.inputWrapper, innerInput: styles.passwordInnerInput }} // Apply bottom border style
                    />
                    {/* Display general API error if any */}
                    {errors.apiError && <Text c="red" size="sm" ta="center">{errors.apiError}</Text>}
                </Stack>

                {/* Action Buttons */}
                <Group justify="space-between" mt="xl">
                    {/* Cancel Button */}
                    <RoundedButton
                        color="mainPurple.6"
                        textColor="black"
                        variant="outline"
                        size="md"
                        fw="400"
                        w="110px"
                        borderWidth="2"
                        onClick={handleCancel}
                        disabled={isSubmitting} // Disable if submitting
                    >
                        Cancel
                    </RoundedButton>

                    {/* Log In Button */}
                    <RoundedButton
                        color="mainPurple.6"
                        textColor="white"
                        variant="filled"
                        size="md"
                        fw="500"
                        w="110px"
                        borderWidth="2"
                        onClick={handleLogin}
                        loading={isSubmitting} // Show loading state
                        disabled={isSubmitting} // Disable if submitting
                    >
                        Log In
                    </RoundedButton>
                </Group>
            </Paper>
        </Box>
    );
}