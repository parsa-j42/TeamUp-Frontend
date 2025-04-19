import React from 'react'; // Added React import
import { Box, Chip, Group, Title, Text } from '@mantine/core'; // Added Text
import { LabelWithAsterisk } from './LabelWithAsterisk';
import styles from '../CreateProjectPage.module.css';
import type { FormOption } from '../formConstants.ts';

interface ChipGroupFieldProps {
    label?: string;
    options: FormOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    required?: boolean;
    multiple?: boolean;
    labelComponent?: React.ReactNode;
    error?: string | null; // Add error prop
}

export function ChipGroupField({
                                   label, options, value, onChange, required = false,
                                   multiple = false, labelComponent, error // Destructure error
                               }: ChipGroupFieldProps) {

    const LabelComponent = labelComponent ? ( <>{labelComponent}</> )
        : required && label ? ( <LabelWithAsterisk>{label}</LabelWithAsterisk> )
            : label ? ( <Title order={3} size="15px" fw={400} mb="10px">{label}</Title> )
                : null;

    return (
        // Use Chip.Group for single selection logic if multiple is false
        <Chip.Group multiple={multiple} value={value} onChange={onChange}>
            <Box>
                {LabelComponent}
                <Group gap="xs" mt={LabelComponent ? 0 : 'xs'}> {/* Adjust margin if no label */}
                    {options.map((option) => (
                        <Chip
                            size="lg" key={option.value} value={option.value}
                            variant="outline" color="black" radius="md"
                            classNames={{ root: styles.chipRoot, label: styles.chipLabel, checkIcon: styles.chipCheckIcon, iconWrapper: styles.chipIconWrapper }}
                        >
                            {option.label}
                        </Chip>
                    ))}
                </Group>
                {/* Display error message */}
                {error && <Text c="red" size="xs" mt="xs">{error}</Text>}
            </Box>
        </Chip.Group>
    );
}