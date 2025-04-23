import { Card, Text, Title, Group, Badge, Stack, Button, Box } from '@mantine/core';
import { IconUsers, IconMessageCircleQuestion, IconSparkles, IconCoffee, IconBulb } from '@tabler/icons-react'; // Added icons
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
    // Removed showFeedbackBadge, added mentorRequest
    mentorRequest?: string; // e.g., 'looking', 'open', 'one-time'
    // Added recommendationReasons
    recommendationReasons?: string[];
}

/**
 * ProjectCard Component (Flippable) - Updated
 *
 * Displays project information on the front (title, skills, tags, members, specific mentor badge).
 * Displays AI recommendation reasons if provided.
 * Flips on hover to show description and an Apply button on the back.
 */
export function ProjectCard({
                                id,
                                title = 'Project Title',
                                description = 'No description available.',
                                skills = [],
                                tags = [],
                                numOfMembers = 'N/A',
                                mentorRequest, // Use mentorRequest directly
                                recommendationReasons = [], // Default to empty array
                                ...otherProps
                            }: ProjectCardProps) {
    const navigate = useNavigate();

    const handleApplyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (id) {
            navigate(`/project/${id}`);
        } else {
            console.warn('ProjectCard: Missing project ID, cannot navigate.');
        }
    };

    // --- Mentor Badge Logic ---
    const renderMentorBadge = () => {
        switch (mentorRequest) {
            case 'looking':
                return (
                    <Badge
                        variant="outline"
                        color="mainOrange.6" // Orange for looking
                        size="md" h="25px" radius="xl" fw={500}
                        leftSection={<IconBulb size={14} />}
                        styles={{ root: { background: '#fffdf7', border: `1px solid var(--mantine-color-mainOrange-6)`, color: 'black', textTransform: 'none' }, label: { fontSize: '12px' } }}
                    >
                        Looking for Mentor
                    </Badge>
                );
            case 'open':
                return (
                    <Badge
                        variant="outline"
                        color="mainBlue.6" // Blue for open
                        size="md" h="25px" radius="xl" fw={500}
                        leftSection={<IconMessageCircleQuestion size={14} />}
                        styles={{ root: { background: '#f0f9ff', border: `1px solid var(--mantine-color-mainBlue-6)`, color: 'black', textTransform: 'none' }, label: { fontSize: '12px' } }}
                    >
                        Open to Feedback
                    </Badge>
                );
            case 'one-time':
                return (
                    <Badge
                        variant="outline"
                        color="mainPurple.6" // Purple for one-time
                        size="md" h="25px" radius="xl" fw={500}
                        leftSection={<IconCoffee size={14} />}
                        styles={{ root: { background: '#f8f0ff', border: `1px solid var(--mantine-color-mainPurple-6)`, color: 'black', textTransform: 'none' }, label: { fontSize: '12px' } }}
                    >
                        One-time Chat
                    </Badge>
                );
            default:
                return null; // No badge if no specific request
        }
    };
    // --- End Mentor Badge Logic ---

    return (
        <Box className={classes.cardContainer} {...otherProps}>
            <Box className={classes.cardInner}>
                {/* --- Front Face --- */}
                <Box className={`${classes.cardFace} ${classes.cardFront}`}>
                    <Card
                        padding="lg" radius="lg" h="100%"
                        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
                    >
                        {/* Top content stack */}
                        <Stack gap="md">
                            <Group gap="xs">
                                <IconUsers size={17} color="grey" />
                                <Text c="dimmed" size="sm">{numOfMembers}</Text>
                            </Group>
                            <Title order={2} size={27} fw={600} c="#1696b6" lineClamp={1}> {title} </Title>
                            <Group gap="xs" wrap="nowrap">
                                <Text fw={600} size="sm">Primary Skills:</Text>
                                <Group gap={4} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {skills?.slice(0, 3).map((skill, index) => ( <Text key={skill} size="sm" fw={600}> {skill}{index < (skills.length - 1) && index < 2 ? ',' : ''} </Text> ))}
                                    {skills?.length > 3 && <Text size="sm" fw={600}>...</Text>}
                                </Group>
                            </Group>
                            <Group gap="xs" wrap="nowrap">
                                <Group gap={4} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {tags?.slice(0, 4).map((tag) => ( <Text key={tag} size="sm"> #{tag} </Text> ))}
                                    {tags?.length > 4 && <Text size="sm">...</Text>}
                                </Group>
                            </Group>
                        </Stack>

                        {/* Bottom content group (Badges) */}
                        <Group justify="flex-start" align="center" mt="md" gap="sm">
                            {/* Render specific mentor badge */}
                            {renderMentorBadge()}

                            {/* Render Recommendation Reasons Badges */}
                            {recommendationReasons.length > 0 && (
                                <Group gap={6}>
                                    <IconSparkles size={16} color="orange" />
                                    {recommendationReasons.map((reason, index) => (
                                        <Badge key={index} variant="light" color="orange" size="sm" radius="sm"> {reason} </Badge>
                                    ))}
                                </Group>
                            )}
                        </Group>
                    </Card>
                </Box>

                {/* --- Back Face --- */}
                <Box className={`${classes.cardFace} ${classes.cardBack}`}>
                    <Stack spacing="sm" style={{ height: '100%' }}>
                        <Title order={2} size={27} fw={600} c="#1696b6" lineClamp={1}> {title} </Title>
                        <Title order={4} c="mainBlue.7" fw={500}>Description</Title>
                        <Box className={classes.descriptionText}>
                            <Text> {description} </Text>
                        </Box>
                        <Group position="right" mt="auto">
                            <Button variant="filled" color="mainBlue.6" radius="xl" onClick={handleApplyClick} disabled={!id}> Apply </Button>
                        </Group>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
