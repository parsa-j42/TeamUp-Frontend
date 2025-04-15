import React, { useState } from 'react';
import {
    Box,
    Paper,
    Stack,
    Stepper,
    Title,
    Text,
    TextInput,
    Group,
    MultiSelect,
    Textarea,
    useMantineTheme,
} from '@mantine/core';
import { IconMail } from '@tabler/icons-react'; // Import email icon
import styles from './SignUpPage.module.css';
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import { useNavigate } from "react-router-dom";
import UserTypeToggle from "@components/shared/UserTypeToggle/UserTypeToggle.tsx"; // Assuming this component has an onChange prop

// Define the structure for form data
interface FormData {
    firstName?: string;
    lastName?: string;
    email?: string;
    userType?: string; // Assuming UserTypeToggle provides a string value
    interests?: string[];
    program?: string;
    skills?: string[];
    experience?: string;
}

// Define the structure for validation errors
type FormErrors = {
    [key in keyof FormData]?: string | null;
};

export default function SignUpPage() {
    const navigate = useNavigate();
    const theme = useMantineTheme(); // Get theme for styling the icon

    // --- State ---
    const [active, setActive] = useState<number>(0); // Current step index
    const [formData, setFormData] = useState<FormData>({}); // Holds all form data
    const [errors, setErrors] = useState<FormErrors>({}); // Holds validation errors
    const [showEmailVerification, setShowEmailVerification] = useState<boolean>(false); // Controls visibility of email verification screen
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Prevent double clicks

    // --- Handlers ---

    // Generic input change handler for simple text inputs/textareas
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.currentTarget;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof FormData]) {
            setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
        }
    };

    // Specific handler for MultiSelect components
    const handleMultiSelectChange = (field: keyof FormData) => (value: string[]) => {
        setFormData((prevData) => ({ ...prevData, [field]: value }));
        if (errors[field]) {
            setErrors((prevErrors) => ({ ...prevErrors, [field]: null }));
        }
    };

    // Handler for UserTypeToggle (assuming it passes value to onChange)
    const handleUserTypeChange = (value: string) => {
        setFormData((prevData) => ({ ...prevData, userType: value }));
        if (errors.userType) {
            setErrors((prevErrors) => ({ ...prevErrors, userType: null }));
        }
    };

    // Basic validation logic - extend this for more complex rules (e.g., email format)
    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        // --- Step 1 Validation ---
        if (step === 0) {
            if (!formData.firstName?.trim()) {
                newErrors.firstName = 'First name is required';
                isValid = false;
            }
            if (!formData.lastName?.trim()) {
                newErrors.lastName = 'Last name is required';
                isValid = false;
            }
            if (!formData.email?.trim()) {
                newErrors.email = 'Email is required';
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) { // Basic email format check
                newErrors.email = 'Invalid email format';
                isValid = false;
            }
        }

        // --- Step 2 Validation ---
        if (step === 1) {
            if (!formData.userType) { // Assuming 'userType' is required
                newErrors.userType = 'Please select a user type';
                isValid = false;
            }
            if (!formData.interests || formData.interests.length === 0) {
                newErrors.interests = 'Please select at least one interest';
                isValid = false;
            }
            if (!formData.program?.trim()) {
                newErrors.program = 'Program is required';
                isValid = false;
            }
        }

        // --- Step 3 Validation ---
        if (step === 2) {
            if (!formData.skills || formData.skills.length === 0) {
                newErrors.skills = 'Please select at least one skill';
                isValid = false;
            }
            if (!formData.experience?.trim()) {
                newErrors.experience = 'Experience is required';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle "Next" button click
    const handleNext = async () => {
        if (isSubmitting) return; // Prevent multiple submissions

        const isValid = validateStep(active);

        if (isValid) {
            if (active === 0) {
                // --- Logic for after Step 1 ---
                setIsSubmitting(true);
                console.log('Simulating sending verification email to:', formData.email);
                // TODO: Replace with actual API call to initiate verification
                // await sendVerificationEmail(formData.email);
                // On successful API call:
                setShowEmailVerification(true); // Show the verification screen
                setErrors({}); // Clear previous errors
                setIsSubmitting(false);
                // Do NOT advance 'active' state here yet.
            } else if (active < 2) {
                // --- Logic for Steps 1 -> 2 ---
                setActive((current) => current + 1);
                setErrors({}); // Clear errors when moving to next step
            } else {
                // --- Logic for Final Step (Sign Up) ---
                setIsSubmitting(true);
                console.log('Simulating Sign Up with data:', formData);
                // TODO: Replace with actual API call to sign up user
                // try {
                //   const result = await signUpUser(formData);
                //   console.log('Sign up successful:', result);
                //   navigate('/success', { state: { action: 'signed up' } }); // Or navigate to dashboard
                // } catch (error) {
                //   console.error('Sign up failed:', error);
                //   // Handle specific API errors (e.g., display a general error message)
                //   setErrors({ apiError: 'Sign up failed. Please try again.' });
                // } finally {
                //   setIsSubmitting(false);
                // }
                // Mock success navigation for now
                setTimeout(() => {
                    navigate('/submitted', { state: { action: 'Signed Up' } });
                    setIsSubmitting(false);
                }, 1000); // Simulate network delay
            }
        } else {
            console.log('Validation failed for step:', active, errors);
        }
    };

    // Handle "Back" button click
    const handleBack = () => {
        setActive((current) => Math.max(0, current - 1)); // Prevent going below 0
        setErrors({}); // Clear errors when going back
    };

    // Handle "Cancel" button click (only on step 0)
    const handleCancel = () => {
        navigate("/landing"); // Or wherever cancel should lead
    };

    // Handle "Resend" email click
    const handleResendEmail = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        console.log('Simulating RESENDING verification email to:', formData.email);
        // TODO: Add API call to resend verification email
        // await resendVerificationEmail(formData.email);
        alert('Verification email resent (mock).'); // Provide user feedback
        setIsSubmitting(false);
    };

    // Handle "Already Verified" click
    const handleAlreadyVerified = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        console.log('Simulating checking verification status for:', formData.email);
        // TODO: Add API call to check if email is verified
        // const isVerified = await checkVerificationStatus(formData.email);
        // Mocking verification success for now
        const isVerified = true; // Replace with actual check result

        if (isVerified) {
            setShowEmailVerification(false); // Hide verification screen
            setActive(1); // Move to the next step in the form
            setErrors({});
        } else {
            alert('Email not verified yet. Please check your inbox or resend.'); // Provide feedback
        }
        setIsSubmitting(false);
    };

    // Handle "click here" to change email
    const handleChangeEmail = () => {
        setShowEmailVerification(false); // Hide verification screen
        setActive(0); // Go back to step 1
        setErrors({}); // Clear errors
        // Optionally clear the email field if desired
        // setFormData(prev => ({ ...prev, email: '' }));
    };

    // --- Dynamic Content ---

    // Determine title and description based on the current step
    const getStepContent = () => {
        switch (active) {
            case 0:
                return {
                    title: "Let's Get Started",
                    description: "You will have to verify your identity through your school email, however, your personal email will be used as your login information."
                };
            case 1:
                return {
                    title: "Tell Us About Yourself",
                    description: "Help us understand who you are and what you're interested in." // Placeholder text
                };
            case 2:
                return {
                    title: "Finally, what skills do you have?",
                    description: "Showcase your expertise and experiences." // Placeholder text
                };
            default:
                return { title: "", description: "" };
        }
    };

    const { title, description } = getStepContent();

    // --- Styles for Email Verification Icon --- (Similar to SuccessPage)
    const emailIconContainerStyle: React.CSSProperties = {
        width: 145,
        height: 145,
        borderRadius: '50%',
        backgroundColor: theme.colors.mainPurple?.[6] || '#7950f2', // Fallback color
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '10px solid #d9d9d9',
        marginBottom: theme.spacing.xl, // Add some space below the icon
    };

    const emailIconStyle = {
        size: 80, // Slightly smaller than checkmark maybe
        color: "#d9d9d9",
        stroke: 2.5,
    };

    // --- Render Logic ---

    // Render Email Verification Screen if showEmailVerification is true
    if (showEmailVerification) {
        return (
            <Box className={styles.container} bg="bgPurple.6">
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
                    <Text size="15px" lh="1.5" ta="center" maw={450}>
                        We have sent a verification link to{' '}
                        <Text span fw={500}>{formData.email || 'your email'}</Text>.{' '}
                        <Text
                            span
                            c="mainPurple.6"
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={handleChangeEmail}
                        >
                            Click here
                        </Text>
                        {' '}if you did not receive an email or would like to change emails.
                    </Text>

                    {/* Action Buttons */}
                    <Group mt="xl" gap="xl">
                        <RoundedButton
                            color="mainPurple.6"
                            textColor="black"
                            variant="outline"
                            size="md"
                            fw="400"
                            w="170px"
                            borderWidth="2"
                            onClick={handleResendEmail}
                            disabled={isSubmitting}
                        >
                            Resend Email
                        </RoundedButton>
                        <RoundedButton
                            color="mainPurple.6"
                            textColor="white"
                            variant="filled"
                            size="md"
                            fw="500"
                            w="170px"
                            borderWidth="2"
                            onClick={handleAlreadyVerified}
                            disabled={isSubmitting}
                        >
                            Already Verified
                        </RoundedButton>
                    </Group>
                </Stack>
            </Box>
        );
    }

    // Render the Stepper Form otherwise
    return (
        <Box className={styles.container} bg="bgPurple.6">
            <Paper m="xl" p="xl" shadow="sm" w="600px" radius="lg"> {/* Removed fixed height */}
                {/* Stepper Component */}
                <Stepper
                    mx="70px"
                    color="mainRed.6"
                    size="xs"
                    active={active}
                    // onStepClick={setActive} // Optional: allow clicking steps to navigate
                    classNames={{
                        root: styles.stepper,
                        stepIcon: styles.stepIcon,
                        stepCompletedIcon: styles.stepCompletedIcon,
                        separator: styles.separator,
                    }}
                >
                    <Stepper.Step />
                    <Stepper.Step />
                    <Stepper.Step />
                </Stepper>

                {/* Step Title and Description */}
                <Stack justify="flex-end" align="center" mt="xl">
                    <Title order={2} size="32px" fw={400} c="mainPurple.6">{title}</Title>
                    <Text size="15px" lh="1.5" ta="center">{description}</Text>
                </Stack>

                {/* Form Fields - Conditionally Rendered */}
                <Stack mt="md" gap="xl">
                    {/* --- Step 1 Fields --- */}
                    {active === 0 && (
                        <>
                            <TextInput
                                variant="unstyled"
                                label="First Name"
                                placeholder="Enter your first name"
                                name="firstName" // Name attribute for handler
                                value={formData.firstName || ''}
                                onChange={handleInputChange}
                                error={errors.firstName}
                                classNames={{ wrapper: styles.inputWrapper }}
                            />
                            <TextInput
                                variant="unstyled"
                                label="Last Name"
                                placeholder="Enter your last name"
                                name="lastName"
                                value={formData.lastName || ''}
                                onChange={handleInputChange}
                                error={errors.lastName}
                                classNames={{ wrapper: styles.inputWrapper }}
                            />
                            <TextInput
                                variant="unstyled"
                                label="Email"
                                placeholder="Enter your email"
                                name="email"
                                type="email" // Use email type for basic browser validation
                                value={formData.email || ''}
                                onChange={handleInputChange}
                                error={errors.email}
                                classNames={{ wrapper: styles.inputWrapper }}
                            />
                        </>
                    )}

                    {/* --- Step 2 Fields --- */}
                    {active === 1 && (
                        <>
                            {/* Assuming UserTypeToggle has an onChange prop */}
                            <UserTypeToggle
                                value={formData.userType}
                                onChange={handleUserTypeChange}
                                // Add error display if needed for UserTypeToggle
                            />
                            {errors.userType && <Text c="red" size="xs">{errors.userType}</Text>}


                            <MultiSelect
                                label="Interests"
                                placeholder="Select multiple"
                                data={['Photoshop', 'React', 'Python', 'Economics', 'Marketing', 'Design']} // Example data
                                value={formData.interests || []}
                                onChange={handleMultiSelectChange('interests')}
                                error={errors.interests}
                                searchable
                                clearable
                                classNames={{
                                    wrapper: styles.inputWrapper,
                                    dropdown: styles.dropdown,
                                    input: styles.inputInner,
                                }}
                            />
                            <TextInput
                                variant="unstyled"
                                label="Program"
                                placeholder="Your field of study"
                                name="program"
                                value={formData.program || ''}
                                onChange={handleInputChange}
                                error={errors.program}
                                classNames={{ wrapper: styles.inputWrapper }}
                            />
                        </>
                    )}

                    {/* --- Step 3 Fields --- */}
                    {active === 2 && (
                        <>
                            <MultiSelect
                                label="Skills"
                                placeholder="Select Multiple"
                                data={['Photoshop', 'React', 'Python', 'Economics', 'Project Management', 'Communication']}
                                value={formData.skills || []}
                                onChange={handleMultiSelectChange('skills')}
                                error={errors.skills}
                                searchable
                                clearable
                                classNames={{
                                    wrapper: styles.inputWrapper,
                                    dropdown: styles.dropdown,
                                    input: styles.inputInner,
                                    pill: styles.pill,
                                }}
                            />
                            <Textarea
                                variant="unstyled"
                                label="Experience"
                                placeholder="Tell us about your relevant experience, projects, or goals, in around two sentences."
                                name="experience"
                                value={formData.experience || ''}
                                onChange={handleInputChange}
                                error={errors.experience}
                                autosize // Make it grow with content
                                minRows={3}
                                classNames={{ wrapper: styles.inputWrapper }}
                            />
                        </>
                    )}
                    {/* Display general API error if any */}
                    {/* {errors.apiError && <Text c="red" size="sm" ta="center">{errors.apiError}</Text>} */}
                </Stack>

                {/* Navigation Buttons */}
                <Group justify="space-between" mt="xl">
                    {/* Back/Cancel Button */}
                    <RoundedButton
                        color="mainPurple.6"
                        textColor="black"
                        variant="outline"
                        size="md"
                        fw="400"
                        w="110px"
                        borderWidth="2"
                        onClick={active === 0 ? handleCancel : handleBack} // Conditional onClick
                        disabled={isSubmitting}
                    >
                        {active === 0 ? 'Cancel' : 'Back'} {/* Conditional text */}
                    </RoundedButton>

                    {/* Next/Sign Up Button */}
                    <RoundedButton
                        color="mainPurple.6"
                        textColor="white"
                        variant="filled"
                        size="md"
                        fw="500"
                        w="110px"
                        borderWidth="2"
                        onClick={handleNext}
                        loading={isSubmitting} // Show loading state
                        disabled={isSubmitting}
                    >
                        {active === 2 ? 'Sign Up' : 'Next'} {/* Conditional text */}
                    </RoundedButton>
                </Group>
            </Paper>
        </Box>
    );
}