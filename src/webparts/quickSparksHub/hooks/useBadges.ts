import * as React from 'react';
import { IUserBadge } from '../models/IUserBadge';
import { IDataService } from '../services/IDataService';

interface IUseBadgesResult {
    badges: IUserBadge[];
    loading: boolean;
    error: string | null;
}

export function useBadges(dataService: IDataService): IUseBadgesResult {
    const [badges, setBadges] = React.useState<IUserBadge[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        const email = dataService.getCurrentUserEmail();

        dataService
            .getUserBadges(email)
            .then((result) => {
                if (!cancelled) {
                    setBadges(result);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError('failed to load badges');
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [dataService]);

    return { badges, loading, error };
}
