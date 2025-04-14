import {Button, Group} from "@mantine/core";
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import {useAuth} from "@contexts/AuthContext.tsx";

export function LoggedOut() {
    const { login } = useAuth();

    return (
            <Group h="100%" p="0" justify="flex-end" gap="xl" wrap="nowrap">
                <Button variant="white" color="black" fw={400} size="md">Discover</Button>
                <Button variant="white" color="black" fw={400} size="md">About</Button>
                <RoundedButton color="mainPurple.6" variant="filled" size="sm" fw="500">Sign Up</RoundedButton>
                <RoundedButton color="mainPurple.6" variant="filled" size="sm" fw="500" onClick={login}>Sign In</RoundedButton>
            </Group>
    );
}