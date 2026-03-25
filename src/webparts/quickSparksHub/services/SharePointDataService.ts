import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI } from '@pnp/sp';
import { SP_ATTENDANCE_FIELDS, SP_LISTS, SP_SESSION_FIELDS } from '../config/spFieldNames';
import { IAttendance } from '../models/IAttendance';
import { ILeaderboardEntry } from '../models/ILeaderboardEntry';
import { BadgeTier, ISession } from '../models/ISession';
import { IUserBadge } from '../models/IUserBadge';
import { deriveUserBadges } from '../utils/badgeUtils';
import { calculateStreak, isUpcoming } from '../utils/dateUtils';
import { IDataService } from './IDataService';

export class SharePointDataService implements IDataService {
    private _sp: SPFI;
    private _context: WebPartContext;

    constructor(sp: SPFI, context: WebPartContext) {
        this._sp = sp;
        this._context = context;
    }

    public async getAllSessions(): Promise<ISession[]> {
        const items = await this._sp.web.lists
            .getByTitle(SP_LISTS.sessions)
            .items.select(
                SP_SESSION_FIELDS.id,
                SP_SESSION_FIELDS.title,
                SP_SESSION_FIELDS.trainingCode,
                SP_SESSION_FIELDS.sessionDate,
                SP_SESSION_FIELDS.skillStudio,
                SP_SESSION_FIELDS.category,
                SP_SESSION_FIELDS.country,
            )
            .orderBy(SP_SESSION_FIELDS.sessionDate, true)();

        return items.map((item: Record<string, string | number>) => ({
            id: item[SP_SESSION_FIELDS.id] as number,
            trainingCode: (item[SP_SESSION_FIELDS.trainingCode] as string) || '',
            title: (item[SP_SESSION_FIELDS.title] as string) || '',
            sessionDate: new Date(item[SP_SESSION_FIELDS.sessionDate] as string),
            skillStudio: (item[SP_SESSION_FIELDS.skillStudio] as string) || '',
            category: (item[SP_SESSION_FIELDS.category] as string) || '',
            country: (item[SP_SESSION_FIELDS.country] as string) || '',
            isUpcoming: isUpcoming(new Date(item[SP_SESSION_FIELDS.sessionDate] as string)),
        }));
    }

    public async getUpcomingSessions(): Promise<ISession[]> {
        const all = await this.getAllSessions();
        return all.filter((s) => s.isUpcoming);
    }

    public async getUserBadges(email: string): Promise<IUserBadge[]> {
        const [sessions, attendance] = await Promise.all([this.getAllSessions(), this.getAttendance()]);
        return deriveUserBadges(sessions, attendance, email);
    }

    public async getUserAttendanceStreak(email: string): Promise<number> {
        const [sessions, attendance] = await Promise.all([this.getAllSessions(), this.getAttendance()]);
        const sessionMap: Record<string, ISession> = {};
        for (let i = 0; i < sessions.length; i++) {
            sessionMap[sessions[i].trainingCode] = sessions[i];
        }
        const userDates: Date[] = [];
        for (let i = 0; i < attendance.length; i++) {
            if (attendance[i].employeeEmail.toLowerCase() === email.toLowerCase()) {
                const session = sessionMap[attendance[i].trainingCode];
                if (session) userDates.push(session.sessionDate);
            }
        }
        return calculateStreak(userDates);
    }

    public async getLeaderboard(country?: string): Promise<ILeaderboardEntry[]> {
        const attendance = await this.getAttendance();
        let filtered = attendance;
        if (country) {
            filtered = attendance.filter((a) => a.country === country);
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

        return entries;
    }

    public async getCountries(): Promise<string[]> {
        const attendance = await this.getAttendance();
        const seen: Record<string, boolean> = {};
        const countries: string[] = [];
        for (let i = 0; i < attendance.length; i++) {
            const c = attendance[i].country;
            if (c && !seen[c]) {
                seen[c] = true;
                countries.push(c);
            }
        }
        return countries.sort();
    }

    public getCurrentUserEmail(): string {
        return this._context.pageContext.user.loginName;
    }

    public getCurrentUserDisplayName(): string {
        return this._context.pageContext.user.displayName;
    }

    private determineTier(item: Record<string, string | number>): BadgeTier {
        if (item[SP_ATTENDANCE_FIELDS.gold]) return 'gold';
        if (item[SP_ATTENDANCE_FIELDS.silver]) return 'silver';
        if (item[SP_ATTENDANCE_FIELDS.bronze]) return 'bronze';
        return 'none';
    }

    private tierPoints(tier: BadgeTier): number {
        if (tier === 'gold') return 30;
        if (tier === 'silver') return 20;
        if (tier === 'bronze') return 10;
        return 0;
    }

    private async getAttendance(): Promise<IAttendance[]> {
        const items = await this._sp.web.lists
            .getByTitle(SP_LISTS.attendance)
            .items.select(
                SP_ATTENDANCE_FIELDS.sessionId,
                SP_ATTENDANCE_FIELDS.trainingCode,
                SP_ATTENDANCE_FIELDS.employeeNumber,
                SP_ATTENDANCE_FIELDS.employeeEmail,
                SP_ATTENDANCE_FIELDS.employeeName,
                SP_ATTENDANCE_FIELDS.branchUnit,
                SP_ATTENDANCE_FIELDS.country,
                SP_ATTENDANCE_FIELDS.bronze,
                SP_ATTENDANCE_FIELDS.silver,
                SP_ATTENDANCE_FIELDS.gold,
            )();

        return items
            .map((item: Record<string, string | number>) => {
                const tier = this.determineTier(item);
                return {
                    sessionId: (item[SP_ATTENDANCE_FIELDS.sessionId] as number) || 0,
                    trainingCode: (item[SP_ATTENDANCE_FIELDS.trainingCode] as string) || '',
                    employeeNumber: String(item[SP_ATTENDANCE_FIELDS.employeeNumber] || ''),
                    employeeEmail: (item[SP_ATTENDANCE_FIELDS.employeeEmail] as string) || '',
                    employeeName: (item[SP_ATTENDANCE_FIELDS.employeeName] as string) || '',
                    branchUnit: (item[SP_ATTENDANCE_FIELDS.branchUnit] as string) || '',
                    country: (item[SP_ATTENDANCE_FIELDS.country] as string) || '',
                    tier: tier,
                    points: this.tierPoints(tier),
                };
            })
            .filter((a: IAttendance) => a.tier !== 'none');
    }
}
