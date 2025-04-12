import "@mantine/core/styles.css";
import { AppShell, MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import { useHeadroom } from "@mantine/hooks";
import { NavBar } from "@components/layout/NavBar/NavBar.tsx";
import { AppRouter } from "./routes";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import {ShellFooter} from "@components/layout/ShellFooter/ShellFooter.tsx";
import './global.css';

const AppContent = () => {
    const pinned = useHeadroom({ fixedAt: 120 });
    const location = useLocation();

    const routesWithoutNavbar = ['/login',];
    const shouldShowNavbar = !routesWithoutNavbar.includes(location.pathname);
    const routesWithoutFooter = ['/login',];
    const shouldShowFooter = !routesWithoutFooter.includes(location.pathname);

    return (
        <AppShell
            header={{
                height: 72,
                collapsed: !pinned,
                offset: false
            }}
            padding="md"
            navbar={shouldShowNavbar ? {
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: false, desktop: false }
            } : {
                width: 0,
                breakpoint: 'sm',
                collapsed: { mobile: true, desktop: true }
            }}
            footer={shouldShowFooter ? {height: 60 } : {height: 0}}
        >
            {shouldShowNavbar && <NavBar />}
            <AppShell.Main px="13%" pt={`calc(60px + var(--mantine-spacing-xs))`} pb="0">
                <AppRouter />
            </AppShell.Main>
            <ShellFooter/>
        </AppShell>
    );
};

export default function App() {
    return (
        <MantineProvider theme={theme}>
            <AuthProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </AuthProvider>
        </MantineProvider>
    );
}