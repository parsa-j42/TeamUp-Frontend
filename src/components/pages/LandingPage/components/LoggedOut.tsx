import {Box, Button, Group, Image, ScrollArea, Stack, Text, Title, useMantineTheme} from '@mantine/core';
import ProjectListContainer from "@components/shared/ProjectList/ProjectList.tsx";
import {useNavigate} from "react-router-dom";
import GradientBackground from "@components/shared/GradientBackground/GradientBackground.tsx";
import {ProjectCard, ProjectCardProps} from "@components/shared/ProjectCard/ProjectCard.tsx";
import styles from "@components/pages/LandingPage/LandingPage.module.css";

const MOCK_PROJECT_DATA: Omit<ProjectCardProps, 'key' | 'id'> = { // Remove id from base mock type
    title: "Campus Buddy",
    description: "Brief Introduction of project. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vestibulum leo a nisi faucibus.",
    skills: ['Figma', 'Photoshop', 'Illustrator'],
    tags: ['Figma', 'Design'],
    showFeedbackBadge: true,
};

// ---------
interface HorizontalProjectScrollProps {
    theme: any;
    // Use ProjectCardProps & require id
    projects: (ProjectCardProps & { id: string })[];
}
function HorizontalProjectScroll({ theme, projects }: HorizontalProjectScrollProps) {
    return (
        <Box style={{ marginRight: '-13%', width: 'calc(100% + 18%)' }} >
            <ScrollArea scrollbarSize={11} offsetScrollbars="x" scrollbars="x" w="100%" overscrollBehavior="contain" classNames={{ viewport: styles.scrollbarViewport, scrollbar: styles.scrollbar, thumb: styles.scrollbarThumb, root: styles.scrollbarRoot }} >
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
// ---------

export function LoggedOut() {
    const navigate = useNavigate();
    const theme = useMantineTheme();

    return (
        <Stack gap={0}>
            {/* Top Section  */}
            <GradientBackground gradient="linear-gradient(270deg, rgba(255, 255, 255, 1) 0%, rgba(55, 197, 231, 0.3) 50%,
             rgba(255, 255, 255, 1) 100%)"
            >
                <Box pt="80px" pb="80px" mb="xl">
                    <Group justify="center" align="top" gap="100px">
                        <Stack align="flex-start" gap="xs">
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
                        <Image src="/landing_image.png" h={450} w="auto"/>
                    </Group>
                </Box>
            </GradientBackground>

            <GradientBackground gradient="linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(55, 197, 231, 0.3) 30%,
             rgba(55, 197, 231, 0.3) 70%, rgba(255, 255, 255, 1) 100%)"
            >
                <Stack pt="50px" pb="50px" ml="13%" mr="13%" gap="xl">
                    <Title>Recommended For You</Title>

                    <HorizontalProjectScroll theme={theme} projects={[...Array(5)].map((_, i) => ({...MOCK_PROJECT_DATA, id: `rec-${i}`}))}/>
                </Stack>
            </GradientBackground>

            {/* New Projects Section */}
            <Box mb="50px" mt="md">
                <Title order={2} ta="center" mt="xl" mb="50px" size="36px" fw={400}>
                    New Projects on The Board
                </Title>
                <ProjectListContainer/>
            </Box>
        </Stack>
    );
}

export default LoggedOut;

