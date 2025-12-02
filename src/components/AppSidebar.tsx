import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderKanban, 
  ArrowLeftRight, 
  TrendingUp, 
  Euro,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import logo from "@/assets/dpastudio-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useState } from "react";

const navigation = [
  { name: "dashboard", href: "/", icon: LayoutDashboard },
  { name: "progetti", href: "/progetti", icon: FolderKanban },
  { name: "movimenti", href: "/movimenti", icon: ArrowLeftRight },
  { name: "cashflow", href: "/cashflow", icon: TrendingUp },
  { name: "tariffe", href: "/company-price", icon: Euro },
  { name: "impostazioni", href: "/impostazioni", icon: Settings },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('errore durante il logout');
    } else {
      toast.success('logout effettuato');
      navigate('/auth');
    }
  };

  return (
    <aside 
      className={cn(
        "shrink-0 border-r border-border bg-background transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-48"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && <img src={logo} alt="DPA Studio" className="h-6" />}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn("p-1 h-8 w-8", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 p-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium border border-border transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-secondary",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          title={collapsed ? "esci" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium border border-border transition-colors bg-background hover:bg-secondary",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>esci</span>}
        </Button>
      </div>
    </aside>
  );
}
