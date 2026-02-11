"use client";

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import type { PortfolioItem } from '@/types';

export default function PortfolioManagement() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/portfolio');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Failed to load portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    setDeleteId(id);
    try {
      const res = await fetch(`/api/content/portfolio/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setItems(items.filter(item => item.id !== id));
        alert('Portfolio item deleted successfully');
      } else {
        alert('Failed to delete portfolio item');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('An error occurred while deleting');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.title.th.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                        (filterStatus === 'published' && item.isActive) ||
                        (filterStatus === 'draft' && !item.isActive);
    return matchesSearch && matchesFilter;
  });

  const publishedCount = items.filter(item => item.isActive).length;
  const draftCount = items.filter(item => !item.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Management</h1>
          <p className="text-muted-foreground">Manage your portfolio items</p>
        </div>
        <Link
          href="/admin/dashboard/portfolio/new"
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
          All ({items.length})
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
          placeholder="Search portfolio items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Portfolio Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? 'No portfolio items found matching your search.' : 'No portfolio items yet. Create your first one!'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-lg border border-border p-4 flex gap-4 hover:shadow-md transition-shadow"
            >
              {item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.title.en}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg flex-shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <ImageIcon className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-1" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">No Image</span>
                  </div>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-lg text-foreground">{item.title.en}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {item.isActive ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.client.name}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {item.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-muted rounded text-xs text-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                  {item.technologies.length > 3 && (
                    <span className="px-2 py-1 text-xs text-muted-foreground">
                      +{item.technologies.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <Link
                  href={`/admin/dashboard/portfolio/edit/${item.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded hover:bg-muted/80 transition-colors text-sm text-foreground pointer-events-auto cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  disabled={deleteId === item.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-sm disabled:opacity-50 pointer-events-auto cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteId === item.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
