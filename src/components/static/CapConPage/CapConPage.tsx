import React from 'react';
import { Box, Text, Button } from '@mantine/core';
import classes from './CapConPage.module.css';
import { IconBrandLinkedinFilled, IconBrandFigma, IconWorld } from '@tabler/icons-react';

// Wave decoration for header
const HeaderWave = () => (
    <svg className={classes.headerWave} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,0 C240,95 480,100 720,85 C960,70 1200,50 1440,90 L1440,100 L0,100 Z" fill="white" />
    </svg>
);

// Team member data
const teamMembers = [
    {
        name: 'Shubo Zhang',
        title: 'Graphic Designer',
        linkedin: 'https://www.linkedin.com/in/shubo-zhang-691658248',
        initial: 'S'
    },
    {
        name: 'Yunna Jeon',
        title: 'UX/UI Designer',
        linkedin: 'https://www.linkedin.com/in/yunna-jeon-a66b9428b',
        initial: 'Y'
    },
    {
        name: 'Danika Lieu',
        title: 'Interactive Designer',
        linkedin: 'https://www.linkedin.com/in/danika-lieu-00b717293/',
        initial: 'D'
    },
    {
        name: 'Yeonseo Hong',
        title: 'User Experience/Interface Designer',
        linkedin: 'https://www.linkedin.com/in/yeonseo-dyanne-hong-ab5527347/',
        initial: 'Y'
    },
    {
        name: 'Parsa Jafari',
        title: 'Software Developer',
        linkedin: 'https://www.linkedin.com/in/parsa-j42/',
        initial: 'P'
    },
];

const CapConPage: React.FC = () => {
    return (
        <Box className={classes.pageWrapper}>
            <Box className={classes.container}>
                {/* Header Section */}
                <Box className={classes.header}>
                    {/* Decorative elements */}
                    <Box className={`${classes.dots} ${classes.dotsTop}`} />
                    <Box className={`${classes.dots} ${classes.dotsBottom}`} />

                    <Text component="h1" className={classes.title}>
                        Meet Our Team
                    </Text>
                    <Text className={classes.subtitle}>
                        We're a group of passionate designers and developers showcasing our work at SAIT Capstone Conference 2025.
                    </Text>
                    <Text component="span" className={classes.projectBadge}>
                        Team Up
                    </Text>

                    {/* Website and Figma links */}
                    <Box className={classes.headerButtonsContainer}>
                        <Button
                            component="a"
                            href="https://www.figma.com/proto/BNzSnL2hmirBBRYGv35Tsp/Capstone-Wireframe?node-id=0-1&t=v2j67LxFVFVBDRNc-1"
                            target="_blank"
                            rel="noopener noreferrer"
                            py="1px"
                            className={classes.headerButton}
                            leftSection={<IconBrandFigma size={18} />}
                        >
                            Figma Prototype - Mobile
                        </Button>


                        <Button
                            component="a"
                            href="https://TeamUpSAIT.tech/landing"
                            target="_blank"
                            rel="noopener noreferrer"
                            py="1px"
                            className={classes.headerButton}
                            leftSection={<IconWorld size={18} />}
                        >
                            Our Website - Desktop
                        </Button>
                    </Box>

                    <HeaderWave />
                </Box>

                {/* Team Section */}
                <Box className={classes.teamSection}>
                    <Text component="h2" className={classes.teamHeading}>
                        The Creators
                    </Text>

                    <Box className={classes.teamGrid}>
                        {teamMembers.map((member, index) => (
                            <Box key={index} className={classes.memberCard}>
                                <Box className={classes.profileCircle}>
                                    {member.initial}
                                </Box>

                                <Text className={classes.memberName}>{member.name}</Text>
                                <Text className={classes.memberTitle}>{member.title}</Text>

                                <Button
                                    component="a"
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes.linkedinBtn}
                                    leftSection={<IconBrandLinkedinFilled size={18} />}
                                    w="80%"
                                    mx="auto"
                                >
                                    Connect
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Footer */}
                <Box className={classes.footer}>
                    <Text>
                        <span className={classes.footerHighlight}>SAIT Capstone Conference {new Date().getFullYear()}</span> • Thank you for visiting our project showcase
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};

export default CapConPage;