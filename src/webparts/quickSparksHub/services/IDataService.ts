import { ILeaderboardEntry } from '../models/ILeaderboardEntry';
import { ISession } from '../models/ISession';
import { IUserBadge } from '../models/IUserBadge';

export interface IDataService {
    getUserBadges(email: string): Promise<IUserBadge[]>;
    getAllSessions(): Promise<ISession[]>;
    getUpcomingSessions(): Promise<ISession[]>;
    getUserAttendanceStreak(email: string): Promise<number>;
    getLeaderboard(country?: string): Promise<ILeaderboardEntry[]>;
    getCountries(): Promise<string[]>;
    getCurrentUserEmail(): string;
    getCurrentUserDisplayName(): string;
}
