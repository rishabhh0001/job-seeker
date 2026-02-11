export type JobPreset = {
    label: string
    value: string
    descriptionTemplate: string
    requirements: string[]
}

export const JOB_PRESETS: Record<string, JobPreset> = {
    "Full-time": {
        label: "Full-time",
        value: "FT",
        descriptionTemplate: `We are looking for a dedicated full-time professional to join our team.

**Responsibilities:**
- Collaborate with cross-functional teams
- Develop and maintain high-quality software
- Participate in code reviews and design discussions

**What we offer:**
- Competitive salary and benefits
- Professional development opportunities
- Great work environment`,
        requirements: [
            "Bachelor's degree in Computer Science or related field",
            "3+ years of relevant experience",
            "Strong problem-solving skills",
            "Excellent communication skills",
        ],
    },
    "Part-time": {
        label: "Part-time",
        value: "PT",
        descriptionTemplate: `We are seeking a part-time contributor to help with ongoing projects.

**Responsibilities:**
- Assist with specific project tasks
- Commit to 20 hours per week
- Attend weekly sync meetings`,
        requirements: [
            "Previous experience in the field",
            "Ability to work independently",
            "Good time management skills",
        ],
    },
    "Contract": {
        label: "Contract",
        value: "CT",
        descriptionTemplate: `We have an immediate opening for a contractor to help us deliver a key project.

**Project Scope:**
- 6-month contract duration
- Deliverable-based milestones
- Remote friendly`,
        requirements: [
            "Proven track record of delivering similar projects",
            "Available for immediate start",
            "Self-directed work style",
        ],
    },
    "Internship": {
        label: "Internship",
        value: "IN",
        descriptionTemplate: `Join our internship program to jumpstart your career!

**Learning Outcomes:**
- Gain hands-on experience with real-world projects
- Mentorship from senior team members
- Exposure to modern technologies`,
        requirements: [
            "Currently enrolled in a degree program",
            "Eager to learn and grow",
            "Basic understanding of core concepts",
        ],
    },
    "Remote": {
        label: "Remote",
        value: "RM",
        descriptionTemplate: `We are a remote-first company looking for talent anywhere in the world.

**How we work:**
- Async-first communication
- Result-oriented culture
- Flexible working hours`,
        requirements: [
            "Reliable internet connection",
            "Strong written communication skills",
            "Experience with remote work tools",
        ],
    },
}
