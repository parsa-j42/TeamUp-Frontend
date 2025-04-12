// Define options for various form fields

export const numOfMembersFormOptions = [
    { value: '1', label: 'Just Me' },
    { value: '2-4', label: '2~4' },
    { value: '5-10', label: '5~10' },
    { value: '10+', label: '10+' },
];

export const projectTypeFormOptions = [
    { value: 'in-person', label: 'In-Person' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
];

export const mentorRequestFormOptions = [
    { value: 'looking', label: 'Looking for a Mentor' },
    { value: 'open', label: 'Open for Feedback' },
];

export const preferredMentorFormOptions = [
    { value: 'one-time', label: 'One Time Coffee Chat' },
    { value: 'regular', label: 'Regular Meetings' },
];

export interface FormOption {
    value: string;
    label: string;
}