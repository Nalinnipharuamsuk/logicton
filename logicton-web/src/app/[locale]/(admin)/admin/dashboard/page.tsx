"use client";

import { useLocale } from 'next-intl';
import { useEditMode } from '@/providers/EditModeProvider';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardPage() {
    const locale = useLocale();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-card-foreground">Dashboard Overview</h1>
                <ThemeToggle />
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-muted-foreground font-medium mb-2 text-base">Total Visits</h3>
                    <p className="text-4xl font-bold text-primary tracking-tight">12,450</p>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">↑ 12% from last month</span>
                </div>
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-muted-foreground font-medium mb-2 text-base">New Inquiries</h3>
                    <p className="text-4xl font-bold text-primary tracking-tight">45</p>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">↑ 5% from last week</span>
                </div>
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-muted-foreground font-medium mb-2 text-base">Active Projects</h3>
                    <p className="text-4xl font-bold text-primary tracking-tight">8</p>
                    <span className="text-sm text-muted-foreground font-medium">Stable</span>
                </div>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h2 className="text-xl font-bold mb-4 text-card-foreground">Recent Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-card-foreground">New contact form submission</p>
                                    <p className="text-sm text-muted-foreground">From: user{i}@example.com</p>
                                </div>
                            </div>
                            <span className="text-sm text-muted-foreground">2 hours ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
