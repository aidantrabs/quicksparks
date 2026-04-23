import { Version } from '@microsoft/sp-core-library';
import {
    type IPropertyPaneConfiguration,
    PropertyPaneTextField,
    PropertyPaneToggle,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import QuickSparksHub from './components/QuickSparksHub';
import type { IExcelConfig } from './config/excelConfig';
import { IDataService } from './services/IDataService';
import { createDataService } from './services/ServiceFactory';

export interface IQuickSparksHubWebPartProps {
    useMockData: boolean;
    excelSiteUrl: string;
    excelLibraryName: string;
    excelFileName: string;
}

export default class QuickSparksHubWebPart extends BaseClientSideWebPart<IQuickSparksHubWebPartProps> {
    private _dataService: IDataService | null = null;
    private _initError: string | null = null;

    protected onInit(): Promise<void> {
        this.initDataService();
        return Promise.resolve();
    }

    protected onPropertyPaneFieldChanged(): void {
        this.initDataService();
        this.render();
    }

    private initDataService(): void {
        try {
            this._initError = null;
            this._dataService = createDataService(
                this.properties.useMockData === true,
                this.context,
                this.getExcelConfig(),
            );
        } catch (err) {
            this._initError = err instanceof Error ? err.message : String(err);
            this._dataService = null;
            console.error('QuickSparksHub: failed to initialize data service', err);
        }
    }

    private getExcelConfig(): IExcelConfig {
        return {
            siteUrl: this.properties.excelSiteUrl || '',
            libraryName: this.properties.excelLibraryName || '',
            fileName: this.properties.excelFileName || '',
        };
    }

    public render(): void {
        if (this._initError) {
            this.domElement.innerHTML = `<div style="padding:20px;color:#a80000;">
                <strong>QuickSparks Hub configuration error:</strong><br/>${this._initError}
            </div>`;
            return;
        }

        if (!this._dataService) {
            return;
        }

        const element = React.createElement(QuickSparksHub, {
            dataService: this._dataService,
        });

        ReactDom.render(element, this.domElement);
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    header: {
                        description: 'QuickSparks Hub Settings',
                    },
                    groups: [
                        {
                            groupName: 'Data Source',
                            groupFields: [
                                PropertyPaneToggle('useMockData', {
                                    label: 'Use mock data',
                                    onText: 'Mock data',
                                    offText: 'Excel data',
                                }),
                            ],
                        },
                        {
                            groupName: 'Excel File Location',
                            groupFields: [
                                PropertyPaneTextField('excelSiteUrl', {
                                    label: 'SharePoint site URL',
                                    description: 'e.g. https://tenant.sharepoint.com/sites/LTDC',
                                }),
                                PropertyPaneTextField('excelLibraryName', {
                                    label: 'Document library name',
                                    description: 'e.g. Shared Documents',
                                }),
                                PropertyPaneTextField('excelFileName', {
                                    label: 'Excel file name',
                                    description: 'e.g. QuickSparks Training Tracker.xlsx',
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
