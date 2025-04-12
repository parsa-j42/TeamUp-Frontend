import {Avatar, Button, Group, Menu} from "@mantine/core";
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../../../contexts/AuthContext.tsx";

export function LoggedIn() {
    const navigate = useNavigate();
    const { logout } = useAuth();


    return (
            <Group h="100%" p="0" justify="flex-end" gap="xl" wrap="nowrap">
                <Button variant="white" color="black" fw={400} size="md"
                    onClick={() => navigate("#")}>Discover</Button>
                <Button variant="white" color="black" fw={400} size="md"
                        onClick={() => navigate("/Dashboard")}>Dashboard</Button>
                <Button variant="white" color="black" fw={400} size="md"
                        onClick={() => navigate("#")}>Messages</Button>
                <Menu position="bottom-end" withArrow withinPortal>
                    <Menu.Target>
                        <Avatar src="/avatar.svg" alt="Profile Avatar" size="42" style={{ cursor: 'pointer' }} />
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={() => logout()}>Logout</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
    );
}