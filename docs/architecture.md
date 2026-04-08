# Architecture

## Overview

QuickSparks Hub is a single SPFx web part that renders a React application. It follows a layered architecture: the SPFx runtime bootstraps a service layer, which feeds data through React hooks into presentational components.

```mermaid
graph LR
    SPFx[SPFx Runtime] --> WP[QuickSparksHubWebPart]
    WP --> SF[ServiceFactory]
    SF --> DS[IDataService]
    DS --> Hooks[React Hooks]
    Hooks --> UI[Components]
```

> [!NOTE]
> Components never fetch data directly. They receive typed props from hooks, which call the service. This makes every component testable with plain props.

## Component Tree

```mermaid
graph TD
    WP[QuickSparksHubWebPart<br/><i>SPFx entry point</i>]
    WP --> Root[QuickSparksHub<br/><i>root shell</i>]

    Root --> Header[Header<br/><i>greeting · badge count · streak</i>]
    Root --> TabNav[TabNav<br/><i>My Badges · Upcoming · Leaderboard</i>]
    Root --> EB[ErrorBoundary]

    EB --> BD[BadgeDashboard]
    EB --> US[UpcomingSessions]
    EB --> AS[AttendanceStreak]
    EB --> LB[Leaderboard]

    BD --> BC[BadgeCard × N<br/><i>earned / locked states</i>]
    US --> SC[SessionCard × N<br/><i>title · date · category pill</i>]
    LB --> LR[LeaderboardRow × N<br/><i>rank · division · progress bar</i>]

    Root --> Skel[Skeleton<br/><i>shimmer loading</i>]
    Root --> ES[EmptyState<br/><i>no-data fallback</i>]
```

## Data Flow

```mermaid
sequenceDiagram
    participant XL as Excel File<br/>(SharePoint)
    participant Graph as Microsoft Graph API
    participant Cache as DataCache
    participant SVC as ExcelDataService
    participant Comp as Component

    Comp->>SVC: getUserBadges(email)
    SVC->>Cache: getParsedData()
    alt cache miss
        Cache->>Graph: GET /workbook/worksheets('Training Records')/usedRange
        Graph->>XL: read file
        XL-->>Graph: cell values
        Graph-->>Cache: { values: string[][] }
        Cache->>Cache: parse into ISession[] + IAttendance[]
    end
    Cache-->>SVC: { sessions, attendance }
    SVC-->>Comp: IUserBadge[]
```

The Excel file is fetched once via Graph API and cached for 5 minutes. All 4 concurrent service calls on page load share a single fetch through the cache's deduplication logic.

### Service Abstraction

The `IDataService` interface defines the contract. Two implementations exist:

```mermaid
classDiagram
    class IDataService {
        <<interface>>
        +getUserBadges(email) IUserBadge[]
        +getAllSessions() ISession[]
        +getUpcomingSessions() ISession[]
        +getUserAttendanceStreak(email) number
        +getLeaderboard(country?) ILeaderboardEntry[]
        +getCountries() string[]
        +getCurrentUserEmail() string
        +getCurrentUserDisplayName() string
    }

    class MockDataService {
        Static data for dev/demo
    }

    class ExcelDataService {
        Graph API + DataCache
    }

    class ServiceFactory {
        +create(useMockData, context, config) IDataService
    }

    IDataService <|.. MockDataService
    IDataService <|.. ExcelDataService
    ServiceFactory --> IDataService
```

`ServiceFactory` selects the implementation based on the `useMockData` web part property (toggle in the property pane).

> [!TIP]
> Excel column names are mapped in [`config/excelConfig.ts`](../src/webparts/quickSparksHub/config/excelConfig.ts). If L&TDC renames a column, update that file - no component or hook changes needed.

## Hooks

Each data concern has a dedicated hook that manages `loading`, `error`, and `data` state:

| Hook | Service Method | Returns |
|------|---------------|---------|
| `useBadges` | `getUserBadges()` | `IUserBadge[]` |
| `useSessions` | `getUpcomingSessions()` | `ISession[]` |
| `useStreak` | `getUserAttendanceStreak()` | `number` |
| `useLeaderboard` | `getLeaderboard()` | `ILeaderboardEntry[]` |

## Theming

Design tokens are defined in [`config/theme.ts`](../src/webparts/quickSparksHub/config/theme.ts) and mapped to CSS custom properties in `theme.module.scss`:

```mermaid
flowchart LR
    A[theme.ts<br/><i>typed constants</i>] --> B[theme.module.scss<br/><i>CSS custom properties</i>]
    B --> C[*.module.scss<br/><i>component styles</i>]
```

**Responsive breakpoints:** 320px · 375px (Teams sidebar) · 800px · 1200px+

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Class-based root component | SPFx property pane integration requires class component lifecycle |
| Functional child components + hooks | Simpler state management, easier testing |
| CSS Modules over CSS-in-JS | SPFx native support, zero runtime cost |
| Graph API over PnPjs Lists | Reads L&TDC's existing Excel directly - no SharePoint Lists to provision |
| DataCache with deduplication | Single Graph API fetch shared across all concurrent service calls |
| No external CDNs | Bank CSP blocks external resources; everything bundled in .sppkg |
| Minimal dependencies | PnPjs kept for legacy fallback; production path uses built-in SPFx Graph client |
