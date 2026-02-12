"use client";

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, ChevronDown, MessageSquare, CreditCard, RefreshCw, FileText, Sparkles } from 'lucide-react';
import { EditableText } from '@/components/EditableText';
import { EditableImage } from '@/components/EditableImage';
import ServiceIcon from '@/components/ServiceIcon';

interface InlineContent {
    [key: string]: string;
}

interface Service {
    id: string;
    icon: string;
    title: { th: string; en: string };
    description: { th: string; en: string };
    features?: { th: string[]; en: string[] };
    isActive: boolean;
}

interface PortfolioItem {
    id: string;
    title: { th: string; en: string };
    description?: { th: string; en: string };
    category: string;
    images: string[];
    isActive: boolean;
}

// Step icons configuration
const stepIcons = {
    1: MessageSquare,
    2: CreditCard,
    3: RefreshCw,
    4: FileText
};

function HomeContent() {
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [loadingPortfolio, setLoadingPortfolio] = useState(true);
    const [services, setServices] = useState<Service[]>([]);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [inlineContent, setInlineContent] = useState<InlineContent>({});
    const [contentLoaded, setContentLoaded] = useState(false);

    // Load inline edited content
    useEffect(() => {
        const loadInlineContent = async () => {
            setContentLoaded(false);
            try {
                const res = await fetch(`/api/content/inline-edit?page=home&locale=${locale}`);
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

    // Helper to get content (inline edited content takes priority over default)
    const getContent = (path: string, defaultValue: string): string => {
        return inlineContent[path] || defaultValue;
    };

    useEffect(() => {
        fetch('/api/content/services')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setServices(data.data.filter((s: Service) => s.isActive));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        fetch('/api/content/portfolio')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setPortfolio(data.data.filter((item: PortfolioItem) => item.isActive).slice(0, 3));
                }
            })
            .catch(console.error)
            .finally(() => setLoadingPortfolio(false));
    }, []);

    // Show loading state until inline content is loaded
    if (!contentLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-b from-background to-background/80">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        {/* Left Content */}
                        <div className="space-y-6">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/80 dark:to-pink-900/80 text-purple-700 dark:text-white text-sm font-semibold">
                                <EditableText
                                    value={getContent('home.hero.badge', locale === 'th' ? 'นวัตกรรมเทคโนโลยี' : 'INNOVATING TECH')}
                                    path="home.hero.badge"
                                    locale={locale as 'th' | 'en'}
                                    className="text-purple-700 dark:text-white"
                                />
                            </div>

                            {/* Heading */}
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                                {locale === 'th' ? (
                                    <>
                                        <EditableText
                                            value={getContent('home.hero.title1', 'สร้าง')}
                                            path="home.hero.title1"
                                            locale={locale as 'th' | 'en'}
                                            className=""
                                        />
                                        <br />
                                        <span className="text-blue-600">
                                            <EditableText
                                                value={getContent('home.hero.title2', 'อนาคต')}
                                                path="home.hero.title2"
                                                locale={locale as 'th' | 'en'}
                                                className=""
                                            />
                                        </span>
                                        {' '}
                                        <EditableText
                                            value={getContent('home.hero.title3', 'ของวิศวกรรม')}
                                            path="home.hero.title3"
                                            locale={locale as 'th' | 'en'}
                                            className=""
                                        />
                                    </>
                                ) : (
                                    <>
                                        <EditableText
                                            value={getContent('home.hero.title1', 'Engineering')}
                                            path="home.hero.title1"
                                            locale={locale as 'th' | 'en'}
                                            className=""
                                        />
                                        <br />
                                        <span className="text-blue-600">
                                            <EditableText
                                                value={getContent('home.hero.title2', 'Future')}
                                                path="home.hero.title2"
                                                locale={locale as 'th' | 'en'}
                                                className=""
                                            />
                                        </span>
                                        {' '}
                                        <EditableText
                                            value={getContent('home.hero.title3', 'Solutions')}
                                            path="home.hero.title3"
                                            locale={locale as 'th' | 'en'}
                                            className=""
                                        />
                                    </>
                                )}
                            </h1>

                            {/* Description */}
                            <EditableText
                                value={getContent('home.hero.description', locale === 'th'
                                    ? 'Logicton ให้บริการโซลูชันซอฟต์แวร์และเทคโนโลยีล้ำสมัยเพื่อเพิ่มการเติบโต ปรับปรุงประสิทธิภาพ และแก้ไขความท้าทายทางเทคนิคที่ซับซ้อน'
                                    : 'Logicton delivers scalable software and cutting-edge technology strategies to empower global enterprises through precision engineering and AI-driven growth.')}
                                path="home.hero.description"
                                locale={locale as 'th' | 'en'}
                                type="paragraph"
                                className="text-lg text-muted-foreground"
                            />

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    href={`/${locale}/contact`}
                                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {locale === 'th' ? 'เริ่มต้นใช้งาน' : 'Get Started'}
                                </Link>
                                <Link
                                    href={`/${locale}/portfolio`}
                                    className="px-8 py-3 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
                                >
                                    {locale === 'th' ? 'ดูผลงาน' : 'View Portfolio'}
                                </Link>
                            </div>
                        </div>

                        {/* Right - Image/Graphic */}
                        <div className="hidden md:block">
                            <div className="rounded-2xl overflow-hidden aspect-video shadow-2xl border border-blue-500/30">
                                <EditableImage
                                    src="/images/web-preview.png"
                                    alt={locale === 'th' ? 'โซลูชันเทคโนโลยี' : 'Tech Solutions'}
                                    path="home.hero.image"
                                    locale={locale as 'th' | 'en'}
                                    width={800}
                                    height={450}
                                    className="w-full h-full object-cover"
                                    inlineContent={inlineContent}
                                    contentLoaded={contentLoaded}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-blue-400 dark:text-blue-300 mb-2">10+</div>
                            <EditableText
                                value={getContent('home.stats.stat1', locale === 'th' ? 'ปีของประสบการณ์' : 'YEARS EXPERIENCE')}
                                path="home.stats.stat1"
                                locale={locale as 'th' | 'en'}
                                className="text-sm md:text-base text-gray-300 dark:text-gray-400"
                            />
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-blue-400 dark:text-blue-300 mb-2">200+</div>
                            <EditableText
                                value={getContent('home.stats.stat2', locale === 'th' ? 'โครงการที่เสร็จสิ้น' : 'PROJECTS DELIVERED')}
                                path="home.stats.stat2"
                                locale={locale as 'th' | 'en'}
                                className="text-sm md:text-base text-gray-300 dark:text-gray-400"
                            />
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-blue-400 dark:text-blue-300 mb-2">50+</div>
                            <EditableText
                                value={getContent('home.stats.stat3', locale === 'th' ? 'พันธมิตรทั่วโลก' : 'GLOBAL PARTNERS')}
                                path="home.stats.stat3"
                                locale={locale as 'th' | 'en'}
                                className="text-sm md:text-base text-gray-300 dark:text-gray-400"
                            />
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-blue-400 dark:text-blue-300 mb-2">99%</div>
                            <EditableText
                                value={getContent('home.stats.stat4', locale === 'th' ? 'ความพึงพอใจของลูกค้า' : 'CLIENT RETENTION')}
                                path="home.stats.stat4"
                                locale={locale as 'th' | 'en'}
                                className="text-sm md:text-base text-gray-300 dark:text-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Core Services */}
            <section className="py-24 md:py-32 bg-background relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-[1400px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-card-foreground">
                            <EditableText
                                value={getContent('home.services.title', locale === 'th' ? 'บริการหลักของเรา' : 'Our Core Services')}
                                path="home.services.title"
                                locale={locale as 'th' | 'en'}
                                className=""
                            />
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {locale === 'th'
                                ? 'เราแก้ปัญหาที่ซับซ้อนด้วยวิธีแก้ปัญหาทางเทคนิคที่เรียบง่าย'
                                : 'We turn complex problems into simplified, robust technical solutions.'
                            }
                        </p>
                    </div>

                    {!loading && services.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {services.map((service, index) => {
                                // Gradients for each card
                                const cardGradients = [
                                    'from-blue-500/10 via-purple-500/10 to-pink-500/10',
                                    'from-cyan-500/10 via-blue-500/10 to-indigo-500/10',
                                    'from-violet-500/10 via-purple-500/10 to-fuchsia-500/10',
                                    'from-sky-500/10 via-cyan-500/10 to-teal-500/10',
                                ];

                                const iconGradients = [
                                    'from-blue-500 to-blue-600',
                                    'from-purple-500 to-purple-600',
                                    'from-indigo-500 to-indigo-600',
                                    'from-cyan-500 to-cyan-600',
                                ];

                                return (
                                    <div
                                        key={service.id}
                                        className="group h-full"
                                    >
                                        <Link
                                            href={`/${locale}/services/${service.id}`}
                                            className="relative flex flex-col h-full p-8 bg-card border border-border rounded-3xl hover:shadow-2xl hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                                        >
                                            {/* Gradient background overlay on hover */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                            {/* Shimmer effect */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                            </div>

                                            {/* Content */}
                                            <div className="relative z-10 flex flex-col h-full">
                                                {/* Icon with enhanced glow */}
                                                <div className="mb-6 inline-block w-fit">
                                                    <div className="relative">
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${iconGradients[index % iconGradients.length]} blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 rounded-2xl`}></div>
                                                        <div className={`relative w-16 h-16 bg-gradient-to-br ${iconGradients[index % iconGradients.length]} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-all duration-500 shadow-xl group-hover:shadow-2xl`}>
                                                            <ServiceIcon iconName={service.icon} className="w-8 h-8 drop-shadow-lg" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                                    {service.title[locale as 'th' | 'en']}
                                                </h3>

                                                {/* Description */}
                                                <p className="text-sm text-muted-foreground mb-6 flex-grow line-clamp-3 leading-relaxed">
                                                    {service.description[locale as 'th' | 'en']}
                                                </p>

                                                {/* Features */}
                                                {service.features && service.features[locale as 'th' | 'en'] && (
                                                    <ul className="space-y-2.5 mb-6">
                                                        {service.features[locale as 'th' | 'en'].slice(0, 3).map((feature, fIdx) => (
                                                            <li key={fIdx} className="flex items-center gap-2.5 text-xs">
                                                                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${iconGradients[index % iconGradients.length]}`}>
                                                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                                                </div>
                                                                <span className="text-muted-foreground line-clamp-1">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {/* Learn More Link - Enhanced */}
                                                <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-4 transition-all duration-300 pt-4 mt-auto border-t border-border/50">
                                                    <span>{locale === 'th' ? 'ดูรายละเอียด' : 'Learn More'}</span>
                                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                                                </div>
                                            </div>

                                            {/* Corner accent */}
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Why Leaders Choose Section */}
            <section className="py-20">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left - Image */}
                        <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl max-w-md mx-auto md:mx-0">
                            <EditableImage
                                src="/images/mobile-app.png"
                                alt={locale === 'th' ? 'ทีมมืออาชีพ' : 'Professional Team'}
                                path="home.whyChoose.image"
                                locale={locale as 'th' | 'en'}
                                width={500}
                                height={375}
                                className="w-full h-full object-cover"
                                inlineContent={inlineContent}
                                contentLoaded={contentLoaded}
                            />
                        </div>

                        {/* Right - Content */}
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                <EditableText
                                    value={getContent('home.whyChoose.title', locale === 'th' ? 'ทำไมผู้นำธุรกิจเลือก Logicton' : 'Why Leaders Choose Logicton')}
                                    path="home.whyChoose.title"
                                    locale={locale as 'th' | 'en'}
                                    className=""
                                />
                            </h2>
                            <EditableText
                                value={getContent('home.whyChoose.description', locale === 'th'
                                    ? 'เราไม่ได้เพียงแค่เขียนโค้ด เราสร้างผลลัพธ์ วิธีการของเรามีความพึงพอใจจากลูกค้าและการทำงานที่มั่นคงภายยาว'
                                    : 'We do not just write code; we architect results. Our methodology combines agile speed with technical stability.')}
                                path="home.whyChoose.description"
                                locale={locale as 'th' | 'en'}
                                type="paragraph"
                                className="text-lg text-muted-foreground mb-8"
                            />
                            <ul className="space-y-4">
                                {/* Why Choose Item 1 */}
                                <li className="flex gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <EditableText
                                            value={getContent('home.whyChoose.item1.title', locale === 'th' ? 'ความเชี่ยวชาญด้านเทคนิค' : 'Technical Expertise')}
                                            path="home.whyChoose.item1.title"
                                            locale={locale as 'th' | 'en'}
                                            className="block font-bold text-lg mb-1"
                                        />
                                        <EditableText
                                            value={getContent('home.whyChoose.item1.description', locale === 'th'
                                                ? 'ทีมของเรามีประสบการณ์มากมายในการสร้างโซลูชันเทคนิคขั้นสูง'
                                                : 'Our senior engineers ensure every line of code meets the highest quality standards.')}
                                            path="home.whyChoose.item1.description"
                                            locale={locale as 'th' | 'en'}
                                            className="text-muted-foreground"
                                        />
                                    </div>
                                </li>
                                {/* Why Choose Item 2 */}
                                <li className="flex gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <EditableText
                                            value={getContent('home.whyChoose.item2.title', locale === 'th' ? 'วิธีการอ่อนตัว' : 'Agile Methodology')}
                                            path="home.whyChoose.item2.title"
                                            locale={locale as 'th' | 'en'}
                                            className="block font-bold text-lg mb-1"
                                        />
                                        <EditableText
                                            value={getContent('home.whyChoose.item2.description', locale === 'th'
                                                ? 'เราใช้วิธีการทำงานแบบอ่อนตัวเพื่อให้โครงการของคุณสามารถปรับตัวได้อย่างรวดเร็ว'
                                                : 'We maintain regular communication, keeping your project on track with weekly sprints to meet your goals.')}
                                            path="home.whyChoose.item2.description"
                                            locale={locale as 'th' | 'en'}
                                            className="text-muted-foreground"
                                        />
                                    </div>
                                </li>
                                {/* Why Choose Item 3 */}
                                <li className="flex gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <EditableText
                                            value={getContent('home.whyChoose.item3.title', locale === 'th' ? 'การสนับสนุน 24/7' : 'End-to-End Support')}
                                            path="home.whyChoose.item3.title"
                                            locale={locale as 'th' | 'en'}
                                            className="block font-bold text-lg mb-1"
                                        />
                                        <EditableText
                                            value={getContent('home.whyChoose.item3.description', locale === 'th'
                                                ? 'ที่ Logicton เราให้บริการสนับสนุนอย่างต่อเนื่องจากการออกแบบจนถึงการปรับปรุงในระยะยาว'
                                                : 'From initial concept to deployment and long-term maintenance.')}
                                            path="home.whyChoose.item3.description"
                                            locale={locale as 'th' | 'en'}
                                            className="text-muted-foreground"
                                        />
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Projects Section */}
            <section className="py-20">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex justify-between items-center mb-16">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                <EditableText
                                    value={getContent('home.projects.title', locale === 'th' ? 'โครงการล่าสุด' : 'Recent Projects')}
                                    path="home.projects.title"
                                    locale={locale as 'th' | 'en'}
                                    className=""
                                />
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                <EditableText
                                    value={getContent('home.projects.subtitle', locale === 'th'
                                        ? 'ดูผลงานล่าสุดของเรา'
                                        : 'Check out our latest work')}
                                    path="home.projects.subtitle"
                                    locale={locale as 'th' | 'en'}
                                    className=""
                                />
                            </p>
                        </div>
                        <Link
                            href={`/${locale}/portfolio`}
                            className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                        >
                            {locale === 'th' ? 'ดูทั้งหมด' : 'View All'}
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>

                    {!loadingPortfolio && portfolio.length > 0 && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {portfolio.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/${locale}/portfolio/${item.id}`}
                                    className="group block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-video bg-gray-200 dark:bg-slate-700 overflow-hidden">
                                        {item.images && item.images.length > 0 ? (
                                            <Image
                                                src={item.images[0]}
                                                alt={item.title[locale as 'th' | 'en']}
                                                width={400}
                                                height={225}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gray-300 dark:bg-slate-600">
                                                <span className="text-gray-500 dark:text-gray-400">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 portfolio-card-content">
                                        <p className="portfolio-category text-xs font-semibold uppercase tracking-wider mb-2">
                                            {item.category}
                                        </p>
                                        <h3 className="text-lg md:text-xl font-bold portfolio-card-title mb-3 transition-colors line-clamp-2">
                                            {item.title[locale as 'th' | 'en']}
                                        </h3>
                                        <p className="portfolio-card-desc text-sm line-clamp-2">
                                            {item.description && item.description[locale as 'th' | 'en']}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Mobile View All Link */}
                    <div className="mt-12 md:hidden text-center">
                        <Link
                            href={`/${locale}/portfolio`}
                            className="inline-flex items-center gap-2 text-primary font-semibold"
                        >
                            {locale === 'th' ? 'ดูทั้งหมด' : 'View All'}
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* How We Work Section */}
            <section className="py-24 md:py-32 bg-background relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-8">
                            <Sparkles className="w-4 h-4" />
                            <EditableText
                                value={getContent('home.howWeWork.badge', locale === 'th' ? 'กระบวนการง่ายๆ' : 'Simple Process')}
                                path="home.howWeWork.badge"
                                locale={locale as 'th' | 'en'}
                                className=""
                            />
                        </div>
                        <EditableText
                            value={getContent('home.howWeWork.title', locale === 'th' ? 'วิธีการทำงานของเรา' : 'How We Work')}
                            path="home.howWeWork.title"
                            locale={locale as 'th' | 'en'}
                            type="heading"
                            className="text-4xl md:text-5xl font-bold mb-6 text-card-foreground"
                        />
                        <EditableText
                            value={getContent('home.howWeWork.subtitle', locale === 'th'
                                ? 'กระบวนการง่ายๆ เพื่อเปลี่ยนเว็บไซต์ของคุณให้เป็นผลงานที่ใช้งานได้จริง'
                                : 'A simple, proven process to bring your website to life.')}
                            path="home.howWeWork.subtitle"
                            locale={locale as 'th' | 'en'}
                            type="paragraph"
                            className="text-muted-foreground max-w-2xl mx-auto text-lg"
                        />
                    </div>

                    {/* Gradients for each card */}
                    {(() => {
                        const cardGradients = [
                            'from-blue-500/10 via-purple-500/10 to-pink-500/10',
                            'from-cyan-500/10 via-blue-500/10 to-indigo-500/10',
                            'from-violet-500/10 via-purple-500/10 to-fuchsia-500/10',
                            'from-sky-500/10 via-cyan-500/10 to-teal-500/10',
                        ];

                        const iconGradients = [
                            'from-blue-500 to-blue-600',
                            'from-purple-500 to-purple-600',
                            'from-indigo-500 to-indigo-600',
                            'from-cyan-500 to-cyan-600',
                        ];

                        const stepData = [
                            { number: 1, titlePath: 'home.howWeWork.step1.title', titleDefault: 'Inform details', titleTh: 'แจ้งรายละเอียด', descPath: 'home.howWeWork.step1.description', descDefault: 'Share your design preferences by sending reference images or examples you like. We use this information to understand your style and scope.', descTh: 'แชร์ความต้องการการออกแบบโดยส่งรูปอ้างอิงหรือแบบที่คุณชอบ เราจะใช้ข้อมูลนี้เพื่อทำความเข้าใจสไตล์และขอบเขต' },
                            { number: 2, titlePath: 'home.howWeWork.step2.title', titleDefault: 'Pay for service', titleTh: 'ชำระเงิน', descPath: 'home.howWeWork.step2.description', descDefault: 'Once the payment is confirmed, we begin the design process and deliver 3–6 design samples within the agreed timeframe.', descTh: 'เมื่อการชำระเงินถูกยืนยัน เราจะเริ่มกระบวนการออกแบบและส่งตัวอย่างการออกแบบ 3-6 แบบภายในระยะเวลาที่ตกลง' },
                            { number: 3, titlePath: 'home.howWeWork.step3.title', titleDefault: 'Modify the work', titleTh: 'ปรับแก้ผลงาน', descPath: 'home.howWeWork.step3.description', descDefault: 'Request revisions as needed. We offer unlimited revisions until you are fully satisfied.', descTh: 'ขอแก้ไขตามต้องการ เรามีการแก้ไขไม่จำกัดจนกว่าคุณจะพอใจ' },
                            { number: 4, titlePath: 'home.howWeWork.step4.title', titleDefault: 'Final file', titleTh: 'ไฟล์สุดท้าย', descPath: 'home.howWeWork.step4.description', descDefault: 'After approval, we deliver all final files via email in .AI, .PSD, .JPG, and .PNG formats.', descTh: 'หลังการอนุมัติ เราส่งไฟล์สุดท้ายทางอีเมลในรูปแบบ .AI, .PSD, .JPG, และ .PNG' },
                        ];

                        return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {stepData.map((step, index) => (
                                    <div key={step.number} className="group h-full">
                                        <div className="relative flex flex-col h-full p-8 bg-card border border-border rounded-3xl hover:shadow-2xl hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                                            {/* Gradient background overlay on hover */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                            {/* Shimmer effect */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                            </div>

                                            {/* Content */}
                                            <div className="relative z-10 flex flex-col h-full">
                                                {/* Icon with enhanced glow */}
                                                <div className="mb-6 inline-block w-fit">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-700/50 blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 rounded-2xl"></div>
                                                        <div className="relative w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-xl group-hover:shadow-2xl border border-gray-200 dark:border-gray-700">
                                                            <span className={`text-2xl font-extrabold bg-gradient-to-br ${iconGradients[index % iconGradients.length]} bg-clip-text text-transparent`}>
                                                                {step.number}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <EditableText
                                                    value={getContent(step.titlePath, locale === 'th' ? step.titleTh : step.titleDefault)}
                                                    path={step.titlePath}
                                                    locale={locale as 'th' | 'en'}
                                                    className="text-xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors duration-300"
                                                />

                                                {/* Description */}
                                                <EditableText
                                                    value={getContent(step.descPath, locale === 'th' ? step.descTh : step.descDefault)}
                                                    path={step.descPath}
                                                    locale={locale as 'th' | 'en'}
                                                    className="text-sm text-muted-foreground flex-grow line-clamp-3 leading-relaxed"
                                                />
                                            </div>

                                            {/* Corner accent */}
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <Link
                            href={`/${locale}/contact`}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {locale === 'th' ? 'เริ่มต้นโปรเจคต์ของคุณ' : 'Start Your Project'}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <EditableText
                            value={getContent('home.faq.title', locale === 'th' ? 'คำถามที่พบบ่อย' : 'Frequently Asked Questions')}
                            path="home.faq.title"
                            locale={locale as 'th' | 'en'}
                            type="heading"
                            className="text-3xl md:text-4xl font-bold mb-4"
                        />
                        <EditableText
                            value={getContent('home.faq.subtitle', locale === 'th'
                                ? 'คำตอบสำหรับคำถามที่พบบ่อยเกี่ยวกับบริการของเรา'
                                : 'Answers to common questions about our services')}
                            path="home.faq.subtitle"
                            locale={locale as 'th' | 'en'}
                            className="text-muted-foreground max-w-2xl mx-auto"
                        />
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {/* FAQ 1 */}
                        <div className="border border-border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-shadow">
                            <button
                                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                            >
                                <EditableText
                                    value={getContent('home.faq.item1.question', locale === 'th' ? 'โปรเจคต์ทัวๆ ใช้เวลานานเท่าไร?' : 'How long does a typical project take?')}
                                    path="home.faq.item1.question"
                                    locale={locale as 'th' | 'en'}
                                    className="font-semibold text-lg pr-4"
                                />
                                <ChevronDown
                                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                                        openFaq === 0 ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openFaq === 0 && (
                                <div className="px-6 pb-6">
                                    <EditableText
                                        value={getContent('home.faq.item1.answer', locale === 'th'
                                            ? 'โปรเจคต์ทัวๆ ใช้เวลาตั้งแต่ 2-6 สัปดาห์ ขึ้นอยู่กับความซับซ้อนและขอบเขตของโปรเจคต์'
                                            : 'Typical projects take 2-6 weeks, depending on complexity and scope.')}
                                        path="home.faq.item1.answer"
                                        locale={locale as 'th' | 'en'}
                                        className="text-muted-foreground leading-relaxed"
                                    />
                                </div>
                            )}
                        </div>
                        {/* FAQ 2 */}
                        <div className="border border-border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-shadow">
                            <button
                                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                            >
                                <EditableText
                                    value={getContent('home.faq.item2.question', locale === 'th' ? 'คุณให้บริการหลังการขายไหม?' : 'Do you provide after-sales support?')}
                                    path="home.faq.item2.question"
                                    locale={locale as 'th' | 'en'}
                                    className="font-semibold text-lg pr-4"
                                />
                                <ChevronDown
                                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                                        openFaq === 1 ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openFaq === 1 && (
                                <div className="px-6 pb-6">
                                    <EditableText
                                        value={getContent('home.faq.item2.answer', locale === 'th'
                                            ? 'ใ่่ ให้บริการสนับสนุนหลังการขายเพื่อให้แน่ใจว่าทุกอย่างทำงานได้ดี'
                                            : 'Yes, we provide after-sales support to ensure everything works perfectly.')}
                                        path="home.faq.item2.answer"
                                        locale={locale as 'th' | 'en'}
                                        className="text-muted-foreground leading-relaxed"
                                    />
                                </div>
                            )}
                        </div>
                        {/* FAQ 3 */}
                        <div className="border border-border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-shadow">
                            <button
                                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                            >
                                <EditableText
                                    value={getContent('home.faq.item3.question', locale === 'th' ? 'ค่าใช้จ่ายเป็นอย่างไร?' : 'How are your prices structured?')}
                                    path="home.faq.item3.question"
                                    locale={locale as 'th' | 'en'}
                                    className="font-semibold text-lg pr-4"
                                />
                                <ChevronDown
                                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                                        openFaq === 2 ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openFaq === 2 && (
                                <div className="px-6 pb-6">
                                    <EditableText
                                        value={getContent('home.faq.item3.answer', locale === 'th'
                                            ? 'เราให้ราคาที่โปร่งใสและแข่งขัน ขึ้นอยู่กับความต้องการของโปรเจคต์'
                                            : 'Our prices are transparent and competitive, based on project requirements.')}
                                        path="home.faq.item3.answer"
                                        locale={locale as 'th' | 'en'}
                                        className="text-muted-foreground leading-relaxed"
                                    />
                                </div>
                            )}
                        </div>
                        {/* FAQ 4 */}
                        <div className="border border-border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-shadow">
                            <button
                                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                            >
                                <EditableText
                                    value={getContent('home.faq.item4.question', locale === 'th' ? 'ฉันสามารถขอแก้ไขได้ไหม?' : 'Can I request revisions?')}
                                    path="home.faq.item4.question"
                                    locale={locale as 'th' | 'en'}
                                    className="font-semibold text-lg pr-4"
                                />
                                <ChevronDown
                                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                                        openFaq === 3 ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openFaq === 3 && (
                                <div className="px-6 pb-6">
                                    <EditableText
                                        value={getContent('home.faq.item4.answer', locale === 'th'
                                            ? 'ใ่่ เราให้บริการแก้ไขไม่จำกัดเพื่อให้คุณพอใจกับผลงาน'
                                            : 'Yes, we offer unlimited revisions to ensure you are satisfied with the result.')}
                                        path="home.faq.item4.answer"
                                        locale={locale as 'th' | 'en'}
                                        className="text-muted-foreground leading-relaxed"
                                    />
                                </div>
                            )}
                        </div>
                        {/* FAQ 5 */}
                        <div className="border border-border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-shadow">
                            <button
                                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                            >
                                <EditableText
                                    value={getContent('home.faq.item5.question', locale === 'th' ? 'เทคโนโลยีที่คุณใช้คืออะไรบ้าง?' : 'What technologies do you use?')}
                                    path="home.faq.item5.question"
                                    locale={locale as 'th' | 'en'}
                                    className="font-semibold text-lg pr-4"
                                />
                                <ChevronDown
                                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                                        openFaq === 4 ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openFaq === 4 && (
                                <div className="px-6 pb-6">
                                    <EditableText
                                        value={getContent('home.faq.item5.answer', locale === 'th'
                                            ? 'เราใช้เทคโนโลยีล้ำสมัยทั้งหมด รวมถึง React, Next.js, Node.js และอื่นๆ'
                                            : 'We use modern technologies including React, Next.js, Node.js, and more.')}
                                        path="home.faq.item5.answer"
                                        locale={locale as 'th' | 'en'}
                                        className="text-muted-foreground leading-relaxed"
                                    />
                                </div>
                            )}
                        </div>
                        {/* FAQ 6 */}
                        <div className="border border-border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-shadow">
                            <button
                                onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                            >
                                <EditableText
                                    value={getContent('home.faq.item6.question', locale === 'th' ? 'คุณมีประสบการณ์ในอุตสาหกรรมของฉันไหม?' : 'Do you have experience in my industry?')}
                                    path="home.faq.item6.question"
                                    locale={locale as 'th' | 'en'}
                                    className="font-semibold text-lg pr-4"
                                />
                                <ChevronDown
                                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                                        openFaq === 5 ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openFaq === 5 && (
                                <div className="px-6 pb-6">
                                    <EditableText
                                        value={getContent('home.faq.item6.answer', locale === 'th'
                                            ? 'ใ่่ เรามีประสบการณ์กับอุตสาหกรรมหลายประเภทและสามารถปรับตัวให้เหมาะสม'
                                            : 'Yes, we have experience across multiple industries and can adapt to your needs.')}
                                        path="home.faq.item6.answer"
                                        locale={locale as 'th' | 'en'}
                                        className="text-muted-foreground leading-relaxed"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA Section */}
            <section className="py-20 md:py-32 portfolio-cta-section text-white relative">
                {/* Floating decorative orbs */}
                <div className="portfolio-cta-orb portfolio-cta-orb-1"></div>
                <div className="portfolio-cta-orb portfolio-cta-orb-2"></div>

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <EditableText
                            value={getContent('home.contact.title', locale === 'th' ? 'พร้อมเริ่มโปรเจกต์วันนี้' : 'Ready to turn your ideas into reality?')}
                            path="home.contact.title"
                            locale={locale as 'th' | 'en'}
                            type="heading"
                            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight portfolio-cta-title"
                        />
                        <EditableText
                            value={getContent('home.contact.description', locale === 'th' ? 'ติดต่อเราวันนี้เพื่อปรึกษาฟรี' : 'Contact us today for a free consultation and start building')}
                            path="home.contact.description"
                            locale={locale as 'th' | 'en'}
                            type="paragraph"
                            className="portfolio-cta-desc mb-10 text-base md:text-lg leading-relaxed"
                        />
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href={`/${locale}/contact`}
                                className="px-8 py-4 md:px-12 md:py-5 text-white font-semibold rounded-xl inline-flex items-center justify-center gap-2 portfolio-cta-button-primary"
                            >
                                {locale === 'th' ? 'ติดต่อเรา' : 'Get In Touch'}
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href={`/${locale}/services`}
                                className="px-8 py-4 md:px-12 md:py-5 text-white font-semibold rounded-xl inline-flex items-center justify-center portfolio-cta-button-secondary"
                            >
                                {locale === 'th' ? 'ดูบริการ' : 'Our Services'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function HomePage() {
    return <HomeContent />;
}
