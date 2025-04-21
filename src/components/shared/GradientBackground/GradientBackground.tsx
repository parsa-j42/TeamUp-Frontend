import React from 'react';
import {Box, BoxProps} from '@mantine/core';

interface GradientBackgroundProps extends BoxProps {
    children: React.ReactNode;
    /** CSS gradient string to use as background */
    gradient?: string;
    /** Additional padding at the bottom */
    paddingBottom?: string | number;
}

const GradientBackground = ({
                                children,
                                gradient = "linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(55, 197, 231, 0.3) 50%, rgba(255, 255, 255, 1) 100%)",
                                paddingBottom = 0,
                                ...otherProps
                            }: GradientBackgroundProps) => {
    return (
        <Box
            style={{
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
                width: '100vw',
                overflow: 'hidden',
                paddingBottom,
                background: gradient,
            }}
            {...otherProps}
        >
            {children}
        </Box>
    );
};

export default GradientBackground;