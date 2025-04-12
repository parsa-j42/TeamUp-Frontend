import { Box, MantineColor, useMantineTheme } from '@mantine/core';

interface DecorativeCircleProps {
    size: string | number;
    color: MantineColor | string; // Allow theme colors or direct CSS colors
    opacity: number;
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    transform: string; // Required for positioning logic
}

/**
 * Renders a purely decorative, absolutely positioned circle
 * used as a background element on the SuccessPage.
 */
export function DecorativeCircle({
                                     size,
                                     color,
                                     opacity,
                                     top,
                                     left,
                                     right,
                                     bottom,
                                     transform,
                                 }: DecorativeCircleProps) {
    const theme = useMantineTheme();

    // Resolve theme color if a theme key (like 'mainPurple.6') is provided
    const backgroundColor = theme.colors[color]?.[6] ?? color;

    return (
        <Box
            style={{
                position: 'absolute',
                top,
                left,
                right,
                bottom,
                width: size,
                height: size,
                backgroundColor, // Use resolved color
                borderRadius: '50%',
                transform,
                opacity,
                zIndex: 0, // Ensure it's behind the main content
                pointerEvents: 'none', // Make sure it doesn't interfere with interactions
            }}
        />
    );
}