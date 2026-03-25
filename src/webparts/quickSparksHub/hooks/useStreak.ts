import * as React from 'react';
import { IDataService } from '../services/IDataService';

interface IUseStreakResult {
    streak: number;
    loading: boolean;
}

export function useStreak(dataService: IDataService): IUseStreakResult {
    const [streak, setStreak] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let cancelled = false;
        const email = dataService.getCurrentUserEmail();

        dataService
            .getUserAttendanceStreak(email)
            .then((result) => {
                if (!cancelled) {
                    setStreak(result);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [dataService]);

    return { streak, loading };
}
