"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import type { Service } from "@/types";

export default function Navbar() {
    const t = useTranslations("Navigation");
    const locale = useLocale();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [isServicesPage, setIsServicesPage] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    // Fetch services data
    useEffect(() => {
        fetch('/api/content/services')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const activeServices = data.data
                        .filter((s: Service) => s.isActive)
                        .sort((a: Service, b: Service) => a.order - b.order);
                    setServices(activeServices);
                }
            })
            .catch(console.error);
    }, []);

    // Check if we're on the services page
    useEffect(() => {
        setIsServicesPage(window.location.pathname.includes('/services'));
    }, []);

    const handleServiceClick = (serviceId: string) => {
        setIsServicesDropdownOpen(false);
        setIsOpen(false);
        // Navigate to service detail page (router handles locale automatically)
        router.push(`/services/${serviceId}`);
    };

    const navLinks = [
        { name: t("home"), href: "/" },
        { name: t("about"), href: "/about" },
        { name: t("services"), href: "/services", hasDropdown: true },
        { name: t("portfolio"), href: "/portfolio" },
        { name: t("contact"), href: "/contact" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-[9999] navbar-solid shadow-lg border-b">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-sm group-hover:glow transition-shadow">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold text-gradient tracking-tight">
                            Logicton
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link, index) =>
                            link.hasDropdown ? (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                    onMouseEnter={() => setIsServicesDropdownOpen(true)}
                                    onMouseLeave={() => setIsServicesDropdownOpen(false)}
                                >
                                    <Link
                                        href={link.href}
                                        className="navbar-nav-link text-sm font-medium transition-colors relative group py-2 flex items-center gap-1"
                                    >
                                        {link.name}
                                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
                                    </Link>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isServicesDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="navbar-dropdown absolute top-full left-0 mt-2 w-72 border rounded-xl shadow-xl overflow-hidden z-50"
                                            >
                                                {services.map((service) => (
                                                    <button
                                                        key={service.id}
                                                        onClick={() => handleServiceClick(service.id)}
                                                        className="navbar-dropdown-item w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 border-b last:border-b-0"
                                                    >
                                                        <span className="truncate font-medium">{service.title[locale as 'th' | 'en']}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        className="navbar-nav-link text-sm font-medium transition-colors relative group py-2"
                                    >
                                        {link.name}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
                                    </Link>
                                </motion.div>
                            )
                        )}

                        <div className="pl-4 navbar-separator border-l flex items-center gap-2">
                            <LanguageSelector />
                            <ThemeToggle />
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="navbar-menu-btn md:hidden p-3 rounded-xl border transition-colors"
                        onClick={toggleMenu}
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="navbar-mobile-bg md:hidden border-t"
                    >
                        <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
                            {navLinks.map((link, index) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {link.hasDropdown ? (
                                        <div>
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsOpen(false)}
                                                className="navbar-mobile-link w-full text-lg font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-between"
                                            >
                                                {link.name}
                                                <ChevronDown className="h-4 w-4" />
                                            </Link>
                                            <AnimatePresence>
                                                {isServicesDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="ml-4 mt-2 space-y-2"
                                                    >
                                                        {services.map((service) => (
                                                            <button
                                                                key={service.id}
                                                                onClick={() => handleServiceClick(service.id)}
                                                                className="navbar-mobile-card w-full text-left text-sm py-3 px-4 rounded-lg transition-all flex items-center gap-3 border hover:border"
                                                            >
                                                                <span className="font-medium">{service.title[locale as 'th' | 'en']}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="navbar-mobile-link text-lg font-medium py-3 px-4 rounded-xl transition-all flex items-center gap-3"
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                </motion.div>
                            ))}
                            <div className="navbar-mobile-separator pt-4 border-t mt-2 flex items-center gap-4">
                                <LanguageSelector variant="compact" />
                                <ThemeToggle />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
