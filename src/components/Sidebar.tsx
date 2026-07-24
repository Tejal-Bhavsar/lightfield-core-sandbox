'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Clock, 
  Bell, 
  BookOpen, 
  Zap, 
  Building2, 
  TrendingUp, 
  Users, 
  CheckSquare, 
  Video, 
  FileText,
  Search,
  Database,
  ArrowRightLeft
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-lf-sidebar border-r border-lf-border flex flex-col h-screen shrink-0 text-sm">
      {/* Brand header */}
      <div className="h-14 border-b border-lf-border flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 font-semibold tracking-tight text-lf-primary">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
            <path d="M12 4v16" strokeDasharray="3 3" />
          </svg>
          <span>Lightfield</span>
        </Link>
        <div className="flex items-center space-x-1.5 bg-white border border-lf-border rounded-md px-2 py-0.5 text-xs text-neutral-500 font-medium">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          <span>Vertex</span>
        </div>
      </div>

      {/* Navigation scroll area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core Pages */}
        <div className="space-y-1">
          <Link 
            href="/" 
            className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
              isActive('/') 
                ? 'bg-white text-lf-primary border border-lf-border shadow-xs' 
                : 'text-neutral-500 hover:bg-neutral-200/50 hover:text-lf-primary'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Up next</span>
            </div>
            <span className="text-[11px] bg-neutral-200 text-neutral-600 rounded px-1.5 py-0.2">4</span>
          </Link>
          
          <Link 
            href="/query" 
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
              isActive('/query') 
                ? 'bg-white text-lf-primary border border-lf-border shadow-xs' 
                : 'text-neutral-500 hover:bg-neutral-200/50 hover:text-lf-primary'
            }`}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>AI Assistant (Chat)</span>
          </Link>
        </div>

        {/* Records */}
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Records</h3>
          <div className="space-y-1">
            <Link 
              href="/memory" 
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                isActive('/memory') 
                  ? 'bg-white text-lf-primary border border-lf-border shadow-xs' 
                  : 'text-neutral-500 hover:bg-neutral-200/50 hover:text-lf-primary'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Accounts</span>
            </Link>
            <Link 
              href="/opportunities" 
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                isActive('/opportunities') 
                  ? 'bg-white text-lf-primary border border-lf-border shadow-xs' 
                  : 'text-neutral-500 hover:bg-neutral-200/50 hover:text-lf-primary'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Opportunities</span>
            </Link>
            <div className="flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium text-neutral-400 cursor-not-allowed">
              <Users className="w-4 h-4 shrink-0" />
              <span>Contacts</span>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Resources</h3>
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium text-neutral-400 cursor-not-allowed">
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>Tasks</span>
            </div>
            <div className="flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium text-neutral-400 cursor-not-allowed">
              <Video className="w-4 h-4 shrink-0" />
              <span>Meetings</span>
            </div>
            <div className="flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium text-neutral-400 cursor-not-allowed">
              <FileText className="w-4 h-4 shrink-0" />
              <span>Notes</span>
            </div>
          </div>
        </div>

        {/* Agents */}
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">GTM Engine</h3>
          <div className="space-y-1">
            <Link 
              href="/migrate" 
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                isActive('/migrate') 
                  ? 'bg-white text-lf-primary border border-lf-border shadow-xs' 
                  : 'text-neutral-500 hover:bg-neutral-200/50 hover:text-lf-primary'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 shrink-0" />
              <span>HubSpot Migrator</span>
            </Link>
          </div>
        </div>

        {/* Active Agents */}
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Active Agents</h3>
          <div className="space-y-1.5 px-3 py-1">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
              <span className="text-neutral-600 font-medium">Echo</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
              <span className="text-neutral-600 font-medium">Flux</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
              <span className="text-neutral-600 font-medium">Cascade</span>
            </div>
            <div className="flex items-center space-x-2.5 text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-neutral-300 shrink-0"></span>
              <span>Bolt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="p-4 border-t border-lf-border bg-neutral-100/50 flex flex-col space-y-1">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Engine Status:</span>
          <span className="font-semibold text-green-600">Active</span>
        </div>
        <div className="text-[11px] text-neutral-400 truncate">
          Provider: <span className="font-mono bg-neutral-200 px-1 rounded">{process.env.LLM_PROVIDER || 'HuggingFace'}</span>
        </div>
      </div>
    </aside>
  );
}
