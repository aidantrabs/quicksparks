import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IExcelConfig } from '../config/excelConfig';
import { ExcelDataService } from './ExcelDataService';
import { IDataService } from './IDataService';
import { MockDataService } from './MockDataService';

export function createDataService(
    useMockData: boolean,
    context: WebPartContext | null,
    excelConfig?: IExcelConfig,
): IDataService {
    if (useMockData || !context) {
        return new MockDataService();
    }

    if (!excelConfig?.siteUrl || !excelConfig?.libraryName || !excelConfig?.fileName) {
        throw new Error(
            'Excel file location not configured. Open the web part property pane and set the site URL, library name, and file name.',
        );
    }

    return new ExcelDataService(context, excelConfig);
}
