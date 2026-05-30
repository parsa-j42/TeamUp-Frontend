import { useState } from 'react';
import { TextInput, TextInputProps, rem } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface ProjectSearchInputProps extends Omit<TextInputProps, 'value' | 'onChange'> {
    // Fired once a search has navigated away, so the mobile drawer can close itself.
    onSearch?: () => void;
}

/**
 * Search box shared by the desktop header bar and the mobile nav drawer. Keeps its
 * own value and pushes the term to /discover, so callers only decide where it sits.
 */
export function ProjectSearchInput({ onSearch, ...props }: ProjectSearchInputProps) {
    const navigate = useNavigate();
    const [value, setValue] = useState('');

    const submit = () => {
        const term = value.trim();
        if (!term) return;
        navigate(`/discover?search=${encodeURIComponent(term)}`);
        onSearch?.();
    };

    return (
        <TextInput
            placeholder="Search Projects..."
            radius="md"
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') submit(); }}
            rightSection={
                <IconSearch
                    style={{ width: rem(19), height: rem(19), cursor: 'pointer', color: 'var(--mantine-color-mainBlue-6)' }}
                    stroke={3}
                    onClick={submit}
                />
            }
            styles={(theme) => ({
                input: {
                    borderColor: theme.colors.mainBlue[6],
                    borderWidth: 2,
                },
                section: {
                    cursor: 'pointer',
                },
            })}
            {...props}
        />
    );
}
