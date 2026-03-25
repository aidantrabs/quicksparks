import { IAttendance } from '../models/IAttendance';
import { ILeaderboardEntry } from '../models/ILeaderboardEntry';
import { ISession } from '../models/ISession';
import { IUserBadge } from '../models/IUserBadge';
import { deriveUserBadges } from '../utils/badgeUtils';
import { DIVISIONS } from '../utils/constants';
import { calculateStreak, isUpcoming } from '../utils/dateUtils';
import { IDataService } from './IDataService';

const MOCK_USER_EMAIL = 'aidan.traboulay@rfhl.com';
const MOCK_USER_NAME = 'Aidan Traboulay';

const MOCK_SESSIONS: ISession[] = [
    {
        id: 1,
        title: 'From Numbers to Narrative - "Liquidity Matters - Can the Customer Pay Their Bills"',
        sessionDate: new Date(2026, 0, 20),
        description:
            "Understand liquidity fundamentals and how to assess a customer's ability to meet financial obligations.",
        badgeImageUrl: require('../assets/badges/liquidity-matters.png'),
        category: 'From Numbers to Narrative',
        isUpcoming: false,
    },
    {
        id: 2,
        title: 'Courtesy Counts - "Welcoming and Entertaining Guests / Clients"',
        sessionDate: new Date(2026, 1, 26),
        description: 'Master the art of professional hospitality and creating memorable client experiences.',
        badgeImageUrl: require('../assets/badges/welcoming-entertaining-guests.png'),
        category: 'Courtesy Counts',
        isUpcoming: false,
    },
    {
        id: 3,
        title: 'Outside In; The Mindset That Changes Everything - "Diagnosing the Drama"',
        sessionDate: new Date(2026, 1, 24),
        description:
            'Learn to identify root causes of workplace challenges by shifting perspective from inside-out to outside-in.',
        badgeImageUrl: require('../assets/badges/diagnosing-drama.png'),
        category: 'Outside In; The Mindset That Changes Everything',
        isUpcoming: false,
    },
    {
        id: 4,
        title: 'Outside In; The Mindset That Changes Everything - "Turning My Job Outward"',
        sessionDate: new Date(2026, 2, 10),
        description: 'Apply the outside-in mindset to transform how you approach your daily responsibilities.',
        badgeImageUrl: require('../assets/badges/turning-my-job.png'),
        category: 'Outside In; The Mindset That Changes Everything',
        isUpcoming: false,
    },
    {
        id: 5,
        title: 'The Conversation Catalyst: Beyond Words',
        sessionDate: new Date(2026, 2, 12),
        description: 'Explore non-verbal communication techniques that enhance professional conversations.',
        badgeImageUrl: require('../assets/badges/beyond-words.png'),
        category: 'The Conversation Catalyst',
        isUpcoming: false,
    },
    {
        id: 6,
        title: 'Byte-Sized Brilliance; Your Guide to Digital Empowerment - "Excel-lence Unlocked"',
        sessionDate: new Date(2026, 2, 18),
        description: 'Unlock advanced Excel features to boost productivity and streamline data analysis workflows.',
        badgeImageUrl: require('../assets/badges/excellence-unlocked.png'),
        category: 'Byte-Sized Brilliance; Your Guide to Digital Empowerment',
        isUpcoming: false,
    },
    {
        id: 7,
        title: 'The Conversation Catalyst - "Active Listening Mastery"',
        sessionDate: new Date(2026, 2, 17),
        description: 'Develop active listening skills that build trust and improve client relationships.',
        badgeImageUrl: require('../assets/badges/active-listening-mastery.png'),
        category: 'The Conversation Catalyst',
        isUpcoming: false,
    },
    {
        id: 8,
        title: 'From Numbers to Narrative - "Reading the Balance Sheet Story"',
        sessionDate: new Date(2026, 3, 8),
        description: 'Learn to interpret balance sheets and communicate financial health in plain language.',
        badgeImageUrl: '',
        category: 'From Numbers to Narrative',
        isUpcoming: true,
    },
    {
        id: 9,
        title: 'Courtesy Counts - "Handling Difficult Conversations with Grace"',
        sessionDate: new Date(2026, 3, 15),
        description: 'Strategies for navigating tough conversations while maintaining professionalism and empathy.',
        badgeImageUrl: '',
        category: 'Courtesy Counts',
        isUpcoming: true,
    },
    {
        id: 10,
        title: 'Outside In; The Mindset That Changes Everything - "Seeing Through the Customer\'s Eyes"',
        sessionDate: new Date(2026, 3, 22),
        description: 'Practice empathy mapping and customer journey analysis to improve service delivery.',
        badgeImageUrl: '',
        category: 'Outside In; The Mindset That Changes Everything',
        isUpcoming: true,
    },
    {
        id: 11,
        title: 'Byte-Sized Brilliance; Your Guide to Digital Empowerment - "Power Automate Essentials"',
        sessionDate: new Date(2026, 3, 29),
        description: 'Automate repetitive tasks using Microsoft Power Automate to save time and reduce errors.',
        badgeImageUrl: '',
        category: 'Byte-Sized Brilliance; Your Guide to Digital Empowerment',
        isUpcoming: true,
    },
    {
        id: 12,
        title: 'The Conversation Catalyst - "Feedback That Fuels Growth"',
        sessionDate: new Date(2026, 4, 6),
        description: 'Learn frameworks for giving and receiving constructive feedback that drives development.',
        badgeImageUrl: '',
        category: 'The Conversation Catalyst',
        isUpcoming: true,
    },
    {
        id: 13,
        title: 'From Numbers to Narrative - "Cash Flow Confidence"',
        sessionDate: new Date(2026, 4, 13),
        description: 'Build confidence in analyzing and presenting cash flow statements to stakeholders.',
        badgeImageUrl: '',
        category: 'From Numbers to Narrative',
        isUpcoming: true,
    },
    {
        id: 14,
        title: 'Byte-Sized Brilliance; Your Guide to Digital Empowerment - "Teams Tips & Tricks"',
        sessionDate: new Date(2026, 4, 20),
        description: 'Discover hidden features in Microsoft Teams that boost collaboration and productivity.',
        badgeImageUrl: '',
        category: 'Byte-Sized Brilliance; Your Guide to Digital Empowerment',
        isUpcoming: true,
    },
    {
        id: 15,
        title: 'Courtesy Counts - "The Art of the Follow-Up"',
        sessionDate: new Date(2026, 4, 27),
        description: 'Why timely, thoughtful follow-ups set you apart in client service excellence.',
        badgeImageUrl: '',
        category: 'Courtesy Counts',
        isUpcoming: true,
    },
    {
        id: 16,
        title: 'Outside In; The Mindset That Changes Everything - "Building Bridges, Not Walls"',
        sessionDate: new Date(2026, 5, 3),
        description: 'Techniques for cross-departmental collaboration using an outside-in approach.',
        badgeImageUrl: '',
        category: 'Outside In; The Mindset That Changes Everything',
        isUpcoming: true,
    },
    {
        id: 17,
        title: 'The Conversation Catalyst - "Presenting with Impact"',
        sessionDate: new Date(2026, 5, 10),
        description: 'Structure and deliver presentations that engage, persuade, and leave a lasting impression.',
        badgeImageUrl: '',
        category: 'The Conversation Catalyst',
        isUpcoming: true,
    },
    {
        id: 18,
        title: 'Byte-Sized Brilliance; Your Guide to Digital Empowerment - "SharePoint for Everyday Use"',
        sessionDate: new Date(2026, 5, 17),
        description: 'Practical tips for using SharePoint to organize documents and collaborate effectively.',
        badgeImageUrl: '',
        category: 'Byte-Sized Brilliance; Your Guide to Digital Empowerment',
        isUpcoming: true,
    },
    {
        id: 19,
        title: 'From Numbers to Narrative - "Ratio Reasoning"',
        sessionDate: new Date(2026, 5, 24),
        description: 'Demystify financial ratios and learn to use them in everyday banking conversations.',
        badgeImageUrl: '',
        category: 'From Numbers to Narrative',
        isUpcoming: true,
    },
    {
        id: 20,
        title: 'Courtesy Counts - "Cultural Intelligence in Client Service"',
        sessionDate: new Date(2026, 6, 1),
        description: 'Develop cultural awareness to serve the diverse communities across the Republic Bank footprint.',
        badgeImageUrl: '',
        category: 'Courtesy Counts',
        isUpcoming: true,
    },
];

const MOCK_EMPLOYEE_NAMES: string[] = [
    'Jane Doe',
    'John Smith',
    'Alice Example',
    'Bob Tester',
    'Carol Placeholder',
    'Dave Sample',
    'Eve Mockson',
    'Frank Demoson',
    'Grace Testerly',
    'Hank Filler',
    'Irene Standins',
    'Jack Fakename',
    'Karen Specimen',
    'Leo Sandbox',
    'Mona Trialperson',
    'Nate Benchmark',
    'Olivia Dummy',
    'Pete Proofson',
    'Quinn Simulated',
    'Rosa Placeholder',
    'Sam Testcase',
    'Tina Mockdata',
    'Uma Fictional',
    'Vince Sampleson',
    'Wendy Exampleson',
    'Xander Testwell',
    'Yara Demodata',
    'Zack Standby',
    'Amy Fakewell',
    'Ben Trialdemo',
    'Cora Mockwell',
    'Dan Sampletest',
    'Ella Sandboxer',
    'Finn Placeholder',
    'Gina Testdata',
    'Hugo Demoperson',
    'Iris Fakefield',
    'Jake Mockerson',
    'Kira Testington',
    'Luke Specimen',
    'Mia Dummyfield',
    'Noah Proofwell',
    'Opal Benchmark',
    'Paul Simdata',
    'Rae Fictional',
    'Sean Testerly',
    'Tara Mockfield',
    'Uri Samplewell',
    'Val Demotest',
    'Wade Placeholder',
];

function buildMockAttendance(): IAttendance[] {
    const records: IAttendance[] = [];
    const pastSessions = MOCK_SESSIONS.filter((s) => !s.isUpcoming);

    for (let i = 0; i < MOCK_EMPLOYEE_NAMES.length; i++) {
        const name = MOCK_EMPLOYEE_NAMES[i];
        const email = `${name.toLowerCase().replace(/ /g, '.')}@rfhl.com`;
        const division = DIVISIONS[i % DIVISIONS.length];
        const attendRate = 0.3 + (i % 5) * 0.15;

        for (let j = 0; j < pastSessions.length; j++) {
            const session = pastSessions[j];
            const seed = ((i + 1) * (j + 1) * 7) % 100;
            if (seed / 100 < attendRate) {
                records.push({
                    sessionId: session.id,
                    employeeEmail: email,
                    employeeName: name,
                    attendedDate: session.sessionDate,
                    division: division,
                });
            }
        }
    }

    const mockUserSessions = [1, 3, 4, 5, 6, 7];
    for (let k = 0; k < mockUserSessions.length; k++) {
        const session = MOCK_SESSIONS[mockUserSessions[k] - 1];
        records.push({
            sessionId: session.id,
            employeeEmail: MOCK_USER_EMAIL,
            employeeName: MOCK_USER_NAME,
            attendedDate: session.sessionDate,
            division: 'Information Technology',
        });
    }

    return records;
}

const MOCK_ATTENDANCE = buildMockAttendance();

export class MockDataService implements IDataService {
    public getUserBadges(email: string): Promise<IUserBadge[]> {
        return Promise.resolve(deriveUserBadges(MOCK_SESSIONS, MOCK_ATTENDANCE, email));
    }

    public getAllSessions(): Promise<ISession[]> {
        return Promise.resolve(MOCK_SESSIONS);
    }

    public getUpcomingSessions(): Promise<ISession[]> {
        return Promise.resolve(MOCK_SESSIONS.filter((s) => isUpcoming(s.sessionDate)));
    }

    public getUserAttendanceStreak(email: string): Promise<number> {
        const userDates: Date[] = [];
        for (let i = 0; i < MOCK_ATTENDANCE.length; i++) {
            if (MOCK_ATTENDANCE[i].employeeEmail.toLowerCase() === email.toLowerCase()) {
                userDates.push(MOCK_ATTENDANCE[i].attendedDate);
            }
        }
        return Promise.resolve(calculateStreak(userDates));
    }

    public getLeaderboard(): Promise<ILeaderboardEntry[]> {
        const divisionStats: Record<string, { employees: Record<string, boolean>; total: number }> = {};

        for (let i = 0; i < MOCK_ATTENDANCE.length; i++) {
            const record = MOCK_ATTENDANCE[i];
            if (!divisionStats[record.division]) {
                divisionStats[record.division] = { employees: {}, total: 0 };
            }
            divisionStats[record.division].employees[record.employeeEmail] = true;
            divisionStats[record.division].total++;
        }

        const entries: ILeaderboardEntry[] = [];
        const divisionNames = Object.keys(divisionStats);
        for (let i = 0; i < divisionNames.length; i++) {
            const division = divisionNames[i];
            const stats = divisionStats[division];
            const employeeCount = Object.keys(stats.employees).length;
            entries.push({
                rank: 0,
                division: division,
                totalEmployees: employeeCount,
                totalAttendances: stats.total,
                participationRate: Math.round((stats.total / (employeeCount * 7)) * 100),
            });
        }

        entries.sort((a, b) => b.participationRate - a.participationRate);
        for (let i = 0; i < entries.length; i++) {
            entries[i].rank = i + 1;
        }

        return Promise.resolve(entries);
    }

    public getCurrentUserEmail(): string {
        return MOCK_USER_EMAIL;
    }

    public getCurrentUserDisplayName(): string {
        return MOCK_USER_NAME;
    }
}
