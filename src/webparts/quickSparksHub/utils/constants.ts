export const DIVISIONS = [
    'Retail Banking',
    'Corporate Banking',
    'Treasury',
    'Risk & Compliance',
    'Operations',
    'Information Technology',
    'Human Resources',
    'Marketing & Communications',
    'Wealth Management',
    'Insurance Services',
] as const;

export const SERIES = [
    'From Numbers to Narrative',
    'Courtesy Counts',
    'Outside In; The Mindset That Changes Everything',
    'The Conversation Catalyst',
    'Byte-Sized Brilliance; Your Guide to Digital Empowerment',
] as const;

export const TABS = ['My Badges', 'Upcoming', 'Leaderboard'] as const;

export type TabId = (typeof TABS)[number];
