import { BadgeTier } from './ISession';

export interface IUserBadge {
    sessionId: number;
    trainingCode: string;
    title: string;
    skillStudio: string;
    category: string;
    tier: BadgeTier;
    points: number;
    earnedDate: Date | null;
    badgeImageUrl: string;
}
