"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Github, Calendar, Tag, User, Globe, ChevronRight, Sparkles, Link2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { PortfolioItem } from '@/types';
import { EditableText } from '@/components/EditableText';
import { EditModeBar } from '@/components/EditModeBar';
import { useEditMode } from '@/providers/EditModeProvider';

function PortfolioDetailPageContent() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { isEditMode } = useEditMode();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [inlineContent, setInlineContent] = useState<Record<string, string>>({});
  const [inlineContentLoaded, setInlineContentLoaded] = useState(false);

  useEffect(() => {
    // Load inline edited content for the portfolio detail page
    setInlineContentLoaded(false);
    const loadInlineContent = () => {
      if (isEditMode) {
        fetch(`/api/content/inline-edit?page=portfolio-detail&locale=${locale}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              setInlineContent(data.data);
            }
          })
          .catch(console.error)
          .finally(() => setInlineContentLoaded(true));
      } else {
        setInlineContentLoaded(true);
      }
    };
    loadInlineContent();
  }, [isEditMode, locale]);

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/content/portfolio/${params.id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setItem(data.data);
        }
      } catch (error) {
        console.error('Failed to load portfolio item:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [params.id]);

  // Helper function to get content value with fallback
  const getContent = (path: string, fallback: string) => {
    return inlineContent[path] || fallback;
  };

  const getCategoryLabel = (category: PortfolioItem['category']) => {
    switch (category) {
      case 'web':
        return locale === 'th' ? 'เว็บไซต์' : 'Web Development';
      case 'mobile':
        return locale === 'th' ? 'มือถือ' : 'Mobile App';
      case 'animation':
        return locale === 'th' ? 'แอนิเมชัน' : 'Animation';
      case 'framework':
        return locale === 'th' ? 'เฟรมเวิร์ก' : 'Framework';
      default:
        return category;
    }
  };

  const getCategoryStyles = (category: PortfolioItem['category']) => {
    switch (category) {
      case 'web':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          light: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-200'
        };
      case 'mobile':
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
          light: 'bg-purple-50',
          text: 'text-purple-600',
          border: 'border-purple-200'
        };
      case 'animation':
        return {
          bg: 'bg-gradient-to-r from-pink-500 to-pink-600',
          light: 'bg-pink-50',
          text: 'text-pink-600',
          border: 'border-pink-200'
        };
      case 'framework':
        return {
          bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
          light: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-200'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          light: 'bg-gray-50',
          text: 'text-gray-600',
          border: 'border-gray-200'
        };
    }
  };

  if (loading || !inlineContentLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-background to-background/80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-muted border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{locale === 'th' ? 'กำลังโหลด...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 bg-gradient-to-br from-background to-background/80">
        <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Tag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-3 text-foreground">{locale === 'th' ? 'ไม่พบผลงาน' : 'Portfolio Item Not Found'}</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          {locale === 'th'
            ? 'ไม่พบผลงานที่คุณค้นหา'
            : 'The portfolio item you are looking for does not exist'}
        </p>
        <Link
          href={`/${locale}/portfolio`}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-5 w-5" />
          {locale === 'th' ? 'กลับไปหน้าผลงาน' : 'Back to Portfolio'}
        </Link>
      </div>
    );
  }

  const categoryStyles = getCategoryStyles(item.category);

  return (
    <div className="min-h-screen">
      <EditModeBar />
      {/* Header Bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <Link
            href={`/${locale}/portfolio`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === 'th' ? 'กลับไปหน้าผลงาน' : 'Back to Portfolio'}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}/portfolio`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            {locale === 'th' ? 'ผลงาน' : 'Portfolio'}
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground font-medium">{item.title[locale as 'th' | 'en']}</span>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column - Image and Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Main Image */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-black/50 group">
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted animate-pulse" />
              {item.images && item.images.length > 0 && (
                <Image
                  src={item.images[0]}
                  alt={item.title[locale as 'th' | 'en']}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              )}
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Gallery */}
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {item.images.slice(1).map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-2xl overflow-hidden shadow-lg dark:shadow-black/30 group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted animate-pulse" />
                    <Image
                      src={image}
                      alt={`${item.title[locale as 'th' | 'en']} ${index + 2}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            )}

            {/* Title Section */}
            <div className="space-y-5">
              {/* Category & Featured Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg ${categoryStyles.bg}`}>
                  <Tag className="h-4 w-4" />
                  {getCategoryLabel(item.category)}
                </span>
                {item.featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl text-xs font-bold shadow-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    {locale === 'th' ? 'แนะนำ' : 'Featured'}
                  </span>
                )}
              </div>

              {/* Title */}
              <EditableText
                value={getContent(`portfolio.${item.id}.title`, item.title[locale as 'th' | 'en'])}
                path={`portfolio.${item.id}.title`}
                locale={locale as 'th' | 'en'}
                type="heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight"
              />

              {/* Description */}
              <EditableText
                value={getContent(`portfolio.${item.id}.description`, item.description[locale as 'th' | 'en'])}
                path={`portfolio.${item.id}.description`}
                locale={locale as 'th' | 'en'}
                type="paragraph"
                className="text-base text-muted-foreground leading-relaxed max-w-2xl"
              />
            </div>
          </div>

          {/* Right Column - Project Details, Technologies, Actions */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              {/* Project Details Card */}
              <div className="bg-card rounded-3xl shadow-xl border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <EditableText
                    value={getContent('portfolio.detail.projectTitle', locale === 'th' ? 'รายละเอียดโปรเจกต์' : 'Project Details')}
                    path="portfolio.detail.projectTitle"
                    locale={locale as 'th' | 'en'}
                    type="text"
                    className=""
                  />
                </h3>
                <div className="space-y-4">
                  {/* Client */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/50 dark:to-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 group hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">
                        <EditableText
                          value={getContent('portfolio.detail.clientLabel', locale === 'th' ? 'ลูกค้า' : 'Client')}
                          path="portfolio.detail.clientLabel"
                          locale={locale as 'th' | 'en'}
                          type="text"
                          className=""
                        />
                      </p>
                      <p className="font-bold text-foreground truncate">{item.client.name}</p>
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-50/50 dark:from-purple-950/50 dark:to-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/50 group hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-0.5">
                        <EditableText
                          value={getContent('portfolio.detail.industryLabel', locale === 'th' ? 'อุตสาหกรรม' : 'Industry')}
                          path="portfolio.detail.industryLabel"
                          locale={locale as 'th' | 'en'}
                          type="text"
                          className=""
                        />
                      </p>
                      <p className="font-bold text-foreground truncate">{item.client.industry}</p>
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-950/50 dark:to-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 group hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5">
                        <EditableText
                          value={getContent('portfolio.detail.completedLabel', locale === 'th' ? 'วันที่เสร็จสิ้น' : 'Completed')}
                          path="portfolio.detail.completedLabel"
                          locale={locale as 'th' | 'en'}
                          type="text"
                          className=""
                        />
                      </p>
                      <p className="font-bold text-foreground truncate">{item.completedDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technologies Card */}
              {item.technologies && item.technologies.length > 0 && (
                <div className="bg-card rounded-3xl shadow-xl border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-purple-500" />
                    <EditableText
                      value={getContent('portfolio.detail.technologiesTitle', locale === 'th' ? 'เทคโนโลยีที่ใช้' : 'Technologies')}
                      path="portfolio.detail.technologiesTitle"
                      locale={locale as 'th' | 'en'}
                      type="text"
                      className=""
                    />
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {item.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-muted to-muted text-foreground rounded-xl text-sm font-semibold border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {item.demoUrl && (
                  <a
                    href={item.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200/50 dark:shadow-black/30 hover:shadow-xl hover:shadow-blue-300/60 dark:hover:shadow-black/50 transform hover:-translate-y-0.5"
                  >
                    <Globe className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <EditableText
                      value={getContent('portfolio.detail.demoLabel', locale === 'th' ? 'ดู Demo' : 'Live Demo')}
                      path="portfolio.detail.demoLabel"
                      locale={locale as 'th' | 'en'}
                      type="text"
                      className=""
                    />
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </a>
                )}
                {item.githubUrl && (
                  <a
                    href={item.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-2xl hover:from-gray-900 hover:to-black transition-all shadow-lg shadow-gray-300/50 dark:shadow-black/30 hover:shadow-xl hover:shadow-gray-400/60 dark:hover:shadow-black/50 transform hover:-translate-y-0.5"
                  >
                    <Github className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    GitHub
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioDetailPage() {
  return <PortfolioDetailPageContent />;
}
