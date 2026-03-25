export const SP_LISTS = {
    sessions: 'QuickSparksSessions',
    attendance: 'QuickSparksAttendance',
} as const;

export const SP_SESSION_FIELDS = {
    id: 'ID',
    title: 'Title',
    trainingCode: 'TrainingCode',
    sessionDate: 'SessionDate',
    skillStudio: 'SkillStudio',
    category: 'CategoryOfTraining',
    country: 'Country',
} as const;

export const SP_ATTENDANCE_FIELDS = {
    sessionId: 'SessionIdId',
    trainingCode: 'TrainingCode',
    employeeNumber: 'EmployeeNumber',
    employeeEmail: 'EmailAddress',
    employeeName: 'Title',
    branchUnit: 'BranchUnit',
    country: 'Country',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
} as const;
