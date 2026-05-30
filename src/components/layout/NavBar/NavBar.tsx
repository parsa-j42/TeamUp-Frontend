import { useEffect } from 'react';
import { AppShell, Group, Image, Burger, Drawer, Stack } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { LoggedIn } from "@components/layout/NavBar/LoggedIn.tsx";
import { LoggedOut } from "@components/layout/NavBar/LoggedOut.tsx";
import { ProjectSearchInput } from "@components/layout/NavBar/ProjectSearchInput.tsx";
import { useAuth } from "@contexts/AuthContext.tsx";
import { useNavigate } from "react-router-dom";

export function NavBar() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [drawerOpened, { open, close }] = useDisclosure(false);

    // The burger only exists below "sm"; close the drawer if the viewport grows past it.
    const isDesktop = useMediaQuery('(min-width: 48em)');
    useEffect(() => {
        if (isDesktop && drawerOpened) close();
    }, [isDesktop, drawerOpened, close]);

    const handleLogoClick = () => navigate('/');

    return (
        <AppShell.Header>
            <Group h="100%" px="var(--page-gutter)" justify="space-between" wrap="nowrap">
                <Image fit="contain" h={57}
                       src="/TeamUpLogo.svg" alt="TeamUp Logo"
                       style={{ cursor: 'pointer' }}
                       onClick={handleLogoClick}/>

                {/* Desktop: search and nav links sit inline in the bar */}
                <Group h="100%" justify="space-between" gap="xs" wrap="nowrap" pl="60px" flex="1" visibleFrom="sm">
                    <ProjectSearchInput w="35%" />
                    {isAuthenticated ? <LoggedIn /> : <LoggedOut />}
                </Group>

                {/* Mobile: collapse everything behind a burger */}
                <Burger opened={drawerOpened} onClick={open} hiddenFrom="sm" aria-label="Open navigation" />
            </Group>

            <Drawer
                opened={drawerOpened}
                onClose={close}
                position="right"
                size="xs"
                padding="lg"
                title={<Image h={36} fit="contain" src="/TeamUpLogo.svg" alt="TeamUp Logo" />}
            >
                <Stack gap="lg">
                    <ProjectSearchInput w="100%" onSearch={close} />
                    {isAuthenticated
                        ? <LoggedIn orientation="vertical" onNavigate={close} />
                        : <LoggedOut orientation="vertical" onNavigate={close} />}
                </Stack>
            </Drawer>
        </AppShell.Header>
    );
}
