import { useState } from 'react';
import { Badge, ActionIcon, Group, Box } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useAuth } from '@contexts/AuthContext';

const DISMISSED_KEY = 'demoBannerDismissed';

export function DemoBanner() {
    const { userDetails } = useAuth();
    const [dismissed, setDismissed] = useState(
        () => sessionStorage.getItem(DISMISSED_KEY) === 'true'
    );

    const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
    const isDemo = demoEmail && userDetails?.email === demoEmail;

    if (!isDemo || dismissed) return null;

    const handleDismiss = () => {
        sessionStorage.setItem(DISMISSED_KEY, 'true');
        setDismissed(true);
    };

    return (
        <Box style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
            <Group gap={6} p="xs" bg="blue.1" style={{ borderRadius: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                <Badge color="blue" variant="filled" radius="xl" size="md">
                    Demo mode
                </Badge>
                <ActionIcon variant="subtle" color="blue" size="sm" onClick={handleDismiss} aria-label="Dismiss">
                    <IconX size={12} />
                </ActionIcon>
            </Group>
        </Box>
    );
}
