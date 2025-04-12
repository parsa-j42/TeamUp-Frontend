// Placeholder data - replace with actual props or state later
// In a real app, this data would likely come from an API call or component props.
export const projectData = {
    title: 'Project Title',
    tags: ['Looking for mentor', 'Remote', 'Open for feedback'],
    owner: {
        name: 'Jason Hong',
        avatarUrl: '', // Optional: Add URL for real avatar
    },
    currentMembers: [
        {
            id: 1,
            name: 'Full name',
            role: 'Role title',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            avatarUrl: '',
        },
        {
            id: 2,
            name: 'Full name',
            role: 'Role title',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            avatarUrl: '',
        },
        {
            id: 3,
            name: 'Full name',
            role: 'Role title',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            avatarUrl: '',
        },
        {
            id: 4,
            name: 'Full name',
            role: 'Role title',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            avatarUrl: '',
        },
    ],
    description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    requiredRoles:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    requiredSkills: ['Figma', 'Photoshop', 'HTML', 'CSS'],
};

// Define the SVG path for the wave shape
// This path creates the top curved edge of the white content area
export const WAVE_PATH = "M 0 39 Q 24 58 52 35 C 59 28 88 23 100 39 L 100 0 L 0 0 Z";

// Type definition for a project member (example)
export interface ProjectMember {
    id: number;
    name: string;
    role: string;
    description: string;
    avatarUrl: string;
}

// Type definition for the project owner (example)
export interface ProjectOwner {
    name: string;
    avatarUrl: string;
}

// Type definition for the entire project data structure (example)
export interface ProjectData {
    title: string;
    tags: string[];
    owner: ProjectOwner;
    currentMembers: ProjectMember[];
    description: string;
    requiredRoles: string;
    requiredSkills: string[];
}