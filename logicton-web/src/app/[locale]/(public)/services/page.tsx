"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { Service } from '@/types';
import ServiceIcon from '@/components/ServiceIcon';
import { EditableText } from '@/components/EditableText';
import { EditModeBar } from '@/components/EditModeBar';
import { useEditMode } from '@/providers/EditModeProvider';

function ServicesPageContent() {
    const locale = useLocale();
    const { isEditMode } = useEditMode();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [inlineContent, setInlineContent] = useState<Record<string, string>>({});
    const [inlineContentLoaded, setInlineContentLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Load inline edited content for the services page
        setInlineContentLoaded(false);
        const loadInlineContent = () => {
            if (isEditMode) {
                fetch(`/api/content/inline-edit?page=services&locale=${locale}`)
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
        fetch('/api/content/services')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setServices(data.data.filter((s: Service) => s.isActive).sort((a: Service, b: Service) => a.order - b.order));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Trigger animation when component mounts
    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Helper function to get content value with fallback
    const getContent = (path: string, fallback: string) => {
        return inlineContent[path] || fallback;
    };

    if (loading || !inlineContentLoaded) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

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
        <div className="min-h-screen bg-background">
            <EditModeBar />
            {/* Hero Section - Premium Design with Gradients and Glow */}
            <section className="relative overflow-hidden py-20 contact-hero-section">
                {/* Animated floating orbs with glow effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="contact-hero-orb-1 -top-20 -right-20"></div>
                    <div className="contact-hero-orb-2 -bottom-20 -left-20"></div>
                    <div className="contact-hero-orb-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full contact-hero-badge text-sm font-semibold mb-8 transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <EditableText
                            value={getContent('services.hero.badge', locale === 'th' ? 'บริการของเรา' : 'OUR SERVICES')}
                            path="services.hero.badge"
                            locale={locale as 'th' | 'en'}
                            className=""
                        />
                    </div>
                    <EditableText
                        value={getContent('services.hero.title', locale === 'th' ? 'บริการของเรา' : 'Our Services')}
                        path="services.hero.title"
                        locale={locale as 'th' | 'en'}
                        type="heading"
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 contact-hero-title"
                    />
                    <EditableText
                        value={getContent('services.hero.description', locale === 'th'
                            ? 'เราให้บริการโซลูชันซอฟต์แวร์ที่ออกแบบมาเพื่อเพิ่มการเติบโต ปรับปรุงประสิทธิภาพ และแก้ไขความท้าทายทางเทคโนโลยีที่ซับซ้อนของคุณ'
                            : 'We build bespoke software solutions that drive growth, enhance efficiency, and solve your most complex technical challenges.')}
                        path="services.hero.description"
                        locale={locale as 'th' | 'en'}
                        type="paragraph"
                        className="text-lg md:text-xl contact-hero-subtitle max-w-3xl mx-auto leading-relaxed"
                    />
                </div>
            </section>

            {/* Services Grid - Enhanced with animations and gradients */}
            <section className="py-24 md:py-32 bg-background relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-[1400px] mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                className={`group h-full transition-all duration-700 ${
                                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <Link
                                    href={`/services/${service.id}`}
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
                                                {service.features[locale as 'th' | 'en'].slice(0, 3).map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-2.5 text-xs">
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
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function ServicesPage() {
    return <ServicesPageContent />;
}
