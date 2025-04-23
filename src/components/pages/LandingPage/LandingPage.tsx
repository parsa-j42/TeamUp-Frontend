import { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Group, Image, Stack, Text, Title, useMantineTheme, Loader, Alert, Center,
    Container, SimpleGrid, Paper, Anchor
} from '@mantine/core';
import { useNavigate } from "react-router-dom";
import GradientBackground from "@components/shared/GradientBackground/GradientBackground.tsx";
import { ProjectCardProps } from "@components/shared/ProjectCard/ProjectCard.tsx";
import HorizontalProjectScroll from "@components/shared/HorizontalProjectScroll/HorizontalProjectScroll";
import { apiClient } from '@utils/apiClient';
import { ProjectDto, RecommendedProjectDto } from '../../../types/api';
import {
    IconAlertCircle, IconPalette, IconCode, IconBriefcase, IconUsers, IconDeviceTv, IconFlask,
    IconArrowRight
} from '@tabler/icons-react';
import { MyProjectItemCard } from '@components/shared/MyProjectItemCard/MyProjectItemCard.tsx';
import dayjs from 'dayjs';
import { useAuth } from "@contexts/AuthContext.tsx";
import classes from './LandingPage.module.css';

export default function LandingPage() {
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const { isAuthenticated, initialCheckComplete } = useAuth();

    // --- State for API Data ---
    // State for Latest Projects (Fallback)
    const [latestProjects, setLatestProjects] = useState<ProjectDto[]>([]);
    const [isLoadingLatest, setIsLoadingLatest] = useState(true);
    const [latestError, setLatestError] = useState<string | null>(null);

    // State for AI Recommendations (Primary if logged in)
    const [recommendedProjectsAI, setRecommendedProjectsAI] = useState<RecommendedProjectDto[]>([]);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true); // Separate loading state
    const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

    // --- State for My Projects ---
    const [myProjects, setMyProjects] = useState<ProjectDto[]>([]);
    const [isLoadingMyProjects, setIsLoadingMyProjects] = useState(true);
    const [myProjectsError, setMyProjectsError] = useState<string | null>(null);

    // --- Fetch Latest Projects (Fallback) ---
    const fetchLatestProjects = useCallback(async () => {
        console.log('[LandingPage] Fetching latest projects (fallback)...');
        setIsLoadingLatest(true);
        setLatestError(null);
        try {
            const response = await apiClient<{ projects: ProjectDto[], total: number }>('/projects?take=10&skip=0');
            setLatestProjects(response.projects);
        } catch (err: any) {
            console.error('[LandingPage] Error fetching latest projects:', err);
            setLatestError(err.data?.message || err.message || 'Failed to load latest projects.');
            setLatestProjects([]);
        } finally {
            setIsLoadingLatest(false);
        }
    }, []);

    // --- Fetch AI Recommendations ---
    const fetchRecommendations = useCallback(async () => {
        if (!isAuthenticated || !initialCheckComplete) {
            setIsLoadingRecommendations(false);
            setRecommendedProjectsAI([]);
            return; // Don't fetch if not authenticated
        }
        console.log('[LandingPage] Fetching AI recommendations...');
        setIsLoadingRecommendations(true); // Use separate loading state
        setRecommendationsError(null);
        try {
            const response = await apiClient<RecommendedProjectDto[]>('/recommendations/projects');
            setRecommendedProjectsAI(response);
        } catch (err: any) {
            console.error('[LandingPage] Error fetching recommendations:', err);
            if (err.status !== 401) {
                setRecommendationsError(err.data?.message || err.message || 'Could not load recommendations.');
            }
            setRecommendedProjectsAI([]);
        } finally {
            setIsLoadingRecommendations(false);
        }
    }, [isAuthenticated, initialCheckComplete]);

    // --- Fetch My Projects ---
    const fetchMyProjects = useCallback(async () => {
        if (!isAuthenticated || !initialCheckComplete) {
            setIsLoadingMyProjects(false); // Stop loading if not authenticated
            setMyProjects([]); // Ensure it's empty
            return;
        }
        console.log('[LandingPage] Fetching my projects...');
        setIsLoadingMyProjects(true); // Start loading only if authenticated
        setMyProjectsError(null);
        try {
            const data = await apiClient<ProjectDto[]>('/projects/me');
            setMyProjects(data);
        } catch (err: any) {
            console.error('[LandingPage] Error fetching my projects:', err);
            setMyProjectsError(err.data?.message || err.message || 'Failed to load your projects.');
            setMyProjects([]);
        } finally {
            setIsLoadingMyProjects(false);
        }
    }, [isAuthenticated, initialCheckComplete]); // Depend on auth state

    // --- Effects ---
    useEffect(() => {
        // Always fetch latest projects as a baseline/fallback
        fetchLatestProjects();
        // Fetch others based on auth state readiness
        if (initialCheckComplete) {
            fetchRecommendations();
            fetchMyProjects();
        }
    }, [fetchLatestProjects, fetchRecommendations, fetchMyProjects, initialCheckComplete]); // Add initialCheckComplete dependency

    // --- Map Data for Cards ---
    // Updated to pass mentorRequest
    const mapProjectToCardProps = (project: ProjectDto): ProjectCardProps & { id: string } => ({
        id: project.id,
        title: project.title,
        description: project.description,
        skills: project.requiredSkills || [],
        tags: project.tags || [],
        numOfMembers: project.numOfMembers || 'N/A',
        mentorRequest: project.mentorRequest, // Pass mentorRequest
    });

    // Map AI recommendations, including reasons
    const mapAIRecsToCardProps = (rec: RecommendedProjectDto): ProjectCardProps & { id: string } => ({
        ...mapProjectToCardProps(rec.project), // Base mapping
        recommendationReasons: rec.reasons,   // Add reasons
    });

    // Map latest projects (no reasons)
    const latestProjectsForScroll: (ProjectCardProps & { id: string })[] = latestProjects.map(mapProjectToCardProps);
    // Map AI recommendations
    const recommendedAIForScroll: (ProjectCardProps & { id: string })[] = recommendedProjectsAI.map(mapAIRecsToCardProps);

    // --- Determine which projects to display in the "Recommended" section ---
    const displayAIRecommendations = isAuthenticated && initialCheckComplete && !isLoadingRecommendations && recommendedProjectsAI.length > 0;
    const projectsToDisplay = displayAIRecommendations ? recommendedAIForScroll : latestProjectsForScroll;
    const isLoadingSection = displayAIRecommendations ? isLoadingRecommendations : isLoadingLatest;
    const errorSection = displayAIRecommendations ? recommendationsError : latestError;
    const sectionTitle = displayAIRecommendations ? "Recommended For You" : "Latest Projects";

    // Categories data
    const categoryIconSize = 48;
    const categoryIconColor = theme.colors.mainBlue[6];
    const categories = [
        { label: 'Design', icon: <IconPalette size={categoryIconSize} color={categoryIconColor} stroke={1.5}/> },
        { label: 'Development', icon: <IconCode size={categoryIconSize} color={categoryIconColor} stroke={1.5}/> },
        { label: 'Business', icon: <IconBriefcase size={categoryIconSize} color={categoryIconColor} stroke={1.5}/> },
        { label: 'Community', icon: <IconUsers size={categoryIconSize} color={categoryIconColor} stroke={1.5}/> },
        { label: 'Content & Media', icon: <IconDeviceTv size={categoryIconSize} color={categoryIconColor} stroke={1.5}/> },
        { label: 'Science', icon: <IconFlask size={categoryIconSize} color={categoryIconColor} stroke={1.5}/> },
    ];

    // Determine navigation target for Create Project buttons
    const createProjectTarget = isAuthenticated ? "/create-project" : "/SignUp";

    return (
        <Stack gap={0}>
            {/* Top Section */}
            <GradientBackground gradient="linear-gradient(270deg, rgba(255, 255, 255, 1) 0%, rgba(55, 197, 231, 0.3) 50%, rgba(255, 255, 255, 1) 100%)">
                <Box pt="80px" pb="80px" mb="xl" pl="13%" pr="13%">
                    <Group justify="center" align="top" gap="100px" wrap="nowrap">
                        <Stack align="flex-start" gap="xs" style={{ flexShrink: 0 }}>
                            <Title order={1} ta="left" size="46px" fw={600} lh={1.2}>
                                Turn your ideas <br/>into reality. <br/>
                                <Text span c="mainBlue.6" inherit>Build. Collaborate. <br/>Launch.</Text>
                            </Title>
                            <Text size="lg" ta="left" lh={1.4}>
                                Post your project ideas and find the <br/> best‑fit team members.
                            </Text>
                            <Group mt="xl">
                                <Button variant="filled" color="mainBlue.6" radius="md" size="lg" w="195px"
                                        onClick={() => navigate(createProjectTarget)}>Create Project</Button>
                                <Button variant="filled" color="mainBlue.6" radius="md" size="lg" w="195px"
                                        onClick={() => navigate("/Discover")}>Find a Project</Button>
                            </Group>
                        </Stack>
                        <Image src="/landing_image.png" h={450} w="auto" style={{ flexShrink: 0 }}/>
                    </Group>
                </Box>
            </GradientBackground>

            {/* Recommended / Latest Section - UPDATED */}
            <GradientBackground gradient="linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(55, 197, 231, 0.3) 30%, rgba(55, 197, 231, 0.3) 70%, rgba(255, 255, 255, 1) 100%)">
                <Stack pt="50px" pb="50px" pl="13%" pr="0" gap="xl">
                    {/* Use dynamic title */}
                    <Title order={2} size="31px" fw={400}>{sectionTitle}</Title>

                    {/* Handle loading state */}
                    {isLoadingSection && <Center><Loader /></Center>}

                    {/* Handle error state */}
                    {!isLoadingSection && errorSection && (
                        <Container size="lg" px={0}><Alert color="red" title="Error" icon={<IconAlertCircle />}>{errorSection}</Alert></Container>
                    )}

                    {/* Handle no projects found */}
                    {!isLoadingSection && !errorSection && projectsToDisplay.length === 0 && (
                        <Container size="lg" px={0}><Text c="dimmed">No projects found.</Text></Container>
                    )}

                    {/* Display projects */}
                    {!isLoadingSection && !errorSection && projectsToDisplay.length > 0 && (
                        <HorizontalProjectScroll projects={projectsToDisplay} />
                    )}
                </Stack>
            </GradientBackground>

            {/* Explore Project By Category Section */}
            <Container size="lg" py="xl" mt="60px" mb="130px">
                <Stack align="center" gap="lg">
                    <Title order={2} ta="center" size="31px" fw={400}>Explore Project By Category</Title>
                    <Text ta="center" size="lg" c="dimmed" maw={600}>
                        Find projects that match your interests and skills
                    </Text>
                    <SimpleGrid
                        cols={{ base: 2, sm: 3, md: 6 }}
                        spacing="sm"
                        mt="lg"
                        w="100%"
                    >
                        {categories.map((category) => (
                            <Paper
                                key={category.label}
                                component="button"
                                shadow="xl"
                                radius="lg"
                                p="lg"
                                withBorder
                                onClick={() => navigate(`/discover?category=${encodeURIComponent(category.label)}`)}
                                className={classes.categoryPaper} // Use class from CSS module
                            >
                                <Stack align="center" gap="md">
                                    {category.icon}
                                    <Text fw={500} ta="center">{category.label}</Text>
                                </Stack>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Stack>
            </Container>

            {/* My Current Projects Section (Conditional) */}
            {isAuthenticated && initialCheckComplete && !isLoadingMyProjects && myProjects && myProjects.length > 0 && (
                <GradientBackground gradient="">
                    <Container size="lg" py="xl" mt="xl" mb="xl">
                        <Stack gap="lg">
                            <Group justify="space-between" mb="xl">
                                <Title order={2} size="31px" fw={400}>My Current Projects</Title>
                            </Group>
                            {/* No needT for separate loading/error here as it depends on the outer condition */}
                            <Group justify="center" gap="80px">
                                {myProjects.slice(0, 2).map((project) => (
                                    <MyProjectItemCard
                                        key={project.id}
                                        id={project.id}
                                        title={project.title}
                                        date={dayjs(project.createdAt).format('DD MMM YYYY')}
                                        category={project.tags?.[0] || project.projectType || 'General'}
                                        isOngoing={!project.endDate}
                                        members={project.members || []}
                                    />
                                ))}
                            </Group>
                        </Stack>
                        <Group justify="flex-end">
                            <Anchor onClick={() => navigate('/my-projects')} c="dimmed" size="sm">
                                FULL PAGE <IconArrowRight size={14} style={{ verticalAlign: 'middle' }}/>
                            </Anchor></Group>
                    </Container>
                </GradientBackground>
            )}
            {/* Render error for My Projects if applicable and user is logged in */}
            {isAuthenticated && initialCheckComplete && myProjectsError && (
                <Container size="lg" py="xl" mt="xl" mb="xl">
                    <Alert color="red" title="Error Loading Your Projects" icon={<IconAlertCircle />}>{myProjectsError}</Alert>
                </Container>
            )}

            {/* What is TeamUp? Section */}
            <GradientBackground gradient="">
                <Box bg={theme.colors.gray[1]} py={110}>
                    <Container size="lg">
                        <Stack align="center" gap="lg">
                            <Title order={2} ta="center" size="31px" fw={400}>What is TeamUp?</Title>
                            <Text ta="center" size="lg" lh={1.6} maw={700}>
                                TeamUp helps students and creators find the perfect teammates and bring ideas to life.
                                Whether you're starting your own project or joining someone else's — you're in the right place.
                            </Text>
                            <Image src="/TeamUpLogo.svg" h={80} w="285" mt="lg" />
                        </Stack>
                    </Container>
                </Box>
            </GradientBackground>

            {/* Final CTA Section */}
            <GradientBackground
                gradient="linear-gradient(0deg, rgba(55, 197, 231, 0.3) 0%,
                rgba(255, 255, 255, 1) 100%)"
                py={80}
            >
                <Container size="lg">
                    <Stack align="center" gap="xl" py="140px">
                        <Title order={2} ta="center" size="31px" fw={500}>
                            Have an idea? Post your first project now
                        </Title>
                        <Button
                            variant="filled"
                            color={theme.colors.mainBlue[6]}
                            size="md"
                            radius="md"
                            mt="md"
                            onClick={() => navigate(createProjectTarget)} // Use conditional target
                        >
                            Create Project
                        </Button>
                    </Stack>
                </Container>
            </GradientBackground>

        </Stack>
    );
}