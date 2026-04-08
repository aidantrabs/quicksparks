import { WebPartContext } from '@microsoft/sp-webpart-base';
import { EXCEL_COLUMNS, EXCEL_WORKSHEET, IExcelConfig } from '../config/excelConfig';
import { IAttendance } from '../models/IAttendance';
import { ILeaderboardEntry } from '../models/ILeaderboardEntry';
import { BadgeTier, ISession } from '../models/ISession';
import { IUserBadge } from '../models/IUserBadge';
import { deriveUserBadges } from '../utils/badgeUtils';
import { calculateStreak, isUpcoming } from '../utils/dateUtils';
import { DataCache } from './DataCache';
import { GraphClientHelper } from './GraphClientHelper';
import { IDataService } from './IDataService';

interface IParsedExcelData {
    sessions: ISession[];
    attendance: IAttendance[];
}

type CellValue = string | number | boolean | null;

export class ExcelDataService implements IDataService {
    private _context: WebPartContext;
    private _graphHelper: GraphClientHelper;
    private _cache: DataCache<IParsedExcelData>;
    private _config: IExcelConfig;

    constructor(context: WebPartContext, config: IExcelConfig) {
        this._context = context;
        this._graphHelper = new GraphClientHelper(context);
        this._cache = new DataCache<IParsedExcelData>(5 * 60 * 1000);
        this._config = config;
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

    private async getParsedData(): Promise<IParsedExcelData> {
        return this._cache.get(async () => {
            const range = await this._graphHelper.getWorksheetData(
                this._config.siteUrl,
                this._config.libraryName,
                this._config.fileName,
                EXCEL_WORKSHEET,
            );
            return this.parseExcelData(range.values);
        });
    }

    private parseExcelData(rows: CellValue[][]): IParsedExcelData {
        const headerRowIndex = this.findHeaderRow(rows);
        const headers = rows[headerRowIndex].map((v) => (v ? String(v).trim() : ''));
        const colIndex = this.buildColumnIndex(headers);

        const sessionMap: Record<string, ISession> = {};
        const attendance: IAttendance[] = [];
        let sessionIdCounter = 1;

        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            const trainingCode = this.cellString(row[colIndex.trainingCode]);
            if (!trainingCode) continue;

            const tier = this.determineTier(row, colIndex);
            if (tier === 'none') continue;

            const sessionDate = this.parseDate(row[colIndex.sessionDate]);

            if (!sessionMap[trainingCode]) {
                sessionMap[trainingCode] = {
                    id: sessionIdCounter++,
                    trainingCode: trainingCode,
                    title: this.cellString(row[colIndex.sessionName]),
                    sessionDate: sessionDate,
                    skillStudio: this.cellString(row[colIndex.skillStudio]),
                    category: this.cellString(row[colIndex.category]),
                    country: this.cellString(row[colIndex.country]),
                    isUpcoming: isUpcoming(sessionDate),
                };
            }

            const firstName = this.cellString(row[colIndex.firstName]);
            const lastName = this.cellString(row[colIndex.lastName]);

            attendance.push({
                sessionId: sessionMap[trainingCode].id,
                trainingCode: trainingCode,
                employeeNumber: this.cellString(row[colIndex.employeeNumber]),
                employeeEmail: this.cellString(row[colIndex.email]),
                employeeName: `${firstName} ${lastName}`.trim(),
                branchUnit: this.cellString(row[colIndex.branchUnit]),
                country: this.cellString(row[colIndex.country]),
                tier: tier,
                points: this.tierPoints(tier),
            });
        }

        const sessions = Object.values(sessionMap);
        sessions.sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime());

        return { sessions, attendance };
    }

    private findHeaderRow(rows: CellValue[][]): number {
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
            const row = rows[i];
            if (!row) continue;
            for (let j = 0; j < row.length; j++) {
                if (row[j] && String(row[j]).trim() === EXCEL_COLUMNS.trainingCode) {
                    return i;
                }
            }
        }
        throw new Error(
            `Could not find header row. Expected a row containing "${EXCEL_COLUMNS.trainingCode}" within the first 10 rows of the "${EXCEL_WORKSHEET}" sheet.`,
        );
    }

    private buildColumnIndex(
        headers: string[],
    ): Record<keyof typeof EXCEL_COLUMNS, number> {
        const index: Record<string, number> = {};

        for (const [key, expectedHeader] of Object.entries(EXCEL_COLUMNS)) {
            const col = headers.findIndex((h) => h === expectedHeader);
            if (col === -1) {
                throw new Error(
                    `Required column "${expectedHeader}" not found in the "${EXCEL_WORKSHEET}" sheet. ` +
                        `Available columns: ${headers.filter((h) => h).join(', ')}`,
                );
            }
            index[key] = col;
        }

        return index as Record<keyof typeof EXCEL_COLUMNS, number>;
    }

    private determineTier(row: CellValue[], colIndex: Record<keyof typeof EXCEL_COLUMNS, number>): BadgeTier {
        if (row[colIndex.gold]) return 'gold';
        if (row[colIndex.silver]) return 'silver';
        if (row[colIndex.bronze]) return 'bronze';
        return 'none';
    }

    private tierPoints(tier: BadgeTier): number {
        if (tier === 'gold') return 30;
        if (tier === 'silver') return 20;
        if (tier === 'bronze') return 10;
        return 0;
    }

    private parseDate(value: CellValue): Date {
        if (value instanceof Date) return value;
        if (typeof value === 'number') {
            // Excel serial date number: days since 1899-12-30
            const excelEpoch = new Date(1899, 11, 30);
            return new Date(excelEpoch.getTime() + value * 86400000);
        }
        if (typeof value === 'string' && value) {
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) return parsed;
        }
        return new Date(0);
    }

    private cellString(value: CellValue): string {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    }
}
