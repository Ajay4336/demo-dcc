import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SessionProvider } from "@/components/session-context";
import { getWorkspaceById } from "@/data/workspaces";
import { getSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const workspace = getWorkspaceById(session.workspaceId);
  return (
    <SessionProvider session={session}>
      <AppShell session={session} workspaceLabel={workspace?.name ?? session.workspaceId}>
        {children}
      </AppShell>
    </SessionProvider>
  );
}
