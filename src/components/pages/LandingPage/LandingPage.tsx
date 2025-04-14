import { Box } from "@mantine/core";
import { LoggedIn } from './components/LoggedIn.tsx';
import LoggedOut from "@components/pages/LandingPage/components/LoggedOut.tsx";
import { useAuth } from "@contexts/AuthContext.tsx";

export default function LandingPage() {
    // Simulate authentication status for now - to be replaced with actual auth context
    const { isAuthenticated } = useAuth();

    return (
        <Box>
            {isAuthenticated ? <LoggedIn /> : <LoggedOut />}
        </Box>
    );
}