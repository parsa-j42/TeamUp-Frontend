import { useState, useEffect, useCallback } from 'react';
import {
    Box, Stack, useMantineTheme, Title, Text, Group, Avatar, SimpleGrid, ActionIcon,
    Timeline, Paper, ThemeIcon, Divider, Button, Select, SegmentedControl,
    Loader, Alert, Center, Container, Badge
} from '@mantine/core';
import {
    IconClock, IconArrowRight, IconTrash, IconPhoto, IconPointFilled,
    IconCircleDashed, IconChevronDown, IconAlertCircle
} from '@tabler/icons-react';
import WavyBackground from '@components/shared/WavyBackground/WavyBackground.tsx'; // Adjust path
// Removed MyProjectList import as we are using Select for now
import { useNavigate } from "react-router-dom";
import { apiClient } from '@utils/apiClient'; // Adjust path
import { useAuth } from '@contexts/AuthContext'; // Adjust path
import { ProjectDto, ApplicationDto, FindApplicationsQueryDto, UpdateApplicationStatusPayload, ProjectMemberDto } from '../../../types/api'; // Adjust path
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TOP_WAVE_PATH = "M 0,60 Q 15,100 40,81 C 60,70 80,0 130,20 L 100,0 L 0,0 Z";

export default function DashboardPage() {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const { userDetails, isLoading: isAuthLoading, initialCheckComplete } = useAuth();

    // --- State ---
    const [myProjects, setMyProjects] = useState<ProjectDto[]>([]); // User's projects for the dropdown
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedProjectData, setSelectedProjectData] = useState<ProjectDto | null>(null);
    const [applications, setApplications] = useState<ApplicationDto[]>([]);
    const [applicationFilter, setApplicationFilter] = useState<'received' | 'sent'>('received');
    const [isLoadingMyProjects, setIsLoadingMyProjects] = useState(true); // Loading state for the project list/select
    const [isLoadingSelectedProject, setIsLoadingSelectedProject] = useState(false);
    const [isLoadingApplications, setIsLoadingApplications] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);

    // --- Data Fetching ---
    const fetchMyProjects = useCallback(async () => {
        console.log('[Dashboard] Fetching my projects...');
        setIsLoadingMyProjects(true); setError(null); // Use specific loading state
        try {
            const data = await apiClient<ProjectDto[]>('/projects/me');
            setMyProjects(data);
            // If no project is currently selected AND projects were fetched, select the first one
            if (!selectedProjectId && data.length > 0) {
                setSelectedProjectId(data[0].id);
            } else if (data.length === 0) {
                // Clear selection if user has no projects
                setSelectedProjectId(null);
                setSelectedProjectData(null);
            }
        } catch (err: any) {
            console.error('[Dashboard] Error fetching my projects:', err);
            setError(err.data?.message || err.message || 'Failed to load your projects.');
            setMyProjects([]); // Clear projects on error
        } finally {
            setIsLoadingMyProjects(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Fetch only once on initial load based on auth state below

    const fetchSelectedProjectDetails = useCallback(async () => {
        if (!selectedProjectId) {
            setSelectedProjectData(null); return;
        }
        console.log(`[Dashboard] Fetching details for project ID: ${selectedProjectId}`);
        setIsLoadingSelectedProject(true); setError(null);
        try {
            const data = await apiClient<ProjectDto>(`/projects/${selectedProjectId}`);
            setSelectedProjectData(data);
        } catch (err: any) {
            console.error(`[Dashboard] Error fetching project ${selectedProjectId} details:`, err);
            setError(err.data?.message || err.message || 'Failed to load selected project details.');
            setSelectedProjectData(null);
        } finally { setIsLoadingSelectedProject(false); }
    }, [selectedProjectId]);

    const fetchApplications = useCallback(async () => {
        if (!initialCheckComplete || !userDetails) return;
        console.log(`[Dashboard] Fetching applications with filter: ${applicationFilter}, project: ${selectedProjectId || 'All'}`);
        setIsLoadingApplications(true); setError(null);
        try {
            const queryParams: FindApplicationsQueryDto = {
                filter: applicationFilter,
                projectId: selectedProjectId ?? undefined, // Filter by selected project ID
                take: 50,
            };
            Object.keys(queryParams).forEach(key => queryParams[key as keyof FindApplicationsQueryDto] === undefined && delete queryParams[key as keyof FindApplicationsQueryDto]);
            const params = new URLSearchParams(queryParams as any).toString();
            const data = await apiClient<{ applications: ApplicationDto[], total: number }>(`/applications?${params}`);
            setApplications(data.applications);
        } catch (err: any) {
            console.error('[Dashboard] Error fetching applications:', err);
            setError(err.data?.message || err.message || 'Failed to load applications.');
            setApplications([]);
        } finally { setIsLoadingApplications(false); }
    }, [applicationFilter, selectedProjectId, initialCheckComplete, userDetails]);

    // --- Initial Data Load ---
    useEffect(() => {
        if (initialCheckComplete && userDetails) {
            fetchMyProjects();
        }
    }, [initialCheckComplete, userDetails, fetchMyProjects]);

    // --- Fetch Details when Selection Changes ---
    useEffect(() => {
        if (initialCheckComplete && userDetails) { // Ensure user is loaded before fetching details
            fetchSelectedProjectDetails();
        }
    }, [fetchSelectedProjectDetails, initialCheckComplete, userDetails]);

    // --- Fetch Applications when Filter or Selected Project Changes ---
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // --- Event Handlers ---
    const handleProjectSelection = (value: string | null) => { // Renamed handler
        console.log("[Dashboard] Project selection changed:", value);
        setSelectedProjectId(value);
    };

    const handleApplicationStatusUpdate = async (applicationId: string, status: 'Accepted' | 'Declined') => {
        setIsProcessingAction(applicationId); setError(null);
        console.log(`[Dashboard] Updating application ${applicationId} status to ${status}`);
        try {
            const payload: UpdateApplicationStatusPayload = { status };
            await apiClient<ApplicationDto>(`/applications/${applicationId}/status`, { method: 'PATCH', body: payload });
            fetchApplications(); // Refresh applications list
            if (status === 'Accepted') { fetchSelectedProjectDetails(); } // Refresh project members if accepted
        } catch (err: any) { setError(err.data?.message || err.message || `Failed to ${status.toLowerCase()} application.`); }
        finally { setIsProcessingAction(null); }
    };

    const handleRemoveMember = async (projectId: string, memberUserId: string) => {
        setIsProcessingAction(memberUserId); setError(null);
        console.log(`[Dashboard] Removing member ${memberUserId} from project ${projectId}`);
        try {
            await apiClient<void>(`/projects/${projectId}/members/${memberUserId}`, { method: 'DELETE' });
            fetchSelectedProjectDetails(); // Refresh project members
        } catch (err: any) { setError(err.data?.message || err.message || 'Failed to remove team member.'); }
        finally { setIsProcessingAction(null); }
    };

    // --- Helper Functions ---
    const formatProjectDateRange = (start?: string, end?: string): string => {
        if (!start) return 'Date not set';
        const startDate = dayjs(start).format('MMM YYYY');
        const endDate = end ? dayjs(end).format('MMM YYYY') : 'Present';
        return `${startDate} - ${endDate}`;
    };

    // --- Render Loading/Error States ---
    if (isAuthLoading || !initialCheckComplete) { return ( <Center style={{ height: '80vh' }}> <Loader /> </Center> ); }
    if (!userDetails) { return ( <Container><Alert color="red" title="Error">Could not load user details. Please try logging in again.</Alert></Container> ); }

    // --- Prepare data for rendering ---
    // FIX: Explicitly type 'p' and use myProjects state
    const projectOptions = myProjects.map((p: ProjectDto) => ({ value: p.id, label: p.title }));
    const displayProject = selectedProjectData;
    const currentUserId = userDetails.id;

    // --- Wave Background Setup ---
    const topWaveHeight = 500;
    const topWaveEdgeRatio = -10 / 100;
    const topWaveOffset = topWaveHeight * topWaveEdgeRatio;
    const topSectionPadding = `calc(${topWaveOffset}px + ${theme.spacing.xl})`;

    return (
        <Stack gap={0} mb="xl">
            {/* Top Section */}
            <WavyBackground wavePath={TOP_WAVE_PATH} waveHeight={topWaveHeight} backgroundColor={theme.colors.mainPurple[6]} contentPaddingTop={topSectionPadding} extraBottomPadding="0px" >
                {/* Project Selection List */}
                <Box pt="0px" pb="50px" px="xl">
                    <Select
                        label={<Title order={3} c="white" mb="xs">My Projects</Title>}
                        placeholder="Select a project to view details"
                        data={projectOptions} // Use mapped options
                        value={selectedProjectId}
                        onChange={handleProjectSelection} // Use correct handler name
                        searchable
                        clearable
                        nothingFoundMessage="No projects found"
                        disabled={isLoadingMyProjects} // Use correct loading state
                        styles={{ label: { color: 'white' }, input: { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,0.3)' } }}
                        mb="xl"
                    />
                </Box>

                {/* Project Details Section */}
                {isLoadingSelectedProject && <Center><Loader color="white" my="xl" /></Center>}
                {!isLoadingSelectedProject && error && !displayProject && <Alert color="red" title="Error" icon={<IconAlertCircle />} m="xl">{error}</Alert>}
                {!isLoadingSelectedProject && !displayProject && selectedProjectId && !error && <Text c="dimmed" ta="center" m="xl">Selected project details could not be loaded.</Text>}
                {!isLoadingSelectedProject && !displayProject && !selectedProjectId && !error && !isLoadingMyProjects && myProjects.length > 0 && <Text c="dimmed" ta="center" m="xl">Select a project from the list above to see details.</Text>}
                {!isLoadingSelectedProject && !displayProject && !selectedProjectId && !error && !isLoadingMyProjects && myProjects.length === 0 && <Text c="dimmed" ta="center" m="xl">You are not part of any projects yet.</Text>}

                {!isLoadingSelectedProject && displayProject && (
                    <Stack gap="xl" c="white" pb="xl" px="xl">
                        {/* Project Info */}
                        <Stack gap="xs">
                            <Group gap="xs"> <IconClock size={16} /> <Text size="sm">{formatProjectDateRange(displayProject.startDate, displayProject.endDate)}</Text> </Group>
                            <Title order={1} fw={500}>{displayProject.title}</Title>
                            <Text size="sm" maw={600}>{displayProject.description}</Text>
                        </Stack>

                        {/* Team Members */}
                        <Stack gap="md">
                            <Title order={3} fw={500}>Team Members</Title>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                                {displayProject.members.map((member: ProjectMemberDto) => (
                                    <Stack key={member.id} gap="xs" align="left" ta="left">
                                        <Avatar src={undefined /* member.user.avatarUrl? */} radius="50%" size={80} color="gray.3"> <IconPhoto size="2rem" color={theme.colors.mainPurple[1]} /> </Avatar>
                                        <Text fw={500} size="md">{`${member.user.firstName} ${member.user.lastName}`}</Text>
                                        <Text size="sm" c="gray.4">{member.role}</Text>
                                        <Group gap="sm" mt="xs" justify="flex-start">
                                            {/* FIX: Removed mailto link */}
                                            {/* <ActionIcon component="a" href={`mailto:${member.user.email}`} variant="transparent" color="white" title={`Email ${member.user.firstName}`}> <IconMail size={18} /> </ActionIcon> */}
                                            <ActionIcon variant="transparent" color="white" title={`View ${member.user.firstName}'s Profile`} onClick={() => navigate(`/profile/${member.userId}`)} /* Update route if needed */ > <IconArrowRight size={18} /> </ActionIcon>
                                            {currentUserId === displayProject.owner.id && member.userId !== displayProject.owner.id && (
                                                <ActionIcon variant="transparent" color="red" title={`Remove ${member.user.firstName}`} onClick={() => handleRemoveMember(displayProject.id, member.userId)} loading={isProcessingAction === member.userId} disabled={!!isProcessingAction}> <IconTrash size={18} /> </ActionIcon>
                                            )}
                                        </Group>
                                    </Stack>
                                ))}
                            </SimpleGrid>
                        </Stack>

                        {/* Project Scope and Milestones */}
                        <Stack gap="md" mt="xl">
                            <Title order={3} fw={500}>Project Scope and Milestones</Title>
                            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                                {/* Timeline */}
                                <Box>
                                    {(displayProject.milestones?.length ?? 0) > 0 ? (
                                        <Timeline active={displayProject.milestones?.findIndex(m => m.active) ?? -1} bulletSize={24} lineWidth={2} color="white">
                                            {displayProject.milestones!.map((item, index) => (
                                                <Timeline.Item
                                                    key={item.id}
                                                    title={<Text size="sm" c="white">{dayjs(item.date).format('DD MMM YYYY')}</Text>}
                                                    bullet={ item.active ? ( <ThemeIcon size={24} radius="xl" color="mainOrange.6"> <IconPointFilled size={16} color="yellow" /> </ThemeIcon> ) : ( <ThemeIcon size={24} radius="xl" variant='outline' color="white"> <IconCircleDashed size={16} /> </ThemeIcon> )}
                                                    lineVariant={index === 0 ? 'solid' : 'dashed'}
                                                >
                                                    {item.active ? ( <Paper radius="md" p="xs" bg={theme.colors.mainOrange[6]} c="black" shadow="xs"> <Text size="sm" fw={500}>{item.title}</Text> </Paper> ) : ( <Text size="sm" c="white" ml={5}>{item.title}</Text> )}
                                                    {/* TODO: Add logic to display tasks for the active/selected milestone */}
                                                </Timeline.Item>
                                            ))}
                                        </Timeline>
                                    ) : (
                                        <Text c="gray.5">No milestones defined for this project yet.</Text>
                                    )}
                                </Box>

                                {/* Task Details (Placeholder) */}
                                <Stack gap="xs">
                                    <Text size="sm" c="gray.3">Selected Task Status</Text>
                                    <Title order={2} fw={500}>Selected Task Name</Title>
                                    <Text size="sm" c="gray.3">Selected Task Description...</Text>
                                </Stack>
                            </SimpleGrid>
                        </Stack>
                    </Stack>
                )}
            </WavyBackground>

            {/* Applications Section */}
            <Box bg="white" p="xl" style={{ borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.mainPurple[6]}` }} m="xl">
                <Stack gap="lg">
                    {/* Section Header */}
                    <Stack gap="xs">
                        <Title order={2} fw={500}>Applications</Title>
                        <Text size="sm"> Manage applications for your projects or track your own submissions. </Text>
                    </Stack>

                    {/* Filters */}
                    <Stack gap="md">
                        <SegmentedControl
                            value={applicationFilter}
                            onChange={(value) => setApplicationFilter(value as 'received' | 'sent')}
                            data={[ { label: 'Received', value: 'received' }, { label: 'Sent', value: 'sent' } ]}
                            color="mainPurple.6" radius="md"
                            styles={(theme) => ({ root: { backgroundColor: 'transparent', padding: 0, width: 'fit-content' }, label: { paddingTop: theme.spacing.xs, paddingBottom: theme.spacing.xs, paddingLeft: theme.spacing.md, paddingRight: theme.spacing.md }, control: { border: 'none' }, indicator: { borderRadius: theme.radius.md, backgroundColor: theme.colors.mainPurple[6], boxShadow: 'none' } })}
                        />
                        <Select
                            placeholder={applicationFilter === 'received' ? "Filter received by project you own" : "Filter sent by project applied to"}
                            data={projectOptions} // Use mapped options
                            value={selectedProjectId}
                            onChange={handleProjectSelection} // Update selected project
                            clearable
                            searchable
                            nothingFoundMessage="No relevant projects found"
                            disabled={isLoadingMyProjects} // Use correct loading state
                            rightSection={<IconChevronDown size={16} color={theme.colors.mainPurple[6]} />}
                            radius="md"
                            styles={(theme) => ({ input: { borderColor: theme.colors.mainPurple[2], color: theme.colors.mainPurple[6], '::placeholder': { color: theme.colors.mainPurple[6] } }, dropdown: { borderColor: theme.colors.mainPurple[2] }, option: { '&[data-selected]': { backgroundColor: theme.colors.mainPurple[1], color: theme.colors.mainPurple[8] }, '&[data-hovered]': { backgroundColor: theme.colors.mainPurple[0] } } })}
                        />
                    </Stack>

                    {/* Application List */}
                    {isLoadingApplications && <Center><Loader my="lg" /></Center>}
                    {!isLoadingApplications && error && <Alert color="red" title="Error Loading Applications" icon={<IconAlertCircle />}>{error}</Alert>}
                    {!isLoadingApplications && applications.length === 0 && !error && (
                        <Text c="dimmed" ta="center" my="lg">No {applicationFilter} applications {selectedProjectId ? 'for this project' : ''} found.</Text>
                    )}
                    {!isLoadingApplications && applications.length > 0 && (
                        <Stack gap="lg">
                            {applications.map((app, index) => (
                                <Box key={app.id}>
                                    <Group justify="space-between" align="flex-start">
                                        {/* Left side: Info */}
                                        <Stack gap="sm">
                                            <Group gap="xs"> <IconClock size={16} color='black' /> <Text size="xs" c="black" title={dayjs(app.createdAt).format('YYYY-MM-DD HH:mm')}>{dayjs(app.createdAt).fromNow()}</Text> </Group>
                                            <Title order={4} fw={500}>{app.roleAppliedFor || `Application for ${app.project.title}`}</Title>
                                            {applicationFilter === 'received' ? (
                                                <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${app.applicantId}`)} >
                                                    <Avatar color="gray" radius="xl" size="sm"> <IconPhoto size="0.8rem" /> </Avatar>
                                                    <Text size="sm" c="dimmed">{`${app.applicant.firstName} ${app.applicant.lastName}`}</Text>
                                                </Group>
                                            ) : (
                                                <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${app.projectId}`)} >
                                                    <Text size="sm" c="dimmed">{app.project.title}</Text>
                                                </Group>
                                            )}
                                            <Badge color={app.status === 'Accepted' ? 'green' : app.status === 'Declined' ? 'red' : 'yellow'}>{app.status}</Badge>
                                        </Stack>

                                        {/* Right side: Buttons */}
                                        {applicationFilter === 'received' && app.status === 'Pending' && (
                                            <Group gap="sm" mt={25}>
                                                <Button variant="filled" color="mainPurple.6" radius="md" size="sm" fw={400} onClick={() => handleApplicationStatusUpdate(app.id, 'Accepted')} loading={isProcessingAction === app.id} disabled={!!isProcessingAction}> Accept </Button>
                                                <Button variant="outline" radius="md" size="sm" fw={400} onClick={() => handleApplicationStatusUpdate(app.id, 'Declined')} loading={isProcessingAction === app.id} disabled={!!isProcessingAction} styles={(theme) => ({ root: { borderColor: "black", color: theme.colors.gray[7], '&:hover': { backgroundColor: theme.colors.gray[0] } } })} > Decline </Button>
                                            </Group>
                                        )}
                                    </Group>
                                    {index < applications.length - 1 && <Divider my="lg" color={theme.colors.gray[3]}/>}
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Box>
        </Stack>
    );
}