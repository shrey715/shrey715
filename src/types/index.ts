// Experience types
export interface Experience {
    id: string;
    title: string;
    organization: string;
    location?: string;
    duration: string;
    type?: string;
    highlights: string[];
}

export interface Achievement {
    id: string;
    title: string;
    organization: string;
    year: string;
    description: string;
}

// Project types
export interface Project {
    id: string;
    title: string;
    description: string;
    tech: string[];
    link: string;
    image?: string;
    featured?: boolean;
    year?: string;
    status?: string;
    deployment_link?: string;
}

// Skill types
export interface SkillCategory {
    title: string;
    skills: string[];
}

// Social & UI types
export interface SocialLink {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    href: string;
    label: string;
}

export interface HobbyItem {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    color: string;
}
