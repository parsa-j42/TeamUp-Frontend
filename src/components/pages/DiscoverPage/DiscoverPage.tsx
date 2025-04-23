import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Container, Stack, Title, Text, Button, Group, TextInput, Select,
    Loader, Alert, Center, Box, Grid, Pill, Collapse // Import Collapse
} from '@mantine/core';
import { IconFilter, IconAlertCircle, IconSearch,  } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { apiClient } from '@utils/apiClient';
import { ProjectDto, FindProjectsQueryDto } from '../../../types/api';
import { ProjectCardProps } from '@components/shared/ProjectCard/ProjectCard';
import HorizontalProjectScroll from "@components/shared/HorizontalProjectScroll/HorizontalProjectScroll"; // Adjust path
import { InterestedProjectItem } from './components/InterestedProjectItem';
import styles from './DiscoverPage.module.css';

// Placeholder options (can be fetched if dynamic)
const projectStatusOptions = [
    { value: '', label: 'Any Status' }, // Default/clear option
    { value: 'Open', label: 'Open to application' },
    { value: 'Closed', label: 'Closed' },
];
const mentorRequestOptions = [
    { value: '', label: 'Any Preference' }, // Default/clear option
    { value: 'looking', label: 'Looking for a Mentor' },
    { value: 'open', label: 'Open for Feedback' },
    { value: 'one-time', label: 'One-time coffee chat' }, // Added from screenshot
];

export default function DiscoverPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchTermFromUrl = searchParams.get('search') || '';

    // --- State for Filters ---
    // Use URL params as the source of truth, with local state reflecting them
    const [interestSkillKeyword, setInterestSkillKeyword] = useState(searchParams.get('skill') || '');
    const [projectStatus, setProjectStatus] = useState<string | null>(searchParams.get('status') || 'Open');
    const [mentoringFeedback, setMentoringFeedback] = useState<string | null>(searchParams.get('mentorRequest') || '');
    const [tagsKeyword, setTagsKeyword] = useState(searchParams.get('tag') || '');
    const [showFilters, setShowFilters] = useState(false); // State to control filter visibility

    // --- State for Search Results ---
    const [searchResults, setSearchResults] = useState<ProjectDto[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // --- State for "Interested" Projects ---
    const [interestedProjects, setInterestedProjects] = useState<ProjectDto[]>([]);
    const [isLoadingInterested, setIsLoadingInterested] = useState(true);
    const [interestedError, setInterestedError] = useState<string | null>(null);

    // --- Debounce Text Filter Inputs ---
    const [debouncedInterestSkill] = useDebouncedValue(interestSkillKeyword, 500);
    const [debouncedTagsKeyword] = useDebouncedValue(tagsKeyword, 500);

    // --- Determine if any filters are active ---
    const filtersAreActive = !!debouncedInterestSkill || !!projectStatus || !!mentoringFeedback || !!debouncedTagsKeyword;
    const shouldShowRelevantResults = !!searchTermFromUrl || filtersAreActive;

    // --- Fetch "Interested" Projects ---
    const fetchInterestedProjects = useCallback(async () => {
        console.log('[DiscoverPage] Fetching "interested" projects (skip=10)...');
        setIsLoadingInterested(true);
        setInterestedError(null);
        try {
            // Attempt to fetch projects skipping the first 10
            const response = await apiClient<{ projects: ProjectDto[], total: number }>('/projects?take=5&skip=10');
            setInterestedProjects(response.projects);
            if (response.projects.length === 0) {
                console.log('[DiscoverPage] No projects found with skip=10, trying skip=0 for interested section.');
                // Fallback: If skip=10 returns nothing, fetch first 5 instead
                const fallbackResponse = await apiClient<{ projects: ProjectDto[], total: number }>('/projects?take=5&skip=0');
                setInterestedProjects(fallbackResponse.projects);
            }
        } catch (err: any) {
            console.error("Error fetching interested projects:", err);
            setInterestedError("Could not load projects you might be interested in.");
            setInterestedProjects([]); // Ensure empty on error
        } finally {
            setIsLoadingInterested(false);
        }
    }, []);

    // --- Fetch Main Search Results (only if filters/search active) ---
    const fetchProjects = useCallback(async () => {
        // Only fetch if search term exists or filters are active
        if (!shouldShowRelevantResults) {
            setSearchResults([]); // Clear results if no search/filters
            setIsLoadingSearch(false);
            return;
        }

        console.log("Fetching relevant projects with:", {
            search: searchTermFromUrl,
            skill: debouncedInterestSkill,
            tag: debouncedTagsKeyword,
            mentorRequest: mentoringFeedback || undefined,
            status: projectStatus || undefined,
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
    }, [shouldShowRelevantResults, searchTermFromUrl, debouncedInterestSkill, debouncedTagsKeyword, mentoringFeedback, projectStatus]);

    // --- Effects ---
    useEffect(() => {
        // Fetch interested projects on mount
        fetchInterestedProjects();
    }, [fetchInterestedProjects]);

    useEffect(() => {
        // Fetch relevant results whenever dependencies change
        fetchProjects();
    }, [fetchProjects]); // Dependencies are implicitly handled by useCallback deps

    // Update URL search params when local filter state changes
    useEffect(() => {
        const params: Record<string, string> = {};
        // Include search term from URL if it exists (managed by NavBar)
        if (searchTermFromUrl) params.search = searchTermFromUrl;

        // Add local filters to params if they have values
        if (interestSkillKeyword) params.skill = interestSkillKeyword;
        if (tagsKeyword) params.tag = tagsKeyword;
        if (mentoringFeedback) params.mentorRequest = mentoringFeedback;
        if (projectStatus) params.status = projectStatus;

        // Update URL, replacing history state
        setSearchParams(params, { replace: true });
    }, [interestSkillKeyword, tagsKeyword, mentoringFeedback, projectStatus, searchTermFromUrl, setSearchParams]);


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

    // --- Toggle Filter Visibility ---
    const toggleFilters = () => setShowFilters((prev) => !prev);

    // --- Active Filter Pills ---
    const activeFilters = [
        { key: 'skill', value: interestSkillKeyword, label: `Skill/Interest: ${interestSkillKeyword}`, clear: () => clearFilter(setInterestSkillKeyword) },
        { key: 'status', value: projectStatus, label: `Status: ${projectStatusOptions.find(o => o.value === projectStatus)?.label}`, clear: () => clearFilter(setProjectStatus, '') },
        { key: 'mentorRequest', value: mentoringFeedback, label: `Mentoring: ${mentorRequestOptions.find(o => o.value === mentoringFeedback)?.label}`, clear: () => clearFilter(setMentoringFeedback, '') },
        { key: 'tag', value: tagsKeyword, label: `Tag: ${tagsKeyword}`, clear: () => clearFilter(setTagsKeyword) },
    ].filter(f => f.value); // Only include filters that have a value

    return (
        <Container fluid className={styles.pageWrapper}>
            <Container size="lg">
                <Stack gap="xl">
                    {/* Filter Section */}
                    <Group justify="flex-end" className={styles.headerGroup}>
                        <Button
                            variant="default"
                            leftSection={<IconFilter size={16} />}
                            className={styles.filterButton}
                            onClick={toggleFilters} // Add onClick handler
                        >
                            Filters
                        </Button>
                    </Group>

                    {/* Filter Controls - Using Grid for better alignment */}
                    <Collapse in={showFilters} transitionDuration={300}> {/* Wrap filters in Collapse */}
                        <Grid gutter="md" className={styles.filterControlsContainer}>
                            {/* Interests/Skills */}
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <Box className={styles.filterControlWrapper}>
                                    <Group justify="space-between" className={styles.filterLabelGroup}>
                                        <Text component="label" htmlFor="skill-interest-input" className={styles.filterLabel}>Interests/Skills</Text>
                                        {interestSkillKeyword && (
                                            <button onClick={() => clearFilter(setInterestSkillKeyword)} className={styles.filterClearButton}>Clear</button>
                                        )}
                                    </Group>
                                    <TextInput classNames={{ input: styles.textInputOutline, label: styles.textInputLabel}}
                                        id="skill-interest-input"
                                        placeholder="Keyword"
                                        leftSection={<IconSearch size={16} />}
                                        value={interestSkillKeyword}
                                        onChange={(event) => setInterestSkillKeyword(event.currentTarget.value)}
                                        // className={styles.filterInput}
                                    />
                                </Box>
                            </Grid.Col>

                            {/* Project Status */}
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <Box className={styles.filterControlWrapper}>
                                    <Group justify="space-between" className={styles.filterLabelGroup}>
                                        <Text component="label" htmlFor="status-select" className={styles.filterLabel}>Project Status</Text>
                                        {projectStatus && (
                                            <button onClick={() => clearFilter(setProjectStatus, '')} className={styles.filterClearButton}>Clear</button>
                                        )}
                                    </Group>
                                    <Select defaultValue="Open"
                                        id="status-select"
                                        data={projectStatusOptions}
                                        value={projectStatus}
                                        onChange={setProjectStatus}
                                        classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, dropdown: styles.dropdown}}
                                        allowDeselect={false}
                                        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                    />
                                </Box>
                            </Grid.Col>

                            {/* Mentoring/Feedback */}
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <Box className={styles.filterControlWrapper}>
                                    <Group justify="space-between" className={styles.filterLabelGroup}>
                                        <Text component="label" htmlFor="mentor-select" className={styles.filterLabel}>Mentoring/Feedback</Text>
                                        {mentoringFeedback && (
                                            <button onClick={() => clearFilter(setMentoringFeedback, '')} className={styles.filterClearButton}>Clear</button>
                                        )}
                                    </Group>
                                    <Select
                                        id="mentor-select"
                                        data={mentorRequestOptions}
                                        value={mentoringFeedback}
                                        onChange={setMentoringFeedback}
                                        classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, dropdown: styles.dropdown}}
                                        allowDeselect={false}
                                        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                    />
                                </Box>
                            </Grid.Col>

                            {/* Tags */}
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <Box className={styles.filterControlWrapper}>
                                    <Group justify="space-between" className={styles.filterLabelGroup}>
                                        <Text component="label" htmlFor="tags-input" className={styles.filterLabel}>Tags</Text>
                                        {tagsKeyword && (
                                            <button onClick={() => clearFilter(setTagsKeyword)} className={styles.filterClearButton}>Clear</button>
                                        )}
                                    </Group>
                                    <TextInput
                                        id="tags-input"
                                        placeholder="Keyword"
                                        leftSection={<IconSearch size={16} />}
                                        value={tagsKeyword}
                                        onChange={(event) => setTagsKeyword(event.currentTarget.value)}
                                        classNames={{ input: styles.textInputOutline, label: styles.textInputLabel}}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Collapse> {/* End Collapse */}

                    {/* Active Filter Pills */}
                    {activeFilters.length > 0 && (
                        <Box className={styles.filterPillsContainer}>
                            {activeFilters.map(filter => (
                                <Pill size="lg"
                                    key={filter.key}
                                    withRemoveButton
                                    onRemove={filter.clear}
                                    className={styles.filterPill}
                                >
                                    {filter.label}
                                </Pill>
                            ))}
                        </Box>
                    )}

                    {/* Most Relevant Results Section (Conditional) */}
                    {shouldShowRelevantResults && (
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
                                <HorizontalProjectScroll projects={searchResultsForScroll} />
                            )}
                        </Box>
                    )}

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
                                        description={project.description} // Pass description
                                        skills={project.requiredSkills || []}
                                        tags={project.tags || []}
                                        numOfMembers={project.numOfMembers || 'N/A'} // Pass numOfMembers
                                        // Use first tag or placeholder for category
                                        // category={project.tags?.[0] || 'UI/UX'}
                                        // Use actual project status if available and matches options, otherwise default
                                        status={projectStatusOptions.find(opt => opt.value === project.projectType)?.label || 'Open to application'}
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

