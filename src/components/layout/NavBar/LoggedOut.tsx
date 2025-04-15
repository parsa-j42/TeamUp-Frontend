import {Button, Group} from "@mantine/core";
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import {useAuth} from "@contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";

export function LoggedOut() {
    const { login } = useAuth();
    const navigate = useNavigate();
    return (
            <Group h="100%" p="0" justify="flex-end" gap="xl" wrap="nowrap">
                <Button variant="white" color="black" fw={400} size="md">Discover</Button>
                <Button variant="white" color="black" fw={400} size="md">About</Button>
                <RoundedButton color="mainPurple.6" variant="filled" size="sm" fw="500" onClick={() => navigate("/SignUp")}>Sign Up</RoundedButton>
                <RoundedButton color="mainPurple.6" variant="filled" size="sm" fw="500" onClick={login}>Sign In</RoundedButton>
            </Group>
    );
}