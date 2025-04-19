import { useState, useEffect, useCallback } from 'react';
import {
    Paper, Title, Text, Button, Group, Stack, Divider, ActionIcon, Box, Flex, rem, Avatar,
    Loader, Alert, Center, useMantineTheme // Added Loader, Alert, Center
} from '@mantine/core';
import { IconBox, IconChevronRight, IconAlertCircle } from '@tabler/icons-react'; // Added IconAlertCircle
import '@mantine/core/styles.css';
import { useNavigate } from "react-router-dom";
import { apiClient } from '@utils/apiClient'; // Adjust path
import { ProjectDto } from '../../types/api'; // Adjust path
import dayjs from 'dayjs';

// Project Item component - displays a single project in the list
// Updated to use ProjectDto and navigate on click
function ProjectItem({ project }: { project: ProjectDto }) {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const formattedDate = project.createdAt ? dayjs(project.createdAt).format('DD MMM YYYY') : 'Date Unknown';
    const category = project.projectType || project.tags?.[0] || 'General';

    const handleNavigate = () => {
        navigate(`/projects/${project.id}`);
    };

    return (
        <Flex
            justify="space-between"
            align="center"
            py="md"
            onClick={handleNavigate} // Navigate on click
            style={{ cursor: 'pointer', borderRadius: theme.radius.sm, paddingLeft: theme.spacing.md, paddingRight: theme.spacing.md }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigate(); }}
        >
            <Group>
                <IconBox style={{ width: rem(24), height: rem(24) }} stroke={1.5} color={theme.colors.mainPurple[6]} />
                <Box>
                    <Text fw={500}>{project.title}</Text>
                    <Group gap={4}>
                        <Text size="sm" c="dimmed">Created: {formattedDate}</Text>
                        <Text size="sm" c="dimmed">•</Text>
                        <Text size="sm" c="dimmed">{category}</Text>
                    </Group>
                </Box>
            </Group>

            <Group>
                {/* Display actual members - limited count */}
                <Group gap={-8} style={{ marginRight: '12px' }}>
                    {project.members?.slice(0, 4).map((member, index) => (
                        <Avatar
                            key={member.userId} // Use userId for key if membership ID isn't stable/needed
                            // src={member.user.avatarUrl} // Add avatar if available
                            alt={`${member.user.firstName} ${member.user.lastName}`}
                            radius="xl" size="md" color={theme.colors.gray[5]}
                            style={{ marginLeft: index > 0 ? '-12px' : undefined, border: `1px solid ${theme.white}` }}
                            title={`${member.user.firstName} ${member.user.lastName}`}
                        >
                            {`${member.user.firstName?.[0] || ''}${member.user.lastName?.[0] || ''}`}
                        </Avatar>
                    ))}
                    {(project.members?.length ?? 0) > 4 && (
                        <Avatar radius="xl" size="md" color={theme.colors.gray[3]} style={{ marginLeft: '-12px', border: `1px solid ${theme.white}` }}>
                            <Text size="xs" c="dimmed">+{ (project.members?.length ?? 0) - 4}</Text>
                        </Avatar>
                    )}
                </Group>
                <ActionIcon variant="subtle" color="black">
                    <IconChevronRight size={20} stroke={1.5} />
                </ActionIcon>
            </Group>
        </Flex>
    );
}

// Interface for props passed to this component
// Removed props related to selection, as this version fetches its own data
// and handles navigation internally when used on the landing page.
interface MyProjectListProps {
    // No props needed for this usage context
}

// Main List Component
function MyProjectList({ }: MyProjectListProps) { // Removed props from destructuring
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch projects associated with the current user
    const fetchMyProjects = useCallback(async () => {
        console.log('[MyProjectList] Fetching projects...');
        setIsLoading(true); setError(null);
        try {
            // This assumes the user is authenticated when this component renders
            const data = await apiClient<ProjectDto[]>('/projects/me');
            setProjects(data);
        } catch (err: any) {
            console.error('[MyProjectList] Error fetching projects:', err);
            setError(err.data?.message || err.message || 'Failed to load projects.');
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array, fetch once on mount

    useEffect(() => {
        fetchMyProjects();
    }, [fetchMyProjects]);

    return (
        <Paper p="xl" mt="50px" radius="lg" bg="bgGrey.3">
            <Flex justify="space-between" align="center" mb="xl">
                <Stack gap="xs">
                    <Title order={1}>My Projects</Title>
                    <Text size="sm" c="dimmed">Projects you own or are a member of.</Text>
                </Stack>
                <Group>
                    {/* <Button variant="light" color="gray" radius="md">Drafts</Button> */}
                    <Button variant="filled" color="mainPurple.6" radius="md" onClick={() => navigate('/create-project')}>
                        Create New Project
                    </Button>
                    {/* <ActionIcon variant="subtle" color="gray"><IconDots size={20} stroke={1.5} /></ActionIcon> */}
                </Group>
            </Flex>

            {isLoading && <Center><Loader my="xl" /></Center>}
            {!isLoading && error && <Alert color="red" title="Error" icon={<IconAlertCircle />}>{error}</Alert>}
            {!isLoading && !error && projects.length === 0 && (
                <Text c="dimmed" ta="center" my="xl">You are not currently part of any projects.</Text>
            )}
            {!isLoading && !error && projects.length > 0 && (
                projects.map((project, index) => (
                    <Box key={project.id}>
                        <ProjectItem project={project} />
                        {index < projects.length - 1 && <Divider color="mainOrange.6" size="sm" />}
                    </Box>
                ))
            )}
        </Paper>
    );
}

export default MyProjectList;