import {
    Box,
    Container,
    Stack,
    Text,
    Title,
    useMantineTheme,
    Anchor, // Import Anchor for the email link
} from '@mantine/core';
import React from 'react';

// Reusing the wave logic from AboutUsPage

// Wave path from the previous example (ProfilePage)
const BOTTOM_WAVE_PATH = "M 0,6 Q 15,8 40,7 C 60,5 80,5 130,7 L 100,0 L 0,0 Z";

// Component for the bottom wave effect
function BottomWave() {
    const theme = useMantineTheme();
    // Assuming bgPurple exists in the theme as requested
    const waveColor = theme.colors.bgPurple ? theme.colors.bgPurple[6] : theme.colors.violet[1]; // Fallback color
    const waveHeight = 150; // Adjust height as needed

    return (
        <Box style={{ height: waveHeight, overflow: 'hidden', marginTop: '-1px' /* Prevent potential gap */ }}>
            <svg
                viewBox="0 0 100 10" // ViewBox needs to roughly match the coordinate system of the path
                preserveAspectRatio="none"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block', // Ensure SVG behaves like a block element
                    transform: 'scaleY(-1)', // Flip vertically so the curve goes upwards from the bottom
                }}
            >
                <path d={BOTTOM_WAVE_PATH} fill={waveColor} />
            </svg>
        </Box>
    );
}

// Main Privacy and Terms Page Component
export default function PrivacyAndTermsPage() {
    const theme = useMantineTheme();
    // Assuming bgPurple exists in the theme as requested
    const waveColor = theme.colors.bgPurple ? theme.colors.bgPurple[6] : theme.colors.violet[1]; // Fallback color
    const topWaveHeight = 500; // Adjust height for the top curve

    // Helper component for rendering policy/term items
    const PolicyItem = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
        <Stack gap="xs">
            <Text fw={500} component="span" size="md"> {/* Bolder weight for titles */}
                {number}. {title}
            </Text>
            <Text size="sm" lh={1.6}> {/* Standard text size for paragraphs */}
                {children}
            </Text>
        </Stack>
    );

    return (
        // Main container Box:
        // - Uses flex column layout.
        // - minHeight ensures it tries to fill vertical space.
        // - overflow: hidden prevents scrollbars.
        // - position: relative for the absolutely positioned top wave.
        <Box style={{
            backgroundColor: theme.white,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%', // Fill AppShell.Main height
        }}>
            {/* Top Wave Element - Absolutely positioned */}
            <Box
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: topWaveHeight,
                    overflow: 'hidden',
                    zIndex: 0, // Behind content
                }}
            >
                {/* Inner Box creates the actual curve shape */}
                <Box
                    style={{
                        width: '150%', // Wider than viewport
                        height: '100%',
                        position: 'absolute',
                        left: '-25%', // Center the wide box
                        bottom: 0,
                        backgroundColor: waveColor,
                        borderTopLeftRadius: '50%', // Creates the curve
                        borderTopRightRadius: '50%',
                        transform: 'scaleY(-1)', // Flips curve downwards
                    }}
                />
            </Box>

            {/* Content Area Container */}
            {/* - flexGrow: 1 makes this container take up available vertical space. */}
            {/* - Using 'lg' size for better readability of text. */}
            <Container size="lg" py={100} style={{ position: 'relative', zIndex: 1, flexGrow: 1 }}>
                {/* Main stack for content sections */}
                <Stack gap={50}> {/* Increased gap between main sections */}
                    {/* Page Title */}
                    <Title order={1} ta="center" fw={500} fz={36}>Privacy and Terms</Title>

                    {/* Effective Date */}
                    <Text size="sm" fw={500} mt={-30}> {/* Adjusted margin */}
                        Effective Date: [Insert Date]
                    </Text>

                    {/* Privacy Policy Section */}
                    <Stack gap="lg">
                        {/* No separate title needed as per screenshot */}
                        <PolicyItem number={1} title="Information We Collect">
                            We collect personal information such as your name, email, and professional details provided during sign-up. Additionally, we gather usage data, which includes information on how users interact with the platform, such as visited pages and activity logs.
                        </PolicyItem>
                        <PolicyItem number={2} title="How We Use Your Information">
                            We use your information to provide and improve our services, communicate updates, notifications, and support, and to ensure security and prevent fraudulent activities.
                        </PolicyItem>
                        <PolicyItem number={3} title="Data Sharing and Protection">
                            We do not sell or share personal data with third parties for marketing purposes. However, information may be shared with service providers who assist in platform functionality, under strict confidentiality agreements.
                        </PolicyItem>
                        <PolicyItem number={4} title="User Rights">
                            Users have the right to access and correct their personal information through their account settings. Additionally, users can request account deletion by contacting support.
                        </PolicyItem>
                        <PolicyItem number={5} title="Cookies & Tracking">
                            We use cookies to enhance user experience and analyze platform performance. Users can manage cookie preferences through their browser settings.
                        </PolicyItem>
                    </Stack>

                    {/* Terms of Service Section */}
                    <Stack gap="lg">
                        <Title order={3} fw={500} mt="md">Terms of Service</Title> {/* Added title for this section */}
                        <PolicyItem number={1} title="Acceptance of Terms">
                            By using TeamUp, users agree to comply with these terms and policies.
                        </PolicyItem>
                        <PolicyItem number={2} title="User Responsibilities">
                            Users are responsible for maintaining account security and confidentiality, using the platform in compliance with applicable laws, and ensuring that shared content does not infringe on third-party rights.
                        </PolicyItem>
                        <PolicyItem number={3} title="Prohibited Activities">
                            Prohibited activities include <Text component="span" fw={700}>unauthorized access to other accounts or data, and uploading harmful software or engaging in malicious activities.</Text>
                        </PolicyItem>
                        <PolicyItem number={4} title="Account Suspension & Termination">
                            Violation of these terms may result in account suspension or termination.
                        </PolicyItem>
                        <PolicyItem number={5} title="Limitation of Liability">
                            TeamUp provides services "as is" without warranties. We are not liable for any issues arising from the use of the platform.
                        </PolicyItem>
                        <PolicyItem number={6} title="Governing Law">
                            These terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.
                        </PolicyItem>
                        <PolicyItem number={7} title="Contact Information">
                            For any privacy or legal concerns, please contact us at <Anchor href="mailto:support@teamup.com" target="_blank" size="sm">support@teamup.com</Anchor>.
                        </PolicyItem>
                    </Stack>
                </Stack>
            </Container>

            {/* Bottom Wave Component - Placed after the content container */}
            <Box style={{ zIndex: 0, marginTop: 'auto' }}>
                <BottomWave />
            </Box>
        </Box>
    );
}