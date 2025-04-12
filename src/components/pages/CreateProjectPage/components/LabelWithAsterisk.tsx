import { Group, Text, Title } from '@mantine/core';
import styles from '../CreateProjectPage.module.css'; // Adjust path relative to this file

interface LabelWithAsteriskProps {
    children: React.ReactNode;
}

/**
 * Renders a Title component followed by a styled asterisk.
 * Used for required field labels.
 */
export function LabelWithAsterisk({ children }: LabelWithAsteriskProps) {
    return (
        <Group gap={2} wrap="nowrap" mb="10px">
            <Title order={3} size="15px" fw={400}>
                {children}
            </Title>
            {/* Custom styled asterisk */}
            <Text component="span" className={styles.textInputAsterisk} style={{ position: 'relative', top: '-2px', marginLeft: '2px' }}>*</Text>
        </Group>
    );
}