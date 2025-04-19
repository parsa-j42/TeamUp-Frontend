import { Card, Text, Title, Pill, Group, Badge, Stack } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import { useNavigate } from 'react-router-dom';

// props interface for type safety
export interface ProjectCardProps {
    title?: string;
    description?: string;
    tags: string[];
    showFeedbackBadge?: boolean;
}

/**
 * ProjectCard Component
 *
 * Displays project information including title, description, tags,
 * an optional feedback status badge, and an apply button.
 * Uses Mantine UI components for styling.
 *
 * @param title - The main title of the project.
 * @param description - A brief description of the project.
 * @param tags - An array of strings representing the project tags (e.g., tools used).
 * @param showFeedbackBadge - (Optional) If true, displays the "Looking for Feedback" badge. Defaults to false.
 * @param otherProps
 */
export function ProjectCard({ title, description, tags, showFeedbackBadge = false, ...otherProps }: ProjectCardProps) {
    const navigate = useNavigate();
    return (
        // Use Mantine Card as the main container
        <Card shadow="sm" padding="lg" radius="lg" bg="lightPurple.6" withBorder h="400" w="400"
              style={{ maxWidth: 400, maxHeight: 400 }} {...otherProps}>
            {/* Stack component arranges elements vertically with spacing */}
            <Stack gap="md">
                {/* Project Title */}
                <Title order={2} size={30} fw={400}>
                    {title}
                </Title>

                {/* Tags Section */}
                <Group gap="xs"> {/* Group component arranges elements horizontally */}
                    {/* Map over the tags array to render each tag as a Pill */}
                    {tags.map((tag) => (
                        <Pill key={tag} size="md" variant="filled" c="white" bg="mainRed.6">
                            {tag}
                        </Pill>
                    ))}
                </Group>

                {/* Project Description */}
                <Text size="sm" c="dimmed"> {/* Use Mantine Text for the description */}
                    {description}
                </Text>

            </Stack>

            {/* Feedback Status and Apply Button Section */}
            {/* Group justifies content: space-between pushes items to opposite ends */}
            {/*<Group justify="space-between" mt="md">*/}
            {/* Conditionally render the Feedback Badge */}
            <Group justify="space-between" mt="xl">
                {showFeedbackBadge && (
                    <Badge
                        variant="filled"
                        color="mainGreen.6"
                        c="black"
                        size="lg"
                        radius="xl"
                        fw={400}
                        leftSection={<IconCheck size={16} />}
                        styles={{ label: { fontSize: '12px' } }}
                    >
                        Looking for Feedback
                    </Badge>
                )}
                {/* Apply Button - will be pushed right by justify="space-between" */}
                {/* If showFeedbackBadge is false, this becomes the only item on the right */}
                {!showFeedbackBadge && <div style={{ flexGrow: 1 }}></div> /* Spacer to push button right when badge is hidden */}
                <RoundedButton color="mainPurple.6" variant="filled" size="md" fw="400" mt="35px"
                               onClick={() => navigate('/project')}
                >Apply</RoundedButton>
            </Group>
        </Card>
    );
}
