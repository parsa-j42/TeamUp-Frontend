import { useState, useEffect, useCallback } from 'react';
import {
    Container, Stack, Title, Text, Group, Avatar, SimpleGrid, Grid,
    Loader, Alert, Center, Box, ActionIcon, Tooltip, Modal, Button,
    TextInput, Textarea, Select, Paper, useMantineTheme, Divider
} from '@mantine/core';
import {
    IconAlertCircle, IconPhoto, IconMail, IconArrowRight, IconTrash,
    IconPointFilled, IconCircleDashed, IconPlus, IconUserPlus, IconCircleCheck,
} from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { apiClient } from '@utils/apiClient';
import {
    ProjectDto, ProjectMemberDto, TaskDto, SimpleUserDto,
    CreateTaskDto, AssignTaskDto, UpdateTaskDto, InviteUserDto, ApplicationDto // Added Invite/App DTOs
} from '../../../types/api'; // Adjust path
import dayjs from 'dayjs';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks'; // Added hooks for modals
import classes from './MyProjectDetailsPage.module.css';
import GradientBackground from "@components/shared/GradientBackground/GradientBackground.tsx";

export default function MyProjectDetailsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const { userDetails, initialCheckComplete } = useAuth();

    // --- State ---
    const [projectData, setProjectData] = useState<ProjectDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null); // Task to show details for

    // Action Processing States
    const [isProcessingMember, setIsProcessingMember] = useState<string | null>(null); // memberUserId
    const [isProcessingTask, setIsProcessingTask] = useState<string | null>(null); // taskId

    // Modals State (similar to Dashboard)
    const [inviteModalOpened, { open: openInviteModal, close: closeInviteModal }] = useDisclosure(false);
    const [addTaskModalOpened, { open: openAddTaskModal, close: closeAddTaskModal }] = useDisclosure(false);
    const [assignTaskModalOpened, { open: openAssignTaskModal, close: closeAssignTaskModal }] = useDisclosure(false);

    // Invite Modal State
    const [inviteSearchQuery, setInviteSearchQuery] = useState('');
    const [debouncedInviteSearchQuery] = useDebouncedValue(inviteSearchQuery, 300);
    const [inviteSearchResults, setInviteSearchResults] = useState<SimpleUserDto[]>([]);
    const [inviteUserId, setInviteUserId] = useState<string | null>(null);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [isInvitingUser, setIsInvitingUser] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);

    // Add Task Modal State
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [addTaskError, setAddTaskError] = useState<string | null>(null);

    // Assign Task Modal State
    const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);
    const [assignTaskUserId, setAssignTaskUserId] = useState<string | null>(null);
    const [assignTaskError, setAssignTaskError] = useState<string | null>(null);
    const [isAssigningTask, setIsAssigningTask] = useState(false);

    // --- Computed Values ---
    const isOwner = !!userDetails && !!projectData && userDetails.id === projectData.owner.id;
    const activeMilestone = projectData?.milestones?.find(m => m.id === activeMilestoneId);
    const memberOptions = [
        { value: '', label: 'Unassigned' },
        ...(projectData?.members.map(member => ({
            value: member.userId,
            label: `${member.user.preferredUsername} ${member.user.lastName}`
        })) || [])
    ];

    // --- Data Fetching ---
    const fetchProjectDetails = useCallback(async (showLoader = true) => {
        if (!projectId) {
            setError("Project ID is missing.");
            setIsLoading(false);
            return;
        }
        if (showLoader) setIsLoading(true);
        setError(null);
        try {
            const data = await apiClient<ProjectDto>(`/projects/${projectId}`);
            setProjectData(data);
            // Set initial active milestone (first one or the one marked active)
            const initiallyActive = data.milestones?.find(m => m.active) || data.milestones?.[0];
            if (initiallyActive) {
                setActiveMilestoneId(initiallyActive.id);
                // Select the first task of the active milestone initially
                setSelectedTask(initiallyActive.tasks?.[0] || null);
            } else {
                setActiveMilestoneId(null);
                setSelectedTask(null);
            }
        } catch (err: any) {
            console.error(`[MyProjectDetailsPage] Error fetching project ${projectId}:`, err);
            setError(err.data?.message || err.message || 'Failed to load project details.');
            setProjectData(null);
        } finally {
            if (showLoader) setIsLoading(false);
        }
    }, [projectId]);

    // --- User Search for Invite ---
    const searchUsers = useCallback(async () => {
        if (!debouncedInviteSearchQuery || debouncedInviteSearchQuery.length < 2) {
            setInviteSearchResults([]);
            setIsSearchingUsers(false);
            return;
        }
        setIsSearchingUsers(true);
        setInviteError(null);
        try {
            const users = await apiClient<SimpleUserDto[]>(`/users?search=${encodeURIComponent(debouncedInviteSearchQuery)}`);
            const currentMemberIds = new Set(projectData?.members.map(m => m.userId) || []);
            const ownerId = projectData?.owner.id;
            // Filter out current members and the owner
            const filteredUsers = users.filter(u => !currentMemberIds.has(u.id) && u.id !== ownerId);
            setInviteSearchResults(filteredUsers);
        } catch (err: any) {
            console.error('[MyProjectDetailsPage] Error searching users:', err);
            setInviteError(err.data?.message || err.message || 'Failed to search users.');
            setInviteSearchResults([]);
        } finally {
            setIsSearchingUsers(false);
        }
    }, [debouncedInviteSearchQuery, projectData?.members, projectData?.owner.id]);

    // --- Effects ---
    useEffect(() => {
        if (initialCheckComplete) {
            fetchProjectDetails();
        }
    }, [fetchProjectDetails, initialCheckComplete]);

    useEffect(() => {
        searchUsers();
    }, [searchUsers]);

    // Update selected task when active milestone changes
    useEffect(() => {
        if (activeMilestone) {
            setSelectedTask(activeMilestone.tasks?.[0] || null);
        } else {
            setSelectedTask(null);
        }
    }, [activeMilestoneId, projectData]); // Re-run when milestoneId or projectData changes

    // --- Action Handlers ---
    const handleMilestoneClick = (milestoneId: string) => {
        setActiveMilestoneId(milestoneId);
        // setSelectedTask will be updated by the useEffect above
    };

    const handleTaskClick = (task: TaskDto) => {
        setSelectedTask(task);
    };

    const handleRemoveMember = async (memberUserId: string) => {
        if (!projectId || !isOwner) return;
        if (window.confirm('Are you sure you want to remove this member?')) {
            setIsProcessingMember(memberUserId); setError(null);
            try {
                await apiClient<void>(`/projects/${projectId}/members/${memberUserId}`, { method: 'DELETE' });
                fetchProjectDetails(false); // Refetch without main loader
            } catch (err: any) {
                setError(err.data?.message || err.message || 'Failed to remove team member.');
            } finally {
                setIsProcessingMember(null);
            }
        }
    };

    const handleInviteMember = async () => {
        if (!inviteUserId || !projectId || !isOwner) {
            setInviteError("Please select a user to invite.");
            return;
        }
        setIsInvitingUser(true); setInviteError(null);
        try {
            const payload: InviteUserDto = { userId: inviteUserId };
            await apiClient<ApplicationDto>(`/projects/${projectId}/invite`, { method: 'POST', body: payload });
            closeInviteModal();
            // Optionally show a success notification
            setInviteSearchQuery(''); setInviteUserId(null); setInviteSearchResults([]);
            // No need to refetch project details just for an invite
        } catch (err: any) {
            console.error('[MyProjectDetailsPage] Error inviting member:', err);
            setInviteError(err.data?.message || err.message || 'Failed to send invitation.');
        } finally {
            setIsInvitingUser(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskName.trim() || !activeMilestoneId || !projectId || !isOwner) {
            setAddTaskError("Task Name is required.");
            return;
        }
        setIsAddingTask(true); setAddTaskError(null);
        try {
            const payload: CreateTaskDto = {
                name: newTaskName.trim(),
                description: newTaskDescription.trim() || 'No description.', // Add default description if empty
                // Assignee selection is handled separately via assign modal/button
            };
            await apiClient<TaskDto>(`/projects/${projectId}/milestones/${activeMilestoneId}/tasks`, { method: 'POST', body: payload });
            closeAddTaskModal();
            setNewTaskName(''); setNewTaskDescription('');
            fetchProjectDetails(false); // Refetch project details
        } catch (err: any) {
            console.error('[MyProjectDetailsPage] Error adding task:', err);
            setAddTaskError(err.data?.message || err.message || 'Failed to add task.');
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleOpenAssignTaskModal = (taskId: string, currentAssigneeId: string | null | undefined) => {
        setAssigningTaskId(taskId);
        setAssignTaskUserId(currentAssigneeId ?? null);
        setAssignTaskError(null);
        openAssignTaskModal();
    };

    const handleAssignTaskSave = async () => {
        if (!assigningTaskId || !activeMilestoneId || !projectId || !isOwner) return;
        setIsAssigningTask(true); setAssignTaskError(null);
        try {
            const payload: AssignTaskDto = { assigneeId: assignTaskUserId || null };
            await apiClient<TaskDto>(`/projects/${projectId}/milestones/${activeMilestoneId}/tasks/${assigningTaskId}/assign`, {
                method: 'PATCH', body: payload
            });
            closeAssignTaskModal();
            fetchProjectDetails(false); // Refetch project details
        } catch (err: any) {
            console.error(`[MyProjectDetailsPage] Error assigning task ${assigningTaskId}:`, err);
            setAssignTaskError(err.data?.message || err.message || 'Failed to assign task.');
        } finally {
            setIsAssigningTask(false);
        }
    };

    const handleToggleTaskStatus = async (task: TaskDto) => {
        if (!activeMilestoneId || !projectId || !isOwner || isProcessingTask === task.id) return;

        // Only allow toggling if the task belongs to the *active* milestone
        if (task.milestoneId !== activeMilestoneId) {
            console.warn("Attempted to toggle task status for a task not in the active milestone.");
            return;
        }

        const newStatus = task.status === 'Done' ? 'To Do' : 'Done'; // Simple toggle logic
        setIsProcessingTask(task.id); setError(null);

        try {
            const payload: UpdateTaskDto = { status: newStatus };
            await apiClient<TaskDto>(`/projects/${projectId}/milestones/${activeMilestoneId}/tasks/${task.id}`, {
                method: 'PATCH', body: payload
            });
            fetchProjectDetails(false); // Refetch project details
        } catch (err: any) {
            console.error(`[MyProjectDetailsPage] Error toggling status for task ${task.id}:`, err);
            setError(err.data?.message || err.message || 'Failed to update task status.');
        } finally {
            setIsProcessingTask(null);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!activeMilestoneId || !projectId || !isOwner || isProcessingTask === taskId) return;

        // Ensure the task belongs to the active milestone before deleting
        const taskToDelete = activeMilestone?.tasks?.find(t => t.id === taskId);
        if (!taskToDelete) {
            console.warn("Attempted to delete a task not in the active milestone.");
            return;
        }

        if (window.confirm('Are you sure you want to delete this task?')) {
            setIsProcessingTask(taskId); setError(null);
            try {
                await apiClient<void>(`/projects/${projectId}/milestones/${activeMilestoneId}/tasks/${taskId}`, { method: 'DELETE' });
                fetchProjectDetails(false); // Refetch project details
            } catch (err: any) {
                console.error(`[MyProjectDetailsPage] Error deleting task ${taskId}:`, err);
                setError(err.data?.message || err.message || 'Failed to delete task.');
            } finally {
                setIsProcessingTask(null);
            }
        }
    };

    // --- Render Loading/Error ---
    if (isLoading || !initialCheckComplete) {
        return (<Center style={{ height: '80vh' }}><Loader /></Center>);
    }
    if (error && !projectData) {
        return (<Container mt="xl"><Alert title="Error" color="red" icon={<IconAlertCircle />}>{error}</Alert></Container>);
    }
    if (!projectData) {
        return (<Container mt="xl"><Alert title="Not Found" color="orange" icon={<IconAlertCircle />}>Project not found or you do not have access.</Alert></Container>);
    }

    // --- Render Page ---
    return (
        <Container fluid className={classes.pageWrapper}>
            <Container size="lg">
                <GradientBackground gradient="linear-gradient(180deg, rgba(55, 197, 231, 0.3) 0%,
                rgba(55, 197, 231, 0.3) 70%, rgba(255, 255, 255, 1) 100%)" py="10px">
                    <Title order={1} className={classes.pageTitle}>My Project Details</Title>
                </GradientBackground>

                {/* General Error Display */}
                {error && (
                    <Alert title="Error" color="red" icon={<IconAlertCircle />} withCloseButton onClose={() => setError(null)} mb="lg">
                        {error}
                    </Alert>
                )}

                {/* Project Header */}
                <Box className={classes.sectionCard}>
                    <Title order={2} className={classes.projectHeaderTitle}>{projectData.title}</Title>
                    <Text className={classes.projectHeaderDescription}>{projectData.description}</Text>
                </Box>

                {/* Team Members */}
                <Box className={classes.sectionCard}>
                    <Group justify="space-between" mb="lg">
                        <Title order={3} className={classes.sectionTitle} mb={0}>Team Members</Title>
                        {isOwner && (
                            <Button size="xs" onClick={openInviteModal} leftSection={<IconUserPlus size={16} />}>
                                Invite Member
                            </Button>
                        )}
                    </Group>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl">
                        {projectData.members.map((member: ProjectMemberDto) => (
                            <Stack key={member.userId} className={classes.memberCard} gap="xs">
                                <Avatar src={undefined /* member.user.avatarUrl */} size={80} radius="50%" className={classes.memberAvatar}>
                                    <IconPhoto size="2rem" color={theme.colors.gray[5]} />
                                </Avatar>
                                <Text className={classes.memberName}>{`${member.user.preferredUsername} ${member.user.lastName}`}</Text>
                                <Text className={classes.memberRole}>{member.role}</Text>
                                <Text className={classes.memberDescription}>
                                    {/* Placeholder description - replace if profile data is available */}
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                </Text>
                                <Group justify="center" gap="sm" className={classes.memberActions}>
                                    <Tooltip label="Send Message (Not Implemented)">
                                        <ActionIcon variant="subtle" color="gray"><IconMail size={18} /></ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="View Profile">
                                        <ActionIcon variant="subtle" color="gray" onClick={() => navigate(`/profile/${member.userId}`)}>
                                            <IconArrowRight size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                    {isOwner && member.userId !== projectData.owner.id && (
                                        <Tooltip label="Remove Member">
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() => handleRemoveMember(member.userId)}
                                                loading={isProcessingMember === member.userId}
                                                disabled={!!isProcessingMember}
                                            >
                                                <IconTrash size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </Group>
                            </Stack>
                        ))}
                    </SimpleGrid>
                </Box>

                {/* Project Scope and Milestones / Tasks */}
                <Box className={classes.sectionCard}>
                    <Title order={3} className={classes.sectionTitle}>Project Scope and Milestones</Title>
                    <Grid gutter="xl">
                        {/* Left Column: Milestones List */}
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Stack gap="xs" className={classes.milestoneListContainer}>
                                {(projectData.milestones?.length ?? 0) > 0 ? (
                                    projectData.milestones!.map((milestone) => (
                                        <Box
                                            key={milestone.id}
                                            onClick={() => handleMilestoneClick(milestone.id)}
                                            className={`${classes.milestoneItem} ${activeMilestoneId === milestone.id ? classes.milestoneItemActive : ''}`}
                                        >
                                            <Box className={classes.milestoneIcon}>
                                                {activeMilestoneId === milestone.id ? (
                                                    <IconPointFilled size={20} />
                                                ) : (
                                                    <IconCircleDashed size={20} />
                                                )}
                                            </Box>
                                            <Box className={classes.milestoneContent}>
                                                <Text className={classes.milestoneDate}>
                                                    {dayjs(milestone.date).format('DD.MM.YYYY')}
                                                </Text>
                                                <Text className={classes.milestoneTitle} lineClamp={2}>
                                                    {milestone.title}
                                                </Text>
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    <Text c="dimmed" size="sm">No milestones defined yet.</Text>
                                )}
                                {isOwner && (
                                    <Button mt="sm" size="xs" variant='light' onClick={() => {/* TODO: Open Add Milestone Modal */}}>
                                        Add Milestone
                                    </Button>
                                )}
                            </Stack>
                        </Grid.Col>

                        {/* Right Column: Task Details */}
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Stack className={classes.taskDetailsContainer}>
                                {activeMilestone ? (
                                    <>
                                        <Text className={classes.taskStatus}>
                                            {selectedTask ? selectedTask.status : 'Select a task'}
                                        </Text>
                                        <Title order={2} className={classes.taskTitle}>
                                            {selectedTask ? selectedTask.name : activeMilestone.title}
                                        </Title>
                                        <Text className={classes.taskDescription}>
                                            {selectedTask ? selectedTask.description : 'Select a task from the list below to see details.'}
                                        </Text>
                                        <Divider />
                                        <Title order={4} mt="md" mb="sm">Tasks</Title>
                                        {(activeMilestone.tasks?.length ?? 0) > 0 ? (
                                            <Stack gap="xs">
                                                {activeMilestone.tasks!.map(task => (
                                                    <Paper key={task.id} withBorder p="sm" radius="sm" style={{cursor: 'pointer'}} onClick={() => handleTaskClick(task)}>
                                                        <Group justify='space-between' wrap='nowrap'>
                                                            <Stack gap={2} className={classes.taskItemContent}>
                                                                <Text fw={500} lineClamp={1} className={classes.taskItemName}>{task.name}</Text>
                                                                {task.assignee && (
                                                                    <Text className={classes.taskAssignee}>
                                                                        Assigned to: {task.assignee.preferredUsername} {task.assignee.lastName}
                                                                    </Text>
                                                                )}
                                                            </Stack>
                                                            {isOwner && (
                                                                <Group gap="xs" className={classes.taskActions}>
                                                                    <Tooltip label={task.status === 'Done' ? 'Mark To Do' : 'Mark Done'} withArrow>
                                                                        <ActionIcon
                                                                            variant='subtle'
                                                                            color={task.status === 'Done' ? 'gray' : 'green'}
                                                                            onClick={(e) => { e.stopPropagation(); handleToggleTaskStatus(task); }}
                                                                            loading={isProcessingTask === task.id}
                                                                            disabled={!!isProcessingTask}
                                                                        >
                                                                            {task.status === 'Done' ? <IconCircleDashed size={18}/> : <IconCircleCheck size={18}/>}
                                                                        </ActionIcon>
                                                                    </Tooltip>
                                                                    <Tooltip label="Assign User" withArrow>
                                                                        <ActionIcon variant='subtle' color='blue' onClick={(e) => { e.stopPropagation(); handleOpenAssignTaskModal(task.id, task.assigneeId); }}>
                                                                            <IconUserPlus size={18}/>
                                                                        </ActionIcon>
                                                                    </Tooltip>
                                                                    <Tooltip label="Delete Task" withArrow>
                                                                        <ActionIcon variant='subtle' color='red' onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} loading={isProcessingTask === task.id} disabled={!!isProcessingTask}>
                                                                            <IconTrash size={18}/>
                                                                        </ActionIcon>
                                                                    </Tooltip>
                                                                </Group>
                                                            )}
                                                        </Group>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Text c="dimmed" size="sm">No tasks for this milestone yet.</Text>
                                        )}
                                        {isOwner && (
                                            <Button mt="sm" size="xs" variant='light' onClick={openAddTaskModal} leftSection={<IconPlus size={14}/>}>
                                                Add Task
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <Text c="dimmed" size="sm">Select a milestone to view its tasks.</Text>
                                )}
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Box>

                {/* --- Modals --- */}
                {/* Invite Member Modal */}
                <Modal opened={inviteModalOpened} onClose={closeInviteModal} title="Invite Member" centered>
                    <Stack>
                        {inviteError && <Alert color="red" title="Invite Error" icon={<IconAlertCircle />} withCloseButton onClose={() => setInviteError(null)}>{inviteError}</Alert>}
                        {/* Replace Autocomplete with Select if needed, or keep Autocomplete */}
                        <Select
                            label="Search User by Name"
                            placeholder="Start typing a name..."
                            data={inviteSearchResults.map(u => ({ value: u.id, label: `${u.preferredUsername} ${u.lastName}` }))}
                            searchable
                            onSearchChange={setInviteSearchQuery}
                            searchValue={inviteSearchQuery}
                            value={inviteUserId}
                            onChange={setInviteUserId}
                            rightSection={isSearchingUsers ? <Loader size="xs" /> : null}
                            nothingFoundMessage="No users found"
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeInviteModal} disabled={isInvitingUser}>Cancel</Button>
                            <Button color="blue" onClick={handleInviteMember} loading={isInvitingUser} disabled={!inviteUserId || isInvitingUser}>Send Invitation</Button>
                        </Group>
                    </Stack>
                </Modal>

                {/* Add Task Modal */}
                <Modal opened={addTaskModalOpened} onClose={closeAddTaskModal} title="Add New Task" centered>
                    <Stack>
                        {addTaskError && <Alert color="red" title="Add Task Error" icon={<IconAlertCircle />} withCloseButton onClose={() => setAddTaskError(null)}>{addTaskError}</Alert>}
                        <TextInput required label="Task Name" placeholder="Enter task name" value={newTaskName} onChange={(e) => setNewTaskName(e.currentTarget.value)} />
                        <Textarea label="Task Description" placeholder="Enter task description" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.currentTarget.value)} minRows={3} />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeAddTaskModal} disabled={isAddingTask}>Cancel</Button>
                            <Button color="blue" onClick={handleAddTask} loading={isAddingTask}>Add Task</Button>
                        </Group>
                    </Stack>
                </Modal>

                {/* Assign Task Modal */}
                <Modal opened={assignTaskModalOpened} onClose={closeAssignTaskModal} title="Assign Task" centered>
                    <Stack>
                        {assignTaskError && <Alert color="red" title="Assign Task Error" icon={<IconAlertCircle />} withCloseButton onClose={() => setAssignTaskError(null)}>{assignTaskError}</Alert>}
                        <Select
                            label="Assign To"
                            placeholder="Select member or Unassigned"
                            data={memberOptions}
                            value={assignTaskUserId}
                            onChange={setAssignTaskUserId}
                            clearable
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeAssignTaskModal} disabled={isAssigningTask}>Cancel</Button>
                            <Button color="blue" onClick={handleAssignTaskSave} loading={isAssigningTask}>Save Assignment</Button>
                        </Group>
                    </Stack>
                </Modal>

            </Container>
        </Container>
    );
}