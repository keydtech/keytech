import type { SolutionId } from "@/lib/constants";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function baseProps(props: IconProps) {
  return {
    viewBox: "0 0 48 48",
    fill: "none",
    "aria-hidden": true as const,
    ...props,
  };
}

export function RetailIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="6" y="14" width="36" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 14V12a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="26" r="2.5" fill="#00D4B2" />
      <circle cx="30" cy="26" r="2.5" fill="#00D4B2" />
      <path d="M16 34h16" stroke="#00D4B2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ElectronicsIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="12" y="8" width="24" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
      <rect x="17" y="13" width="14" height="18" rx="2" stroke="#00D4B2" strokeWidth="2" />
      <circle cx="24" cy="36" r="2" fill="#00D4B2" />
    </svg>
  );
}

export function PharmacyIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M18 8h12v8a10 10 0 1 1-12 0V8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M24 22v12M18 28h12" stroke="#00D4B2" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function WholesaleIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M8 34V18l16-8 16 8v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 34V22h16v12" stroke="currentColor" strokeWidth="2" />
      <path d="M14 28h8M26 28h8" stroke="#00D4B2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ServicesIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="18" cy="16" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="16" r="5" stroke="#00D4B2" strokeWidth="2" />
      <path
        d="M8 36c1.5-6 5.5-9 10-9s8.5 3 10 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28 27c2.2-.7 4.6-.7 7 0 2.2.6 4.2 2.2 5 5"
        stroke="#00D4B2"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ManufacturingIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M8 34V20l8 4V20l8 4V16l8 4v14H8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="30" r="2" fill="#00D4B2" />
      <circle cx="26" cy="30" r="2" fill="#00D4B2" />
      <circle cx="34" cy="30" r="2" fill="#00D4B2" />
    </svg>
  );
}

const ICONS: Record<SolutionId, (props: IconProps) => React.ReactElement> = {
  retail: RetailIcon,
  electronics: ElectronicsIcon,
  pharmacy: PharmacyIcon,
  wholesale: WholesaleIcon,
  services: ServicesIcon,
  manufacturing: ManufacturingIcon,
};

export function SolutionIcon({
  id,
  className,
}: {
  id: SolutionId;
  className?: string;
}) {
  const Icon = ICONS[id];
  return <Icon className={className} />;
}
