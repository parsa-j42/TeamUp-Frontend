import { Avatar, Box, Menu, Title } from "@mantine/core";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@contexts/AuthContext";
import {
    IconLayoutDashboardFilled,
    IconLogout,
    IconSettings,
    IconUser
} from "@tabler/icons-react";
import styles from '../NavBar.module.css';

interface ProfileMenuProps {
    userName?: string;
    avatarSrc?: string;
}

export function ProfileMenu({ userName = "Jason Hong", avatarSrc = "/avatar.svg" }: ProfileMenuProps) {
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <Menu
            position="bottom"
            withinPortal
            width={250}
            radius="md"
            trigger="click-hover"
            classNames={{
                dropdown: styles.menuDropdown
            }}
        >
            <Menu.Target>
                <Avatar
                    src={avatarSrc}
                    alt="Profile Avatar"
                    size={42}
                    className={styles.avatar}
                />
            </Menu.Target>

            <Menu.Dropdown>
                <Box pb="xs" ta="right"></Box>
                <Menu.Label pb="sm">
                    <Title order={2} fw={450} size="16px" c="black">
                        {userName}
                    </Title>
                </Menu.Label>

                <Menu.Divider pb="xs" className={styles.menuDivider} />

                <Menu.Item
                    pb="xs"
                    pl="lg"
                    leftSection={
                        <IconLayoutDashboardFilled
                            color="#6A4CF2"
                            size={21}
                            className={styles.menuIcon}
                        />
                    }
                    onClick={() => navigate("/dashboard")}
                >
                    Dashboard
                </Menu.Item>

                <Menu.Item
                    pb="xs"
                    pl="lg"
                    leftSection={
                        <IconUser
                            size={22}
                            className={styles.menuIcon}
                        />
                    }
                    onClick={() => navigate("/profile")}
                >
                    My Profile
                </Menu.Item>

                <Menu.Divider pb="xs" className={styles.menuDivider} />

                <Menu.Item
                    pb="xs"
                    pl="lg"
                    onClick={() => logout()}
                    leftSection={
                        <IconLogout
                            color="#f10e34"
                            size={22}
                            className={styles.logoutIcon}
                        />
                    }
                >
                    Logout
                </Menu.Item>

                <Menu.Item
                    fw={400}
                    pb="xs"
                    pl="lg"
                    leftSection={
                        <IconSettings
                            size={22}
                            className={styles.settingsIcon}
                        />
                    }
                >
                    Settings
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}