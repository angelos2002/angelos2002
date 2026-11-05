import type { SVGProps } from "react";

const paths: Record<string, React.ReactNode> = {
  bag: <><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  phone: <path d="M5 4h3.5l1.8 4.3-2.2 1.4a11 11 0 0 0 6.2 6.2l1.4-2.2L20 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  pin: <><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h10" /></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  arrowRight: <path d="M5 12h14m-5-5 5 5-5 5" />,
  arrowLeft: <path d="M19 12H5m5-5-5 5 5 5" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  truck: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  store: <><path d="M4 9.5 5.5 4h13L20 9.5M4 9.5V20h16V9.5M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M10 20v-5h4v5" /></>,
  flame: <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 1.5.8 2.5 2 3 0-3 0-5.5 1-8.5z" />,
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />,
  play: <path d="M8 5.5v13l10-6.5z" />,
  instagram: <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.8" cy="7.2" r="0.6" /></>,
  facebook: <path d="M14 8h2.5V4.5H14A4 4 0 0 0 10 8.5V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V8.8A.8.8 0 0 1 14 8z" />,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" /></>,
  // dietary
  leaf: <><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" /><path d="M5 19 13 11" /></>,
  sprout: <><path d="M12 20v-8" /><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-4 3-6 7-6 0 4-3 6-7 6z" /></>,
  chili: <><path d="M7 9c-2 5 1 11 10 11-4-2-6-6-6-11" /><path d="M7 9c1-1 3-1 4 0M9 8.5c0-2 1-4 3-4.5" /></>,
  gfo: <><path d="M12 21V8" /><path d="M12 8c-2-1-3-3-2-5 2 1 3 3 2 5zM12 12c-2-1-4-1-5 1 2 1 4 1 5-1zM12 12c2-1 4-1 5 1-2 1-4 1-5-1z" /><path d="M4 4l16 16" /></>,
  // allergens
  gluten: <><path d="M12 21V8" /><path d="M12 8c-2-1-3-3-2-5 2 1 3 3 2 5zM12 12c-2-1-4-1-5 1 2 1 4 1 5-1zM12 12c2-1 4-1 5 1-2 1-4 1-5-1zM12 16c-2-1-4-1-5 1 2 1 4 1 5-1zM12 16c2-1 4-1 5 1-2 1-4 1-5-1z" /></>,
  milk: <><path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z" /><path d="M7 12h10" /></>,
  egg: <path d="M12 3c3.5 0 6 6 6 10a6 6 0 0 1-12 0c0-4 2.5-10 6-10z" />,
  mustard: <><path d="M8 9h8v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z" /><path d="M10 9V6h4v3M11 6l1-3 1 3" /></>,
  sesame: <><ellipse cx="8" cy="9" rx="2" ry="3" transform="rotate(-25 8 9)" /><ellipse cx="16" cy="9" rx="2" ry="3" transform="rotate(25 16 9)" /><ellipse cx="12" cy="16" rx="2" ry="3" /></>,
  soy: <><path d="M5 17c-1-5 3-11 9-12 4-.5 6 2 5 5-1 4-6 4-8 7-1.5 2-5 2-6 0z" /><circle cx="10" cy="14" r="1.3" /><circle cx="14" cy="10" r="1.3" /></>,
  nuts: <><path d="M6 10h12c0 6-3 10-6 11-3-1-6-5-6-11z" /><path d="M5 10c0-3 3-5 7-5s7 2 7 5M12 5V3" /></>,
  peanuts: <path d="M12 3a4 4 0 0 1 4 4c0 1.5-1 2.5-1 5s1 3.5 1 5a4 4 0 0 1-8 0c0-1.5 1-2.5 1-5s-1-3.5-1-5a4 4 0 0 1 4-4z" />,
  celery: <><path d="M9 21V10M12 21V8M15 21V10" /><path d="M12 8c-1-3-4-4-6-3 1 2 3 3 6 3zM12 8c1-3 4-4 6-3-1 2-3 3-6 3z" /></>,
  fish: <><path d="M3 12c3-4 7-6 11-5 3 .7 5 3 6 5-1 2-3 4.3-6 5-4 1-8-1-11-5z" /><path d="M3 12 1 9M3 12l-2 3" /><circle cx="15.5" cy="11" r="0.8" /></>,
  sulphites: <><path d="M7 3h10l-1 7a4 4 0 0 1-8 0z" /><path d="M12 14v6M8.5 21h7M7.5 7h9" /></>,
};

export type IconName = keyof typeof paths | string;

export function Icon({ name, className = "h-5 w-5", ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {paths[name] ?? null}
    </svg>
  );
}
