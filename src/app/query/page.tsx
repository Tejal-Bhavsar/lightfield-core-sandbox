'use client';

import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { 
  Search, 
  Sparkles, 
  Loader2, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle,
  FileText,
  Mail,
  Video,
  X,
  Compass,
  Circle
} from 'lucide-react';

const SEARCH_MEMORIES = gql`
  query SearchMemories($query: String!) {
    searchMemories(query: $query) {
      answer
      citations {
        id
        type
        channel
        content
        sender
        timestamp
        accountName
      }
    }
  }
`;

interface ChatHistoryItem {
  query: string;
  answer: string;
  citations: Array<{
    id: string;
    type: string;
    channel: string | null;
    content: string;
    sender: string | null;
    timestamp: string;
    accountName: string;
  }>;
  retrievedCount: number;
}

export default function QueryInterface() {
  const [searchInput, setSearchInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [runSearch, { loading }] = useLazyQuery<any>(SEARCH_MEMORIES);
  const [activeCitation, setActiveCitation] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim() || loading) return;

    const currentQuery = searchInput;
    setSearchInput('');

    try {
      const { data } = await runSearch({
        variables: { query: currentQuery }
      });

      if (data?.searchMemories) {
        setChatHistory(prev => [
          ...prev,
          {
            query: currentQuery,
            answer: data.searchMemories.answer,
            citations: data.searchMemories.citations,
            retrievedCount: data.searchMemories.citations.length
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCitationIcon = (type: string) => {
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-lf-border bg-white flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-lf-primary">AI Sales Assistant</h1>
          <p className="text-xs text-neutral-400">Ask questions about customer accounts and get grounded citations</p>
        </div>
      </header>

      {/* Main chat window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center">
        
        {chatHistory.length === 0 && !loading && (
          <div className="max-w-2xl w-full text-center py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 bg-white border border-lf-border rounded-xl flex items-center justify-center shadow-xs">
              <Compass className="w-6 h-6 text-neutral-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-lf-primary">Ask anything about your customer accounts</h2>
              <p className="text-xs text-neutral-400 max-w-sm mt-1 mx-auto leading-relaxed">
                "Which clients asked for custom pricing options?" or "Does Vercel require SSO support?"
              </p>
            </div>
            
            {/* Suggestion tags */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md pt-2">
              <button 
                onClick={() => setSearchInput("SSO")}
                className="text-[11px] bg-white hover:bg-neutral-50 border border-lf-border rounded-lg px-3 py-1.5 font-medium text-neutral-600 transition-colors"
              >
                🔍 Search SSO requests
              </button>
              <button 
                onClick={() => setSearchInput("pricing")}
                className="text-[11px] bg-white hover:bg-neutral-50 border border-lf-border rounded-lg px-3 py-1.5 font-medium text-neutral-600 transition-colors"
              >
                💰 Search pricing discussions
              </button>
              <button 
                onClick={() => setSearchInput("HubSpot")}
                className="text-[11px] bg-white hover:bg-neutral-50 border border-lf-border rounded-lg px-3 py-1.5 font-medium text-neutral-600 transition-colors"
              >
                🔄 Find HubSpot migration mentions
              </button>
            </div>
          </div>
        )}

        {/* Chat History List */}
        <div className="max-w-3xl w-full flex-1 space-y-6">
          {chatHistory.map((item, index) => (
            <div key={index} className="space-y-4">
              
              {/* User Question */}
              <div className="flex justify-end">
                <div className="bg-neutral-100 border border-lf-border text-neutral-700 px-4 py-2.5 rounded-2xl max-w-lg text-xs font-semibold shadow-xs">
                  {item.query}
                </div>
              </div>

              {/* Lightfield Agent Response */}
              <div className="bg-white border border-lf-border rounded-xl p-5 shadow-xs space-y-4">
                
                {/* Agent Header */}
                <div className="flex items-center space-x-2 border-b border-lf-border pb-2.5">
                  <div className="w-5 h-5 bg-neutral-900 rounded-md flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M4 4l16 16M20 4L4 20" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-lf-primary">Lightfield AI</span>
                </div>

                {/* Simulated search steps */}
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[10px] text-green-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span>Retrieved all customer accounts matching "{item.query}"</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-green-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span>Analyzed {item.retrievedCount} interactions for key contexts</span>
                  </div>
                </div>

                {/* AI Synthesized Text */}
                <div className="text-xs text-neutral-700 leading-relaxed font-sans border border-lf-border rounded-xl p-4 bg-neutral-50/30">
                  {item.answer}
                </div>

                {/* Citation Cards List */}
                {item.citations.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">Citations & Source Data</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.citations.map((cite) => (
                        <button
                          key={cite.id}
                          onClick={() => setActiveCitation(cite)}
                          className="flex items-start text-left p-3 border border-lf-border hover:border-lf-primary/20 hover:bg-neutral-50/50 rounded-lg transition-all group shrink-0"
                        >
                          <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center border border-lf-border mr-3 shrink-0">
                            {getCitationIcon(cite.type)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-lf-primary truncate block group-hover:text-lf-primary-hover">{cite.accountName}</span>
                            <span className="text-[10px] text-neutral-400 truncate block mt-0.5">
                              {cite.sender || 'Client'} • {new Date(cite.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}

          {/* Search Loading Screen */}
          {loading && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="bg-neutral-100 border border-lf-border text-neutral-700 px-4 py-2.5 rounded-2xl max-w-lg text-xs font-semibold shadow-xs">
                  Analyzing queries...
                </div>
              </div>

              <div className="bg-white border border-lf-border rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 border-b border-lf-border pb-2.5">
                  <div className="w-5 h-5 bg-neutral-900 rounded-md flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M4 4l16 16M20 4L4 20" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-lf-primary">Lightfield AI</span>
                </div>

                <div className="space-y-2 py-2">
                  <div className="flex items-center space-x-2 text-[10px] text-neutral-500 font-medium animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin shrink-0" />
                    <span>Searching sqlite database index...</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-neutral-300 font-medium">
                    <Circle className="w-3.5 h-3.5 text-neutral-200 shrink-0" />
                    <span>Waiting to compile context responses...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Citation Modal */}
      {activeCitation && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-lf-border rounded-xl shadow-lg max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-lf-border flex items-center justify-between shrink-0 bg-neutral-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded bg-white flex items-center justify-center border border-lf-border">
                  {getCitationIcon(activeCitation.type)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-lf-primary">{activeCitation.accountName} Citation</h3>
                  <p className="text-[10px] text-neutral-400">Source: {activeCitation.type} via {activeCitation.channel || 'Direct'}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveCitation(null)}
                className="text-neutral-400 hover:text-lf-primary border border-lf-border rounded-lg p-1.5 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto font-mono text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {activeCitation.content}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-lf-border bg-neutral-50 flex items-center justify-between text-[10px] text-neutral-400 shrink-0">
              <span>Sender: <strong className="text-neutral-500 font-semibold">{activeCitation.sender || 'Client'}</strong></span>
              <span>Timestamp: {new Date(activeCitation.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Search Bar Form */}
      <div className="p-4 border-t border-lf-border bg-white flex justify-center shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl w-full flex items-center relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={loading}
            placeholder="Ask questions (e.g. 'What competitors does Stripe evaluate?')"
            className="w-full text-xs border border-lf-border rounded-xl pl-10 pr-24 py-3 bg-neutral-50/50 focus:outline-none focus:border-lf-primary focus:bg-white transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-[15px]" />
          
          <button
            type="submit"
            disabled={loading || !searchInput.trim()}
            className="absolute right-2 top-2 bg-lf-primary text-white hover:bg-lf-primary-hover font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-xs disabled:opacity-50 transition-colors"
          >
            <span>Ask</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
