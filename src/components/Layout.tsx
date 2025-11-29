import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Receipt, 
  ArrowLeftRight, 
  TrendingUp, 
  Euro,
  Upload,
  LogOut,
  UserCheck
} from "lucide-react";
import logo from "@/assets/dpastudio-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useIsAdmin } from "@/hooks/useUserApproval";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "dashboard", href: "/", icon: LayoutDashboard },
  { name: "progetti", href: "/progetti", icon: FolderKanban },
  { name: "costi fissi", href: "/costi-fissi", icon: Receipt },
  { name: "movimenti", href: "/movimenti", icon: ArrowLeftRight },
  { name: "cashflow", href: "/cashflow", icon: TrendingUp },
  { name: "tariffe", href: "/company-price", icon: Euro },
  { name: "import csv", href: "/import", icon: Upload },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <img src={logo} alt="DPA Studio" className="h-8" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-48 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm font-medium border border-border transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-secondary"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeLinecap="round" strokeLinejoin="round" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  to="/admin/approvals"
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm font-medium border border-border transition-colors whitespace-nowrap",
                    location.pathname === "/admin/approvals"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-secondary"
                  )}
                >
                  <UserCheck className="h-4 w-4 shrink-0" strokeLinecap="round" strokeLinejoin="round" />
                  <span>approvazioni</span>
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-sm font-medium border border-border transition-colors whitespace-nowrap bg-background hover:bg-secondary"
              >
                <LogOut className="h-4 w-4 shrink-0" strokeLinecap="round" strokeLinejoin="round" />
                <span>esci</span>
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}