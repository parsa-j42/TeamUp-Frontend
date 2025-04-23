import { useState } from 'react';
import { Paper, Group, Stack, Text, Title, Badge, Collapse } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react'; // Import IconUsers
import { useNavigate } from 'react-router-dom';
import classes from '../DiscoverPage.module.css';

export interface InterestedProjectItemProps {
    id: string;
    title: string;
    description: string; // Added description prop
    skills: string[];
    tags: string[];
    numOfMembers: string; // Added numOfMembers prop
    // category?: string; // Removed category, using status badge only
    status?: string; // e.g., "Open to application"
}

export function InterestedProjectItem({
                                          id,
                                          title,
                                          description = 'No description available.', // Default description
                                          skills = [],
                                          tags = [],
                                          numOfMembers = 'N/A', // Default members
                                          status = "Open to application" // Default status
                                      }: InterestedProjectItemProps) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleNavigate = () => {
        navigate(`/project/${id}`);
    };

    return (
        <Paper
            // component="button" // Removed button component, Paper handles click
            onClick={handleNavigate}
            p="lg"
            radius="lg"
            className={classes.interestedItemPaper}
            withBorder={false}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: 'pointer' }} // Add pointer cursor for click indication
        >
            <Stack gap="md"> {/* Main vertical stack */}
                {/* Top Row: Members | Status Badge */}
                <Group justify="space-between" align="center">
                    <Group gap="xs" align="center">
                        <IconUsers size={17} color="grey" />
                        <Text c="dimmed" size="sm">{numOfMembers}</Text>
                    </Group>
                    <Badge variant="outline" radius="sm" className={classes.interestedItemBadge}>
                        {status}
                    </Badge>
                </Group>

                {/* Title Row (Styled like ProjectCard) */}
                <Title order={2} size={27} fw={600} c="#1696b6" lineClamp={1}>
                    {title}
                </Title>

                {/* Skills Row (Styled like ProjectCard) */}
                <Group gap="xs" wrap="nowrap">
                    <Text fw={600} size="sm">Primary Skills:</Text>
                    <Group gap={4} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {/* Match ProjectCard: slice(0, 3), comma logic */}
                        {skills?.slice(0, 3).map((skill, index) => (
                            <Text key={skill} size="sm" fw={600}>
                                {skill}{index < (skills.length - 1) && index < 2 ? ',' : ''}
                            </Text>
                        ))}
                        {skills?.length > 3 && <Text size="sm" fw={600}>...</Text>}
                    </Group>
                </Group>

                {/* Tags Row (Styled like ProjectCard) */}
                <Group gap="xs" wrap="nowrap">
                    {/* Match ProjectCard: slice(0, 4), dimmed text */}
                    <Group gap={4} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {tags?.slice(0, 4).map((tag) => (
                            <Text key={tag} size="sm" c="dimmed">
                                #{tag}
                            </Text>
                        ))}
                        {tags?.length > 4 && <Text size="sm" c="dimmed">...</Text>}
                    </Group>
                </Group>

                {/* Description Section (Revealed on Hover) */}
                <Collapse in={isHovered}>
                    <Stack gap="xs" mt="md"> {/* Add margin-top for spacing */}
                        {/* Title similar to ProjectCard back */}
                        <Title order={4} c="mainBlue.7" fw={500}>Description</Title>
                        {/* Description text */}
                        <Text size="sm" c="black" lineClamp={3}> {/* Limit lines */}
                            {description}
                        </Text>
                    </Stack>
                </Collapse>
            </Stack>
        </Paper>
    );
}
