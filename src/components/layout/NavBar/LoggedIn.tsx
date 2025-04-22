import { Avatar, Box, Button, Group, Menu, Title, Skeleton } from "@mantine/core";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@contexts/AuthContext";
import {
    IconLayoutDashboardFilled,
    IconLogout,
    IconSettings,
    IconUser,
    IconInbox
} from "@tabler/icons-react";

export function LoggedIn() {
    const navigate = useNavigate();
    // Get userDetails and the specific isLoading flag from context
    const { logout, userDetails, isLoading, initialCheckComplete } = useAuth();

    // --- Get username and avatar from userDetails ---
    const displayName = userDetails
        ? `${userDetails.preferredUsername || userDetails.firstName} ${userDetails.lastName}`.trim() // Use preferredUsername first
        : ''; // Default to empty if no details yet

    // Get avatar URL from profile within userDetails
    // const avatarUrl = userDetails?.profile?.avatarUrl;
    const avatarUrl='/avatar-blue.svg';
    // --- END MODIFIED ---

    // Determine if we should show loading skeletons
    const showLoadingState = isLoading || !initialCheckComplete;

    return (
        <Group h="100%" p="0" justify="flex-end" gap="xl" wrap="nowrap">
            <Button variant="white" color="black" fw={400} size="md"
                    onClick={() => navigate("/Discover")}>Discover</Button>
            <Button variant="white" color="black" fw={400} size="md"
                    onClick={() => navigate("/my-projects")}>My Projects</Button>
            <Button variant="white" color="black" fw={400} size="md"
                    onClick={() => navigate("/Messages")}>Messages</Button>
            <Menu position="bottom" withinPortal width="250px" radius="md" trigger="click-hover"
                  styles={{
                      dropdown: { border: 'none', boxShadow: '0 0 25px rgba(0, 0, 0, 0.2)' }
                  }}>
                <Menu.Target>
                    {/* Show Skeleton while loading user details */}
                    {showLoadingState ? (
                        <Skeleton height={42} circle />
                    ) : (
                        <Avatar src={avatarUrl || undefined} alt="Profile Avatar" radius="xl" size={42} style={{ cursor: 'pointer' }} color="mainPurple.1" />
                    )}
                </Menu.Target>
                <Menu.Dropdown>
                    <Box pb="xs" ta="right"></Box>
                    <Menu.Label pb="sm">
                        {/* Show Skeleton while loading */}
                        {showLoadingState ? (
                            <Skeleton height={16} width="70%" />
                        ) : (
                            <Title order={2} fw={450} size="16px" c="black">
                                {displayName || 'User'} {/* Fallback if name somehow empty */}
                            </Title>
                        )}
                    </Menu.Label>
                    <Menu.Divider pb="xs" w="90%" m="0 auto"/>
                    <Menu.Item pb="xs" pl="lg" leftSection={<IconLayoutDashboardFilled color="#6A4CF2" size={21} style={{marginBottom: "2px"}}/>}
                               onClick={() => navigate("/my-projects")}>My Projects</Menu.Item>
                    <Menu.Item pb="xs" pl="lg" leftSection={<IconInbox color="#37c5e7" size={21} style={{marginBottom: "2px"}}/>}
                               onClick={() => navigate("/my-applications")}>My Applications</Menu.Item>

                    <Menu.Item pb="xs" pl="lg" leftSection={<IconUser size={22} style={{marginBottom: "2px"}}/>}
                               onClick={() => navigate("/profile")}>My Profile</Menu.Item>
                    <Menu.Divider pb="xs"  w="90%" m="0 auto"/>
                    <Menu.Item  pb="xs" pl="lg" onClick={logout} leftSection={<IconLogout color="#f10e34" size={22} style={{marginBottom: "2px", marginLeft: "3px"}}/>}>Logout</Menu.Item>
                    <Menu.Item fw={400} pb="xs" pl="lg" leftSection={<IconSettings size={22} style={{marginBottom: "2px", marginLeft: "1px"}}/>}>Settings</Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
}