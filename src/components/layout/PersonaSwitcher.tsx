import {
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

/**
 * Demo persona switcher. Toggling personas refreshes user context, navigation
 * affordances and dashboard permissions instantly, without a page reload.
 */
export function PersonaSwitcher() {
  const { user, personas, roleLabel, switchPersona, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-brand-border bg-white px-2.5 py-1.5 text-left hover:border-brand-navy/40"
          aria-label="Switch demo persona"
        >
          <Avatar className="h-7 w-7 border border-brand-border">
            <AvatarImage src={user?.avatarUrl} alt={user?.name ?? "Guest"} />
            <AvatarFallback className="bg-brand-navy text-[10px] text-white">
              {user?.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("") ?? "G"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden flex-col leading-tight lg:flex">
            <span className="text-xs font-semibold text-brand-charcoal">
              {user?.name ?? "Guest Reader"}
            </span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-brand-slate">
              {roleLabel}
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-brand-slate" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 border-brand-border bg-white p-1.5">
        <DropdownMenuLabel className="px-2 py-1.5">
          <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-slate">
            Demo personas
          </span>
          <span className="mt-0.5 block text-[11px] font-normal normal-case text-brand-slate">
            Switching updates context and dashboard permissions instantly.
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {personas.map((persona) => {
          const active = persona.id === user?.id;
          return (
            <DropdownMenuItem
              key={persona.id}
              onSelect={() => {
                if (active) return;
                void switchPersona(persona.id).then((next) => {
                  if (next) {
                    toast.success(`Signed in as ${next.name}`, {
                      description: "Demo persona switched. Dashboards and permissions updated.",
                    });
                  }
                });
              }}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-md px-2 py-2",
                active && "bg-brand-navy/5",
              )}
            >
              <Avatar className="h-8 w-8 border border-brand-border">
                <AvatarImage src={persona.avatarUrl} alt={persona.name} />
                <AvatarFallback className="bg-brand-navy text-[10px] text-white">
                  {persona.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium text-brand-charcoal">
                  {persona.name}
                  {active ? <Check className="h-3.5 w-3.5 text-success" /> : null}
                </span>
                <span className="block truncate text-[11px] text-brand-slate">{persona.email}</span>
              </span>
              <Badge
                tone={persona.role === "administrator" ? "gold" : "muted"}
                className="mt-0.5 shrink-0"
              >
                {persona.role === "administrator"
                  ? "Admin"
                  : persona.role === "survey_creator"
                    ? "Creator"
                    : persona.role === "premium_customer"
                      ? "Client"
                      : "Public"}
              </Badge>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" /> My dashboard
          </Link>
        </DropdownMenuItem>
        {user?.role === "administrator" ? (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/admin" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Admin control panel
            </Link>
          </DropdownMenuItem>
        ) : null}
        {user ? (
          <DropdownMenuItem
            className="cursor-pointer text-danger focus:text-danger"
            onSelect={() => {
              void signOut().then(() => {
                toast.info("Signed out", { description: "You are browsing as a public reader." });
                void navigate({ to: "/" });
              });
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/signin" className="flex items-center gap-2">
              <UserRound className="h-4 w-4" /> Sign in
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default PersonaSwitcher;
