"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ServiceIcon from '@/components/ServiceIcon';
import type { Service } from '@/types';

export default function NewService() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    title: { th: string; en: string };
    description: { th: string; en: string };
    features: { th: string; en: string };
    technologies: string;
    icon: string;
    category: Service['category'];
    isActive: boolean;
  }>({
    title: { th: '', en: '' },
    description: { th: '', en: '' },
    features: { th: '', en: '' },
    technologies: '',
    icon: 'Rocket',
    category: 'web',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        features: {
          th: formData.features.th.split('\n').filter(f => f.trim()),
          en: formData.features.en.split('\n').filter(f => f.trim())
        },
        technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
      };

      const res = await fetch('/api/content/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Service created successfully!');
        router.push('/admin/dashboard/services');
      } else {
        const data = await res.json();
        alert(`Failed to create: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create service:', error);
      alert('An error occurred while creating service');
    } finally {
      setLoading(false);
    }
  };

  const commonIcons = [
    { name: 'Rocket', label: 'Rocket' },
    { name: 'Globe', label: 'Globe' },
    { name: 'Smartphone', label: 'Smartphone' },
    { name: 'Palette', label: 'Palette' },
    { name: 'Layers', label: 'Layers' },
    { name: 'Code', label: 'Code' },
    { name: 'Cpu', label: 'CPU' },
    { name: 'Zap', label: 'Zap' },
    { name: 'Wrench', label: 'Wrench' },
    { name: 'Shield', label: 'Shield' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard/services"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add New Service</h1>
            <p className="text-muted-foreground">Create a new service</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-6">
        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Icon</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {commonIcons.map(icon => (
              <button
                key={icon.name}
                type="button"
                onClick={() => setFormData({ ...formData, icon: icon.name })}
                className={`p-3 rounded-lg transition-all ${
                  formData.icon === icon.name
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 scale-105'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border-2 border-transparent'
                }`}
              >
                <ServiceIcon iconName={icon.name} className="w-6 h-6" />
              </button>
            ))}
          </div>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="Or enter custom icon name (e.g., Globe, Smartphone, Palette)"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Service['category'] })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            required
          >
            <option value="web">Web Development</option>
            <option value="mobile">Mobile Development</option>
            <option value="animation">Animation</option>
            <option value="framework">Framework</option>
          </select>
        </div>

        {/* Title - English */}
        <div>
          <label className="block text-sm font-medium mb-2">Title (English) *</label>
          <input
            type="text"
            value={formData.title.en}
            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            required
          />
        </div>

        {/* Title - Thai */}
        <div>
          <label className="block text-sm font-medium mb-2">Title (Thai) *</label>
          <input
            type="text"
            value={formData.title.th}
            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, th: e.target.value } })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            required
          />
        </div>

        {/* Description - English */}
        <div>
          <label className="block text-sm font-medium mb-2">Description (English) *</label>
          <textarea
            value={formData.description.en}
            onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            required
          />
        </div>

        {/* Description - Thai */}
        <div>
          <label className="block text-sm font-medium mb-2">Description (Thai) *</label>
          <textarea
            value={formData.description.th}
            onChange={(e) => setFormData({ ...formData, description: { ...formData.description, th: e.target.value } })}
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            required
          />
        </div>

        {/* Features - English */}
        <div>
          <label className="block text-sm font-medium mb-2">Features (English) - One per line</label>
          <textarea
            value={formData.features.en}
            onChange={(e) => setFormData({ ...formData, features: { ...formData.features, en: e.target.value } })}
            rows={4}
            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>

        {/* Features - Thai */}
        <div>
          <label className="block text-sm font-medium mb-2">Features (Thai) - One per line</label>
          <textarea
            value={formData.features.th}
            onChange={(e) => setFormData({ ...formData, features: { ...formData.features, th: e.target.value } })}
            rows={4}
            placeholder="ฟีเจอร์ 1&#10;ฟีเจอร์ 2&#10;ฟีเจอร์ 3"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-sm font-medium mb-2">Technologies (comma-separated)</label>
          <input
            type="text"
            value={formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            placeholder="React, Node.js, MongoDB, etc."
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Status *</label>
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
              formData.isActive
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-green-300'
            }`}>
              <input
                type="radio"
                name="status"
                checked={formData.isActive}
                onChange={() => setFormData({ ...formData, isActive: true })}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm font-medium">Publish</span>
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
              !formData.isActive
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-yellow-300'
            }`}>
              <input
                type="radio"
                name="status"
                checked={!formData.isActive}
                onChange={() => setFormData({ ...formData, isActive: false })}
                className="w-4 h-4 text-yellow-600"
              />
              <span className="text-sm font-medium">Draft</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/admin/dashboard/services"
            className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </form>
    </div>
  );
}
