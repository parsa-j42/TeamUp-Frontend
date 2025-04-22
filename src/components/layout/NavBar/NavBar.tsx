import { useState } from 'react';
import { AppShell, Group, Image, TextInput, rem } from "@mantine/core";
import { LoggedIn } from "@components/layout/NavBar/LoggedIn.tsx";
import { LoggedOut } from "@components/layout/NavBar/LoggedOut.tsx";
import { IconSearch } from "@tabler/icons-react";
import { useAuth } from "@contexts/AuthContext.tsx";
import { useNavigate } from "react-router-dom";

export function NavBar() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');

    const handleLogoClick = () => {
        navigate('/landing');
    };

    // Handle search initiation (e.g., on Enter key press)
    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && searchValue.trim()) {
            navigate(`/discover?search=${encodeURIComponent(searchValue.trim())}`);
        }
    };

    // Handle search initiation via icon click (optional)
    const handleSearchIconClick = () => {
        if (searchValue.trim()) {
            navigate(`/discover?search=${encodeURIComponent(searchValue.trim())}`);
        }
    };

    return (
        <AppShell.Header>
            <Group h="100%" px="13%" justify="space-between" wrap="nowrap">
                <Image fit="contain" h={57}
                       src="/TeamUpLogo.svg" alt="TeamUp Logo"
                       style={{ cursor: 'pointer' }}
                       onClick={handleLogoClick}/>
                <Group h="100%" p="0" justify="space-between" gap="xs" wrap="nowrap" pl="60px" flex="1">
                    <TextInput
                        placeholder="Search Projects..." // Updated placeholder
                        w="35%"
                        radius="md"
                        value={searchValue} // Controlled input
                        onChange={(event) => setSearchValue(event.currentTarget.value)} // Update state
                        onKeyDown={handleSearchKeyDown}
                        rightSection={
                            <IconSearch
                                style={{ width: rem(19), height: rem(19), cursor: 'pointer', color: 'var(--mantine-color-mainBlue-6)' }}
                                stroke={3}
                                onClick={handleSearchIconClick}
                            />
                        }
                        styles={(theme) => ({
                            input: {
                                borderColor: theme.colors.mainBlue[6],
                                borderWidth: 2,
                            },
                            section: {
                                // backgroundColor: "white",
                                // color: "white",
                                cursor: 'pointer', // Indicate clickable section
                            },
                        })}
                    />
                    {isAuthenticated ? <LoggedIn /> : <LoggedOut />}
                </Group>
            </Group>
        </AppShell.Header>
    );
}