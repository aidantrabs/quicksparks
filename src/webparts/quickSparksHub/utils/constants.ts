export const SKILL_STUDIOS = [
    '1.0 The Conversation Catalyst',
    '2.0 Mind Over Maybes',
    '3.0 Outside In: The Mindset That Changes Everything',
    '4.0 From Numbers to Narrative',
    '5.0 Byte-Sized Brilliance',
    '6.0 Credit Compass',
    '7.0 Think Risk, Act Right',
    '8.0 Dollars Making Sense?',
    "9.0 The Leader's Code",
    '10.0 Imagine That!',
    '11.0 Courtesy Counts',
    '12.0 Everyday Wins',
] as const;

export const CATEGORIES = [
    'Business Skills',
    'Compliance',
    'Credit',
    'Leadership',
    'Service/Support/Technical',
    'Personal Development',
] as const;

export const COUNTRY_CODES: Record<string, string> = {
    RBB: 'Republic Bank (Barbados) Limited',
    RBL: 'Republic Bank Limited',
    RGD: 'Republic Bank (Grenada) Ltd.',
    RGY: 'Republic Bank (Guyana) Limited',
    RSL: 'Republic Securities Limited',
    RSR: 'Republic Bank (Suriname) N.V.',
    RCL: 'RBL Cayman Ltd',
    RGH: 'Republic Bank (Ghana) Limited',
    RBG: 'Republic Boafo (Ghana)',
    RIG: 'Republic Investments Ghana Limited',
    RAI: 'Republic Bank Anguilla',
    RDM: 'Republic Bank Dominica',
    RGN: 'Republic Bank Grenada',
    RKN: 'Republic Bank St. Kitts-Nevis',
    RLC: 'Republic Bank St. Lucia',
    RSX: 'Republic Bank St. Maarten',
    RVC: 'Republic Bank St. Vincent',
    RCB: 'Cayman National Bank',
    RCC: 'Cayman National Corporation',
    RCF: 'Cayman National Fund Services',
    RCS: 'Cayman National Securities',
    RCT: 'Cayman National Trust',
    RVG: 'Republic Virgin Islands (British)',
};

export const BADGE_POINTS = {
    none: 0,
    bronze: 10,
    silver: 20,
    gold: 30,
} as const;

export const TABS = ['My Badges', 'Upcoming', 'Leaderboard'] as const;

export type TabId = (typeof TABS)[number];
