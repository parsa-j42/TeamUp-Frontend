import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Stack,
    TextInput,
    Textarea,
    Button,
    Group,
    Title,
    Text,
} from '@mantine/core';
import { ChipGroupField } from './ChipGroupField';
import styles from '../CreateProjectPage.module.css';
import {
    numOfMembersFormOptions,
    projectTypeFormOptions,
    mentorRequestFormOptions,
    preferredMentorFormOptions
} from '../formConstants.ts';

/**
 * Renders the main form for creating a new project.
 * Manages the state for chip selections and handles navigation.
 */
export function CreateProjectForm() {
    const navigate = useNavigate();

    // State for ChipGroup selections
    const [numOfMembersValue, setNumOfMembersValue] = useState<string>('');
    const [projectTypeValue, setProjectTypeValue] = useState<string>('');
    const [mentorRequestValue, setMentorRequestValue] = useState<string>('');
    const [preferredMentorValue, setPreferredMentorValue] = useState<string>('');

    // TODO: Add state management for TextInput and Textarea values if needed for submission
    // const [projectTitle, setProjectTitle] = useState('');
    // const [projectDescription, setProjectDescription] = useState('');
    // const [skillsNeeded, setSkillsNeeded] = useState('');
    // const [requiredRoles, setRequiredRoles] = useState('');

    // --- Event Handlers ---
    const handleCancel = () => {
        navigate('/landing'); // Navigate back to landing page on cancel
    };

    const handleCreate = () => {
        // TODO: Implement actual form submission logic here
        // This would involve gathering all form data (including text inputs/areas),
        // performing validation, and sending it to an API endpoint.
        console.log('Form Data (Example):', {
            // projectTitle, projectDescription, skillsNeeded, requiredRoles,
            numOfMembers: numOfMembersValue,
            projectType: projectTypeValue,
            mentorRequest: mentorRequestValue,
            preferredMentor: preferredMentorValue,
        });
        // Navigate to a confirmation page after successful creation
        navigate('/submitted', { state: { action: 'Created' } });
    };

    // --- Custom Label Components for specific Chip Groups ---
    const MentorFeedbackLabel = (
        <Title order={3} size="15px" fw={400} mb="10px">
            Mentor<Text component="span" style={{ fontFamily: 'monospace' }}>/</Text>Feedback
        </Title>
    );

    const PreferredMentorLabel = (
        <Title order={3} size="15px" fw={400} mb="10px">
            Preferred Mentoring Session
        </Title>
    );

    return (
        <Stack gap="lg">
            {/* Project Title Input */}
            <TextInput
                withAsterisk
                label="Project Title"
                // value={projectTitle} onChange={(e) => setProjectTitle(e.currentTarget.value)}
                classNames={{
                    input: styles.textInputOutline,
                    label: styles.textInputLabel,
                    required: styles.textInputAsterisk,
                }}
            />

            {/* Project Description Input */}
            <Textarea
                withAsterisk
                autosize
                minRows={2}
                label="Project Description"
                // value={projectDescription} onChange={(e) => setProjectDescription(e.currentTarget.value)}
                classNames={{
                    input: styles.textInputOutline,
                    label: styles.textInputLabel,
                    required: styles.textInputAsterisk,
                }}
            />

            {/* Number of Members Chip Group */}
            <ChipGroupField
                label="How many members are you working with?"
                options={numOfMembersFormOptions}
                value={numOfMembersValue}
                onChange={(newValue) => setNumOfMembersValue(newValue as string)}
                required
            />

            {/* Skills Needed Input */}
            <TextInput
                withAsterisk
                label="Which skills do you need?"
                // value={skillsNeeded} onChange={(e) => setSkillsNeeded(e.currentTarget.value)}
                classNames={{
                    input: styles.textInputOutline,
                    label: styles.textInputLabel,
                    required: styles.textInputAsterisk,
                }}
            />

            {/* Required Roles Input */}
            <Textarea
                withAsterisk
                autosize
                minRows={2}
                label="Required Roles and Descriptions"
                // value={requiredRoles} onChange={(e) => setRequiredRoles(e.currentTarget.value)}
                classNames={{
                    input: styles.textInputOutline,
                    label: styles.textInputLabel,
                    required: styles.textInputAsterisk,
                }}
            />

            {/* Project Type Chip Group */}
            <ChipGroupField
                label="Project Type"
                options={projectTypeFormOptions}
                value={projectTypeValue}
                onChange={(newValue) => setProjectTypeValue(newValue as string)}
                required
            />

            {/* Mentor/Feedback Chip Group (using custom label) */}
            <ChipGroupField
                labelComponent={MentorFeedbackLabel} // Pass the custom label component
                options={mentorRequestFormOptions}
                value={mentorRequestValue}
                onChange={(newValue) => setMentorRequestValue(newValue as string)}
                // Note: This field was not marked as required in the original code
            />

            {/* Preferred Mentoring Session Chip Group (using custom label) */}
            <ChipGroupField
                labelComponent={PreferredMentorLabel} // Pass the custom label component
                options={preferredMentorFormOptions}
                value={preferredMentorValue}
                onChange={(newValue) => setPreferredMentorValue(newValue as string)}
                // Note: This field was not marked as required in the original code
            />

            {/* Form Action Buttons */}
            <Group justify="flex-end" mt="md">
                <Button
                    variant="outline"
                    radius="xl"
                    color="mainPurple.6"
                    fw={400}
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button
                    color="mainPurple.6"
                    variant="filled"
                    radius="xl"
                    fw={400}
                    onClick={handleCreate}
                >
                    Create
                </Button>
            </Group>
        </Stack>
    );
}