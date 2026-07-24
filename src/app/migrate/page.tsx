'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { 
  ArrowRightLeft, 
  Upload, 
  Play, 
  Loader2, 
  CheckCircle2, 
  Terminal, 
  ArrowRight,
  Database,
  Info
} from 'lucide-react';
import Link from 'next/link';

const SIMULATE_MIGRATION = gql`
  mutation SimulateMigration($csvContent: String!) {
    simulateHubSpotMigration(csvContent: $csvContent) {
      id
      name
      stage
      contacts {
        id
        name
      }
    }
  }
`;

const SAMPLE_HUBSPOT_CSV = 
`company,stage,contact,email,notes
Linear,Proposal Sent,Karri Saarinen,karri@linear.app,"Linear is evaluating Lightfield CRM. They are extremely frustrated with HubSpot's egress costs and sluggish performance. They have 15 reps and need custom sales sequencing integrations. Karri requested custom SSO options."
Retool,Demo Scheduled,David Hsu,david@retool.com,"Retool is reviewing the demo we gave on June 10. They mentioned HubSpot's pipeline customization is too rigid. They want a schema-less setup to store call logs directly. Budget is around $30,000 annually."
Vanta,Closed Won,Christina Cacioppo,christina@vanta.com,"Contract signed. Christina wants to onboard 45 reps to Lightfield CRM starting next Monday. They completed SOC2 audit with their own tools but need HIPAA compliance tags."
Vercel,Lead,Guillermo Rauch,guillermo@vercel.com,"Guillermo is unhappy with Salesforce/HubSpot lock-in. He expressed interest in an agent-first CRM. Asked for startup pricing tiers."`;

export default function HubSpotMigrator() {
  const [csvContent, setCsvContent] = useState(SAMPLE_HUBSPOT_CSV);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [simulateMigration, { loading }] = useMutation<any>(SIMULATE_MIGRATION);

  const startMigration = async () => {
    if (!csvContent.trim() || loading) return;

    setMigrationStatus('running');
    setProgress(0);
    setLogs([]);

    const logStatements = [
      "🔄 Initializing connection to HubSpot API...",
      "📂 Fetching schema structures: Company, Contact, Deal, Ticket...",
      "🔍 Mapping HubSpot Relational columns to Lightfield Schema-less Memory...",
      "📦 Ingesting Linear records...",
      "✨ Ingesting Retool records...",
      "🔑 Running Contact enrichment for karri@linear.app...",
      "📦 Ingesting Vanta records...",
      "✨ Ingesting Vercel records...",
      "🚀 Synthesizing Versioned Customer Memories for imported records...",
      "📋 Extracting actionable tasks and stages...",
      "✅ Mapping completed. Writing database commits..."
    ];

    // Simulate progress counting and logging
    let currentProgress = 0;
    let logIndex = 0;

    const interval = setInterval(async () => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (logIndex < logStatements.length && currentProgress % 10 === 0) {
        setLogs(prev => [...prev, logStatements[logIndex]]);
        logIndex++;
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Trigger actual database imports via GraphQL Mutation
        try {
          await simulateMigration({
            variables: { csvContent }
          });
          setMigrationStatus('success');
        } catch (e) {
          console.error(e);
          setLogs(prev => [...prev, "❌ Migration failed: DB Sync Error"]);
          setMigrationStatus('idle');
        }
      }
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-lf-border bg-white flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-lf-primary">HubSpot Migrator</h1>
          <p className="text-xs text-neutral-400">Migrate your legacy CRM data to Lightfield in under an hour</p>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center">
        <div className="max-w-3xl w-full space-y-6">
          
          {/* Informational Hero Card */}
          <div className="bg-white border border-lf-border rounded-xl p-5 shadow-xs flex items-start space-x-4">
            <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center shrink-0 border border-lf-border">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-lf-primary">One-Hour Migration Pitch</h2>
              <p className="text-xs text-neutral-500 leading-relaxed mt-1">
                Legacy CRMs lock you in with rigid databases and complex formats. Lightfield's migration tool parses legacy tables, maps columns automatically, translates deal histories, and builds a schema-less customer memory log instantly.
              </p>
            </div>
          </div>

          {migrationStatus === 'idle' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CSV Input Panel */}
              <div className="lg:col-span-2 bg-white border border-lf-border rounded-xl p-5 shadow-xs flex flex-col">
                <div className="flex items-center justify-between border-b border-lf-border pb-3 mb-4">
                  <h3 className="text-xs font-semibold text-lf-primary uppercase tracking-wider flex items-center space-x-2">
                    <Database className="w-4 h-4 text-neutral-400" />
                    <span>Structured HubSpot CSV Data</span>
                  </h3>
                  <button 
                    onClick={() => setCsvContent(SAMPLE_HUBSPOT_CSV)}
                    className="text-[10px] text-neutral-500 border border-lf-border rounded px-2 py-0.5 hover:bg-neutral-50"
                  >
                    Reset to Sample
                  </button>
                </div>

                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  rows={10}
                  className="w-full text-xs font-mono border border-lf-border rounded-lg p-3 bg-neutral-50/50 focus:outline-none focus:border-lf-primary resize-none flex-1"
                  placeholder="Paste HubSpot CSV exports here..."
                />
              </div>

              {/* Configure Panel */}
              <div className="bg-white border border-lf-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-lf-primary uppercase tracking-wider border-b border-lf-border pb-3 mb-4">Migration Setup</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2.5">
                      <Upload className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-lf-primary">Verify Headers</h4>
                        <p className="text-[10px] text-neutral-400 leading-normal">Requires columns: <code>company</code>, <code>stage</code>, <code>contact</code>, <code>email</code>, <code>notes</code>.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <Info className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-lf-primary">Zero Egress Fees</h4>
                        <p className="text-[10px] text-neutral-400 leading-normal">We do not charge egress or translation fees. Custom object structures are converted automatically.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startMigration}
                  disabled={!csvContent.trim()}
                  className="w-full flex items-center justify-center space-x-1.5 bg-lf-primary text-white hover:bg-lf-primary-hover py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-colors mt-6"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Migration</span>
                </button>
              </div>

            </div>
          )}

          {/* Running Status Screen */}
          {migrationStatus === 'running' && (
            <div className="bg-white border border-lf-border rounded-xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <Loader2 className="w-8 h-8 text-lf-primary animate-spin" />
                <h3 className="text-sm font-semibold text-lf-primary">Migrating HubSpot Database...</h3>
                <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">Progress: {progress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-lf-border">
                <div 
                  className="bg-lf-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Live Terminal Log */}
              <div className="border border-lf-border rounded-xl p-4 bg-neutral-900 text-white font-mono text-[10px] space-y-2 h-48 overflow-y-auto shadow-inner flex flex-col justify-end">
                <div className="flex items-center space-x-1.5 border-b border-neutral-800 pb-2 mb-2 text-neutral-500 font-sans font-bold uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Migration agent trace output</span>
                </div>
                <div className="space-y-1.5 overflow-y-auto">
                  {logs.map((log, idx) => (
                    <div key={idx} className="leading-normal">{log}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Success Screen */}
          {migrationStatus === 'success' && (
            <div className="bg-white border border-lf-border rounded-xl p-8 shadow-xs text-center flex flex-col items-center space-y-6">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-lf-primary">Migration Completed Successfully!</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  HubSpot relational database rows have been parsed, enriched, and converted into Lightfield Versioned Memories.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-md w-full bg-neutral-50 border border-lf-border p-4 rounded-xl">
                <div>
                  <span className="block text-lg font-bold text-lf-primary">4</span>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Accounts</span>
                </div>
                <div>
                  <span className="block text-lg font-bold text-lf-primary">4</span>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Contacts</span>
                </div>
                <div>
                  <span className="block text-lg font-bold text-lf-primary">4</span>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Memories</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setMigrationStatus('idle')}
                  className="px-4 py-2 border border-lf-border text-neutral-600 font-semibold rounded-lg text-xs hover:bg-neutral-50 transition-colors"
                >
                  Import More Data
                </button>
                <Link
                  href="/memory"
                  className="px-4 py-2 bg-lf-primary text-white hover:bg-lf-primary-hover font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <span>View in Memory Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
