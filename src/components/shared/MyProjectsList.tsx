import { useState, useEffect, useCallback } from 'react';
import {
    Paper, Title, Text, Button, Group, Stack, Divider, ActionIcon, Box, Flex, rem, Avatar,
    Loader, Alert, Center, useMantineTheme
} from '@mantine/core';
import { IconBox, IconChevronRight, IconAlertCircle } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import { useNavigate } from "react-router-dom";
import { apiClient } from '@utils/apiClient';
import { ProjectDto } from '../../types/api';
import dayjs from 'dayjs';

// Project Item component - displays a single project in the list
interface ProjectItemProps {
    project: ProjectDto;
    isSelected: boolean;
    // onClick can either select (Dashboard) or navigate (Landing)
    onClick: (id: string) => void;
}

function ProjectItem({ project, isSelected, onClick }: ProjectItemProps) {
    const theme = useMantineTheme();
    const formattedDate = project.createdAt ? dayjs(project.createdAt).format('DD MMM YYYY') : 'Date Unknown';
    const category = project.projectType || project.tags?.[0] || 'General';

    return (
        <Flex
            justify="space-between"
            align="center"
            py="md"
            onClick={() => onClick(project.id)} // Use the passed onClick handler
            style={{
                cursor: 'pointer',
                backgroundColor: isSelected ? theme.colors.mainPurple[0] : undefined,
                borderRadius: theme.radius.sm,
                paddingLeft: theme.spacing.md,
                paddingRight: theme.spacing.md,
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(project.id); }}
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
                <Group gap={-8} style={{ marginRight: '12px' }}>
                    {project.members?.slice(0, 4).map((member, index) => (
                        <Avatar
                            key={member.userId}
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
interface MyProjectListProps {
    // Optional: Callback to inform parent (DashboardPage) which project was selected
    onSelectProject?: (projectId: string | null) => void;
    // Optional: Pass the currently selected project ID from the parent
    selectedProjectId?: string | null;
}

// Main List Component
function MyProjectList({ onSelectProject, selectedProjectId }: MyProjectListProps) {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch projects associated with the current user
    const fetchMyProjects = useCallback(async () => {
        console.log('[MyProjectList] Fetching projects...');
        setIsLoading(true); setError(null);
        try {
            const data = await apiClient<ProjectDto[]>('/projects/me');
            setProjects(data);
            // If used in Dashboard context and no project is selected, select the first one
            if (onSelectProject && !selectedProjectId && data.length > 0) {
                onSelectProject(data[0].id);
            } else if (onSelectProject && data.length === 0) {
                onSelectProject(null); // Inform parent if no projects
            }
        } catch (err: any) {
            console.error('[MyProjectList] Error fetching projects:', err);
            setError(err.data?.message || err.message || 'Failed to load projects.');
            if (onSelectProject) onSelectProject(null); // Inform parent on error
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onSelectProject]); // Rerun if onSelectProject callback changes (should be stable)
    // Note: selectedProjectId removed from deps to avoid loop if parent updates it based on our callback

    useEffect(() => {
        fetchMyProjects();
    }, [fetchMyProjects]);

    // Determine the action when a project item is clicked
    const handleItemClick = (projectId: string) => {
        if (onSelectProject) {
            // If used in Dashboard, call the selection callback
            onSelectProject(projectId);
        } else {
            // If used elsewhere (like Landing Page), navigate to Dashboard with state
            console.log(`[MyProjectList] Navigating to Dashboard for project: ${projectId}`);
            navigate('/dashboard', { state: { selectedProjectId: projectId } });
        }
    };

    return (
        <Paper p="xl" mt="50px" radius="lg" bg="bgGrey.3">
            <Flex justify="space-between" align="center" mb="xl">
                <Stack gap="xs">
                    <Title order={1}>My Projects</Title>
                    <Text size="sm" c="dimmed">Select a project to view its dashboard.</Text>
                </Stack>
                <Group>
                    <Button variant="filled" color="mainPurple.6" radius="md" onClick={() => navigate('/create-project')}>
                        Create New Project
                    </Button>
                    {/* Removed Drafts/Dots buttons for simplicity */}
                </Group>
            </Flex>

            {isLoading && <Center><Loader my="xl" /></Center>}
            {!isLoading && error && <Alert color="red" title="Error" icon={<IconAlertCircle />}>{error}</Alert>}
            {!isLoading && !error && projects.length === 0 && (
                <Text c="dimmed" ta="center" my="xl">You are not currently part of any projects. Create one to get started!</Text>
            )}
            {!isLoading && !error && projects.length > 0 && (
                projects.map((project, index) => (
                    <Box key={project.id}>
                        <ProjectItem
                            project={project}
                            isSelected={project.id === selectedProjectId} // Highlight if selected
                            onClick={handleItemClick} // Use the conditional handler
                        />
                        {index < projects.length - 1 && <Divider color="mainOrange.6" size="sm" />}
                    </Box>
                ))
            )}
        </Paper>
    );
}

export default MyProjectList;