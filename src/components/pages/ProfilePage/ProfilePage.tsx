import {
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Group,
    Paper,
    Stack,
    Text,
    Title,
    useMantineTheme,
    ActionIcon,
    AspectRatio,
    Modal, // Import Modal
    ScrollArea, // Import ScrollArea for modal content
    TextInput, // Example input for edit modals
    Textarea, // Example input for edit modals
} from '@mantine/core';
import { IconPhoto, IconPencil, IconArrowRight, IconClock, IconX, IconPlus } from '@tabler/icons-react'; // Added IconX, IconPlus
import WavyBackground from "@components/shared/WavyBackground/WavyBackground.tsx";
import { useDisclosure } from '@mantine/hooks'; // Import useDisclosure hook
import React from 'react'; // Import React

const TOP_WAVE_PATH = "M 0,6 Q 15,8 40,7 C 60,5 80,5 130,7 L 100,0 L 0,0 Z";

// --- Mock Data ---
// Added IDs and more items for "Show All" functionality
const profileData = {
    name: 'Jason Hong',
    status: 'Undergraduate',
    institution: 'SAIT - Software Development',
    bio: 'Brief introduction Brief explanation. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    avatarUrl: '', // Placeholder
    bannerUrl: '', // Placeholder
    skills: [
        { id: 's1', name: 'Skill Name 1', description: 'Brief explanation 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { id: 's2', name: 'Skill Name 2', description: 'Brief explanation 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { id: 's3', name: 'Skill Name 3', description: 'Brief explanation 3. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { id: 's4', name: 'Skill Name 4', description: 'Brief explanation 4. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
    ],
    interests: [
        { id: 'i1', name: 'Interests Name 1', description: 'Brief explanation 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { id: 'i2', name: 'Interests Name 2', description: 'Brief explanation 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { id: 'i3', name: 'Interests Name 3', description: 'Brief explanation 3. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
    ],
    experience: [
        { id: 'e1', dateRange: 'May 2021 - Dec 2022', workName: 'Work Name 1', description: 'Brief explanation 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { id: 'e2', dateRange: 'Jan 2020 - Apr 2021', workName: 'Work Name 2', description: 'Brief explanation 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { id: 'e3', dateRange: 'Jun 2019 - Dec 2019', workName: 'Work Name 3', description: 'Brief explanation 3. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { id: 'e4', dateRange: 'Sep 2018 - May 2019', workName: 'Work Name 4', description: 'Brief explanation 4. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
    ],
    projects: [
        {
            id: 'p1',
            title: 'Project Title 1',
            tags: ['Figma', 'Photoshop'],
            description: 'Brief Introduction of project 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vestibulum leo a nisi faucibus, non volutpat odio convallis. Nulla facilisi. Sed in est ut diam pulvinar volutpat id ut quam. Nulla placerat vitae est eu ultrices. Phasellus gravida odio quis placerat malesuada. Nulla in dictum tortor.',
            imageUrl: '', // Placeholder
        },
        {
            id: 'p2',
            title: 'Project Title 2',
            tags: ['Adobe Creative Suite', 'Illustrator'],
            description: 'Brief Introduction of project 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vestibulum leo a nisi faucibus, non volutpat odio convallis. Nulla facilisi. Sed in est ut diam pulvinar volutpat id ut quam. Nulla placerat vitae est eu ultrices. Phasellus gravida odio quis placerat malesuada. Nulla in dictum tortor.',
            imageUrl: '', // Placeholder
        },
    ],
};

// --- Reusable Section Card Component ---
// Updated props for modal control
interface SectionCardProps {
    title: string;
    children: React.ReactNode;
    onEdit?: () => void;
    onShowAll?: () => void; // Added for Show All modal
    showAllLink?: boolean;
    itemCount?: number; // Number of items currently shown
    totalItemCount?: number; // Total number of items available
}

// Updated SectionCard to handle onShowAll click and display logic
function SectionCard({ title, children, onEdit, onShowAll, showAllLink = false, itemCount, totalItemCount }: SectionCardProps) {
    // Determine if the "Show All" button should be displayed
    const displayShowAll = showAllLink && onShowAll && totalItemCount !== undefined && itemCount !== undefined && totalItemCount > itemCount;

    return (
        <Paper withBorder radius="md" p="lg" shadow="sm">
            <Stack gap="md">
                <Group justify="space-between">
                    <Title order={3} fw={500}>{title}</Title>
                    {onEdit && (
                        <ActionIcon variant="subtle" color="gray" onClick={onEdit}>
                            <IconPencil size={18} />
                        </ActionIcon>
                    )}
                </Group>
                {/* Kept divider color black as per original request */}
                <Divider color="black" />
                {children}
                {displayShowAll && (
                    <Button
                        variant="transparent"
                        color="dark"
                        rightSection={<IconArrowRight size={16} />}
                        p={0} // Remove padding
                        style={{ alignSelf: 'flex-end' }} // Align to the right
                        styles={{ label: { fontWeight: 400 }}} // Match font weight
                        onClick={onShowAll} // Attach the handler
                    >
                        Show All {/* Optionally add count: ({totalItemCount}) */}
                    </Button>
                )}
            </Stack>
        </Paper>
    );
}

// --- Main Profile Page Component ---
export default function ProfilePage() {
    const theme = useMantineTheme();

    // --- Modal States ---
    const [skillsEditOpened, { open: openSkillsEdit, close: closeSkillsEdit }] = useDisclosure(false);
    const [skillsShowAllOpened, { open: openSkillsShowAll, close: closeSkillsShowAll }] = useDisclosure(false);
    const [interestsEditOpened, { open: openInterestsEdit, close: closeInterestsEdit }] = useDisclosure(false);
    const [interestsShowAllOpened, { open: openInterestsShowAll, close: closeInterestsShowAll }] = useDisclosure(false);
    const [experienceEditOpened, { open: openExperienceEdit, close: closeExperienceEdit }] = useDisclosure(false);
    const [experienceShowAllOpened, { open: openExperienceShowAll, close: closeExperienceShowAll }] = useDisclosure(false);
    const [projectEditOpened, { open: openProjectEdit, close: closeProjectEdit }] = useDisclosure(false);
    const [profileEditOpened, { open: openProfileEdit, close: closeProfileEdit }] = useDisclosure(false); // For header info
    const [projectAddOpened, { open: openProjectAdd, close: closeProjectAdd }] = useDisclosure(false); // For adding new project

    // State to track which project is being edited
    const [editingProject, setEditingProject] = React.useState<(typeof profileData.projects[0]) | null>(null);

    const handleOpenProjectEdit = (project: typeof profileData.projects[0]) => {
        setEditingProject(project);
        openProjectEdit();
    };

    // --- Wave Background Setup (Kept exactly as provided) ---
    const topWaveHeight = 25000;
    const topWaveEdgeRatio = -10 / 100;
    const topWaveOffset = topWaveHeight * topWaveEdgeRatio;
    const topSectionPadding = `calc(${topWaveOffset}px + ${theme.spacing.xl})`;

    // Number of items to show initially in cards before "Show All"
    const initialItemsToShow = 2;

    return (
        <WavyBackground
            wavePath={TOP_WAVE_PATH}
            waveHeight={topWaveHeight}
            backgroundColor={theme.colors.mainPurple[6]}
            contentPaddingTop={topSectionPadding}
            extraBottomPadding="0px" // Kept as original
        >
            {/* Container setup kept exactly as provided */}
            <Container size="100%" style={{ borderRadius: theme.radius.md }} p="xl">
                <Stack gap="lg">
                    {/* --- Profile Header Card --- */}
                    <Paper withBorder radius="md" p={0} shadow="sm" style={{ overflow: 'visible' }}>
                        <Box h={150} bg={theme.colors.gray[2]} style={{ borderTopLeftRadius: theme.radius.md, borderTopRightRadius: theme.radius.md, position: 'relative' }}>
                            <Group justify="center" align="center" style={{ height: '100%' }}>
                                <IconPhoto size="3rem" color={theme.colors.gray[5]} />
                            </Group>
                            {/* Edit Banner Icon - Placeholder Action */}
                            {/*<ActionIcon variant="filled" color="dark" radius="xl" style={{ position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm }} onClick={() => console.log("Edit Banner Action")}>*/}
                            {/*    <IconPencil size={16} />*/}
                            {/*</ActionIcon>*/}
                        </Box>
                        <Box px="xl" pb="xl" pt={60} style={{ position: 'relative' }}>
                            <Avatar
                                src={profileData.avatarUrl || undefined}
                                size={120}
                                radius="50%"
                                color="gray.3"
                                style={{
                                    position: 'absolute',
                                    top: -60,
                                    left: theme.spacing.xl,
                                    border: `4px solid ${theme.white}`,
                                    backgroundColor: theme.colors.gray[3]
                                }}
                            >
                                {!profileData.avatarUrl && <IconPhoto size="3rem" color={theme.colors.gray[6]} />}
                                {/* Edit Avatar Icon - Placeholder Action */}
                                {/*<ActionIcon variant="filled" color="dark" radius="xl" size="sm" style={{ position: 'absolute', bottom: 5, right: 5 }} onClick={() => console.log("Edit Avatar Action")}>*/}
                                {/*    <IconPencil size={14} />*/}
                                {/*</ActionIcon>*/}
                            </Avatar>
                            <Group justify="space-between" align="flex-start" mt="md">
                                <Stack gap="xs" style={{ flexGrow: 1 }}> {/* Allow stack to grow */}
                                    <Group justify='space-between' wrap="nowrap">
                                        <Title order={2} fw={500}>{profileData.name}</Title>
                                        {/* Edit Profile Info Icon */}
                                        <ActionIcon variant="subtle" color="gray" onClick={openProfileEdit}>
                                            <IconPencil size={18} />
                                        </ActionIcon>
                                    </Group>
                                    <Group gap="sm">
                                        <Badge color="mainPurple.6" variant="filled" radius="xl" size="sm">
                                            {profileData.status}
                                        </Badge>
                                        <Text size="sm" c="dimmed">{profileData.institution}</Text>
                                    </Group>
                                    <Text size="sm" c="dimmed" mt="xs" maw={500}>{profileData.bio}</Text>
                                </Stack>
                                <Button color="mainPurple.6" radius="xl" mt={5} fw={400} style={{ flexShrink: 0 }}> {/* Prevent button shrinking */}
                                    Message
                                </Button>
                            </Group>
                        </Box>
                    </Paper>

                    {/* --- Skills Section --- */}
                    <SectionCard
                        title="Skills"
                        onEdit={openSkillsEdit}
                        onShowAll={openSkillsShowAll} // Pass handler
                        showAllLink
                        itemCount={initialItemsToShow}
                        totalItemCount={profileData.skills.length}
                    >
                        <Stack gap="md">
                            {/* Display only the initial items */}
                            {profileData.skills.slice(0, initialItemsToShow).map((skill, index) => (
                                <Stack key={skill.id} gap="xs">
                                    <Title order={5} fw={500}>{skill.name}</Title>
                                    {/* Text color kept black as per original */}
                                    <Text size="sm" c="black">{skill.description}</Text>
                                    {/* Divider logic and color kept as original */}
                                    {index < initialItemsToShow - 1 && <Divider color="black" mt="xs"/>}
                                </Stack>
                            ))}
                        </Stack>
                    </SectionCard>

                    {/* --- Interests Section --- */}
                    <SectionCard
                        title="Interests"
                        onEdit={openInterestsEdit}
                        onShowAll={openInterestsShowAll} // Pass handler
                        showAllLink
                        itemCount={initialItemsToShow}
                        totalItemCount={profileData.interests.length}
                    >
                        <Stack gap="md">
                            {profileData.interests.slice(0, initialItemsToShow).map((interest, index) => (
                                <Stack key={interest.id} gap="xs">
                                    <Title order={5} fw={500}>{interest.name}</Title>
                                    <Text size="sm" c="black">{interest.description}</Text>
                                    {index < initialItemsToShow - 1 && <Divider color="black" mt="xs"/>}
                                </Stack>
                            ))}
                        </Stack>
                    </SectionCard>

                    {/* --- Experience Section --- */}
                    <SectionCard
                        title="Experience"
                        onEdit={openExperienceEdit}
                        onShowAll={openExperienceShowAll} // Pass handler
                        showAllLink
                        itemCount={initialItemsToShow}
                        totalItemCount={profileData.experience.length}
                    >
                        <Stack gap="md">
                            {profileData.experience.slice(0, initialItemsToShow).map((exp, index) => (
                                <Stack key={exp.id} gap="xs">
                                    <Group gap="xs">
                                        <IconClock size={16} color={theme.colors.gray[6]} />
                                        <Text size="xs" c="black">{exp.dateRange}</Text>
                                    </Group>
                                    <Title order={5} fw={500}>{exp.workName}</Title>
                                    <Text size="sm" c="black">{exp.description}</Text>
                                    {index < initialItemsToShow - 1 && <Divider color="black" mt="xs"/>}
                                </Stack>
                            ))}
                        </Stack>
                    </SectionCard>

                    {/* Projects Section Container kept as original */}
                </Stack>
            </Container>

            {/* --- Projects Section (Kept structure as original) --- */}
            <Container size="100%" mt="0" p="xl" pt="0">
                {/* Paper wrapper kept as original */}
                <Paper radius="md" p="lg" shadow="xxxl">
                    <Stack gap="lg">
                        {/* Project Title - Added for clarity */}
                        <Title order={3} fw={500}>Projects</Title>
                        {profileData.projects.map((project) => (
                            <Paper key={project.id} withBorder radius="md" p="lg" shadow="sm" style={{ position: 'relative', border: '1px solid var(--mantine-color-mainPurple-6)' }}>
                                {/* Edit Icon */}
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    style={{ position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm, zIndex: 1 }}
                                    onClick={() => handleOpenProjectEdit(project)} // Use handler
                                >
                                    <IconPencil size={18} />
                                </ActionIcon>
                                <Group wrap="nowrap" align="flex-start" gap="xl">
                                    {/* Left Side: Text Content */}
                                    <Stack gap="md" style={{ flex: 1 }}>
                                        <Title order={4} fw={500}>{project.title}</Title>
                                        <Group gap="xs">
                                            {project.tags.map(tag => (
                                                <Badge key={tag} color="mainPurple.6" variant="filled" radius="xl" size="sm">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </Group>
                                        <Text size="sm" c="black">{project.description}</Text>
                                        <Group justify="flex-start" mt="auto">
                                            <Button color="mainPurple.6" radius="xl" size="sm" fw={400}>
                                                Details
                                            </Button>
                                        </Group>
                                    </Stack>
                                    {/* Right Side: Image Placeholder */}
                                    <Box w={250}>
                                        <AspectRatio ratio={16 / 9} >
                                            <Box bg={theme.colors.gray[2]} style={{ borderRadius: theme.radius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <IconPhoto size="2.5rem" color={theme.colors.gray[5]} />
                                            </Box>
                                        </AspectRatio>
                                    </Box>
                                </Group>
                            </Paper>
                        ))}
                        {/* Add New Project Button */}
                        <Button
                            variant='outline'
                            color='mainPurple.6' // Match theme
                            onClick={openProjectAdd}
                            leftSection={<IconPlus size={16}/>}
                            radius="md" // Consistent radius
                        >
                            Add New Project
                        </Button>
                    </Stack>
                </Paper>
            </Container>

            {/* --- Modals --- */}

            {/* Profile Info Edit Modal */}
            <Modal opened={profileEditOpened} onClose={closeProfileEdit} title="Edit Profile Information" centered size="md">
                <Stack>
                    <TextInput label="Name" defaultValue={profileData.name} />
                    <TextInput label="Status (e.g., Undergraduate)" defaultValue={profileData.status} />
                    <TextInput label="Institution" defaultValue={profileData.institution} />
                    <Textarea label="Bio" defaultValue={profileData.bio} minRows={3} />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeProfileEdit}>Cancel</Button>
                        <Button color="mainPurple.6" onClick={closeProfileEdit}>Save Changes</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* --- Skills Modals --- */}
            <Modal opened={skillsEditOpened} onClose={closeSkillsEdit} title="Edit Skills" centered size="lg">
                <Stack>
                    <Text size="sm" c="dimmed" mb="xs">Manage your skills below.</Text>
                    <ScrollArea h={300} mb="md">
                        <Stack>
                            {profileData.skills.map(skill => (
                                <Paper key={skill.id} p="sm" withBorder radius="sm">
                                    <Group justify='space-between'>
                                        <Stack gap={0}>
                                            <Text fw={500}>{skill.name}</Text>
                                            <Text size="xs" c="dimmed" lineClamp={1}>{skill.description}</Text>
                                        </Stack>
                                        <Group gap="xs">
                                            <ActionIcon size="sm" variant='subtle' color="blue"><IconPencil size={14}/></ActionIcon>
                                            <ActionIcon size="sm" variant='subtle' color='red'><IconX size={14}/></ActionIcon>
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    </ScrollArea>
                    <Button leftSection={<IconPlus size={16}/>} variant='light' color="mainPurple.6">Add Skill</Button>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeSkillsEdit}>Cancel</Button>
                        <Button color="mainPurple.6" onClick={closeSkillsEdit}>Save Changes</Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal opened={skillsShowAllOpened} onClose={closeSkillsShowAll} title="All Skills" centered size="lg">
                <ScrollArea h={400}>
                    <Stack gap="md">
                        {profileData.skills.map((skill, index) => (
                            <React.Fragment key={skill.id}>
                                <Stack gap="xs">
                                    <Title order={5} fw={500}>{skill.name}</Title>
                                    {/* Text color black to match main page card */}
                                    <Text size="sm" c="black">{skill.description}</Text>
                                </Stack>
                                {/* Divider color black to match main page card */}
                                {index < profileData.skills.length - 1 && <Divider color="black" />}
                            </React.Fragment>
                        ))}
                    </Stack>
                </ScrollArea>
                <Group justify='flex-end' mt="md">
                    <Button variant="default" onClick={closeSkillsShowAll}>Close</Button>
                </Group>
            </Modal>

            {/* --- Interests Modals --- */}
            <Modal opened={interestsEditOpened} onClose={closeInterestsEdit} title="Edit Interests" centered size="lg">
                <Stack>
                    <Text size="sm" c="dimmed" mb="xs">Manage your interests below.</Text>
                    <ScrollArea h={300} mb="md">
                        <Stack>
                            {profileData.interests.map(interest => (
                                <Paper key={interest.id} p="sm" withBorder radius="sm">
                                    <Group justify='space-between'>
                                        <Stack gap={0}>
                                            <Text fw={500}>{interest.name}</Text>
                                            <Text size="xs" c="dimmed" lineClamp={1}>{interest.description}</Text>
                                        </Stack>
                                        <Group gap="xs">
                                            <ActionIcon size="sm" variant='subtle' color="blue"><IconPencil size={14}/></ActionIcon>
                                            <ActionIcon size="sm" variant='subtle' color='red'><IconX size={14}/></ActionIcon>
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    </ScrollArea>
                    <Button leftSection={<IconPlus size={16}/>} variant='light' color="mainPurple.6">Add Interest</Button>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeInterestsEdit}>Cancel</Button>
                        <Button color="mainPurple.6" onClick={closeInterestsEdit}>Save Changes</Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal opened={interestsShowAllOpened} onClose={closeInterestsShowAll} title="All Interests" centered size="lg">
                <ScrollArea h={400}>
                    <Stack gap="md">
                        {profileData.interests.map((interest, index) => (
                            <React.Fragment key={interest.id}>
                                <Stack gap="xs">
                                    <Title order={5} fw={500}>{interest.name}</Title>
                                    <Text size="sm" c="black">{interest.description}</Text>
                                </Stack>
                                {index < profileData.interests.length - 1 && <Divider color="black" />}
                            </React.Fragment>
                        ))}
                    </Stack>
                </ScrollArea>
                <Group justify='flex-end' mt="md">
                    <Button variant="default" onClick={closeInterestsShowAll}>Close</Button>
                </Group>
            </Modal>

            {/* --- Experience Modals --- */}
            <Modal opened={experienceEditOpened} onClose={closeExperienceEdit} title="Edit Experience" centered size="lg">
                <Stack>
                    <Text size="sm" c="dimmed" mb="xs">Manage your work experience below.</Text>
                    <ScrollArea h={300} mb="md">
                        <Stack>
                            {profileData.experience.map(exp => (
                                <Paper key={exp.id} p="sm" withBorder radius="sm">
                                    <Group justify='space-between'>
                                        <Stack gap={0}>
                                            <Text fw={500}>{exp.workName}</Text>
                                            <Text size="xs" c="dimmed">{exp.dateRange}</Text>
                                            <Text size="xs" c="dimmed" lineClamp={1}>{exp.description}</Text>
                                        </Stack>
                                        <Group gap="xs">
                                            <ActionIcon size="sm" variant='subtle' color="blue"><IconPencil size={14}/></ActionIcon>
                                            <ActionIcon size="sm" variant='subtle' color='red'><IconX size={14}/></ActionIcon>
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    </ScrollArea>
                    <Button leftSection={<IconPlus size={16}/>} variant='light' color="mainPurple.6">Add Experience</Button>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeExperienceEdit}>Cancel</Button>
                        <Button color="mainPurple.6" onClick={closeExperienceEdit}>Save Changes</Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal opened={experienceShowAllOpened} onClose={closeExperienceShowAll} title="All Experience" centered size="lg">
                <ScrollArea h={400}>
                    <Stack gap="md">
                        {profileData.experience.map((exp, index) => (
                            <React.Fragment key={exp.id}>
                                <Stack gap="xs">
                                    <Group gap="xs">
                                        <IconClock size={16} color={theme.colors.gray[6]} />
                                        {/* Text color black to match main page */}
                                        <Text size="xs" c="black">{exp.dateRange}</Text>
                                    </Group>
                                    <Title order={5} fw={500}>{exp.workName}</Title>
                                    <Text size="sm" c="black">{exp.description}</Text>
                                </Stack>
                                {/* Divider color black to match main page */}
                                {index < profileData.experience.length - 1 && <Divider color="black" />}
                            </React.Fragment>
                        ))}
                    </Stack>
                </ScrollArea>
                <Group justify='flex-end' mt="md">
                    <Button variant="default" onClick={closeExperienceShowAll}>Close</Button>
                </Group>
            </Modal>

            {/* --- Project Modals --- */}
            <Modal opened={projectEditOpened} onClose={closeProjectEdit} title={`Edit Project: ${editingProject?.title || ''}`} centered size="lg">
                {editingProject && (
                    <Stack>
                        <TextInput label="Project Title" defaultValue={editingProject.title} required/>
                        <Textarea label="Description" defaultValue={editingProject.description} minRows={4} required/>
                        <TextInput label="Tags (comma-separated)" defaultValue={editingProject.tags.join(', ')} />
                        {/* Placeholder for image upload */}
                        <Box>
                            <Text size="sm" fw={500} mb={4}>Project Image</Text>
                            <Paper withBorder p="lg" radius="md" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 150, backgroundColor: theme.colors.gray[0]}}>
                                <IconPhoto size="3rem" color={theme.colors.gray[5]}/>
                                <Text size="sm" c="dimmed" mt="xs">Current Image Placeholder</Text>
                                <Button variant='outline' size='xs' mt="sm">Upload New Image</Button>
                            </Paper>
                        </Box>
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeProjectEdit}>Cancel</Button>
                            <Button color="mainPurple.6" onClick={closeProjectEdit}>Save Changes</Button>
                        </Group>
                    </Stack>
                )}
            </Modal>

            <Modal opened={projectAddOpened} onClose={closeProjectAdd} title="Add New Project" centered size="lg">
                <Stack>
                    <TextInput label="Project Title" placeholder="Enter project title" required/>
                    <Textarea label="Description" placeholder="Enter project description" minRows={4} required/>
                    <TextInput label="Tags (comma-separated)" placeholder="e.g., React, Node, UI/UX" />
                    {/* Placeholder for image upload */}
                    <Box>
                        <Text size="sm" fw={500} mb={4}>Project Image</Text>
                        <Paper withBorder p="lg" radius="md" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 150, backgroundColor: theme.colors.gray[0]}}>
                            <IconPhoto size="3rem" color={theme.colors.gray[5]}/>
                            <Button variant='outline' size='xs' mt="sm">Upload Image</Button>
                        </Paper>
                    </Box>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeProjectAdd}>Cancel</Button>
                        <Button color="mainPurple.6" onClick={closeProjectAdd}>Add Project</Button>
                    </Group>
                </Stack>
            </Modal>

        </WavyBackground>
    );
}