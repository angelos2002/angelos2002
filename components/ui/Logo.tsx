import Image from "next/image";

export function Logo({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const h = size === "lg" ? 96 : 56;
  return (
    <Image
      src="/logo.png"
      alt="Street Food Rey"
      width={Math.round((h * 487) / 348)}
      height={h}
      priority
      className={`h-auto w-auto select-none ${size === "lg" ? "max-h-24" : "max-h-14 md:max-h-[68px]"} ${className}`}
    />
  );
}
