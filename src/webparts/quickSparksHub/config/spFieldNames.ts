export const SP_LISTS = {
    sessions: 'QuickSparksSessions',
    attendance: 'QuickSparksAttendance',
} as const;

export const SP_SESSION_FIELDS = {
    id: 'ID',
    title: 'Title',
    sessionDate: 'SessionDate',
    description: 'Description',
    badgeImageUrl: 'BadgeImageUrl',
    category: 'Category',
} as const;

export const SP_ATTENDANCE_FIELDS = {
    sessionId: 'SessionIdId',
    employeeEmail: 'EmployeeEmail',
    employeeName: 'EmployeeName',
    attendedDate: 'AttendedDate',
    division: 'Division',
} as const;
