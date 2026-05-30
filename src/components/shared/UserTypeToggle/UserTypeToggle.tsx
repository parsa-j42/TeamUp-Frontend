import { SegmentedControl } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import classes from './UserTypeToggle.module.css';

interface UserTypeToggleProps {
    value?: string;
    onChange?: (value: string) => void;
}

export function UserTypeToggle({ value, onChange }: UserTypeToggleProps) {
    const [internalValue, setInternalValue] = useState<string>(value || '');
    // The three labels do not fit a phone-width card side by side, so stack them.
    const isNarrow = useMediaQuery('(max-width: 36em)');

    const handleChange = (newValue: string) => {
        setInternalValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <SegmentedControl
            fullWidth
            orientation={isNarrow ? 'vertical' : 'horizontal'}
            value={value || internalValue}
            onChange={handleChange}
            data={[
                { label: 'Undergraduate', value: 'undergraduate' },
                { label: 'Graduate', value: 'graduate' },
                { label: 'Instructor', value: 'instructor' },
            ]}
            classNames={{
                root: classes.root,
                innerLabel: classes.innerLabel,
                label: classes.label,
                control: classes.control,
                indicator: classes.indicator
            }}
            styles={{
                root: {
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderRadius: '17px',
                }
            }}
        />
    );
}

export default UserTypeToggle;
