import { useState, useEffect, useCallback } from 'react';
import {
    Container, Stack, Title, Text, Group, Avatar, SimpleGrid, Grid,
    Loader, Alert, Center, Box, ActionIcon, Tooltip, Modal, Button,
    TextInput, Textarea, Select, Paper, useMantineTheme, Divider
} from '@mantine/core';
import { DateInput } from '@mantine/dates'; // Import DateInput
import {
    IconAlertCircle, IconPhoto, IconMail, IconArrowRight, IconTrash,
    IconPointFilled, IconCircleDashed, IconPlus, IconUserPlus, IconCircleCheck,
    IconPencil // Added Pencil Icon
} from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext'; // Adjust path
import { apiClient } from '@utils/apiClient'; // Adjust path
import {
    ProjectDto, ProjectMemberDto, TaskDto, SimpleUserDto, MilestoneDto, // Added MilestoneDto
    CreateTaskDto, AssignTaskDto, UpdateTaskDto, InviteUserDto, ApplicationDto,
    UpdateMilestoneDto // Added UpdateMilestoneDto
} from '../../../types/api'; // Adjust path
import dayjs from 'dayjs';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import classes from './MyProjectDetailsPage.module.css';
import GradientBackground from "@components/shared/GradientBackground/GradientBackground.tsx"; // Adjust path

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
    const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);

    // Add Milestone Modal State
    const [addMilestoneModalOpened, { open: openAddMilestoneModal, close: closeAddMilestoneModal }] = useDisclosure(false);
    const [newMilestoneData, setNewMilestoneData] = useState<{ title: string; date: Date | null }>({ title: '', date: null });
    const [isAddingMilestone, setIsAddingMilestone] = useState(false);
    const [addMilestoneError, setAddMilestoneError] = useState<string | null>(null);

    // Action Processing States
    const [isProcessingMember, setIsProcessingMember] = useState<string | null>(null);
    const [isProcessingTask, setIsProcessingTask] = useState<string | null>(null);
    const [isProcessingMilestone, setIsProcessingMilestone] = useState<string | null>(null); // Added

    // Modals State
    const [inviteModalOpened, { open: openInviteModal, close: closeInviteModal }] = useDisclosure(false);
    const [addTaskModalOpened, { open: openAddTaskModal, close: closeAddTaskModal }] = useDisclosure(false);
    const [assignTaskModalOpened, { open: openAssignTaskModal, close: closeAssignTaskModal }] = useDisclosure(false);
    const [editMilestoneModalOpened, { open: openEditMilestoneModal, close: closeEditMilestoneModal }] = useDisclosure(false); // Added

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

    // Edit Milestone Modal State - Added
    const [editingMilestone, setEditingMilestone] = useState<MilestoneDto | null>(null);
    const [editMilestoneData, setEditMilestoneData] = useState<{ title: string; date: Date | null }>({ title: '', date: null });
    const [isSavingMilestone, setIsSavingMilestone] = useState(false);
    const [editMilestoneError, setEditMilestoneError] = useState<string | null>(null);


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
        setError(null); // Clear previous errors on fetch
        try {
            const data = await apiClient<ProjectDto>(`/projects/${projectId}`);
            // Sort milestones by date before setting state
            data.milestones?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setProjectData(data);

            // If activeMilestoneId is no longer valid (e.g., deleted), reset it
            const currentActiveExists = data.milestones?.some(m => m.id === activeMilestoneId);
            const newActiveMilestoneId = currentActiveExists ? activeMilestoneId : (data.milestones?.find(m => m.active)?.id || data.milestones?.[0]?.id || null);

            setActiveMilestoneId(newActiveMilestoneId);

            // Update selected task based on the potentially new active milestone
            const newActiveMilestone = data.milestones?.find(m => m.id === newActiveMilestoneId);
            setSelectedTask(newActiveMilestone?.tasks?.[0] || null);

        } catch (err: any) {
            console.error(`[MyProjectDetailsPage] Error fetching project ${projectId}:`, err);
            setError(err.data?.message || err.message || 'Failed to load project details.');
            setProjectData(null);
            setActiveMilestoneId(null); // Reset on error
            setSelectedTask(null);
        } finally {
            if (showLoader) setIsLoading(false);
        }
    }, [projectId, activeMilestoneId]); // Include activeMilestoneId to potentially reset if deleted

    // --- User Search for Invite ---
    const searchUsers = useCallback(async () => {
        if (!debouncedInviteSearchQuery || debouncedInviteSearchQuery.length < 2) {
            setInviteSearchResults([]); setIsSearchingUsers(false); return;
        }
        setIsSearchingUsers(true); setInviteError(null);
        try {
            const users = await apiClient<SimpleUserDto[]>(`/users?search=${encodeURIComponent(debouncedInviteSearchQuery)}`);
            const currentMemberIds = new Set(projectData?.members.map(m => m.userId) || []);
            const ownerId = projectData?.owner.id;
            const filteredUsers = users.filter(u => !currentMemberIds.has(u.id) && u.id !== ownerId);
            setInviteSearchResults(filteredUsers);
        } catch (err: any) {
            console.error('[MyProjectDetailsPage] Error searching users:', err);
            setInviteError(err.data?.message || err.message || 'Failed to search users.');
            setInviteSearchResults([]);
        } finally { setIsSearchingUsers(false); }
    }, [debouncedInviteSearchQuery, projectData?.members, projectData?.owner.id]);

    // --- Effects ---
    useEffect(() => {
        if (initialCheckComplete) { fetchProjectDetails(); }
    }, [fetchProjectDetails, initialCheckComplete]);

    useEffect(() => { searchUsers(); }, [searchUsers]);

    // Update selected task when active milestone changes *or* project data reloads
    useEffect(() => {
        const currentActiveMilestone = projectData?.milestones?.find(m => m.id === activeMilestoneId);
        if (currentActiveMilestone) {
            // If the currently selected task is still in the active milestone's tasks, keep it. Otherwise, select the first task or null.
            const taskStillExists = currentActiveMilestone.tasks?.some(t => t.id === selectedTask?.id);
            setSelectedTask(taskStillExists ? selectedTask : (currentActiveMilestone.tasks?.[0] || null));
        } else {
            setSelectedTask(null); // No active milestone, no selected task
        }
    }, [activeMilestoneId, projectData, selectedTask]); // Add selectedTask dependency

    // --- Action Handlers ---
    const handleMilestoneClick = (milestoneId: string) => {
        setActiveMilestoneId(milestoneId);
    };

    // --- Add Milestone Action ---
    const handleAddMilestoneSave = async () => {
        if (!projectId || !isOwner || !newMilestoneData.title || !newMilestoneData.date) {
            setAddMilestoneError("Milestone title and date are required.");
            return;
        }
        setIsAddingMilestone(true); setAddMilestoneError(null);
        try {
            // Use CreateMilestoneInput type if defined, or create payload directly
            const payload: { title: string; date: string } = {
                title: newMilestoneData.title,
                date: newMilestoneData.date.toISOString(), // Send date as ISO string
            };
            // Assuming the endpoint is POST /projects/:projectId/milestones
            await apiClient<MilestoneDto>(`/projects/${projectId}/milestones`, { method: 'POST', body: payload });
            closeAddMilestoneModal();
            setNewMilestoneData({ title: '', date: null }); // Reset form
            fetchProjectDetails(false); // Refetch
        } catch (err: any) {
            console.error(`[MyProjectDetailsPage] Error adding milestone:`, err);
            setAddMilestoneError(err.data?.message || err.message || 'Failed to add milestone.');
        } finally {
            setIsAddingMilestone(false);
        }
    };

    const handleTaskClick = (task: TaskDto) => { setSelectedTask(task); };
    const handleRemoveMember = async (memberUserId: string) => {
        if (!projectId || !isOwner) return;
        if (window.confirm('Are you sure you want to remove this member?')) {
            setIsProcessingMember(memberUserId); setError(null);
            try {
                await apiClient<void>(`/projects/${projectId}/members/${memberUserId}`, { method: 'DELETE' });
                fetchProjectDetails(false);
            } catch (err: any) { setError(err.data?.message || err.message || 'Failed to remove team member.'); }
            finally { setIsProcessingMember(null); }
        }
    };
    const handleInviteMember = async () => {
        if (!inviteUserId || !projectId || !isOwner) { setInviteError("Please select a user to invite."); return; }
        setIsInvitingUser(true); setInviteError(null);
        try {
            const payload: InviteUserDto = { userId: inviteUserId };
            await apiClient<ApplicationDto>(`/projects/${projectId}/invite`, { method: 'POST', body: payload });
            closeInviteModal(); setInviteSearchQuery(''); setInviteUserId(null); setInviteSearchResults([]);
        } catch (err: any) { console.error('[MyProjectDetailsPage] Error inviting member:', err); setInviteError(err.data?.message || err.message || 'Failed to send invitation.'); }
        finally { setIsInvitingUser(false); }
    };
    const handleAddTask = async () => {
        if (!newTaskName.trim() || !activeMilestoneId || !projectId || !isOwner) { setAddTaskError("Task Name is required."); return; }
        setIsAddingTask(true); setAddTaskError(null);
        try {
            const payload: CreateTaskDto = { name: newTaskName.trim(), description: newTaskDescription.trim() || 'No description.' };
            await apiClient<TaskDto>(`/projects/${projectId}/milestones/${activeMilestoneId}/tasks`, { method: 'POST', body: payload });
            closeAddTaskModal(); setNewTaskName(''); setNewTaskDescription(''); fetchProjectDetails(false);
        } catch (err: any) { console.error('[MyProjectDetailsPage] Error adding task:', err); setAddTaskError(err.data?.message || err.message || 'Failed to add task.'); }
        finally { setIsAddingTask(false); }
    };
    const handleOpenAssignTaskModal = (taskId: string, currentAssigneeId: string | null | undefined) => {
        setAssigningTaskId(taskId); setAssignTaskUserId(currentAssigneeId ?? null); setAssignTaskError(null); openAssignTaskModal();
    };
    const handleAssignTaskSave = async () => {
        if (!assigningTaskId || !activeMilestoneId || !projectId || !isOwner) return;
        setIsAssigningTask(true); setAssignTaskError(null);
        try {
            const payload: AssignTaskDto = { assigneeId: assignTaskUserId || null };
            await apiClient<TaskDto>(`/projects/${projectId}/milestones/${activeMilestoneId}/tasks/${assigningTaskId}/assign`, { method: 'PATCH', body: payload });
            closeAssignTaskModal(); fetchProjectDetails(false);
        } catch (err: any) { console.error(`[MyProjectDetailsPage] Error assigning task ${assigningTaskId}:`, err); setAssignTaskError(err.data?.message || err.message || 'Failed to assign task.'); }
        finally { setIsAssigningTask(false); }
    };
    const handleToggleTaskStatus = async (task: TaskDto) => {
        if (!activeMilestoneId || !projectId || !isOwner || isProcessingTask === task.id || task.milestoneId !== activeMilestoneId) return;
        const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
        setIsProcessingTask(task.id); setError(null);
        try {
            const payload: UpdateTaskDto = { status: newStatus };
            await apiClient<TaskDto>(`/projects/${projectId}/milestones/${activeMilestoneId}/tasks/${task.id}`, { method: 'PATCH', body: payload });
            fetchProjectDetails(false);
        } catch (err: any) { console.error(`[MyProjectDetailsPage] Error toggling status for task ${task.id}:`, err); setError(err.data?.message || err.message || 'Failed to update task status.'); }
        finally { setIsProcessingTask(null); }
    };
    const handleDeleteTask = async (taskId: string) => {
        if (!activeMilestoneId || !projectId || !isOwner || isProcessingTask === taskId) return;
        const taskToDelete = activeMilestone?.tasks?.find(t => t.id === taskId);
        if (!taskToDelete) return;
        if (window.confirm('Are you sure you want to delete this task?')) {
            setIsProcessingTask(taskId); setError(null);
            try {
                await apiClient<void>(`/projects/${projectId}/milestones/${activeMilestoneId}/tasks/${taskId}`, { method: 'DELETE' });
                fetchProjectDetails(false);
            } catch (err: any) { console.error(`[MyProjectDetailsPage] Error deleting task ${taskId}:`, err); setError(err.data?.message || err.message || 'Failed to delete task.'); }
            finally { setIsProcessingTask(null); }
        }
    };

    // --- Milestone Actions - Added ---
    const handleOpenEditMilestoneModal = (milestone: MilestoneDto) => {
        setEditingMilestone(milestone);
        setEditMilestoneData({ title: milestone.title, date: new Date(milestone.date) }); // Convert string date to Date object
        setEditMilestoneError(null);
        openEditMilestoneModal();
    };

    const handleEditMilestoneSave = async () => {
        if (!editingMilestone || !projectId || !isOwner || !editMilestoneData.title || !editMilestoneData.date) {
            setEditMilestoneError("Milestone title and date are required.");
            return;
        }
        setIsSavingMilestone(true); setEditMilestoneError(null);
        try {
            const payload: UpdateMilestoneDto = {
                title: editMilestoneData.title,
                date: editMilestoneData.date.toISOString(), // Send date as ISO string
            };
            await apiClient<MilestoneDto>(`/projects/${projectId}/milestones/${editingMilestone.id}`, { method: 'PATCH', body: payload });
            closeEditMilestoneModal();
            fetchProjectDetails(false); // Refetch
        } catch (err: any) {
            console.error(`[MyProjectDetailsPage] Error updating milestone ${editingMilestone.id}:`, err);
            setEditMilestoneError(err.data?.message || err.message || 'Failed to update milestone.');
        } finally {
            setIsSavingMilestone(false);
        }
    };

    const handleDeleteMilestone = async (milestoneId: string) => {
        if (!projectId || !isOwner || isProcessingMilestone === milestoneId) return;
        if (window.confirm('Are you sure you want to delete this milestone and all its tasks?')) {
            setIsProcessingMilestone(milestoneId); setError(null);
            try {
                await apiClient<void>(`/projects/${projectId}/milestones/${milestoneId}`, { method: 'DELETE' });
                // If the deleted milestone was the active one, reset activeMilestoneId
                if (activeMilestoneId === milestoneId) {
                    setActiveMilestoneId(null);
                }
                fetchProjectDetails(false); // Refetch
            } catch (err: any) {
                console.error(`[MyProjectDetailsPage] Error deleting milestone ${milestoneId}:`, err);
                setError(err.data?.message || err.message || 'Failed to delete milestone.');
            } finally {
                setIsProcessingMilestone(null);
            }
        }
    };

    // --- Render Loading/Error ---
    if (isLoading || !initialCheckComplete) { return (<Center style={{ height: '80vh' }}><Loader /></Center>); }
    if (error && !projectData) { return (<Container mt="xl"><Alert title="Error" color="red" icon={<IconAlertCircle />}>{error}</Alert></Container>); }
    if (!projectData) { return (<Container mt="xl"><Alert title="Not Found" color="orange" icon={<IconAlertCircle />}>Project not found or you do not have access.</Alert></Container>); }

    // --- Render Page ---
    return (
        <GradientBackground className={classes.pageWrapper} gradient="linear-gradient(180deg, rgba(55, 197, 231, 0.15) 0%, rgba(255, 255, 255, 1) 40%, rgba(255, 255, 255, 1) 100%)" py="10px">
            <Container size="xl" px="12%" style={{ maxWidth: '100%' }}>
                <Title order={1} className={classes.pageTitle}>My Project Details</Title>

                {error && !editMilestoneModalOpened && !addTaskModalOpened && !assignTaskModalOpened && !inviteModalOpened && ( // Hide general error if a modal has specific error
                    <Alert title="Error" color="red" icon={<IconAlertCircle />} withCloseButton onClose={() => setError(null)} mb="lg"> {error} </Alert>
                )}

                {/* Project Header */}
                <Box className={classes.sectionCardGlass}>
                    <Title order={2} className={classes.projectHeaderTitle}>{projectData.title}</Title>
                    <Text className={classes.projectHeaderDescription}>{projectData.description}</Text>
                </Box>

                {/* Team Members */}
                <Box className={`${classes.greySection} ${classes.fullWidth}`}>
                    <Container size="xl">
                        <Group justify="space-between" mb="lg">
                            <Title order={3} className={classes.sectionTitle} mb={0}>Team Members</Title>
                            {isOwner && (<Button size="xs" onClick={openInviteModal} leftSection={<IconUserPlus size={16} />}> Invite Member </Button>)}
                        </Group>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl">
                            {projectData.members.map((member: ProjectMemberDto) => (
                                <Stack key={member.userId} className={classes.memberCard} gap="xs">
                                    <Avatar src={undefined} size={80} radius="50%" className={classes.memberAvatar}> <IconPhoto size="2rem" color={theme.colors.gray[5]} /> </Avatar>
                                    <Text 
                                        className={classes.memberName}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/profile/${member.userId}`)}
                                    >
                                        {`${member.user.preferredUsername} ${member.user.lastName}`}
                                    </Text>
                                    <Text className={classes.memberRole}>{member.role}</Text>
                                    <Text className={classes.memberDescription}> Lorem ipsum dolor sit amet, consectetur adipiscing elit. </Text>
                                    <Group justify="center" gap="sm" className={classes.memberActions}>
                                        <Tooltip label="Send Message (Not Implemented)"><ActionIcon variant="subtle" color="gray"><IconMail size={18} /></ActionIcon></Tooltip>
                                        <Tooltip label="View Profile"><ActionIcon variant="subtle" color="gray" onClick={() => navigate(`/profile/${member.userId}`)}><IconArrowRight size={18} /></ActionIcon></Tooltip>
                                        {isOwner && member.userId !== projectData.owner.id && (
                                            <Tooltip label="Remove Member">
                                                <ActionIcon variant="subtle" color="red" onClick={() => handleRemoveMember(member.userId)} loading={isProcessingMember === member.userId} disabled={!!isProcessingMember}> <IconTrash size={18} /> </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                </Stack>
                            ))}
                        </SimpleGrid>
                    </Container>
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
                                        <Group // Use Group to place icons at the end
                                            key={milestone.id}
                                            onClick={() => handleMilestoneClick(milestone.id)}
                                            className={`${classes.milestoneItem} ${activeMilestoneId === milestone.id ? classes.milestoneItemActive : ''}`}
                                            justify="space-between" // Push content and actions apart
                                            wrap="nowrap" // Prevent wrapping
                                        >
                                            {/* Milestone Info */}
                                            <Group gap="sm" wrap="nowrap" style={{ flexGrow: 1, overflow: 'hidden' }}>
                                                <Box className={classes.milestoneIcon}>
                                                    {activeMilestoneId === milestone.id ? (<IconPointFilled size={20} />) : (<IconCircleDashed size={20} />)}
                                                </Box>
                                                <Box className={classes.milestoneContent}>
                                                    <Text className={classes.milestoneDate}>{dayjs(milestone.date).format('DD.MM.YYYY')}</Text>
                                                    <Text className={classes.milestoneTitle} lineClamp={2}>{milestone.title}</Text>
                                                </Box>
                                            </Group>

                                            {/* Milestone Actions (Owner Only) - Appear on hover via CSS */}
                                            {isOwner && (
                                                <Group gap={2} className={classes.milestoneActions} wrap="nowrap">
                                                    <Tooltip label="Edit Milestone" withArrow position="top">
                                                        <ActionIcon
                                                            variant="subtle" color="blue" size="sm"
                                                            onClick={(e) => { e.stopPropagation(); handleOpenEditMilestoneModal(milestone); }}
                                                            disabled={isProcessingMilestone === milestone.id}
                                                        > <IconPencil size={16} /> </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Delete Milestone" withArrow position="top">
                                                        <ActionIcon
                                                            variant="subtle" color="red" size="sm"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteMilestone(milestone.id); }}
                                                            loading={isProcessingMilestone === milestone.id}
                                                            disabled={!!isProcessingMilestone}
                                                        > <IconTrash size={16} /> </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            )}
                                        </Group>
                                    ))
                                ) : (<Text c="dimmed" size="sm">No milestones defined yet.</Text>)}
                                {isOwner && (
                                    <Tooltip label="Add Milestone" withArrow position="right">
                                        <ActionIcon
                                            mt="sm"
                                            variant="light"
                                            color="green"
                                            size="lg"
                                            radius="md"
                                            onClick={() => {
                                                setNewMilestoneData({ title: '', date: null });
                                                setAddMilestoneError(null);
                                                openAddMilestoneModal();
                                            }}
                                            // Center the icon within the ActionIcon's container
                                            style={{ alignSelf: 'center' }} // Or adjust layout as needed
                                        >
                                            <IconPlus size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </Stack>
                        </Grid.Col>

                        {/* Right Column: Task Details */}
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Stack className={classes.taskDetailsContainer}>
                                {activeMilestone ? (
                                    <>
                                        <Text className={classes.taskStatus}>{selectedTask ? selectedTask.status : 'Select a task'}</Text>
                                        <Title order={2} className={classes.taskTitle}>{selectedTask ? selectedTask.name : activeMilestone.title}</Title>
                                        <Text className={classes.taskDescription}>{selectedTask ? selectedTask.description : 'Select a task from the list below to see details.'}</Text>
                                        <Divider />
                                        <Title order={4} mt="md" mb="sm">Tasks</Title>
                                        {(activeMilestone.tasks?.length ?? 0) > 0 ? (
                                            <Stack gap="xs">
                                                {activeMilestone.tasks!.map(task => (
                                                    <Paper key={task.id} withBorder p="sm" radius="sm" style={{ cursor: 'pointer' }} onClick={() => handleTaskClick(task)}>
                                                        <Group justify='space-between' wrap='nowrap'>
                                                            <Stack gap={2} className={classes.taskItemContent}>
                                                                <Text fw={500} lineClamp={1} className={classes.taskItemName}>{task.name}</Text>
                                                                {task.assignee && (<Text className={classes.taskAssignee}> Assigned to: {task.assignee.preferredUsername} {task.assignee.lastName} </Text>)}
                                                            </Stack>
                                                            {isOwner && (
                                                                <Group gap="xs" className={classes.taskActions}>
                                                                    <Tooltip label={task.status === 'Done' ? 'Mark To Do' : 'Mark Done'} withArrow><ActionIcon variant='subtle' color={task.status === 'Done' ? 'gray' : 'green'} onClick={(e) => { e.stopPropagation(); handleToggleTaskStatus(task); }} loading={isProcessingTask === task.id} disabled={!!isProcessingTask}> {task.status === 'Done' ? <IconCircleDashed size={18} /> : <IconCircleCheck size={18} />} </ActionIcon></Tooltip>
                                                                    <Tooltip label="Assign User" withArrow><ActionIcon variant='subtle' color='blue' onClick={(e) => { e.stopPropagation(); handleOpenAssignTaskModal(task.id, task.assigneeId); }}> <IconUserPlus size={18} /> </ActionIcon></Tooltip>
                                                                    <Tooltip label="Delete Task" withArrow><ActionIcon variant='subtle' color='red' onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} loading={isProcessingTask === task.id} disabled={!!isProcessingTask}> <IconTrash size={18} /> </ActionIcon></Tooltip>
                                                                </Group>
                                                            )}
                                                        </Group>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        ) : (<Text c="dimmed" size="sm">No tasks for this milestone yet.</Text>)}
                                        {isOwner && (<Button mt="sm" size="xs" variant='light' onClick={openAddTaskModal} leftSection={<IconPlus size={14} />}> Add Task </Button>)}
                                    </>
                                ) : (<Text c="dimmed" size="sm">Select a milestone to view its tasks.</Text>)}
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Box>

                {/* --- Modals --- */}
                {/* Invite Member Modal */}
                <Modal radius="md" opened={inviteModalOpened} onClose={closeInviteModal} title="Invite Member" centered>
                    <Stack>
                        {inviteError && <Alert color="red" title="Invite Error" icon={<IconAlertCircle />} withCloseButton onClose={() => setInviteError(null)}>{inviteError}</Alert>}
                        <Select label="Search User by Name" placeholder="Start typing a name..." data={inviteSearchResults.map(u => ({ value: u.id, label: `${u.preferredUsername} ${u.lastName}` }))} searchable onSearchChange={setInviteSearchQuery} searchValue={inviteSearchQuery} value={inviteUserId} onChange={setInviteUserId} rightSection={isSearchingUsers ? <Loader size="xs" /> : null} nothingFoundMessage="No users found" />
                        <Group justify="flex-end" mt="md"><Button variant="outline" color="mainBlue.6" radius="md" onClick={closeInviteModal} disabled={isInvitingUser}>Cancel</Button><Button color="mainBlue.6" radius="md" onClick={handleInviteMember} loading={isInvitingUser} disabled={!inviteUserId || isInvitingUser}>Send Invitation</Button></Group>
                    </Stack>
                </Modal>

                {/* Add Task Modal */}
                <Modal radius="md" opened={addTaskModalOpened} onClose={closeAddTaskModal} title="Add New Task" centered>
                    <Stack>
                        {addTaskError && <Alert color="red" title="Add Task Error" icon={<IconAlertCircle />} withCloseButton onClose={() => setAddTaskError(null)}>{addTaskError}</Alert>}
                        <TextInput required label="Task Name" placeholder="Enter task name" value={newTaskName} onChange={(e) => setNewTaskName(e.currentTarget.value)} />
                        <Textarea label="Task Description" placeholder="Enter task description" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.currentTarget.value)} minRows={3} />
                        <Group justify="flex-end" mt="md"><Button variant="outline" color="mainBlue.6" radius="md" onClick={closeAddTaskModal} disabled={isAddingTask}>Cancel</Button><Button color="mainBlue.6" onClick={handleAddTask} loading={isAddingTask}>Add Task</Button></Group>
                    </Stack>
                </Modal>

                {/* Assign Task Modal */}
                <Modal radius="md" opened={assignTaskModalOpened} onClose={closeAssignTaskModal} title="Assign Task" centered>
                    <Stack>
                        {assignTaskError && <Alert color="red" title="Assign Task Error" icon={<IconAlertCircle />} withCloseButton onClose={() => setAssignTaskError(null)}>{assignTaskError}</Alert>}
                        <Select label="Assign To" placeholder="Select member or Unassigned" data={memberOptions} value={assignTaskUserId} onChange={setAssignTaskUserId} clearable />
                        <Group justify="flex-end" mt="md"><Button variant="outline" color="mainBlue.6" radius="md" onClick={closeAssignTaskModal} disabled={isAssigningTask}>Cancel</Button><Button color="mainBlue.6" radius="md" onClick={handleAssignTaskSave} loading={isAssigningTask}>Save Assignment</Button></Group>
                    </Stack>
                </Modal>

                {/* Edit Milestone Modal */}
                <Modal opened={editMilestoneModalOpened} onClose={closeEditMilestoneModal} title="Edit Milestone" centered radius="md">
                    <Stack>
                        {editMilestoneError && <Alert color="red" title="Save Error" icon={<IconAlertCircle />} withCloseButton onClose={() => setEditMilestoneError(null)}>{editMilestoneError}</Alert>}
                        <TextInput
                            required label="Milestone Title" placeholder="Enter milestone title"
                            value={editMilestoneData.title}
                            onChange={(e) => setEditMilestoneData(d => ({ ...d, title: e.currentTarget.value }))}
                        />
                        <DateInput
                            required label="Milestone Date" placeholder="Select date"
                            value={editMilestoneData.date}
                            onChange={(date) => setEditMilestoneData(d => ({ ...d, date: date }))}
                            valueFormat="YYYY-MM-DD"
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="outline" color="mainBlue.6" radius="md" onClick={closeEditMilestoneModal} disabled={isSavingMilestone}>Cancel</Button>
                            <Button color="mainBlue.6" radius="md" onClick={handleEditMilestoneSave} loading={isSavingMilestone}>Save Changes</Button>
                        </Group>
                    </Stack>
                </Modal>
                <Modal radius="md" opened={addMilestoneModalOpened} onClose={closeAddMilestoneModal} title="Add New Milestone" centered>
                    <Stack>
                        {addMilestoneError && <Alert color="red" title="Save Error" icon={<IconAlertCircle />} withCloseButton onClose={() => setAddMilestoneError(null)}>{addMilestoneError}</Alert>}
                        <TextInput
                            required label="Milestone Title" placeholder="Enter milestone title"
                            value={newMilestoneData.title}
                            onChange={(e) => setNewMilestoneData(d => ({ ...d, title: e.currentTarget.value }))}
                        />
                        <DateInput
                            required label="Milestone Date" placeholder="Select date"
                            value={newMilestoneData.date}
                            onChange={(date) => setNewMilestoneData(d => ({ ...d, date: date }))}
                            valueFormat="YYYY-MM-DD"
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="outline" color="mainBlue.6" radius="md" onClick={closeAddMilestoneModal} disabled={isAddingMilestone}>Cancel</Button>
                            <Button color="mainBlue.6" radius="md" onClick={handleAddMilestoneSave} loading={isAddingMilestone}>Add Milestone</Button>
                        </Group>
                    </Stack>
                </Modal>

            </Container>
        </GradientBackground>
    );
}

