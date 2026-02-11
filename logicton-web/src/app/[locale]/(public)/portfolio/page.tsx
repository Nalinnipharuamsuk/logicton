"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { PortfolioItem, Service } from '@/types';
import { EditableText } from '@/components/EditableText';

interface InlineContent {
    [key: string]: string;
}

export default function PortfolioPage() {
    const locale = useLocale();
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [inlineContent, setInlineContent] = useState<InlineContent>({});
    const [contentLoaded, setContentLoaded] = useState(false);
    const itemsPerPage = 6;

    // Load inline edited content
    useEffect(() => {
        const loadInlineContent = async () => {
            setContentLoaded(false);
            try {
                const res = await fetch(`/api/content/inline-edit?page=portfolio&locale=${locale}`);
                const data = await res.json();
                if (data.success && data.data) {
                    setInlineContent(data.data);
                }
            } catch (error) {
                console.error('Failed to load inline content:', error);
            } finally {
                setContentLoaded(true);
            }
        };
        loadInlineContent();
    }, [locale]);

    // Load portfolio and services data
    useEffect(() => {
        Promise.all([
            fetch('/api/content/portfolio'),
            fetch('/api/content/services')
        ])
        .then(([portfolioRes, servicesRes]) => Promise.all([
            portfolioRes.json(),
            servicesRes.json()
        ]))
        .then(([portfolioData, servicesData]) => {
            if (portfolioData.success && portfolioData.data) {
                setPortfolio(portfolioData.data.filter((item: PortfolioItem) => item.isActive));
            }
            if (servicesData.success && servicesData.data) {
                setServices(servicesData.data.filter((service: Service) => service.isActive));
            }
        })
        .catch(console.error);
    }, []);

    // Show loading state until inline content is loaded
    if (!contentLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    // Helper to get content (inline edited content takes priority over default)
    const getContent = (path: string, defaultValue: string): string => {
        return inlineContent[path] || defaultValue;
    };

    const filteredPortfolio = filter === 'all'
        ? portfolio
        : portfolio.filter(item => item.category === filter);

    const totalPages = Math.ceil(filteredPortfolio.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedPortfolio = filteredPortfolio.slice(startIndex, startIndex + itemsPerPage);

    // Get categories from active services
    const servicesCategories = Array.from(new Set(services.map((service: Service) => service.category)));
    const categories = ['all', ...servicesCategories];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header Section - Premium Design with Gradients and Glow */}
            <section className="relative overflow-hidden py-20 contact-hero-section">
                {/* Animated floating orbs with glow effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="contact-hero-orb-1 -top-20 -right-20"></div>
                    <div className="contact-hero-orb-2 -bottom-20 -left-20"></div>
                    <div className="contact-hero-orb-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div className="relative z-10 max-w-[1400px] mx-auto px-6">
                    {/* Badge */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full contact-hero-badge text-sm font-semibold transition-all duration-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <EditableText
                                value={getContent('portfolio.header.badge', locale === 'th' ? 'ผลงานของเรา' : 'OUR PORTFOLIO')}
                                path="portfolio.header.badge"
                                locale={locale as 'th' | 'en'}
                                className=""
                            />
                        </div>
                    </div>

                    {/* Main Title */}
                    <EditableText
                        value={getContent('portfolio.header.title', locale === 'th' ? 'ผลกระทบจาก<br />นวัตกรรมของเรา' : 'Our Impact Through<br />Innovation')}
                        path="portfolio.header.title"
                        locale={locale as 'th' | 'en'}
                        type="heading"
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-center contact-hero-title mb-6 leading-tight max-w-4xl mx-auto"
                    />

                    {/* Description */}
                    <EditableText
                        value={getContent('portfolio.header.description',
                            locale === 'th'
                                ? 'สำรวจวิธีที่ Logicton เปลี่ยนแปลงอุตสาหกรรมผ่านซอฟต์แวร์ที่สั่งทำขึ้นโดยเฉพาะและเทคโนโลยีขั้นสูง เรามอบผลลัพธ์ที่สำคัญ'
                                : 'Explore how Logicton transforms industries through custom software and cutting-edge technology. We deliver results that matter.')}
                        path="portfolio.header.description"
                        locale={locale as 'th' | 'en'}
                        type="paragraph"
                        className="text-center contact-hero-subtitle max-w-3xl mx-auto text-base md:text-lg leading-relaxed"
                    />
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 md:py-12 bg-card border-b border-border">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex flex-wrap gap-3 items-center">
                        {categories.map((cat) => {
                            const serviceTitle = cat === 'all'
                                ? getContent('portfolio.filter.all', locale === 'th' ? 'โปรเจกต์ทั้งหมด' : 'ALL PROJECTS')
                                : services.find((s: Service) => s.category === cat)?.title[locale as 'th' | 'en'] || cat.toUpperCase();
                            return (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setFilter(cat);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 md:px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                                        filter === cat
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-muted text-foreground hover:bg-muted-foreground/10'
                                    }`}
                                >
                                    {serviceTitle}
                                </button>
                            );
                        })}
                        <div className="ml-auto">
                            <button className="flex items-center gap-2 px-4 py-2 text-foreground font-semibold hover:bg-muted rounded-lg transition-colors">
                                <EditableText
                                    value={getContent('portfolio.filter.sort', locale === 'th' ? 'ล่าสุด' : 'Most Recent')}
                                    path="portfolio.filter.sort"
                                    locale={locale as 'th' | 'en'}
                                    className=""
                                />
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="py-16 md:py-24 bg-card">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {displayedPortfolio.map((item) => (
                            <Link
                                key={item.id}
                                href={`/${locale}/portfolio/${item.id}`}
                                className="group flex flex-col rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-video bg-gray-200 dark:bg-gray-200 overflow-hidden">
                                    {item.images && item.images.length > 0 ? (
                                        <img
                                            src={item.images[0]}
                                            alt={item.title[locale as 'th' | 'en']}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gray-200">
                                            <span className="!text-gray-500">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 portfolio-card-content flex flex-col">
                                    <p className="portfolio-category text-xs font-semibold uppercase tracking-wider mb-2">
                                        {services.find((s: Service) => s.category === item.category)?.title[locale as 'th' | 'en'] || item.category}
                                    </p>
                                    <h3 className="text-lg md:text-xl font-bold portfolio-card-title mb-3 transition-colors line-clamp-2 h-14">
                                        {item.title[locale as 'th' | 'en']}
                                    </h3>
                                    <p className="portfolio-card-desc text-sm line-clamp-2">
                                        {item.description && item.description[locale as 'th' | 'en']}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-3 mt-12 md:mt-16">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-full font-semibold transition-all ${
                                        page === currentPage
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-muted text-foreground hover:bg-muted-foreground/10'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section - Premium Design */}
            <section className="py-20 md:py-32 portfolio-cta-section text-white relative">
                {/* Floating decorative orbs */}
                <div className="portfolio-cta-orb portfolio-cta-orb-1"></div>
                <div className="portfolio-cta-orb portfolio-cta-orb-2"></div>

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <EditableText
                            value={getContent('portfolio.cta.title', locale === 'th' ? 'พร้อมสร้าง<Br />นวัตกรรมครั้งใหญ่ของคุณหรือยัง?' : 'Ready to build your next<br />breakthrough?')}
                            path="portfolio.cta.title"
                            locale={locale as 'th' | 'en'}
                            type="heading"
                            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight portfolio-cta-title"
                        />
                        <EditableText
                            value={getContent('portfolio.cta.description',
                                locale === 'th'
                                    ? 'ร่วมเป็นส่วนหนึ่งขององค์กรชั้นนำที่ไว้วางใจ Logicton สำหรับโครงการซอฟต์แวร์ที่สำคัญที่สุดของพวกเขา'
                                    : 'Join the ranks of leading enterprises that trust Logicton for their most critical software initiatives.')}
                            path="portfolio.cta.description"
                            locale={locale as 'th' | 'en'}
                            type="paragraph"
                            className="portfolio-cta-desc mb-10 text-base md:text-lg leading-relaxed"
                        />
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <EditableText
                                value={getContent('portfolio.cta.button1', locale === 'th' ? 'นัดหมายปรึกษา' : 'Schedule a Consultation')}
                                path="portfolio.cta.button1"
                                locale={locale as 'th' | 'en'}
                                type="text"
                                className="px-8 py-4 md:px-12 md:py-5 text-white font-semibold rounded-xl cursor-pointer inline-block text-center portfolio-cta-button-primary"
                            />
                            <EditableText
                                value={getContent('portfolio.cta.button2', locale === 'th' ? 'กระบวนการของเรา' : 'Our Process')}
                                path="portfolio.cta.button2"
                                locale={locale as 'th' | 'en'}
                                type="text"
                                className="px-8 py-4 md:px-12 md:py-5 text-white font-semibold rounded-xl cursor-pointer inline-block text-center portfolio-cta-button-secondary"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
