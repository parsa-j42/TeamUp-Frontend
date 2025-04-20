import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Stack, TextInput, Textarea, Button, Group, Title, Text, TagsInput, Alert,
    Paper, ActionIcon, Box, // Added Box
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { ChipGroupField } from './ChipGroupField';
import styles from '../CreateProjectPage.module.css';
import {
    numOfMembersFormOptions, projectTypeFormOptions,
    mentorRequestFormOptions, preferredMentorFormOptions
} from '../formConstants.ts';
import { apiClient } from '@utils/apiClient';
import { CreateProjectPayload, ProjectDto, CreateMilestoneInput } from '../../../../types/api';

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
    const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
    const [requiredRoles, setRequiredRoles] = useState('');
    const [projectTypeValue, setProjectTypeValue] = useState<string>('');
    const [mentorRequestValue, setMentorRequestValue] = useState<string>('');
    const [preferredMentorValue, setPreferredMentorValue] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [milestones, setMilestones] = useState<CreateMilestoneInput[]>([{ title: '', date: '' }]);

    // --- Submission State ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});

    // --- Milestone Handlers ---
    const handleMilestoneChange = (index: number, field: keyof CreateMilestoneInput, value: string | Date | null) => {
        const newMilestones = [...milestones];
        const stringValue = value instanceof Date ? value.toISOString() : value ?? '';
        newMilestones[index] = { ...newMilestones[index], [field]: stringValue };
        setMilestones(newMilestones);
        setValidationErrors(p => ({ ...p, milestones: null }));
    };

    const addMilestone = () => {
        setMilestones([...milestones, { title: '', date: '' }]);
    };

    const removeMilestone = (index: number) => {
        if (milestones.length > 1) {
            const newMilestones = milestones.filter((_, i) => i !== index);
            setMilestones(newMilestones);
        } else {
            setMilestones([{ title: '', date: '' }]);
        }
    };

    // --- Basic Validation ---
    const validateForm = (): boolean => {
        const errors: Record<string, string | null> = {};
        if (!title.trim()) errors.title = 'Project Title is required.';
        if (!description.trim()) errors.description = 'Project Description is required.';
        if (!numOfMembersValue) errors.numOfMembers = 'Number of members selection is required.';
        if (requiredSkills.length === 0) errors.requiredSkills = 'At least one required skill is needed.';
        if (!requiredRoles.trim()) errors.requiredRoles = 'Required Roles description is required.';
        if (!projectTypeValue) errors.projectType = 'Project Type selection is required.';

        const partiallyFilled = milestones.some(m => (m.title.trim() && !m.date) || (!m.title.trim() && m.date));
        if (partiallyFilled) {
            errors.milestones = 'Please complete both title and date for all added milestones, or remove incomplete ones.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // --- Event Handlers ---
    const handleCancel = () => {
        navigate('/Dashboard');
    };

    const handleCreate = async () => {
        setError(null);
        if (!validateForm()) {
            console.log("Form validation failed:", validationErrors);
            return;
        }
        setIsSubmitting(true);

        const milestonesToSend = milestones.filter(m => m.title.trim() && m.date);

        const payload: CreateProjectPayload = {
            title: title.trim(),
            description: description.trim(),
            numOfMembers: numOfMembersValue || undefined,
            requiredSkills: requiredSkills,
            requiredRoles: requiredRoles.trim(),
            projectType: projectTypeValue || undefined,
            mentorRequest: mentorRequestValue || undefined,
            preferredMentor: preferredMentorValue || undefined,
            tags: tags,
            milestones: milestonesToSend.length > 0 ? milestonesToSend : undefined,
        };

        console.log('Submitting project creation payload:', payload);

        try {
            const newProject = await apiClient<ProjectDto>('/projects', { method: 'POST', body: payload });
            console.log('Project created successfully:', newProject);
            navigate('/Dashboard', {
                replace: true,
                state: {
                    selectedProjectId: newProject.id,
                    message: 'Project created successfully!'
                }
            });
        } catch (err: any) {
            console.error('Project creation failed:', err);
            setError(err.data?.message || err.message || 'Failed to create project. Please try again.');
            setIsSubmitting(false);
        }
    };

    // --- Custom Label Components ---
    const MentorFeedbackLabel = ( <Title order={3} size="15px" fw={400} mb="10px"> Mentor<Text component="span" style={{ fontFamily: 'monospace' }}>/</Text>Feedback </Title> );
    const PreferredMentorLabel = ( <Title order={3} size="15px" fw={400} mb="10px"> Preferred Mentoring Session </Title> );

    // --- Render Logic ---
    return (
        <Stack gap="lg">
            {error && ( <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" withCloseButton onClose={() => setError(null)}> {error} </Alert> )}

            <TextInput withAsterisk label="Project Title" value={title} onChange={(e) => { setTitle(e.currentTarget.value); setValidationErrors(p => ({ ...p, title: null })); }} error={validationErrors.title} classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, required: styles.textInputAsterisk }} />
            <Textarea withAsterisk autosize minRows={2} label="Project Description" value={description} onChange={(e) => { setDescription(e.currentTarget.value); setValidationErrors(p => ({ ...p, description: null })); }} error={validationErrors.description} classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, required: styles.textInputAsterisk }} />
            <ChipGroupField label="How many members are you working with?" options={numOfMembersFormOptions} value={numOfMembersValue} onChange={(newValue) => { setNumOfMembersValue(newValue as string); setValidationErrors(p => ({ ...p, numOfMembers: null })); }} required error={validationErrors.numOfMembers} />
            <TagsInput withAsterisk label="Which skills do you need?" placeholder="Enter skills and press Enter" value={requiredSkills} onChange={(value) => { setRequiredSkills(value); setValidationErrors(p => ({ ...p, requiredSkills: null })); }} error={validationErrors.requiredSkills} clearable classNames={{ label: styles.textInputLabel, required: styles.textInputAsterisk }} />
            <TagsInput label="Project Tags (Optional)" placeholder="Enter tags and press Enter" value={tags} onChange={setTags} clearable classNames={{ label: styles.textInputLabel }} />
            <Textarea withAsterisk autosize minRows={2} label="Required Roles and Descriptions" value={requiredRoles} onChange={(e) => { setRequiredRoles(e.currentTarget.value); setValidationErrors(p => ({ ...p, requiredRoles: null })); }} error={validationErrors.requiredRoles} classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, required: styles.textInputAsterisk }} />
            <ChipGroupField label="Project Type" options={projectTypeFormOptions} value={projectTypeValue} onChange={(newValue) => { setProjectTypeValue(newValue as string); setValidationErrors(p => ({ ...p, projectType: null })); }} required error={validationErrors.projectType} />
            <ChipGroupField labelComponent={MentorFeedbackLabel} options={mentorRequestFormOptions} value={mentorRequestValue} onChange={(newValue) => setMentorRequestValue(newValue as string)} />
            <ChipGroupField labelComponent={PreferredMentorLabel} options={preferredMentorFormOptions} value={preferredMentorValue} onChange={(newValue) => setPreferredMentorValue(newValue as string)} />

            {/* --- Milestones Section --- */}
            <Paper withBorder p="md" radius="md" mt="md">
                <Stack gap="sm">
                    <Group justify="space-between">
                        <Title order={4} size="16px" fw={500}>Project Milestones (Optional)</Title>
                        <Button size="xs" variant="light" onClick={addMilestone} leftSection={<IconPlus size={14} />}> Add Milestone </Button>
                    </Group>
                    <Text size="xs" c="dimmed">Define key dates and deliverables for your project.</Text>
                    {validationErrors.milestones && <Text c="red" size="xs">{validationErrors.milestones}</Text>}
                    {milestones.map((milestone, index) => (
                        <Paper key={index} p="sm" withBorder radius="sm" >
                            <Group align="flex-start" wrap="nowrap"> {/* Use wrap="nowrap" */}
                                <Stack gap="xs" style={{ flexGrow: 1 }}>
                                    {/* Apply outline style to TextInput */}
                                    <TextInput
                                        placeholder="Milestone Title (e.g., Phase 1 Complete)"
                                        value={milestone.title}
                                        onChange={(e) => handleMilestoneChange(index, 'title', e.currentTarget.value)}
                                        size="xs"
                                        classNames={{ input: styles.textInputOutline }} // Apply style
                                    />
                                    {/* Apply outline style to DateInput */}
                                    <DateInput
                                        placeholder="Select date"
                                        value={milestone.date ? new Date(milestone.date) : null}
                                        onChange={(dateValue) => handleMilestoneChange(index, 'date', dateValue)}
                                        valueFormat="YYYY-MM-DD"
                                        size="xs"
                                        classNames={{ input: styles.textInputOutline }} // Apply style
                                    />
                                </Stack>
                                <Box pt={5}> {/* Add padding top to align icon */}
                                    <ActionIcon
                                        color="red"
                                        variant="subtle"
                                        onClick={() => removeMilestone(index)}
                                        disabled={milestones.length <= 1 && !milestone.title && !milestone.date} // Allow removing the last row only if it's empty
                                        title="Remove Milestone"
                                    >
                                        <IconTrash size={18} />
                                    </ActionIcon>
                                </Box>
                            </Group>
                        </Paper>
                    ))}
                </Stack>
            </Paper>
            {/* --- End Milestones Section --- */}


            <Group justify="flex-end" mt="md">
                <Button variant="outline" radius="xl" color="mainPurple.6" fw={400} onClick={handleCancel} disabled={isSubmitting} > Cancel </Button>
                <Button color="mainPurple.6" variant="filled" radius="xl" fw={400} onClick={handleCreate} loading={isSubmitting} > Create </Button>
            </Group>
        </Stack>
    );
}