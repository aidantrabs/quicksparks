import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneTextField, PropertyPaneToggle } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPFI, SPFx, spfi } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import QuickSparksHub from './components/QuickSparksHub';
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
    private _sp: SPFI | null = null;

    protected onInit(): Promise<void> {
        this._sp = spfi().using(SPFx(this.context));
        this._dataService = createDataService(this.properties.useMockData !== false, this._sp, this.context);
        return Promise.resolve();
    }

    public render(): void {
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
