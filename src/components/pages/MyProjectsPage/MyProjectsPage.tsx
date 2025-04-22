import { useState, useEffect, useCallback } from 'react';
import {
    Container, Stack, Title, Text, Group, Button,
    SimpleGrid, Loader, Alert, Center
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";
import { apiClient } from '@utils/apiClient';
import { ProjectDto } from '../../../types/api';
import { useAuth } from '@contexts/AuthContext';
import { MyProjectItemCard } from '@components/shared/MyProjectItemCard/MyProjectItemCard'; // Adjust path if needed
import dayjs from 'dayjs';
import classes from './MyProjectsPage.module.css';
import GradientBackground from "@components/shared/GradientBackground/GradientBackground.tsx";

export default function MyProjectsPage() {
    const navigate = useNavigate();
    const { isAuthenticated, initialCheckComplete } = useAuth();

    const [myProjects, setMyProjects] = useState<ProjectDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMyProjects = useCallback(async () => {
        // Only fetch if authenticated and initial check is done
        if (!isAuthenticated || !initialCheckComplete) {
            setIsLoading(false);
            setMyProjects([]); // Ensure it's empty if not authenticated
            return;
        }
        console.log('[MyProjectsPage] Fetching my projects...');
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all projects user is part of (owned or member)
            const data = await apiClient<ProjectDto[]>('/projects/me');
            setMyProjects(data);
        } catch (err: any) {
            console.error('[MyProjectsPage] Error fetching my projects:', err);
            setError(err.data?.message || err.message || 'Failed to load your projects.');
            setMyProjects([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, initialCheckComplete]);

    useEffect(() => {
        // Fetch myProjects only when auth state is confirmed
        if (initialCheckComplete) {
            fetchMyProjects();
        }
    }, [fetchMyProjects, initialCheckComplete]); // Add initialCheckComplete dependency

    return (
        <GradientBackground className={classes.pageWrapper} gradient="linear-gradient(180deg, rgba(55, 197, 231, 0.3) 0%,
                rgba(55, 197, 231, 0.3) 70%, rgba(255, 255, 255, 1) 100%)">
            <Container size="lg">
                <Stack gap="xl">
                    {/* Header Section */}
                    <Group justify="space-between" className={classes.headerGroup}>
                        <Stack gap={0}>
                            <Title order={1} className={classes.title}>My Projects</Title>
                            <Text size="sm">
                                Here are the projects you're currently working on.
                            </Text>
                        </Stack>
                        <Group>
                            <Button variant="outline" radius="md" className={classes.draftsButton}>
                                Drafts
                            </Button>
                            <Button
                                variant="filled"
                                radius="md"
                                className={classes.actionButton}
                                onClick={() => navigate('/create-project')}
                            >
                                Create New Project
                            </Button>
                            {/* Placeholder Menu for future actions */}
                            {/*<Menu shadow="md" width={200}>*/}
                            {/*    <Menu.Target>*/}
                            {/*        <ActionIcon variant="outline" size="lg" radius="md" className={classes.menuButton}>*/}
                            {/*            <IconDots size={18} />*/}
                            {/*        </ActionIcon>*/}
                            {/*    </Menu.Target>*/}
                            {/*    /!*<Menu.Dropdown>*!/*/}
                            {/*        /!*<Menu.Label>Options</Menu.Label>*!/*/}
                            {/*        /!*<Menu.Item>Option 1</Menu.Item>*!/*/}
                            {/*        /!*<Menu.Item>Option 2</Menu.Item>*!/*/}
                            {/*    /!*</Menu.Dropdown>*!/*/}
                            {/*</Menu>*/}
                        </Group>
                    </Group>

                    {/* Projects Grid Section */}
                    {isLoading && <Center><Loader /></Center>}
                    {!isLoading && error && (
                        <Alert color="red" title="Error Loading Projects" icon={<IconAlertCircle />}>
                            {error}
                        </Alert>
                    )}
                    {!isLoading && !error && myProjects.length === 0 && (
                        <Center mih={200}>
                            <Text c="dimmed">You are not part of any projects yet.</Text>
                        </Center>
                    )}
                    {!isLoading && !error && myProjects.length > 0 && (
                        <SimpleGrid
                            cols={{ base: 1, md: 2 }} // Responsive columns
                            spacing="xl"
                            className={classes.projectsGrid}
                        >
                            {myProjects.map((project) => (
                                <MyProjectItemCard
                                    key={project.id}
                                    id={project.id}
                                    title={project.title}
                                    // Format date - using createdAt as example
                                    date={dayjs(project.createdAt).format('DD MMM YYYY')}
                                    // Determine category - using first tag or projectType
                                    category={project.tags?.[0] || project.projectType || 'General'}
                                    // Determine if ongoing - example: no end date means ongoing
                                    isOngoing={!project.endDate}
                                    members={project.members || []}
                                />
                            ))}
                        </SimpleGrid>
                    )}
                </Stack>
            </Container>
        </GradientBackground>
    );
}