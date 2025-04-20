import { useState, useEffect, useCallback } from 'react';
import { Box, Stack, Title, Text, useMantineTheme, ScrollArea, Loader, Alert, Center } from '@mantine/core';
import RoundedButton from '@components/shared/RoundedButton/RoundedButton.tsx';
import WavyBackground from '@components/shared/WavyBackground/WavyBackground.tsx';
import { ProjectCard, ProjectCardProps } from '@components/shared/ProjectCard/ProjectCard.tsx';
import ProjectListContainer from "@components/shared/ProjectList/ProjectList.tsx";
import styles from '../LandingPage.module.css';
import MyProjectList from "@components/shared/MyProjectsList.tsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@contexts/AuthContext';
import { apiClient } from '@utils/apiClient';
import { ProjectDto } from '../../../../types/api';
import { IconAlertCircle } from '@tabler/icons-react';

// SVG paths for wave effects
const TOP_WAVE_PATH = "M 0,60 Q 15,100 40,81 C 60,70 80,0 130,20 L 100,0 L 0,0 Z";
const SECONDARY_WAVE_PATH = "M 0 0 L 0 53 Q 50 83 100 53 L 100 0 Q 50 0 0 0 Z";
const THIRD_WAVE_PATH = "M 0 0 L 0 53 Q 50 53 100 53 L 100 0 Q 50 0 0 0 Z";

// Mock project data for recommendations
const MOCK_PROJECT_DATA: Omit<ProjectCardProps, 'key' | 'id'> = { // Remove id from base mock type
    title: "Recommended Project",
    description: "Brief Introduction of project. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vestibulum leo a nisi faucibus.",
    tags: ['Figma', 'Design'],
    showFeedbackBadge: true,
};

export function LoggedIn() {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const { isAuthenticated, initialCheckComplete } = useAuth();

    const [myProjects, setMyProjects] = useState<ProjectDto[] | null>(null);
    const [isLoadingMyProjects, setIsLoadingMyProjects] = useState(true);
    const [myProjectsError, setMyProjectsError] = useState<string | null>(null);

    // --- State for Latest Projects ---
    const [latestProjects, setLatestProjects] = useState<ProjectDto[]>([]);
    const [isLoadingLatestProjects, setIsLoadingLatestProjects] = useState(true);
    const [latestProjectsError, setLatestProjectsError] = useState<string | null>(null);
    // --------------------------------

    const fetchMyProjects = useCallback(async () => {
        if (!isAuthenticated || !initialCheckComplete) {
            setIsLoadingMyProjects(false); return;
        }
        setIsLoadingMyProjects(true); setMyProjectsError(null);
        try {
            const data = await apiClient<ProjectDto[]>('/projects/me');
            setMyProjects(data);
        } catch (err: any) {
            console.error('[LoggedIn Landing] Error fetching my projects:', err);
            setMyProjectsError(err.data?.message || err.message || 'Failed to load your projects.');
            setMyProjects([]);
        } finally { setIsLoadingMyProjects(false); }
    }, [isAuthenticated, initialCheckComplete]);

    // --- Fetch Latest Projects ---
    const fetchLatestProjects = useCallback(async () => {
        // No auth check needed for public latest projects
        console.log('[LoggedIn Landing] Fetching latest projects...');
        setIsLoadingLatestProjects(true); setLatestProjectsError(null);
        try {
            // Fetch e.g., the first 10 projects sorted by creation date (default backend sorting)
            const response = await apiClient<{ projects: ProjectDto[], total: number }>('/projects?take=10&skip=0');
            setLatestProjects(response.projects);
        } catch (err: any) {
            console.error('[LoggedIn Landing] Error fetching latest projects:', err);
            setLatestProjectsError(err.data?.message || err.message || 'Failed to load latest projects.');
            setLatestProjects([]);
        } finally {
            setIsLoadingLatestProjects(false);
        }
    }, []); // No dependencies needed if it runs once on mount

    useEffect(() => {
        fetchMyProjects();
        fetchLatestProjects(); // Fetch latest projects on mount
    }, [fetchMyProjects, fetchLatestProjects]); // Add fetchLatestProjects

    // Wave dimension configurations
    const topWaveHeight = 500;
    const secondaryWaveHeight = 1340;
    const thirdWaveHeight = 200;
    const topWaveEdgeRatio = -10 / 100;
    const secondaryWaveEdgeRatio = 0;
    const thirdWaveEdgeRatio = 0;
    const topWaveOffset = topWaveHeight * topWaveEdgeRatio;
    const secondaryWaveOffset = secondaryWaveHeight * secondaryWaveEdgeRatio;
    const thirdWaveOffset = thirdWaveHeight * thirdWaveEdgeRatio;
    const topSectionPadding = `calc(${topWaveOffset}px + ${theme.spacing.xl})`;
    const secondarySectionPadding = `calc(${secondaryWaveOffset}px + ${theme.spacing.xl})`;
    const thirdSectionPadding = `calc(${thirdWaveOffset}px + ${theme.spacing.xl})`;

    const showInitialCTA = isLoadingMyProjects || (initialCheckComplete && (!myProjects || myProjects.length === 0));

    // Prepare data for the latest projects scroll view
    const latestProjectsForScroll: (ProjectCardProps & { id: string })[] = latestProjects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        tags: p.tags || [],
        // Determine showFeedbackBadge based on your logic, e.g., mentorRequest field
        showFeedbackBadge: p.mentorRequest === 'looking',
    }));

    return (
        <Stack gap={0}>
            {/* Top Section: CTA or MyProjectList */}
            {showInitialCTA ? (
                <WavyBackground wavePath={TOP_WAVE_PATH} waveHeight={topWaveHeight} backgroundColor={theme.colors.mainPurple[6]} contentPaddingTop={topSectionPadding} extraBottomPadding="0px" >
                    {isLoadingMyProjects && <Center><Loader color="white" my="xl" /></Center>}
                    {!isLoadingMyProjects && myProjectsError && <Alert color="red" title="Error" m="xl" icon={<IconAlertCircle size="1rem"/>}>{myProjectsError}</Alert>}
                    {!isLoadingMyProjects && !myProjectsError && myProjects?.length === 0 && (
                        <Box pt="50px" pb="150px">
                            <Stack align="flex-start" gap="lg">
                                <Title order={1} ta="left" size="48px" fw={400} lh={1.2}> Make your great ideas <br/> a reality </Title>
                                <Text size="xl" ta="left" c="dimmed" lh={1.4}> Post your project ideas and find the <br/> best‑fit team members. </Text>
                                <RoundedButton color="mainPurple.6" variant="filled" size="lg" mt="md" onClick={() => navigate('/create-project')} > Create New Project </RoundedButton>
                            </Stack>
                        </Box>
                    )}
                    {/* Recommendation & Latest Projects Section (when no user projects) */}
                    {!isLoadingMyProjects && (
                        <Stack gap="xl" mt={myProjects?.length === 0 ? 0 : 'xl'}>
                            <Title order={2} mt="xl" mb="lg" size="36px" fw={400} c="white"> Recommended for you </Title>
                            <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map((_, i) => ({...MOCK_PROJECT_DATA, id: `rec-${i}`}))}/>

                            {/* Latest Projects Section */}
                            <Title order={2} mt="xl" mb="xl" size="31px" fw={400} c="white"> Latest Projects on the Board </Title>
                            {isLoadingLatestProjects && <Center><Loader color="white" my="sm" /></Center>}
                            {!isLoadingLatestProjects && latestProjectsError && <Alert color="red" title="Error Loading Latest Projects" m="sm" icon={<IconAlertCircle size="1rem"/>}>{latestProjectsError}</Alert>}
                            {!isLoadingLatestProjects && !latestProjectsError && (
                                <HorizontalProjectScroll theme={theme} projects={latestProjectsForScroll}/>
                            )}
                        </Stack>
                    )}
                </WavyBackground>
            ) : (
                // User has projects, show MyProjectList first
                <Box>
                    <MyProjectList />
                    {/* Recommendations & Latest Projects below MyProjectList */}
                    <WavyBackground wavePath={THIRD_WAVE_PATH} waveHeight={thirdWaveHeight} backgroundColor={theme.colors.mainPurple[6]} contentPaddingTop={thirdSectionPadding} extraBottomPadding="0px" >
                        <Stack gap="xl">
                            <Title order={2} mt="150px" mb="lg" size="36px" fw={400} c="white"> Recommended for you </Title>
                            <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map((_, i) => ({...MOCK_PROJECT_DATA, id: `rec-${i}`}))}/>

                            {/* Latest Projects Section */}
                            <Title order={2} mt="xl" mb="xl" size="31px" fw={400} c="white"> Latest Projects on the Board </Title>
                            {isLoadingLatestProjects && <Center><Loader color="white" my="sm" /></Center>}
                            {!isLoadingLatestProjects && latestProjectsError && <Alert color="red" title="Error Loading Latest Projects" m="sm" icon={<IconAlertCircle size="1rem"/>}>{latestProjectsError}</Alert>}
                            {!isLoadingLatestProjects && !latestProjectsError && (
                                <HorizontalProjectScroll theme={theme} projects={latestProjectsForScroll}/>
                            )}
                        </Stack>
                    </WavyBackground>
                </Box>
            )}

            {/* New Projects Section (Remains Mocked - Consider replacing with API call too) */}
            <WavyBackground wavePath={SECONDARY_WAVE_PATH} waveHeight={secondaryWaveHeight} backgroundColor={theme.colors.mainPurple[6]} contentPaddingTop={secondarySectionPadding} extraBottomPadding="0px" >
                <Box mb="50px">
                    <Title order={2} ta="center" mt="xl" mb="50px" size="36px" fw={400}> New Projects on The Board </Title>
                    <ProjectListContainer /> {/* This still shows mock data */}
                </Box>
            </WavyBackground>
        </Stack>
    );
}

// Horizontal Scroll Component
interface HorizontalProjectScrollProps {
    theme: any;
    // Use ProjectCardProps & require id
    projects: (ProjectCardProps & { id: string })[];
}

function HorizontalProjectScroll({ theme, projects }: HorizontalProjectScrollProps) {
    return (
        <Box style={{ marginRight: '-13%', width: 'calc(100% + 18%)' }} >
            <ScrollArea scrollbarSize={11} offsetScrollbars="x" scrollbars="x" w="100%" overscrollBehavior="contain" classNames={{ viewport: styles.scrollbarViewport, scrollbar: styles.scrollbar, thumb: styles.scrollbarThumb }} >
                <Box style={{ display: 'flex', gap: theme.spacing.md, paddingRight: theme.spacing.xl, paddingBottom: '20px' }}> {/* Added paddingBottom */}
                    {/* Pass down all props including the id */}
                    {projects.map((project) => (
                        <ProjectCard key={project.id} {...project} />
                    ))}
                </Box>
            </ScrollArea>
        </Box>
    );
}

export default LoggedIn;