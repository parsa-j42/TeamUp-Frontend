import { useState, useEffect, useCallback } from 'react';
import {
    Container, Stack, Title, Text, Group, Avatar, Button, Divider,
    Select, Loader, Alert, Center, Box, Tabs,
} from '@mantine/core';
import { IconClock, IconAlertCircle, IconPhoto, IconChevronDown } from '@tabler/icons-react';
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
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [projectOptions, setProjectOptions] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null); // Tracks application ID being processed

    // --- Data Fetching ---
    const fetchApplications = useCallback(async () => {
        if (!initialCheckComplete || !userDetails) {
            setIsLoadingApplications(false);
            return; // Don't fetch if auth isn't ready
        }
        setIsLoadingApplications(true);
        setApplicationsError(null);
        console.log(`Fetching applications: filter=${activeTab}, projectId=${selectedProjectId}`);
        try {
            const queryParams: FindApplicationsQueryDto = {
                filter: activeTab,
                // Only include projectId if it's selected
                ...(selectedProjectId && { projectId: selectedProjectId }),
                take: 50 // Fetch a reasonable number
            };
            const params = new URLSearchParams(queryParams as any).toString();
            const data = await apiClient<{ applications: ApplicationDto[], total: number }>(`/applications?${params}`);
            setApplications(data.applications);
        } catch (err: any) {
            console.error('[MyApplicationsPage] Error fetching applications:', err);
            setApplicationsError(err.data?.message || err.message || 'Failed to load applications.');
            setApplications([]);
        } finally {
            setIsLoadingApplications(false);
        }
    }, [activeTab, selectedProjectId, initialCheckComplete, userDetails]);

    const fetchProjectOptions = useCallback(async () => {
        if (!initialCheckComplete || !userDetails) return; // Only fetch if logged in
        setIsLoadingProjects(true);
        try {
            // Fetch projects the user is associated with (owned or member)
            const projects = await apiClient<ProjectDto[]>('/projects/me');
            setProjectOptions(projects.map(p => ({ value: p.id, label: p.title })));
        } catch (err) {
            console.error("Failed to fetch projects for filter dropdown:", err);
            setProjectOptions([]); // Set empty on error
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
    }, [fetchApplications, fetchProjectOptions, initialCheckComplete]); // Fetch on initial load and when filters change via fetchApplications dependency

    // --- Action Handlers ---
    const handleTabChange = (value: string | null) => {
        if (value === 'sent' || value === 'received') {
            setActiveTab(value);
            // Fetching is triggered by useEffect dependency on activeTab
        }
    };

    const handleProjectFilterChange = (value: string | null) => {
        setSelectedProjectId(value);
        // Fetching is triggered by useEffect dependency on selectedProjectId
    };

    const handleApplicationStatusUpdate = async (applicationId: string, status: 'Accepted' | 'Declined') => {
        setIsProcessingAction(applicationId);
        setApplicationsError(null); // Clear previous errors
        try {
            const payload: UpdateApplicationStatusPayload = { status };
            await apiClient<ApplicationDto>(`/applications/${applicationId}/status`, { method: 'PATCH', body: payload });
            // Refetch applications to show the updated status
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
        const titleText = app.roleAppliedFor
            ? `${app.roleAppliedFor} @ ${app.project.title}`
            : app.project.title;

        return (
            <Box key={app.id}>
                <Group justify="space-between" align="flex-start" wrap="nowrap" className={classes.applicationItem}>
                    {/* Left Side: Time, Title, Applicant Info */}
                    <Stack gap="xs" style={{ flexGrow: 1, overflow: 'hidden' }}>
                        <Group gap="xs" className={classes.itemHeader}>
                            <IconClock size={16} color='gray' />
                            <Text size="xs" c="dimmed" title={dayjs(app.createdAt).format('YYYY-MM-DD HH:mm')}>
                                {formatRelativeTime(app.createdAt)}
                            </Text>
                        </Group>
                        <Title order={4} className={classes.itemTitle} lineClamp={1}>
                            {titleText}
                            {app.status === ApplicationStatus.INVITED && activeTab === 'received' && ' (Invitation)'}
                        </Title>
                        {/* Show Applicant for received, Project Owner for sent */}
                        {activeTab === 'received' ? (
                            <Group
                                gap="xs"
                                className={classes.applicantInfo}
                                onClick={() => handleProfileClick(app.applicantId)}
                            >
                                <Avatar color="gray" radius="xl" size="sm">
                                    <IconPhoto size="0.8rem" /> {/* Placeholder */}
                                </Avatar>
                                <Text size="sm" c="dimmed" lineClamp={1}>
                                    {`${app.applicant.preferredUsername} ${app.applicant.lastName}`}
                                </Text>
                            </Group>
                        ) : (
                            <Group gap="xs">
                                <Text size="sm" c="dimmed">
                                    Project: {app.project.title} (Owner: {`${app.project.owner.preferredUsername} ${app.project.owner.lastName}`})
                                </Text>
                            </Group>
                        )}
                    </Stack>

                    {/* Right Side: Action Buttons (Conditional) */}
                    {showActions && (
                        <Group gap="sm" style={{ alignSelf: 'center' }}>
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
                <Divider my="sm" className={classes.divider} />
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
                        variant="pills" // Use pills variant for background on active
                        radius="md"
                        classNames={{ list: classes.tabsList, tab: classes.tab }}
                        mb="lg" // Add margin below tabs
                        styles={(theme) => ({ // Style active tab background
                            tab: {
                                '&[data-active]': {
                                    backgroundColor: theme.colors.blue[5], // Use screenshot blue
                                    color: theme.white,
                                },
                                '&:not([data-active]):hover': {
                                    backgroundColor: theme.colors.gray[1],
                                }
                            }
                        })}
                    >
                        <Tabs.List grow>
                            {/* <Tabs.Tab value="all">View all</Tabs.Tab> */}
                            {/* "View All" needs specific logic, implementing Sent/Received first */}
                            <Tabs.Tab value="sent">Sent</Tabs.Tab>
                            <Tabs.Tab value="received">Received</Tabs.Tab>
                        </Tabs.List>
                    </Tabs>

                    <Select
                        placeholder="Select one of the projects"
                        data={projectOptions}
                        value={selectedProjectId}
                        onChange={handleProjectFilterChange}
                        disabled={isLoadingProjects}
                        clearable
                        searchable
                        nothingFoundMessage="No projects found"
                        rightSection={isLoadingProjects ? <Loader size="xs" /> : <IconChevronDown size={16} />}
                        className={classes.projectSelect}
                    />

                    {/* Application List */}
                    {isLoadingApplications && <Center><Loader my="xl" /></Center>}
                    {!isLoadingApplications && applicationsError && (
                        <Alert color="red" title="Error Loading Applications" icon={<IconAlertCircle />}>
                            {applicationsError}
                        </Alert>
                    )}
                    {!isLoadingApplications && !applicationsError && applications.length === 0 && (
                        <Center mih={150}>
                            <Text c="dimmed">No {activeTab} applications {selectedProjectId ? 'for this project' : ''} found.</Text>
                        </Center>
                    )}
                    {!isLoadingApplications && !applicationsError && applications.length > 0 && (
                        <Stack gap={0}> {/* Use gap={0} and let divider handle spacing */}
                            {applications.map(renderApplicationItem)}
                        </Stack>
                    )}
                </Box>
            </Stack>
        </Container>
    );
}