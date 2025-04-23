import { Box, ScrollArea, useMantineTheme } from '@mantine/core';
import { ProjectCard, ProjectCardProps } from '@components/shared/ProjectCard/ProjectCard';
import classes from './HorizontalProjectScroll.module.css';
import { useRef } from 'react';

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
    const viewportRef = useRef<HTMLDivElement>(null);

    // This function intercepts wheel events before ScrollArea processes them
    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        // If this is primarily a vertical scroll
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            // Don't let ScrollArea handle it - let it pass through to the document
            event.currentTarget.scrollLeft += event.deltaX;

            // Don't prevent default - let the document handle vertical scrolling
            return;
        }

        // For horizontal scrolling, handle it directly and prevent default
        if (viewportRef.current && event.deltaX !== 0) {
            viewportRef.current.scrollLeft += event.deltaX;
        }
    };

    return (
        <Box style={{ marginRight: containerMarginRight, width: containerWidth }} >
            <ScrollArea
                scrollbarSize={11}
                offsetScrollbars="x"
                scrollbars="x"
                w="100%"
                viewportRef={viewportRef}
                onWheelCapture={handleWheel} // Use onWheelCapture to intercept before ScrollArea handles it
                classNames={{
                    root: classes.scrollbarRoot,
                    viewport: classes.scrollbarViewport,
                    scrollbar: classes.scrollbar,
                    thumb: classes.scrollbarThumb,
                }}
            >
                <Box style={{ display: 'flex', gap: theme.spacing.md, paddingRight: theme.spacing.xl, paddingBottom: '20px' }}>
                    {projects.map((project) => (
                        <ProjectCard key={project.id} {...project} />
                    ))}
                </Box>
            </ScrollArea>
        </Box>
    );
}

export default HorizontalProjectScroll;
