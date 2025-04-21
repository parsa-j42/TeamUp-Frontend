import { Box, ScrollArea, useMantineTheme } from '@mantine/core';
import { ProjectCard, ProjectCardProps } from '@components/shared/ProjectCard/ProjectCard';
import classes from './HorizontalProjectScroll.module.css';

// Interface for props passed to this component
export interface HorizontalProjectScrollProps {
    // Use ProjectCardProps & require id
    projects: (ProjectCardProps & { id: string })[];
    // Optional: Adjust container width relative to parent if needed
    containerWidth?: string;
    containerMarginRight?: string;
}

export function HorizontalProjectScroll({
                                            projects,
                                            containerWidth = 'calc(100% + 18%)', // Default matches previous usage
                                            containerMarginRight = '-13%', // Default matches previous usage
                                        }: HorizontalProjectScrollProps) {
    const theme = useMantineTheme();

    return (
        <Box style={{ marginRight: containerMarginRight, width: containerWidth }} >
            <ScrollArea
                scrollbarSize={11}
                offsetScrollbars="x"
                scrollbars="x"
                w="100%"
                overscrollBehavior="contain"
                // Use classes from the CSS module
                classNames={{
                    root: classes.scrollbarRoot,
                    viewport: classes.scrollbarViewport,
                    scrollbar: classes.scrollbar,
                    thumb: classes.scrollbarThumb,
                }}
            >
                <Box style={{ display: 'flex', gap: theme.spacing.md, paddingRight: theme.spacing.xl, paddingBottom: '20px' }}>
                    {/* Pass down all props including the id */}
                    {projects.map((project) => (
                        <ProjectCard key={project.id} {...project} />
                    ))}
                </Box>
            </ScrollArea>
        </Box>
    );
}

export default HorizontalProjectScroll;