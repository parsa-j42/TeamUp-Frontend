import { Button, Group, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";

interface LoggedOutProps {
    // "vertical" stacks the actions full width for the mobile drawer.
    orientation?: 'horizontal' | 'vertical';
    onNavigate?: () => void;
}

export function LoggedOut({ orientation = 'horizontal', onNavigate }: LoggedOutProps) {
    const navigate = useNavigate();

    // Wrap navigation so the drawer can close itself after a tap.
    const go = (path: string) => {
        navigate(path);
        onNavigate?.();
    };

    if (orientation === 'vertical') {
        return (
            <Stack gap="xs">
                <Button variant="subtle" color="black" fw={400} justify="flex-start" fullWidth
                        onClick={() => go("/Discover")}>Discover</Button>
                <Button variant="subtle" color="black" fw={400} justify="flex-start" fullWidth
                        onClick={() => go("/AboutUs")}>About</Button>
                <Button color="mainBlue.6" variant="subtle" fw={600} radius="md" fullWidth
                        onClick={() => go("/LogIn")}>Sign In</Button>
                <Button color="mainBlue.6" variant="filled" fw={600} radius="md" fullWidth
                        onClick={() => go("/SignUp")}>Sign Up</Button>
            </Stack>
        );
    }

    return (
        <Group h="100%" p="0" justify="flex-end" gap="xl" wrap="nowrap">
            <Button variant="white" color="black" fw={400} size="md"
                    onClick={() => navigate("/Discover")}>Discover</Button>
            <Button variant="white" color="black" fw={400} size="md"
                    onClick={() => navigate("/AboutUs")}>About</Button>
            <Button color="mainBlue.6" variant="subtle" size="sm" fw="600" radius="md"
                    onClick={() => navigate("/LogIn")}>Sign In</Button>
            <Button color="mainBlue.6" variant="filled" size="sm" fw="600" radius="md"
                    onClick={() => navigate("/SignUp")}>Sign Up</Button>
        </Group>
    );
}
