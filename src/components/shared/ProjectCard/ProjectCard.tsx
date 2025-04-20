import { Card, Text, Title, Pill, Group, Badge, Stack } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import { useNavigate } from 'react-router-dom';

// props interface for type safety
export interface ProjectCardProps {
    id?: string; // Add optional id prop
    title?: string;
    description?: string;
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
export function ProjectCard({ id, title, description, tags, showFeedbackBadge = false, ...otherProps }: ProjectCardProps) {
    const navigate = useNavigate();

    const handleApplyClick = () => {
        if (id) {
            navigate(`/project/${id}`); // Navigate to specific project page
        } else {
            console.warn('ProjectCard: Missing project ID, cannot navigate.');
            // Optionally navigate to a generic discover page or do nothing
            // navigate('/discover');
        }
    };

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
                <Text size="sm" c="dimmed" lineClamp={4}> {/* Use Mantine Text for the description, limit lines */}
                    {description}
                </Text>

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
                        styles={{ label: { fontSize: '12px' } }}
                    >
                        Looking for Feedback
                    </Badge>
                )}
                {/* Spacer to push button right when badge is hidden */}
                {!showFeedbackBadge && <div style={{ flexGrow: 1 }}></div>}
                {/* Apply Button */}
                <RoundedButton
                    color="mainPurple.6"
                    variant="filled"
                    size="md"
                    fw="400"
                    onClick={handleApplyClick} // Use the new handler
                >
                    Apply
                </RoundedButton>
            </Group>
        </Card>
    );
}