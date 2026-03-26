import * as React from 'react';
import { ILeaderboardEntry } from '../models/ILeaderboardEntry';
import { ISession } from '../models/ISession';
import { IUserBadge } from '../models/IUserBadge';
import { IDataService } from '../services/IDataService';
import { countEarnedBadges } from '../utils/badgeUtils';
import { TabId } from '../utils/constants';
import AttendanceStreak from './AttendanceStreak/AttendanceStreak';
import BadgeDashboard from './BadgeDashboard/BadgeDashboard';
import ErrorBoundary from './common/ErrorBoundary/ErrorBoundary';
import Header from './common/Header/Header';
import TabNav from './common/TabNav/TabNav';
import Leaderboard from './Leaderboard/Leaderboard';
import styles from './QuickSparksHub.module.scss';
import UpcomingSessions from './UpcomingSessions/UpcomingSessions';

interface IQuickSparksHubProps {
    dataService: IDataService;
}

interface IQuickSparksHubState {
    activeTab: TabId;
    badges: IUserBadge[];
    badgesLoading: boolean;
    badgesError: string | null;
    sessions: ISession[];
    sessionsLoading: boolean;
    sessionsError: string | null;
    streak: number;
    streakLoading: boolean;
    leaderboard: ILeaderboardEntry[];
    leaderboardLoading: boolean;
    leaderboardError: string | null;
}

export default class QuickSparksHub extends React.Component<IQuickSparksHubProps, IQuickSparksHubState> {
    constructor(props: IQuickSparksHubProps) {
        super(props);
        this.state = {
            activeTab: 'My Badges',
            badges: [],
            badgesLoading: true,
            badgesError: null,
            sessions: [],
            sessionsLoading: true,
            sessionsError: null,
            streak: 0,
            streakLoading: true,
            leaderboard: [],
            leaderboardLoading: true,
            leaderboardError: null,
        };
    }

    public componentDidMount(): void {
        this.loadData();
    }

    private loadData(): void {
        const { dataService } = this.props;
        const email = dataService.getCurrentUserEmail();

        dataService
            .getUserBadges(email)
            .then((badges) => this.setState({ badges, badgesLoading: false }))
            .catch(() => this.setState({ badgesError: 'failed to load badges', badgesLoading: false }));

        dataService
            .getUpcomingSessions()
            .then((sessions) => this.setState({ sessions, sessionsLoading: false }))
            .catch(() => this.setState({ sessionsError: 'failed to load sessions', sessionsLoading: false }));

        dataService
            .getUserAttendanceStreak(email)
            .then((streak) => this.setState({ streak, streakLoading: false }))
            .catch(() => this.setState({ streakLoading: false }));

        dataService
            .getLeaderboard()
            .then((leaderboard) => this.setState({ leaderboard, leaderboardLoading: false }))
            .catch(() => this.setState({ leaderboardError: 'failed to load leaderboard', leaderboardLoading: false }));
    }

    public render(): React.ReactElement<IQuickSparksHubProps> {
        const { dataService } = this.props;
        const {
            activeTab,
            badges,
            badgesLoading,
            badgesError,
            sessions,
            sessionsLoading,
            sessionsError,
            streak,
            streakLoading,
            leaderboard,
            leaderboardLoading,
            leaderboardError,
        } = this.state;
        const displayName = dataService.getCurrentUserDisplayName();
        const earned = countEarnedBadges(badges);

        return (
            <ErrorBoundary>
                <main className={styles.root}>
                    <Header
                        displayName={displayName}
                        badgesEarned={earned}
                        badgesTotal={badges.length}
                        streak={streak}
                    />
                    <TabNav activeTab={activeTab} onTabChange={(tab) => this.setState({ activeTab: tab })} />
                    <div className={styles.content} role="tabpanel" aria-label={activeTab}>
                        {activeTab === 'My Badges' && (
                            <BadgeDashboard badges={badges} loading={badgesLoading} error={badgesError} />
                        )}
                        {activeTab === 'Upcoming' && (
                            <>
                                <AttendanceStreak streak={streak} loading={streakLoading} />
                                <UpcomingSessions sessions={sessions} loading={sessionsLoading} error={sessionsError} />
                            </>
                        )}
                        {activeTab === 'Leaderboard' && (
                            <Leaderboard entries={leaderboard} loading={leaderboardLoading} error={leaderboardError} />
                        )}
                    </div>
                </main>
            </ErrorBoundary>
        );
    }
}
