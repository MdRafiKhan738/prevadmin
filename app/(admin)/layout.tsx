"use client";

import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../../utils/imageUrl';
import { useEffect } from 'react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Menu, Moon, User } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { settings } = useSettings();

    // Apply favicon
    useEffect(() => {
        if (settings.favIcon) {
            const faviconUrl = getImageUrl(settings.favIcon);
            let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = faviconUrl;

            let appleIcon: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
            if (!appleIcon) {
                appleIcon = document.createElement('link');
                appleIcon.rel = 'apple-touch-icon';
                document.getElementsByTagName('head')[0].appendChild(appleIcon);
            }
            appleIcon.href = faviconUrl;
        }
    }, [settings.favIcon]);

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 h-10 bg-white border-b border-slate-200 z-[60] flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="p-1.5 hover:bg-slate-50 rounded transition-colors"
                    >
                        <Menu className="w-4 h-4 text-black" />
                    </button>
                    {settings.siteLogo ? (
                        <div className="flex items-center">
                            <img
                                src={getImageUrl(settings.siteLogo)}
                                alt="Logo"
                                className="h-6 w-auto object-contain block"
                                style={{ maxWidth: '120px' }}
                            />
                        </div>
                    ) : (
                        <span className="font-black text-sm tracking-[0.1em] text-black">SHADAMON</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-slate-50 rounded-full transition-colors text-black">
                        <Moon className="w-4 h-4 fill-slate-700" />
                    </button>
                    <button className="p-1 hover:bg-slate-50 rounded-full transition-colors text-black">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                            <User className="w-3.5 h-3.5" />
                        </div>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 pt-10">
                {/* Sidebar */}
                <AdminSidebar
                    isCollapsed={isSidebarCollapsed}
                    toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />

                {/* Main Content */}
                <main
                    className={cn(
                        "flex-1 min-h-screen transition-all duration-300 ease-in-out",
                        isSidebarCollapsed ? "pl-12" : "pl-53"
                    )}
                >
                    <div className="w-full p-3 pt-4">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
