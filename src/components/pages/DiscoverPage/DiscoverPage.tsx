import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Container, Stack, Title, Text, Button, Group, Select,
    Loader, Alert, Center, Box, Grid, Pill, Collapse
} from '@mantine/core';
import { IconFilter, IconAlertCircle, IconChevronDown } from '@tabler/icons-react';
import { apiClient } from '@utils/apiClient';
import { ProjectDto, FindProjectsQueryDto, SkillDto, RecommendedProjectDto } from '../../../types/api';
import { ProjectCardProps } from '@components/shared/ProjectCard/ProjectCard';
import HorizontalProjectScroll from "@components/shared/HorizontalProjectScroll/HorizontalProjectScroll";
import { InterestedProjectItem } from './components/InterestedProjectItem';
import styles from './DiscoverPage.module.css';
import { useAuth } from '@contexts/AuthContext';

// --- Predefined Options ---
const predefinedTags = ['Design', 'Development', 'Business', 'Community', 'Content & Media', 'Science'];
const projectStatusOptions = [
    { value: '', label: 'Any Status' },
    { value: 'Open', label: 'Open to application' },
    { value: 'Closed', label: 'Closed' },
];
const mentorRequestOptions = [
    { value: '', label: 'Any Preference' },
    { value: 'looking', label: 'Looking for a Mentor' },
    { value: 'open', label: 'Open for Feedback' },
    { value: 'one-time', label: 'One-time coffee chat' },
];
// --- End Predefined Options ---

export default function DiscoverPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchTermFromUrl = searchParams.get('search') || '';
    const { isAuthenticated, initialCheckComplete } = useAuth(); // Get auth state

    // --- State for Filters ---
    const [selectedSkill, setSelectedSkill] = useState<string | null>(searchParams.get('skill') || null);
    const [projectStatus, setProjectStatus] = useState<string | null>(searchParams.get('status') || 'Open');
    const [mentoringFeedback, setMentoringFeedback] = useState<string | null>(searchParams.get('mentorRequest') || '');
    const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get('tag') || null);
    const [showFilters, setShowFilters] = useState(true);

    // --- State for Skills Dropdown ---
    const [allSkills, setAllSkills] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingSkills, setIsLoadingSkills] = useState(false);
    const [skillsError, setSkillsError] = useState<string | null>(null);

    // --- State for Search Results ---
    const [searchResults, setSearchResults] = useState<ProjectDto[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // --- State for Recommendations ---
    const [recommendedProjects, setRecommendedProjects] = useState<RecommendedProjectDto[]>([]);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
    const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

    // --- Determine if any filters are active ---
    const filtersAreActive = !!selectedSkill || !!projectStatus || !!mentoringFeedback || !!selectedTag;
    const shouldShowRelevantResults = !!searchTermFromUrl || filtersAreActive;

    // --- Fetch Skills for Dropdown ---
    const fetchSkills = useCallback(async () => {
        console.log('[DiscoverPage] Fetching skills for filter...');
        setIsLoadingSkills(true);
        setSkillsError(null);
        try {
            const skillsData = await apiClient<SkillDto[]>('/skills');
            const skillOptions = skillsData.map(skill => ({ value: skill.name, label: skill.name }));
            setAllSkills([{ value: '', label: 'Any Skill' }, ...skillOptions]);
        } catch (err: any) {
            console.error("Error fetching skills:", err);
            setSkillsError("Could not load skills filter.");
            setAllSkills([{ value: '', label: 'Error loading skills' }]);
        } finally {
            setIsLoadingSkills(false);
        }
    }, []);

    // --- Fetch Recommendations ---
    const fetchRecommendations = useCallback(async () => {
        if (!isAuthenticated || !initialCheckComplete) {
            setIsLoadingRecommendations(false);
            setRecommendedProjects([]);
            return;
        }
        console.log('[DiscoverPage] Fetching recommendations...');
        setIsLoadingRecommendations(true);
        setRecommendationsError(null);
        try {
            const response = await apiClient<RecommendedProjectDto[]>('/recommendations/projects');
            setRecommendedProjects(response);
        } catch (err: any) {
            console.error("Error fetching recommendations:", err);
            if (err.status !== 401) {
                setRecommendationsError("Could not load recommendations at this time.");
            }
            setRecommendedProjects([]);
        } finally {
            setIsLoadingRecommendations(false);
        }
    }, [isAuthenticated, initialCheckComplete]);

    // --- Fetch Main Search Results ---
    const fetchProjects = useCallback(async () => {
        if (!shouldShowRelevantResults) {
            setSearchResults([]);
            setIsLoadingSearch(false);
            return;
        }

        console.log("Fetching relevant projects with:", {
            search: searchTermFromUrl,
            skill: selectedSkill || undefined,
            tag: selectedTag || undefined,
            mentorRequest: mentoringFeedback || undefined,
        });
        setIsLoadingSearch(true);
        setSearchError(null);

        const queryParams: FindProjectsQueryDto = {
            search: searchTermFromUrl || undefined,
            skill: selectedSkill || undefined,
            tag: selectedTag || undefined,
            mentorRequest: mentoringFeedback || undefined,
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
    }, [shouldShowRelevantResults, searchTermFromUrl, selectedSkill, selectedTag, mentoringFeedback]);

    // --- Effects ---
    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (initialCheckComplete) {
            fetchRecommendations();
        }
    }, [fetchRecommendations, initialCheckComplete]);

    // Update URL search params when local filter state changes
    useEffect(() => {
        const params: Record<string, string> = {};
        if (searchTermFromUrl) params.search = searchTermFromUrl;
        if (selectedSkill) params.skill = selectedSkill;
        if (selectedTag) params.tag = selectedTag;
        if (mentoringFeedback) params.mentorRequest = mentoringFeedback;
        if (projectStatus) params.status = projectStatus;

        setSearchParams(params, { replace: true });
    }, [selectedSkill, selectedTag, mentoringFeedback, projectStatus, searchTermFromUrl, setSearchParams]);

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
    const clearFilter = (filterSetter: React.Dispatch<React.SetStateAction<any>>, defaultValue: any = null) => {
        filterSetter(defaultValue);
    };

    // --- Toggle Filter Visibility ---
    const toggleFilters = () => setShowFilters((prev) => !prev);

    // --- Active Filter Pills ---
    const activeFilters = [
        { key: 'skill', value: selectedSkill, label: `Skill: ${selectedSkill}`, clear: () => clearFilter(setSelectedSkill, null) },
        { key: 'status', value: projectStatus, label: `Status: ${projectStatusOptions.find(o => o.value === projectStatus)?.label}`, clear: () => clearFilter(setProjectStatus, '') },
        { key: 'mentorRequest', value: mentoringFeedback, label: `Mentoring: ${mentorRequestOptions.find(o => o.value === mentoringFeedback)?.label}`, clear: () => clearFilter(setMentoringFeedback, '') },
        { key: 'tag', value: selectedTag, label: `Tag: ${selectedTag}`, clear: () => clearFilter(setSelectedTag, null) },
    ].filter(f => f.value);

    // --- Prepare Tag Options ---
    const tagOptions = [
        { value: '', label: 'Any Tag' },
        ...predefinedTags.map(tag => ({ value: tag, label: tag }))
    ];

    return (
        <Container fluid className={styles.pageWrapper}>
            <Container size="lg">
                <Stack gap="xl">
                    {/* Filter Section */}
                    <Group justify="flex-end" className={styles.headerGroup}>
                        <Button
                            variant="default"
                            leftSection={<IconFilter color="#37c5e7" size={18} />}
                            className={styles.filterButton}
                            onClick={toggleFilters}
                        >
                            Filters
                        </Button>
                    </Group>

                    {/* Filter Controls */}
                    <Collapse in={showFilters} transitionDuration={300}>
                        <Grid gutter="md" className={styles.filterControlsContainer}>
                            {/* Skill Select */}
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <Box className={styles.filterControlWrapper}>
                                    <Group justify="space-between" className={styles.filterLabelGroup}>
                                        <Text component="label" htmlFor="skill-select" className={styles.filterLabel}>Skill</Text>
                                        {selectedSkill && (
                                            <button onClick={() => clearFilter(setSelectedSkill, null)} className={styles.filterClearButton}>Clear</button>
                                        )}
                                    </Group>
                                    <Select
                                        id="skill-select"
                                        placeholder="Select skill"
                                        data={allSkills}
                                        value={selectedSkill}
                                        onChange={setSelectedSkill}
                                        searchable
                                        disabled={isLoadingSkills}
                                        error={skillsError}
                                        rightSection={isLoadingSkills ? <Loader size={16} /> : <IconChevronDown size={16} />}
                                        classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, dropdown: styles.dropdown }}
                                        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                        nothingFoundMessage={isLoadingSkills ? "Loading..." : "No skills found"}
                                    />
                                </Box>
                            </Grid.Col>

                            {/* Project Status Select */}
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <Box className={styles.filterControlWrapper}>
                                    <Group justify="space-between" className={styles.filterLabelGroup}>
                                        <Text component="label" htmlFor="status-select" className={styles.filterLabel}>Project Status</Text>
                                        {projectStatus && (
                                            <button onClick={() => clearFilter(setProjectStatus, '')} className={styles.filterClearButton}>Clear</button>
                                        )}
                                    </Group>
                                    <Select
                                        id="status-select"
                                        data={projectStatusOptions}
                                        value={projectStatus}
                                        onChange={setProjectStatus}
                                        classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, dropdown: styles.dropdown }}
                                        allowDeselect={false}
                                        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                    />
                                </Box>
                            </Grid.Col>

                            {/* Mentoring Select */}
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
                                        classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, dropdown: styles.dropdown }}
                                        allowDeselect={false}
                                        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                    />
                                </Box>
                            </Grid.Col>

                            {/* Tag Select */}
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <Box className={styles.filterControlWrapper}>
                                    <Group justify="space-between" className={styles.filterLabelGroup}>
                                        <Text component="label" htmlFor="tag-select" className={styles.filterLabel}>Tag</Text>
                                        {selectedTag && (
                                            <button onClick={() => clearFilter(setSelectedTag, null)} className={styles.filterClearButton}>Clear</button>
                                        )}
                                    </Group>
                                    <Select
                                        id="tag-select"
                                        placeholder="Select tag"
                                        data={tagOptions}
                                        value={selectedTag}
                                        onChange={setSelectedTag}
                                        classNames={{ input: styles.textInputOutline, label: styles.textInputLabel, dropdown: styles.dropdown }}
                                        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                                    />
                                </Box>
                            </Grid.Col>
                        </Grid>
                    </Collapse>

                    {/* Active Filter Pills */}
                    {activeFilters.length > 0 && (
                        <Box className={styles.filterPillsContainer}>
                            {activeFilters.map(filter => (
                                <Pill size="lg" key={filter.key} withRemoveButton onRemove={filter.clear} className={styles.filterPill}>
                                    {filter.label}
                                </Pill>
                            ))}
                        </Box>
                    )}

                    {/* Most Relevant Results Section */}
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
                        {isAuthenticated && isLoadingRecommendations && <Center><Loader /></Center>}
                        {isAuthenticated && recommendationsError && <Alert color="orange" title="Recommendations Unavailable" icon={<IconAlertCircle />}>{recommendationsError}</Alert>}
                        {isAuthenticated && !isLoadingRecommendations && !recommendationsError && recommendedProjects.length === 0 && (
                            <Center mih={100}>
                                <Text c="dimmed">No specific recommendations found for you right now.</Text>
                            </Center>
                        )}
                        {!isAuthenticated && !initialCheckComplete && (
                            <Center><Loader size="sm" /></Center>
                        )}
                        {!isAuthenticated && initialCheckComplete && (
                            <Center mih={100}>
                                <Text c="dimmed">Log in to see personalized recommendations.</Text>
                            </Center>
                        )}
                        {isAuthenticated && !isLoadingRecommendations && !recommendationsError && recommendedProjects.length > 0 && (
                            <Stack gap="md">
                                {recommendedProjects.map(({ project, reasons }) => (
                                    <InterestedProjectItem
                                        key={project.id}
                                        id={project.id}
                                        title={project.title}
                                        description={project.description}
                                        skills={project.requiredSkills || []}
                                        tags={project.tags || []}
                                        numOfMembers={project.numOfMembers || 'N/A'}
                                        status={projectStatusOptions.find(opt => opt.value === project.projectType)?.label || 'Open to application'}
                                        recommendationReasons={reasons}
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