"use client";

import { useEffect, useState } from 'react';
import { Briefcase, FileText, Users, TrendingUp, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    portfolio: 0,
    services: 0,
    team: 0,
    inquiries: { total: 0, new: 0, read: 0 }
  });

  useEffect(() => {
    // Fetch statistics from content
    Promise.all([
      fetch('/api/content/portfolio'),
      fetch('/api/content/services'),
      fetch('/api/content/team'),
      fetch('/api/contact/inquiries')
    ])
    .then(([portfolioRes, servicesRes, teamRes, inquiriesRes]) => Promise.all([
      portfolioRes.json(),
      servicesRes.json(),
      teamRes.json(),
      inquiriesRes.json()
    ]))
    .then(([portfolioData, servicesData, teamData, inquiriesData]) => {
      setStats({
        portfolio: portfolioData.success ? portfolioData.data.length : 0,
        services: servicesData.success ? servicesData.data.length : 0,
        team: teamData.success ? teamData.data.length : 0,
        inquiries: inquiriesData.success ? inquiriesData.data.stats : { total: 0, new: 0, read: 0 }
      });
    })
    .catch(console.error);
  }, []);

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-lg text-muted-foreground">Welcome back! Here&apos;s an overview of your site content.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100 dark:to-blue-800/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-blue-500 rounded-xl shadow-md">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-5xl font-bold text-foreground mb-2">{stats.portfolio}</div>
          <div className="text-base font-semibold text-muted-foreground">Portfolio Items</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-purple-100 dark:to-purple-800/20 p-8 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-purple-500 rounded-xl shadow-md">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-5xl font-bold text-foreground mb-2">{stats.services}</div>
          <div className="text-base font-semibold text-muted-foreground">Services</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 dark:from-green-900/20 to-green-100 dark:to-green-800/20 p-8 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-green-500 rounded-xl shadow-md">
              <Users className="h-7 w-7 text-white" />
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-5xl font-bold text-foreground mb-2">{stats.team}</div>
          <div className="text-base font-semibold text-muted-foreground">Team Members</div>
        </div>

        <Link
          href="/admin/dashboard/messages"
          className="bg-gradient-to-br from-orange-50 dark:from-orange-900/20 to-orange-100 dark:to-orange-800/20 p-8 rounded-2xl border border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-shadow block"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-orange-500 rounded-xl shadow-md">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-5xl font-bold text-foreground mb-2">{stats.inquiries.new}</div>
          <div className="text-base font-semibold text-muted-foreground">
            New Messages {stats.inquiries.total > 0 && `(${stats.inquiries.total} total)`}
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Link 
              href="/admin/dashboard/portfolio/new" 
              className="w-full text-left px-6 py-4 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200 flex items-center justify-between group block"
            >
              <span className="font-semibold text-lg text-foreground group-hover:text-blue-600">Add New Portfolio Item</span>
              <TrendingUp className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
            </Link>
            <Link 
              href="/admin/dashboard/services/new" 
              className="w-full text-left px-6 py-4 rounded-xl hover:bg-purple-50 transition-all border border-transparent hover:border-purple-200 flex items-center justify-between group block"
            >
              <span className="font-semibold text-lg text-foreground group-hover:text-purple-600">Add New Service</span>
              <TrendingUp className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
            </Link>
            <Link
              href="/admin/dashboard/team/new"
              className="w-full text-left px-6 py-4 rounded-xl hover:bg-green-50 transition-all border border-transparent hover:border-green-200 flex items-center justify-between group block"
            >
              <span className="font-semibold text-lg text-foreground group-hover:text-green-600">Add New Team Member</span>
              <TrendingUp className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
            </Link>
            <Link
              href="/admin/dashboard/messages"
              className="w-full text-left px-6 py-4 rounded-xl hover:bg-orange-50 transition-all border border-transparent hover:border-orange-200 flex items-center justify-between group block"
            >
              <span className="font-semibold text-lg text-foreground group-hover:text-orange-600">View Messages</span>
              <TrendingUp className="h-6 w-6 text-orange-500 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Activity</h2>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
