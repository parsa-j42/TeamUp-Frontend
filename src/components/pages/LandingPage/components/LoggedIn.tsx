import { Box, Stack, Title, Text, useMantineTheme, ScrollArea } from '@mantine/core';
import RoundedButton from '@components/shared/RoundedButton/RoundedButton.tsx';
import WavyBackground from '@components/shared/WavyBackground/WavyBackground.tsx';
import { ProjectCard } from '@components/shared/ProjectCard/ProjectCard.tsx';
import ProjectListContainer from "@components/shared/ProjectList/ProjectList.tsx";
import styles from '../LandingPage.module.css';
import MyProjectList from "@components/shared/MyProjectsList.tsx";
import {useNavigate} from "react-router-dom";

// SVG paths for wave effects
const TOP_WAVE_PATH = "M 0,60 Q 15,100 40,81 C 60,70 80,0 130,20 L 100,0 L 0,0 Z";
const SECONDARY_WAVE_PATH = "M 0 0 L 0 53 Q 50 83 100 53 L 100 0 Q 50 0 0 0 Z";
const THIRD_WAVE_PATH = "M 0 0 L 0 53 Q 50 53 100 53 L 100 0 Q 50 0 0 0 Z";

// Mock project data
const MOCK_PROJECT_DATA = {
    title: "Project Title",
    description: "Brief Introduction of project. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vestibulum leo a nisi faucibus, non volutpat odio convallis. Nulla facilisi. Sed in est ut diam pulvinar volutpat id ut quam. Nulla placerat vitae est eu ultrices. Phasellus gravida odio quis placerat malesuada. Nulla in dictum tortor.",
    tags: ['Figma', 'Photoshop'],
    showFeedbackBadge: true,
};

export function LoggedIn() {
    const hasProjects = import.meta.env.VITE_HAS_PROJECTS == 'true';
    const theme = useMantineTheme();
    const navigate = useNavigate();

    // Wave dimension configurations
    const topWaveHeight = 500;
    const secondaryWaveHeight = 1340;
    const thirdWaveHeight = 200;

    // Calculate edge positions
    const topWaveEdgeRatio = -10 / 100;
    const secondaryWaveEdgeRatio = 0;
    const thirdWaveEdgeRatio = 0;

    const topWaveOffset = topWaveHeight * topWaveEdgeRatio;
    const secondaryWaveOffset = secondaryWaveHeight * secondaryWaveEdgeRatio;
    const thirdWaveOffset = thirdWaveHeight * thirdWaveEdgeRatio;

    const topSectionPadding = `calc(${topWaveOffset}px + ${theme.spacing.xl})`;
    const secondarySectionPadding = `calc(${secondaryWaveOffset}px + ${theme.spacing.xl})`;
    const thirdSectionPadding = `calc(${thirdWaveOffset}px + ${theme.spacing.xl})`;

    return (
        <Stack gap={0}>
            {/* Top Section with Recommendations */}
            {!hasProjects ? <WavyBackground
                wavePath={TOP_WAVE_PATH}
                waveHeight={topWaveHeight}
                backgroundColor={theme.colors.mainPurple[6]}
                contentPaddingTop={topSectionPadding}
                extraBottomPadding="0px"
            >
                {/* Main Call to Action */}
                <Box pt="50px" pb="150px">
                    <Stack align="flex-start" gap="lg">
                        <Title order={1} ta="left" size="48px" fw={400} lh={1.2}>
                            Make your great ideas <br/> a reality
                        </Title>
                        <Text size="xl" ta="left" c="dimmed" lh={1.4}>
                            Post your project ideas and find the <br/> best‑fit team members.
                        </Text>
                        <RoundedButton
                            color="mainPurple.6"
                            variant="filled"
                            size="lg"
                            mt="md"
                            onClick={() => navigate('/create-project')}
                        >
                            Create New Project
                        </RoundedButton>
                    </Stack>
                </Box>

                <Stack gap="xl">
                    <Title order={2} mt="xl" mb="lg" size="36px" fw={400} c="white">
                        Recommended for you
                    </Title>

                    <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map(() => MOCK_PROJECT_DATA)}/>

                    <Title order={2} mt="xl" mb="xl" size="31px" fw={400} c="white">
                        You<span style={{fontFamily: 'Calibri'}}>'</span>re skilled in
                        <span style={{color: theme.colors.mainOrange[1], position: "relative"}}> Photoshop
                            <span style={{
                                position: "absolute",
                                top: "-15px",
                                right: "-15px",
                                fontSize: "18px"
                            }}>
                                ✨
                            </span>
                        </span><span style={{fontFamily: 'Calibri'}}>{'\u00A0\u00A0'}!</span>
                        How about these projects?
                    </Title>

                    <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map(() => MOCK_PROJECT_DATA)}/>
                </Stack>
            </WavyBackground> :
                <Box>
                    <MyProjectList/>
                    <WavyBackground
                        wavePath={THIRD_WAVE_PATH}
                        waveHeight={thirdWaveHeight}
                        backgroundColor={theme.colors.mainPurple[6]}
                        contentPaddingTop={thirdSectionPadding}
                        extraBottomPadding="0px"
                    >
                    <Stack gap="xl">
                        <Title order={2} mt="150px" mb="lg" size="36px" fw={400} c="white">
                            Recommended for you
                        </Title>

                        <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map(() => MOCK_PROJECT_DATA)}/>

                        <Title order={2} mt="xl" mb="xl" size="31px" fw={400} c="white">
                            You<span style={{fontFamily: 'Calibri'}}>'</span>re skilled in
                            <span style={{color: theme.colors.mainOrange[1], position: "relative"}}> Photoshop
                            <span style={{
                                position: "absolute",
                                top: "-15px",
                                right: "-15px",
                                fontSize: "18px"
                            }}>
                                ✨
                            </span>
                        </span><span style={{fontFamily: 'Calibri'}}>{'\u00A0\u00A0'}!</span>
                            How about these projects?
                        </Title>

                        <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map(() => MOCK_PROJECT_DATA)}/>
                    </Stack>
                </WavyBackground>
                </Box>

            }

            {/* New Projects Section */}
            <WavyBackground
                wavePath={SECONDARY_WAVE_PATH}
                waveHeight={secondaryWaveHeight}
                backgroundColor={theme.colors.mainPurple[6]}
                contentPaddingTop={secondarySectionPadding}
                extraBottomPadding="0px"
            >
                <Box mb="50px">
                    <Title order={2} ta="center" mt="xl" mb="50px" size="36px" fw={400}>
                        New Projects on The Board
                    </Title>
                    <ProjectListContainer />
                </Box>
            </WavyBackground>
        </Stack>
    );
}

interface HorizontalProjectScrollProps {
    theme: any;
    projects: typeof MOCK_PROJECT_DATA[];
}

function HorizontalProjectScroll({ theme, projects }: HorizontalProjectScrollProps) {
    return (
        <Box
            style={{
                marginRight: '-13%',
                width: 'calc(100% + 18%)'
            }}
        >
            <ScrollArea
                scrollbarSize={11}
                offsetScrollbars="x"
                scrollbars="x"
                w="100%"
                overscrollBehavior="contain"
                classNames={{
                    viewport: styles.scrollbarViewport,
                    scrollbar: styles.scrollbar,
                    thumb: styles.scrollbarThumb,
                }}
                onWheel={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }}
            >
                <Box style={{
                    display: 'flex',
                    gap: theme.spacing.md,
                    paddingRight: theme.spacing.xl
                }}>
                    {projects.map((project, index) => (
                        <ProjectCard key={index} {...project} />
                    ))}
                </Box>
            </ScrollArea>
        </Box>
    );
}

export default LoggedIn;