export function Mascot({
  state = 'idle',
  small = false,
}: {
  state?: string;
  small?: boolean;
}) {
  return (
    <svg
      className={`mascot ${state} ${small ? 'small' : ''}`}
      viewBox="0 0 180 180"
      role="img"
      aria-label={`Dot is ${state}`}
    >
      <defs>
        <linearGradient
          id={small ? 'dot-small' : 'dot-large'}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#a9bafa" />
          <stop offset="1" stopColor="#7189e4" />
        </linearGradient>
      </defs>
      <ellipse cx="90" cy="157" rx="43" ry="8" fill="#2e4177" opacity=".08" />
      <g className="dot-body">
        <path
          d="M46 102C40 65 55 27 89 27c35 0 51 34 45 75l10 21c4 9-3 19-14 17l-18-3c-14 13-31 13-45 0l-17 4c-13 3-20-8-15-19Z"
          fill={`url(#${small ? 'dot-small' : 'dot-large'})`}
        />
        <path
          d="M49 89C46 54 65 31 87 33"
          fill="none"
          stroke="#c6d2ff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity=".7"
        />
        <ellipse cx="73" cy="86" rx="5" ry="8" fill="#2d3c6e" />
        <ellipse cx="107" cy="86" rx="5" ry="8" fill="#2d3c6e" />
        <path
          d="M84 106q6 5 12 0"
          fill="none"
          stroke="#344677"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="62" cy="101" rx="8" ry="4" fill="#c2cbff" opacity=".65" />
        <ellipse cx="117" cy="101" rx="8" ry="4" fill="#c2cbff" opacity=".65" />
      </g>
    </svg>
  );
}
