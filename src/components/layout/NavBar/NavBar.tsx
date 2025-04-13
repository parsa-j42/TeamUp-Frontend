import { Button, Group } from "@mantine/core";
import { useNavigate } from 'react-router-dom';
import { ProfileMenu } from "./ProfileMenu";
import styles from './NavBar.module.css';

interface NavBarProps {
    userName?: string;
    avatarSrc?: string;
}

export function NavBar({ userName, avatarSrc }: NavBarProps) {
    const navigate = useNavigate();

    return (
        <Group h="100%" p="0" justify="flex-end" gap="xl" wrap="nowrap" className={styles.navContainer}>
            <Button
                variant="white"
                color="black"
                fw={400}
                size="md"
                className={styles.navButton}
                onClick={() => navigate("#")}
            >
                Discover
            </Button>

            <Button
                variant="white"
                color="black"
                fw={400}
                size="md"
                className={styles.navButton}
                onClick={() => navigate("/Dashboard")}
            >
                Dashboard
            </Button>

            <Button
                variant="white"
                color="black"
                fw={400}
                size="md"
                className={styles.navButton}
                onClick={() => navigate("#")}
            >
                Messages
            </Button>

            <ProfileMenu userName={userName} avatarSrc={avatarSrc} />
        </Group>
    );
}