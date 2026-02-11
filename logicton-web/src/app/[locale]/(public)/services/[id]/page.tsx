"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Layout, Smartphone, Film, Code, CheckCircle, Zap, Users, BarChart3, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ServiceIcon from '@/components/ServiceIcon';
import { EditableServiceText } from '@/components/EditableServiceText';
import { EditableServiceArray } from '@/components/EditableServiceArray';
import { EditableHowWeWork } from '@/components/EditableHowWeWork';
import type { Service } from '@/types';

export default function ServiceDetailPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);

  const loadService = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/content/services/${params.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setService(data.data);

        // Load related services
        const allRes = await fetch('/api/content/services');
        const allData = await allRes.json();
        if (allData.success && allData.data) {
          const related = allData.data
            .filter((s: Service) => s.category === data.data.category && s.id !== data.data.id && s.isActive)
            .slice(0, 3);
          setRelatedServices(related);
        }
      }
    } catch (error) {
      console.error('Failed to load service:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadService();
  }, [params.id]);

  const handleSave = () => {
    // Reload service after saving
    loadService();
  };

  const getCategoryIcon = (category: Service['category']) => {
    switch (category) {
      case 'web':
        return <Layout className="h-6 w-6" />;
      case 'mobile':
        return <Smartphone className="h-6 w-6" />;
      case 'animation':
        return <Film className="h-6 w-6" />;
      case 'framework':
        return <Code className="h-6 w-6" />;
      default:
        return <Layout className="h-6 w-6" />;
    }
  };

  const getCategoryLabel = (category: Service['category']) => {
    switch (category) {
      case 'web':
        return locale === 'th' ? 'พัฒนาเว็บไซต์' : 'Web Development';
      case 'mobile':
        return locale === 'th' ? 'พัฒนาแอปมือถือ' : 'Mobile Development';
      case 'animation':
        return locale === 'th' ? 'กราฟิกและแอนิเมชัน' : 'Graphic Design';
      case 'framework':
        return locale === 'th' ? 'เฟรมเวิร์ก' : 'Framework';
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{locale === 'th' ? 'กำลังโหลด...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-4xl font-bold mb-4 service-not-found-title">{locale === 'th' ? 'ไม่พบบริการ' : 'Service Not Found'}</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          {locale === 'th'
            ? 'ขออภัย บริการที่คุณค้นหาไม่มีอยู่ หรืออาจถูกลบไปแล้ว'
            : 'Sorry, the service you are looking for does not exist or has been removed.'}
        </p>
        <Link
          href={`/${locale}/services`}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          {locale === 'th' ? 'กลับไปหน้าบริการ' : 'Back to Services'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden service-hero-section">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 service-hero-decoration rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 service-hero-decoration rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-[1400px] px-6 py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm service-breadcrumb mb-8">
            <Link href={`/${locale}`} className="service-breadcrumb transition-colors">
              {locale === 'th' ? 'หน้าแรก' : 'Home'}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/services`} className="service-breadcrumb transition-colors">
              {locale === 'th' ? 'บริการ' : 'Services'}
            </Link>
            <span>/</span>
            <span className="service-breadcrumb-active font-medium">
              <EditableServiceText
                serviceId={service.id}
                value={service.title[locale as 'th' | 'en']}
                field="title"
                locale={locale as 'th' | 'en'}
                type="text"
                onSave={handleSave}
              />
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Icon and Category */}
            <div className="shrink-0">
              <div className="w-32 h-32 service-icon-box rounded-3xl flex items-center justify-center shadow-xl border">
                <ServiceIcon iconName={service?.icon || 'Code'} className="w-20 h-20" />
              </div>
            </div>

            {/* Title and Description */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 service-category-badge rounded-full text-sm font-medium mb-4 border">
                {getCategoryIcon(service?.category || 'web')}
                <span>{getCategoryLabel(service?.category || 'web')}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 service-title leading-tight">
                <EditableServiceText
                  serviceId={service.id}
                  value={service.title[locale as 'th' | 'en']}
                  field="title"
                  locale={locale as 'th' | 'en'}
                  type="heading"
                  className=""
                  onSave={handleSave}
                />
              </h1>

              <p className="text-lg md:text-xl service-description leading-relaxed max-w-2xl">
                <EditableServiceText
                  serviceId={service.id}
                  value={service.description[locale as 'th' | 'en']}
                  field="description"
                  locale={locale as 'th' | 'en'}
                  type="paragraph"
                  className=""
                  onSave={handleSave}
                />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-20">
            {/* Features Section */}
            <div>
              <h2 className="text-3xl font-bold mb-8 service-section-title">
                {locale === 'th' ? '✨ คุณสมบัติหลัก' : '✨ Key Features'}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {service?.features[locale as 'th' | 'en']?.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden service-feature-card rounded-xl p-6 transition-all duration-300"
                  >
                    <div className="absolute inset-0 service-feature-card-bg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        <CheckCircle className="h-6 w-6 service-feature-icon group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="service-feature-text font-medium transition-colors">
                        <EditableServiceText
                          serviceId={service.id}
                          value={feature}
                          field="features"
                          locale={locale as 'th' | 'en'}
                          type="text"
                          index={index}
                          onSave={handleSave}
                        />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies Section */}
            {service && service.technologies.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-8 service-section-title">
                  {locale === 'th' ? '⚙️ เทคโนโลยีที่ใช้' : '⚙️ Technologies Used'}
                </h2>

                <EditableServiceArray
                  serviceId={service.id}
                  items={service.technologies}
                  field="technologies"
                  locale={locale as 'th' | 'en'}
                  onSave={() => {
                    loadService();
                  }}
                />
              </div>
            )}

            {/* How We Work */}
            {service?.howWeWork && service.howWeWork[locale as 'th' | 'en'] && (
              <div>
                <h2 className="text-3xl font-bold mb-8 service-section-title">
                  {locale === 'th' ? '🎯 วิธีการทำงานของเรา' : '🎯 How We Work'}
                </h2>

                <EditableHowWeWork
                  serviceId={service.id}
                  steps={service.howWeWork[locale as 'th' | 'en']}
                  locale={locale as 'th' | 'en'}
                  onSave={() => {
                    loadService();
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Benefits Box */}
            <div className="service-benefits-box rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6 service-section-title">
                {locale === 'th' ? '📊 ประโยชน์' : '📊 Benefits'}
              </h3>

              <div className="space-y-3">
                {[
                  { icon: Zap, label: locale === 'th' ? 'รวดเร็ว' : 'Fast Delivery', desc: locale === 'th' ? 'ส่งมอบตรงเวลา' : 'On-time delivery' },
                  { icon: Shield, label: locale === 'th' ? 'ปลอดภัย' : 'Secure Code', desc: locale === 'th' ? 'โค้ดมาตรฐาน' : 'Standard code' },
                  { icon: Users, label: locale === 'th' ? 'ทีมผู้เชี่ยวชาญ' : 'Expert Team', desc: locale === 'th' ? 'นักพัฒนาชำนาญ' : 'Skilled developers' },
                  { icon: BarChart3, label: locale === 'th' ? 'คุ้มค่า' : 'Cost Effective', desc: locale === 'th' ? 'ราคายุติธรรม' : 'Fair pricing' },
                ].map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg service-benefit-item transition-colors group">
                      <div className="shrink-0 w-10 h-10 service-benefit-icon-bg rounded-lg flex items-center justify-center transition-colors">
                        <IconComponent className="h-5 w-5 service-benefit-icon" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold service-benefit-label block text-sm">{benefit.label}</span>
                        <span className="text-xs service-benefit-desc">{benefit.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Box */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-4">
                {locale === 'th'
                  ? '🚀 พร้อมเริ่มต้นหรือยัง?'
                  : '🚀 Ready to Start?'}
              </h3>
              <p className="text-sm opacity-90 mb-6 leading-relaxed">
                {locale === 'th'
                  ? 'ติดต่อเราวันนี้เพื่อปรึกษาเกี่ยวกับโปรเจกต์ของคุณและรับข้อเสนอพิเศษ'
                  : 'Contact us today to discuss your project and get a special offer.'}
              </p>
              <Link
                href={`/${locale}/contact`}
                className="block w-full text-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold"
              >
                {locale === 'th' ? '✉️ ติดต่อเรา' : '✉️ Contact Us'}
              </Link>
              <div className="mt-4 pt-4 border-t border-white/20 text-xs opacity-75 text-center">
                {locale === 'th' ? 'ตอบสนองอย่างรวดเร็ว' : 'Quick Response'}
              </div>
            </div>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-20 pt-20 border-t service-section-border">
            <h2 className="text-3xl font-bold mb-8 service-section-title">
              {locale === 'th' ? '🔗 บริการอื่น ๆ' : '🔗 Related Services'}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedServices.map((relService) => (
                <Link
                  key={relService.id}
                  href={`/${locale}/services/${relService.id}`}
                  className="group service-related-card rounded-xl p-6 transition-all duration-300"
                >
                  <div className="text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-125 transition-transform duration-300">
                    <ServiceIcon iconName={relService.icon} className="w-14 h-14" />
                  </div>
                  <h3 className="font-bold service-related-title mb-2 transition-colors">
                    {relService.title[locale as 'th' | 'en']}
                  </h3>
                  <p className="text-sm service-related-desc line-clamp-2">
                    {relService.description[locale as 'th' | 'en']}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-20 mb-8">
          <Link
            href={`/${locale}/services`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg service-back-btn transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            {locale === 'th' ? '← กลับไปหน้าบริการ' : '← Back to Services'}
          </Link>
        </div>
      </div>
    </div>
  );
}
