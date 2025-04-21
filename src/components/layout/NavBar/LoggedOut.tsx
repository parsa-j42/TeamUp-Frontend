import {Button, Group} from "@mantine/core";
import {useNavigate} from "react-router-dom";

export function LoggedOut() {
    const navigate = useNavigate();
    return (
            <Group h="100%" p="0" justify="flex-end" gap="xl" wrap="nowrap">
                <Button variant="white" color="black" fw={400} size="md"
                        onClick={() => navigate("/Discover")}>Discover</Button>
                <Button variant="white" color="black" fw={400} size="md"
                        onClick={() => navigate("/AboutUs")}>About</Button>
                <Button color="mainBlue.6" variant="subtle" size="sm" fw="600" radius="md"
                        onClick={() => navigate("/SignUp")}>Sign In</Button>
                <Button color="mainBlue.6" variant="filled" size="sm" fw="600" radius="md"
                        onClick={() => navigate("/LogIn")}>Sign Up</Button>
            </Group>
    );
}