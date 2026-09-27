// Authored landscape, shared by the desktop and reading cover. No remote assets.
export function Wallpaper({ className = "" }: { className?: string }) {
  return <svg className={`desktop-landscape ${className}`} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="paper-sky" x2="0" y2="1"><stop stopColor="#c9d6ca" /><stop offset="1" stopColor="#ede2c1" /></linearGradient>
      <linearGradient id="paper-field" x2="0" y2="1"><stop stopColor="#8b9c6d" /><stop offset="1" stopColor="#586e4e" /></linearGradient>
    </defs>
    <path fill="url(#paper-sky)" d="M0 0h1440v900H0z" />
    <circle cx="1060" cy="260" r="72" fill="#f5e5b3" />
    <path fill="#bac5ab" d="M0 440Q210 300 420 400T810 370T1220 380T1540 390V900H0Z" />
    <path fill="#99ac8b" d="M0 520Q160 380 360 480T760 455T1080 460T1440 410V900H0Z" />
    <path fill="url(#paper-field)" d="M0 590Q220 495 430 570T900 545T1440 580V900H0Z" />
    <path fill="#b9b48d" d="M740 900Q1170 695 913 604Q858 579 913 556Q825 578 871 609Q1065 713 545 900Z" />
    <g transform="translate(960 470)">
      <path fill="#e3d6b8" d="M0 35h100v70H0Z" /><path fill="#776b56" d="m-14 38 57-44 73 44Z" />
      <path fill="#786f59" d="M60 65h22v40H60Z" /><path fill="#c7b06f" d="M14 59h23v22H14Z" />
      <path fill="#64614e" d="M78-1h10v22H78Z" />
    </g>
    <g transform="translate(1170 439)"><path d="m-7 125 7-116 13 7-6 109" fill="#656451" /><path d="M0 77-48 39m55 9 43-31" stroke="#656451" strokeWidth="10" /><path d="M-87 3q-6-45 46-45 27-36 60-10 62-19 73 39 48 21 17 62-22 34-69 9-56 24-88-1-49 4-48-31Z" fill="#627c58" /><path d="M-77-8q8-29 41-29 29-36 61-7 53-12 54 32-33 5-50-6-56 20-106 10Z" fill="#80935e" /></g>
    <path fill="#465f48" d="M0 775q170-104 302 44l46 81H0Zm1270 125q-8-92 62-105 5-77 108-101v206Z" />
    <path fill="none" stroke="#d4cea5" strokeWidth="2" opacity=".28" d="m30 656 190-31m-100 98 130-29m843 18 204-40m-74 62 146-26" />
  </svg>;
}
