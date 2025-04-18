// src/types/api.ts

// --- Shared ---
export interface SimpleUserDto { // For embedding in other DTOs
    id: string;
    firstName: string;
    lastName: string;
    preferredUsername?: string;
    // Add avatarUrl if needed for display
    // email?: string; // Usually not needed when embedding
}

// --- Skills ---
export interface SkillDto {
    id: string;
    name: string;
    description?: string;
}

// --- Interests ---
export interface InterestDto {
    id: string;
    name: string;
    description?: string;
}

// --- Work Experience ---
export interface WorkExperienceDto {
    id: string;
    profileId: string; // Keep if needed, but often redundant on frontend
    dateRange: string;
    workName: string;
    description: string;
}

export interface CreateWorkExperiencePayload {
    dateRange: string;
    workName: string;
    description: string;
}

export interface UpdateWorkExperiencePayload {
    dateRange?: string;
    workName?: string;
    description?: string;
}

// --- User Profile ---
export interface UserProfileDto {
    id: string;
    userId: string;
    userType?: string;
    program?: string;
    signupExperience?: string; // Experience from signup form
    status?: string;
    institution?: string; // Added back
    bio?: string;
    avatarUrl?: string; // Added back
    bannerUrl?: string; // Added back
    updatedAt: string; // Dates usually come as strings
    skills?: SkillDto[];
    interests?: InterestDto[];
    workExperiences?: WorkExperienceDto[];
}

export interface UserDto { // Full user data, usually for /users/me
    id: string;
    cognitoSub: string;
    email: string;
    firstName: string;
    lastName: string;
    preferredUsername: string;
    createdAt: string;
    updatedAt: string;
    profile?: UserProfileDto;
}

export interface UpdateProfilePayload { // For PATCH /profiles/me
    firstName?: string;
    lastName?: string;
    status?: string;
    institution?: string; // Added back
    bio?: string;
    avatarUrl?: string; // For later
    bannerUrl?: string; // For later
    skills?: string[]; // Array of names
    interests?: string[]; // Array of names
}

// --- Projects ---
export interface ProjectMemberDto {
    id: string; // Membership ID
    projectId: string;
    userId: string;
    role: string; // e.g., 'Owner', 'Member', 'Mentor'
    user: SimpleUserDto; // Embed simplified user info
    joinedAt: string;
}

export interface MilestoneDto { // Simplified for frontend use if needed
    id: string;
    title: string;
    date: string;
    active: boolean;
    // tasks?: TaskDto[]; // Add if displaying tasks on profile project card
}

export interface ProjectDto { // For GET /projects and GET /projects/:id
    id: string;
    title: string;
    description: string;
    numOfMembers?: string;
    projectType?: string;
    mentorRequest?: string;
    preferredMentor?: string;
    requiredSkills?: string[];
    tags?: string[];
    requiredRoles?: string;
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    owner: SimpleUserDto; // Use simplified owner DTO
    members: ProjectMemberDto[];
    milestones?: MilestoneDto[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectPayload { // For POST /projects
    title: string;
    description: string;
    numOfMembers?: string;
    projectType?: string;
    mentorRequest?: string;
    preferredMentor?: string;
    requiredSkills?: string[];
    tags?: string[];
    requiredRoles?: string;
    // imageUrl?: string; // Add later
    startDate?: string;
    endDate?: string;
}

export interface UpdateProjectPayload { // For PATCH /projects/:id
    title?: string;
    description?: string;
    numOfMembers?: string;
    projectType?: string;
    mentorRequest?: string;
    preferredMentor?: string;
    requiredSkills?: string[];
    tags?: string[];
    requiredRoles?: string;
    // imageUrl?: string; // Add later
    startDate?: string;
    endDate?: string;
}

// --- Bookmarks ---
export interface BookmarkDto {
    id: string;
    userId: string;
    projectId: string;
    project: Omit<ProjectDto, 'members' | 'milestones'>; // Embed simplified project
    createdAt: string;
}

// --- Applications ---
export interface ApplicationDto {
    id: string;
    applicant: SimpleUserDto;
    applicantId: string;
    project: Omit<ProjectDto, 'owner' | 'members' | 'milestones'>; // Simplified project
    projectId: string;
    status: string; // e.g., 'Pending'
    roleAppliedFor?: string;
    createdAt: string;
    updatedAt: string;
}

// --- Tasks (if needed directly) ---
export interface TaskDto {
    id: string;
    milestoneId: string;
    name: string;
    description: string;
    status: string;
    assigneeId?: string | null;
    assignee?: SimpleUserDto | null;
    createdAt: string;
    updatedAt: string;
}

// --- User Profile ---
export interface UserProfileDto {
    id: string;
    userId: string;
    userType?: string;
    program?: string;
    signupExperience?: string;
    status?: string;
    institution?: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    updatedAt: string;
    skills?: SkillDto[];
    interests?: InterestDto[];
    workExperiences?: WorkExperienceDto[];
    portfolioProjects?: PortfolioProjectDto[]; // Add portfolio projects
}
export interface UserDto { /* ... includes UserProfileDto ... */ }
export interface UpdateProfilePayload { /* ... */ }

// --- Portfolio Projects ---
export interface PortfolioProjectDto { // Matches backend DTO
    id: string;
    profileId: string;
    title: string;
    description: string;
    tags: string[];
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreatePortfolioProjectPayload { // For POST
    title: string;
    description: string;
    tags?: string[];
    // imageUrl?: string; // Add later
}
export interface UpdatePortfolioProjectPayload { // For PATCH
    title?: string;
    description?: string;
    tags?: string[];
    // imageUrl?: string; // Add later
}
