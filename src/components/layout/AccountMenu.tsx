import { LayoutDashboard, LogOut, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

function initials(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "M"
  );
}

/** Header account control: a sign-in link for visitors, an account menu for members. */
export function AccountMenu() {
  const { user, isSignedIn, roleLabel, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="border-brand-border bg-white">
        <Link to="/signin">
          <UserRound className="h-4 w-4" /> {isSignedIn ? "Account" : "Sign in"}
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-brand-border bg-white px-2.5 py-1.5 text-left hover:border-brand-navy/40"
          aria-label="Open account menu"
        >
          <Avatar className="h-7 w-7 border border-brand-border">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-brand-navy text-[10px] text-white">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden flex-col leading-tight lg:flex">
            <span className="text-xs font-semibold text-brand-charcoal">{user.name}</span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-brand-slate">
              {roleLabel}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 border-brand-border bg-white p-1.5">
        <DropdownMenuLabel className="px-2 py-1.5">
          <span className="block text-sm font-semibold text-brand-charcoal">{user.name}</span>
          <span className="block truncate text-[11px] font-normal text-brand-slate">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" /> My dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> My wallet
          </Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/admin" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Admin control room
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-danger focus:text-danger"
          onSelect={() => {
            void signOut().then(() => {
              toast.success("Signed out");
              void navigate({ to: "/", replace: true });
            });
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AccountMenu;
