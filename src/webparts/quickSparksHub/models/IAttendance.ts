import { BadgeTier } from './ISession';

export interface IAttendance {
    sessionId: number;
    trainingCode: string;
    employeeNumber: string;
    employeeEmail: string;
    employeeName: string;
    branchUnit: string;
    country: string;
    tier: BadgeTier;
    points: number;
}
