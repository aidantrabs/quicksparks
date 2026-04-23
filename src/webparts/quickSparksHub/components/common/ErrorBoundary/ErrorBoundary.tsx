import * as React from 'react';

interface IErrorBoundaryProps {
    children: React.ReactNode;
}

interface IErrorBoundaryState {
    hasError: boolean;
}

export default class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
    constructor(props: IErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    public static getDerivedStateFromError(): IErrorBoundaryState {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, info: React.ErrorInfo): void {
        console.error('QuickSparksHub ErrorBoundary caught:', error, info.componentStack);
    }

    public render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div
                    role="alert"
                    style={{
                        padding: 'var(--qs-spacing-xl)',
                        textAlign: 'center',
                        color: 'var(--qs-color-text-secondary)',
                        fontFamily: 'var(--qs-font-family)',
                        fontSize: 'var(--qs-font-size-body)',
                    }}
                >
                    <p style={{ fontWeight: 600, marginBottom: 'var(--qs-spacing-sm)' }}>something went wrong</p>
                    <p>try refreshing the page. if the problem persists, contact it support.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
