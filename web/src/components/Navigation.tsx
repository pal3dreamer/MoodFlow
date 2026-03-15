'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Settings, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Focus', icon: LayoutDashboard, path: '/' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Insights', icon: Activity, path: '/insights' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4">
      <div className="flex items-center gap-2 p-2 bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className="relative px-4 py-2 flex flex-col items-center gap-1 group">
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-slate-900 rounded-2xl z-0"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <item.icon 
                  size={20} 
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                <span className={`relative z-10 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-800'
                }`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
