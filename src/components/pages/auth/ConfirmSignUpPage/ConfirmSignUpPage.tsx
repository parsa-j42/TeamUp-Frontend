// src/components/pages/auth/ConfirmSignUpPage/ConfirmSignUpPage.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Stack, Title, Text, Group, PinInput, Anchor, useMantineTheme,
} from '@mantine/core';
import { IconMail } from '@tabler/icons-react';
import styles from './ConfirmSignUpPage.module.css';
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

type ConfirmErrors = {
    code?: string | null;
    apiError?: string | null;
};

export default function ConfirmSignUpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useMantineTheme();

    const [username] = useState<string>(location.state?.username || '');
    const [code, setCode] = useState<string>('');
    const [errors, setErrors] = useState<ConfirmErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isResending, setIsResending] = useState<boolean>(false);
    const [resendMessage, setResendMessage] = useState<string>('');

    useEffect(() => {
        if (!username) {
            console.error("[ConfirmSignUpPage] Username not found in location state. Redirecting to sign up.");
            navigate('/signup', { replace: true, state: { error: 'Verification requires a username.' } });
        }
    }, [username, navigate]);

    const handleCodeChange = (value: string) => {
        setCode(value);
        setErrors((prev) => ({ ...prev, code: null, apiError: null }));
        setResendMessage('');
    };

    const validateForm = (): boolean => {
        let isValid = true;
        if (!code || code.length !== 6) {
            setErrors({ code: 'Verification code must be 6 digits' });
            isValid = false;
        } else {
            setErrors({});
        }
        return isValid;
    };

    // --- MODIFIED ---
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
            // --- CHANGE: Navigate to LOGIN page, passing state to indicate next step ---
            navigate('/login', {
                replace: true, // Replace history entry
                state: {
                    message: 'Account confirmed! Please log in to complete your profile.',
                    nextPath: '/signup', // Tell login where to go next
                    nextPathState: { // State to pass to signup page
                        postLoginProfileCompletion: true, // Flag indicating why we are here
                        username: username // Pass username along
                    }
                }
            });
            // --- END CHANGE ---

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
    // --- END MODIFIED ---

    const handleResend = async () => {
        if (isResending || !username) return;
        setIsResending(true); setResendMessage(''); setErrors(prev => ({ ...prev, apiError: null }));
        try {
            console.log('[ConfirmSignUpPage] Attempting Cognito resendSignUpCode for:', username);
            await resendSignUpCode({ username: username });
            setResendMessage('Verification code resent successfully. Check your email.');
        } catch (error: any) {
            console.error('[ConfirmSignUpPage] Cognito Resend code failed:', error);
            setResendMessage(`Failed to resend code: ${error.message || 'Please try again later.'}`);
        } finally { setIsResending(false); }
    };

    const handleChangeEmail = () => { navigate('/signup', { replace: true }); };

    const emailIconContainerStyle: React.CSSProperties = {
        width: 145, height: 145, borderRadius: '50%',
        backgroundColor: theme.colors.mainPurple?.[6] || theme.primaryColor,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        border: `10px solid ${theme.colors.gray?.[3] || '#d9d9d9'}`,
        marginBottom: theme.spacing.xl,
    };
    const emailIconStyle = { size: 80, color: theme.colors.gray?.[3] || "#d9d9d9", strokeWidth: 2.5 };

    return (
        <Box className={styles.container} bg="bgPurple.6">
            <Stack align="center" justify="center" style={{ minHeight: '100vh', padding: '20px' }}>
                <Box style={emailIconContainerStyle}> <IconMail {...emailIconStyle} /> </Box>
                <Title order={2} size="32px" fw={400} c="mainPurple.6" ta="center"> Verify Email Address </Title>
                <Text size="15px" lh={1.5} ta="center" maw={450} mb="lg">
                    We sent a verification code to{' '} <Text span fw={500}>{username || 'your email'}</Text>.{' '}
                    Please enter the 6-digit code below. <br />
                    <Anchor component="button" type="button" onClick={handleChangeEmail} size="sm"> Click here </Anchor>
                    {' '}if this is not the correct email address.
                </Text>
                <PinInput type="number" length={6} size="lg" value={code} onChange={handleCodeChange} error={!!errors.code || !!errors.apiError} autoFocus aria-label="Verification Code" />
                {errors.code && <Text c="red" size="sm" ta="center" mt="xs">{errors.code}</Text>}
                {errors.apiError && <Text c="red" size="sm" ta="center" mt="xs">{errors.apiError}</Text>}
                {resendMessage && <Text c={resendMessage.startsWith('Failed') ? 'red' : 'green'} size="sm" ta="center" mt="xs">{resendMessage}</Text>}
                <Group mt="xl" gap="xl">
                    <RoundedButton color="mainPurple.6" textColor="black" variant="outline" size="md" fw="400" w="175px" borderWidth="2" onClick={handleResend} loading={isResending} disabled={isResending || isSubmitting} > Resend Code </RoundedButton>
                    <RoundedButton color="mainPurple.6" textColor="white" variant="filled" size="md" fw="500" w="175px" borderWidth="2" onClick={handleConfirm} loading={isSubmitting} disabled={isSubmitting || isResending || code.length !== 6} > Confirm Account </RoundedButton>
                </Group>
            </Stack>
        </Box>
    );
}