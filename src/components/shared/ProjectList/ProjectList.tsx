import { MantineProvider, Paper, Title, Text, Badge, Group, Flex, Stack, Divider, rem } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import '@mantine/core/styles.css';

function ProjectListItem() {
    return (
        <Stack gap="xs" p="md">
            <Flex
                mih={20} // Minimum height
                gap="md" // Gap between items
                justify="space-between" // Pushes items to start and end
                align="center" // Vertically aligns items in the center
                direction="row"
                wrap="wrap"
            >
                <Group gap="xs">
                    <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    <Text size="sm" c="dimmed">March 15th</Text>
                <Badge color="mainRed.6" variant="filled" size="md" ml="sm" fw="500">
                    Looking for Mentor
                </Badge>
                </Group>

                {/* This empty group helps push the 'Open' badge to the far right when using space-between */}
                {/* Alternatively, you could use Flex and Spacer, but this works too */}
                {/* Update: Flex justify="space-between" directly handles this */}
                <Badge color="mainGreen.9" variant="light" size="lg" fw={500}>
                    Open
                </Badge>
            </Flex>

            <Title order={4} size="24px" fw="400" mt="xs">Project title heading</Title>

            <Text size="16px" c="dimmed" mt={4}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
            </Text>

            <Text size="sm" fw={500} mt="sm">
                2 members
            </Text>
        </Stack>
    );
}


function ProjectListContainer() {
    return (
        // Wrap your application or component tree with MantineProvider
        // You might already have this at the root of your app
        <MantineProvider>
            <Paper shadow="xxl" radius="md" p="lg"  mx="auto" withBorder
            >
                <Stack gap="lg"> {/* Controls spacing between list items */}
                    <ProjectListItem />
                    <Divider my="0" color="black" size="md" />
                    <ProjectListItem />
                    <Divider my="0" color="black" size="md" />
                    <ProjectListItem />
                    <Divider my="0" color="black" size="md" />
                </Stack>
            </Paper>
        </MantineProvider>
    );
}

export default ProjectListContainer;

// If you are rendering this directly in your main app file (e.g., App.js)
// you might render it like this:
// import React from 'react';
// import ProjectListContainer from './ProjectListContainer'; // Adjust path if needed
//
// function App() {
//   return (
//     <div style={{ padding: '20px' }}> {/* Optional padding for visibility */}
//       <ProjectListContainer />
//     </div>
//   );
// }
//
// export default App;