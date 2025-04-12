import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Container, Title, Text, Paper } from '@mantine/core';
import { useAuth } from '../../../../contexts/AuthContext';

interface LocationState {
    from?: {
        pathname: string;
    };
}

const LoginInPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    // Get the page they were trying to access
    const from = state?.from?.pathname || '/dashboard';

    const handleLogin = () => {
        login();
        // After login, redirect them to the page they tried to visit
        navigate(from, { replace: true });
    };

    return (
        <Container size="xs" py="xl">
            <Paper radius="md" p="xl" withBorder>
                <Title order={2} mb="md">Sign In</Title>
                <Text mb="md">Please sign in to access the application.</Text>
                <Button onClick={handleLogin}>
                    Sign In
                </Button>
            </Paper>
        </Container>
    );
};

export default LoginInPage;