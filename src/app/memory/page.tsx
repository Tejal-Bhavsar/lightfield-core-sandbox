'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { 
  Building, 
  Clock, 
  Zap, 
  MessageSquare, 
  Mail, 
  Video, 
  Compass, 
  FileText, 
  Loader2,
  Calendar,
  Layers,
  Link as LinkIcon
} from 'lucide-react';

const GET_ACCOUNTS_AND_MEMORIES = gql`
  query GetAccountsAndMemories {
    accounts {
      id
      name
      stage
      website
      logoUrl
      contacts {
        id
        name
        email
        role
      }
      interactions {
        id
        type
        channel
        content
        sender
        timestamp
      }
      memories {
        id
        version
        summary
        pricing
        competitors
        featureRequests
        createdAt
      }
    }
  }
`;

export default function MemoryHub() {
  const { data, loading, error } = useQuery<any>(GET_ACCOUNTS_AND_MEMORIES);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const accounts = data?.accounts || [];
  
  // Set default selected account
  if (accounts.length > 0 && !selectedAccountId) {
    setSelectedAccountId(accounts[0].id);
  }

  const selectedAccount = accounts.find((a: any) => a.id === selectedAccountId);
  const latestMemory = selectedAccount?.memories?.[0];
  const memoryVersions = selectedAccount?.memories || [];
  
  // Select active memory based on chosen version
  const activeMemory = selectedVersion !== null
    ? memoryVersions.find((m: any) => m.version === selectedVersion)
    : latestMemory;

  const handleAccountChange = (id: string) => {
    setSelectedAccountId(id);
    setSelectedVersion(null); // Reset version to latest
  };

  const getInteractionIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-blue-500" />;
      case 'SLACK':
        return <MessageSquare className="w-3.5 h-3.5 text-purple-500" />;
      case 'TRANSCRIPT':
        return <Video className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-background">
      {/* Left Accounts Panel */}
      <div className="w-64 border-r border-lf-border bg-white flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-lf-border">
          <h2 className="text-xs font-semibold text-lf-primary uppercase tracking-wider">Customer Accounts</h2>
          <p className="text-[10px] text-neutral-400">Select an account to view compiled memory</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-10 text-neutral-400 text-xs">
              No accounts created yet. Ingest data on the Dashboard.
            </div>
          ) : (
            accounts.map((acc: any) => (
              <button
                key={acc.id}
                onClick={() => handleAccountChange(acc.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors border ${
                  selectedAccountId === acc.id
                    ? 'bg-neutral-100 text-lf-primary border-lf-border font-medium'
                    : 'text-neutral-500 hover:bg-neutral-50 border-transparent hover:text-lf-primary'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center border border-lf-border text-neutral-400 uppercase text-xs font-bold shrink-0">
                    {acc.name.slice(0, 2)}
                  </div>
                  <span className="truncate text-xs font-semibold">{acc.name}</span>
                </div>
                <span className="text-[9px] bg-neutral-200 text-neutral-500 px-1.5 py-0.2 rounded shrink-0">
                  v{acc.memories.length}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Account Details Area */}
      {selectedAccount ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Account Detail Header */}
          <header className="h-14 border-b border-lf-border bg-white flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center border border-lf-border font-bold text-lf-primary text-sm shrink-0">
                {selectedAccount.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-sm font-semibold text-lf-primary">{selectedAccount.name}</h1>
                <div className="flex items-center space-x-2 text-[10px] text-neutral-400 mt-0.5">
                  <a href={`https://${selectedAccount.website}`} target="_blank" rel="noreferrer" className="flex items-center hover:text-lf-primary">
                    <LinkIcon className="w-2.5 h-2.5 mr-0.5" />
                    <span>{selectedAccount.website}</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                selectedAccount.stage === 'Closed Won' ? 'bg-green-50 text-green-700 border-green-200' :
                selectedAccount.stage === 'Proposal Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                selectedAccount.stage === 'Demo Scheduled' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-neutral-50 text-neutral-600 border-neutral-200'
              }`}>
                {selectedAccount.stage}
              </span>
            </div>
          </header>

          {/* Account Details Scroll View */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Versioned Customer Memory Card */}
            <section className="bg-white border border-lf-border rounded-xl p-5 shadow-xs relative">
              
              {/* Header with Version Selector */}
              <div className="flex items-center justify-between border-b border-lf-border pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-lf-primary" />
                  <h2 className="text-xs font-semibold text-lf-primary uppercase tracking-wider">Versioned Customer Memory</h2>
                </div>
                
                {/* Version Selector Pill list */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-neutral-400 mr-1.5 font-medium">Memory versions:</span>
                  {memoryVersions.map((mem: any) => (
                    <button
                      key={mem.id}
                      onClick={() => setSelectedVersion(mem.version)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border transition-all ${
                        (selectedVersion === mem.version || (selectedVersion === null && mem.version === latestMemory?.version))
                          ? 'bg-lf-primary text-white border-lf-primary'
                          : 'bg-neutral-50 text-neutral-500 border-lf-border hover:bg-neutral-100'
                      }`}
                    >
                      v{mem.version}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory Summary */}
              {activeMemory ? (
                <div className="space-y-4">
                  <div className="bg-neutral-50/50 border border-lf-border p-4 rounded-xl">
                    <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">AI Synthesized Summary</h3>
                    <p className="text-xs text-neutral-700 leading-relaxed italic">
                      "{activeMemory.summary}"
                    </p>
                  </div>

                  {/* Pricing / Competitor / Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Pricing box */}
                    <div className="border border-lf-border p-3.5 rounded-xl bg-white">
                      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Pricing & Budget</h4>
                      <p className="text-xs text-neutral-700">
                        {activeMemory.pricing || <span className="text-neutral-400 italic">No pricing mentioned yet.</span>}
                      </p>
                    </div>

                    {/* Competitors box */}
                    <div className="border border-lf-border p-3.5 rounded-xl bg-white">
                      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Competitors discussed</h4>
                      <p className="text-xs text-neutral-700">
                        {activeMemory.competitors || <span className="text-neutral-400 italic">No competitors mentioned yet.</span>}
                      </p>
                    </div>

                    {/* Feature Requests box */}
                    <div className="border border-lf-border p-3.5 rounded-xl bg-white">
                      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Feature Requests</h4>
                      <p className="text-xs text-neutral-700">
                        {activeMemory.featureRequests || <span className="text-neutral-400 italic">No features requested yet.</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1.5 text-[9px] text-neutral-400 justify-end pt-1">
                    <Clock className="w-3 h-3" />
                    <span>Memory compiled at {new Date(activeMemory.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-neutral-400">
                  No memory snapshots found for this account.
                </div>
              )}
            </section>

            {/* Contacts & Raw Interactions Timeline Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left pane: Key Contacts */}
              <section className="bg-white border border-lf-border rounded-xl p-5 shadow-xs h-fit">
                <div className="border-b border-lf-border pb-3 mb-3">
                  <h3 className="text-xs font-semibold text-lf-primary uppercase tracking-wider">Key Contacts</h3>
                </div>
                {selectedAccount.contacts.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic py-2">No contact profiles recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedAccount.contacts.map((contact: any) => (
                      <div key={contact.id} className="p-3 border border-lf-border rounded-lg bg-neutral-50/30">
                        <p className="text-xs font-bold text-lf-primary">{contact.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{contact.email}</p>
                        {contact.role && (
                          <span className="inline-block text-[9px] bg-neutral-200 text-neutral-600 rounded px-1.5 py-0.2 font-medium mt-1.5">
                            {contact.role}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Right pane: Interaction Timeline */}
              <section className="lg:col-span-2 bg-white border border-lf-border rounded-xl p-5 shadow-xs flex flex-col">
                <div className="border-b border-lf-border pb-3 mb-4">
                  <h3 className="text-xs font-semibold text-lf-primary uppercase tracking-wider">Conversation Log (Source Data)</h3>
                </div>

                {selectedAccount.interactions.length === 0 ? (
                  <div className="text-center py-10 text-xs text-neutral-400">
                    No interactions logged.
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-neutral-200 space-y-5">
                    {selectedAccount.interactions.map((interaction: any) => (
                      <div key={interaction.id} className="relative">
                        {/* Circle dot marker */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 bg-white border border-lf-border rounded-full flex items-center justify-center shadow-xs">
                          {getInteractionIcon(interaction.type)}
                        </div>

                        {/* Message Box */}
                        <div className="border border-lf-border p-4 rounded-xl bg-white hover:border-lf-primary/20 transition-colors">
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-2">
                            <span className="font-semibold text-neutral-500">
                              {interaction.sender} via {interaction.channel || interaction.type}
                            </span>
                            <span>{new Date(interaction.timestamp).toLocaleString()}</span>
                          </div>
                          
                          <p className="text-xs text-neutral-700 leading-relaxed font-mono whitespace-pre-wrap">
                            {interaction.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>

          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center text-center text-neutral-400 p-8">
          <Building className="w-12 h-12 text-neutral-200 mb-2" />
          <h2 className="text-sm font-semibold">No active account</h2>
          <p className="text-xs">Create or select a customer profile to view context history.</p>
        </div>
      )}
    </div>
  );
}
