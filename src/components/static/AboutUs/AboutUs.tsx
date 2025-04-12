import {
    Avatar,
    Box,
    Container,
    List,
    SimpleGrid,
    Stack,
    Text,
    Title,
    useMantineTheme,
} from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';

// Mock data for team members
const teamMembers = [
    { id: 1, name: 'Full name', role: 'Role title', avatarUrl: '' },
    { id: 2, name: 'Full name', role: 'Role title', avatarUrl: '' },
    { id: 3, name: 'Full name', role: 'Role title', avatarUrl: '' },
    { id: 4, name: 'Full name', role: 'Role title', avatarUrl: '' },
    { id: 5, name: 'Full name', role: 'Role title', avatarUrl: '' },
];

// Wave path from the previous example (ProfilePage)
const BOTTOM_WAVE_PATH = "M 0,6 Q 15,8 40,7 C 60,5 80,5 130,7 L 100,0 L 0,0 Z";

// Component for the bottom wave effect
function BottomWave() {
    const theme = useMantineTheme();
    // Using bgPurple color from theme, with a fallback
    const waveColor = theme.colors.bgPurple ? theme.colors.bgPurple[6] : theme.colors.violet[1];
    const waveHeight = 150;

    return (
        // This Box just defines the height for the SVG wave
        <Box style={{ height: waveHeight, overflow: 'hidden', marginTop: '-1px' /* Helps prevent potential 1px gap */ }}>
            <svg
                viewBox="0 0 100 10" // Using viewBox that matches the path coordinates roughly
                preserveAspectRatio="none"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block', // Prevents extra space below SVG
                    transform: 'scaleY(-1)', // Flips the wave to curve upwards from bottom
                }}
            >
                <path d={BOTTOM_WAVE_PATH} fill={waveColor} />
            </svg>
        </Box>
    );
}

// Main About Us Page Component
export default function AboutUsPage() {
    const theme = useMantineTheme();
    // Using bgPurple color from theme, with a fallback
    const waveColor = theme.colors.bgPurple ? theme.colors.bgPurple[6] : theme.colors.violet[1];
    const topWaveHeight = 500;

    return (
        // Main container Box:
        // - Uses flex column layout to position content and bottom wave.
        // - minHeight ensures it tries to fill vertical space.
        // - overflow: hidden prevents horizontal scrollbars from wave elements.
        // - position: relative is needed for the absolutely positioned top wave.
        <Box style={{
            backgroundColor: theme.white,
            overflow: 'hidden', // Changed from overflowX to hidden to prevent any scrollbars
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%', // Use 100% to fill the AppShell.Main height
        }}>
            {/* Top Wave Element - Absolutely positioned */}
            <Box
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: topWaveHeight,
                    overflow: 'hidden',
                    zIndex: 0, // Behind content
                }}
            >
                {/* Inner Box creates the actual curve shape */}
                <Box
                    style={{
                        width: '150%', // Wider than viewport for full curve effect
                        height: '100%',
                        position: 'absolute',
                        left: '-25%', // Center the wide box
                        bottom: 0,
                        backgroundColor: waveColor,
                        borderTopLeftRadius: '50%', // Creates the curve
                        borderTopRightRadius: '50%',
                        transform: 'scaleY(-1)', // Flips curve downwards
                    }}
                />
            </Box>

            {/* Content Area Container */}
            {/* - flexGrow: 1 makes this container take up available vertical space, pushing the bottom wave down. */}
            {/* - Increased vertical padding (py) and set container size to 'xl'. */}
            <Container size="xl" py={120} style={{ position: 'relative', zIndex: 1, flexGrow: 1 }}>
                {/* Main stack for content sections, increased gap */}
                <Stack gap={70}>
                    {/* About Us Title - Adjusted font weight */}
                    <Title order={1} ta="center" fw={400} fz={42}>About Us</Title> {/* Increased font size slightly */}

                    {/* Welcome Section - Adjusted title font weight */}
                    <Stack gap="lg">
                        <Title order={3} fw={400} fz={28}>Welcome to TeamUp</Title> {/* Adjusted fw, increased size */}
                        <Text size="lg" lh={1.65}>
                            TeamUp is a platform designed to connect individuals with complementary skills, helping them
                            collaborate on meaningful projects. Whether you're a developer, designer, or project manager, we
                            make it easy to find the right team.
                        </Text>
                    </Stack>

                    {/* TeamUp Team Section - Adjusted title font weight */}
                    <Stack gap="xl" align="center">
                        <Title order={3} fw={400} fz={28}>TeamUp Team</Title> {/* Adjusted fw, increased size */}
                        <SimpleGrid cols={{ base: 3, xs: 5 }} spacing="xl" mt="lg">
                            {teamMembers.map((member) => (
                                <Stack key={member.id} align="center" gap={10}>
                                    <Avatar
                                        src={member.avatarUrl || undefined}
                                        size={100}
                                        radius="50%"
                                        color="gray.3"
                                    >
                                        {!member.avatarUrl && <IconPhoto size="3rem" color={theme.colors.gray[6]} />}
                                    </Avatar>
                                    <Text size="lg" fw={500} ta="center">{member.name}</Text> {/* Kept name slightly bolder */}
                                    <Text size="md" c="dimmed" ta="center">{member.role}</Text>
                                </Stack>
                            ))}
                        </SimpleGrid>
                    </Stack>

                    {/* Our Mission Section - Adjusted title font weight */}
                    <Stack gap="lg">
                        <Title order={3} fw={400} fz={28}>Our Mission</Title> {/* Adjusted fw, increased size */}
                        <Text size="lg" lh={1.65}>
                            We aim to bridge the gap between talented individuals and exciting opportunities by providing
                            seamless team-matching and project collaboration tools.
                        </Text>
                    </Stack>

                    {/* What We Offer Section - Adjusted title font weight */}
                    <Stack gap="lg">
                        <Title order={3} fw={400} fz={28}>What We Offer</Title> {/* Adjusted fw, increased size */}
                        <List size="lg" spacing="lg" withPadding listStyleType='disc'>
                            <List.Item>
                                <Text size="lg" component="span" lh={1.65}>
                                    <Text fw={500} component="span">Smart Team Matching</Text> – Connect with teammates based on skills and interests. {/* Kept highlight bolder */}
                                </Text>
                            </List.Item>
                            <List.Item>
                                <Text size="lg" component="span" lh={1.65}>
                                    <Text fw={500} component="span">Project Management Tools</Text> – Organize tasks, set milestones, and track progress. {/* Kept highlight bolder */}
                                </Text>
                            </List.Item>
                            <List.Item>
                                <Text size="lg" component="span" lh={1.65}>
                                    <Text fw={500} component="span">Community & Networking</Text> – Engage with professionals, mentors, and industry experts. {/* Kept highlight bolder */}
                                </Text>
                            </List.Item>
                        </List>
                    </Stack>

                    {/* Join Us Section - Adjusted title font weight */}
                    <Stack gap="lg">
                        <Title order={3} fw={400} fz={28}>Join Us</Title> {/* Adjusted fw, increased size */}
                        <Text size="lg" lh={1.65}>
                            Whether you're looking to start a project or join an existing one, TeamUp helps you find the
                            perfect team and build something great together. Let's collaborate!
                        </Text>
                    </Stack>
                </Stack>
            </Container>

            {/* Bottom Wave Component - Placed after the content container */}
            {/* marginTop: 'auto' pushes this to the bottom of the flex column */}
            {/* zIndex ensures it's visually behind any potential overlapping footer content if needed */}
            <Box style={{ zIndex: 0, marginTop: 'auto' }}>
                <BottomWave />
            </Box>
        </Box>
    );
}