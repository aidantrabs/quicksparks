import * as React from 'react';
import Skeleton from '../common/Skeleton/Skeleton';
import styles from './AttendanceStreak.module.scss';

interface IAttendanceStreakProps {
    streak: number;
    loading: boolean;
}

const AttendanceStreak: React.FC<IAttendanceStreakProps> = ({ streak, loading }) => {
    const [displayCount, setDisplayCount] = React.useState(0);

    React.useEffect(() => {
        if (loading || streak === 0) return;

        let current = 0;
        const step = Math.max(1, Math.floor(streak / 20));
        const interval = setInterval(() => {
            current += step;
            if (current >= streak) {
                current = streak;
                clearInterval(interval);
            }
            setDisplayCount(current);
        }, 50);

        return () => clearInterval(interval);
    }, [streak, loading]);

    if (loading) {
        return (
            <div className={styles.container}>
                <Skeleton width="80px" height="72px" borderRadius="8px" />
                <Skeleton width="200px" height="22px" />
            </div>
        );
    }

    const message =
        streak >= 5
            ? "you're on fire! keep the momentum going."
            : streak >= 3
              ? 'great consistency! a few more and you will be unstoppable.'
              : streak >= 1
                ? "you've started a streak! attend the next session to keep it alive."
                : 'attend your first quicksparks session to start your streak!';

    return (
        <div className={styles.container} aria-live="polite">
            <span className={styles.counter} role="status" aria-label={`${streak} session streak`}>
                {displayCount}
            </span>
            <span className={styles.label}>consecutive sessions</span>
            <p className={styles.message}>{message}</p>
        </div>
    );
};

export default AttendanceStreak;
