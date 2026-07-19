function SlothMascot({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 46 Q80 20 156 46" stroke="#8a7355" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="80" cy="50" rx="34" ry="22" fill="#b09169" />
      <circle cx="52" cy="38" r="17" fill="#c7ab84" />
      <circle cx="45" cy="36" r="4.5" fill="#2b2b2b" />
      <circle cx="59" cy="36" r="4.5" fill="#2b2b2b" />
      <path d="M48 44 Q52 47 56 44" stroke="#2b2b2b" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M18 40 Q10 46 16 56" stroke="#8a7355" strokeWidth="6" strokeLinecap="round" />
      <path d="M120 44 Q132 50 126 60" stroke="#8a7355" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="100" cy="60" rx="8" ry="5" fill="#6f8f4a" transform="rotate(20 100 60)" />
      <ellipse cx="112" cy="52" rx="8" ry="5" fill="#7fa356" transform="rotate(-10 112 52)" />
    </svg>
  );
}

export default SlothMascot;
