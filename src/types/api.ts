// --- Shared ---
export interface SimpleUserDto {
  id: string;
  firstName: string;
  lastName: string;
  preferredUsername: string;
  name?: string;
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
  profileId: string;
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

// --- Portfolio Projects ---
export interface PortfolioProjectDto {
  id: string;
  profileId: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioProjectPayload {
  title: string;
  description: string;
  tags?: string[];
}

export interface UpdatePortfolioProjectPayload {
  title?: string;
  description?: string;
  tags?: string[];
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
  portfolioProjects?: PortfolioProjectDto[];
}

export interface UserDto {
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

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  status?: string;
  institution?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  skills?: string[];
  interests?: string[];
}

// --- Platform Projects ---
export interface ProjectMemberDto {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  user: SimpleUserDto;
  joinedAt: string;
}

// --- Tasks ---
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

export interface CreateTaskDto { // For POST .../tasks
  name: string;
  description: string;
  assigneeId?: string | null;
  status?: string; // Optional: default usually set by backend
}

export interface UpdateTaskDto { // For PATCH .../tasks/:taskId
  name?: string;
  description?: string;
  status?: string;
  assigneeId?: string | null;
}

export interface AssignTaskDto { // For PATCH .../tasks/:taskId/assign
  assigneeId?: string | null;
}
// --- End Tasks ---

export interface MilestoneDto {
  id: string;
  projectId: string;
  title: string;
  date: string;
  active: boolean;
  createdAt: string;
  tasks?: TaskDto[];
}

export interface UpdateMilestoneDto {
  title?: string;
  date?: string; // Expect ISO string format
  active?: boolean; // Although activating is a separate endpoint, include for completeness
}


export interface ProjectDto {
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
  owner: SimpleUserDto;
  members: ProjectMemberDto[];
  milestones?: MilestoneDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
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

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  numOfMembers?: string;
  projectType?: string;
  mentorRequest?: string;
  preferredMentor?: string;
  requiredSkills?: string[];
  tags?: string[];
  requiredRoles?: string;
  startDate?: string;
  endDate?: string;
}

export interface FindProjectsQueryDto {
  search?: string;
  skill?: string;
  tag?: string;
  ownerId?: string;
  memberId?: string;
  mentorRequest?: string;
  skip?: number;
  take?: number;
}

// --- Bookmarks ---
export interface BookmarkDto {
  id: string;
  userId: string;
  projectId: string;
  project: Omit<ProjectDto, 'members' | 'milestones'>;
  createdAt: string;
}

// --- Applications ---
export enum ApplicationStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  INVITED = 'Invited',
}

type ApplicationProjectDto = Omit<ProjectDto, 'members' | 'milestones'>;

export interface ApplicationDto {
  id: string;
  applicant: SimpleUserDto;
  applicantId: string;
  project: ApplicationProjectDto;
  projectId: string;
  status: ApplicationStatus | string;
  roleAppliedFor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FindApplicationsQueryDto {
  projectId?: string;
  applicantId?: string;
  status?: string;
  filter?: 'sent' | 'received';
  skip?: number;
  take?: number;
}

export interface UpdateApplicationStatusPayload {
  status: 'Accepted' | 'Declined';
}

export interface CreateApplicationPayload {
  roleAppliedFor?: string;
  message?: string;
}

// --- Invitations ---
export interface InviteUserDto {
  userId: string;
  role?: string;
}

export interface CreateMilestoneInput {
  title: string;
  date: string;
}

// --- Generic API Error Structure (Example) ---
export interface ApiErrorData {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// --- Recommendations ---
export interface RecommendedProjectDto {
  project: ProjectDto;
  reasons: string[];
}
