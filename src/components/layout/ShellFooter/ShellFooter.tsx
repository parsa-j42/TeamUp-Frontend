import { AppShell, Group, Text, Stack, Flex, Divider } from "@mantine/core";
import { IconBrandFacebook, IconBrandInstagram, IconBrandX, IconBrandLinkedin, IconBrandYoutube } from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";

export function ShellFooter() {
    const navigate = useNavigate();

    return (
        <AppShell.Footer
            bg="black"
            c="white"
            py="xl"
            px="var(--page-gutter)"
            styles={{
                // Footer flows with the page instead of sticking; height follows its content.
                footer: { position: 'static', height: 'auto' },
            }}
        >
            <Stack gap="md">
                {/* Top row: logo + link columns. Stacks vertically on small screens. */}
                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    justify="space-between"
                    align={{ base: 'flex-start', sm: 'center' }}
                    gap="xl"
                    ta="left"
                >
                    <img src="/TeamUpMonochrome.svg" alt="TeamUp" height={74} />

                    <Group gap={50} align="flex-start" wrap="wrap">
                        <Stack gap={5}>
                            <Text fw={700} mb="xs">ABOUT</Text>
                            <Text component="a" href="#" c="gray.5" fz="sm" style={{ cursor: 'pointer', textDecoration: 'none' }}
                                  onClick={() => navigate('/aboutus')}
                            >What<span style={{fontFamily: 'Calibri'}}>'</span>s TeamUp?</Text>
                            <Text component="a" href="#" c="gray.5" fz="sm" style={{ cursor: 'pointer', textDecoration: 'none' }}
                                  onClick={() => navigate('/privacy')}
                            >Privacy <span style={{fontFamily: 'Calibri'}}>&</span> Terms</Text>
                        </Stack>

                        <Stack gap={5}>
                            <Text fw={700} mb="xs">CONTACT</Text>
                            <Text component="a" href="#" c="gray.5" fz="sm" style={{ textDecoration: 'none' }}>Help Center</Text>
                            <Text component="a" href="#" c="gray.5" fz="sm" style={{ textDecoration: 'none' }}>Email<span style={{fontFamily: 'Calibri'}}>@</span>gmail.com</Text>
                        </Stack>
                    </Group>
                </Flex>

                <Divider my="md" color="white" size="xs" />

                {/* Bottom row: copyright + socials. Stacks on small screens. */}
                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    justify="space-between"
                    align={{ base: 'flex-start', sm: 'center' }}
                    gap="sm"
                >
                    <Text c="gray.5" fz="xs">TeamUp © 2025</Text>

                    <Group gap={15}>
                        <IconBrandFacebook size={25} style={{ color: 'white' }} />
                        <IconBrandInstagram size={25} style={{ color: 'white' }} />
                        <IconBrandX size={25} style={{ color: 'white' }} />
                        <IconBrandLinkedin size={25} style={{ color: 'white' }} />
                        <IconBrandYoutube size={25} style={{ color: 'white' }} />
                    </Group>
                </Flex>
            </Stack>
        </AppShell.Footer>
    );
}
