import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  Menu,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { NotificationBell, WalletChip } from "@/components/layout/MemberBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

/** Header shown to signed-in members: only portal pages, no public site menu. */
export function PortalHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/surveys", label: "Surveys", icon: ListChecks },
    { to: "/surveys/create", label: "Create survey", icon: FilePlus2 },
    { to: "/press-releases/book", label: "Book press release", icon: Megaphone },
    { to: "/press-releases/tracker", label: "My requests", icon: ClipboardList },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ] as const;

  const handleSignOut = () => {
    setOpen(false);
    void signOut().then(() => {
      toast.success("Signed out");
      void navigate({ to: "/", replace: true });
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-white/95 backdrop-blur">
      <div className="fmie-container flex h-16 items-center justify-between gap-3">
        <Link to="/" className="shrink-0" aria-label="F.M.I.E home">
          <Logo compact />
        </Link>
        <nav aria-label="Portal navigation" className="hidden items-center gap-1 xl:flex">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-brand-cream text-brand-navy" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-brand-charcoal hover:bg-brand-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex min-w-0 items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <WalletChip />
            <NotificationBell />
          </div>
          <Button variant="outline" size="sm" className="hidden xl:inline-flex" onClick={handleSignOut}>
            <LogOut /> Sign out
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[86vw] max-w-sm overflow-y-auto border-brand-border bg-white p-0"
            >
              <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
                <Logo compact />
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X />
                </Button>
              </div>
              {user ? (
                <p className="truncate px-5 pt-4 text-xs text-brand-slate">{user.email}</p>
              ) : null}
              <nav aria-label="Portal mobile navigation" className="p-4">
                <ul className="space-y-1">
                  {links.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        activeOptions={{ exact: true }}
                        activeProps={{ className: "bg-brand-cream text-brand-navy" }}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-cream"
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-brand-navy" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-border pt-4">
                  <WalletChip />
                  <NotificationBell />
                </div>
                <Button variant="outline" className="mt-4 w-full" onClick={handleSignOut}>
                  <LogOut /> Sign out
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default PortalHeader;
