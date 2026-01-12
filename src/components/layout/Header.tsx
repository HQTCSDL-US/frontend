import { Train, User, Ticket } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Trips', icon: Train },
    { path: '/profile', label: 'My Tickets', icon: Ticket },
  ];

  return (
    <header className="railway-gradient sticky top-0 z-50 shadow-elevated">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent shadow-glow transition-transform group-hover:scale-105">
              <Train className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-primary-foreground">
              RailwayVN
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  location.pathname === path
                    ? 'bg-primary-foreground/15 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            
            {/* Profile */}
            <Link
              to="/profile"
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
            >
              <User className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
