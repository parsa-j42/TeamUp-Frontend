import { Paper, Stack, Title, useMantineTheme, type PaperProps, type TitleProps, type MantineSpacing } from '@mantine/core';
import React from 'react';

interface ProjectSectionCardProps extends Omit<PaperProps, 'children' | 'title' | 'p' | 'pt' | 'pb' | 'pl' | 'pr'> {
    title: string;
    titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
    titleSize?: string;
    titleWeight?: number;
    children: React.ReactNode;
    // Padding props
    paddingTop?: MantineSpacing | number | (string & {}); // Allow theme strings, numbers, or CSS strings
    paddingBottom?: MantineSpacing | number | (string & {});
    paddingRight?: MantineSpacing | number | (string & {});
    paddingLeft?: MantineSpacing | number | (string & {});
    // Gap between title and content within the card
    contentGap?: MantineSpacing | number | (string & {});
    titleProps?: Omit<TitleProps, 'order' | 'children'>;
}

/**
 * A reusable card component for displaying sections within the ProjectPage.
 * Applies padding directly to the inner content Stack to precisely match
 * the original layout's padding behavior. Allows configuring the gap
 * between the title and the content.
 */
export function ProjectSectionCard({
                                       title,
                                       titleOrder = 4,
                                       titleSize = "20px",
                                       titleWeight = 400,
                                       children,
                                       // Default padding values mimicking p="lg" pl="9%"
                                       paddingTop = "lg",
                                       paddingBottom = "lg",
                                       paddingRight = "lg",
                                       paddingLeft = "9%",
                                       // Default gap between title and content
                                       contentGap = "xs", // Default to 'xs' as in most original sections
                                       titleProps,
                                       ...paperProps // Spread remaining PaperProps (like shadow, radius, className, style)
                                   }: ProjectSectionCardProps) {
    const theme = useMantineTheme();

    // Function to resolve theme spacing values or use direct values
    const getSpacingValue = (spacing: MantineSpacing | number | (string & {}) | undefined) => {
        if (typeof spacing === 'string' && spacing in theme.spacing) {
            return theme.spacing[spacing as keyof typeof theme.spacing];
        }
        // Allow numbers (px) or valid CSS strings (like '9%')
        if (typeof spacing === 'number' || typeof spacing === 'string') {
            return spacing;
        }
        return undefined; // Return undefined if input is invalid/undefined
    };

    // Corrected title weight check
    const effectiveTitleWeight = (titleWeight === 40) ? 400 : titleWeight;

    return (
        // Apply only structural/visual props to Paper, not padding
        <Paper
            shadow="sm"
            radius="md"
            {...paperProps}
        >
            {/* Apply padding and gap directly to the Stack */}
            <Stack
                gap={getSpacingValue(contentGap)} // Use the configurable gap
                pt={getSpacingValue(paddingTop)}
                pb={getSpacingValue(paddingBottom)}
                pr={getSpacingValue(paddingRight)}
                pl={getSpacingValue(paddingLeft)}
            >
                <Title
                    order={titleOrder}
                    fw={effectiveTitleWeight}
                    size={titleSize}
                    // Removed mb="xs" - let Stack gap handle spacing
                    {...titleProps}
                >
                    {title}
                </Title>
                {/* Section Content */}
                {children}
            </Stack>
        </Paper>
    );
}