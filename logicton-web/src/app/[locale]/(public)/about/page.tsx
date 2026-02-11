"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import type { CompanyInfo, TeamMember } from '@/types';
import { CheckCircle } from 'lucide-react';
import { EditableText } from '@/components/EditableText';
import { EditableImage } from '@/components/EditableImage';
import { useEditMode } from '@/providers/EditModeProvider';

function AboutPageContent() {
    const locale = useLocale();
    const { isEditMode } = useEditMode();
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [inlineContent, setInlineContent] = useState<Record<string, string>>({});
    const [contentLoaded, setContentLoaded] = useState(false);

    useEffect(() => {
        // Load inline edited content for the about page (always load to show saved changes)
        setContentLoaded(false);
        fetch(`/api/content/inline-edit?page=about&locale=${locale}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setInlineContent(data.data);
                }
                setContentLoaded(true);
            })
            .catch(() => {
                setContentLoaded(true);
            });
    }, [locale]);

    useEffect(() => {
        Promise.all([
            fetch('/api/content/company').then(res => res.json()),
            fetch('/api/content/team').then(res => res.json())
        ])
        .then(([companyData, teamData]) => {
            if (companyData.success && companyData.data) {
                setCompany(companyData.data);
            }
            if (teamData.success && teamData.data) {
                setTeam(teamData.data.filter((m: TeamMember) => m.isActive).sort((a: TeamMember, b: TeamMember) => a.order - b.order));
            }
        })
        .catch(console.error);
    }, []);

    // Helper function to get content value with fallback
    const getContent = (path: string, fallback: string) => {
        return inlineContent[path] || fallback;
    };

    const values = [
        {
            key: locale === 'th' ? 'professional' : 'professional',
            label: locale === 'th' ? 'มืออาชีพและมีประสบการณ์' : 'Professional and experienced development team',
        },
        {
            key: locale === 'th' ? 'communication' : 'communication',
            label: locale === 'th' ? 'การสื่อสารที่เข้มแข็งและความร่วมมือระดับโลก' : 'Strong communication and global collaboration',
        },
        {
            key: locale === 'th' ? 'support' : 'support',
            label: locale === 'th' ? 'สนับสนุนบัณฑิตใหม่และการฝึกสัง' : 'Support for new graduates and interns',
        },
        {
            key: locale === 'th' ? 'partnership' : 'partnership',
            label: locale === 'th' ? 'จิตสำนักความเป็นหุ่นพยาบาลระยะยาว' : 'Long-term partnership mindset',
        },
    ];

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <EditableText
                            value={getContent('about.hero.badge', locale === 'th' ? 'เกี่ยวกับเรา' : 'About Us')}
                            path="about.hero.badge"
                            locale={locale as 'th' | 'en'}
                            className=""
                        />
                    </div>
                    <EditableText
                        value={getContent('about.hero.title', locale === 'th' ? 'เกี่ยวกับเรา' : 'About Company')}
                        path="about.hero.title"
                        locale={locale as 'th' | 'en'}
                        type="heading"
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 contact-hero-title tracking-tight leading-tight"
                    />
                    <EditableText
                        value={getContent('about.hero.description', locale === 'th'
                            ? 'เราเป็นทีมผู้เชี่ยวชาญที่มุ่งมั่นสร้างสรรค์โซลูชันเทคโนโลยีที่มีคุณภาพ'
                            : 'We are a team of experts dedicated to creating quality technology solutions')}
                        path="about.hero.description"
                        locale={locale as 'th' | 'en'}
                        type="paragraph"
                        className="text-lg md:text-xl contact-hero-subtitle max-w-3xl mx-auto leading-relaxed"
                    />
                </div>
            </section>

            {/* Content Sections */}
            <div className="max-w-[1400px] mx-auto px-6 pb-20">
                {/* Company Description Section */}
                <div className="py-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Image with decorative frame */}
                        <div className="relative">
                            <div className="absolute -inset-4 about-image-glow rounded-3xl blur-lg"></div>
                            <div className="relative aspect-[3/2] rounded-2xl overflow-hidden">
                                <EditableImage
                                    src={getContent('about.company.image', '/images/portfolio/company-image.jpg')}
                                    alt="Company"
                                    path="about.company.image"
                                    locale={locale as 'th' | 'en'}
                                    className="rounded-2xl shadow-2xl object-center object-cover"
                                    style={{ objectPosition: 'center 30%' }}
                                    fill
                                    unoptimized
                                    inlineContent={inlineContent}
                                    contentLoaded={contentLoaded}
                                />
                                {/* Decorative corner accent */}
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 about-corner-accent rounded-2xl -z-10"></div>
                            </div>
                        </div>

                        {/* Text content */}
                        <div className="space-y-6">
                            <div className="inline-block">
                                <span className="about-section-label font-semibold text-sm uppercase tracking-wider">
                                    {locale === 'th' ? 'เกี่ยวกับบริษัท' : 'About Us'}
                                </span>
                            </div>
                            <EditableText
                                value={getContent('about.description.main', company?.description[locale as 'th' | 'en'] || 'A technology development company dedicated to creating high-quality solutions to elevate our clients\' businesses to global standards')}
                                path="about.description.main"
                                locale={locale as 'th' | 'en'}
                                type="paragraph"
                                className="text-lg md:text-xl about-description-text leading-relaxed"
                            />
                            <EditableText
                                value={getContent('about.description.history', company?.history[locale as 'th' | 'en'] || 'Founded with a vision to create technology that changes world')}
                                path="about.description.history"
                                locale={locale as 'th' | 'en'}
                                type="paragraph"
                                className="text-lg md:text-xl about-description-text leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Our Mission & What We Stand For Section */}
                <div className="py-20">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Our Mission */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 about-card-glow rounded-3xl blur transition duration-500"></div>
                            <div className="relative bg-card dark:bg-card rounded-2xl p-8 md:p-10 shadow-lg h-full border border-border dark:border-border">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 about-card-icon-bg rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 stroke-white" fill="none" stroke="white" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <EditableText
                                        value={getContent('about.mission.title', locale === 'th' ? 'พันธกิจของเรา' : 'Our Mission')}
                                        path="about.mission.title"
                                        locale={locale as 'th' | 'en'}
                                        type="heading"
                                        className="text-2xl md:text-3xl font-bold about-card-title"
                                    />
                                </div>
                                <EditableText
                                    value={getContent('about.mission.content', company?.description[locale as 'th' | 'en'] || 'To deliver exceptional technology solutions that empower businesses to thrive in the digital age, while fostering innovation, excellence, and sustainable growth for our clients and team members.')}
                                    path="about.mission.content"
                                    locale={locale as 'th' | 'en'}
                                    type="paragraph"
                                    className="text-base md:text-lg about-card-content leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* What We Stand For */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 about-card-glow rounded-3xl blur transition duration-500"></div>
                            <div className="relative bg-card dark:bg-card rounded-2xl p-8 md:p-10 shadow-lg h-full border border-border dark:border-border">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 about-card-icon-bg rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 stroke-white" fill="none" stroke="white" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <EditableText
                                        value={getContent('about.values.title', locale === 'th' ? 'สิ่งที่เราเชื่อมั่น' : 'What We Stand For')}
                                        path="about.values.title"
                                        locale={locale as 'th' | 'en'}
                                        type="heading"
                                        className="text-2xl md:text-3xl font-bold about-card-title"
                                    />
                                </div>
                                <div className="space-y-4">
                                    {values.map((value, index) => (
                                        <div key={index} className="flex items-start gap-4 p-3 rounded-xl about-value-item transition-colors">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <div className="w-6 h-6 about-value-icon-bg rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 about-value-icon" />
                                                </div>
                                            </div>
                                            <p className="text-base about-value-text leading-relaxed">
                                                {value.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="py-20">
                    <EditableText
                        value={getContent('about.team.title', locale === 'th' ? 'ทีมของเรา' : 'Our Team')}
                        path="about.team.title"
                        locale={locale as 'th' | 'en'}
                        type="heading"
                        className="text-3xl md:text-4xl font-bold mb-12 text-center block about-team-title"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {team.map((member) => (
                            <div key={member.id} className="text-center">
                                <div className="w-full aspect-square bg-muted dark:bg-muted rounded-lg mb-4 overflow-hidden shadow-md">
                                    {member.photo && (
                                        <img
                                            src={member.photo}
                                            alt={member.name[locale as 'th' | 'en']}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <h4 className="font-semibold text-sm md:text-base about-team-name">{member.name[locale as 'th' | 'en']}</h4>
                                <p className="text-xs md:text-sm about-team-role">{member.role[locale as 'th' | 'en']}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AboutPage() {
    return <AboutPageContent />;
}
