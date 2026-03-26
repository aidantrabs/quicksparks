import * as React from 'react';
import { ISession } from '../../../models/ISession';
import { stripStudioPrefix } from '../../../utils/badgeUtils';
import styles from './SessionCard.module.scss';

const SHORT_MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

interface ISessionCardProps {
    session: ISession;
}

const SessionCard: React.FC<ISessionCardProps> = ({ session }) => {
    const month = SHORT_MONTHS[session.sessionDate.getMonth()];
    const day = session.sessionDate.getDate();

    return (
        <article className={styles.card}>
            <div className={styles.dateBlock}>
                <span className={styles.dateMonth}>{month}</span>
                <span className={styles.dateDay}>{day}</span>
            </div>
            <div className={styles.body}>
                <h3 className={styles.title}>{session.title}</h3>
                <div className={styles.meta}>
                    <span className={styles.studioPill}>{stripStudioPrefix(session.skillStudio)}</span>
                    <span className={styles.categoryPill}>{session.category}</span>
                </div>
            </div>
        </article>
    );
};

export default SessionCard;
