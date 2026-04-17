import Link from "next/link";
import type { SessionPayload } from "@/lib/auth/types";
import { UserMenu } from "@/components/user-menu";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/agents", label: "Agents" },
  { href: "/governance", label: "Governance" },
];

export function AppShell({
  children,
  session,
  workspaceLabel,
}: {
  children: React.ReactNode;
  session: SessionPayload;
  workspaceLabel: string;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950/95 p-6 md:flex">
          <div className="mb-6">
            <div className="text-xs font-medium uppercase tracking-widest text-emerald-400/90">
              Delivery Command
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight">Center</div>
          </div>
          <div className="mb-6 space-y-1">
            <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-600">Workspace</div>
            <div className="text-sm text-zinc-300">{workspaceLabel}</div>
            <WorkspaceSwitcher currentId={session.workspaceId} />
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-zinc-800/80 pt-4">
            <UserMenu session={session} />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-col gap-3 border-b border-zinc-800/80 px-4 py-3 md:hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">DCC</span>
              <WorkspaceSwitcher currentId={session.workspaceId} />
            </div>
            <nav className="flex flex-wrap gap-2 text-xs">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-emerald-400/90 underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <UserMenu session={session} />
          </header>
          <main className="flex-1 p-6 md:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
