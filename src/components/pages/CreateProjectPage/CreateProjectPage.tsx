import {
    Box,
    Container,
    Title,
    useMantineTheme,
} from '@mantine/core';
import GradientBackground from '@components/shared/GradientBackground/GradientBackground';
import { CreateProjectForm } from './components/CreateProjectForm';

/**
 * The main page component for creating a new project.
 * Sets up the page layout with GradientBackground and renders the CreateProjectForm.
 */
export default function CreateProjectPage() {
    const theme = useMantineTheme();

    return (
        <GradientBackground
            gradient="linear-gradient(0deg, rgba(55, 197, 231, 0.3) 0%, rgba(55, 197, 231, 0.3) 70%, rgba(255, 255, 255, 1) 100%)"
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
        </GradientBackground>
    );
}
