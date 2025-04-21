import { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Group, Image, Stack, Text, Title, useMantineTheme, Loader, Alert, Center,
    Container, SimpleGrid, Paper
} from '@mantine/core';
import { useNavigate } from "react-router-dom";
import GradientBackground from "@components/shared/GradientBackground/GradientBackground.tsx";
import { ProjectCardProps } from "@components/shared/ProjectCard/ProjectCard.tsx";
import HorizontalProjectScroll from "@components/shared/HorizontalProjectScroll/HorizontalProjectScroll";
import { apiClient } from '@utils/apiClient';
import { ProjectDto } from '../../../../types/api';
import {
    IconAlertCircle, IconPalette, IconCode, IconBriefcase, IconUsers, IconDeviceTv, IconFlask
} from '@tabler/icons-react';

export function LoggedOut() {
    const navigate = useNavigate();
    const theme = useMantineTheme();

    // --- State for API Data ---
    const [recommendedProjects, setRecommendedProjects] = useState<ProjectDto[]>([]);
    const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
    const [recommendedError, setRecommendedError] = useState<string | null>(null);

    // Removed state related to Newest Projects

    // --- Fetch Recommended Projects (Using latest for now) ---
    const fetchRecommendedProjects = useCallback(async () => {
        console.log('[LoggedOut Landing] Fetching recommended (latest) projects...');
        setIsLoadingRecommended(true);
        setRecommendedError(null);
        try {
            const response = await apiClient<{ projects: ProjectDto[], total: number }>('/projects?take=10&skip=0');
            setRecommendedProjects(response.projects);
        } catch (err: any) {
            console.error('[LoggedOut Landing] Error fetching recommended projects:', err);
            setRecommendedError(err.data?.message || err.message || 'Failed to load recommended projects.');
            setRecommendedProjects([]);
        } finally {
            setIsLoadingRecommended(false);
        }
    }, []);

    // Removed fetchNewestProjects function

    useEffect(() => {
        fetchRecommendedProjects();
        // Removed fetchNewestProjects call
    }, [fetchRecommendedProjects]);

    // --- Map Data for Cards ---
    const mapProjectToCardProps = (project: ProjectDto): ProjectCardProps & { id: string } => ({
        id: project.id,
        title: project.title,
        description: project.description,
        skills: project.requiredSkills || [],
        tags: project.tags || [],
        numOfMembers: project.numOfMembers || 'N/A', // Pass numOfMembers
        showFeedbackBadge: project.mentorRequest === 'looking',
    });

    const recommendedProjectsForScroll: (ProjectCardProps & { id: string })[] = recommendedProjects.map(mapProjectToCardProps);
    // Removed newestProjectsForScroll mapping

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
                                        onClick={() => navigate("/SignUp")}>Create Project</Button>
                                <Button variant="filled" color="mainBlue.6" radius="md" size="lg" w="195px"
                                        onClick={() => navigate("/Discover")}>Find a Project</Button>
                            </Group>
                        </Stack>
                        <Image src="/landing_image.png" h={450} w="auto" style={{ flexShrink: 0 }}/>
                    </Group>
                </Box>
            </GradientBackground>

            {/* Recommended Section */}
            <GradientBackground gradient="linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(55, 197, 231, 0.3) 30%, rgba(55, 197, 231, 0.3) 70%, rgba(255, 255, 255, 1) 100%)">
                <Stack pt="50px" pb="50px" pl="13%" pr="0" gap="xl">
                    <Title order={2} size="31px" fw={400}>Recommended For You</Title>
                    {isLoadingRecommended && <Center><Loader /></Center>}
                    {recommendedError && <Alert color="red" title="Error" icon={<IconAlertCircle />}>{recommendedError}</Alert>}
                    {!isLoadingRecommended && !recommendedError && recommendedProjectsForScroll.length === 0 && <Text c="dimmed">No recommendations found.</Text>}
                    {!isLoadingRecommended && !recommendedError && recommendedProjectsForScroll.length > 0 && (
                        <HorizontalProjectScroll projects={recommendedProjectsForScroll} />
                    )}
                </Stack>
            </GradientBackground>

            {/* --- NEW: Explore Project By Category Section --- */}
            <Container size="lg" py="xl" mt="xl" mb="xl">
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
                                shadow="xl"
                                radius="lg"
                                p="lg"
                                withBorder
                                style={{ cursor: 'pointer' }} // Make it look clickable
                                // onClick={() => navigate(`/discover?category=${category.label}`)} // Optional navigation
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
            {/* --- END: Explore Project By Category Section --- */}


            {/* --- NEW: What is TeamUp? Section --- */}
            <GradientBackground gradient="">
            <Box bg={theme.colors.gray[1]} py={110}> {/* Use theme color */}
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
            {/* --- END: What is TeamUp? Section --- */}


            {/* --- NEW: Final CTA Section --- */}
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
                            color={theme.colors.mainBlue[6]} // Text color matching background
                            size="md"
                            radius="md"
                            mt="md"
                            onClick={() => navigate("/SignUp")} // Navigate to SignUp
                        >
                            Create Project
                        </Button>
                    </Stack>
                </Container>
            </GradientBackground>
            {/* --- END: Final CTA Section --- */}

            {/* Removed "New Projects on The Board" Section */}
        </Stack>
    );
}

export default LoggedOut;