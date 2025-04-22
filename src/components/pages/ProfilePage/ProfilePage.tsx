import React, {useCallback, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {
    ActionIcon,
    Alert,
    AspectRatio,
    Avatar,
    Badge,
    Box,
    Button,
    Center,
    Container,
    Divider,
    Group,
    Loader,
    Modal,
    Paper,
    ScrollArea,
    Stack,
    TagsInput,
    Text,
    Textarea,
    TextInput,
    Title,
    useMantineTheme
} from '@mantine/core';
import {IconAlertCircle, IconArrowRight, IconClock, IconPencil, IconPhoto, IconPlus, IconX} from '@tabler/icons-react';
import GradientBackground from '@components/shared/GradientBackground/GradientBackground';
import {useDisclosure} from '@mantine/hooks';
import {apiClient} from '@utils/apiClient';
import {useAuth} from '@contexts/AuthContext';
import {
    CreatePortfolioProjectPayload,
    CreateWorkExperiencePayload,
    PortfolioProjectDto,
    UpdatePortfolioProjectPayload,
    UpdateProfilePayload,
    UpdateWorkExperiencePayload,
    UserDto,
    WorkExperienceDto
} from '../../../types/api';

// --- Reusable Section Card Component ---
interface SectionCardProps {
    title: string;
    children: React.ReactNode;
    onEdit?: () => void;
    onShowAll?: () => void;
    showAllLink?: boolean;
    itemCount?: number;
    totalItemCount?: number;
    isOwnProfile?: boolean;
}

function SectionCard({
                         title,
                         children,
                         onEdit,
                         onShowAll,
                         showAllLink = false,
                         itemCount,
                         totalItemCount,
                         isOwnProfile
                     }: SectionCardProps) {
    const displayShowAll = showAllLink && onShowAll && totalItemCount !== undefined && itemCount !== undefined && totalItemCount > itemCount;
    return (
        <Paper withBorder radius="md" p="lg" shadow="sm">
            <Stack gap="md">
                <Group justify="space-between">
                    <Title order={3} fw={500}>{title}</Title>
                    {/* Only show edit icon if it's own profile and onEdit is provided */}
                    {isOwnProfile && onEdit && (<ActionIcon variant="filled" color="gray" onClick={onEdit}><IconPencil
                        size={18}/></ActionIcon>)}
                </Group>
                <Divider color="black"/>
                {children}
                {displayShowAll && (
                    <Button variant="transparent" color="dark" rightSection={<IconArrowRight size={16}/>} p={0}
                            style={{alignSelf: 'flex-end'}} styles={{label: {fontWeight: 400}}}
                            onClick={onShowAll}> Show All </Button>)}
            </Stack>
        </Paper>
    );
}

// --- Main Profile Page Component ---
export default function ProfilePage() {
    const theme = useMantineTheme();
    const {userId: userIdFromParams} = useParams<{ userId?: string }>(); // Get userId from URL, make optional
    const {
        userDetails: currentUserDetails,
        isAuthenticated,
        isLoading: isAuthLoading,
        initialCheckComplete
    } = useAuth();

    // --- State for API Data ---
    const [profileUserData, setProfileUserData] = useState<UserDto | null>(null); // Data for the profile being viewed
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false); // Is the viewed profile the logged-in user's?

    // --- State for Modals & Editing ---
    const [profileEditOpened, {open: openProfileEditModal, close: closeProfileEdit}] = useDisclosure(false);
    const [profileEditData, setProfileEditData] = useState<Partial<UpdateProfilePayload>>({});
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileModalError, setProfileModalError] = useState<string | null>(null);

    const [skillsEditOpened, {open: openSkillsEditModal, close: closeSkillsEdit}] = useDisclosure(false);
    const [skillsEditData, setSkillsEditData] = useState<string[]>([]);
    const [isSavingSkills, setIsSavingSkills] = useState(false);
    const [skillsModalError, setSkillsModalError] = useState<string | null>(null);

    const [interestsEditOpened, {open: openInterestsEditModal, close: closeInterestsEdit}] = useDisclosure(false);
    const [interestsEditData, setInterestsEditData] = useState<string[]>([]);
    const [isSavingInterests, setIsSavingInterests] = useState(false);
    const [interestsModalError, setInterestsModalError] = useState<string | null>(null);

    const [experienceEditOpened, {open: openExperienceModal, close: closeExperienceEdit}] = useDisclosure(false);
    const [currentExperience, setCurrentExperience] = useState<Partial<CreateWorkExperiencePayload & {
        id?: string
    }>>({});
    const [isEditingExperience, setIsEditingExperience] = useState(false);
    const [isSavingExperience, setIsSavingExperience] = useState(false);
    const [experienceModalError, setExperienceModalError] = useState<string | null>(null);

    const [portfolioProjectAddOpened, {
        open: openPortfolioProjectAddModal,
        close: closePortfolioProjectAdd
    }] = useDisclosure(false);
    const [newPortfolioProjectData, setNewPortfolioProjectData] = useState<Partial<CreatePortfolioProjectPayload>>({});
    const [isSavingNewPortfolioProject, setIsSavingNewPortfolioProject] = useState(false);
    const [portfolioAddModalError, setPortfolioAddModalError] = useState<string | null>(null);

    const [portfolioProjectEditOpened, {
        open: openPortfolioProjectEditModal,
        close: closePortfolioProjectEdit
    }] = useDisclosure(false);
    const [editingPortfolioProject, setEditingPortfolioProject] = useState<PortfolioProjectDto | null>(null);
    const [editingPortfolioProjectData, setEditingPortfolioProjectData] = useState<Partial<UpdatePortfolioProjectPayload>>({});
    const [isSavingEditedPortfolioProject, setIsSavingEditedPortfolioProject] = useState(false);
    const [portfolioEditModalError, setPortfolioEditModalError] = useState<string | null>(null);

    const [skillsShowAllOpened, {open: openSkillsShowAll, close: closeSkillsShowAll}] = useDisclosure(false);
    const [interestsShowAllOpened, {open: openInterestsShowAll, close: closeInterestsShowAll}] = useDisclosure(false);
    const [experienceShowAllOpened, {
        open: openExperienceShowAll,
        close: closeExperienceShowAll
    }] = useDisclosure(false);

    // --- Fetch User Data ---
    const fetchData = useCallback(async (showLoadingIndicator = true) => {
        if (!initialCheckComplete) return; // Wait for auth check

        const loggedInUserId = currentUserDetails?.id;
        const profileUserId = userIdFromParams || loggedInUserId; // Use param ID or fallback to logged-in user ID
        const isOwn = !userIdFromParams || userIdFromParams === loggedInUserId;

        setIsOwnProfile(isOwn && isAuthenticated); // Set ownership flag (only own if authenticated)

        if (!profileUserId) {
            // This case happens if not logged in and trying to view /profile
            setError("User profile not specified.");
            setIsLoading(false);
            setProfileUserData(null);
            return;
        }

        if (showLoadingIndicator) setIsLoading(true);
        setError(null);
        setProfileUserData(null); // Clear previous data

        try {
            let data: UserDto;
            if (isOwn && isAuthenticated) {
                console.log(`[ProfilePage] Fetching own profile (/users/me)`);
                data = await apiClient<UserDto>('/users/me');
            } else {
                console.log(`[ProfilePage] Fetching profile for user ID: ${profileUserId}`);
                data = await apiClient<UserDto>(`/users/${profileUserId}`);
            }
            setProfileUserData(data);
        } catch (err: any) {
            console.error(`[ProfilePage] Error fetching profile data for ${profileUserId}:`, err);
            if (err.status === 404) {
                setError("Profile not found.");
            } else {
                setError(err.data?.message || err.message || 'Failed to load profile data.');
            }
            setProfileUserData(null); // Clear data on error
        } finally {
            if (showLoadingIndicator) setIsLoading(false);
        }
    }, [userIdFromParams, initialCheckComplete, isAuthenticated, currentUserDetails?.id]); // Add dependencies

    useEffect(() => {
        fetchData(true);
    }, [fetchData]); // fetchData dependency array includes all needed variables

    // --- Modal Open Handlers (Only allow opening if isOwnProfile) ---
    const handleOpenProfileEdit = () => {
        if (!isOwnProfile || !profileUserData) return;
        setProfileModalError(null);
        setProfileEditData({
            firstName: profileUserData?.firstName || '', lastName: profileUserData?.lastName || '',
            status: profileUserData?.profile?.status || '', institution: profileUserData?.profile?.institution || '',
            bio: profileUserData?.profile?.bio || '',
        });
        openProfileEditModal();
    };
    const handleOpenSkillsEdit = () => {
        if (!isOwnProfile || !profileUserData) return;
        setSkillsModalError(null);
        setSkillsEditData(profileUserData?.profile?.skills?.map(s => s.name) || []);
        openSkillsEditModal();
    };
    const handleOpenInterestsEdit = () => {
        if (!isOwnProfile || !profileUserData) return;
        setInterestsModalError(null);
        setInterestsEditData(profileUserData?.profile?.interests?.map(i => i.name) || []);
        openInterestsEditModal();
    };
    const handleOpenExperienceAdd = () => {
        if (!isOwnProfile) return;
        setExperienceModalError(null);
        setCurrentExperience({});
        setIsEditingExperience(false);
        openExperienceModal();
    };
    const handleOpenExperienceEdit = (exp: WorkExperienceDto) => {
        if (!isOwnProfile) return;
        setExperienceModalError(null);
        setCurrentExperience({...exp});
        setIsEditingExperience(true);
        openExperienceModal();
    };
    const handleOpenPortfolioProjectAdd = () => {
        if (!isOwnProfile) return;
        setPortfolioAddModalError(null);
        setNewPortfolioProjectData({});
        openPortfolioProjectAddModal();
    };
    const handleOpenPortfolioProjectEdit = (project: PortfolioProjectDto) => {
        if (!isOwnProfile) return;
        setPortfolioEditModalError(null);
        setEditingPortfolioProject(project);
        setEditingPortfolioProjectData({
            title: project.title,
            description: project.description,
            tags: project.tags || []
        });
        openPortfolioProjectEditModal();
    };

    // --- Save Handlers (API Calls - inherently protected by backend needing auth token for PATCH/POST/DELETE) ---
    const handleProfileInfoSave = async () => { /* ... unchanged ... */
        setIsSavingProfile(true);
        setProfileModalError(null);
        try {
            await apiClient<UserDto>('/profiles/me', {method: 'PATCH', body: profileEditData as UpdateProfilePayload});
            closeProfileEdit();
            fetchData(false);
        } catch (err: any) {
            setProfileModalError(err.data?.message || err.message || 'Failed to save profile information.');
        } finally {
            setIsSavingProfile(false);
        }
    };
    const handleSkillsSave = async () => { /* ... unchanged ... */
        setIsSavingSkills(true);
        setSkillsModalError(null);
        try {
            await apiClient<UserDto>('/profiles/me', {method: 'PATCH', body: {skills: skillsEditData}});
            closeSkillsEdit();
            fetchData(false);
        } catch (err: any) {
            setSkillsModalError(err.data?.message || err.message || 'Failed to save skills.');
        } finally {
            setIsSavingSkills(false);
        }
    };
    const handleInterestsSave = async () => { /* ... unchanged ... */
        setIsSavingInterests(true);
        setInterestsModalError(null);
        try {
            await apiClient<UserDto>('/profiles/me', {method: 'PATCH', body: {interests: interestsEditData}});
            closeInterestsEdit();
            fetchData(false);
        } catch (err: any) {
            setInterestsModalError(err.data?.message || err.message || 'Failed to save interests.');
        } finally {
            setIsSavingInterests(false);
        }
    };
    const handleExperienceSave = async () => { /* ... unchanged ... */
        setIsSavingExperience(true);
        setExperienceModalError(null);
        const {id, ...payloadData} = currentExperience;
        const payload: CreateWorkExperiencePayload | UpdateWorkExperiencePayload = {
            dateRange: payloadData.dateRange || '',
            workName: payloadData.workName || '',
            description: payloadData.description || '',
        };
        if (!payload.dateRange || !payload.workName || !payload.description) {
            setExperienceModalError("All experience fields are required.");
            setIsSavingExperience(false);
            return;
        }
        try {
            if (isEditingExperience && id) {
                await apiClient<WorkExperienceDto>(`/profiles/me/work-experiences/${id}`, {
                    method: 'PATCH',
                    body: payload
                });
            } else {
                await apiClient<WorkExperienceDto>('/profiles/me/work-experiences', {method: 'POST', body: payload});
            }
            closeExperienceEdit();
            fetchData(false);
        } catch (err: any) {
            setExperienceModalError(err.data?.message || err.message || 'Failed to save experience.');
        } finally {
            setIsSavingExperience(false);
        }
    };
    const handleExperienceDelete = async (experienceId: string) => { /* ... unchanged ... */
        setIsSavingExperience(true);
        setExperienceModalError(null);
        try {
            await apiClient<void>(`/profiles/me/work-experiences/${experienceId}`, {method: 'DELETE'});
            fetchData(false);
        } catch (err: any) {
            setExperienceModalError(err.data?.message || err.message || 'Failed to delete experience.');
        } finally {
            setIsSavingExperience(false);
        }
    };
    const handlePortfolioProjectAddSave = async () => { /* ... unchanged ... */
        setIsSavingNewPortfolioProject(true);
        setPortfolioAddModalError(null);
        if (!newPortfolioProjectData.title || !newPortfolioProjectData.description) {
            setPortfolioAddModalError("Portfolio Project Title and Description are required.");
            setIsSavingNewPortfolioProject(false);
            return;
        }
        try {
            const payload: CreatePortfolioProjectPayload = {
                title: newPortfolioProjectData.title!,
                description: newPortfolioProjectData.description!,
                tags: newPortfolioProjectData.tags || [],
            };
            await apiClient<PortfolioProjectDto>('/profiles/me/portfolio-projects', {method: 'POST', body: payload});
            closePortfolioProjectAdd();
            fetchData(false);
        } catch (err: any) {
            setPortfolioAddModalError(err.data?.message || err.message || 'Failed to add portfolio project.');
        } finally {
            setIsSavingNewPortfolioProject(false);
        }
    };
    const handlePortfolioProjectEditSave = async () => { /* ... unchanged ... */
        if (!editingPortfolioProject) return;
        setIsSavingEditedPortfolioProject(true);
        setPortfolioEditModalError(null);
        if (!editingPortfolioProjectData.title || !editingPortfolioProjectData.description) {
            setPortfolioEditModalError("Portfolio Project Title and Description are required.");
            setIsSavingEditedPortfolioProject(false);
            return;
        }
        try {
            const payload: UpdatePortfolioProjectPayload = {
                title: editingPortfolioProjectData.title,
                description: editingPortfolioProjectData.description,
                tags: editingPortfolioProjectData.tags || [],
            };
            await apiClient<PortfolioProjectDto>(`/profiles/me/portfolio-projects/${editingPortfolioProject.id}`, {
                method: 'PATCH',
                body: payload
            });
            closePortfolioProjectEdit();
            fetchData(false);
        } catch (err: any) {
            setPortfolioEditModalError(err.data?.message || err.message || 'Failed to update portfolio project.');
        } finally {
            setIsSavingEditedPortfolioProject(false);
        }
    };
    const handlePortfolioProjectDelete = async (projectId: string) => { /* ... unchanged ... */
        setIsSavingEditedPortfolioProject(true);
        setPortfolioEditModalError(null);
        try {
            await apiClient<void>(`/profiles/me/portfolio-projects/${projectId}`, {method: 'DELETE'});
            fetchData(false);
            if (editingPortfolioProject?.id === projectId) {
                closePortfolioProjectEdit();
            }
        } catch (err: any) {
            setPortfolioEditModalError(err.data?.message || err.message || 'Failed to delete portfolio project.');
        } finally {
            setIsSavingEditedPortfolioProject(false);
        }
    };

    // --- Input Change Handlers (Unchanged) ---
    const handleExperienceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.currentTarget;
        setCurrentExperience(prev => ({...prev, [name]: value}));
    };
    const handleNewPortfolioProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.currentTarget;
        setNewPortfolioProjectData(prev => ({...prev, [name]: value}));
    };
    const handleEditingPortfolioProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.currentTarget;
        setEditingPortfolioProjectData(prev => ({...prev, [name]: value}));
    };
    const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.currentTarget;
        setProfileEditData(prev => ({...prev, [name]: value}));
    };

    const initialItemsToShow = 2;

    // --- Render Loading/Error States ---
    if (isAuthLoading || !initialCheckComplete) {
        return (<Center style={{height: '80vh'}}> <Loader color="mainBlue.6"/> </Center>);
    }
    // Don't check isAuthenticated here, allow viewing public profiles
    if (isLoading) {
        return (<Center style={{height: '80vh'}}> <Loader color="mainBlue.6"/> </Center>);
    }
    if (error && !profileUserData) {
        return (<Container style={{paddingTop: '5vh'}}> <Alert icon={<IconAlertCircle size="1rem"/>}
                                                               title="Error Loading Profile" color="red"
                                                               radius="md"> {error} <Button
            onClick={() => fetchData(true)} mt="sm">Retry</Button> </Alert> </Container>);
    }
    if (!profileUserData || !profileUserData.profile) {
        return (<Container style={{paddingTop: '5vh'}}> <Alert icon={<IconAlertCircle size="1rem"/>}
                                                               title="Profile Not Found" color="orange" radius="md"> The
            requested user profile could not be loaded or does not exist. </Alert> </Container>);
    }

    // --- Destructure data ---
    const {firstName, lastName, profile} = profileUserData; // Use profileUserData
    const {
        status,
        institution,
        bio,
        avatarUrl,
        bannerUrl,
        skills = [],
        interests = [],
        workExperiences = [],
        portfolioProjects = []
    } = profile;
    const displayName = `${firstName || ''} ${lastName || ''}`.trim();

    // --- Render Main Content ---
    return (
        <GradientBackground gradient="linear-gradient(0deg, rgba(55, 197, 231, 0.3) 0%, rgba(55, 197, 231, 0.3) 70%, rgba(255, 255, 255, 1) 100%)">
            <Container mx="12%" size="100%" style={{borderRadius: theme.radius.md}} p="xl">
                {/* General Page Error */}
                {error && !profileEditOpened && !skillsEditOpened && !interestsEditOpened && !experienceEditOpened && !portfolioProjectAddOpened && !portfolioProjectEditOpened && (
                    <Alert icon={<IconAlertCircle size="1rem"/>} title="Operation Error" color="red" radius="md"
                           withCloseButton onClose={() => setError(null)} mb="lg"> {error} </Alert>
                )}
                <Stack gap="lg">
                    {/* Profile Header Card */}
                    <Paper withBorder radius="md" p={0} shadow="sm" style={{overflow: 'visible'}}>
                        <Box h={150} bg={bannerUrl ? undefined : theme.colors.gray[2]} style={{
                            borderTopLeftRadius: theme.radius.md,
                            borderTopRightRadius: theme.radius.md,
                            position: 'relative',
                            backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                            {!bannerUrl &&
                                <Group justify="center" align="center" style={{height: '100%'}}><IconPhoto size="3rem"
                                                                                                           color={theme.colors.gray[5]}/></Group>}
                        </Box>
                        <Box px="xl" pb="xl" pt={60} style={{position: 'relative'}}>
                            <Avatar src={avatarUrl || undefined} size={120} radius="50%" color="gray.3" style={{
                                position: 'absolute',
                                top: -60,
                                left: theme.spacing.xl,
                                border: `4px solid ${theme.white}`,
                                backgroundColor: theme.colors.gray[3]
                            }}>
                                {!avatarUrl && <IconPhoto size="3rem" color={theme.colors.gray[6]}/>}
                            </Avatar>
                            <Group justify="space-between" align="flex-start" mt="md">
                                <Stack gap="xs" style={{flexGrow: 1}}>
                                    <Group justify='space-between' wrap="nowrap">
                                        <Title order={2} fw={500}>{displayName || 'User Name'}</Title>
                                        {/* Only show edit icon if it's own profile */}
                                        {isOwnProfile && <ActionIcon variant="subtle" color="gray"
                                                                     onClick={handleOpenProfileEdit}><IconPencil
                                            size={18}/></ActionIcon>}
                                    </Group>
                                    <Group gap="sm">
                                        {status && <Badge color="mainBlue.6" variant="filled" radius="xl"
                                                          size="sm">{status}</Badge>}
                                        {institution && <Text size="sm" c="dimmed">{institution}</Text>}
                                    </Group>
                                    {bio && <Text size="sm" c="dimmed" mt="xs" maw={500}>{bio}</Text>}
                                </Stack>
                                {/* Only show message button if NOT own profile */}
                                {!isOwnProfile && <Button color="mainBlue.6" radius="xl" mt={5} fw={400}
                                                          style={{flexShrink: 0}}> Message </Button>}
                            </Group>
                        </Box>
                    </Paper>

                    {/* Skills Section */}
                    <SectionCard title="Skills" onEdit={handleOpenSkillsEdit} onShowAll={openSkillsShowAll} showAllLink
                                 itemCount={initialItemsToShow} totalItemCount={skills.length}
                                 isOwnProfile={isOwnProfile}>
                        <Stack gap="md">
                            {skills.length === 0 && <Text size="sm" c="dimmed">No skills added yet.</Text>}
                            {skills.slice(0, initialItemsToShow).map((skill, index) => (
                                <Stack key={skill.id} gap="xs"> <Title order={5}
                                                                       fw={500}>{skill.name}</Title> {skill.description &&
                                    <Text size="sm"
                                          c="black">{skill.description}</Text>} {index < initialItemsToShow - 1 && index < skills.length - 1 &&
                                    <Divider color="black" mt="xs"/>} </Stack>))}
                        </Stack>
                    </SectionCard>

                    {/* Interests Section */}
                    <SectionCard title="Interests" onEdit={handleOpenInterestsEdit} onShowAll={openInterestsShowAll}
                                 showAllLink itemCount={initialItemsToShow} totalItemCount={interests.length}
                                 isOwnProfile={isOwnProfile}>
                        <Stack gap="md">
                            {interests.length === 0 && <Text size="sm" c="dimmed">No interests added yet.</Text>}
                            {interests.slice(0, initialItemsToShow).map((interest, index) => (
                                <Stack key={interest.id} gap="xs"> <Title order={5}
                                                                          fw={500}>{interest.name}</Title> {interest.description &&
                                    <Text size="sm"
                                          c="black">{interest.description}</Text>} {index < initialItemsToShow - 1 && index < interests.length - 1 &&
                                    <Divider color="black" mt="xs"/>} </Stack>))}
                        </Stack>
                    </SectionCard>

                    {/* Experience Section */}
                    <SectionCard title="Experience" onEdit={handleOpenExperienceAdd} onShowAll={openExperienceShowAll}
                                 showAllLink itemCount={initialItemsToShow} totalItemCount={workExperiences.length}
                                 isOwnProfile={isOwnProfile}>
                        <Stack gap="md">
                            {workExperiences.length === 0 && <Text size="sm" c="dimmed">No experience added yet.</Text>}
                            {workExperiences.slice(0, initialItemsToShow).map((exp, index) => (
                                <Stack key={exp.id} gap="xs">
                                    <Group justify="space-between">
                                        <Group gap="xs"> <IconClock size={16} color={theme.colors.gray[6]}/> <Text
                                            size="xs" c="black">{exp.dateRange}</Text> </Group>
                                        {/* Only show edit/delete icons if own profile */}
                                        {isOwnProfile && (
                                            <Group gap="xs">
                                                <ActionIcon size="xs" variant="subtle"
                                                            onClick={() => handleOpenExperienceEdit(exp)}><IconPencil
                                                    size={14}/></ActionIcon>
                                                <ActionIcon size="xs" variant="subtle" color="red"
                                                            onClick={() => handleExperienceDelete(exp.id)}><IconX
                                                    size={14}/></ActionIcon>
                                            </Group>
                                        )}
                                    </Group>
                                    <Title order={5} fw={500}>{exp.workName}</Title>
                                    <Text size="sm" c="black">{exp.description}</Text>
                                    {index < initialItemsToShow - 1 && index < workExperiences.length - 1 &&
                                        <Divider color="black" mt="xs"/>}
                                </Stack>
                            ))}
                        </Stack>
                    </SectionCard>
                </Stack>
            </Container>

            {/* --- Portfolio Projects Section --- */}
            <Container size="100%" mt="lg" p="xl" pt="0">
                <Paper radius="md" p="lg" shadow="sm">
                    <Stack gap="lg">
                        <Title order={3} fw={500}>Portfolio Projects</Title>
                        {portfolioProjects.length === 0 &&
                            <Text size="sm" c="dimmed">No portfolio projects added yet.</Text>}
                        {portfolioProjects.map((project) => (
                            <Paper key={project.id} withBorder radius="md" p="lg" shadow="xs"
                                   style={{position: 'relative'}}>
                                {/* Only show edit icon if own profile */}
                                {isOwnProfile && <ActionIcon variant="subtle" color="gray" style={{
                                    position: 'absolute',
                                    top: theme.spacing.sm,
                                    right: theme.spacing.sm,
                                    zIndex: 1
                                }} onClick={() => handleOpenPortfolioProjectEdit(project)}> <IconPencil size={18}/>
                                </ActionIcon>}
                                <Group wrap="nowrap" align="flex-start" gap="xl">
                                    <Stack gap="md" style={{flex: 1}}>
                                        <Title order={4} fw={500}>{project.title}</Title>
                                        <Group gap="xs"> {project.tags?.map(tag => (
                                            <Badge key={tag} color="mainBlue.6" variant="light" radius="sm"
                                                   size="sm">{tag}</Badge>))} </Group>
                                        <Text size="sm" c="black" lineClamp={3}>{project.description}</Text>
                                    </Stack>
                                    <Box w={200} miw={150}>
                                        <AspectRatio ratio={16 / 9}>
                                            <Box bg={project.imageUrl ? undefined : theme.colors.gray[2]} style={{
                                                borderRadius: theme.radius.sm,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundImage: project.imageUrl ? `url(${project.imageUrl})` : 'none',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}>
                                                {!project.imageUrl &&
                                                    <IconPhoto size="2.5rem" color={theme.colors.gray[5]}/>}
                                            </Box>
                                        </AspectRatio>
                                    </Box>
                                </Group>
                                {/* Only show delete button if own profile */}
                                {isOwnProfile && (
                                    <Group justify="flex-end" mt="md">
                                        <Button size="xs" variant="light" color="red"
                                                onClick={() => handlePortfolioProjectDelete(project.id)}
                                                leftSection={<IconX size={14}/>}>Delete</Button>
                                    </Group>
                                )}
                            </Paper>
                        ))}
                        {/* Only show add button if own profile */}
                        {isOwnProfile &&
                            <Button variant='outline' color='mainBlue.6' onClick={handleOpenPortfolioProjectAdd}
                                    leftSection={<IconPlus size={16}/>} radius="md"> Add Portfolio Project </Button>}
                    </Stack>
                </Paper>
            </Container>

            {/* --- Modals (Keep unchanged, they are only opened if isOwnProfile is true) --- */}
            {/* Profile Info Edit Modal */}
            <Modal opened={profileEditOpened} onClose={closeProfileEdit} title="Edit Profile Information" centered
                   size="md">
                <Stack> {profileModalError &&
                    <Alert color="red" title="Save Error" icon={<IconAlertCircle size="1rem"/>} withCloseButton
                           onClose={() => setProfileModalError(null)}>{profileModalError}</Alert>} <TextInput
                    name="firstName" label="First Name" value={profileEditData.firstName || ''}
                    onChange={handleProfileInputChange}/> <TextInput name="lastName" label="Last Name"
                                                                     value={profileEditData.lastName || ''}
                                                                     onChange={handleProfileInputChange}/> <TextInput
                    name="status" label="Status (e.g., Undergraduate)" value={profileEditData.status || ''}
                    onChange={handleProfileInputChange}/> <TextInput name="institution" label="Institution"
                                                                     value={profileEditData.institution || ''}
                                                                     onChange={handleProfileInputChange}/> <Textarea
                    name="bio" label="Bio" value={profileEditData.bio || ''} onChange={handleProfileInputChange}
                    minRows={3}/> <Group justify="flex-end" mt="md"> <Button variant="default"
                                                                             onClick={closeProfileEdit}
                                                                             disabled={isSavingProfile}>Cancel</Button>
                    <Button color="mainBlue.6" onClick={handleProfileInfoSave} loading={isSavingProfile}>Save
                        Changes</Button> </Group> </Stack>
            </Modal>
            {/* Skills Edit Modal */}
            <Modal opened={skillsEditOpened} onClose={closeSkillsEdit} title="Edit Skills" centered size="lg">
                <Stack> {skillsModalError &&
                    <Alert color="red" title="Save Error" icon={<IconAlertCircle size="1rem"/>} withCloseButton
                           onClose={() => setSkillsModalError(null)}>{skillsModalError}</Alert>} <TagsInput
                    label="Your Skills" placeholder="Enter skills and press Enter"
                    description="Add relevant skills one by one." data={[]} value={skillsEditData}
                    onChange={setSkillsEditData} clearable/> <Group justify="flex-end" mt="md"> <Button
                    variant="default" onClick={closeSkillsEdit} disabled={isSavingSkills}>Cancel</Button> <Button
                    color="mainBlue.6" onClick={handleSkillsSave} loading={isSavingSkills}>Save Skills</Button>
                </Group> </Stack>
            </Modal>
            {/* Skills Show All Modal */}
            <Modal opened={skillsShowAllOpened} onClose={closeSkillsShowAll} title="All Skills" centered size="lg">
                <ScrollArea h={400}> <Stack gap="md"> {(profileUserData?.profile?.skills || []).map((skill, index) => (
                    <React.Fragment key={skill.id}> <Stack gap="xs"> <Title order={5} fw={500}>{skill.name}</Title>
                        <Text size="sm" c="black">{skill.description || 'No description provided.'}</Text>
                    </Stack> {index < (profileUserData?.profile?.skills?.length || 0) - 1 && <Divider color="black"/>}
                    </React.Fragment>))} </Stack> </ScrollArea> <Group justify='flex-end' mt="md"><Button
                variant="default" onClick={closeSkillsShowAll}>Close</Button></Group>
            </Modal>
            {/* Interests Edit Modal */}
            <Modal opened={interestsEditOpened} onClose={closeInterestsEdit} title="Edit Interests" centered size="lg">
                <Stack> {interestsModalError &&
                    <Alert color="red" title="Save Error" icon={<IconAlertCircle size="1rem"/>} withCloseButton
                           onClose={() => setInterestsModalError(null)}>{interestsModalError}</Alert>} <TagsInput
                    label="Your Interests" placeholder="Enter interests and press Enter"
                    description="Add relevant interests one by one." data={[]} value={interestsEditData}
                    onChange={setInterestsEditData} clearable/> <Group justify="flex-end" mt="md"> <Button
                    variant="default" onClick={closeInterestsEdit} disabled={isSavingInterests}>Cancel</Button> <Button
                    color="mainBlue.6" onClick={handleInterestsSave} loading={isSavingInterests}>Save
                    Interests</Button> </Group> </Stack>
            </Modal>
            {/* Interests Show All Modal */}
            <Modal opened={interestsShowAllOpened} onClose={closeInterestsShowAll} title="All Interests" centered
                   size="lg">
                <ScrollArea h={400}> <Stack
                    gap="md"> {(profileUserData?.profile?.interests || []).map((interest, index) => (
                    <React.Fragment key={interest.id}> <Stack gap="xs"> <Title order={5}
                                                                               fw={500}>{interest.name}</Title> <Text
                        size="sm" c="black">{interest.description || 'No description provided.'}</Text>
                    </Stack> {index < (profileUserData?.profile?.interests?.length || 0) - 1 &&
                        <Divider color="black"/>} </React.Fragment>))} </Stack> </ScrollArea> <Group justify='flex-end'
                                                                                                     mt="md"><Button
                variant="default" onClick={closeInterestsShowAll}>Close</Button></Group>
            </Modal>
            {/* Experience Edit/Add Modal */}
            <Modal opened={experienceEditOpened} onClose={closeExperienceEdit}
                   title={isEditingExperience ? "Edit Experience" : "Add Experience"} centered size="lg">
                <Stack> {experienceModalError &&
                    <Alert color="red" title="Save Error" icon={<IconAlertCircle size="1rem"/>} withCloseButton
                           onClose={() => setExperienceModalError(null)}>{experienceModalError}</Alert>} <TextInput
                    required name="dateRange" label="Date Range" placeholder="e.g., May 2022 - Present"
                    value={currentExperience.dateRange || ''} onChange={handleExperienceInputChange}/> <TextInput
                    required name="workName" label="Work/Position Title" placeholder="e.g., Software Developer at XYZ"
                    value={currentExperience.workName || ''} onChange={handleExperienceInputChange}/> <Textarea required
                                                                                                                name="description"
                                                                                                                label="Description"
                                                                                                                placeholder="Describe your responsibilities and achievements"
                                                                                                                value={currentExperience.description || ''}
                                                                                                                onChange={handleExperienceInputChange}
                                                                                                                minRows={3}/>
                    <Group justify="flex-end" mt="md"> <Button variant="default" onClick={closeExperienceEdit}
                                                               disabled={isSavingExperience}>Cancel</Button> <Button
                        color="mainBlue.6" onClick={handleExperienceSave} loading={isSavingExperience}>Save
                        Experience</Button> </Group> </Stack>
            </Modal>
            {/* Experience Show All Modal */}
            <Modal opened={experienceShowAllOpened} onClose={closeExperienceShowAll} title="All Experience" centered
                   size="lg">
                <ScrollArea h={400}> <Stack
                    gap="md"> {(profileUserData?.profile?.workExperiences || []).map((exp, index) => (
                    <React.Fragment key={exp.id}> <Stack gap="xs"> <Group gap="xs"> <IconClock size={16}
                                                                                               color={theme.colors.gray[6]}/>
                        <Text size="xs" c="black">{exp.dateRange}</Text> </Group> <Title order={5}
                                                                                         fw={500}>{exp.workName}</Title>
                        <Text size="sm" c="black">{exp.description}</Text>
                    </Stack> {index < (profileUserData?.profile?.workExperiences?.length || 0) - 1 &&
                        <Divider color="black"/>} </React.Fragment>))} </Stack> </ScrollArea> <Group justify='flex-end'
                                                                                                     mt="md"><Button
                variant="default" onClick={closeExperienceShowAll}>Close</Button></Group>
            </Modal>
            {/* Portfolio Project Modals */}
            <Modal opened={portfolioProjectEditOpened} onClose={closePortfolioProjectEdit}
                   title={`Edit Portfolio Project: ${editingPortfolioProject?.title || ''}`} centered size="lg">
                {editingPortfolioProject && (<Stack> {portfolioEditModalError &&
                    <Alert color="red" title="Save Error" icon={<IconAlertCircle size="1rem"/>} withCloseButton
                           onClose={() => setPortfolioEditModalError(null)}>{portfolioEditModalError}</Alert>}
                    <TextInput required name="title" label="Project Title"
                               value={editingPortfolioProjectData.title || ''}
                               onChange={handleEditingPortfolioProjectInputChange}/> <Textarea required
                                                                                               name="description"
                                                                                               label="Description"
                                                                                               value={editingPortfolioProjectData.description || ''}
                                                                                               onChange={handleEditingPortfolioProjectInputChange}
                                                                                               minRows={4}/> <TagsInput
                        label="Tags" placeholder="Enter tags and press Enter" data={[]}
                        value={editingPortfolioProjectData.tags || []}
                        onChange={(value) => setEditingPortfolioProjectData(d => ({...d, tags: value}))} clearable/>
                    <Box> <Text size="sm" fw={500} mb={4}>Project Image</Text> <Paper withBorder p="lg" radius="md"
                                                                                      style={{
                                                                                          display: 'flex',
                                                                                          flexDirection: 'column',
                                                                                          alignItems: 'center',
                                                                                          justifyContent: 'center',
                                                                                          minHeight: 150,
                                                                                          backgroundColor: theme.colors.gray[0]
                                                                                      }}> <IconPhoto size="3rem"
                                                                                                     color={theme.colors.gray[5]}/>
                        <Text size="sm" c="dimmed" mt="xs">Image Upload Not Implemented</Text> </Paper> </Box> <Group
                        justify="flex-end" mt="md"> <Button variant="default" onClick={closePortfolioProjectEdit}
                                                            disabled={isSavingEditedPortfolioProject}>Cancel</Button>
                        <Button color="mainBlue.6" onClick={handlePortfolioProjectEditSave}
                                loading={isSavingEditedPortfolioProject}>Save Changes</Button> </Group> </Stack>)}
            </Modal>
            <Modal opened={portfolioProjectAddOpened} onClose={closePortfolioProjectAdd} title="Add Portfolio Project"
                   centered size="lg">
                <Stack> {portfolioAddModalError &&
                    <Alert color="red" title="Save Error" icon={<IconAlertCircle size="1rem"/>} withCloseButton
                           onClose={() => setPortfolioAddModalError(null)}>{portfolioAddModalError}</Alert>} <TextInput
                    required name="title" label="Project Title" placeholder="Enter project title"
                    value={newPortfolioProjectData.title || ''} onChange={handleNewPortfolioProjectInputChange}/>
                    <Textarea required name="description" label="Description" placeholder="Enter project description"
                              value={newPortfolioProjectData.description || ''}
                              onChange={handleNewPortfolioProjectInputChange} minRows={4}/> <TagsInput label="Tags"
                                                                                                       placeholder="Enter tags and press Enter"
                                                                                                       data={[]}
                                                                                                       value={newPortfolioProjectData.tags || []}
                                                                                                       onChange={(value) => setNewPortfolioProjectData(d => ({
                                                                                                           ...d,
                                                                                                           tags: value
                                                                                                       }))} clearable/>
                    <Box> <Text size="sm" fw={500} mb={4}>Project Image</Text> <Paper withBorder p="lg" radius="md"
                                                                                      style={{
                                                                                          display: 'flex',
                                                                                          flexDirection: 'column',
                                                                                          alignItems: 'center',
                                                                                          justifyContent: 'center',
                                                                                          minHeight: 150,
                                                                                          backgroundColor: theme.colors.gray[0]
                                                                                      }}> <IconPhoto size="3rem"
                                                                                                     color={theme.colors.gray[5]}/>
                        <Text size="sm" c="dimmed" mt="xs">Image Upload Not Implemented</Text> </Paper> </Box> <Group
                        justify="flex-end" mt="md"> <Button variant="default" onClick={closePortfolioProjectAdd}
                                                            disabled={isSavingNewPortfolioProject}>Cancel</Button>
                        <Button color="mainBlue.6" onClick={handlePortfolioProjectAddSave}
                                loading={isSavingNewPortfolioProject}>Add Project</Button> </Group> </Stack>
            </Modal>

        </GradientBackground>
    );
}

