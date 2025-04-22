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
import React from 'react';

// Mock data for team members
const teamMembers = [
    { id: 1, name: 'Full name', role: 'Role title', avatarUrl: '' },
    { id: 2, name: 'Full name', role: 'Role title', avatarUrl: '' },
    { id: 3, name: 'Full name', role: 'Role title', avatarUrl: '' },
    { id: 4, name: 'Full name', role: 'Role title', avatarUrl: '' },
    { id: 5, name: 'Full name', role: 'Role title', avatarUrl: '' },
];

// Gradient Background Component
function GradientBackground({ gradient, children }: { gradient: string; children?: React.ReactNode }) {
  return (
    <Box 
      style={{ 
        background: gradient,
        position: 'relative',
        minHeight: '100%',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

// Main About Us Page Component
export default function AboutUsPage() {
    const theme = useMantineTheme();

    return (
        <GradientBackground gradient="linear-gradient(0deg, rgba(55, 197, 231, 0.3) 0%,
                rgba(55, 197, 231, 0.3) 70%, rgba(255, 255, 255, 1) 100%)">
            {/* Content Area Container */}
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
        </GradientBackground>
    );
}
