import { useState, useEffect, useCallback } from 'react';
import { Box, Stack, Title, Text, useMantineTheme, ScrollArea, Loader, Alert, Center } from '@mantine/core';
import RoundedButton from '@components/shared/RoundedButton/RoundedButton.tsx'; // Adjust path
import WavyBackground from '@components/shared/WavyBackground/WavyBackground.tsx'; // Adjust path
import { ProjectCard, ProjectCardProps } from '@components/shared/ProjectCard/ProjectCard.tsx'; // Adjust path, import Props type
import ProjectListContainer from "@components/shared/ProjectList/ProjectList.tsx"; // Adjust path
import styles from '../LandingPage.module.css'; // Adjust path
import MyProjectList from "@components/shared/MyProjectsList.tsx"; // Adjust path
import { useNavigate } from "react-router-dom";
import { useAuth } from '@contexts/AuthContext'; // Adjust path
import { apiClient } from '@utils/apiClient'; // Adjust path
import { ProjectDto } from '../../../../types/api'; // Adjust path
import { IconAlertCircle } from '@tabler/icons-react';

// SVG paths for wave effects
const TOP_WAVE_PATH = "M 0,60 Q 15,100 40,81 C 60,70 80,0 130,20 L 100,0 L 0,0 Z";
const SECONDARY_WAVE_PATH = "M 0 0 L 0 53 Q 50 83 100 53 L 100 0 Q 50 0 0 0 Z";
const THIRD_WAVE_PATH = "M 0 0 L 0 53 Q 50 53 100 53 L 100 0 Q 50 0 0 0 Z";

// Mock project data for recommendations
const MOCK_PROJECT_DATA: Omit<ProjectCardProps, 'key'> = {
    title: "Recommended Project",
    description: "Brief Introduction of project. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vestibulum leo a nisi faucibus.",
    tags: ['Figma', 'Design'],
    showFeedbackBadge: true,
    // id: 'mock-id', // Example if ProjectCard needs an ID
};

export function LoggedIn() {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const { isAuthenticated, initialCheckComplete } = useAuth();

    const [myProjects, setMyProjects] = useState<ProjectDto[] | null>(null);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [projectsError, setProjectsError] = useState<string | null>(null);

    const fetchMyProjects = useCallback(async () => {
        if (!isAuthenticated || !initialCheckComplete) {
            setIsLoadingProjects(false); return;
        }
        setIsLoadingProjects(true); setProjectsError(null);
        try {
            const data = await apiClient<ProjectDto[]>('/projects/me');
            setMyProjects(data);
        } catch (err: any) {
            console.error('[LoggedIn Landing] Error fetching my projects:', err);
            setProjectsError(err.data?.message || err.message || 'Failed to load your projects.');
            setMyProjects([]);
        } finally { setIsLoadingProjects(false); }
    }, [isAuthenticated, initialCheckComplete]);

    useEffect(() => {
        fetchMyProjects();
    }, [fetchMyProjects]);

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

    const showInitialCTA = isLoadingProjects || (initialCheckComplete && (!myProjects || myProjects.length === 0));

    return (
        <Stack gap={0}>
            {/* Top Section: CTA or MyProjectList */}
            {showInitialCTA ? (
                <WavyBackground wavePath={TOP_WAVE_PATH} waveHeight={topWaveHeight} backgroundColor={theme.colors.mainPurple[6]} contentPaddingTop={topSectionPadding} extraBottomPadding="0px" >
                    {isLoadingProjects && <Center><Loader color="white" my="xl" /></Center>}
                    {!isLoadingProjects && projectsError && <Alert color="red" title="Error" m="xl" icon={<IconAlertCircle size="1rem"/>}>{projectsError}</Alert>}
                    {!isLoadingProjects && !projectsError && myProjects?.length === 0 && (
                        <Box pt="50px" pb="150px">
                            <Stack align="flex-start" gap="lg">
                                <Title order={1} ta="left" size="48px" fw={400} lh={1.2}> Make your great ideas <br/> a reality </Title>
                                <Text size="xl" ta="left" c="dimmed" lh={1.4}> Post your project ideas and find the <br/> best‑fit team members. </Text>
                                <RoundedButton color="mainPurple.6" variant="filled" size="lg" mt="md" onClick={() => navigate('/create-project')} > Create New Project </RoundedButton>
                            </Stack>
                        </Box>
                    )}
                    {/* Recommendation Section */}
                    {!isLoadingProjects && (
                        <Stack gap="xl" mt={myProjects?.length === 0 ? 0 : 'xl'}>
                            <Title order={2} mt="xl" mb="lg" size="36px" fw={400} c="white"> Recommended for you </Title>
                            <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map((_, i) => ({...MOCK_PROJECT_DATA, id: `rec-${i}`}))}/>
                            <Title order={2} mt="xl" mb="xl" size="31px" fw={400} c="white"> You<span style={{fontFamily: 'Calibri'}}>'</span>re skilled in <span style={{color: theme.colors.mainOrange[1], position: "relative"}}> Photoshop <span style={{position: "absolute", top: "-15px", right: "-15px", fontSize: "18px"}}> ✨ </span> </span><span style={{fontFamily: 'Calibri'}}>{'\u00A0\u00A0'}!</span> How about these projects? </Title>
                            <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map((_, i) => ({...MOCK_PROJECT_DATA, id: `skill-${i}`}))}/>
                        </Stack>
                    )}
                </WavyBackground>
            ) : (
                // User has projects, show MyProjectList first
                <Box>
                    {/* Pass NO props, MyProjectList handles fetch and navigation */}
                    <MyProjectList />
                    {/* Recommendations below MyProjectList */}
                    <WavyBackground wavePath={THIRD_WAVE_PATH} waveHeight={thirdWaveHeight} backgroundColor={theme.colors.mainPurple[6]} contentPaddingTop={thirdSectionPadding} extraBottomPadding="0px" >
                        <Stack gap="xl">
                            <Title order={2} mt="150px" mb="lg" size="36px" fw={400} c="white"> Recommended for you </Title>
                            <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map((_, i) => ({...MOCK_PROJECT_DATA, id: `rec-${i}`}))}/>
                            <Title order={2} mt="xl" mb="xl" size="31px" fw={400} c="white"> You<span style={{fontFamily: 'Calibri'}}>'</span>re skilled in <span style={{color: theme.colors.mainOrange[1], position: "relative"}}> Photoshop <span style={{position: "absolute", top: "-15px", right: "-15px", fontSize: "18px"}}> ✨ </span> </span><span style={{fontFamily: 'Calibri'}}>{'\u00A0\u00A0'}!</span> How about these projects? </Title>
                            <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map((_, i) => ({...MOCK_PROJECT_DATA, id: `skill-${i}`}))}/>
                        </Stack>
                    </WavyBackground>
                </Box>
            )}

            {/* New Projects Section (Remains Mocked) */}
            <WavyBackground wavePath={SECONDARY_WAVE_PATH} waveHeight={secondaryWaveHeight} backgroundColor={theme.colors.mainPurple[6]} contentPaddingTop={secondarySectionPadding} extraBottomPadding="0px" >
                <Box mb="50px">
                    <Title order={2} ta="center" mt="xl" mb="50px" size="36px" fw={400}> New Projects on The Board </Title>
                    <ProjectListContainer />
                </Box>
            </WavyBackground>
        </Stack>
    );
}

// Horizontal Scroll Component
interface HorizontalProjectScrollProps {
    theme: any;
    // Use a type compatible with ProjectCardProps + id
    projects: (Partial<ProjectCardProps> & { id: string })[];
}

function HorizontalProjectScroll({ theme, projects }: HorizontalProjectScrollProps) {
    return (
        <Box style={{ marginRight: '-13%', width: 'calc(100% + 18%)' }} >
            <ScrollArea scrollbarSize={11} offsetScrollbars="x" scrollbars="x" w="100%" overscrollBehavior="contain" classNames={{ viewport: styles.scrollbarViewport, scrollbar: styles.scrollbar, thumb: styles.scrollbarThumb }} >
                <Box style={{ display: 'flex', gap: theme.spacing.md, paddingRight: theme.spacing.xl }}>
                    {/* Spread props, ensuring tags is an array */}
                    {projects.map((project) => (
                        <ProjectCard key={project.id} {...project} tags={project.tags ?? []} />
                    ))}
                </Box>
            </ScrollArea>
        </Box>
    );
}

export default LoggedIn;