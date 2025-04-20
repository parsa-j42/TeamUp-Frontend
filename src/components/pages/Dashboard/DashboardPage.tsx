import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import {
    Box, Stack, useMantineTheme, Title, Text, Group, Avatar, SimpleGrid, ActionIcon,
    Timeline, Paper, ThemeIcon, Divider, Button, Select, SegmentedControl,
    Loader, Alert, Center, Container, Badge, Modal, Autocomplete, Anchor,
} from '@mantine/core';
import {
    IconClock, IconArrowRight, IconTrash, IconPhoto, IconPointFilled,
    IconCircleDashed, IconChevronDown, IconAlertCircle, IconUserPlus,
} from '@tabler/icons-react';
import WavyBackground from '@components/shared/WavyBackground/WavyBackground.tsx';
import MyProjectList from "@components/shared/MyProjectsList.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from '@utils/apiClient';
import { useAuth } from '@contexts/AuthContext';
import {
    ProjectDto, ApplicationDto, FindApplicationsQueryDto, UpdateApplicationStatusPayload,
    ProjectMemberDto, SimpleUserDto, InviteUserDto, ApplicationStatus,
} from '../../../types/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';

dayjs.extend(relativeTime);

const TOP_WAVE_PATH = "M 0,60 Q 15,100 40,81 C 60,70 80,0 130,20 L 100,0 L 0,0 Z";

export default function DashboardPage() {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { userDetails, isLoading: isAuthLoading, initialCheckComplete } = useAuth();

    // --- State ---
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedProjectData, setSelectedProjectData] = useState<ProjectDto | null>(null);
    const [applications, setApplications] = useState<ApplicationDto[]>([]);
    const [applicationFilter, setApplicationFilter] = useState<'received' | 'sent'>('received');
    const [isLoadingSelectedProject, setIsLoadingSelectedProject] = useState(false);
    const [isLoadingApplications, setIsLoadingApplications] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
    const [projectOptionsForFilter, setProjectOptionsForFilter] = useState<{ value: string; label: string }[]>([]);

    // --- Invite Member State ---
    const [inviteModalOpened, { open: openInviteModal, close: closeInviteModal }] = useDisclosure(false);
    const [inviteSearchQuery, setInviteSearchQuery] = useState('');
    const [debouncedInviteSearchQuery] = useDebouncedValue(inviteSearchQuery, 300);
    const [inviteSearchResults, setInviteSearchResults] = useState<SimpleUserDto[]>([]);
    const [inviteUserId, setInviteUserId] = useState<string | null>(null);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [isInvitingUser, setIsInvitingUser] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const autocompleteRef = useRef<HTMLInputElement>(null);

    // --- Navigation State Handling ---
    useLayoutEffect(() => {
        const navState = location.state as { selectedProjectId?: string } | null;
        if (navState?.selectedProjectId) {
            console.log(`[Dashboard] Received selectedProjectId from navigation: ${navState.selectedProjectId}`);
            setSelectedProjectId(navState.selectedProjectId);
            setTimeout(() => {
                navigate(location.pathname, { replace: true, state: {} });
            }, 0);
        }
    }, [location, navigate]);

    // --- Data Fetching ---
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

    // --- Fetch User Search Results (Debounced) ---
    const searchUsers = useCallback(async () => {
        if (!debouncedInviteSearchQuery || debouncedInviteSearchQuery.length < 2) {
            setInviteSearchResults([]);
            setIsSearchingUsers(false);
            return;
        }
        console.log(`[Dashboard] Searching users for: ${debouncedInviteSearchQuery}`);
        setIsSearchingUsers(true); setInviteError(null);
        try {
            const users = await apiClient<SimpleUserDto[]>(`/users?search=${encodeURIComponent(debouncedInviteSearchQuery)}`);
            const currentMemberIds = new Set(selectedProjectData?.members.map(m => m.userId) || []);
            const filteredUsers = users.filter(u => !currentMemberIds.has(u.id));
            setInviteSearchResults(filteredUsers);
        } catch (err: any) {
            console.error('[Dashboard] Error searching users:', err);
            setInviteError(err.data?.message || err.message || 'Failed to search users.');
            setInviteSearchResults([]);
        } finally {
            setIsSearchingUsers(false);
        }
    }, [debouncedInviteSearchQuery, selectedProjectData?.members]);

    useEffect(() => { searchUsers(); }, [searchUsers]);
    useEffect(() => { if (initialCheckComplete && userDetails) { fetchSelectedProjectDetails(); } }, [fetchSelectedProjectDetails, initialCheckComplete, userDetails]);
    useEffect(() => { fetchApplications(); }, [fetchApplications]);

    const handleProjectSelection = useCallback((projectId: string | null) => {
        console.log("[Dashboard] Project selected:", projectId);
        setSelectedProjectId(projectId);
    }, []);

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
            fetchApplications(); // Refresh the application list
            if (status === 'Accepted') { fetchSelectedProjectDetails(); } // Refresh members if accepted
        } catch (err: any) { setError(err.data?.message || err.message || `Failed to ${status.toLowerCase()} application.`); }
        finally { setIsProcessingAction(null); }
    };

    const handleRemoveMember = async (projectId: string, memberUserId: string) => {
        setIsProcessingAction(memberUserId); setError(null);
        try {
            await apiClient<void>(`/projects/${projectId}/members/${memberUserId}`, { method: 'DELETE' });
            fetchSelectedProjectDetails(); // Refresh members
        } catch (err: any) { setError(err.data?.message || err.message || 'Failed to remove team member.'); }
        finally { setIsProcessingAction(null); }
    };

    // --- UPDATED: Invite Member Handler ---
    const handleInviteMember = async () => {
        if (!inviteUserId || !selectedProjectId) {
            setInviteError("Please select a user to invite."); return;
        }
        setIsInvitingUser(true); setInviteError(null);
        try {
            const payload: InviteUserDto = { userId: inviteUserId }; // Role is optional, defaults to Member on backend
            // Call the new invite endpoint
            await apiClient<ApplicationDto>(`/projects/${selectedProjectId}/invite`, { method: 'POST', body: payload });
            closeInviteModal();
            // No need to refresh project details, just show success
            setError(null); // Clear previous errors
            // Optionally show a success notification here
            console.log("Invitation sent successfully!");
            // Reset modal state
            setInviteSearchQuery(''); setInviteUserId(null); setInviteSearchResults([]);
        } catch (err: any) {
            console.error('[Dashboard] Error inviting member:', err);
            setInviteError(err.data?.message || err.message || 'Failed to send invitation.');
        } finally { setIsInvitingUser(false); }
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
    const isOwner = !!displayProject && currentUserId === displayProject.owner.id;

    // Format search results for Autocomplete using preferredUsername + lastName
    const autocompleteData = inviteSearchResults.map(user => ({
        value: user.id,
        label: `${user.preferredUsername} ${user.lastName}` // Use preferredUsername + lastName
    }));

    // --- Wave Background Setup ---
    const topWaveHeight = 500;
    const topWaveEdgeRatio = -10 / 100;
    const topWaveOffset = topWaveHeight * topWaveEdgeRatio;
    const topSectionPadding = `calc(${topWaveOffset}px + ${theme.spacing.xl})`;

    return (
        <Stack gap={0} mb="xl">
            {/* Top Section */}
            <WavyBackground wavePath={TOP_WAVE_PATH} waveHeight={topWaveHeight} backgroundColor={theme.colors.mainPurple[6]} contentPaddingTop={topSectionPadding} extraBottomPadding="0px" >
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
                            <Group justify="space-between">
                                <Title order={3} fw={500}>Team Members</Title>
                                {isOwner && (
                                    <Button size="xs" variant="light" color="white" onClick={openInviteModal} leftSection={<IconUserPlus size={16} />} > Invite Member </Button>
                                )}
                            </Group>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                                {displayProject.members.map((member: ProjectMemberDto) => (
                                    <Stack key={member.id} gap="xs" align="left" ta="left">
                                        <Avatar src={undefined} radius="50%" size={80} color="gray.3"> <IconPhoto size="2rem" color={theme.colors.mainPurple[1]} /> </Avatar>
                                        <Text fw={500} size="md">{`${member.user.preferredUsername} ${member.user.lastName}`}</Text>
                                        <Text size="sm" c="gray.4">{member.role}</Text>
                                        <Group gap="sm" mt="xs" justify="flex-start">
                                            <ActionIcon variant="transparent" color="white" title={`View ${member.user.preferredUsername}'s Profile`} onClick={() => navigate(`/profile/${member.userId}`)} > <IconArrowRight size={18} /> </ActionIcon>
                                            {isOwner && member.userId !== displayProject.owner.id && (
                                                <ActionIcon variant="transparent" color="red" title={`Remove ${member.user.preferredUsername}`} onClick={() => handleRemoveMember(displayProject.id, member.userId)} loading={isProcessingAction === member.userId} disabled={!!isProcessingAction}> <IconTrash size={18} /> </ActionIcon>
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
                    <Stack gap="xs"> <Title order={2} fw={500}>Applications & Invitations</Title> <Text size="sm"> Manage incoming/outgoing requests and invitations. </Text> </Stack>
                    <Stack gap="md">
                        <SegmentedControl value={applicationFilter} onChange={(value) => setApplicationFilter(value as 'received' | 'sent')} data={[ { label: 'Received', value: 'received' }, { label: 'Sent', value: 'sent' } ]} color="mainPurple.6" radius="md" styles={(theme) => ({ root: { backgroundColor: 'transparent', padding: 0, width: 'fit-content' }, label: { paddingTop: theme.spacing.xs, paddingBottom: theme.spacing.xs, paddingLeft: theme.spacing.md, paddingRight: theme.spacing.md }, control: { border: 'none' }, indicator: { borderRadius: theme.radius.md, backgroundColor: theme.colors.mainPurple[6], boxShadow: 'none' } })} />
                        <Select placeholder={applicationFilter === 'received' ? "Filter received by project" : "Filter sent by project"} data={projectOptionsForFilter} value={selectedProjectId} onChange={handleProjectSelection} clearable searchable nothingFoundMessage="No relevant projects found"
                                rightSection={<IconChevronDown size={16} color={theme.colors.mainPurple[6]} />} radius="md" styles={(theme) => ({ input: { borderColor: theme.colors.mainPurple[2], color: theme.colors.mainPurple[6], '::placeholder': { color: theme.colors.mainPurple[6] } }, dropdown: { borderColor: theme.colors.mainPurple[2] }, option: { '&[data-selected]': { backgroundColor: theme.colors.mainPurple[1], color: theme.colors.mainPurple[8] }, '&[data-hovered]': { backgroundColor: theme.colors.mainPurple[0] } } })} />
                    </Stack>
                    {isLoadingApplications && <Center><Loader my="lg" /></Center>}
                    {!isLoadingApplications && error && <Alert color="red" title="Error Loading Data" icon={<IconAlertCircle />}>{error}</Alert>}
                    {!isLoadingApplications && applications.length === 0 && !error && ( <Text c="dimmed" ta="center" my="lg">No {applicationFilter} applications or invitations {selectedProjectId ? 'for this project' : ''} found.</Text> )}
                    {!isLoadingApplications && applications.length > 0 && (
                        <Stack gap="lg">
                            {applications.map((app, index) => (
                                <Box key={app.id}>
                                    <Group justify="space-between" align="flex-start">
                                        <Stack gap="sm">
                                            <Group gap="xs"> <IconClock size={16} color='black' /> <Text size="xs" c="black" title={dayjs(app.createdAt).format('YYYY-MM-DD HH:mm')}>{dayjs(app.createdAt).fromNow()}</Text> </Group>
                                            <Anchor onClick={() => navigate(`/project/${app.projectId}`)} underline="hover" c="black">
                                                <Title order={4} fw={500}>
                                                    {app.roleAppliedFor ? `${app.roleAppliedFor} @ ${app.project.title}` : `Application for ${app.project.title}`}
                                                    {app.status === ApplicationStatus.INVITED && applicationFilter === 'received' && ' (Invitation)'}
                                                </Title>
                                            </Anchor>
                                            {applicationFilter === 'received' ? (
                                                <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${app.applicantId}`)} >
                                                    <Avatar color="gray" radius="xl" size="sm"> <IconPhoto size="0.8rem" /> </Avatar>
                                                    <Text size="sm" c="dimmed">{`${app.applicant.preferredUsername} ${app.applicant.lastName}`}</Text>
                                                </Group>
                                            ) : ( // Sent applications
                                                <Group gap="xs">
                                                    <Text size="sm" c="dimmed">Owner: {`${app.project.owner.preferredUsername} ${app.project.owner.lastName}`}</Text>
                                                </Group>
                                            )}
                                            <Badge color={app.status === ApplicationStatus.ACCEPTED ? 'green' : app.status === ApplicationStatus.DECLINED ? 'red' : app.status === ApplicationStatus.INVITED ? 'blue' : 'yellow'}>{app.status}</Badge>
                                        </Stack>
                                        {/* Actions: Show for Received Pending Apps (Owner) OR Received Invites (Applicant) */}
                                        {applicationFilter === 'received' && (app.status === ApplicationStatus.PENDING || app.status === ApplicationStatus.INVITED) && (
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

            {/* Invite Member Modal */}
            <Modal opened={inviteModalOpened} onClose={closeInviteModal} title="Invite Member" centered>
                <Stack>
                    {inviteError && <Alert color="red" title="Invite Error" icon={<IconAlertCircle />} withCloseButton onClose={() => setInviteError(null)}>{inviteError}</Alert>}
                    <Autocomplete
                        ref={autocompleteRef}
                        label="Search User by Name"
                        placeholder="Start typing a name..."
                        data={autocompleteData}
                        value={inviteSearchQuery}
                        onChange={setInviteSearchQuery}
                        onOptionSubmit={(value) => {
                            console.log("User selected ID:", value);
                            setInviteUserId(value);
                            const selectedUser = inviteSearchResults.find(u => u.id === value);
                            if (selectedUser) {
                                setInviteSearchQuery(`${selectedUser.preferredUsername} ${selectedUser.lastName}`);
                            }
                        }}
                        limit={5}
                        rightSection={isSearchingUsers ? <Loader size="xs" /> : null}
                        comboboxProps={{ withinPortal: true }}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeInviteModal} disabled={isInvitingUser}>Cancel</Button>
                        <Button
                            color="mainPurple.6"
                            onClick={handleInviteMember} // Calls the updated handler
                            loading={isInvitingUser}
                            disabled={!inviteUserId || isInvitingUser}
                        >
                            Send Invitation {/* Changed button text */}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}