import {AppShell, Group, Image, TextInput, rem} from "@mantine/core";
import {LoggedIn} from "@components/layout/NavBar/LoggedIn.tsx";
import {LoggedOut} from "@components/layout/NavBar/LoggedOut.tsx";
import {IconSearch} from "@tabler/icons-react";
import {useAuth} from "@contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";

export function NavBar() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/landing');
    };

    return (
        <AppShell.Header>
            <Group h="100%" px="13%" justify="space-between" wrap="nowrap">
                <Image fit="contain" h={60}
                       src="/TeamUpLogo.png" alt="TeamUp Logo"
                       style={{ cursor: 'pointer' }}
                       onClick={handleLogoClick}/>
                <Group h="100%" p="0" justify="space-between" gap="xs" wrap="nowrap" pl="60px" flex="1">
                    <TextInput
                        placeholder="Search..."
                        w="35%"
                        radius="md"
                        rightSection={
                            <IconSearch
                                style={{ width: rem(19), height: rem(19) }}
                                stroke={3}
                            />
                        }
                        styles={(theme) => ({
                            input: {
                                borderColor: theme.colors.mainPurple[6],
                                borderWidth: 2,
                            },
                            section: {
                                backgroundColor: theme.colors.mainPurple[6],
                                color: "white",
                            },
                        })}
                    />
                    {isAuthenticated ? <LoggedIn /> : <LoggedOut />}
                </Group>
            </Group>
        </AppShell.Header>
    );
}