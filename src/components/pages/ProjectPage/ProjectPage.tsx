import {
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
    useMantineTheme,
} from '@mantine/core';
import WavyBackground from '@components/shared/WavyBackground/WavyBackground'; // Adjust path as needed
import { useNavigate } from "react-router-dom";
import { ProjectSectionCard } from './components/ProjectSectionCard';
import { projectData, WAVE_PATH } from './projectPageConstants'; // Import data and constants

/**
 * Renders the detailed view of a specific project.
 * Uses WavyBackground, Paper, and ProjectSectionCard with precise padding and gap control.
 */
export default function ProjectPage() {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const lgPadding = theme.spacing.lg;

    // --- Event Handlers ---
    const handleApplyClick = () => {
        console.log('Applying to project:', projectData.title);
        navigate('/submitted', { state: { action: 'Applied' } });
    };

    const handleBookmarkClick = () => {
        console.log('Bookmark clicked for project:', projectData.title);
    };

    // --- Render Logic ---
    return (
        <WavyBackground
            wavePath={WAVE_PATH}
            waveHeight={1425}
            contentPaddingTop={0}
            extraBottomPadding={0}
            flipWave={true}
        >
            <Box p="xl">
                <Container
                    size="md"
                    py="xl"
                    px="xl"
                    bg="rgba(217, 217, 217, 0.40)"
                    style={{ borderRadius: theme.radius.md }}
                >
                    {/* Project Header */}
                    <Group justify="flex-start" gap="xl" align="center" mb="xl">
                        <Title order={1} c="white" fw={500}>
                            {projectData.title}
                        </Title>
                        <Group gap="lg">
                            {projectData.tags.map((tag) => (
                                <Badge key={tag} color="mainOrange.6" c="black" fw={500} variant="filled" size="lg" radius="sm">
                                    {tag}
                                </Badge>
                            ))}
                        </Group>
                    </Group>

                    {/* Content Sections */}
                    <Stack gap="lg"> {/* This gap controls space BETWEEN cards */}
                        {/* Project Owner Section */}
                        <Paper shadow="sm" radius="md">
                            <Group pt={lgPadding} pb={lgPadding} pr={lgPadding} pl="9%">
                                <Avatar src={projectData.owner.avatarUrl} radius="xl" size="lg" color="gray" />
                                <Stack gap={0}> {/* Original had gap={0} here */}
                                    <Text size="sm" c="dimmed">Project Owner</Text>
                                    <Text fw={500}>{projectData.owner.name}</Text>
                                </Stack>
                            </Group>
                        </Paper>

                        {/* Current Members Section  */}
                        <ProjectSectionCard title="Current Members" contentGap="md">
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                                {projectData.currentMembers.map((member) => (
                                    <Stack key={member.id} align="left" ta="left" gap="xs"> {/* Inner stack for member details */}
                                        <Avatar src={member.avatarUrl} radius="xl" size="lg" color="gray" />
                                        <Text fw={500} mt="xs" lh={0}>{member.name}</Text>
                                        <Text size="sm" c="dimmed">{member.role}</Text>
                                        <Text size="xs">{member.description}</Text>
                                    </Stack>
                                ))}
                            </SimpleGrid>
                        </ProjectSectionCard>

                        {/* Project Description Section - Original used gap="xs" inside */}
                        <ProjectSectionCard title="Project Description" contentGap="xs">
                            <Text size="sm">{projectData.description}</Text>
                        </ProjectSectionCard>

                        {/* Required Roles Section - Original used gap="xs" inside */}
                        <ProjectSectionCard title="Required Roles and Descriptions" contentGap="xs" titleWeight={400}>
                            <Text size="sm">{projectData.requiredRoles}</Text>
                        </ProjectSectionCard>

                        {/* Required Skills & Actions Section - Original used gap="md" inside */}
                        <ProjectSectionCard title="Required Skills" contentGap="md">
                            <Group gap="sm"> {/* Removed mb="md" here, let card's contentGap handle spacing */}
                                {projectData.requiredSkills.map((skill) => (
                                    <Badge key={skill} color="mainBlue.6" c="black" fw={400} variant="filled" size="lg" radius="xl">
                                        {skill}
                                    </Badge>
                                ))}
                            </Group>
                            <Group justify="flex-end" mt="md">
                                <Button variant="outline" radius="xl" color="mainPurple.6" fw={400} onClick={handleBookmarkClick}>
                                    Bookmark
                                </Button>
                                <Button color="mainPurple.6" variant="filled" radius="xl" fw={400} onClick={handleApplyClick}>
                                    Apply
                                </Button>
                            </Group>
                        </ProjectSectionCard>
                    </Stack>
                </Container>
            </Box>
        </WavyBackground>
    );
}