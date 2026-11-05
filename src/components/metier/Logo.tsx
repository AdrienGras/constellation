export function Logo() {
  return (
    <svg width={34} height={24} viewBox="0 0 34 24" aria-hidden="true">
      <path
        d="M3 19 L11 11 H23 L31 3"
        fill="none"
        stroke="var(--ligne-developpement)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={11} cy={11} r={4} fill="var(--surface)" stroke="var(--encre)" strokeWidth={2.5} />
      <circle cx={23} cy={11} r={4} fill="var(--surface)" stroke="var(--encre)" strokeWidth={2.5} />
    </svg>
  )
}
