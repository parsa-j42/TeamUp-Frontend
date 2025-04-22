import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Stack, Stepper, Title, Text, TextInput, Group,
    MultiSelect, Textarea, PasswordInput, Loader // Added Loader
} from '@mantine/core';
import styles from './SignUpPage.module.css'; // Ensure this path is correct
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx"; // Ensure this path is correct
import { useNavigate, useLocation } from "react-router-dom";
import UserTypeToggle from "@components/shared/UserTypeToggle/UserTypeToggle.tsx"; // Ensure this path is correct
import { signUp } from 'aws-amplify/auth';
import { apiClient } from '@utils/apiClient'; // Ensure path is correct
import { useAuth } from '@contexts/AuthContext';
import GradientBackground from "@components/shared/GradientBackground/GradientBackground.tsx"; // Ensure path is correct

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
    updatedAt: Date; // Or string if dates are serialized
    skills?: { id: string; name: string; description?: string }[];
    interests?: { id: string; name: string; description?: string }[];
    workExperiences?: any[]; // Define properly if needed
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
    const { user, isLoading: isAuthLoading } = useAuth(); // Get authenticated user state

    const [active, setActive] = useState<number>(0);
    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    // isConfirmed state is removed, using 'user' object from useAuth instead

    // --- Effect to handle navigation and state ---
    useEffect(() => {
        const state = location.state as {
            postLoginProfileCompletion?: boolean;
            username?: string;
        } | null;

        console.log("[SignUpPage] useEffect - Location State:", state);
        console.log("[SignUpPage] useEffect - Auth User:", user);
        console.log("[SignUpPage] useEffect - Auth Loading:", isAuthLoading);
        console.log("[SignUpPage] useEffect - Current Step (active):", active);

        // Don't run logic until auth state is resolved
        if (isAuthLoading) {
            console.log("[SignUpPage] useEffect - Auth loading, waiting...");
            return;
        }

        // Scenario 1: Coming from Login page for profile completion
        if (state?.postLoginProfileCompletion && state?.username && user && user.username === state.username) {
            console.log('[SignUpPage] Detected post-login profile completion flow for user:', state.username);
            // Pre-fill email if not already set
            if (!formData.email) {
                setFormData(prev => ({ ...prev, email: state.username }));
            }
            // Ensure we are on Step 1 (or move there)
            if (active === 0) {
                setActive(1);
            }
            // Clear the state marker to prevent re-triggering
            navigate(location.pathname, { replace: true, state: {} });
        }
        // Scenario 2: User is logged in but somehow landed on Step 0
        else if (user && active === 0) {
            console.warn('[SignUpPage] User is logged in but on Step 0. Moving to Step 1.');
            // Pre-fill email from authenticated user
            setFormData(prev => ({ ...prev, email: user.username }));
            setActive(1);
        }
        // Scenario 3: User is NOT logged in and tries to access Steps 1 or 2
        else if (!user && active > 0) {
            console.warn('[SignUpPage] User is not logged in but on profile steps. Resetting to Step 0.');
            setActive(0);
            // Clear any potentially stale form data for profile steps
            setFormData(prev => ({
                firstName: prev.firstName, lastName: prev.lastName, email: prev.email,
                preferredUsername: prev.preferredUsername, password: prev.password, confirmPassword: prev.confirmPassword
                // Keep step 0 fields, clear others
            }));
        }

    }, [location.state, navigate, active, user, isAuthLoading, formData.email]);

    // --- Handlers ---
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

    // --- Validation ---
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
        // Validate steps 1 & 2 only if user is authenticated
        if (step === 1 && user) {
            if (!formData.userType) { newErrors.userType = 'Please select a user type'; isValid = false; }
            if (!formData.interests || formData.interests.length === 0) { newErrors.interests = 'Please select at least one interest'; isValid = false; }
            if (!formData.program?.trim()) { newErrors.program = 'Program is required'; isValid = false; }
        }
        if (step === 2 && user) {
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
        // Step 1: Advance to Step 2 (if authenticated)
        else if (active === 1 && user) {
            setActive(2);
            setIsSubmitting(false); // Ready for next step
        }
        // Step 2: Call Backend API to complete profile (if authenticated)
        else if (active === 2 && user) {
            try {
                console.log('[SignUpPage] Attempting to complete profile via backend API...');
                const profilePayload: CompleteSignupProfilePayload = {
                    userType: formData.userType!,
                    program: formData.program!,
                    signupExperience: formData.experience!, // Map frontend 'experience'
                    interests: formData.interests!,
                    skills: formData.skills!,
                };
                console.log('[SignUpPage] Calling POST /profiles/me/complete-signup with payload:', profilePayload);
                await apiClient<UserProfileDto>('/profiles/me/complete-signup', {
                    method: 'POST',
                    body: profilePayload,
                });
                console.log('[SignUpPage] Profile data saved successfully via backend.');
                // Navigate to dashboard or profile page after successful completion
                navigate('/my-projects', { state: { message: 'Profile setup complete!' } });
                // Keep isSubmitting true as we navigate away
            } catch (error: any) {
                console.error('[SignUpPage] Failed to save profile data via backend:', error);
                const backendMessage = error?.data?.message || error?.message || 'Please try again.';
                if (error.status === 401) {
                    setErrors({ apiError: `Authentication error. Please log in again.` });
                } else {
                    setErrors({ apiError: `Failed to save profile data: ${backendMessage}` });
                }
                setIsSubmitting(false); // Allow retry
            }
        } else {
            console.error('[SignUpPage] handleNext called in unexpected state:', { active, user });
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        // Prevent going back from step 1 if user is logged in (they came from login)
        if (active === 1 && user) return;
        setActive((current) => Math.max(0, current - 1));
        setErrors({});
    };

    const handleCancel = () => { navigate("/landing"); };

    // --- Dynamic Content ---
    const getStepContent = () => {
        switch (active) {
            case 0: return { title: "Lets Get Started", description: "Create your account credentials. You will need to verify your email." };
            case 1: return { title: "Tell Us About Yourself", description: "Help us understand who you are and what you're interested in." };
            case 2: return { title: "Finally, what skills do you have?", description: "Showcase your expertise and experiences." };
            default: return { title: "", description: "" };
        }
    };
    const { title, description } = getStepContent();

    // --- Render Logic ---
    // Show loading indicator while auth state is resolving if trying to access steps > 0
    if (isAuthLoading && active > 0) {
        return (
            <Box className={styles.container} bg="bgPurple.6" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Loader color="white" />
            </Box>
        );
    }

    return (
        <GradientBackground className={styles.container} gradient="linear-gradient(180deg, rgba(55, 197, 231, 0.3) 0%,
                            rgba(55, 197, 231, 0.3) 35%, rgba(255, 255, 255, 1) 100%">
            <Paper m="7%" p="xl" shadow="sm" w="600px" radius="lg">
                {/* Stepper Component */}
                <Stepper
                    mx="70px"
                    color="mainRed.6"
                    size="xs"
                    active={active}
                    classNames={{
                        root: styles.stepper,
                        stepIcon: styles.stepIcon,
                        stepCompletedIcon: styles.stepCompletedIcon,
                        separator: styles.separator,
                    }}
                >
                    {/* Add empty label props or content if needed by Stepper */}
                    <Stepper.Step label="" />
                    <Stepper.Step label="" />
                    <Stepper.Step label="" />
                </Stepper>

                {/* Title and Description */}
                <Stack justify="flex-end" align="center" mt="xl">
                    <Title order={2} size="30px" fw={600}>{title}</Title>
                    <Text size="15px" lh="1.5" ta="center">{description}</Text>
                </Stack>

                {/* Form Fields */}
                <Stack mt="md" gap="lg">
                    {/* --- Step 0 Fields --- */}
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

                    {/* --- Step 1 Fields (conditional on user being logged in) --- */}
                    {active === 1 && user && (
                        <>
                            <UserTypeToggle value={formData.userType} onChange={handleUserTypeChange} />
                            {errors.userType && <Text c="red" size="xs">{errors.userType}</Text>}
                            <MultiSelect required label="Interests" placeholder="Select multiple" data={['Photoshop', 'React', 'Python', 'Economics', 'Marketing', 'Design']} value={formData.interests || []} onChange={handleMultiSelectChange('interests')} error={errors.interests} searchable clearable classNames={{ wrapper: styles.inputWrapper, dropdown: styles.dropdown, input: styles.inputInner }} />
                            <TextInput required variant="unstyled" label="Program" name="program" value={formData.program || ''} onChange={handleInputChange} error={errors.program} classNames={{ wrapper: styles.inputWrapper }} />
                        </>
                    )}

                    {/* --- Step 2 Fields (conditional on user being logged in) --- */}
                    {active === 2 && user && (
                        <>
                            <MultiSelect required label="Skills" placeholder="Select Multiple" data={['Photoshop', 'React', 'Python', 'Economics', 'Project Management', 'Communication']} value={formData.skills || []} onChange={handleMultiSelectChange('skills')} error={errors.skills} searchable clearable classNames={{ wrapper: styles.inputWrapper, dropdown: styles.dropdown, input: styles.inputInner, pill: styles.pill }} />
                            <Textarea required variant="unstyled" label="Experience" placeholder="Tell us about your relevant experience, projects, or goals, in around two sentences." name="experience" value={formData.experience || ''} onChange={handleInputChange} error={errors.experience} autosize minRows={3} classNames={{ wrapper: styles.inputWrapper }} />
                        </>
                    )}

                    {/* Render placeholder or message if on steps 1/2 but not logged in */}
                    {active > 0 && !user && !isAuthLoading && (
                        <Text c="dimmed" ta="center">Please log in to complete your profile.</Text>
                    )}

                    {/* API Error Display */}
                    {errors.apiError && <Text c="red" size="sm" ta="center" mt="sm">{errors.apiError}</Text>}
                </Stack>

                {/* Navigation Buttons */}
                <Group justify="space-between" mt="xl">
                    <RoundedButton
                        color="mainBlue.6" textColor="mainBlue.6" variant="outline" size="md" fw="400" w="110px" borderWidth="2"
                        onClick={active === 0 ? handleCancel : handleBack}
                        disabled={isSubmitting || (active === 1 && !!user)} // Prevent back from step 1 if logged in
                    >
                        {active === 0 ? 'Cancel' : 'Back'}
                    </RoundedButton>
                    <RoundedButton
                        color="mainBlue.6" textColor="white" variant="filled" size="md" fw="500" w="110px" borderWidth="2"
                        onClick={handleNext}
                        loading={isSubmitting}
                        disabled={isSubmitting || (active > 0 && !user)} // Disable if on step 1/2 but not logged in
                    >
                        {active === 2 ? 'Sign Up' : 'Next'}
                    </RoundedButton>
                </Group>
            </Paper>
        </GradientBackground>
    );
}