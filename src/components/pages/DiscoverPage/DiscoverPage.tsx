import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Container, Stack, Title, Text, Button, Collapse, Paper, MultiSelect,
    Loader, Alert, Center, Box, ScrollArea, useMantineTheme, Grid,
} from '@mantine/core';
import { IconFilter, IconAlertCircle, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { apiClient } from '@utils/apiClient';
import { ProjectDto, SkillDto, InterestDto, FindProjectsQueryDto } from '../../../types/api';
import { ProjectCard, ProjectCardProps } from '@components/shared/ProjectCard/ProjectCard';
import styles from './DiscoverPage.module.css';
import { ChipGroupField } from '@components/pages/CreateProjectPage/components/ChipGroupField';
import { mentorRequestFormOptions } from '@components/pages/CreateProjectPage/formConstants';

// Define HorizontalScroll component locally or import from shared
interface HorizontalProjectScrollProps {
    theme: any;
    projects: (ProjectCardProps & { id: string })[];
}

function HorizontalProjectScroll({ theme, projects }: HorizontalProjectScrollProps) {
    return (
        <Box className={styles.horizontalScrollContainer}>
            <ScrollArea scrollbarSize={11} offsetScrollbars="x" scrollbars="x" w="100%" classNames={{ viewport: styles.scrollbarViewport, scrollbar: styles.scrollbar, thumb: styles.scrollbarThumb }}>
                <Box style={{ display: 'flex', gap: theme.spacing.md, paddingRight: theme.spacing.xl }}>
                    {projects.map((project) => (
                        <ProjectCard key={project.id} {...project} />
                    ))}
                </Box>
            </ScrollArea>
        </Box>
    );
}
// --- End HorizontalScroll ---

export default function DiscoverPage() {
    const theme = useMantineTheme();
    // const navigate = useNavigate(); // Removed unused import
    const [searchParams] = useSearchParams();
    const searchTermFromUrl = searchParams.get('search') || '';

    // State for filters
    const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedMentorRequest, setSelectedMentorRequest] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // State for filter options
    const [skillOptions, setSkillOptions] = useState<{ value: string; label: string }[]>([]);
    const [interestOptions, setInterestOptions] = useState<{ value: string; label: string }[]>([]);
    const [tagOptions, setTagOptions] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [filtersError, setFiltersError] = useState<string | null>(null);

    // State for search results
    const [searchResults, setSearchResults] = useState<ProjectDto[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    // const [totalResults, setTotalResults] = useState(0); // Removed unused state

    // State for newest projects
    const [newestProjects, setNewestProjects] = useState<ProjectDto[]>([]);
    const [isLoadingNewest, setIsLoadingNewest] = useState(true);
    const [newestError, setNewestError] = useState<string | null>(null);

    // Debounce filter changes
    const [debouncedSkills] = useDebouncedValue(selectedSkills, 500);
    const [debouncedInterests] = useDebouncedValue(selectedInterests, 500);
    const [debouncedMentorRequest] = useDebouncedValue(selectedMentorRequest, 500);
    const [debouncedTags] = useDebouncedValue(selectedTags, 500);

    // --- Fetch Filter Options ---
    const fetchFilterOptions = useCallback(async () => {
        setIsLoadingFilters(true);
        setFiltersError(null);
        try {
            const [skillsData, interestsData] = await Promise.all([
                apiClient<SkillDto[]>('/skills'),
                apiClient<InterestDto[]>('/interests')
            ]);
            setSkillOptions(skillsData.map(s => ({ value: s.name, label: s.name })));
            setInterestOptions(interestsData.map(i => ({ value: i.name, label: i.name })));
        } catch (err: any) {
            console.error("Error fetching filter options:", err);
            setFiltersError("Could not load filter options.");
        } finally {
            setIsLoadingFilters(false);
        }
    }, []);

    // --- Fetch Newest Projects ---
    const fetchNewestProjects = useCallback(async () => {
        setIsLoadingNewest(true);
        setNewestError(null);
        try {
            const response = await apiClient<{ projects: ProjectDto[], total: number }>('/projects?take=2&skip=0');
            setNewestProjects(response.projects);
        } catch (err: any) {
            console.error("Error fetching newest projects:", err);
            setNewestError("Could not load newest projects.");
        } finally {
            setIsLoadingNewest(false);
        }
    }, []);

    // --- Fetch Search Results ---
    const fetchProjects = useCallback(async () => {
        console.log("Fetching projects with:", { search: searchTermFromUrl, skills: debouncedSkills, tags: [...debouncedInterests, ...debouncedTags], mentorRequest: debouncedMentorRequest });
        setIsLoadingSearch(true);
        setSearchError(null);

        const queryParams: FindProjectsQueryDto = {
            search: searchTermFromUrl || undefined,
            skill: debouncedSkills.length > 0 ? debouncedSkills[0] : undefined,
            tag: [...debouncedInterests, ...debouncedTags].length > 0 ? [...debouncedInterests, ...debouncedTags][0] : undefined,
            take: 20,
            skip: 0,
        };
        Object.keys(queryParams).forEach(key => queryParams[key as keyof FindProjectsQueryDto] === undefined && delete queryParams[key as keyof FindProjectsQueryDto]);
        const params = new URLSearchParams(queryParams as any).toString();

        try {
            const response = await apiClient<{ projects: ProjectDto[], total: number }>(`/projects?${params}`);
            setSearchResults(response.projects);
            // setTotalResults(response.total); // Removed unused state update
            const allTags = new Set<string>();
            response.projects.forEach(p => p.tags?.forEach(t => allTags.add(t)));
            setTagOptions(Array.from(allTags).map(t => ({ value: t, label: t })));
        } catch (err: any) {
            console.error("Error fetching search results:", err);
            setSearchError(err.data?.message || err.message || "Failed to fetch projects.");
            setSearchResults([]);
            // setTotalResults(0); // Removed unused state update
        } finally {
            setIsLoadingSearch(false);
        }
    }, [searchTermFromUrl, debouncedSkills, debouncedInterests, debouncedTags, debouncedMentorRequest]);

    // --- Effects ---
    useEffect(() => {
        fetchFilterOptions();
        fetchNewestProjects();
    }, [fetchFilterOptions, fetchNewestProjects]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Prepare data for project cards
    const searchResultsForScroll: (ProjectCardProps & { id: string })[] = searchResults.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        tags: p.tags || [],
        showFeedbackBadge: p.mentorRequest === 'looking',
    }));

    const newestProjectsForList: (ProjectCardProps & { id: string })[] = newestProjects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        tags: p.tags || [],
        showFeedbackBadge: p.mentorRequest === 'looking',
    }));

    return (
        <Container size="lg" className={styles.pageWrapper}>
            <Stack gap="xl">
                {/* Filter Button and Section */}
                <Button onClick={toggleFilters} variant="outline" leftSection={<IconFilter size={16} />} rightSection={filtersOpened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />} className={styles.filterButton} >
                    Filters
                </Button>

                <Collapse in={filtersOpened}>
                    <Paper withBorder shadow="xs" p="lg" className={styles.filterSection}>
                        {isLoadingFilters && <Center><Loader size="sm" /></Center>}
                        {filtersError && <Alert color="red" title="Filter Error">{filtersError}</Alert>}
                        {!isLoadingFilters && !filtersError && (
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                                    <MultiSelect label="Skills" placeholder="Filter by skills" data={skillOptions} value={selectedSkills} onChange={setSelectedSkills} searchable clearable className={styles.filterInput} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                                    <MultiSelect label="Interests (as Tags)" placeholder="Filter by interests" data={interestOptions} value={selectedInterests} onChange={setSelectedInterests} searchable clearable className={styles.filterInput} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                                    <MultiSelect label="Tags" placeholder="Filter by tags" data={tagOptions} value={selectedTags} onChange={setSelectedTags} searchable clearable className={styles.filterInput} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                                    <ChipGroupField label="Mentoring/Feedback" options={[{value: '', label: 'Any'}, ...mentorRequestFormOptions]} value={selectedMentorRequest} onChange={(value) => setSelectedMentorRequest(value as string)} multiple={false} />
                                </Grid.Col>
                            </Grid>
                        )}
                    </Paper>
                </Collapse>

                {/* Search Results Section */}
                <Box className={styles.resultsSection}>
                    <Title order={2} className={styles.sectionTitle}>
                        {searchTermFromUrl ? `Search Results for "${searchTermFromUrl}"` : "Discover Projects"}
                    </Title>
                    {isLoadingSearch && <Center><Loader /></Center>}
                    {searchError && <Alert color="red" title="Search Error" icon={<IconAlertCircle />}>{searchError}</Alert>}
                    {!isLoadingSearch && !searchError && searchResults.length === 0 && ( <Text c="dimmed">No projects found matching your criteria.</Text> )}
                    {!isLoadingSearch && !searchError && searchResults.length > 0 && ( <HorizontalProjectScroll theme={theme} projects={searchResultsForScroll} /> )}
                </Box>

                {/* Newest Projects Section */}
                <Box className={styles.resultsSection}>
                    <Title order={2} className={styles.sectionTitle}>New Projects on the Board</Title>
                    {isLoadingNewest && <Center><Loader /></Center>}
                    {newestError && <Alert color="red" title="Error Loading New Projects" icon={<IconAlertCircle />}>{newestError}</Alert>}
                    {!isLoadingNewest && !newestError && newestProjects.length === 0 && ( <Text c="dimmed">No new projects found.</Text> )}
                    {!isLoadingNewest && !newestError && newestProjects.length > 0 && (
                        <Box className={styles.verticalProjectList}>
                            {newestProjectsForList.map(project => ( <ProjectCard key={project.id} {...project} /> ))}
                        </Box>
                    )}
                </Box>
            </Stack>
        </Container>
    );
}