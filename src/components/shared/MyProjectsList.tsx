import { Paper, Title, Text, Button, Group, Stack, Divider, ActionIcon, Box, Flex, rem, Avatar } from '@mantine/core';
import { IconBox, IconChevronRight, IconDots } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import {useNavigate} from "react-router-dom";

// Project data structure
interface Project {
    id: string;
    name: string;
    date: string;
    category: string;
}

interface MyProjectListProps {
    projects?: Project[];
}

function ProjectItem({ project }: { project: Project }) {
    return (
        <Flex
            justify="space-between"
            align="center"
            py="md"
        >
            <Group>
                <IconBox style={{ width: rem(24), height: rem(24) }} stroke={1.5} />
                <Box>
                    <Text fw={500}>{project.name}</Text>
                    <Group gap={4}>
                        <Text size="sm" c="dimmed">{project.date}</Text>
                        <Text size="sm" c="dimmed">•</Text>
                        <Text size="sm" c="dimmed">{project.category}</Text>
                    </Group>
                </Box>
            </Group>

            <Group>
                <Group gap={-8} style={{ marginRight: '12px' }}>
                    <Avatar src="/avatar-blue.svg" alt="Profile Avatar" radius="xl" size="md" />
                    <Avatar src="/avatar-orange.svg" alt="Profile Avatar" radius="xl" size="md" style={{ marginLeft: '-12px' }} />
                    <Avatar src="/avatar-green.svg" alt="Profile Avatar" radius="xl" size="md" style={{ marginLeft: '-12px' }} />
                    <Avatar src="/avatar-red.svg" alt="Profile Avatar" radius="xl" size="md" style={{ marginLeft: '-12px' }} />
                </Group>
                <ActionIcon variant="subtle" color="black">
                    <IconChevronRight size={20} stroke={1.5} />
                </ActionIcon>
            </Group>
        </Flex>
    );
}

function MyProjectList({ projects }: MyProjectListProps) {
    const navigate = useNavigate();

    // Default project data if none provided
    const defaultProjects: Project[] = [
        { id: '1', name: 'Project name', date: '11 Jan 2025', category: 'Category' },
        { id: '2', name: 'Project name', date: '11 Jan 2025', category: 'Category' },
        { id: '3', name: 'Project name', date: '11 Jan 2025', category: 'Category' },
        { id: '4', name: 'Project name', date: '11 Jan 2025', category: 'Category' },
    ];

    const projectsToRender = projects || defaultProjects;

    return (
        <Paper p="xl" mt="50px" radius="lg" bg="bgGrey.3">
            <Flex justify="space-between" align="center" mb="xl">
                <Stack gap="xs">
                    <Title order={1}>My Projects</Title>
                    <Text size="sm" c="dimmed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.</Text>
                </Stack>
                <Group>
                    <Button variant="light" color="gray" radius="md">Drafts</Button>
                    <Button variant="filled" color="mainPurple.6" radius="md"
                            onClick={() => navigate('/create-project')}>Create New Project</Button>
                    <ActionIcon variant="subtle" color="gray"><IconDots size={20} stroke={1.5} /></ActionIcon>
                </Group>
            </Flex>

            {projectsToRender.map((project, index) => (
                <Box key={project.id}>
                    <ProjectItem project={project} />
                    {index < projectsToRender.length - 1 && <Divider color="mainOrange.6" size="sm" />}
                </Box>
            ))}
        </Paper>
    );
}

export default MyProjectList;