import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Container, Stack, Title, Text, Button, Group, TextInput, Select,
    Loader, Alert, Center, Box, ActionIcon,
} from '@mantine/core';
import { IconFilter, IconAlertCircle, IconSearch, IconX } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { apiClient } from '@utils/apiClient';
import { ProjectDto, FindProjectsQueryDto } from '../../../types/api';
import { ProjectCardProps } from '@components/shared/ProjectCard/ProjectCard';
import HorizontalProjectScroll from "@components/shared/HorizontalProjectScroll/HorizontalProjectScroll";
import { InterestedProjectItem } from './components/InterestedProjectItem.tsx';
import styles from './DiscoverPage.module.css';

// Placeholder options for Project Status
const projectStatusOptions = [
    { value: '', label: 'Any Status' },
    { value: 'Open', label: 'Open to application' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Closed', label: 'Closed' },
];

// Placeholder options for Mentoring/Feedback (can be imported if needed)
const mentorRequestOptions = [
    { value: '', label: 'Any' },
    { value: 'looking', label: 'Looking for a Mentor' },
    { value: 'open', label: 'Open for Feedback' },
    // Add more if available in formConstants
];


export default function DiscoverPage() {
    const [searchParams, setSearchParams] = useSearchParams(); // Allow setting params
    const searchTermFromUrl = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category'); // Keep reading category

    // --- State for Filters ---
    const [interestSkillKeyword, setInterestSkillKeyword] = useState('');
    const [projectStatus, setProjectStatus] = useState<string | null>(''); // Use string | null for Select
    const [mentoringFeedback, setMentoringFeedback] = useState<string | null>(''); // Use string | null for Select
    const [tagsKeyword, setTagsKeyword] = useState(categoryFromUrl || ''); // Initialize with category

    // Removed filter options state (skillOptions, interestOptions, tagOptions) as we use text inputs mostly

    // --- State for Search Results ---
    const [searchResults, setSearchResults] = useState<ProjectDto[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // --- State for "Interested" Projects ---
    const [interestedProjects, setInterestedProjects] = useState<ProjectDto[]>([]);
    const [isLoadingInterested, setIsLoadingInterested] = useState(true);
    const [interestedError, setInterestedError] = useState<string | null>(null);

    // --- Debounce Filter Inputs ---
    const [debouncedInterestSkill] = useDebouncedValue(interestSkillKeyword, 500);
    const [debouncedTagsKeyword] = useDebouncedValue(tagsKeyword, 500);
    // No need to debounce selects (projectStatus, mentoringFeedback)

    // --- Fetch "Interested" Projects ---
    const fetchInterestedProjects = useCallback(async () => {
        // Example: Fetch page 2 of general projects or implement specific logic
        console.log('[DiscoverPage] Fetching "interested" projects...');
        setIsLoadingInterested(true);
        setInterestedError(null);
        try {
            // Fetch different data, e.g., skip first 10, take 5
            const response = await apiClient<{ projects: ProjectDto[], total: number }>('/projects?take=5&skip=10');
            setInterestedProjects(response.projects);
        } catch (err: any) {
            console.error("Error fetching interested projects:", err);
            setInterestedError("Could not load projects you might be interested in.");
        } finally {
            setIsLoadingInterested(false);
        }
    }, []);

    // --- Fetch Main Search Results ---
    const fetchProjects = useCallback(async () => {
        console.log("Fetching projects with:", {
            search: searchTermFromUrl, // From NavBar search
            skill: debouncedInterestSkill, // From "Interests/Skills" input
            tag: debouncedTagsKeyword, // From "Tags" input
            mentorRequest: mentoringFeedback || undefined, // From Select
            // status: projectStatus || undefined, // Add when backend supports it
        });
        setIsLoadingSearch(true);
        setSearchError(null);

        const queryParams: FindProjectsQueryDto = {
            search: searchTermFromUrl || undefined,
            skill: debouncedInterestSkill || undefined,
            tag: debouncedTagsKeyword || undefined,
            mentorRequest: mentoringFeedback || undefined,
            // status: projectStatus || undefined, // Add when backend supports it
            take: 20,
            skip: 0,
        };
        // Clean up undefined params
        Object.keys(queryParams).forEach(key => queryParams[key as keyof FindProjectsQueryDto] === undefined && delete queryParams[key as keyof FindProjectsQueryDto]);
        const params = new URLSearchParams(queryParams as any).toString();

        try {
            const response = await apiClient<{ projects: ProjectDto[], total: number }>(`/projects?${params}`);
            setSearchResults(response.projects);
        } catch (err: any) {
            console.error("Error fetching search results:", err);
            setSearchError(err.data?.message || err.message || "Failed to fetch projects.");
            setSearchResults([]);
        } finally {
            setIsLoadingSearch(false);
        }
    }, [searchTermFromUrl, debouncedInterestSkill, debouncedTagsKeyword, mentoringFeedback, projectStatus]); // Add projectStatus dependency

    // --- Effects ---
    useEffect(() => {
        // Fetch initial data
        fetchProjects();
        fetchInterestedProjects();
    }, [fetchProjects, fetchInterestedProjects]); // Run fetches on mount and when fetch functions change

    // New effect to update URL params when filters change
    useEffect(() => {
        const params: Record<string, string> = {};

        if (searchTermFromUrl) params.search = searchTermFromUrl;
        if (debouncedInterestSkill) params.skill = debouncedInterestSkill;
        if (debouncedTagsKeyword) params.tag = debouncedTagsKeyword;
        if (mentoringFeedback) params.mentorRequest = mentoringFeedback;
        if (projectStatus) params.status = projectStatus;

        setSearchParams(params, { replace: true });
    }, [searchTermFromUrl, debouncedInterestSkill, debouncedTagsKeyword, mentoringFeedback, projectStatus, setSearchParams]);

    // --- Map Data for Cards ---
    const mapProjectToCardProps = (project: ProjectDto): ProjectCardProps & { id: string } => ({
        id: project.id,
        title: project.title,
        description: project.description,
        skills: project.requiredSkills || [],
        tags: project.tags || [],
        numOfMembers: project.numOfMembers || 'N/A',
        showFeedbackBadge: project.mentorRequest === 'looking',
    });

    const searchResultsForScroll: (ProjectCardProps & { id: string })[] = searchResults.map(mapProjectToCardProps);

    // --- Filter Clear Handlers ---
    const clearFilter = (filterSetter: React.Dispatch<React.SetStateAction<any>>, defaultValue: any = '') => {
        filterSetter(defaultValue);
    };

    return (
        <Container fluid className={styles.pageWrapper}>
            <Container size="lg">
                <Stack gap="xl">
                    {/* Filter Section */}
                    <Group justify="flex-end" className={styles.headerGroup}>
                        {/* The main "Filters" button could trigger a modal instead, */}
                        {/* but the screenshot implies filters are always visible. */}
                        {/* For simplicity, we'll keep it as a static button for now. */}
                        <Button
                            variant="default"
                            leftSection={<IconFilter size={16} />}
                            className={styles.filterButton}
                        >
                            Filters
                        </Button>
                    </Group>

                    {/* Filter Controls */}
                    <Group grow className={styles.filterControlsGroup} preventGrowOverflow={false} wrap="wrap">
                        {/* Interests/Skills */}
                        <Box className={styles.filterInputWrapper}>
                            <TextInput
                                label="Interests/Skills"
                                placeholder="Keyword"
                                leftSection={<IconSearch size={16} />}
                                value={interestSkillKeyword}
                                onChange={(event) => setInterestSkillKeyword(event.currentTarget.value)}
                                className={styles.filterInput}
                            />
                            {interestSkillKeyword && (
                                <ActionIcon variant="transparent" onClick={() => clearFilter(setInterestSkillKeyword)} className={styles.filterClearButton} title="Clear">
                                    <IconX size={14} />
                                </ActionIcon>
                            )}
                        </Box>

                        {/* Project Status */}
                        <Box className={styles.filterInputWrapper}>
                            <Select
                                label="Project Status"
                                data={projectStatusOptions}
                                value={projectStatus}
                                onChange={setProjectStatus}
                                className={styles.filterInput}
                                // placeholder="Select status" // Placeholder not shown in screenshot
                                allowDeselect={false} // Prevent null value if 'Any' is not desired
                            />
                            {projectStatus && (
                                <ActionIcon variant="transparent" onClick={() => clearFilter(setProjectStatus, '')} className={styles.filterClearButton} title="Clear">
                                    <IconX size={14} />
                                </ActionIcon>
                            )}
                        </Box>

                        {/* Mentoring/Feedback */}
                        <Box className={styles.filterInputWrapper}>
                            <Select
                                label="Mentoring/Feedback"
                                data={mentorRequestOptions}
                                value={mentoringFeedback}
                                onChange={setMentoringFeedback}
                                className={styles.filterInput}
                                // placeholder="Select preference"
                                allowDeselect={false}
                            />
                            {mentoringFeedback && (
                                <ActionIcon variant="transparent" onClick={() => clearFilter(setMentoringFeedback, '')} className={styles.filterClearButton} title="Clear">
                                    <IconX size={14} />
                                </ActionIcon>
                            )}
                        </Box>

                        {/* Tags */}
                        <Box className={styles.filterInputWrapper}>
                            <TextInput
                                label="Tags"
                                placeholder="Keyword"
                                leftSection={<IconSearch size={16} />}
                                value={tagsKeyword}
                                onChange={(event) => setTagsKeyword(event.currentTarget.value)}
                                className={styles.filterInput}
                            />
                            {tagsKeyword && (
                                <ActionIcon variant="transparent" onClick={() => clearFilter(setTagsKeyword)} className={styles.filterClearButton} title="Clear">
                                    <IconX size={14} />
                                </ActionIcon>
                            )}
                        </Box>
                    </Group>

                    {/* Most Relevant Results Section */}
                    <Box className={styles.resultsSection}>
                        <Title order={2} className={styles.sectionTitle}>
                            The most relevant results
                        </Title>
                        {isLoadingSearch && <Center><Loader /></Center>}
                        {searchError && <Alert color="red" title="Search Error" icon={<IconAlertCircle />}>{searchError}</Alert>}
                        {!isLoadingSearch && !searchError && searchResults.length === 0 && (
                            <Center mih={200}>
                                <Text c="dimmed">No projects found matching your criteria.</Text>
                            </Center>
                        )}
                        {!isLoadingSearch && !searchError && searchResults.length > 0 && (
                            // Use Horizontal Scroll with ProjectCard
                            <HorizontalProjectScroll projects={searchResultsForScroll} />
                        )}
                    </Box>

                    {/* You Might Be Interested In Section */}
                    <Box className={styles.resultsSection}>
                        <Title order={2} className={styles.sectionTitle}>You might be interested in...</Title>
                        {isLoadingInterested && <Center><Loader /></Center>}
                        {interestedError && <Alert color="red" title="Error" icon={<IconAlertCircle />}>{interestedError}</Alert>}
                        {!isLoadingInterested && !interestedError && interestedProjects.length === 0 && (
                            <Center mih={100}>
                                <Text c="dimmed">No other projects to show right now.</Text>
                            </Center>
                        )}
                        {!isLoadingInterested && !interestedError && interestedProjects.length > 0 && (
                            <Stack gap="md">
                                {interestedProjects.map(project => (
                                    <InterestedProjectItem
                                        key={project.id}
                                        id={project.id}
                                        title={project.title}
                                        skills={project.requiredSkills || []}
                                        tags={project.tags || []}
                                        // Map backend data to category/status badges - using placeholders
                                        category={project.tags?.[0] || 'UI/UX'} // Example: use first tag
                                        status={projectStatusOptions.find(opt => opt.value === 'Open')?.label || 'Open to application'} // Example: default to Open
                                    />
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Container>
        </Container>
    );
}
