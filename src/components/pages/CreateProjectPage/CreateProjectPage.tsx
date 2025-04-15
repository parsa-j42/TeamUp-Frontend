import {
    Box,
    Container,
    Title,
    useMantineTheme,
} from '@mantine/core';
import WavyBackground from '@components/shared/WavyBackground/WavyBackground';
import { CreateProjectForm } from './components/CreateProjectForm';

// Define the SVG path for the wave shape
// This path creates the top curved edge of the white content area
const WAVE_PATH = "M 0 39 Q 24 58 52 35 C 59 28 88 23 100 39 L 100 0 L 0 0 Z";

/**
 * The main page component for creating a new project.
 * Sets up the page layout with WavyBackground and renders the CreateProjectForm.
 */
export default function CreateProjectPage() {
    const theme = useMantineTheme();

    return (
        <WavyBackground
            wavePath={WAVE_PATH}
            waveHeight={1425} // Adjust height of the SVG wave area
            contentPaddingTop={0} // Adjust padding above the content inside the wave
            extraBottomPadding={0} // Ensure purple extends below content
            flipWave={true} // Flip the wave direction
        >
            <Box p="xl"> {/* Outer padding for the content area */}
                {/* Container for the main form content */}
                <Container
                    size="md" // Max width of the container
                    py="xl" // Vertical padding
                    px="xl" // Horizontal padding inside the container
                    bg="white" // White background for the form container
                    style={{
                        borderRadius: theme.radius.md, // Rounded corners
                        boxShadow: theme.shadows.xxl, // Strong shadow for depth
                    }}
                >
                    {/* Page Title */}
                    <Title order={1} c="black" fw={300} mb="xl">
                        Create New Project
                    </Title>

                    {/* Render the extracted form component */}
                    <CreateProjectForm />

                </Container>
            </Box>
        </WavyBackground>
    );
}