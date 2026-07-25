'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  Database, 
  Search, 
  GitBranch, 
  ShieldCheck, 
  FileText,
  Building,
  Mail,
  UserCheck
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 min-h-screen bg-[#fcfcfd] text-neutral-800 font-sans flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e7_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-neutral-200/50">
        <div className="flex items-center space-x-2.5 font-bold tracking-tight text-neutral-900">
          <svg className="w-6 h-6 text-neutral-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
            <path d="M12 4v16" strokeLinecap="round" strokeDasharray="3 3" />
          </svg>
          <span className="text-sm uppercase tracking-widest font-mono">Lightfield</span>
          <span className="text-[10px] bg-neutral-200 border border-neutral-300 rounded px-1.5 py-0.2 font-bold text-neutral-600">SANDBOX</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <a 
            href="https://github.com/Tejal-Bhavsar/lightfield-core-sandbox" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/dashboard"
            className="text-xs px-3.5 py-1.5 border border-neutral-950 bg-neutral-950 hover:bg-neutral-900 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 max-w-2xl mx-auto leading-[1.1]">
          The Agentic CRM that assembles itself.
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Lightfield captures unstructured emails, calendar meetings, and Slack transcripts, automatically organizing them into structured accounts, contacts, pipeline stages, and versioned memories.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 bg-neutral-950 hover:bg-neutral-900 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 group hover:scale-[1.01]"
          >
            <span>Enter Developer Sandbox</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <a
            href="https://github.com/Tejal-Bhavsar/lightfield-core-sandbox"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-2"
          >
            <GitBranch className="w-4 h-4 text-neutral-400" />
            <span>Explore Codebase</span>
          </a>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="border-t border-neutral-200/50 pt-16">
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-center mb-10">
            Sandbox Technical Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white border border-neutral-200/60 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow space-y-3">
              <div className="p-2 bg-neutral-50 border border-neutral-200 rounded-lg w-fit">
                <Cpu className="w-4 h-4 text-neutral-700" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Agentic Ingestion</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Paste raw emails or transcripts. The engine runs a pluggable LLM/regex parser extracting target budgets, contacts, and follow-up tasks.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-neutral-200/60 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow space-y-3">
              <div className="p-2 bg-neutral-50 border border-neutral-200 rounded-lg w-fit">
                <TrendingUp className="w-4 h-4 text-neutral-700" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Kanban Pipeline</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                A sales pipeline board with 6 stages (Lead, Contacted, Demo, Proposal, Won, Lost), displaying live deal valuations and stage controllers.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-neutral-200/60 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow space-y-3">
              <div className="p-2 bg-neutral-50 border border-neutral-200 rounded-lg w-fit">
                <Database className="w-4 h-4 text-neutral-700" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Memory Hub</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Implements a versioned client summary interface. Users click through historic compilation snapshots of the account's knowledge box.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-neutral-200/60 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow space-y-3">
              <div className="p-2 bg-neutral-50 border border-neutral-200 rounded-lg w-fit">
                <Search className="w-4 h-4 text-neutral-700" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Grounded Chat</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                English query assistant showing reasoning steps and returning synthesized answers anchored by clickable database citation links.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Engineer Spotlight */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20 w-full">
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
              <UserCheck className="w-3 h-3" />
              <span>Created by Tejal Bhavsar</span>
            </div>
            
            <h3 className="text-lg font-bold text-neutral-900">
              Why I built this sandbox
            </h3>
            
            <p className="text-xs text-neutral-500 leading-relaxed">
              I am an **MS candidate in AI & Data Science** at UMBC with **4+ years of full-stack engineering** experience. I engineered this sandbox to prove my capability and readiness for the **AI Product Engineer (New Grad)** role at Lightfield. 
            </p>

            <p className="text-xs text-neutral-500 leading-relaxed">
              At Globant, I designed reusable LLM infrastructure and shipped unstructured text parsing engines (achieving an 80% accuracy boost). I wanted to apply the same passion for clean product engineering to build the CRM features you are bringing to market.
            </p>

            {/* Technical Chips */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {['TypeScript', 'React', 'Next.js', 'Apollo GraphQL', 'Prisma', 'PostgreSQL', 'LLMs/RAG'].map((tech) => (
                <span key={tech} className="bg-neutral-50 border border-neutral-200 rounded px-2 py-0.5 text-[9px] font-semibold text-neutral-600 font-mono">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-200/50 bg-white py-6 w-full text-center text-[10px] text-neutral-400 font-mono">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 Lightfield Sandbox. Built by Tejal Bhavsar.</span>
          <div className="flex items-center space-x-4">
            <a href="mailto:sdetejal@gmail.com" className="hover:text-neutral-600 transition-colors">sdetejal@gmail.com</a>
            <a href="https://linkedin.com/in/hi-tejal-here/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600 transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
