export default function Brand() {
  return (
    <span className="brand-lockup">
      <svg
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="38" height="38" rx="11" fill="currentColor" />
        <path
          d="M12 25h15a6 6 0 0 0 0-12h-2a8 8 0 0 0-15 4 4 4 0 0 0 2 8Z"
          stroke="var(--surface)"
          strokeWidth="1.8"
        />
        <path
          d="m17 21 3 3 5-6"
          stroke="var(--surface)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <strong>
        CloudVault<span>YOUR KNOWLEDGE, CONNECTED</span>
      </strong>
    </span>
  );
}
