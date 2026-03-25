import * as React from 'react';

interface IPlaceholderBadgeProps {
    size?: number;
}

const PlaceholderBadge: React.FC<IPlaceholderBadgeProps> = ({ size = 120 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <circle cx="60" cy="60" r="56" fill="#f0f1f4" stroke="#e2e5ea" strokeWidth="2" />
        <path
            d="M60 30L67.5 47.5H85L71 58.5L76 76L60 65.5L44 76L49 58.5L35 47.5H52.5L60 30Z"
            fill="#d0d4db"
            stroke="#c0c5cd"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
        <rect x="50" y="70" width="20" height="14" rx="3" fill="#8b919a" />
        <rect x="56" y="74" width="8" height="2" rx="1" fill="#f0f1f4" />
        <rect x="54" y="78" width="4" height="3" rx="1" fill="#f0f1f4" />
        <circle cx="62" cy="79.5" r="1.5" fill="#f0f1f4" />
    </svg>
);

export default PlaceholderBadge;
