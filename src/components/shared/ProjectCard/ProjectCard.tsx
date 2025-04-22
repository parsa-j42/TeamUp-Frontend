import { useState } from 'react';
import { Card, Text, Title, Group, Badge, Stack, Button, Box } from '@mantine/core';
import { IconCheck, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import classes from './ProjectCard.module.css';

// props interface for type safety
export interface ProjectCardProps {
    id?: string;
    title?: string;
    description?: string;
    skills: string[];
    tags: string[];
    numOfMembers?: string;
    showFeedbackBadge?: boolean;
}

/**
 * ProjectCard Component (Flippable)
 *
 * Displays project information on the front (title, skills, tags, members, badge).
 * Flips on click to show description and an Apply button on the back.
 * Uses Mantine UI components and custom CSS for the flip effect.
 *
 * @param id - The unique identifier of the project.
 * @param title - The main title of the project.
 * @param description - A brief description of the project (shown on back).
 * @param skills - An array of strings representing the primary skills required.
 * @param tags - An array of strings representing the project tags.
 * @param numOfMembers - String describing the number of members (e.g., '2-4').
 * @param showFeedbackBadge - If true, displays the "Want Feedback" badge.
 * @param otherProps
 */
export function ProjectCard({
                                id,
                                title = 'Project Title', // Add default
                                description = 'No description available.', // Add default
                                skills = [], // Add default
                                tags = [], // Add default
                                numOfMembers = 'N/A', // Add default
                                showFeedbackBadge = false,
                                ...otherProps
                            }: ProjectCardProps) {
    const navigate = useNavigate();
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // Navigate when the Apply button on the back is clicked
    const handleApplyClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the card flip when clicking the button
        if (id) {
            navigate(`/project/${id}`); // Navigate to specific project page
        } else {
            console.warn('ProjectCard: Missing project ID, cannot navigate.');
        }
    };

    return (
        <Box className={classes.cardContainer} onClick={handleFlip} {...otherProps}>
            <Box className={`${classes.cardInner} ${isFlipped ? classes.cardInnerFlipped : ''}`}>
                {/* --- Front Face --- */}
                <Box className={`${classes.cardFace} ${classes.cardFront}`}>
                    {/* Use Mantine Card for consistent padding and styling inside the face */}
                    <Card
                        padding="lg"
                        radius="lg" /* Inherit radius */
                        h="100%" /* Fill the face */
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            backgroundColor: 'transparent', // Front face div handles background
                            border: 'none', // Front face div handles border
                            boxShadow: 'none', // Inner card doesn't need shadow
                        }}
                    >
                        {/* Top content stack */}
                        <Stack gap="md">
                            <Group gap="xs">
                                <IconUsers size={17} color="grey" />
                                <Text c="dimmed" size="sm">{numOfMembers}</Text>
                            </Group>

                            {/* Project Title */}
                            <Title order={2} size={27} fw={600} c="#1696b6" lineClamp={1}>
                                {title}
                            </Title>

                            {/* Skills Section */}
                            <Group gap="xs" wrap="nowrap">
                                <Text fw={600} size="sm">Primary Skills:</Text>
                                <Group gap={4} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {skills?.slice(0, 3).map((skill, index) => (
                                        <Text key={skill} size="sm" fw={600}>
                                            {skill}{index < (skills.length - 1) && index < 2 ? ',' : ''}
                                        </Text>
                                    ))}
                                    {skills?.length > 3 && <Text size="sm" fw={600}>...</Text>}
                                </Group>
                            </Group>

                            {/* Tags Section */}
                            <Group gap="xs" wrap="nowrap">
                                <Group gap={4} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {tags?.slice(0, 4).map((tag) => (
                                        <Text key={tag} size="sm">
                                            #{tag}
                                        </Text>
                                    ))}
                                    {tags?.length > 4 && <Text size="sm">...</Text>}
                                </Group>
                            </Group>
                        </Stack>

                        {/* Bottom content group (Feedback Badge) */}
                        <Group justify="flex-start" mt="md">
                            {showFeedbackBadge && (
                                <Badge
                                    variant="outline"
                                    color="mainOrange.6"
                                    size="md"
                                    h="25px"
                                    radius="xl"
                                    fw={500}
                                    leftSection={<IconCheck size={14} />}
                                    styles={{
                                        root: {
                                            background: '#fffdf7',
                                            border: `1px solid var(--mantine-color-mainOrange-6)`,
                                            color: 'black',
                                        },
                                        label: { fontSize: '12px' },
                                    }}
                                    style={{ textTransform: 'none' }}
                                >
                                    Want Feedback
                                </Badge>
                            )}
                        </Group>
                    </Card>
                </Box>

                {/* --- Back Face --- */}
                <Box className={`${classes.cardFace} ${classes.cardBack}`}>
                    {/* Back Face Content */}
                    <Stack justify="space-between" h="100%">
                        <Stack gap="sm">
                            <Title order={4} c="#1696b6" fw={600}>Description</Title>
                            <Box className={classes.descriptionText}>
                                <Text>
                                    {description}
                                </Text>
                            </Box>
                        </Stack>
                        <Group justify="flex-end">
                            <Button
                                variant="filled"
                                color="mainPurple.6"
                                radius="xl"
                                onClick={handleApplyClick}
                                disabled={!id} // Disable if no ID
                            >
                                Apply
                            </Button>
                        </Group>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}