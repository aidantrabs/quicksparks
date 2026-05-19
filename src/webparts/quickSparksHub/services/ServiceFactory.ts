import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IFlowConfig } from '../config/flowConfig';
import { FlowDataService } from './FlowDataService';
import { IDataService } from './IDataService';
import { MockDataService } from './MockDataService';

export function createDataService(
    useMockData: boolean,
    context: WebPartContext | null,
    flowConfig?: IFlowConfig,
): IDataService {
    if (useMockData || !context) {
        return new MockDataService();
    }

    if (!flowConfig?.flowUrl) {
        throw new Error(
            'Flow URL not configured. Open the web part property pane and paste the Power Automate flow trigger URL.',
        );
    }

    return new FlowDataService(context, flowConfig);
}
