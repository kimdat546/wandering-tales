"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const pathname = usePathname();
  const links = [
    { to: "/", label: "Home" },
    { to: "/todos", label: "Todos" },
  ] as const;

  // Hide header on map page
  if (pathname === "/map") {
    return null;
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => (
            <Link href={to} key={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
