import { Paper, Group, Stack, Text, Title, Badge, Avatar, ActionIcon, useMantineTheme, Box } from '@mantine/core';
import { IconPalette, IconChevronRight, IconPhoto } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ProjectMemberDto } from '../../../types/api';

export interface MyProjectItemCardProps {
    id: string;
    title: string;
    date: string; // Formatted date string
    category: string;
    isOngoing: boolean;
    members: ProjectMemberDto[]; // Use the DTO for members
}

export function MyProjectItemCard({ id, title, date, category, isOngoing, members }: MyProjectItemCardProps) {
    const theme = useMantineTheme();
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(`/project/${id}`);
    };

    // Determine category icon (will be expanded later)
    const CategoryIcon = IconPalette; // Placeholder

    return (
        <Paper
            component="button" // Make it clickable
            onClick={handleNavigate}
            shadow="md"
            radius="md"
            p="md"
            withBorder
            style={{ width: '100%', maxWidth: 500, cursor: 'pointer' }} // Adjust max-width as needed
        >
            <Group justify="space-between" wrap="nowrap">
                {/* Left Side: Icon, Title, Date/Category */}
                <Group wrap="nowrap">
                    <Box
                        p={10}
                        style={{
                            backgroundColor: theme.colors.blue[0], // Light blue background for icon
                            borderRadius: theme.radius.md,
                        }}
                    >
                        <CategoryIcon size={32} color={theme.colors.mainBlue[6]} stroke={1.5} />
                    </Box>
                    <Stack gap={2}>
                        <Title order={4} fw={500} lineClamp={1}>{title}</Title>
                        <Text size="xs" c="dimmed">{date} • {category}</Text>
                    </Stack>
                </Group>

                {/* Right Side: Badge, Members, Arrow */}
                <Group wrap="nowrap">
                    {isOngoing && (
                        <Badge color="red" variant="light" size="sm" radius="sm" style={{ alignSelf: 'flex-start' }}>
                            Ongoing
                        </Badge>
                    )}
                    <Group gap={-8} style={{ marginRight: '8px', alignSelf: 'center' }}>
                        {members?.slice(0, 4).map((member, index) => (
                            <Avatar
                                key={member.userId}
                                // src={member.user.avatarUrl} // Add avatar URL if available in SimpleUserDto later
                                alt={`${member.user.preferredUsername} ${member.user.lastName}`}
                                radius="xl" size="sm" color={theme.colors.gray[3]} // Placeholder color
                                style={{ marginLeft: index > 0 ? '-10px' : undefined, border: `1px solid ${theme.white}` }}
                                title={`${member.user.preferredUsername} ${member.user.lastName}`}
                            >
                                {/* Placeholder icon if no image */}
                                <IconPhoto size="0.8rem" color={theme.colors.gray[6]} />
                            </Avatar>
                        ))}
                        {(members?.length ?? 0) > 4 && (
                            <Avatar radius="xl" size="sm" color={theme.colors.gray[2]} style={{ marginLeft: '-10px', border: `1px solid ${theme.white}` }}>
                                <Text size="xs" c="dimmed">+{ (members?.length ?? 0) - 4}</Text>
                            </Avatar>
                        )}
                    </Group>
                    <ActionIcon variant="transparent" color="gray" size="lg" style={{ alignSelf: 'center' }}>
                        <IconChevronRight size={20} stroke={1.5} />
                    </ActionIcon>
                </Group>
            </Group>
        </Paper>
    );
}