import { useState, useEffect, useCallback } from 'react';
import {
    Avatar, Badge, Box, Button, Container, Group, Paper, SimpleGrid, Stack, Text, Title,
    useMantineTheme, Loader, Alert, Center
} from '@mantine/core';
import { IconAlertCircle, IconBookmark, IconBookmarkFilled } from '@tabler/icons-react';
import WavyBackground from '@components/shared/WavyBackground/WavyBackground';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ProjectSectionCard } from './components/ProjectSectionCard';
import { apiClient } from '@utils/apiClient';
import { ProjectDto, ApplicationDto, BookmarkDto } from '../../../types/api'; // Ensure correct path
import { useAuth } from '@contexts/AuthContext'; // Ensure correct path

// Define the SVG path for the wave shape
const WAVE_PATH = "M 0 39 Q 24 58 52 35 C 59 28 88 23 100 39 L 100 0 L 0 0 Z";

export default function ProjectPage() {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const location = useLocation(); // Get location for redirect state
    const { projectId } = useParams<{ projectId: string }>();
    const { isAuthenticated, userDetails, isLoading: isAuthLoading, initialCheckComplete } = useAuth();

    const [projectData, setProjectData] = useState<ProjectDto | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Loading state for project fetch
    const [error, setError] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [isBookmarking, setIsBookmarking] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false); // Track bookmark status

    const lgPadding = theme.spacing.lg;

    // --- Fetch Project Data ---
    const fetchProject = useCallback(async () => {
        if (!projectId) {
            setError("Project ID not found in URL.");
            setIsLoading(false);
            return;
        }
        console.log(`[ProjectPage] Fetching project data for ID: ${projectId}`);
        setIsLoading(true); setError(null);
        try {
            const data = await apiClient<ProjectDto>(`/projects/${projectId}`);
            setProjectData(data);
        } catch (err: any) {
            console.error('[ProjectPage] Error fetching project data:', err);
            setError(err.data?.message || err.message || 'Failed to load project details.');
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    // --- Fetch Initial Bookmark Status ---
    const fetchInitialBookmarkStatus = useCallback(async () => {
        if (!projectId || !isAuthenticated || !initialCheckComplete) {
            setIsBookmarked(false); // Ensure it's false if not logged in or check not complete
            return;
        }
        console.log(`[ProjectPage] Fetching initial bookmark status for project: ${projectId}`);
        try {
            const bookmarks = await apiClient<BookmarkDto[]>('/users/me/bookmarks');
            const bookmarked = bookmarks.some(b => b.projectId === projectId);
            setIsBookmarked(bookmarked);
            console.log(`[ProjectPage] Project ${projectId} is initially bookmarked: ${bookmarked}`);
        } catch (err: any) {
            // Don't block page load for bookmark status error, just log it
            console.error('[ProjectPage] Error fetching initial bookmark status:', err);
            setIsBookmarked(false); // Assume not bookmarked on error
        }
    }, [projectId, isAuthenticated, initialCheckComplete]);


    useEffect(() => {
        // Fetch project data once projectId is available
        fetchProject();
    }, [fetchProject]); // Re-run if projectId changes

    useEffect(() => {
        // Fetch bookmark status when projectId or auth status changes
        fetchInitialBookmarkStatus();
    }, [fetchInitialBookmarkStatus]); // Dependencies handle re-fetching

    // --- Event Handlers ---
    const handleApplyClick = async () => {
        if (!projectId) return;
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location }, replace: true }); // Pass current location
            return;
        }
        setIsApplying(true); setError(null);
        console.log(`[ProjectPage] Applying to project: ${projectId}`);
        try {
            // Use empty object {} for body as CreateApplicationDto is optional/empty
            await apiClient<ApplicationDto>(`/applications/apply/${projectId}`, {
                method: 'POST',
                body: {}
            });
            navigate('/submitted', { state: { action: 'Applied' } });
        } catch (err: any) {
            console.error('[ProjectPage] Error applying to project:', err);
            setError(err.data?.message || err.message || 'Failed to submit application.');
            setIsApplying(false);
        }
        // No finally block needed for setIsApplying(false) here because we navigate away on success
    };

    const handleBookmarkClick = async () => {
        if (!projectId) return;
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location }, replace: true });
            return;
        }
        setIsBookmarking(true); setError(null);
        const currentBookmarkStatus = isBookmarked; // Store current status before API call
        console.log(`[ProjectPage] Toggling bookmark for project: ${projectId}. Currently bookmarked: ${currentBookmarkStatus}`);
        try {
            if (currentBookmarkStatus) {
                // --- Unbookmark ---
                await apiClient<void>(`/users/me/bookmarks/project/${projectId}`, {
                    method: 'DELETE',
                });
                setIsBookmarked(false);
                console.log('[ProjectPage] Bookmark removed.');
            } else {
                // --- Bookmark ---
                await apiClient<BookmarkDto>(`/users/me/bookmarks/project/${projectId}`, {
                    method: 'POST',
                });
                setIsBookmarked(true);
                console.log('[ProjectPage] Bookmark added.');
            }
        } catch (err: any) {
            console.error('[ProjectPage] Error toggling bookmark:', err);
            // Handle potential errors (e.g., 404 on delete if already removed)
            setError(err.data?.message || err.message || 'Failed to update bookmark.');
            // Optionally revert optimistic UI update: setIsBookmarked(currentBookmarkStatus);
        } finally {
            setIsBookmarking(false);
        }
    };

    // --- Render Loading/Error ---
    // Wait for auth check AND project fetch
    if (isAuthLoading || isLoading || !initialCheckComplete) {
        return ( <Center style={{ height: '80vh' }}> <Loader color="mainPurple.6" /> </Center> );
    }
    if (error && !projectData) { // Only show full page error if project data failed to load initially
        return ( <Container style={{ paddingTop: '5vh' }}> <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" radius="md"> {error} </Alert> </Container> );
    }
    if (!projectData) {
        return ( <Container style={{ paddingTop: '5vh' }}> <Alert icon={<IconAlertCircle size="1rem" />} title="Not Found" color="orange" radius="md"> Project details could not be loaded or the project does not exist. </Alert> </Container> );
    }

    // --- Prepare data for rendering ---
    const { title, tags = [], owner, members = [], description, requiredRoles, requiredSkills = [] } = projectData;
    const currentUserId = userDetails?.id; // Use the backend ID from userDetails
    const isOwner = !!currentUserId && currentUserId === owner.id;
    const isMember = !!currentUserId && members.some(m => m.userId === currentUserId);
    // Use preferredUsername + lastName for owner name
    const ownerName = `${owner.preferredUsername || owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Owner Name';

    // --- Render Logic ---
    return (
        <WavyBackground wavePath={WAVE_PATH} waveHeight={1425} contentPaddingTop={0} extraBottomPadding={0} flipWave={true} >
            <Box p="xl">
                <Container size="md" py="xl" px="xl" bg="rgba(217, 217, 217, 0.40)" style={{ borderRadius: theme.radius.md }} >
                    {/* Display API error for actions (e.g., apply/bookmark failure) */}
                    {error && ( <Alert icon={<IconAlertCircle size="1rem" />} title="Action Error" color="red" withCloseButton onClose={() => setError(null)} mb="lg"> {error} </Alert> )}

                    {/* Project Header */}
                    <Group justify="flex-start" gap="xl" align="center" mb="xl">
                        <Title order={1} c="white" fw={500}> {title} </Title>
                        <Group gap="lg">
                            {tags.map((tag) => ( <Badge key={tag} color="mainOrange.6" c="black" fw={500} variant="filled" size="lg" radius="sm"> {tag} </Badge> ))}
                        </Group>
                    </Group>

                    {/* Content Sections */}
                    <Stack gap="lg">
                        {/* Project Owner Section */}
                        <Paper shadow="sm" radius="md">
                            <Group pt={lgPadding} pb={lgPadding} pr={lgPadding} pl="9%">
                                <Avatar src={undefined /* owner.avatarUrl? */} radius="xl" size="lg" color="gray" />
                                <Stack gap={0}>
                                    <Text size="sm" c="dimmed">Project Owner</Text>
                                    <Text fw={500}>{ownerName}</Text> {/* Updated name format */}
                                </Stack>
                            </Group>
                        </Paper>

                        {/* Current Members Section */}
                        <ProjectSectionCard title="Current Members" contentGap="md">
                            {members.length === 0 ? (
                                <Text size="sm" c="dimmed">No members yet.</Text>
                            ) : (
                                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                                    {members.map((member) => (
                                        <Stack key={member.id} align="left" ta="left" gap="xs">
                                            <Avatar src={undefined /* member.user.avatarUrl? */} radius="xl" size="lg" color="gray" />
                                            {/* Use preferredUsername + lastName */}
                                            <Text fw={500} mt="xs" lh={1.2}>{`${member.user.preferredUsername} ${member.user.lastName}`}</Text>
                                            <Text size="sm" c="dimmed">{member.role}</Text>
                                        </Stack>
                                    ))}
                                </SimpleGrid>
                            )}
                        </ProjectSectionCard>

                        {/* Project Description Section */}
                        <ProjectSectionCard title="Project Description" contentGap="xs">
                            <Text size="sm">{description}</Text>
                        </ProjectSectionCard>

                        {/* Required Roles Section */}
                        <ProjectSectionCard title="Required Roles and Descriptions" contentGap="xs" titleWeight={400}>
                            <Text size="sm">{requiredRoles || 'No specific roles listed.'}</Text>
                        </ProjectSectionCard>

                        {/* Required Skills & Actions Section */}
                        <ProjectSectionCard title="Required Skills" contentGap="md">
                            {requiredSkills.length === 0 ? (
                                <Text size="sm" c="dimmed">No specific skills listed.</Text>
                            ) : (
                                <Group gap="sm">
                                    {requiredSkills.map((skill) => ( <Badge key={skill} color="mainBlue.6" c="black" fw={400} variant="filled" size="lg" radius="xl"> {skill} </Badge> ))}
                                </Group>
                            )}
                            <Group justify="flex-end" mt="md">
                                <Button
                                    variant="outline"
                                    radius="xl"
                                    color="mainPurple.6"
                                    fw={400}
                                    onClick={handleBookmarkClick}
                                    loading={isBookmarking}
                                    disabled={!isAuthenticated || isBookmarking} // Disable if not logged in or action in progress
                                    leftSection={isBookmarked ? <IconBookmarkFilled size={16} /> : <IconBookmark size={16} />}
                                >
                                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                                </Button>
                                <Button
                                    color="mainPurple.6"
                                    variant="filled"
                                    radius="xl"
                                    fw={400}
                                    onClick={handleApplyClick}
                                    loading={isApplying}
                                    disabled={!isAuthenticated || isOwner || isMember || isApplying} // Disable if not logged in, owner, member, or applying
                                >
                                    Apply
                                </Button>
                            </Group>
                        </ProjectSectionCard>
                    </Stack>
                </Container>
            </Box>
        </WavyBackground>
    );
}