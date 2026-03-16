'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Settings, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation = () => {
  const pathname = usePathname();

const navItems = [
    { name: 'Workspace', icon: LayoutDashboard, path: '/' },
    { name: 'Timeline', icon: History, path: '/history' },
    { name: 'Analytics', icon: Activity, path: '/insights' },
    { name: 'Preferences', icon: Settings, path: '/settings' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 xl:w-64 bg-white border-r border-stone-100 flex flex-col z-50">
      <div className="p-8 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-950 rounded-lg flex items-center justify-center text-white shrink-0">
            <Sparkles size={18} />
          </div>
          <span className="hidden xl:block font-serif text-xl font-bold tracking-tight">MoodFlow</span>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className="relative group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300">
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-stone-50 rounded-xl z-0"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                <item.icon 
                  size={20} 
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'
                  }`}
                />
                
                <span className={`relative z-10 hidden xl:block text-sm font-medium transition-colors duration-300 ${
                  isActive ? 'text-stone-900 font-bold' : 'text-stone-400 group-hover:text-stone-600'
                }`}>
                  {item.name}
                </span>

                {isActive && (
                  <motion.div 
                    layoutId="sidebar-indicator"
                    className="absolute left-0 w-1 h-6 bg-stone-950 rounded-r-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-8 border-t border-stone-50">
        <div className="hidden xl:block">
          <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-1 text-center xl:text-left">Status</p>
          <div className="flex items-center gap-2 justify-center xl:justify-start">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-stone-500">System Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
