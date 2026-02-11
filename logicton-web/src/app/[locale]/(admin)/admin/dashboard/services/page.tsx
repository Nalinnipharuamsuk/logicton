"use client";

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Layout, Smartphone, Film, Code } from 'lucide-react';
import Link from 'next/link';
import ServiceIcon from '@/components/ServiceIcon';
import type { Service } from '@/types';

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const loadServices = async () => {
    setLoading(true);
    try {
      console.log('[ServicesManagement] Fetching services...');
      const res = await fetch('/api/content/services');
      const data = await res.json();
      console.log('[ServicesManagement] API response:', data);
      if (data.success) {
        console.log('[ServicesManagement] Loaded services:', data.data);
        setServices(data.data);
      } else {
        console.error('[ServicesManagement] API returned success=false');
      }
    } catch (error) {
      console.error('[ServicesManagement] Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    setDeleteId(id);
    try {
      const res = await fetch(`/api/content/services/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setServices(services.filter(service => service.id !== id));
        alert('Service deleted successfully');
      } else {
        alert('Failed to delete service');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('An error occurred while deleting');
    } finally {
      setDeleteId(null);
    }
  };

  const getCategoryIcon = (category: Service['category']) => {
    switch (category) {
      case 'web':
        return <Layout className="h-5 w-5" />;
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'animation':
        return <Film className="h-5 w-5" />;
      case 'framework':
        return <Code className="h-5 w-5" />;
      default:
        return <Layout className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (category: Service['category']) => {
    switch (category) {
      case 'web':
        return 'Web Development';
      case 'mobile':
        return 'Mobile App';
      case 'animation':
        return 'Animation';
      case 'framework':
        return 'Framework';
      default:
        return category;
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.title.th.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                        (filterStatus === 'published' && service.isActive) ||
                        (filterStatus === 'draft' && !service.isActive);
    return matchesSearch && matchesFilter;
  });

  const publishedCount = services.filter(service => service.isActive).length;
  const draftCount = services.filter(service => !service.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary text-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Services Management</h1>
          <p className="text-muted-foreground">Manage your services</p>
        </div>
        <Link
          href="/admin/dashboard/services/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add New
        </Link>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg transition-colors font-medium ${
            filterStatus === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          All ({services.length})
        </button>
        <button
          onClick={() => setFilterStatus('published')}
          className={`px-4 py-2 rounded-lg transition-colors font-medium ${
            filterStatus === 'published'
              ? 'bg-green-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Published ({publishedCount})
        </button>
        <button
          onClick={() => setFilterStatus('draft')}
          className={`px-4 py-2 rounded-lg transition-colors font-medium ${
            filterStatus === 'draft'
              ? 'bg-yellow-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Draft ({draftCount})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? 'No services found matching your search.' : 'No services yet. Create your first one!'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-card rounded-lg border border-border p-4 flex gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                <ServiceIcon iconName={service.icon} className="w-8 h-8" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-foreground">{service.title.en}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {getCategoryIcon(service.category)}
                      <span>{getCategoryLabel(service.category)}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    service.isActive 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {service.isActive ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {service.description.en}
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-muted rounded text-xs text-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                  {service.technologies.length > 3 && (
                    <span className="px-2 py-1 text-xs text-muted-foreground">
                      +{service.technologies.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href={`/admin/dashboard/services/edit/${service.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:shadow-md text-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deleteId === service.id}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteId === service.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}