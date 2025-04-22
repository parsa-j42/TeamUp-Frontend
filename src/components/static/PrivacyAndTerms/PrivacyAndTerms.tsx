import {
    Box,
    Container,
    Stack,
    Text,
    Title,
    Anchor,
} from '@mantine/core';
import React from 'react';

// Gradient Background Component
function GradientBackground({ gradient, children }: { gradient: string; children?: React.ReactNode }) {
  return (
    <Box
      style={{
        background: gradient,
        position: 'relative',
        minHeight: '100%',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

// Main Privacy and Terms Page Component
export default function PrivacyAndTermsPage() {
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
        <GradientBackground gradient="linear-gradient(0deg, rgba(55, 197, 231, 0.3) 0%,
                rgba(55, 197, 231, 0.3) 70%, rgba(255, 255, 255, 1) 100%)">
            {/* Content Area Container */}
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
        </GradientBackground>
    );
}
