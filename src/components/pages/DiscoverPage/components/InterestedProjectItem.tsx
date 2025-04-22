import { Paper, Group, Stack, Text, Title, Badge, useMantineTheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import classes from '../DiscoverPage.module.css';

export interface InterestedProjectItemProps {
    id: string;
    title: string;
    skills: string[];
    tags: string[];
    category?: string; // e.g., "UI/UX"
    status?: string; // e.g., "Open to application"
}

export function InterestedProjectItem({
                                          id,
                                          title,
                                          skills = [],
                                          tags = [],
                                          category = "UI/UX", // Default category from screenshot
                                          status = "Open to application" // Default status from screenshot
                                      }: InterestedProjectItemProps) {
    const theme = useMantineTheme();
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(`/project/${id}`);
    };

    return (
        <Paper
            component="button" // Make it clickable
            onClick={handleNavigate}
            p="lg"
            radius="lg" // Use larger radius as per screenshot
            className={classes.interestedItemPaper} // Apply specific styles
            withBorder={false} // No border shown in screenshot
        >
            <Group justify="space-between" wrap="nowrap" align="flex-start"> {/* Align badges top */}
                {/* Left Side: Title, Skills, Tags */}
                <Stack gap="xs" style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Text size="sm" c="dimmed" lineClamp={1}>team name</Text> {/* Placeholder */}
                    <Title order={3} size="h4" fw={600} c={theme.colors.mainBlue[6]} lineClamp={1}>
                        {title}
                    </Title>
                    {/* Skills Section */}
                    <Group gap="xs" wrap="nowrap">
                        <Text fw={600} size="sm" c="black">Primary Skills:</Text>
                        <Group gap={4} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {skills.slice(0, 3).map((skill, index) => (
                                <Text key={skill} size="sm" fw={600} c="black">
                                    {skill}{index < (skills.length - 1) && index < 2 ? ',' : ''}
                                </Text>
                            ))}
                            {skills.length > 3 && <Text size="sm" fw={600} c="black">...</Text>}
                        </Group>
                    </Group>
                    {/* Tags Section */}
                    <Group gap={4} wrap="nowrap" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {tags.slice(0, 5).map((tag) => (
                            <Text key={tag} size="sm" c="dimmed">
                                #{tag}
                            </Text>
                        ))}
                        {tags.length > 5 && <Text size="sm" c="dimmed">...</Text>}
                    </Group>
                </Stack>

                {/* Right Side: Badges */}
                <Group gap="sm" style={{ flexShrink: 0 }}> {/* Prevent shrinking */}
                    <Badge variant="outline" radius="sm" className={classes.interestedItemBadge}>
                        {category}
                    </Badge>
                    <Badge variant="outline" radius="sm" className={classes.interestedItemBadge}>
                        {status}
                    </Badge>
                </Group>
            </Group>
        </Paper>
    );
}