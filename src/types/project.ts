export interface Project {
    id: string;
    title: string;
    description: string;
    isLookingForMentor?: boolean; // If true, show badge
    isOpen?: boolean;             // true = Open, false = Closed, undefined = hide badge
    isFullyRemote?: boolean;      // If true, show badge
    createdAt: string;           // ISO 8601 date string
    numberOfMembers: number;
    tags?: string[];             // Optional tags like skills/technologies
}

export type ProjectListData = Project[];