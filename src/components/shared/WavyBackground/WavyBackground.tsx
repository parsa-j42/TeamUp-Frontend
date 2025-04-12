import React from 'react';
import { Box, useMantineTheme } from '@mantine/core';

interface WavyBackgroundProps {
    children: React.ReactNode;
    wavePath: string;
    backgroundColor?: string;
    waveHeight?: number;
    contentPaddingTop?: string | number;
    /** Optional extra padding added below the content, extending the background color downwards. */
    extraBottomPadding?: string | number;
    flipWave?: boolean;
}

const WavyBackground = ({
                            children,
                            wavePath,
                            backgroundColor,
                            waveHeight = 150,
                            contentPaddingTop = 0,
                            extraBottomPadding = 0,
                            flipWave = false,
                            ...OtherProps
                        }: WavyBackgroundProps) => {
    const theme = useMantineTheme();
    const waveColor = backgroundColor || theme.colors.mainPurple?.[6] || '#7048e8';

    // Calculate the default bottom padding if none is provided explicitly
    // We were implicitly adding theme.spacing.xl before, let's keep that as a base
    const effectiveBottomPadding = `calc(${theme.spacing.xl} + ${typeof extraBottomPadding === 'number' ? `${extraBottomPadding}px` : extraBottomPadding || '0px'})`;

    const svgTransform = flipWave ? 'rotate(180deg)' : 'none';

    return (
        <Box style={{ position: 'relative', width: '100%' }} {...OtherProps} m="0">
            <Box style={{
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
                width: '100vw',
                overflow: 'hidden',
                backgroundColor: waveColor,
                // Add padding bottom to the outer container as well to ensure it covers the inner padding
                paddingBottom: 0,
            }}>
                {/* Wave SVG */}
                <Box style={{
                    position: 'absolute',
                    top: flipWave ? 'auto' : 0,
                    bottom: flipWave ? 0 : 'auto',
                    width: '100%',
                    height: `${waveHeight}px`,
                    pointerEvents: 'none',
                    zIndex: 0,
                    overflow: 'hidden',
                }}>
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{ display: 'block', width: '100%', height: '100%', transform: svgTransform }}
                    >
                        <path d={wavePath} fill={theme.white} />
                    </svg>
                </Box>

                {/* Content container */}
                <Box style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '100%',
                    margin: '0 auto',
                    boxSizing: 'border-box',
                    width: '100%',
                    paddingLeft: '13%',
                    paddingRight: '13%',
                    paddingTop: contentPaddingTop,
                    // Apply the calculated bottom padding here
                    paddingBottom: effectiveBottomPadding, // <-- Use the calculated value
                }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default WavyBackground;