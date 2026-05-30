// Shape covers both the full UserDto and the trimmed SimpleUserDto used in
// embedded responses (members, owners, assignees, applicants).
interface NamedUser {
    firstName?: string;
    lastName?: string;
    preferredUsername?: string;
}

// A user's preferred name replaces their legal name across the app when set.
// Falls back to "First Last" (trimmed) otherwise.
export function getUserDisplayName(user?: NamedUser | null): string {
    const preferred = user?.preferredUsername?.trim();
    if (preferred) return preferred;
    return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
}
