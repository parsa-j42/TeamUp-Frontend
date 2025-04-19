import { useState } from 'react'; // Added React import
import { useNavigate } from 'react-router-dom';
import {
    Stack, TextInput, Textarea, Button, Group, Title, Text, TagsInput, Alert // Added TagsInput, Alert
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react'; // Added IconAlertCircle
import { ChipGroupField } from './ChipGroupField';
import styles from '../CreateProjectPage.module.css';
import {
    numOfMembersFormOptions, projectTypeFormOptions,
    mentorRequestFormOptions, preferredMentorFormOptions
} from '../formConstants.ts';
import { apiClient } from '@utils/apiClient'; // Adjust path
import { CreateProjectPayload, ProjectDto } from '../../../../types/api'; // Adjust path

/**
 * Renders the main form for creating a new project.
 * Manages form state and handles submission to the backend API.
 */
export function CreateProjectForm() {
    const navigate = useNavigate();

    // --- Form State ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [numOfMembersValue, setNumOfMembersValue] = useState<string>('');
    const [requiredSkills, setRequiredSkills] = useState<string[]>([]); // Use array for TagsInput
    const [requiredRoles, setRequiredRoles] = useState('');
    const [projectTypeValue, setProjectTypeValue] = useState<string>('');
    const [mentorRequestValue, setMentorRequestValue] = useState<string>('');
    const [preferredMentorValue, setPreferredMentorValue] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]); // Use array for TagsInput

    // --- Submission State ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Basic validation state (can be expanded)
    const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});

    // --- Basic Validation ---
    const validateForm = (): boolean => {
        const errors: Record<string, string | null> = {};
        if (!title.trim()) errors.title = 'Project Title is required.';
        if (!description.trim()) errors.description = 'Project Description is required.';
        if (!numOfMembersValue) errors.numOfMembers = 'Number of members selection is required.';
        if (requiredSkills.length === 0) errors.requiredSkills = 'At least one required skill is needed.';
        if (!requiredRoles.trim()) errors.requiredRoles = 'Required Roles description is required.';
        if (!projectTypeValue) errors.projectType = 'Project Type selection is required.';
        // Mentor fields are optional based on original code

        setValidationErrors(errors);
        return Object.keys(errors).length === 0; // Valid if no errors
    };


    // --- Event Handlers ---
    const handleCancel = () => {
        navigate('/dashboard'); // Navigate back to dashboard or landing page
    };

    const handleCreate = async () => {
        setError(null); // Clear previous errors
        if (!validateForm()) {
            console.log("Form validation failed:", validationErrors);
            return; // Stop submission if validation fails
        }

        setIsSubmitting(true);

        const payload: CreateProjectPayload = {
            title: title.trim(),
            description: description.trim(),
            numOfMembers: numOfMembersValue || undefined, // Send undefined if empty
            requiredSkills: requiredSkills,
            requiredRoles: requiredRoles.trim(),
            projectType: projectTypeValue || undefined,
            mentorRequest: mentorRequestValue || undefined,
            preferredMentor: preferredMentorValue || undefined,
            tags: tags,
        };

        console.log('Submitting project creation payload:', payload);

        try {
            const newProject = await apiClient<ProjectDto>('/projects', {
                method: 'POST',
                body: payload,
            });
            console.log('Project created successfully:', newProject);
            // Navigate to the new project's page or a success page/dashboard
            navigate(`/projects/${newProject.id}`, { state: { message: 'Project created successfully!' } });
            // Or navigate('/submitted', { state: { action: 'Created' } });
        } catch (err: any) {
            console.error('Project creation failed:', err);
            setError(err.data?.message || err.message || 'Failed to create project. Please try again.');
            setIsSubmitting(false); // Allow retry on error
        }
        // No finally block needed for setIsSubmitting if navigating away on success
    };

    // --- Custom Label Components ---
    const MentorFeedbackLabel = ( <Title order={3} size="15px" fw={400} mb="10px"> Mentor<Text component="span" style={{ fontFamily: 'monospace' }}>/</Text>Feedback </Title> );
    const PreferredMentorLabel = ( <Title order={3} size="15px" fw={400} mb="10px"> Preferred Mentoring Session </Title> );

    return (
        <Stack gap="lg">
            {/* Display API Error */}
            {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" withCloseButton onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <TextInput
                withAsterisk
                label="Project Title"
                value={title}
                onChange={(e) => { setTitle(e.currentTarget.value); setValidationErrors(p => ({ ...p, title: null })); }}
                error={validationErrors.title}
                classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, required: styles.textInputAsterisk }}
            />

            <Textarea
                withAsterisk
                autosize
                minRows={2}
                label="Project Description"
                value={description}
                onChange={(e) => { setDescription(e.currentTarget.value); setValidationErrors(p => ({ ...p, description: null })); }}
                error={validationErrors.description}
                classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, required: styles.textInputAsterisk }}
            />

            <ChipGroupField
                label="How many members are you working with?"
                options={numOfMembersFormOptions}
                value={numOfMembersValue}
                onChange={(newValue) => { setNumOfMembersValue(newValue as string); setValidationErrors(p => ({ ...p, numOfMembers: null })); }}
                required
                error={validationErrors.numOfMembers}
            />

            {/* Use TagsInput for Skills */}
            <TagsInput
                withAsterisk
                label="Which skills do you need?"
                placeholder="Enter skills and press Enter"
                value={requiredSkills}
                onChange={(value) => { setRequiredSkills(value); setValidationErrors(p => ({ ...p, requiredSkills: null })); }}
                error={validationErrors.requiredSkills}
                clearable
                classNames={{ label: styles.textInputLabel, required: styles.textInputAsterisk }} // Apply label styles
            />

            {/* Use TagsInput for Tags (Optional) */}
            <TagsInput
                label="Project Tags (Optional)"
                placeholder="Enter tags and press Enter"
                value={tags}
                onChange={setTags}
                clearable
                classNames={{ label: styles.textInputLabel }} // Apply label styles
            />

            <Textarea
                withAsterisk
                autosize
                minRows={2}
                label="Required Roles and Descriptions"
                value={requiredRoles}
                onChange={(e) => { setRequiredRoles(e.currentTarget.value); setValidationErrors(p => ({ ...p, requiredRoles: null })); }}
                error={validationErrors.requiredRoles}
                classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, required: styles.textInputAsterisk }}
            />

            <ChipGroupField
                label="Project Type"
                options={projectTypeFormOptions}
                value={projectTypeValue}
                onChange={(newValue) => { setProjectTypeValue(newValue as string); setValidationErrors(p => ({ ...p, projectType: null })); }}
                required
                error={validationErrors.projectType} // Pass error state
            />

            <ChipGroupField
                labelComponent={MentorFeedbackLabel}
                options={mentorRequestFormOptions}
                value={mentorRequestValue}
                onChange={(newValue) => setMentorRequestValue(newValue as string)}
                // Not required
            />

            <ChipGroupField
                labelComponent={PreferredMentorLabel}
                options={preferredMentorFormOptions}
                value={preferredMentorValue}
                onChange={(newValue) => setPreferredMentorValue(newValue as string)}
                // Not required
            />

            <Group justify="flex-end" mt="md">
                <Button variant="outline" radius="xl" color="mainPurple.6" fw={400} onClick={handleCancel} disabled={isSubmitting} > Cancel </Button>
                <Button color="mainPurple.6" variant="filled" radius="xl" fw={400} onClick={handleCreate} loading={isSubmitting} > Create </Button>
            </Group>
        </Stack>
    );
}
