// src/components/pages/auth/ConfirmSignUpPage/ConfirmSignUpPage.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Stack,
    Title,
    Text,
    Group,
    PinInput, // Use PinInput for the code
    Anchor,   // For links like "Resend" or "Change Email"
    useMantineTheme, // To replicate original styling
} from '@mantine/core';
import { IconMail } from '@tabler/icons-react'; // Import the original email icon
import styles from './ConfirmSignUpPage.module.css'; // Create a corresponding CSS module if needed, or use inline styles
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx"; // Ensure path is correct
import { useNavigate, useLocation } from "react-router-dom";
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'; // Import Amplify functions

// Define structure for errors
type ConfirmErrors = {
    code?: string | null;
    apiError?: string | null;
};

export default function ConfirmSignUpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useMantineTheme(); // Get theme for styling

    // --- State ---
    const [username] = useState<string>(location.state?.username || ''); // Get username (email) passed from SignUpPage
    const [code, setCode] = useState<string>(''); // State for the PinInput (6 digits)
    const [errors, setErrors] = useState<ConfirmErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // For the main "Confirm" button
    const [isResending, setIsResending] = useState<boolean>(false); // For the "Resend" button
    const [resendMessage, setResendMessage] = useState<string>(''); // Feedback after resend attempt

    // --- Effect to handle missing username ---
    useEffect(() => {
        if (!username) {
            console.error("[ConfirmSignUpPage] Username not found in location state. Redirecting to sign up.");
            // Optionally show an error message before redirecting
            navigate('/signup', { replace: true, state: { error: 'Verification requires a username.' } });
        }
    }, [username, navigate]);

    // --- Handlers ---
    const handleCodeChange = (value: string) => {
        setCode(value);
        // Clear errors when user types
        setErrors((prev) => ({ ...prev, code: null, apiError: null }));
        setResendMessage(''); // Clear resend message too
    };

    const validateForm = (): boolean => {
        let isValid = true;
        if (!code || code.length !== 6) {
            setErrors({ code: 'Verification code must be 6 digits' });
            isValid = false;
        } else {
            setErrors({}); // Clear errors if valid
        }
        return isValid;
    };

    // Handle "Confirm Account" button click (was "Already Verified")
    const handleConfirm = async () => {
        if (isSubmitting || !validateForm()) return;

        setIsSubmitting(true);
        setErrors(prev => ({ ...prev, apiError: null }));
        setResendMessage('');

        try {
            console.log('[ConfirmSignUpPage] Attempting Cognito confirmSignUp for:', username);
            await confirmSignUp({
                username: username,
                confirmationCode: code,
            });

            console.log('[ConfirmSignUpPage] Account confirmed successfully!');
            // Navigate back to SignUpPage Step 1, passing a success flag
            navigate('/signup', {
                replace: true, // Replace history entry so back button doesn't loop here
                state: {
                    cognitoSignUpConfirmed: true, // Flag to indicate success
                    username: username // Pass username back for check in SignUpPage
                }
            });
            // Alternatively, navigate directly to login:
            // navigate('/login', { state: { message: 'Account confirmed! Please log in.' } });

        } catch (error: any) {
            console.error('[ConfirmSignUpPage] Cognito Confirmation failed:', error);
            let apiErrorMessage = 'Confirmation failed. Please check the code and try again.';
            if (error.name === 'CodeMismatchException') { apiErrorMessage = 'Invalid verification code.'; }
            else if (error.name === 'ExpiredCodeException') { apiErrorMessage = 'Verification code has expired. Please request a new one.'; }
            else if (error.name === 'UserNotFoundException') { apiErrorMessage = 'User not found. Please sign up again.'; }
            else if (error.name === 'NotAuthorizedException') { apiErrorMessage = 'Account is already confirmed. Please log in.'; }
            else { apiErrorMessage = error.message || 'An unknown error occurred.'; }
            setErrors({ apiError: apiErrorMessage });
            setIsSubmitting(false);
        }
    };

    // Handle "Resend Email" button click
    const handleResend = async () => {
        if (isResending || !username) return; // Don't resend if already sending or no username

        setIsResending(true);
        setResendMessage(''); // Clear previous message
        setErrors(prev => ({ ...prev, apiError: null })); // Clear API error

        try {
            console.log('[ConfirmSignUpPage] Attempting Cognito resendSignUpCode for:', username);
            await resendSignUpCode({ username: username });
            setResendMessage('Verification code resent successfully. Check your email.');
        } catch (error: any) {
            console.error('[ConfirmSignUpPage] Cognito Resend code failed:', error);
            // Provide more specific feedback if possible
            setResendMessage(`Failed to resend code: ${error.message || 'Please try again later.'}`);
        } finally {
            setIsResending(false);
        }
    };

    // Handle "Click here" to change email (navigates back to sign up)
    const handleChangeEmail = () => {
        // Navigate back to the start of the sign-up process
        navigate('/signup', { replace: true }); // Replace history so back button works as expected
    };

    // --- Styles (Copied from original SignUpPage context) ---
    const emailIconContainerStyle: React.CSSProperties = {
        width: 145,
        height: 145,
        borderRadius: '50%',
        backgroundColor: theme.colors.mainPurple?.[6] || theme.primaryColor, // Use theme color
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: `10px solid ${theme.colors.gray?.[3] || '#d9d9d9'}`, // Use theme color
        marginBottom: theme.spacing.xl,
    };

    const emailIconStyle = {
        size: 80,
        color: theme.colors.gray?.[3] || "#d9d9d9", // Use theme color
        strokeWidth: 2.5, // Use strokeWidth instead of stroke
    };

    // --- Render Logic ---
    // This JSX structure mimics the original "Verify Email Address" screen
    return (
        <Box className={styles.container} bg="bgPurple.6"> {/* Assuming styles.container exists */}
            <Stack align="center" justify="center" style={{ minHeight: '100vh', padding: '20px' }}>
                {/* Email Icon */}
                <Box style={emailIconContainerStyle}>
                    <IconMail {...emailIconStyle} />
                </Box>

                {/* Title */}
                <Title order={2} size="32px" fw={400} c="mainPurple.6" ta="center">
                    Verify Email Address
                </Title>

                {/* Description */}
                <Text size="15px" lh={1.5} ta="center" maw={450} mb="lg"> {/* Added margin bottom */}
                    We sent a verification code to{' '}
                    <Text span fw={500}>{username || 'your email'}</Text>.{' '}
                    Please enter the 6-digit code below.
                    <br /> {/* Line break for clarity */}
                    <Anchor component="button" type="button" onClick={handleChangeEmail} size="sm">
                        Click here
                    </Anchor>
                    {' '}if this is not the correct email address.
                </Text>

                {/* Pin Input for Code */}
                <PinInput
                    type="number"
                    length={6}
                    size="lg"
                    value={code}
                    onChange={handleCodeChange}
                    error={!!errors.code || !!errors.apiError}
                    autoFocus
                    aria-label="Verification Code" // Accessibility
                />

                {/* Error Display */}
                {errors.code && <Text c="red" size="sm" ta="center" mt="xs">{errors.code}</Text>}
                {errors.apiError && <Text c="red" size="sm" ta="center" mt="xs">{errors.apiError}</Text>}
                {resendMessage && <Text c={resendMessage.startsWith('Failed') ? 'red' : 'green'} size="sm" ta="center" mt="xs">{resendMessage}</Text>}


                {/* Action Buttons */}
                <Group mt="xl" gap="xl">
                    {/* Resend Button */}
                    <RoundedButton
                        color="mainPurple.6"
                        textColor="black"
                        variant="outline"
                        size="md"
                        fw="400"
                        w="175px"
                        borderWidth="2"
                        onClick={handleResend}
                        loading={isResending} // Use loading state
                        disabled={isResending || isSubmitting} // Disable if submitting or resending
                    >
                        Resend Code
                    </RoundedButton>
                    {/* Confirm Button (was "Already Verified") */}
                    <RoundedButton
                        color="mainPurple.6"
                        textColor="bgGrey.6"
                        variant="filled"
                        size="md"
                        fw="500"
                        w="175px"
                        borderWidth="2"
                        onClick={handleConfirm}
                        loading={isSubmitting} // Use loading state
                        disabled={isSubmitting || isResending || code.length !== 6} // Disable if submitting, resending, or code incomplete
                    >
                        Confirm Account
                    </RoundedButton>
                </Group>
            </Stack>
        </Box>
    );
}