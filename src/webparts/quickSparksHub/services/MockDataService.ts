import { IAttendance } from '../models/IAttendance';
import { ILeaderboardEntry } from '../models/ILeaderboardEntry';
import { BadgeTier, ISession } from '../models/ISession';
import { IUserBadge } from '../models/IUserBadge';
import { deriveUserBadges } from '../utils/badgeUtils';
import { calculateStreak } from '../utils/dateUtils';
import { IDataService } from './IDataService';

const MOCK_USER_EMAIL = 'aidan.traboulay@rfhl.com';
const MOCK_USER_NAME = 'Aidan Traboulay';

const MOCK_SESSIONS: ISession[] = [
    {
        id: 1,
        trainingCode: '1.1',
        title: 'Say It So It Sticks',
        sessionDate: new Date(2026, 0, 13),
        skillStudio: '1.0 The Conversation Catalyst',
        category: 'Business Skills',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 2,
        trainingCode: '2.1',
        title: 'The Power of Pause: Think Before You Leap',
        sessionDate: new Date(2026, 0, 15),
        skillStudio: '2.0 Mind Over Maybes',
        category: 'Compliance',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 3,
        trainingCode: '3.1',
        title: 'Why Mindset Matters',
        sessionDate: new Date(2026, 0, 19),
        skillStudio: '3.0 Outside In: The Mindset That Changes Everything',
        category: 'Leadership',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 4,
        trainingCode: '4.1',
        title: 'Liquidity Matters',
        sessionDate: new Date(2026, 0, 20),
        skillStudio: '4.0 From Numbers to Narrative',
        category: 'Credit',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 5,
        trainingCode: '5.1',
        title: 'Team Up with Teams',
        sessionDate: new Date(2026, 0, 22),
        skillStudio: '5.0 Byte-Sized Brilliance',
        category: 'Service/Support/Technical',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 6,
        trainingCode: '3.2',
        title: 'Radical Self-Awareness',
        sessionDate: new Date(2026, 0, 27),
        skillStudio: '3.0 Outside In: The Mindset That Changes Everything',
        category: 'Leadership',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 7,
        trainingCode: '7.1',
        title: 'Simplifying Compliance',
        sessionDate: new Date(2026, 0, 29),
        skillStudio: '7.0 Think Risk, Act Right',
        category: 'Compliance',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 8,
        trainingCode: '8.1',
        title: 'Taking Charge of Your Money',
        sessionDate: new Date(2026, 1, 3),
        skillStudio: '8.0 Dollars Making Sense?',
        category: 'Business Skills',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 9,
        trainingCode: '9.1',
        title: 'Unlocking Potential: The Heart of Coaching',
        sessionDate: new Date(2026, 1, 5),
        skillStudio: "9.0 The Leader's Code",
        category: 'Leadership',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 10,
        trainingCode: '3.3',
        title: 'My Distorted Reality',
        sessionDate: new Date(2026, 1, 11),
        skillStudio: '3.0 Outside In: The Mindset That Changes Everything',
        category: 'Leadership',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 11,
        trainingCode: '10.1',
        title: 'Solve, Create, Innovate',
        sessionDate: new Date(2026, 1, 12),
        skillStudio: '10.0 Imagine That!',
        category: 'Business Skills',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 12,
        trainingCode: '3.4',
        title: 'Diagnosing the Drama',
        sessionDate: new Date(2026, 1, 24),
        skillStudio: '3.0 Outside In: The Mindset That Changes Everything',
        category: 'Leadership',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 13,
        trainingCode: '11.1',
        title: 'Welcoming and Entertaining Guests/Clients',
        sessionDate: new Date(2026, 1, 26),
        skillStudio: '11.0 Courtesy Counts',
        category: 'Service/Support/Technical',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 14,
        trainingCode: '8.1b',
        title: 'Taking Charge of Your Money',
        sessionDate: new Date(2026, 2, 2),
        skillStudio: '8.0 Dollars Making Sense?',
        category: 'Business Skills',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 15,
        trainingCode: '11.4',
        title: 'Respect in the Workplace: Building a Culture of Courtesy',
        sessionDate: new Date(2026, 2, 3),
        skillStudio: '11.0 Courtesy Counts',
        category: 'Service/Support/Technical',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 16,
        trainingCode: '12.1',
        title: 'Car Basics & Maintenance (Tyre Health)',
        sessionDate: new Date(2026, 2, 5),
        skillStudio: '12.0 Everyday Wins',
        category: 'Personal Development',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 17,
        trainingCode: '3.5',
        title: 'Turning My Job Outward',
        sessionDate: new Date(2026, 2, 10),
        skillStudio: '3.0 Outside In: The Mindset That Changes Everything',
        category: 'Leadership',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 18,
        trainingCode: '1.2',
        title: 'Beyond Words',
        sessionDate: new Date(2026, 2, 12),
        skillStudio: '1.0 The Conversation Catalyst',
        category: 'Business Skills',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 19,
        trainingCode: '1.3',
        title: 'Active Listening Mastery',
        sessionDate: new Date(2026, 2, 17),
        skillStudio: '1.0 The Conversation Catalyst',
        category: 'Business Skills',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 20,
        trainingCode: '5.2',
        title: 'Excel-lence Unlocked',
        sessionDate: new Date(2026, 2, 18),
        skillStudio: '5.0 Byte-Sized Brilliance',
        category: 'Service/Support/Technical',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 21,
        trainingCode: '2.2',
        title: 'Frame It Right: Solving the Real Problem',
        sessionDate: new Date(2026, 2, 24),
        skillStudio: '2.0 Mind Over Maybes',
        category: 'Compliance',
        country: 'RBL',
        isUpcoming: false,
    },
    {
        id: 22,
        trainingCode: '6.1',
        title: 'Credit Compass: Finding Your Direction',
        sessionDate: new Date(2026, 3, 8),
        skillStudio: '6.0 Credit Compass',
        category: 'Credit',
        country: 'RBL',
        isUpcoming: true,
    },
    {
        id: 23,
        trainingCode: '3.6',
        title: 'Building Bridges, Not Walls',
        sessionDate: new Date(2026, 3, 15),
        skillStudio: '3.0 Outside In: The Mindset That Changes Everything',
        category: 'Leadership',
        country: 'RBL',
        isUpcoming: true,
    },
    {
        id: 24,
        trainingCode: '1.4',
        title: 'Feedback That Fuels Growth',
        sessionDate: new Date(2026, 3, 22),
        skillStudio: '1.0 The Conversation Catalyst',
        category: 'Business Skills',
        country: 'RBL',
        isUpcoming: true,
    },
    {
        id: 25,
        trainingCode: '5.3',
        title: 'Power Automate Essentials',
        sessionDate: new Date(2026, 3, 29),
        skillStudio: '5.0 Byte-Sized Brilliance',
        category: 'Service/Support/Technical',
        country: 'RBL',
        isUpcoming: true,
    },
];

const MOCK_BRANCHES = [
    'Independence Sq-Support',
    'HO-HR,Learning & Talent Dev Ct',
    'Park St-Sales',
    'Gulf View-Branch Sales',
    'Cipero St-Service',
    'Couva-Sales',
    'Trincity - Branch Sales',
    'San Juan-Branch Sales',
    'Diego Martin-Sales',
    'Arima-Branch Sales',
    'Marabella-Sales',
    'Princes Town-Sales',
    'Ellerslie Court-Branch Sales',
    'HO-Compliance Department',
    'HO-Strategic Transformation Ut',
    'Credit Crd Centre-Operations',
    'Warrens',
    'Holetown',
    'Speightstown',
    'Basseterre Branch',
];

const MOCK_COUNTRIES = [
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBL',
    'RBB',
    'RBB',
    'RBB',
    'RKN',
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

function pickTier(seed: number): BadgeTier {
    const r = seed % 100;
    if (r < 15) return 'none';
    if (r < 25) return 'bronze';
    if (r < 40) return 'silver';
    return 'gold';
}

function tierPoints(tier: BadgeTier): number {
    if (tier === 'gold') return 30;
    if (tier === 'silver') return 20;
    if (tier === 'bronze') return 10;
    return 0;
}

function buildMockAttendance(): IAttendance[] {
    const records: IAttendance[] = [];
    const pastSessions = MOCK_SESSIONS.filter((s) => !s.isUpcoming);

    for (let i = 0; i < MOCK_EMPLOYEE_NAMES.length; i++) {
        const name = MOCK_EMPLOYEE_NAMES[i];
        const email = `${name.toLowerCase().replace(/ /g, '.')}@rfhl.com`;
        const branch = MOCK_BRANCHES[i % MOCK_BRANCHES.length];
        const country = MOCK_COUNTRIES[i % MOCK_COUNTRIES.length];
        const attendRate = 0.3 + (i % 5) * 0.15;

        for (let j = 0; j < pastSessions.length; j++) {
            const session = pastSessions[j];
            const seed = ((i + 1) * (j + 1) * 7) % 100;
            if (seed / 100 < attendRate) {
                const tier = pickTier((i + 1) * (j + 3) * 13);
                if (tier === 'none') continue;
                records.push({
                    sessionId: session.id,
                    trainingCode: session.trainingCode,
                    employeeNumber: String(10000 + i),
                    employeeEmail: email,
                    employeeName: name,
                    branchUnit: branch,
                    country: country,
                    tier: tier,
                    points: tierPoints(tier),
                });
            }
        }
    }

    const mockUserSessions: Array<{ code: string; tier: BadgeTier }> = [
        { code: '1.1', tier: 'gold' },
        { code: '3.1', tier: 'gold' },
        { code: '3.4', tier: 'gold' },
        { code: '3.5', tier: 'silver' },
        { code: '1.2', tier: 'gold' },
        { code: '5.2', tier: 'gold' },
        { code: '1.3', tier: 'gold' },
        { code: '4.1', tier: 'gold' },
        { code: '7.1', tier: 'silver' },
        { code: '8.1', tier: 'gold' },
        { code: '9.1', tier: 'bronze' },
        { code: '11.1', tier: 'gold' },
        { code: '10.1', tier: 'gold' },
        { code: '2.1', tier: 'gold' },
    ];

    for (let k = 0; k < mockUserSessions.length; k++) {
        const entry = mockUserSessions[k];
        const session = MOCK_SESSIONS.filter((s) => s.trainingCode === entry.code)[0];
        if (session) {
            records.push({
                sessionId: session.id,
                trainingCode: session.trainingCode,
                employeeNumber: '99999',
                employeeEmail: MOCK_USER_EMAIL,
                employeeName: MOCK_USER_NAME,
                branchUnit: 'GTSD - Regional Solution Deliv',
                country: 'RBL',
                tier: entry.tier,
                points: tierPoints(entry.tier),
            });
        }
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
        return Promise.resolve(MOCK_SESSIONS.filter((s) => s.isUpcoming));
    }

    public getUserAttendanceStreak(email: string): Promise<number> {
        const userDates: Date[] = [];
        for (let i = 0; i < MOCK_ATTENDANCE.length; i++) {
            if (MOCK_ATTENDANCE[i].employeeEmail.toLowerCase() === email.toLowerCase()) {
                const session = MOCK_SESSIONS.filter((s) => s.trainingCode === MOCK_ATTENDANCE[i].trainingCode)[0];
                if (session) userDates.push(session.sessionDate);
            }
        }
        return Promise.resolve(calculateStreak(userDates));
    }

    public getLeaderboard(country?: string): Promise<ILeaderboardEntry[]> {
        let filtered = MOCK_ATTENDANCE;
        if (country) {
            filtered = MOCK_ATTENDANCE.filter((a) => a.country === country);
        }

        const branchStats: Record<string, { badges: number; points: number; country: string }> = {};

        for (let i = 0; i < filtered.length; i++) {
            const record = filtered[i];
            if (!branchStats[record.branchUnit]) {
                branchStats[record.branchUnit] = { badges: 0, points: 0, country: record.country };
            }
            branchStats[record.branchUnit].badges++;
            branchStats[record.branchUnit].points += record.points;
        }

        const entries: ILeaderboardEntry[] = [];
        const branchNames = Object.keys(branchStats);
        for (let i = 0; i < branchNames.length; i++) {
            const branch = branchNames[i];
            const stats = branchStats[branch];
            entries.push({
                rank: 0,
                branchUnit: branch,
                country: stats.country,
                totalBadges: stats.badges,
                totalPoints: stats.points,
            });
        }

        entries.sort((a, b) => b.totalPoints - a.totalPoints);
        for (let i = 0; i < entries.length; i++) {
            entries[i].rank = i + 1;
        }

        return Promise.resolve(entries);
    }

    public getCountries(): Promise<string[]> {
        const seen: Record<string, boolean> = {};
        const countries: string[] = [];
        for (let i = 0; i < MOCK_ATTENDANCE.length; i++) {
            const c = MOCK_ATTENDANCE[i].country;
            if (!seen[c]) {
                seen[c] = true;
                countries.push(c);
            }
        }
        return Promise.resolve(countries.sort());
    }

    public getCurrentUserEmail(): string {
        return MOCK_USER_EMAIL;
    }

    public getCurrentUserDisplayName(): string {
        return MOCK_USER_NAME;
    }
}
