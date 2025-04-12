import {AppShell, Group, Text, Stack, Container, Divider} from "@mantine/core";
import { IconBrandFacebook, IconBrandInstagram, IconBrandX, IconBrandLinkedin, IconBrandYoutube } from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";

export function ShellFooter() {
    const navigate = useNavigate();

    return (
        <AppShell.Footer bg="black" c="white" p="md" h={200} styles={{
            footer: {
                position: 'static',
            }
        }}>
            <Container size="77%">
                <Group justify="space-between" align="center" ta="left">
                    {/* Left section - Logo and copyright */}
                    <img src="/TeamUpMonochrome.svg" alt="TeamUp" height={74} />

                    {/* Middle section - About and Contact links */}
                    {/*<Group gap={50}>*/}
                        <Stack gap={5}>
                            <Text fw={700} mb="xs">ABOUT</Text>
                            <Text component="a" href="#" c="gray.5" fz="sm" style={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                  onClick={() => navigate('/aboutus')}
                            >What<span style={{fontFamily: 'Calibri'}}>'</span>s TeamUp?</Text>
                            <Text component="a" href="#" c="gray.5" fz="sm" style={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                  onClick={() => navigate('/privacy')}
                            >Privacy <span style={{fontFamily: 'Calibri'}}>&</span> Terms</Text>
                        </Stack>

                        <Stack gap={5}>
                            <Text fw={700} mb="xs">CONTACT</Text>
                            <Text component="a" href="#" c="gray.5" fz="sm" style={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Help Center</Text>
                            <Text component="a" href="#" c="gray.5" fz="sm" style={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Email<span style={{fontFamily: 'Calibri'}}>@</span>gmail.com</Text>
                        </Stack>

                </Group>

                <Divider my="md" color="white" size="xs" />

                {/* Social media icons */}
                <Group justify="space-between">
                <Text c="gray.5" fz="xs">TeamUp © 2025</Text>

                <Group justify="flex-end" gap={15}>
                    <IconBrandFacebook size={25} style={{ color: 'white' }} />
                    <IconBrandInstagram size={25} style={{ color: 'white' }} />
                    <IconBrandX size={25} style={{ color: 'white' }} />
                    <IconBrandLinkedin size={25} style={{ color: 'white' }} />
                    <IconBrandYoutube size={25} style={{ color: 'white' }} />
                </Group>
                </Group>
            </Container>
        </AppShell.Footer>
    );
}