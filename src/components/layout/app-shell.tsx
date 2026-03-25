import { Flame, Home, LogIn, LogOut, PlusSquare, UserCircle2 } from "lucide-react";
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/feed", label: "Feed", icon: Flame },
  { href: "/create", label: "Create", icon: PlusSquare },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <>
      <header className="top-nav">
        <div className="top-nav__inner">
          <Link className="brand" to="/feed">
            <span className="brand__mark">R</span>
            <span>Rupture</span>
          </Link>
          <nav className="nav-links">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(`${item.href}/`));
              return <Link key={item.href} className="nav-pill" to={item.href} data-active={active}><Icon size={16} /><span>{item.label}</span></Link>;
            })}
            <Link className="nav-pill" to={user?.username ? `/profile/${user.username}` : "/login"} data-active={location.pathname.startsWith("/profile/")}><UserCircle2 size={16} /><span>Profile</span></Link>
            {user ? (
              <>
                <span className="nav-pill">@{user.username ?? user.email?.split("@")[0]}</span>
                <button className="nav-pill" onClick={handleSignOut} type="button"><LogOut size={16} /><span>Sign out</span></button>
              </>
            ) : (
              <Link className="nav-pill" to="/login" data-active={location.pathname === "/login"}><LogIn size={16} /><span>Sign in</span></Link>
            )}
          </nav>
        </div>
      </header>

      <div className="page-shell shell-padding">
        {children}
        <nav className="bottom-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(`${item.href}/`));
            return <Link key={item.href} className="bottom-nav__item" to={item.href} data-active={active}><Icon size={18} /><span>{item.label}</span></Link>;
          })}
          <Link className="bottom-nav__item" to={user?.username ? `/profile/${user.username}` : "/login"} data-active={location.pathname.startsWith("/profile/")}><UserCircle2 size={18} /><span>Me</span></Link>
        </nav>
      </div>
    </>
  );
}
