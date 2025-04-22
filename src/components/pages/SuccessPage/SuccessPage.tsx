import { Box, Button, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DecorativeCircle } from './components/DecorativeCircle';

/**
 * Displays a success confirmation message to the user after an action
 * (e.g., applying to a project, creating a project).
 *
 * Features a prominent checkmark icon, a dynamic success message based on
 * the previous action (passed via route state), and a button to navigate
 * back to the homepage. Includes decorative background circles positioned
 * absolutely relative to the main content container.
 */
export default function SuccessPage() {
    const theme = useMantineTheme();
    const navigate = useNavigate(); // Hook for navigation
    const location = useLocation(); // Hook to access route state

    // Determine the action performed from the route state, default to 'Done'
    const action = location.state?.action || 'Done';
    const successMessage = `Successfully ${action}`;

    // Handler for the Homepage button click
    const handleHomepageClick = () => {
        // Navigate the user to the homepage route.
        navigate('/');
    };

    // Styles for the checkmark icon container
    const checkmarkContainerStyle: React.CSSProperties = {
        width: 145,
        height: 145,
        borderRadius: '50%',
        backgroundColor: theme.colors.mainPurple?.[6],
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '10px solid #d9d9d9', // Specific border color
    };

    // Styles for the checkmark icon itself
    const checkmarkIconStyle = {
        size: 100,
        color: "#d9d9d9", // Specific icon color
        stroke: 2.5,
    };

    // Styles for the main content centering container (original implementation)
    // This container also acts as the positioning context for the absolute circles.
    const centerContentStyle: React.CSSProperties = {
        position: 'relative', // Establish positioning context for absolute children (circles and content stack)
        zIndex: 1, // Ensure content is above circles (which have zIndex 0)
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        minHeight: '70vh', // Minimum height to push content down slightly
    };

    return (
        // Outermost Box - no specific height or positioning needed here
        <Box>
            {/* Decorative Circles - positioned absolutely relative to the next Box */}
            <DecorativeCircle
                size="400px"
                color="mainBlue"
                opacity={0.7}
                top="55%"
                left={0}
                transform="translate(-40%, -50%)"
            />
            <DecorativeCircle
                size="200px"
                color="mainBlue"
                opacity={0.55}
                top="37%"
                left={0}
                transform="translate(-50%, -50%)"
            />
            <DecorativeCircle
                size="330px"
                color="mainBlue"
                opacity={0.7}
                top="52%"
                right={0}
                transform="translate(50%, -50%)"
            />

            {/* Center Content Container - applies flex centering and positioning context */}
            <Box style={centerContentStyle}>
                {/* Stack for the vertically aligned content elements */}
                <Stack align="center" gap="xl">
                    {/* Checkmark Icon Container */}
                    <Box style={checkmarkContainerStyle}>
                        <IconCheck {...checkmarkIconStyle} />
                    </Box>

                    {/* Success Text */}
                    <Text size="28px" fw={400} c="black">
                        {successMessage}
                    </Text>

                    {/* Homepage Button */}
                    <Button
                        color="mainBlue.6"
                        variant="filled"
                        radius="xl"
                        fw={500}
                        onClick={handleHomepageClick}
                        size="md"
                    >
                        Homepage
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}