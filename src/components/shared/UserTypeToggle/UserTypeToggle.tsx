import { SegmentedControl } from '@mantine/core';
import { useState } from 'react';
import classes from './UserTypeToggle.module.css';

interface UserTypeToggleProps {
    value?: string;
    onChange?: (value: string) => void;
}

export function UserTypeToggle({ value, onChange }: UserTypeToggleProps) {
    const [internalValue, setInternalValue] = useState<string>(value || '');

    const handleChange = (newValue: string) => {
        setInternalValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <SegmentedControl
            value={value || internalValue}
            onChange={handleChange}
            data={[
                { label: 'Undergraduate', value: 'undergraduate' },
                { label: 'Graduate', value: 'graduate' },
                { label: 'Instructor', value: 'instructor' },
            ]}
            classNames={{
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
