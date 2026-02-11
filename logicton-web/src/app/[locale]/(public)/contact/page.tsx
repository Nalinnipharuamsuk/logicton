"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Mail, MapPin, Phone, Send, Facebook, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import type { SiteConfig } from '@/types';
import { EditableText } from '@/components/EditableText';

interface InlineContent {
    [key: string]: string;
}

export default function ContactPage() {
    const locale = useLocale();
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
    const [inlineContent, setInlineContent] = useState<InlineContent>({});
    const [contentLoaded, setContentLoaded] = useState(false);

    // Load inline edited content
    useEffect(() => {
        const loadInlineContent = async () => {
            setContentLoaded(false);
            try {
                const res = await fetch(`/api/content/inline-edit?page=contact&locale=${locale}`);
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

    // Load site config
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        fetch('/api/content/site-config')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setSiteConfig(data.data);
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

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = locale === 'th' ? 'กรุณากรอกชื่อ' : 'Name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = locale === 'th' ? 'กรุณากรอกอีเมล' : 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = locale === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format';
        }
        if (!formData.subject.trim()) {
            newErrors.subject = locale === 'th' ? 'กรุณากรอกหัวข้อ' : 'Subject is required';
        }
        if (!formData.message.trim()) {
            newErrors.message = locale === 'th' ? 'กรุณากรอกข้อความ' : 'Message is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setStatus('submitting');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    language: locale
                })
            });

            const result = await response.json();

            if (result.success) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('idle');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setStatus('idle');
        }
    };

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
                        <Mail className="w-4 h-4" />
                        <EditableText
                            value={getContent('contact.hero.badge', locale === 'th' ? 'ติดต่อเรา' : 'Get in Touch')}
                            path="contact.hero.badge"
                            locale={locale as 'th' | 'en'}
                            className=""
                        />
                    </div>
                    <EditableText
                        value={getContent('contact.hero.title', locale === 'th' ? 'มาเริ่มต้นโปรเจกต์ของคุณ' : 'Let&apos;s Start Your Project')}
                        path="contact.hero.title"
                        locale={locale as 'th' | 'en'}
                        type="heading"
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 contact-hero-title"
                    />
                    <EditableText
                        value={getContent('contact.hero.subtitle',
                            locale === 'th'
                                ? 'เราอยากได้ยินจากคุณ ส่งข้อความถึงเราและเราจะติดต่อกลับโดยเร็ว'
                                : 'We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.')}
                        path="contact.hero.subtitle"
                        locale={locale as 'th' | 'en'}
                        type="paragraph"
                        className="text-lg md:text-xl contact-hero-subtitle max-w-2xl mx-auto leading-relaxed"
                    />
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-20 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-card dark:bg-card rounded-2xl p-8 border border-border dark:border-border shadow-md hover:shadow-lg transition-all duration-300">
                                <EditableText
                                    value={getContent('contact.form.title', locale === 'th' ? 'ส่งข้อความถึงเรา' : 'Send us a message')}
                                    path="contact.form.title"
                                    locale={locale as 'th' | 'en'}
                                    type="heading"
                                    className="text-2xl font-bold mb-2 text-foreground"
                                />
                                <p className="text-muted-foreground mb-6">
                                    <EditableText
                                        value={getContent('contact.form.subtitle',
                                            locale === 'th' ? 'กรอกแบบฟอร์มและเราจะติดต่อกลับภายใน 24 ชั่วโมง' : 'Fill out the form and we&apos;ll get back to you within 24 hours')}
                                        path="contact.form.subtitle"
                                        locale={locale as 'th' | 'en'}
                                        className=""
                                    />
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                                                {locale === 'th' ? 'ชื่อ' : 'Name'}
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-background text-foreground placeholder:text-muted-foreground`}
                                                placeholder={locale === 'th' ? 'เช่น สมชาย ใจดี' : 'e.g. John Doe'}
                                            />
                                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                                {locale === 'th' ? 'อีเมล' : 'Email'}
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-background text-foreground placeholder:text-muted-foreground`}
                                                placeholder="john@company.com"
                                            />
                                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                                            {locale === 'th' ? 'หัวข้อ' : 'Subject'}
                                        </label>
                                        <select
                                            id="subject"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.subject ? 'border-red-500' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-background text-foreground`}
                                        >
                                            <option value="">{locale === 'th' ? 'เลือกหัวข้อ...' : 'Select a subject...'}</option>
                                            <option value="Software Development Inquiry">{locale === 'th' ? 'สอบถามการพัฒนาซอฟต์แวร์' : 'Software Development Inquiry'}</option>
                                            <option value="Web Development Inquiry">{locale === 'th' ? 'สอบถามการพัฒนาเว็บ' : 'Web Development Inquiry'}</option>
                                            <option value="Mobile Development Inquiry">{locale === 'th' ? 'สอบถามการพัฒนาแอปมือถือ' : 'Mobile Development Inquiry'}</option>
                                            <option value="Cloud Solutions Inquiry">{locale === 'th' ? 'สอบถามโซลูชันคลาวด์' : 'Cloud Solutions Inquiry'}</option>
                                            <option value="Consulting Services">{locale === 'th' ? 'บริการที่ปรึกษา' : 'Consulting Services'}</option>
                                            <option value="Other">{locale === 'th' ? 'อื่นๆ' : 'Other'}</option>
                                        </select>
                                        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                                            {locale === 'th' ? 'ข้อความ' : 'Message'}
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-500' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-background text-foreground placeholder:text-muted-foreground`}
                                            placeholder={locale === 'th' ? 'บอกเราเกี่ยวกับโปรเจกต์ของคุณ...' : 'Tell us about your project...'}
                                        />
                                        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting' || status === 'success'}
                                        className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Send className="h-5 w-5" />
                                        {status === 'idle' && (locale === 'th' ? 'ส่งข้อความ' : 'Send Message')}
                                        {status === 'submitting' && (locale === 'th' ? 'กำลังส่ง...' : 'Sending...')}
                                        {status === 'success' && (locale === 'th' ? 'ส่งสำเร็จ!' : 'Message Sent!')}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            {/* Visit Us */}
                            <div className="bg-card dark:bg-card rounded-2xl p-6 border border-border dark:border-border shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 contact-info-icon-bg rounded-xl flex items-center justify-center transition-all duration-300">
                                        <MapPin className="w-6 h-6 contact-info-icon" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">
                                        <EditableText
                                            value={getContent('contact.info.visit', locale === 'th' ? 'เยี่ยมชม' : 'Visit Us')}
                                            path="contact.info.visit"
                                            locale={locale as 'th' | 'en'}
                                            className=""
                                        />
                                    </h3>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <EditableText
                                        value={getContent('contact.info.address1', 'Logicton Tower, 45th Floor')}
                                        path="contact.info.address1"
                                        locale={locale as 'th' | 'en'}
                                        className=""
                                    />
                                    <EditableText
                                        value={getContent('contact.info.address2', 'Sukhumvit Road, Bangkok 10110')}
                                        path="contact.info.address2"
                                        locale={locale as 'th' | 'en'}
                                        className=""
                                    />
                                </div>
                            </div>

                            {/* Call Us */}
                            <div className="bg-card dark:bg-card rounded-2xl p-6 border border-border dark:border-border shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 contact-info-icon-bg rounded-xl flex items-center justify-center transition-all duration-300">
                                        <Phone className="w-6 h-6 contact-info-icon" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">
                                        <EditableText
                                            value={getContent('contact.info.call', locale === 'th' ? 'โทรหาเรา' : 'Call Us')}
                                            path="contact.info.call"
                                            locale={locale as 'th' | 'en'}
                                            className=""
                                        />
                                    </h3>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <EditableText
                                        value={getContent('contact.info.phone1', '+66 2 123 4567')}
                                        path="contact.info.phone1"
                                        locale={locale as 'th' | 'en'}
                                        className=""
                                    />
                                    <EditableText
                                        value={getContent('contact.info.hours', locale === 'th' ? 'จันทร์ - ศุกร์, 9:00 - 18:00' : 'Mon - Fri, 9:00 - 18:00')}
                                        path="contact.info.hours"
                                        locale={locale as 'th' | 'en'}
                                        className=""
                                    />
                                </div>
                            </div>

                            {/* Email Us */}
                            <div className="bg-card dark:bg-card rounded-2xl p-6 border border-border dark:border-border shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 contact-info-icon-bg rounded-xl flex items-center justify-center transition-all duration-300">
                                        <Mail className="w-6 h-6 contact-info-icon" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">
                                        <EditableText
                                            value={getContent('contact.info.email', locale === 'th' ? 'อีเมล' : 'Email Us')}
                                            path="contact.info.email"
                                            locale={locale as 'th' | 'en'}
                                            className=""
                                        />
                                    </h3>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <EditableText
                                        value={getContent('contact.info.email1', 'hello@logicton.com')}
                                        path="contact.info.email1"
                                        locale={locale as 'th' | 'en'}
                                        className=""
                                    />
                                    <EditableText
                                        value={getContent('contact.info.email2', 'support@logicton.com')}
                                        path="contact.info.email2"
                                        locale={locale as 'th' | 'en'}
                                        className=""
                                    />
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-card dark:bg-card rounded-2xl p-6 border border-border dark:border-border shadow-md hover:shadow-lg transition-all duration-300">
                                <h3 className="font-semibold text-foreground mb-4">
                                    <EditableText
                                        value={getContent('contact.social.title', locale === 'th' ? 'ติดตามเรา' : 'Follow Us')}
                                        path="contact.social.title"
                                        locale={locale as 'th' | 'en'}
                                        className=""
                                    />
                                </h3>
                                <div className="flex gap-3">
                                    {siteConfig?.socialMedia?.linkedin && (
                                        <a
                                            href={siteConfig.socialMedia.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-muted contact-social-link p-4 rounded-xl text-muted-foreground flex items-center justify-center"
                                        >
                                            <Linkedin className="h-5 w-5" />
                                        </a>
                                    )}
                                    {siteConfig?.socialMedia?.twitter && (
                                        <a
                                            href={siteConfig.socialMedia.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-muted contact-social-link p-4 rounded-xl text-muted-foreground flex items-center justify-center"
                                        >
                                            <Twitter className="h-5 w-5" />
                                        </a>
                                    )}
                                    {siteConfig?.socialMedia?.facebook && (
                                        <a
                                            href={siteConfig.socialMedia.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-muted contact-social-link p-4 rounded-xl text-muted-foreground flex items-center justify-center"
                                        >
                                            <Facebook className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
