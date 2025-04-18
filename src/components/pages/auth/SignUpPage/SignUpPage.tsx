import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Stack, Stepper, Title, Text, TextInput, Group,
    MultiSelect, Textarea, PasswordInput
} from '@mantine/core';
import styles from './SignUpPage.module.css';
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import UserTypeToggle from "@components/shared/UserTypeToggle/UserTypeToggle.tsx";
import { signUp } from 'aws-amplify/auth';
import { apiClient } from '@utils/apiClient';

// --- Frontend DTOs/Payloads (Mirroring Backend) ---
interface CompleteSignupProfilePayload {
    userType: string;
    program: string;
    signupExperience: string;
    interests: string[];
    skills: string[];
}

// Expected response structure from backend (can be simplified if needed)
interface UserProfileDto {
    id: string;
    userId: string;
    userType?: string;
    program?: string;
    signupExperience?: string;
    status?: string;
    institution?: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    updatedAt: Date;
    skills?: { id: string; name: string; description?: string }[];
    interests?: { id: string; name: string; description?: string }[];
    workExperiences?: any[];
}

// --- Form Data & Errors ---
interface FormData {
    firstName?: string; lastName?: string; email?: string; preferredUsername?: string;
    password?: string; confirmPassword?: string;
    userType?: string; interests?: string[]; program?: string;
    skills?: string[]; experience?: string; // Maps to signupExperience
}
type FormErrors = { [key in keyof FormData]?: string | null; } & { apiError?: string | null; };

export default function SignUpPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [active, setActive] = useState<number>(0);
    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

    // --- Effect to handle return from confirmation page ---
    useEffect(() => {
        const state = location.state as { cognitoSignUpConfirmed?: boolean; username?: string } | null;
        // Check if returning from confirmation and user isn't already marked confirmed here
        if (state?.cognitoSignUpConfirmed && state?.username && !isConfirmed) {
            console.log('[SignUpPage] Detected return from successful confirmation for user:', state.username);
            setIsConfirmed(true);
            setActive(1); // Move to step 1
            // Store email from state if formData isn't populated yet (e.g., page reload scenario)
            if (!formData.email) {
                setFormData(prev => ({ ...prev, email: state.username }));
            }
            navigate(location.pathname, { replace: true, state: {} }); // Clear location state
        }
        // Redirect back to step 0 if trying to access later steps without confirmation flag
        else if (active > 0 && !isConfirmed) {
            console.warn('[SignUpPage] User is on profile steps but not confirmed. Resetting to Step 0.');
            setActive(0);
        }
    }, [location.state, navigate, active, isConfirmed, formData.email]);

    // --- Handlers (handleInputChange, handleMultiSelectChange, handleUserTypeChange) ---
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.currentTarget;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: null, apiError: null }));
    };
    const handleMultiSelectChange = (field: keyof FormData) => (value: string[]) => {
        setFormData((prevData) => ({ ...prevData, [field]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [field]: null, apiError: null }));
    };
    const handleUserTypeChange = (value: string) => {
        setFormData((prevData) => ({ ...prevData, userType: value }));
        setErrors((prevErrors) => ({ ...prevErrors, userType: null, apiError: null }));
    };

    // --- Validation (validateStep) ---
    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;
        const emailRegex = /\S+@\S+\.\S+/;
        const passwordRegex = /.{8,}/;

        if (step === 0) {
            if (!formData.firstName?.trim()) { newErrors.firstName = 'First name is required'; isValid = false; }
            if (!formData.lastName?.trim()) { newErrors.lastName = 'Last name is required'; isValid = false; }
            if (!formData.preferredUsername?.trim()) { newErrors.preferredUsername = 'Preferred name is required'; isValid = false; }
            if (!formData.email?.trim() || !emailRegex.test(formData.email)) { newErrors.email = 'Valid email is required'; isValid = false; }
            if (!formData.password || !passwordRegex.test(formData.password)) { newErrors.password = 'Password must be at least 8 characters'; isValid = false; }
            if (formData.password !== formData.confirmPassword) { newErrors.confirmPassword = 'Passwords do not match'; isValid = false; }
        }
        // Only validate steps 1 & 2 if user is confirmed
        if (step === 1 && isConfirmed) {
            if (!formData.userType) { newErrors.userType = 'Please select a user type'; isValid = false; }
            if (!formData.interests || formData.interests.length === 0) { newErrors.interests = 'Please select at least one interest'; isValid = false; }
            if (!formData.program?.trim()) { newErrors.program = 'Program is required'; isValid = false; }
        }
        if (step === 2 && isConfirmed) {
            if (!formData.skills || formData.skills.length === 0) { newErrors.skills = 'Please select at least one skill'; isValid = false; }
            if (!formData.experience?.trim()) { newErrors.experience = 'Experience is required'; isValid = false; }
        }
        setErrors(newErrors);
        return isValid;
    };

    // --- Button Click Handlers ---
    const handleNext = async () => {
        if (isSubmitting) return;
        const isValid = validateStep(active);
        if (!isValid) return;

        setErrors(prev => ({ ...prev, apiError: null }));
        setIsSubmitting(true);

        // Step 0: Call Cognito signUp
        if (active === 0) {
            try {
                console.log('[SignUpPage] Attempting Cognito Sign Up...');
                await signUp({
                    username: formData.email!, password: formData.password!,
                    options: {
                        userAttributes: {
                            email: formData.email!, given_name: formData.firstName!,
                            family_name: formData.lastName!, preferred_username: formData.preferredUsername!,
                        },
                    }
                });
                console.log('[SignUpPage] Cognito Sign Up successful. Redirecting to confirmation...');
                navigate('/confirm-signup', { state: { username: formData.email } });
                // Keep isSubmitting true as we navigate away
            } catch (error: any) {
                console.error('[SignUpPage] Cognito Sign up failed:', error);
                let apiErrorMessage = 'Sign up failed. Please try again.';
                if (error.name === 'UsernameExistsException') { apiErrorMessage = 'An account with this email already exists.'; }
                else if (error.name === 'InvalidPasswordException') { apiErrorMessage = 'Password does not meet complexity requirements.'; }
                else if (error.name === 'InvalidParameterException') { apiErrorMessage = `Invalid input: ${error.message}`; }
                else { apiErrorMessage = error.message || 'An unknown error occurred.'; }
                setErrors({ apiError: apiErrorMessage });
                setIsSubmitting(false); // Allow retry
            }
        }
        // Step 1: Advance to Step 2 (if confirmed)
        else if (active === 1 && isConfirmed) {
            setActive(2);
            setIsSubmitting(false); // Ready for next step
        }
        // Step 2: Call Backend API to complete profile (if confirmed)
        else if (active === 2 && isConfirmed) {
            try {
                console.log('[SignUpPage] Attempting to complete profile via backend API...');
                const profilePayload: CompleteSignupProfilePayload = {
                    userType: formData.userType!,
                    program: formData.program!,
                    signupExperience: formData.experience!, // Map frontend 'experience'
                    interests: formData.interests!,
                    skills: formData.skills!,
                };

                // Call the backend API using the helper.
                // This requires the user to have a valid session token.
                // If the user just confirmed, they might need to log in first
                // if the session isn't automatically established/available.
                console.log('[SignUpPage] Calling POST /profiles/me/complete-signup with payload:', profilePayload);
                await apiClient<UserProfileDto>('/profiles/me/complete-signup', {
                    method: 'POST',
                    body: profilePayload,
                });

                console.log('[SignUpPage] Profile data saved successfully via backend.');
                navigate('/login', { state: { message: 'Sign up complete! Please log in.' } });
                // Keep isSubmitting true as we navigate away

            } catch (error: any) {
                console.error('[SignUpPage] Failed to save profile data via backend:', error);
                // Extract message from backend error if possible
                const backendMessage = error?.data?.message || error?.message || 'Please try again.';
                // Check for auth error specifically (status 401)
                if (error.status === 401) {
                    setErrors({ apiError: `Authentication error. Please log in and try completing your profile again from the profile page.` });
                    // Consider redirecting to login or showing a specific message
                    // navigate('/login');
                } else {
                    setErrors({ apiError: `Failed to save profile data: ${backendMessage}` });
                }
                setIsSubmitting(false); // Allow retry
            }
        } else {
            // This case should ideally not be reachable if button disabled states are correct
            console.error('[SignUpPage] handleNext called in unexpected state:', { active, isConfirmed });
            setIsSubmitting(false);
        }
    };

    // --- handleBack, handleCancel ---
    const handleBack = () => {
        // Prevent going back to step 0 after confirmation
        if (active === 1 && isConfirmed) return;
        setActive((current) => Math.max(0, current - 1));
        setErrors({}); // Clear errors on navigation
    };
    const handleCancel = () => { navigate("/landing"); };

    // --- Dynamic Content (getStepContent) ---
    const getStepContent = () => {
        switch (active) {
            case 0: return { title: "Lets Get Started", description: "Create your account credentials. You will need to verify your email." };
            case 1: return { title: "Tell Us About Yourself", description: "Help us understand who you are and what you're interested in." };
            case 2: return { title: "Finally, what skills do you have?", description: "Showcase your expertise and experiences." };
            default: return { title: "", description: "" };
        }
    };
    const { title, description } = getStepContent();

    // --- Render Logic (No UI Changes) ---
    return (
        <Box className={styles.container} bg="bgPurple.6">
            <Paper m="7%" p="xl" shadow="sm" w="600px" radius="lg">
                {/* Stepper */}
                <Stepper active={active} mx="70px" color="mainRed.6" size="xs" classNames={{ root: styles.stepper, stepIcon: styles.stepIcon, stepCompletedIcon: styles.stepCompletedIcon, separator: styles.separator }}>
                    <Stepper.Step /> <Stepper.Step /> <Stepper.Step />
                </Stepper>

                {/* Title/Desc */}
                <Stack justify="flex-end" align="center" mt="xl">
                    <Title order={2} size="32px" fw={400} c="mainPurple.6">{title}</Title>
                    <Text size="15px" lh="1.5" ta="center">{description}</Text>
                </Stack>

                {/* Form Fields */}
                <Stack mt="md" gap="lg">
                    {/* Step 0 */}
                    {active === 0 && (
                        <>
                            <TextInput required variant="unstyled" label="First Name" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} error={errors.firstName} classNames={{ wrapper: styles.inputWrapper }} />
                            <TextInput required variant="unstyled" label="Last Name" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} error={errors.lastName} classNames={{ wrapper: styles.inputWrapper }} />
                            <TextInput required variant="unstyled" label="Preferred Name" name="preferredUsername" value={formData.preferredUsername || ''} onChange={handleInputChange} error={errors.preferredUsername} classNames={{ wrapper: styles.inputWrapper }} />
                            <TextInput required variant="unstyled" label="Email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} error={errors.email} classNames={{ wrapper: styles.inputWrapper }} />
                            <PasswordInput required variant="unstyled" label="Password" name="password" value={formData.password || ''} onChange={handleInputChange} error={errors.password} classNames={{ wrapper: styles.inputWrapper, innerInput: styles.passwordInnerInput }} />
                            <PasswordInput required variant="unstyled" label="Confirm Password" name="confirmPassword" value={formData.confirmPassword || ''} onChange={handleInputChange} error={errors.confirmPassword} classNames={{ wrapper: styles.inputWrapper, innerInput: styles.passwordInnerInput }} />
                        </>
                    )}
                    {/* Step 1 (conditional) */}
                    {active === 1 && isConfirmed && (
                        <>
                            <UserTypeToggle value={formData.userType} onChange={handleUserTypeChange} />
                            {errors.userType && <Text c="red" size="xs">{errors.userType}</Text>}
                            <MultiSelect required label="Interests" placeholder="Select multiple" data={['Photoshop', 'React', 'Python', 'Economics', 'Marketing', 'Design']} value={formData.interests || []} onChange={handleMultiSelectChange('interests')} error={errors.interests} searchable clearable classNames={{ wrapper: styles.inputWrapper, dropdown: styles.dropdown, input: styles.inputInner }} />
                            <TextInput required variant="unstyled" label="Program" name="program" value={formData.program || ''} onChange={handleInputChange} error={errors.program} classNames={{ wrapper: styles.inputWrapper }} />
                        </>
                    )}
                    {/* Step 2 (conditional) */}
                    {active === 2 && isConfirmed && (
                        <>
                            <MultiSelect required label="Skills" placeholder="Select Multiple" data={['Photoshop', 'React', 'Python', 'Economics', 'Project Management', 'Communication']} value={formData.skills || []} onChange={handleMultiSelectChange('skills')} error={errors.skills} searchable clearable classNames={{ wrapper: styles.inputWrapper, dropdown: styles.dropdown, input: styles.inputInner, pill: styles.pill }} />
                            <Textarea required variant="unstyled" label="Experience" placeholder="Tell us about your relevant experience, projects, or goals, in around two sentences." name="experience" value={formData.experience || ''} onChange={handleInputChange} error={errors.experience} autosize minRows={3} classNames={{ wrapper: styles.inputWrapper }} />
                        </>
                    )}
                    {/* API Error */}
                    {errors.apiError && <Text c="red" size="sm" ta="center" mt="sm">{errors.apiError}</Text>}
                </Stack>

                {/* Navigation Buttons */}
                <Group justify="space-between" mt="xl">
                    <RoundedButton color="mainPurple.6" textColor="black" variant="outline" size="md" fw="400" w="110px" borderWidth="2"
                                   onClick={active === 0 ? handleCancel : handleBack}
                                   disabled={isSubmitting || (active === 1 && isConfirmed)} // Prevent back after confirm
                    >
                        {active === 0 ? 'Cancel' : 'Back'}
                    </RoundedButton>
                    <RoundedButton color="mainPurple.6" textColor="white" variant="filled" size="md" fw="500" w="110px" borderWidth="2"
                                   onClick={handleNext}
                                   loading={isSubmitting}
                                   disabled={isSubmitting || (active > 0 && !isConfirmed)} // Disable if on step 1/2 but not confirmed
                    >
                        {active === 2 ? 'Sign Up' : 'Next'}
                    </RoundedButton>
                </Group>
            </Paper>
        </Box>
    );
}