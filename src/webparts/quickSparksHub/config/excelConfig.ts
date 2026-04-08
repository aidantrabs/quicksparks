export interface IExcelConfig {
    siteUrl: string;
    libraryName: string;
    fileName: string;
}

export const EXCEL_WORKSHEET = 'Training Records';

export const EXCEL_COLUMNS = {
    category: 'CATEGORY OF TRAINING',
    sessionDate: 'DATE OF TRAINING',
    skillStudio: 'SKILLS STUDIO',
    trainingCode: 'TRAINING CODE',
    sessionName: 'SESSION NAME',
    employeeNumber: 'EMPLOYEE NUMBER',
    firstName: 'FIRST NAME ',
    lastName: 'LAST NAME',
    email: 'EMAIL ADDRESS',
    branchUnit: 'BRANCH/UNIT',
    country: 'COUNTRY',
    bronze: 'BRONZE',
    silver: 'SILVER',
    gold: 'GOLD',
} as const;
