"use client";

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, FileText, Mail, LogOut } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { EditModeProvider } from '@/providers/EditModeProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border fixed h-full">
          <div className="p-6">
            <h1 className="text-xl font-bold text-card-foreground">Admin Panel</h1>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-card-foreground font-medium"
                >
                  <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard/portfolio"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-card-foreground font-medium"
                >
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard/services"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-card-foreground font-medium"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard/team"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-card-foreground font-medium"
                >
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard/messages"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-card-foreground font-medium"
                >
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  Messages
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-card-foreground font-medium"
                >
                  <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                  View Site
                </Link>
              </li>
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 font-medium w-full"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 text-card-foreground">
          <EditModeProvider>
            {children}
          </EditModeProvider>
        </main>
      </div>
    </ThemeProvider>
  );
}