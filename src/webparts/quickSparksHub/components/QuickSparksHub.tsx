import * as React from 'react';
import { IUserBadge } from '../models/IUserBadge';
import { IDataService } from '../services/IDataService';
import { countEarnedBadges } from '../utils/badgeUtils';
import { TabId } from '../utils/constants';
import ErrorBoundary from './common/ErrorBoundary/ErrorBoundary';
import Header from './common/Header/Header';
import TabNav from './common/TabNav/TabNav';
import styles from './QuickSparksHub.module.scss';

interface IQuickSparksHubProps {
    dataService: IDataService;
}

interface IQuickSparksHubState {
    activeTab: TabId;
    badges: IUserBadge[];
    streak: number;
    loading: boolean;
}

export default class QuickSparksHub extends React.Component<IQuickSparksHubProps, IQuickSparksHubState> {
    constructor(props: IQuickSparksHubProps) {
        super(props);
        this.state = {
            activeTab: 'My Badges',
            badges: [],
            streak: 0,
            loading: true,
        };
    }

    public componentDidMount(): void {
        this.loadData().catch(() => {
            this.setState({ loading: false });
        });
    }

    private async loadData(): Promise<void> {
        const { dataService } = this.props;
        const email = dataService.getCurrentUserEmail();
        const [badges, streak] = await Promise.all([
            dataService.getUserBadges(email),
            dataService.getUserAttendanceStreak(email),
        ]);
        this.setState({ badges, streak, loading: false });
    }

    public render(): React.ReactElement<IQuickSparksHubProps> {
        const { dataService } = this.props;
        const { activeTab, badges, streak } = this.state;
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
                        {activeTab === 'My Badges' && <div>badges view placeholder</div>}
                        {activeTab === 'Upcoming' && <div>upcoming sessions placeholder</div>}
                        {activeTab === 'Leaderboard' && <div>leaderboard placeholder</div>}
                    </div>
                </main>
            </ErrorBoundary>
        );
    }
}
