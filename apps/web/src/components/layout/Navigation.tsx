'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { LayoutDashboard, LogOut, MapPin, Plane } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/journeys', label: 'Journeys', icon: Plane },
    { href: '/activities', label: 'Activities', icon: MapPin },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 hidden border-b bg-background/85 backdrop-blur md:block">
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold text-foreground"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Plane className="size-4" />
                </span>
                TripTrack
              </Link>
              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    size="lg"
                  >
                    <Link
                      href={item.href}
                      className={cn(pathname === item.href && 'text-primary')}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium leading-none">
                  {user.user_metadata?.full_name || 'Traveler'}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {user.email}
                </div>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="lg">
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-[56px] flex-col items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors',
                pathname === item.href
                  ? 'bg-secondary text-primary'
                  : 'hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon className="mb-1 size-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex min-h-[56px] flex-col items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="mb-1 size-5" />
            <span className="text-xs font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
