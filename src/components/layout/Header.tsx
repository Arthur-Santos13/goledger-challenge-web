'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/tv-shows', label: 'TV Shows' },
    { href: '/watchlist', label: 'Watchlist' },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className="text-[#e50914] font-black text-2xl tracking-tight select-none">
                            FLIXDB
                        </span>
                    </Link>

                    {/* Nav */}
                    <nav className="flex items-center gap-6">
                        {navLinks.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`text-sm font-medium transition-colors duration-150 ${pathname === href
                                        ? 'text-white'
                                        : 'text-[#b3b3b3] hover:text-white'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
