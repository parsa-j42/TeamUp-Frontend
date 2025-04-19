import { useState, useEffect, useCallback } from 'react'; // Added React imports
import {
    Paper, Title, Text, Button, Group, Stack, Divider, ActionIcon, Box, Flex, rem, Avatar,
    Loader, Alert, Center, useMantineTheme
} from '@mantine/core';
import { IconBox, IconChevronRight, IconAlertCircle } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import { useNavigate } from "react-router-dom";
import { apiClient } from '@utils/apiClient';
import { ProjectDto } from '../../types/api';
import dayjs from 'dayjs'; // For date formatting

// Interface for props passed to this component
interface MyProjectListProps {
    // Callback to inform parent (DashboardPage) which project was selected
    onSelectProject: (projectId: string | null) => void;
    // Pass the currently selected project ID from the parent
    selectedProjectId: string | null;
}

// Project Item component - displays a single project in the list
function ProjectItem({ project, onSelect, isSelected }: { project: ProjectDto; onSelect: (id: string) => void; isSelected: boolean }) {
    const theme = useMantineTheme();
    const formattedDate = project.createdAt ? dayjs(project.createdAt).format('DD MMM YYYY') : 'Date Unknown';
    // Display project type or another relevant tag if available
    const category = project.projectType || project.tags?.[0] || 'General'; // Example fallback logic

    return (
        <Flex
            justify="space-between"
            align="center"
            py="md"
            onClick={() => onSelect(project.id)} // Select project on click
            style={{
                cursor: 'pointer',
                backgroundColor: isSelected ? theme.colors.mainPurple[0] : undefined, // Highlight selected
                borderRadius: theme.radius.sm,
                paddingLeft: theme.spacing.md, // Add some padding for highlight
                paddingRight: theme.spacing.md,
            }}
            role="button" // Accessibility
            tabIndex={0} // Accessibility
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(project.id); }} // Accessibility
        >
            <Group>
                {/* You can replace IconBox with something more specific if needed */}
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
                            key={member.userId}
                            // src={member.user.avatarUrl} // Add avatar if available in SimpleUserDto
                            alt={`${member.user.firstName} ${member.user.lastName}`}
                            radius="xl"
                            size="md"
                            color={theme.colors.gray[5]} // Example color
                            style={{ marginLeft: index > 0 ? '-12px' : undefined, border: `1px solid ${theme.white}` }}
                            title={`${member.user.firstName} ${member.user.lastName}`} // Tooltip
                        >
                            {/* Fallback initials */}
                            {`${member.user.firstName?.[0] || ''}${member.user.lastName?.[0] || ''}`}
                        </Avatar>
                    ))}
                    {/* Indicate if more members exist */}
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
            // If no project is currently selected by the parent, select the first one by default
            if (!selectedProjectId && data.length > 0) {
                onSelectProject(data[0].id);
            } else if (data.length === 0) {
                // If user has no projects, inform the parent
                onSelectProject(null);
            }
        } catch (err: any) {
            console.error('[MyProjectList] Error fetching projects:', err);
            setError(err.data?.message || err.message || 'Failed to load projects.');
        } finally {
            setIsLoading(false);
        }
    }, [onSelectProject, selectedProjectId]); // Depend on callback and selectedId

    useEffect(() => {
        fetchMyProjects();
    }, [fetchMyProjects]); // Fetch on mount and when callback changes

    return (
        <Paper p="xl" mt="50px" radius="lg" bg="bgGrey.3">
            <Flex justify="space-between" align="center" mb="xl">
                <Stack gap="xs">
                    <Title order={1}>My Projects</Title>
                    <Text size="sm" c="dimmed">Select a project below to view its details and manage applications.</Text>
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
                <Text c="dimmed" ta="center" my="xl">You are not currently part of any projects. Create one to get started!</Text>
            )}
            {!isLoading && !error && projects.length > 0 && (
                projects.map((project, index) => (
                    <Box key={project.id}>
                        <ProjectItem
                            project={project}
                            onSelect={onSelectProject} // Pass the callback down
                            isSelected={project.id === selectedProjectId} // Indicate if selected
                        />
                        {index < projects.length - 1 && <Divider color="mainOrange.6" size="sm" />}
                    </Box>
                ))
            )}
        </Paper>
    );
}

export default MyProjectList;