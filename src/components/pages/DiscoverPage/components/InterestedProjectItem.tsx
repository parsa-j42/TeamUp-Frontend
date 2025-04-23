import { useState } from 'react';
import { Paper, Group, Stack, Text, Title, Badge, Collapse } from '@mantine/core';
import { IconUsers, IconSparkles } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import classes from '../DiscoverPage.module.css';

export interface InterestedProjectItemProps {
    id: string;
    title: string;
    description: string;
    skills: string[];
    tags: string[];
    numOfMembers: string;
    status?: string;
    recommendationReasons?: string[];
}

export function InterestedProjectItem({
                                          id,
                                          title,
                                          description = 'No description available.',
                                          skills = [],
                                          tags = [],
                                          numOfMembers = 'N/A',
                                          status = "Open to application",
                                          recommendationReasons = [] // Default to empty array
                                      }: InterestedProjectItemProps) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleNavigate = () => {
        navigate(`/project/${id}`);
    };

    return (
        <Paper
            onClick={handleNavigate}
            p="lg"
            radius="lg"
            className={classes.interestedItemPaper}
            withBorder={false}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: 'pointer' }}
        >
            <Stack gap="md">
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

                {/* Title Row */}
                <Title order={2} size={27} fw={600} c="#1696b6" lineClamp={1}>
                    {title}
                </Title>

                {/* Skills Row */}
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

                {/* Tags Row */}
                <Group gap="xs" wrap="nowrap">
                    <Group gap={4} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {tags?.slice(0, 4).map((tag) => (
                            <Text key={tag} size="sm" c="dimmed">
                                #{tag}
                            </Text>
                        ))}
                        {tags?.length > 4 && <Text size="sm" c="dimmed">...</Text>}
                    </Group>
                </Group>

                {/* Recommendation Reasons Badges - NEW */}
                {recommendationReasons.length > 0 && (
                    <Group gap={6} mt={4}>
                        <IconSparkles size={16} color="orange" />
                        {recommendationReasons.map((reason, index) => (
                            <Badge
                                key={index}
                                variant="light"
                                color="orange"
                                size="sm"
                                radius="sm"
                            >
                                {reason}
                            </Badge>
                        ))}
                    </Group>
                )}
                {/* End Recommendation Reasons */}


                {/* Description Section (Revealed on Hover) */}
                <Collapse in={isHovered}>
                    <Stack gap="xs" mt="md">
                        <Title order={4} c="mainBlue.7" fw={500}>Description</Title>
                        <Text size="sm" c="black" lineClamp={3}>
                            {description}
                        </Text>
                    </Stack>
                </Collapse>
            </Stack>
        </Paper>
    );
}