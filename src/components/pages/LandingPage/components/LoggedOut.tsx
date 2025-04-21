import {Box, Button, Divider, Flex, Group, Image, Stack, Text, Title} from '@mantine/core';
import ProjectListContainer from "@components/shared/ProjectList/ProjectList.tsx";
import RoundedButton from "@components/shared/RoundedButton/RoundedButton.tsx";
import {useNavigate} from "react-router-dom";


export function LoggedOut() {
    const navigate = useNavigate();

    return (
        <Stack gap={0}>
            {/* Top Section  */}
                <Box pt="50px" pb="150px">
                    <Group justify="center" align="top" gap="100px">
                        <Stack align="flex-start" gap="lg">
                            <Title order={1} ta="left" size="48px" fw={400} lh={1.2}>
                                Turn your ideas <br/>into reality. <br/>
                                <Text span c="mainBlue.6" inherit>Build. Collaborate. <br/>Launch.</Text>
                            </Title>
                            <Text size="lg" ta="left" lh={1.4}>
                                Post your project ideas and find the <br/> best‑fit team members.
                            </Text>
                            <Group>
                                <Button variant="filled" color="mainBlue.6" radius="lg" size="lg"
                                        onClick={() => navigate("/SignUp")}>Create Project</Button>
                                <Button variant="filled" color="mainBlue.6" radius="lg" size="lg"
                                        onClick={() => navigate("/Discover")}>Find a Project</Button>
                            </Group>
                        </Stack>
                        <Image src="/landing_image.png" h={450} w="auto"/>
                    </Group>
                </Box>

                <Box
                    w="70%"
                    mx="auto"
                    my="80px"
                    style={{
                        borderRadius: '1rem',
                        overflow: 'hidden',
                    }}
                >
                    <Flex direction="row" h="650px">
                        {/* Left section with placeholder image */}
                        <Box
                            w="50%"
                            pos="relative"
                            p={0}
                        >
                            <img
                                src="/placeholderImageVertical.svg"
                                alt="Placeholder"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </Box>

                        {/* Right section with content */}
                        <Box
                            w="50%"
                            bg="mainOrange.6"
                            p="xl"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Box ta="center" w="80%" mx="auto">
                                <Title order={2} mb="0" fw="400" size="29px" ta="left">
                                    Make Your Ideas Real <br/> with Skilled Teammates
                                </Title>

                                <Divider color="black" mt="0" mb="lg" size="sm" w="59%"/>

                                <Text mb="xl" ta="left">
                                    Lorem ipsum dolor sit a, consectetur adipiscing elit. Suspendisse varius enim in
                                    eros elementum tristique.
                                </Text>


                            </Box>
                            <Box ml="10%">
                                <RoundedButton w="50%" color="mainRed.6" variant="filled" fw="500">Sign
                                    Up</RoundedButton>
                                <Text c="mainRed.6" fw="700" ml="1%" size="xs" mt="md" style={{textAlign: 'left'}}>
                                    By clicking Sign Up you<span style={{fontFamily: 'calibri'}}>'</span>re confirming
                                    that you agree with our&nbsp;
                                    <Text c="black" component="a" href="/terms" size="xs" td="underline">Terms and
                                        Conditions</Text>
                                </Text>

                            </Box>

                            <Box>

                            </Box>
                        </Box>
                    </Flex>
                </Box>

            {/* New Projects Section */}
            <Box mb="50px" mt="md">
                <Title order={2} ta="center" mt="xl" mb="50px" size="36px" fw={400}>
                    New Projects on The Board
                </Title>
                <ProjectListContainer/>
            </Box>
        </Stack>
    );
}

export default LoggedOut;
