import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { FLOW_RESOURCE, IFlowConfig, TABLE_COLUMNS } from '../config/flowConfig';
import { IAttendance } from '../models/IAttendance';
import { ILeaderboardEntry } from '../models/ILeaderboardEntry';
import { BadgeTier, ISession } from '../models/ISession';
import { IUserBadge } from '../models/IUserBadge';
import { deriveUserBadges } from '../utils/badgeUtils';
import { calculateStreak, isUpcoming } from '../utils/dateUtils';
import { DataCache } from './DataCache';
import { IDataService } from './IDataService';

type CellValue = string | number | boolean | null;
type Row = Record<string, CellValue>;

interface IFlowResponse {
    rows: Row[];
}

interface IParsedData {
    sessions: ISession[];
    attendance: IAttendance[];
}

export class FlowDataService implements IDataService {
    private _context: WebPartContext;
    private _config: IFlowConfig;
    private _cache: DataCache<IParsedData>;
    private _client: AadHttpClient | null = null;

    constructor(context: WebPartContext, config: IFlowConfig) {
        this._context = context;
        this._config = config;
        this._cache = new DataCache<IParsedData>(5 * 60 * 1000);
    }

    public async getUserBadges(email: string): Promise<IUserBadge[]> {
        const { sessions, attendance } = await this.getParsedData();
        return deriveUserBadges(sessions, attendance, email);
    }

    public async getAllSessions(): Promise<ISession[]> {
        const { sessions } = await this.getParsedData();
        return sessions;
    }

    public async getUpcomingSessions(): Promise<ISession[]> {
        const { sessions } = await this.getParsedData();
        return sessions.filter((s) => s.isUpcoming);
    }

    public async getUserAttendanceStreak(email: string): Promise<number> {
        const { sessions, attendance } = await this.getParsedData();

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
        const { attendance } = await this.getParsedData();

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
        const { attendance } = await this.getParsedData();

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

    private async getParsedData(): Promise<IParsedData> {
        return this._cache.get(async () => {
            const rows = await this.fetchRows();
            return this.parseRows(rows);
        });
    }

    private async fetchRows(): Promise<Row[]> {
        const client = await this.getClient();
        const response: HttpClientResponse = await client.post(this._config.flowUrl, AadHttpClient.configurations.v1, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Flow request failed (${response.status}): ${text}`);
        }

        const payload: IFlowResponse = await response.json();
        if (!payload || !Array.isArray(payload.rows)) {
            throw new Error('Flow response missing "rows" array. Check the flow Response action body.');
        }
        return payload.rows;
    }

    private async getClient(): Promise<AadHttpClient> {
        if (!this._client) {
            this._client = await this._context.aadHttpClientFactory.getClient(FLOW_RESOURCE);
        }
        return this._client;
    }

    private parseRows(rows: Row[]): IParsedData {
        const sessionMap: Record<string, ISession> = {};
        const attendance: IAttendance[] = [];
        let sessionIdCounter = 1;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const trainingCode = this.cellString(row[TABLE_COLUMNS.trainingCode]);
            if (!trainingCode) continue;

            const tier = this.determineTier(row);
            if (tier === 'none') continue;

            const sessionDate = this.parseDate(row[TABLE_COLUMNS.sessionDate]);

            if (!sessionMap[trainingCode]) {
                sessionMap[trainingCode] = {
                    id: sessionIdCounter++,
                    trainingCode: trainingCode,
                    title: this.cellString(row[TABLE_COLUMNS.sessionName]),
                    sessionDate: sessionDate,
                    skillStudio: this.cellString(row[TABLE_COLUMNS.skillStudio]),
                    category: this.cellString(row[TABLE_COLUMNS.category]),
                    country: this.cellString(row[TABLE_COLUMNS.country]),
                    isUpcoming: isUpcoming(sessionDate),
                };
            }

            const firstName = this.cellString(row[TABLE_COLUMNS.firstName]);
            const lastName = this.cellString(row[TABLE_COLUMNS.lastName]);

            attendance.push({
                sessionId: sessionMap[trainingCode].id,
                trainingCode: trainingCode,
                employeeNumber: this.cellString(row[TABLE_COLUMNS.employeeNumber]),
                employeeEmail: this.cellString(row[TABLE_COLUMNS.email]),
                employeeName: `${firstName} ${lastName}`.trim(),
                branchUnit: this.cellString(row[TABLE_COLUMNS.branchUnit]),
                country: this.cellString(row[TABLE_COLUMNS.country]),
                tier: tier,
                points: this.tierPoints(tier),
            });
        }

        const sessions: ISession[] = [];
        const sessionKeys = Object.keys(sessionMap);
        for (let i = 0; i < sessionKeys.length; i++) {
            sessions.push(sessionMap[sessionKeys[i]]);
        }
        sessions.sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime());

        return { sessions, attendance };
    }

    private determineTier(row: Row): BadgeTier {
        if (this.isTruthy(row[TABLE_COLUMNS.gold])) return 'gold';
        if (this.isTruthy(row[TABLE_COLUMNS.silver])) return 'silver';
        if (this.isTruthy(row[TABLE_COLUMNS.bronze])) return 'bronze';
        return 'none';
    }

    private tierPoints(tier: BadgeTier): number {
        if (tier === 'gold') return 30;
        if (tier === 'silver') return 20;
        if (tier === 'bronze') return 10;
        return 0;
    }

    private parseDate(value: CellValue): Date {
        if (typeof value === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            return new Date(excelEpoch.getTime() + value * 86400000);
        }
        if (typeof value === 'string' && value) {
            const parsed = new Date(value);
            // biome-ignore lint/suspicious/noGlobalIsNan: Number.isNaN unavailable in ES5 target
            if (!isNaN(parsed.getTime())) return parsed;
        }
        return new Date(0);
    }

    private cellString(value: CellValue): string {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    }

    private isTruthy(value: CellValue): boolean {
        if (value === null || value === undefined) return false;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;
        const s = String(value).trim().toLowerCase();
        return s !== '' && s !== 'false' && s !== '0' && s !== 'no';
    }
}
