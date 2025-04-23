import { useState, useEffect, useCallback } from 'react';
import {
    Container, Stack, Title, Text, Group, Avatar, Button, Divider,
    Select, Loader, Alert, Center, Box, Tabs
} from '@mantine/core';
import { IconClock, IconAlertCircle, IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";
import { apiClient } from '@utils/apiClient';
import { useAuth } from '@contexts/AuthContext';
import {
    ApplicationDto, ProjectDto, FindApplicationsQueryDto,
    UpdateApplicationStatusPayload, ApplicationStatus
} from '../../../types/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import classes from './MyApplicationsPage.module.css';

dayjs.extend(relativeTime);

export default function MyApplicationsPage() {
    const navigate = useNavigate();
    const { userDetails, initialCheckComplete } = useAuth();

    // --- State ---
    const [applications, setApplications] = useState<ApplicationDto[]>([]);
    const [isLoadingApplications, setIsLoadingApplications] = useState(true);
    const [applicationsError, setApplicationsError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('received');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null); // Use null for "All"
    const [projectOptions, setProjectOptions] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);

    // --- Data Fetching ---
    const fetchApplications = useCallback(async () => {
        if (!initialCheckComplete || !userDetails) {
            setIsLoadingApplications(false);
            return;
        }
        setIsLoadingApplications(true);
        setApplicationsError(null);
        console.log(`Fetching applications: filter=${activeTab}, projectId=${selectedProjectId}`);
        try {
            const queryParams: FindApplicationsQueryDto = {
                // Add applicantId: 'me' when viewing 'all' applications
                ...(activeTab === 'all' && { applicantId: 'me' }),
                ...(activeTab !== 'all' && { filter: activeTab }),
                ...(selectedProjectId && { projectId: selectedProjectId }),
                take: 50
            };
            // Remove undefined keys (no change needed here)
            Object.keys(queryParams).forEach(key => queryParams[key as keyof FindApplicationsQueryDto] === undefined && delete queryParams[key as keyof FindApplicationsQueryDto]);

            const params = new URLSearchParams(queryParams as any).toString();
            const data = await apiClient<{ applications: ApplicationDto[], total: number }>(`/applications?${params}`);
            setApplications(data.applications);
        } catch (err: any) {
            console.error('[MyApplicationsPage] Error fetching applications:', err);
            // Ensure the error message reflects the actual backend response if available
            setApplicationsError(err.data?.message || err.message || 'Failed to load applications.');
            setApplications([]);
        } finally {
            setIsLoadingApplications(false);
        }
    }, [activeTab, selectedProjectId, initialCheckComplete, userDetails]);

    const fetchProjectOptions = useCallback(async () => {
        if (!initialCheckComplete || !userDetails) return;
        setIsLoadingProjects(true);
        try {
            const projects = await apiClient<ProjectDto[]>('/projects/me');
            // Set "All projects" as the first option with empty value
            setProjectOptions([
                { value: '', label: 'All projects' },
                ...projects.map(p => ({ value: p.id, label: p.title }))
            ]);
        } catch (err) {
            console.error("Failed to fetch projects for filter dropdown:", err);
            setProjectOptions([{ value: '', label: 'All projects' }]);
        } finally {
            setIsLoadingProjects(false);
        }
    }, [initialCheckComplete, userDetails]);

    // --- Effects ---
    useEffect(() => {
        if (initialCheckComplete) {
            fetchApplications();
            fetchProjectOptions();
        }
    }, [fetchApplications, fetchProjectOptions, initialCheckComplete]);

    // --- Action Handlers ---
    const handleTabChange = (value: string | null) => {
        if (value === 'all' || value === 'sent' || value === 'received') {
            setActiveTab(value);
        }
    };

    const handleProjectFilterChange = (value: string | null) => {
        setSelectedProjectId(value === '' ? null : value); // Map empty string back to null
    };

    const handleApplicationStatusUpdate = async (applicationId: string, status: 'Accepted' | 'Declined') => {
        setIsProcessingAction(applicationId);
        setApplicationsError(null);
        try {
            const payload: UpdateApplicationStatusPayload = { status };
            await apiClient<ApplicationDto>(`/applications/${applicationId}/status`, { method: 'PATCH', body: payload });
            fetchApplications();
        } catch (err: any) {
            console.error(`[MyApplicationsPage] Error ${status.toLowerCase()}ing application ${applicationId}:`, err);
            setApplicationsError(err.data?.message || err.message || `Failed to ${status.toLowerCase()} application.`);
        } finally {
            setIsProcessingAction(null);
        }
    };

    const handleProfileClick = (applicantId: string) => {
        navigate(`/profile/${applicantId}`);
    };

    // --- Helper ---
    const formatRelativeTime = (dateString: string): string => {
        return dayjs(dateString).fromNow();
    };

    // --- Render Logic ---
    const renderApplicationItem = (app: ApplicationDto) => {
        const showActions = activeTab === 'received' &&
            (app.status === ApplicationStatus.PENDING || app.status === ApplicationStatus.INVITED);
        // Determine if the application was sent or received for the 'all' tab display
        const isSent = app.applicantId === userDetails?.id;
        const titlePrefix = activeTab === 'all' ? (isSent ? '[Sent] ' : '[Received] ') : '';
        const titleText = app.roleAppliedFor
            ? `${titlePrefix}${app.roleAppliedFor} @ ${app.project.title}`
            : `${titlePrefix}${app.project.title}`;

        return (
            <Box key={app.id}>
                <Group justify="space-between" align="center" wrap="nowrap" className={classes.applicationItem}>
                    {/* Left Side */}
                    <Stack gap="xs" style={{ flexGrow: 1, overflow: 'hidden', marginRight: 'var(--mantine-spacing-md)' }}>
                        <Group gap="xs" className={classes.itemHeader}>
                            <IconClock size={16} color='black' stroke={1.5}/>
                            <Text size="xs" c="black" title={dayjs(app.createdAt).format('YYYY-MM-DD HH:mm')}>
                                {formatRelativeTime(app.createdAt)}
                            </Text>
                            {/* Display status clearly, especially in 'all' view */}
                            <Text size="xs" c="dimmed">({app.status})</Text>
                        </Group>
                        <Title order={4} className={classes.itemTitle} lineClamp={1}>
                            {titleText}
                            {app.status === ApplicationStatus.INVITED && activeTab !== 'sent' && ' (Invitation)'}
                        </Title>
                        {/* Show applicant info if received, or project info if sent/all */}
                        {(activeTab === 'received' || (activeTab === 'all' && !isSent)) ? (
                            <Group
                                gap="xs"
                                className={classes.applicantInfo}
                                onClick={() => handleProfileClick(app.applicantId)}
                                wrap="nowrap"
                            >
                                <Avatar radius="xl" size="sm" className={classes.applicantAvatar}>
                                    {app.applicant.firstName?.[0] || '?'}
                                    {app.applicant.lastName?.[0] || ''}
                                </Avatar>
                                <Text size="sm" className={classes.applicantNameText} lineClamp={1}>
                                    Applicant: {`${app.applicant.preferredUsername} ${app.applicant.lastName}`}
                                </Text>
                            </Group>
                        ) : (
                            <Group gap="xs">
                                <Text size="sm" c="dimmed" lineClamp={1}>
                                    Project: {app.project.title}
                                </Text>
                            </Group>
                        )}
                    </Stack>

                    {/* Right Side: Action Buttons (Only show for received pending/invited) */}
                    {showActions && (
                        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                            <Button
                                variant="filled"
                                radius="xl"
                                size="sm"
                                className={`${classes.actionButton} ${classes.acceptButton}`}
                                onClick={() => handleApplicationStatusUpdate(app.id, 'Accepted')}
                                loading={isProcessingAction === app.id}
                                disabled={!!isProcessingAction}
                            >
                                Accept
                            </Button>
                            <Button
                                variant="outline"
                                radius="xl"
                                size="sm"
                                className={`${classes.actionButton} ${classes.declineButton}`}
                                onClick={() => handleApplicationStatusUpdate(app.id, 'Declined')}
                                loading={isProcessingAction === app.id}
                                disabled={!!isProcessingAction}
                            >
                                Decline
                            </Button>
                        </Group>
                    )}
                </Group>
                <Divider className={classes.divider} />
            </Box>
        );
    };

    return (
        <Container size="lg" className={classes.pageWrapper}>
            <Stack align="center">
                <Title order={1} className={classes.title}>Application</Title>
                <Text className={classes.subtitle}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
                </Text>

                <Box className={classes.contentBox} w="100%">
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="unstyled"
                        classNames={{ list: classes.tabsList, tab: classes.tab }}
                        mb="lg"
                    >
                        <Tabs.List>
                            <Tabs.Tab value="all">View all</Tabs.Tab>
                            <Tabs.Tab value="sent">Sent</Tabs.Tab>
                            <Tabs.Tab value="received">Received</Tabs.Tab>
                        </Tabs.List>
                    </Tabs>

                    <Select
                        placeholder="Select one of the projects"
                        data={projectOptions}
                        // Use empty string for "All projects" option value
                        value={selectedProjectId ?? ''}
                        onChange={handleProjectFilterChange}
                        disabled={isLoadingProjects}
                        clearable={false} // Don't allow clearing beyond "All projects"
                        searchable
                        nothingFoundMessage="No projects found"
                        rightSection={isLoadingProjects ? <Loader size={16} /> : <IconChevronDown size={16} />}
                        className={classes.projectSelect}
                        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                    />

                    {/* Application List */}
                    {isLoadingApplications && <Center><Loader my="xl" /></Center>}
                    {!isLoadingApplications && applicationsError && (
                        <Alert color="red" title="Error Loading Applications" icon={<IconAlertCircle />} mt="md">
                            {applicationsError}
                        </Alert>
                    )}
                    {!isLoadingApplications && !applicationsError && applications.length === 0 && (
                        <Center mih={150}>
                            {/* Updated empty state message */}
                            <Text c="dimmed">No {activeTab !== 'all' ? activeTab : ''} applications {selectedProjectId ? 'for this project' : (activeTab === 'all' ? 'found' : '')} found.</Text>
                        </Center>
                    )}
                    {!isLoadingApplications && !applicationsError && applications.length > 0 && (
                        <Stack gap={0}>
                            {applications.map(renderApplicationItem)}
                        </Stack>
                    )}
                </Box>
            </Stack>
        </Container>
    );
}
