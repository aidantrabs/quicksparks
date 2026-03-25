export type BadgeTier = 'none' | 'bronze' | 'silver' | 'gold';

export interface ISession {
    id: number;
    trainingCode: string;
    title: string;
    sessionDate: Date;
    skillStudio: string;
    category: string;
    country: string;
    isUpcoming: boolean;
}
