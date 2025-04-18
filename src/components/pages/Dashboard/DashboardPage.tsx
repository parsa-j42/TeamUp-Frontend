import { useState, useEffect, useCallback } from 'react';
import {
    Box, Stack, useMantineTheme, Title, Text, Group, Avatar, SimpleGrid, ActionIcon,
    Timeline, Paper, ThemeIcon, Divider, Button, Select, SegmentedControl, // Keep Select for app filtering
    Loader, Alert, Center, Container, Badge,
} from '@mantine/core';
import {
    IconClock, IconArrowRight, IconTrash, IconPhoto, IconPointFilled,
    IconCircleDashed, IconChevronDown, IconAlertCircle
} from '@tabler/icons-react';
import WavyBackground from '@components/shared/WavyBackground/WavyBackground.tsx';
import MyProjectList from "@components/shared/MyProjectsList.tsx"; // Use MyProjectList again
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { apiClient } from '@utils/apiClient';
import { useAuth } from '@contexts/AuthContext';
import { ProjectDto, ApplicationDto, FindApplicationsQueryDto, UpdateApplicationStatusPayload, ProjectMemberDto } from '../../../types/api'; // Import SimpleUserDto
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TOP_WAVE_PATH = "M 0,60 Q 15,100 40,81 C 60,70 80,0 130,20 L 100,0 L 0,0 Z";

export default function DashboardPage() {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const location = useLocation(); // Get location to check state
    const { userDetails, isLoading: isAuthLoading, initialCheckComplete } = useAuth();

    // --- State ---
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null); // Managed by MyProjectList callback
    const [selectedProjectData, setSelectedProjectData] = useState<ProjectDto | null>(null);
    const [applications, setApplications] = useState<ApplicationDto[]>([]);
    const [applicationFilter, setApplicationFilter] = useState<'received' | 'sent'>('received');
    // Removed isLoadingMyProjects - MyProjectList handles its own loading
    const [isLoadingSelectedProject, setIsLoadingSelectedProject] = useState(false);
    const [isLoadingApplications, setIsLoadingApplications] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
    // State to store project options for the application filter dropdown
    const [projectOptionsForFilter, setProjectOptionsForFilter] = useState<{ value: string; label: string }[]>([]);

    // --- Data Fetching ---
    // Fetching MyProjects list is now handled inside MyProjectList component

    const fetchSelectedProjectDetails = useCallback(async () => {
        if (!selectedProjectId) { setSelectedProjectData(null); return; }
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
                projectId: selectedProjectId ?? undefined,
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

    // --- Fetch Details when Selection Changes ---
    useEffect(() => {
        if (initialCheckComplete && userDetails) {
            fetchSelectedProjectDetails();
        }
    }, [fetchSelectedProjectDetails, initialCheckComplete, userDetails]);

    // --- Fetch Applications when Filter or Selected Project Changes ---
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // --- Handle Project Selection from MyProjectList OR Navigation State ---
    const handleProjectSelection = useCallback((projectId: string | null) => {
        console.log("[Dashboard] Project selected:", projectId);
        setSelectedProjectId(projectId);
        // Note: fetchSelectedProjectDetails runs via useEffect dependency
    }, []); // Empty dependency array, function itself doesn't change

    useEffect(() => {
        // Check if navigated here with a specific project ID in state
        const navState = location.state as { selectedProjectId?: string } | null;
        if (navState?.selectedProjectId) {
            console.log(`[Dashboard] Received selectedProjectId from navigation state: ${navState.selectedProjectId}`);
            // Check if it's different from current to avoid infinite loops if state isn't cleared properly
            if (navState.selectedProjectId !== selectedProjectId) {
                setSelectedProjectId(navState.selectedProjectId);
            }
            // Clear the state after using it
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, selectedProjectId]); // Rerun if location state changes

    // --- Populate Project Filter Dropdown ---
    // Fetch projects specifically for the filter dropdown when needed
    // This could be optimized if MyProjectList could share its fetched data
    useEffect(() => {
        const fetchFilterOptions = async () => {
            if (initialCheckComplete && userDetails) {
                try {
                    const projects = await apiClient<ProjectDto[]>('/projects/me');
                    setProjectOptionsForFilter(projects.map(p => ({ value: p.id, label: p.title })));
                } catch (err) {
                    console.error("Failed to fetch projects for filter dropdown:", err);
                    setProjectOptionsForFilter([]);
                }
            }
        };
        fetchFilterOptions();
    }, [initialCheckComplete, userDetails]);


    // --- Action Handlers ---
    const handleApplicationStatusUpdate = async (applicationId: string, status: 'Accepted' | 'Declined') => {
        setIsProcessingAction(applicationId); setError(null);
        try {
            const payload: UpdateApplicationStatusPayload = { status };
            await apiClient<ApplicationDto>(`/applications/${applicationId}/status`, { method: 'PATCH', body: payload });
            fetchApplications();
            if (status === 'Accepted') { fetchSelectedProjectDetails(); }
        } catch (err: any) { setError(err.data?.message || err.message || `Failed to ${status.toLowerCase()} application.`); }
        finally { setIsProcessingAction(null); }
    };

    const handleRemoveMember = async (projectId: string, memberUserId: string) => {
        setIsProcessingAction(memberUserId); setError(null);
        try {
            await apiClient<void>(`/projects/${projectId}/members/${memberUserId}`, { method: 'DELETE' });
            fetchSelectedProjectDetails();
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
                {/* Use MyProjectList component again */}
                <Box pt="0px" pb="50px" px="xl">
                    <MyProjectList
                        onSelectProject={handleProjectSelection}
                        selectedProjectId={selectedProjectId}
                    />
                </Box>

                {/* Project Details Section */}
                {isLoadingSelectedProject && <Center><Loader color="white" my="xl" /></Center>}
                {!isLoadingSelectedProject && error && !displayProject && <Alert color="red" title="Error" icon={<IconAlertCircle />} m="xl">{error}</Alert>}
                {!isLoadingSelectedProject && !displayProject && selectedProjectId && !error && <Text c="dimmed" ta="center" m="xl">Selected project details could not be loaded.</Text>}
                {!isLoadingSelectedProject && !displayProject && !selectedProjectId && !error && <Text c="dimmed" ta="center" m="xl">Select a project from the list above to see details.</Text>}

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
                                        <Avatar src={undefined} radius="50%" size={80} color="gray.3"> <IconPhoto size="2rem" color={theme.colors.mainPurple[1]} /> </Avatar>
                                        <Text fw={500} size="md">{`${member.user.firstName} ${member.user.lastName}`}</Text>
                                        <Text size="sm" c="gray.4">{member.role}</Text>
                                        <Group gap="sm" mt="xs" justify="flex-start">
                                            {/* Removed mailto link */}
                                            <ActionIcon variant="transparent" color="white" title={`View ${member.user.firstName}'s Profile`} onClick={() => navigate(`/profile/${member.userId}`)} > <IconArrowRight size={18} /> </ActionIcon>
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
                                                </Timeline.Item>
                                            ))}
                                        </Timeline>
                                    ) : ( <Text c="gray.5">No milestones defined for this project yet.</Text> )}
                                </Box>
                                {/* Task Details Placeholder */}
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
                    <Stack gap="xs"> <Title order={2} fw={500}>Applications</Title> <Text size="sm"> Manage applications for your projects or track your own submissions. </Text> </Stack>
                    <Stack gap="md">
                        <SegmentedControl value={applicationFilter} onChange={(value) => setApplicationFilter(value as 'received' | 'sent')} data={[ { label: 'Received', value: 'received' }, { label: 'Sent', value: 'sent' } ]} color="mainPurple.6" radius="md" styles={(theme) => ({ root: { backgroundColor: 'transparent', padding: 0, width: 'fit-content' }, label: { paddingTop: theme.spacing.xs, paddingBottom: theme.spacing.xs, paddingLeft: theme.spacing.md, paddingRight: theme.spacing.md }, control: { border: 'none' }, indicator: { borderRadius: theme.radius.md, backgroundColor: theme.colors.mainPurple[6], boxShadow: 'none' } })} />
                        {/* Use projectOptionsForFilter state */}
                        <Select placeholder={applicationFilter === 'received' ? "Filter received by project you own" : "Filter sent by project applied to"} data={projectOptionsForFilter} value={selectedProjectId} onChange={handleProjectSelection} clearable searchable nothingFoundMessage="No relevant projects found"
                            // Disable if the base project list is loading (used to populate options)
                            // disabled={isLoadingMyProjects} // This state is no longer here, consider adding a loading state for the options fetch
                                rightSection={<IconChevronDown size={16} color={theme.colors.mainPurple[6]} />} radius="md" styles={(theme) => ({ input: { borderColor: theme.colors.mainPurple[2], color: theme.colors.mainPurple[6], '::placeholder': { color: theme.colors.mainPurple[6] } }, dropdown: { borderColor: theme.colors.mainPurple[2] }, option: { '&[data-selected]': { backgroundColor: theme.colors.mainPurple[1], color: theme.colors.mainPurple[8] }, '&[data-hovered]': { backgroundColor: theme.colors.mainPurple[0] } } })} />
                    </Stack>
                    {isLoadingApplications && <Center><Loader my="lg" /></Center>}
                    {!isLoadingApplications && error && <Alert color="red" title="Error Loading Applications" icon={<IconAlertCircle />}>{error}</Alert>}
                    {!isLoadingApplications && applications.length === 0 && !error && ( <Text c="dimmed" ta="center" my="lg">No {applicationFilter} applications {selectedProjectId ? 'for this project' : ''} found.</Text> )}
                    {!isLoadingApplications && applications.length > 0 && (
                        <Stack gap="lg">
                            {applications.map((app, index) => (
                                <Box key={app.id}>
                                    <Group justify="space-between" align="flex-start">
                                        <Stack gap="sm">
                                            <Group gap="xs"> <IconClock size={16} color='black' /> <Text size="xs" c="black" title={dayjs(app.createdAt).format('YYYY-MM-DD HH:mm')}>{dayjs(app.createdAt).fromNow()}</Text> </Group>
                                            <Title order={4} fw={500}>{app.roleAppliedFor || `Application for ${app.project.title}`}</Title>
                                            {applicationFilter === 'received' ? (
                                                <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${app.applicantId}`)} >
                                                    <Avatar color="gray" radius="xl" size="sm"> <IconPhoto size="0.8rem" /> </Avatar>
                                                    <Text size="sm" c="dimmed">{`${app.applicant.firstName} ${app.applicant.lastName}`}</Text>
                                                </Group>
                                            ) : ( <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${app.projectId}`)} > <Text size="sm" c="dimmed">{app.project.title}</Text> </Group> )}
                                            <Badge color={app.status === 'Accepted' ? 'green' : app.status === 'Declined' ? 'red' : 'yellow'}>{app.status}</Badge>
                                        </Stack>
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