import { Card, Text, Title, Group, Badge, Stack } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
// import { useNavigate } from 'react-router-dom';

// props interface for type safety
export interface ProjectCardProps {
    id?: string; // Add optional id prop
    title?: string;
    description?: string;
    skills: string[];
    tags: string[];
    showFeedbackBadge?: boolean;
}

/**
 * ProjectCard Component
 *
 * Displays project information including title, description, tags,
 * an optional feedback status badge, and an apply button that navigates
 * to the project's page if an ID is provided.
 * Uses Mantine UI components for styling.
 *
 * @param id - (Optional) The unique identifier of the project.
 * @param title - The main title of the project.
 * @param description - A brief description of the project.
 * @param tags - An array of strings representing the project tags (e.g., tools used).
 * @param showFeedbackBadge - (Optional) If true, displays the "Looking for Feedback" badge. Defaults to false.
 * @param otherProps
 */
export function ProjectCard({ id, title, description, skills, tags, showFeedbackBadge = false, ...otherProps }: ProjectCardProps) {
    // const navigate = useNavigate();

    // const handleApplyClick = () => {
    //     if (id) {
    //         navigate(`/project/${id}`); // Navigate to specific project page
    //     } else {
    //         console.warn('ProjectCard: Missing project ID, cannot navigate.');
    //         // Optionally navigate to a generic discover page or do nothing
    //         // navigate('/discover');
    //     }
    // };

    return (
        // Use Mantine Card as the main container
        <Card shadow="xl" padding="lg" radius="lg" bg="white" withBorder h="300" w="430" pt="xl"
              style={{ maxWidth: 430, maxHeight: 300 }} {...otherProps}>
            {/* Stack component arranges elements vertically with spacing */}
            <Stack gap="md">
                <Text c="dimmed">TEAMMI</Text>
                {/* Project Title */}
                <Title order={2} size={27} fw={600} c="#1696b6">
                    {title}
                </Title>

                <Group gap="xs">
                    <Text fw={600}>Primary Skills:</Text>
                    {skills.map((skill) => (
                    <Text key={skill} size="md" fw={600}>
                        {skill},
                    </Text>
                ))}
                </Group>
                {/* Tags Section */}
                <Group gap="xs"> {/* Group component arranges elements horizontally */}
                    {/* Map over the tags array to render each tag as a Pill */}
                    {tags.map((tag) => (
                        <Text key={tag} size="md" >
                            #{tag}
                        </Text>
                    ))}
                </Group>

                {/*/!* Project Description *!/*/}
                {/*<Text size="sm" c="dimmed" lineClamp={4}> /!* Use Mantine Text for the description, limit lines *!/*/}
                {/*    {description}*/}
                {/*</Text>*/}

            </Stack>

            {/* Feedback Status and Apply Button Section */}
            <Group justify="space-between" mt="xl" style={{ marginTop: 'auto' }}> {/* Push to bottom */}
                {/* Conditionally render the Feedback Badge */}
                {showFeedbackBadge && (
                    <Badge
                        variant="filled"
                        color="mainGreen.6"
                        c="black"
                        size="lg"
                        radius="xl"
                        fw={400}
                        leftSection={<IconCheck size={16} />}
                        styles={{
                            root: {
                                background: '#fffdf7',
                                border: `2px solid #ffb701`,
                                color: 'var(--mantine-color-white)',
                                '&:hover': {
                                    background: 'var(--mantine-color-red-8)',
                                }
                            },
                            label: {
                                fontSize: '12px'
                            }
                        }}                    >
                        Want Feedback
                    </Badge>
                )}
            </Group>
        </Card>
    );
}