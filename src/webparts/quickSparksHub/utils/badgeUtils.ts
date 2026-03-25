import { IAttendance } from '../models/IAttendance';
import { ISession } from '../models/ISession';
import { IUserBadge } from '../models/IUserBadge';

export function deriveUserBadges(sessions: ISession[], attendance: IAttendance[], userEmail: string): IUserBadge[] {
    const userAttendance: Record<string, IAttendance> = {};
    for (let i = 0; i < attendance.length; i++) {
        const record = attendance[i];
        if (record.employeeEmail.toLowerCase() === userEmail.toLowerCase()) {
            userAttendance[record.trainingCode] = record;
        }
    }

    return sessions.map((session) => {
        const record = userAttendance[session.trainingCode];
        return {
            sessionId: session.id,
            trainingCode: session.trainingCode,
            title: session.title,
            skillStudio: session.skillStudio,
            category: session.category,
            tier: record ? record.tier : 'none',
            points: record ? record.points : 0,
            earnedDate: record ? session.sessionDate : null,
            badgeImageUrl: '',
        };
    });
}

export function countEarnedBadges(badges: IUserBadge[]): number {
    let count = 0;
    for (let i = 0; i < badges.length; i++) {
        if (badges[i].tier !== 'none') count++;
    }
    return count;
}

export function getTotalPoints(badges: IUserBadge[]): number {
    let total = 0;
    for (let i = 0; i < badges.length; i++) {
        total += badges[i].points;
    }
    return total;
}

export function getUniqueSkillStudios(badges: IUserBadge[]): string[] {
    const seen: Record<string, boolean> = {};
    const studios: string[] = [];
    for (let i = 0; i < badges.length; i++) {
        const studio = badges[i].skillStudio;
        if (!seen[studio]) {
            seen[studio] = true;
            studios.push(studio);
        }
    }
    return studios;
}

export function filterBadgesBySkillStudio(badges: IUserBadge[], skillStudio: string): IUserBadge[] {
    return badges.filter((b) => b.skillStudio === skillStudio);
}

export function searchBadges(badges: IUserBadge[], query: string): IUserBadge[] {
    const lower = query.toLowerCase();
    return badges.filter(
        (b) =>
            b.title.toLowerCase().indexOf(lower) !== -1 ||
            b.skillStudio.toLowerCase().indexOf(lower) !== -1 ||
            b.category.toLowerCase().indexOf(lower) !== -1,
    );
}
