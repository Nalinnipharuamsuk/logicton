"use client";

import { useEffect, useState } from 'react';
import { Mail, Eye, Trash2, Clock, CheckCircle, MessageSquare, Search } from 'lucide-react';
import type { ContactInquiry } from '@/types';

export default function ContactMessagesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact/inquiries');
      const data = await res.json();
      if (data.success && data.data) {
        setInquiries(data.data.inquiries || []);
        setStats(data.data.stats || { total: 0, new: 0, read: 0 });
      }
    } catch (error) {
      console.error('Failed to load contact inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'new' | 'read') => {
    try {
      const res = await fetch(`/api/contact/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        await loadInquiries();
        if (selectedInquiry?.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status });
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    setDeleteId(id);
    try {
      const res = await fetch(`/api/contact/inquiries/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setInquiries(inquiries.filter(i => i.id !== id));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
        setStats({
          ...stats,
          total: stats.total - 1,
          [selectedInquiry?.status || 'new']: (stats[selectedInquiry?.status || 'new'] as number) - 1
        });
      } else {
        alert('Failed to delete message');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('An error occurred while deleting');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || inquiry.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: ContactInquiry['status']) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
      read: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
    };

    const icons: Record<string, React.ReactNode> = {
      new: <Mail className="h-3.5 w-3.5" />,
      read: <Eye className="h-3.5 w-3.5" />,
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground">Manage messages from your contact form</p>
        </div>
        <button
          onClick={loadInquiries}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <MessageSquare className="h-10 w-10 text-primary opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New</p>
              <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
            </div>
            <Mail className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Read</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.read}</p>
            </div>
            <Eye className="h-10 w-10 text-yellow-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filterStatus === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('new')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filterStatus === 'new'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            New ({stats.new})
          </button>
          <button
            onClick={() => setFilterStatus('read')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filterStatus === 'read'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-foreground hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Read ({stats.read})
          </button>
        </div>
      </div>

      {/* Messages List */}
      {filteredInquiries.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg text-muted-foreground">
            {searchTerm ? 'No messages found matching your search.' : 'No messages yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all cursor-pointer ${
                selectedInquiry?.id === inquiry.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedInquiry(inquiry)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-foreground truncate">
                      {inquiry.name}
                    </h3>
                    {getStatusBadge(inquiry.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{inquiry.email}</p>
                  {inquiry.company && (
                    <p className="text-sm text-muted-foreground mb-1">{inquiry.company}</p>
                  )}
                  <p className="text-sm font-medium text-foreground mb-1">{inquiry.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{inquiry.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(inquiry.submittedAt)}
                    </span>
                    {inquiry.language && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                        {inquiry.language.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextStatus = inquiry.status === 'new' ? 'read' : 'new';
                      handleUpdateStatus(inquiry.id, nextStatus);
                    }}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Mark as next status"
                  >
                    <Eye className="h-4 w-4 text-foreground" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(inquiry.id);
                    }}
                    disabled={deleteId === inquiry.id}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Message Details</h3>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              {getStatusBadge(selectedInquiry.status)}
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{selectedInquiry.email}</p>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{selectedInquiry.phone}</p>
                  </div>
                )}
                {selectedInquiry.company && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Company</p>
                    <p className="font-medium">{selectedInquiry.company}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="font-medium">{selectedInquiry.subject}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Message</p>
                <p className="font-medium whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  {selectedInquiry.message}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                <span>Submitted: {formatDate(selectedInquiry.submittedAt)}</span>
                <span>IP: {selectedInquiry.ipAddress}</span>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  const nextStatus = selectedInquiry.status === 'new' ? 'read' : 'new';
                  handleUpdateStatus(selectedInquiry.id, nextStatus);
                }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Mark as {selectedInquiry.status === 'new' ? 'Read' : 'New'}
              </button>
              <button
                onClick={() => {
                  setSelectedInquiry(null);
                  handleDelete(selectedInquiry.id);
                }}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
