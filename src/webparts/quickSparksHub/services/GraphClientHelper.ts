import { MSGraphClientV3 } from '@microsoft/sp-http-msgraph';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IExcelRange {
    values: (string | number | boolean | null)[][];
}

export class GraphClientHelper {
    private _client: MSGraphClientV3 | null = null;
    private _context: WebPartContext;

    constructor(context: WebPartContext) {
        this._context = context;
    }

    private async getClient(): Promise<MSGraphClientV3> {
        if (!this._client) {
            this._client = await this._context.msGraphClientFactory.getClient('3');
        }
        return this._client;
    }

    public async getWorksheetData(
        siteUrl: string,
        libraryName: string,
        fileName: string,
        worksheetName: string,
    ): Promise<IExcelRange> {
        const client = await this.getClient();

        const siteId = await this.resolveSiteId(client, siteUrl);
        const driveId = await this.resolveDriveId(client, siteId, libraryName);
        const itemId = await this.resolveFileItemId(client, driveId, fileName);

        const encodedSheet = encodeURIComponent(worksheetName);
        const response = await client
            .api(`/drives/${driveId}/items/${itemId}/workbook/worksheets('${encodedSheet}')/usedRange`)
            .version('v1.0')
            .get();

        return { values: response.values || [] };
    }

    private async resolveSiteId(client: MSGraphClientV3, siteUrl: string): Promise<string> {
        const url = new URL(siteUrl);
        const hostname = url.hostname;
        const serverRelativePath = url.pathname;

        const response = await client
            .api(`/sites/${hostname}:${serverRelativePath}`)
            .version('v1.0')
            .select('id')
            .get();

        if (!response?.id) {
            throw new Error(`Could not resolve site ID for ${siteUrl}`);
        }

        return response.id;
    }

    private async resolveDriveId(client: MSGraphClientV3, siteId: string, libraryName: string): Promise<string> {
        const response = await client.api(`/sites/${siteId}/drives`).version('v1.0').select('id,name').get();

        const drives: { id: string; name: string }[] = response?.value || [];
        let driveId = '';
        const available: string[] = [];
        for (let i = 0; i < drives.length; i++) {
            available.push(drives[i].name);
            if (drives[i].name === libraryName) {
                driveId = drives[i].id;
            }
        }

        if (!driveId) {
            throw new Error(
                `Document library "${libraryName}" not found. Available libraries: ${available.join(', ')}`,
            );
        }

        return driveId;
    }

    private async resolveFileItemId(client: MSGraphClientV3, driveId: string, fileName: string): Promise<string> {
        const encodedName = encodeURIComponent(fileName);
        const response = await client.api(`/drives/${driveId}/root:/${encodedName}`).version('v1.0').select('id').get();

        if (!response?.id) {
            throw new Error(`File "${fileName}" not found in the document library`);
        }

        return response.id;
    }
}
