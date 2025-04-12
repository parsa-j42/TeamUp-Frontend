import {
    Box,
    Stack,
    useMantineTheme,
    Title,
    Text,
    Group,
    Avatar,
    SimpleGrid,
    ActionIcon,
    Timeline,
    Paper,
    ThemeIcon,
    Divider,
    Button, // Added Button
    Select, // Added Select
    SegmentedControl, // Added SegmentedControl for filters
} from '@mantine/core';
// Removed RoundedButton as it's not used in this section
import WavyBackground from '@components/shared/WavyBackground/WavyBackground.tsx';
import MyProjectList from "@components/shared/MyProjectsList.tsx";
import {
    IconClock,
    IconMail,
    IconArrowRight,
    IconTrash,
    IconPhoto,
    IconPointFilled,
    IconCircleDashed,
    IconChevronDown, // Added for Select dropdown
} from '@tabler/icons-react';
import { useState } from 'react';
import {useNavigate} from "react-router-dom";

// SVG paths for wave effects
const TOP_WAVE_PATH = "M 0,60 Q 15,100 40,81 C 60,70 80,0 130,20 L 100,0 L 0,0 Z";

// Mock project data (can be expanded or moved later)
const MOCK_PROJECT_DATA = {
    title: "Project Title",
    dateRange: "Mar 2025 - Present",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
    teamMembers: [
        { id: 1, name: "Full name", role: "Role title", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique." },
        { id: 2, name: "Full name", role: "Role title", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique." },
        { id: 3, name: "Full name", role: "Role title", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique." },
        { id: 4, name: "Full name", role: "Role title", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique." },
    ],
    milestones: [
        { date: "01.01.2025", title: "Title", active: true },
        { date: "01.02.2025", title: "A very loooong title that goes on multiple lines" },
        { date: "01.03.2025", title: "Title" },
        { date: "01.04.2025", title: "Title" },
    ],
    selectedTask: {
        status: "Status",
        name: "Task Name",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
    }
};

// Mock application data
const MOCK_APPLICATIONS = [
    { id: 1, time: "45 minutes ago", role: "Student's Skill/Applied Role", applicantName: "Applied student name" },
    { id: 2, time: "4 hours ago", role: "Student's Skill/Applied Role", applicantName: "Applied student name" },
    { id: 3, time: "5 days ago", role: "Student's Skill/Applied Role", applicantName: "Applied student name" },
];

// Mock project options for the Select dropdown
const MOCK_PROJECT_OPTIONS = [
    { value: 'project1', label: 'Project Alpha' },
    { value: 'project2', label: 'Project Beta Campaign' },
    { value: 'project3', label: 'Project Gamma Initiative' },
];


export default function DashboardPage() {
    const theme = useMantineTheme();
    const [filter, setFilter] = useState('Received'); // State for the filter buttons
    const [selectedProject, setSelectedProject] = useState<string | null>(null); // State for the select dropdown
    const navigate = useNavigate();

    const handleApplyClick = () => {
        navigate('/submitted', { state: { action: 'Accepted' } });
    };
    // Wave dimension configurations
    const topWaveHeight = 500;

    // Calculate edge positions
    const topWaveEdgeRatio = -10 / 100;

    const topWaveOffset = topWaveHeight * topWaveEdgeRatio;

    const topSectionPadding = `calc(${topWaveOffset}px + ${theme.spacing.xl})`;

    return (
        <Stack gap={0} mb="xl">
            {/* Top Section with Recommendations */}
            <WavyBackground
                wavePath={TOP_WAVE_PATH}
                waveHeight={topWaveHeight}
                backgroundColor={theme.colors.mainPurple[6]}
                contentPaddingTop={topSectionPadding}
                extraBottomPadding="0px" // Adjusted to 0 as the content below will handle spacing
            >
                {/* Main Call to Action */}
                <Box pt="0px" pb="50px"> {/* Reduced bottom padding */}
                    <MyProjectList/>
                </Box>

                {/* Project Details Section - Added based on screenshot */}
                <Stack gap="xl" c="white" pb="xl" px="xl"> {/* Added padding and white text color */}

                    {/* Project Info */}
                    <Stack gap="xs">
                        <Group gap="xs">
                            <IconClock size={16} />
                            <Text size="sm">{MOCK_PROJECT_DATA.dateRange}</Text>
                        </Group>
                        <Title order={1} fw={500}>{MOCK_PROJECT_DATA.title}</Title>
                        <Text size="sm" maw={600}>{MOCK_PROJECT_DATA.description}</Text>
                    </Stack>

                    {/* Team Members */}
                    <Stack gap="md">
                        <Title order={3} fw={500}>Team Members</Title>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                            {MOCK_PROJECT_DATA.teamMembers.map((member) => (
                                <Stack key={member.id} gap="xs" align="left" ta="left">
                                    <Avatar color="gray.3" radius="50%" size={80}>
                                        {/* Using white icon color for better contrast on purple */}
                                        <IconPhoto size="2rem" color={theme.colors.mainPurple[1]} />
                                    </Avatar>
                                    <Text fw={500} size="md">{member.name}</Text>
                                    <Text size="sm" c="gray.4">{member.role}</Text>
                                    <Text size="xs" c="gray.3">{member.description}</Text>
                                    <Group gap="sm" mt="xs" justify="flex-start">
                                        <ActionIcon variant="transparent" color="white">
                                            <IconMail size={18} />
                                        </ActionIcon>
                                        <ActionIcon variant="transparent" color="white">
                                            <IconArrowRight size={18} />
                                        </ActionIcon>
                                        <ActionIcon variant="transparent" color="white">
                                            <IconTrash size={18} />
                                        </ActionIcon>
                                    </Group>
                                </Stack>
                            ))}
                        </SimpleGrid>
                    </Stack>

                    {/* Divider between Project Details and Scope/Milestones */}
                    {/* Removed Divider as per screenshot layout */}

                    {/* Project Scope and Milestones */}
                    <Stack gap="md" mt="xl"> {/* Added margin top for spacing */}
                        <Title order={3} fw={500}>Project Scope and Milestones</Title>
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                            {/* Timeline */}
                            <Box>
                                <Timeline active={0} bulletSize={24} lineWidth={2} color="white">
                                    {MOCK_PROJECT_DATA.milestones.map((item, index) => (
                                        <Timeline.Item
                                            key={index}
                                            // Adjusted title color to white for consistency
                                            title={<Text size="sm" c="white">{item.date}</Text>}
                                            bullet={
                                                item.active ? (
                                                    <ThemeIcon size={24} radius="xl" color="mainOrange.6">
                                                        {/* Changed icon color to yellow as per screenshot */}
                                                        <IconPointFilled size={16} color="yellow" />
                                                    </ThemeIcon>
                                                ) : (
                                                    <ThemeIcon size={24} radius="xl" variant='outline' color="white">
                                                        <IconCircleDashed size={16} />
                                                    </ThemeIcon>
                                                )
                                            }
                                            lineVariant={index === 0 ? 'solid' : 'dashed'} // Dashed line for subsequent items
                                        >
                                            {item.active ? (
                                                // Adjusted background and text color for the active item paper
                                                <Paper radius="md" p="xs" bg={theme.colors.mainOrange[6]} c="black" shadow="xs">
                                                    <Text size="sm" fw={500}>{item.title}</Text>
                                                </Paper>
                                            ) : (
                                                <Text size="sm" c="white" ml={5}>{item.title}</Text>
                                            )}
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </Box>

                            {/* Task Details */}
                            <Stack gap="xs">
                                <Text size="sm" c="gray.3">{MOCK_PROJECT_DATA.selectedTask.status}</Text>
                                <Title order={2} fw={500}>{MOCK_PROJECT_DATA.selectedTask.name}</Title>
                                <Text size="sm" c="gray.3">{MOCK_PROJECT_DATA.selectedTask.description}</Text>
                            </Stack>
                        </SimpleGrid>
                    </Stack>

                </Stack>
            </WavyBackground>

            {/* Applications Section - Added based on screenshot */}
            <Box bg="white" p="xl" style={{ borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.mainPurple[6]}` }} m="xl">
                <Stack gap="lg">
                    {/* Section Header */}
                    <Stack gap="xs">
                        <Title order={2} fw={500}>Application</Title>
                        <Text size="sm">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
                        </Text>
                    </Stack>

                    {/* Filters and Select */}
                    <Stack gap="md">
                        {/* Using SegmentedControl for filters */}
                        <SegmentedControl
                            value={filter}
                            onChange={setFilter}
                            data={[
                                { label: 'View all', value: 'View all' },
                                { label: 'Sent', value: 'Sent' },
                                { label: 'Received', value: 'Received' },
                            ]}
                            color="mainPurple.6" // Use theme color
                            radius="md"
                            styles={(theme) => ({
                                root: {
                                    backgroundColor: 'transparent', // No background for the root
                                    padding: 0, // Remove default padding if any
                                    width: 'fit-content', // Make it fit the content width
                                },
                                label: {
                                    paddingTop: theme.spacing.xs,
                                    paddingBottom: theme.spacing.xs,
                                    paddingLeft: theme.spacing.md,
                                    paddingRight: theme.spacing.md,
                                },
                                control: {
                                    border: 'none', // Remove border from individual controls
                                },
                                indicator: {
                                    // Style the selected indicator
                                    borderRadius: theme.radius.md,
                                    backgroundColor: theme.colors.mainPurple[6],
                                    boxShadow: 'none',
                                },
                            })}
                        />
                        <Select
                            placeholder="Select one of the projects"
                            data={MOCK_PROJECT_OPTIONS}
                            value={selectedProject}
                            onChange={setSelectedProject}
                            rightSection={<IconChevronDown size={16} color={theme.colors.mainPurple[6]} />}
                            radius="md"
                            styles={(theme) => ({
                                input: {
                                    borderColor: theme.colors.mainPurple[2], // Border color matching screenshot
                                    color: theme.colors.mainPurple[6], // Placeholder text color
                                    '::placeholder': {
                                        color: theme.colors.mainPurple[6],
                                    },
                                },
                                dropdown: {
                                    borderColor: theme.colors.mainPurple[2],
                                },
                                option: {
                                    '&[data-selected]': {
                                        backgroundColor: theme.colors.mainPurple[1],
                                        color: theme.colors.mainPurple[8],
                                    },
                                    '&[data-hovered]': {
                                        backgroundColor: theme.colors.mainPurple[0],
                                    },
                                },
                            })}
                        />
                    </Stack>

                    {/* Application List */}
                    <Stack gap="lg">
                        {MOCK_APPLICATIONS.map((app, index) => (
                            <Box key={app.id}>
                                <Group justify="space-between" align="flex-start">
                                    {/* Left side: Time, Role, Applicant */}
                                    <Stack gap="sm">
                                        <Group gap="xs">
                                            <IconClock size={16} color='black' />
                                            <Text size="xs" c="black">{app.time}</Text>
                                        </Group>
                                        <Title order={4} fw={500}>{app.role}</Title>
                                        <Group
                                            gap="xs"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/profile`)}
                                        >
                                            <Avatar color="black" radius="xl" size="sm">
                                                <IconPhoto size="0.8rem" color={theme.colors.gray[6]} />
                                            </Avatar>
                                            <Text size="sm" c="dimmed">{app.applicantName}</Text>
                                        </Group>
                                    </Stack>

                                    {/* Right side: Buttons */}
                                    <Group gap="sm" mt={25}> {/* Added margin top to align buttons roughly */}
                                        <Button
                                            variant="filled"
                                            color="mainPurple.6"
                                            radius="md"
                                            size="sm"
                                            fw={400}
                                            onClick={handleApplyClick}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            variant="outline"
                                            radius="md"
                                            size="sm"
                                            fw={400}
                                            styles={(theme) => ({
                                                root: {
                                                    borderColor: "black", // Match border color
                                                    color: theme.colors.gray[7], // Match text color
                                                    '&:hover': {
                                                        backgroundColor: theme.colors.gray[0], // Slight hover effect
                                                    },
                                                },
                                            })}
                                        >
                                            Decline
                                        </Button>
                                    </Group>
                                </Group>
                                {/* Divider below each application except the last one */}
                                {index < MOCK_APPLICATIONS.length - 1 && <Divider my="lg" color={theme.colors.gray[3]}/>}
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
}