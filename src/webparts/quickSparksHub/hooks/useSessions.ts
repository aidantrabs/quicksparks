import * as React from 'react';
import { ISession } from '../models/ISession';
import { IDataService } from '../services/IDataService';

interface IUseSessionsResult {
    sessions: ISession[];
    loading: boolean;
    error: string | null;
}

export function useSessions(dataService: IDataService): IUseSessionsResult {
    const [sessions, setSessions] = React.useState<ISession[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        dataService
            .getUpcomingSessions()
            .then((result) => {
                if (!cancelled) {
                    setSessions(result);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError('failed to load sessions');
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [dataService]);

    return { sessions, loading, error };
}
