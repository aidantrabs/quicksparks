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
import type { IFlowConfig } from './config/flowConfig';
import { IDataService } from './services/IDataService';
import { createDataService } from './services/ServiceFactory';

export interface IQuickSparksHubWebPartProps {
    useMockData: boolean;
    flowUrl: string;
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
                this.getFlowConfig(),
            );
        } catch (err) {
            this._initError = err instanceof Error ? err.message : String(err);
            this._dataService = null;
            console.error('QuickSparksHub: failed to initialize data service', err);
        }
    }

    private getFlowConfig(): IFlowConfig {
        return {
            flowUrl: this.properties.flowUrl || '',
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
                                    offText: 'Live data',
                                }),
                            ],
                        },
                        {
                            groupName: 'Power Automate Flow',
                            groupFields: [
                                PropertyPaneTextField('flowUrl', {
                                    label: 'Flow trigger URL',
                                    description:
                                        'Paste the HTTP trigger URL from the QuickSparks data flow in Power Automate.',
                                    multiline: true,
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
