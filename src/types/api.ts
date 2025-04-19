// --- Shared ---
export interface SimpleUserDto { // For embedding in other DTOs
    id: string;
    firstName: string;
    lastName: string;
    preferredUsername?: string;
    // avatarUrl?: string; // Add later if needed for member lists etc.
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

export interface CreateWorkExperiencePayload { // For POST /profiles/me/work-experiences
    dateRange: string;
    workName: string;
    description: string;
}

export interface UpdateWorkExperiencePayload { // For PATCH /profiles/me/work-experiences/:id
    dateRange?: string;
    workName?: string;
    description?: string;
}

// --- Portfolio Projects ---
export interface PortfolioProjectDto { // For GET /users/me (nested) and responses from portfolio endpoints
    id: string;
    profileId: string;
    title: string;
    description: string;
    tags: string[];
    imageUrl?: string;
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
}

export interface CreatePortfolioProjectPayload { // For POST /profiles/me/portfolio-projects
    title: string;
    description: string;
    tags?: string[];
    // imageUrl?: string; // Add later
}

export interface UpdatePortfolioProjectPayload { // For PATCH /profiles/me/portfolio-projects/:id
    title?: string;
    description?: string;
    tags?: string[];
    // imageUrl?: string; // Add later
}

// --- User Profile ---
export interface UserProfileDto { // Part of UserDto from GET /users/me
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
    updatedAt: string; // ISO Date String
    skills?: SkillDto[];
    interests?: InterestDto[];
    workExperiences?: WorkExperienceDto[];
    portfolioProjects?: PortfolioProjectDto[]; // Portfolio projects are nested here
}

export interface UserDto { // Full user data from GET /users/me
    id: string;
    cognitoSub: string; // Keep internal if needed, maybe omit for general display
    email: string; // Keep email here as it's part of the core User entity
    firstName: string;
    lastName: string;
    preferredUsername: string;
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
    profile?: UserProfileDto; // Nested profile
}

export interface UpdateProfilePayload { // For PATCH /profiles/me
    firstName?: string;
    lastName?: string;
    status?: string;
    institution?: string;
    bio?: string;
    avatarUrl?: string; // For later
    bannerUrl?: string; // For later
    skills?: string[]; // Array of names
    interests?: string[]; // Array of names
    // Note: WorkExperience and PortfolioProjects are managed via separate endpoints
}

// --- Platform Projects ---
export interface ProjectMemberDto { // For ProjectDto.members array
    id: string; // Membership ID
    projectId: string;
    userId: string;
    role: string; // e.g., 'Owner', 'Member', 'Mentor'
    user: SimpleUserDto; // Embed simplified user info (no email)
    joinedAt: string; // ISO Date String
}

export interface TaskDto { // For MilestoneDto.tasks array
    id: string;
    milestoneId: string;
    name: string;
    description: string;
    status: string; // e.g., 'To Do'
    assigneeId?: string | null;
    assignee?: SimpleUserDto | null; // Embed simplified user info (no email)
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
}

export interface MilestoneDto { // For ProjectDto.milestones array
    id: string;
    projectId: string;
    title: string;
    date: string; // ISO Date String
    active: boolean;
    createdAt: string; // ISO Date String
    tasks?: TaskDto[];
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
    startDate?: string; // ISO Date String
    endDate?: string; // ISO Date String
    owner: SimpleUserDto; // Use simplified owner DTO (no email)
    members: ProjectMemberDto[];
    milestones?: MilestoneDto[];
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
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
    startDate?: string;
    endDate?: string;
    milestones?: CreateMilestoneInput[];
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
    startDate?: string; // ISO Date String
    endDate?: string; // ISO Date String
    // imageUrl handled separately
}

// --- Bookmarks ---
export interface BookmarkDto { // For GET /users/me/bookmarks
    id: string;
    userId: string;
    projectId: string;
    project: Omit<ProjectDto, 'members' | 'milestones'>; // Embed simplified project
    createdAt: string; // ISO Date String
}

// --- Applications ---
export interface ApplicationDto { // For GET /applications
    id: string;
    applicant: SimpleUserDto; // Use simplified DTO (no email)
    applicantId: string;
    project: Omit<ProjectDto, 'owner' | 'members' | 'milestones'>; // Simplified project
    projectId: string;
    status: string; // e.g., 'Pending'
    roleAppliedFor?: string;
    createdAt: string; // ISO Date String
    updatedAt: string; // ISO Date String
}

export interface FindApplicationsQueryDto { // For GET /applications query params
    projectId?: string;
    applicantId?: string; // 'me' or UUID
    status?: string; // e.g., 'Pending', 'Accepted', 'Declined'
    filter?: 'sent' | 'received';
    skip?: number;
    take?: number;
}

export interface UpdateApplicationStatusPayload { // For PATCH /applications/:id/status
    status: 'Accepted' | 'Declined';
}

export interface CreateApplicationPayload { // For POST /applications/apply/:projectId
    roleAppliedFor?: string;
    message?: string; // Optional message field
}

export interface CreateMilestoneInput {
    title: string;
    date: string;
}
