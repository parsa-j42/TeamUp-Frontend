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
                overflow: 'hidden', // Prevent content overflow issues
                paddingBottom,
                background: gradient,
            }}
            {...otherProps}
        >
            {/* Inner container to constrain content width */}
            <Box style={{ width: '100%', maxWidth: '100vw', margin: '0 auto' }}>
                {children}
            </Box>
        </Box>
    );
};

export default GradientBackground;