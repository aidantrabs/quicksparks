import * as React from 'react';
import styles from './Header.module.scss';

interface IHeaderProps {
    displayName: string;
    badgesEarned: number;
    badgesTotal: number;
    streak: number;
}

const Header: React.FC<IHeaderProps> = ({ displayName, badgesEarned, badgesTotal, streak }) => {
    const firstName = displayName.split(' ')[0];

    return (
        <header className={styles.header}>
            <h1 className={styles.greeting}>Welcome back, {firstName}</h1>
            <div className={styles.statsRow}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>
                        {badgesEarned}/{badgesTotal}
                    </span>
                    <span className={styles.statLabel}>badges earned</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValueAccent}>{streak}</span>
                    <span className={styles.statLabel}>session streak</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
