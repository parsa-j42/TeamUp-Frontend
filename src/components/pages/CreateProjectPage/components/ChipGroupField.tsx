import { Box, Chip, Group, Title } from '@mantine/core';
import { LabelWithAsterisk } from './LabelWithAsterisk';
import styles from '../CreateProjectPage.module.css'; // Adjust path relative to this file
import type { FormOption } from '../formConstants.ts'; // Import the type

interface ChipGroupFieldProps {
    label?: string; // Optional standard label text
    options: FormOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    required?: boolean; // Determines if LabelWithAsterisk is used
    multiple?: boolean; // Pass through to Chip.Group
    labelComponent?: React.ReactNode; // Allows passing a custom label component
}

/**
 * A reusable component for rendering a group of Chips with a label.
 * Handles required asterisk logic and allows for custom label components.
 */
export function ChipGroupField({
                                   label,
                                   options,
                                   value,
                                   onChange,
                                   required = false,
                                   multiple = false,
                                   labelComponent, // Optional custom label component
                               }: ChipGroupFieldProps) {

    // Determine which label component to render
    const LabelComponent = labelComponent ? (
        <>{labelComponent}</> // Render custom label if provided
    ) : required && label ? (
        <LabelWithAsterisk>{label}</LabelWithAsterisk> // Render label with asterisk
    ) : label ? (
        <Title order={3} size="15px" fw={400} mb="10px">{label}</Title> // Render standard title label
    ) : null; // Render no label if neither text nor component is provided

    return (
        <Chip.Group multiple={multiple} value={value} onChange={onChange}>
            <Box>
                {LabelComponent}
                <Group gap="xs">
                    {options.map((option) => (
                        <Chip
                            size="lg"
                            key={option.value}
                            value={option.value}
                            variant="outline"
                            color="black" // Using black as the base color for outline variant
                            radius="md"
                            classNames={{
                                root: styles.chipRoot, // Base styling for the chip container
                                label: styles.chipLabel, // Styling for the chip label text and background
                                checkIcon: styles.chipCheckIcon, // Hides the default check icon
                                iconWrapper: styles.chipIconWrapper, // Adjusts spacing for the hidden icon
                            }}
                        >
                            {option.label}
                        </Chip>
                    ))}
                </Group>
            </Box>
        </Chip.Group>
    );
}