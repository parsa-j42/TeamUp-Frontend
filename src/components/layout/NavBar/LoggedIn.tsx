import {Avatar, Box, Button, Group, Menu, Title} from "@mantine/core";
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../../../contexts/AuthContext.tsx";
import {
    IconLayoutDashboardFilled,
    IconLogout,
    IconSettings,
    IconUser
} from "@tabler/icons-react";

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
                <Menu position="bottom" withinPortal width="250px" radius="md" trigger="click-hover"
                      styles={{
                          dropdown: {
                              border: 'none',
                              boxShadow: '0 0 25px rgba(0, 0, 0, 0.2)',
                          }
                      }}>
                    <Menu.Target>
                        <Avatar src="/avatar.svg" alt="Profile Avatar" size="42" style={{ cursor: 'pointer' }} />
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Box pb="xs" ta="right"></Box>
                        <Menu.Label pb="sm"><Title order={2} fw={450} size="16px" c="black">Jason Hong</Title></Menu.Label>
                        <Menu.Divider pb="xs" w="90%" m="0 auto"/>
                        <Menu.Item pb="xs" pl="lg" leftSection={<IconLayoutDashboardFilled color="#6A4CF2" size={21} style={{marginBottom: "2px"}}/>}
                            onClick={() => navigate("/dashboard")}>Dashboard</Menu.Item>
                        <Menu.Item pb="xs" pl="lg" leftSection={<IconUser size={22} style={{marginBottom: "2px"}}/>}
                            onClick={() => navigate("/profile")}>My Profile</Menu.Item>
                        <Menu.Divider pb="xs"  w="90%" m="0 auto"/>
                        <Menu.Item  pb="xs" pl="lg" onClick={() => logout()} leftSection={<IconLogout color="#f10e34" size={22} style={{marginBottom: "2px", marginLeft: "3px"}}/>}>Logout</Menu.Item>
                        <Menu.Item fw={400} pb="xs" pl="lg" leftSection={<IconSettings size={22} style={{marginBottom: "2px", marginLeft: "1px"}}/>}>Settings</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
    );
}