import { Paper, Group, Stack, Text, Title, Badge, Avatar, ActionIcon, useMantineTheme } from '@mantine/core';
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
        navigate(`/my-project-details/${id}`);
    };

    // Determine category icon (can be expanded later)
    const CategoryIcon = IconPalette; // Placeholder

    return (
        <Paper
            // component="button" // Make it clickable
            onClick={handleNavigate}
            shadow="xxl"
            radius="lg"
            p="md"
            pt="xl"
            // Remove fixed height to allow content to determine height naturally
            w="400px"
            style={{
                position: 'relative', // Needed for absolute positioning of the badge
                width: '100%', // Allow card to take available width in grid
                cursor: 'pointer',
                textAlign: 'left', // Ensure text aligns left by default for button
                overflow: 'hidden', // Hide potential badge overflow before positioning
            }}
        >
            {/* Ongoing Badge - Absolutely Positioned */}
            {isOngoing && (
                <Badge
                    color="#ffd1cc"
                    c="black"
                    variant="filled"
                    size="md"
                    fw={500}
                    radius="md"
                    style={{
                        position: 'absolute',
                        top: theme.spacing.sm, // Adjust spacing from top
                        right: theme.spacing.sm, // Adjust spacing from right
                        zIndex: 1, // Ensure badge is above other content if needed
                        textTransform: 'none',
                    }}
                >
                    Ongoing
                </Badge>
            )}

            {/* Main Content Stack */}
            <Stack justify="space-between" style={{ height: '100%' }}> {/* Make stack fill height */}

                {/* Top Section: Icon, Title, Date/Category */}
                <Group wrap="nowrap" align="flex-start"> {/* Align items to the start */}
                    {/* Icon Container */}
                    <Paper
                        withBorder
                        p={6}
                        shadow="md" // Use less prominent shadow than 'xl'
                        radius="md"
                        style={{ flexShrink: 0 }} // Prevent icon box from shrinking
                    >
                        {/* Center Icon within Paper */}
                        <Stack justify="center" align="center" h={48} w={48}>
                            <CategoryIcon size={40} color={theme.colors.mainBlue[6]} stroke={1.5} />
                        </Stack>
                    </Paper>

                    {/* Title and Date/Category Stack */}
                    <Stack gap={2} style={{ overflow: 'hidden' }} pt="xs"> {/* Prevent text overflow issues */}
                        <Title order={4} fw={500} lineClamp={1}>{title}</Title>
                        <Text size="xs" c="dimmed" lineClamp={1}>{date} • {category}</Text>
                    </Stack>
                </Group>

                {/* Bottom Section: Avatars and Chevron (Pushed to the right) */}
                <Group justify="flex-end" wrap="nowrap"> {/* Justify content to the end */}
                    {/* Member Avatars */}
                    <Group gap={-8} style={{ marginRight: '0px' }}>
                        {members?.slice(0, 4).map((member, index) => (
                            <Avatar
                                key={member.userId}
                                src={"/avatar-blue.svg"} // Use actual avatar if available
                                alt={`${member.user.preferredUsername} ${member.user.lastName}`}
                                radius="xl" size="sm" color={theme.colors.gray[3]}
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
                    {/* Chevron Icon */}
                    <ActionIcon variant="transparent" color="gray" size="lg">
                        <IconChevronRight size={20} stroke={1.5} />
                    </ActionIcon>
                </Group>

            </Stack>
        </Paper>
    );
}