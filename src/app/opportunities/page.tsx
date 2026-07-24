'use client';

import React from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { 
  TrendingUp, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Briefcase, 
  DollarSign, 
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const GET_OPPORTUNITIES = gql`
  query GetOpportunities {
    opportunities {
      id
      title
      value
      stage
      updatedAt
      account {
        id
        name
        website
      }
    }
  }
`;

const UPDATE_OPPORTUNITY_STAGE = gql`
  mutation UpdateOpportunityStage($id: ID!, $stage: String!) {
    updateOpportunityStage(id: $id, stage: $stage) {
      id
      stage
      updatedAt
    }
  }
`;

const STAGES = [
  { key: 'Lead', label: 'Lead', color: 'bg-neutral-100 border-neutral-200 text-neutral-600' },
  { key: 'Contacted', label: 'Contacted', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { key: 'Demo Scheduled', label: 'Demo', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { key: 'Proposal Sent', label: 'Proposal', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { key: 'Closed Won', label: 'Closed Won', color: 'bg-green-50 border-green-200 text-green-700' },
  { key: 'Closed Lost', label: 'Closed Lost', color: 'bg-red-50 border-red-200 text-red-700' }
];

export default function OpportunitiesPipeline() {
  const { data, loading, error, refetch } = useQuery<any>(GET_OPPORTUNITIES);
  const [updateOpportunityStage, { loading: updating }] = useMutation(UPDATE_OPPORTUNITY_STAGE);

  const opportunities = data?.opportunities || [];

  const handleMoveStage = async (id: string, currentStage: string, direction: 'prev' | 'next') => {
    const currentIdx = STAGES.findIndex(s => s.key === currentStage);
    let nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    
    if (nextIdx >= 0 && nextIdx < STAGES.length) {
      const nextStage = STAGES[nextIdx].key;
      try {
        await updateOpportunityStage({
          variables: { id, stage: nextStage },
          optimisticResponse: {
            updateOpportunityStage: {
              __typename: 'Opportunity',
              id,
              stage: nextStage,
              updatedAt: new Date().toISOString()
            }
          }
        });
        refetch();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleStageSelect = async (id: string, targetStage: string) => {
    try {
      await updateOpportunityStage({
        variables: { id, stage: targetStage },
        optimisticResponse: {
          updateOpportunityStage: {
            __typename: 'Opportunity',
            id,
            stage: targetStage,
            updatedAt: new Date().toISOString()
          }
        }
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Calculations for pipeline stats
  const totalValue = opportunities.reduce((sum: number, opp: any) => sum + opp.value, 0);
  const activeOpportunities = opportunities.filter((o: any) => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost');
  const activeValue = activeOpportunities.reduce((sum: number, opp: any) => sum + opp.value, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-lf-border bg-white flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-lf-primary">Opportunities Pipeline</h1>
          <p className="text-xs text-neutral-400">Manage and track deals through the agent-driven sales lifecycle</p>
        </div>

        {/* Pipeline Value summaries */}
        <div className="flex items-center space-x-6 text-right">
          <div>
            <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Active Pipeline</span>
            <span className="text-xs font-bold text-lf-primary">{formatCurrency(activeValue)}</span>
          </div>
          <div>
            <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Total Deal Value</span>
            <span className="text-xs font-bold text-neutral-500">{formatCurrency(totalValue)}</span>
          </div>
        </div>
      </header>

      {/* Main Kanban Board Layout */}
      <div className="flex-1 overflow-x-auto p-6 flex items-start space-x-4 h-full min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center h-96 max-w-lg mx-auto bg-white border border-lf-border rounded-xl p-8 shadow-xs">
            <Briefcase className="w-10 h-10 text-neutral-200 mb-2" />
            <h2 className="text-sm font-semibold text-lf-primary">No opportunities created</h2>
            <p className="text-xs text-neutral-500 max-w-xs mt-1 leading-relaxed">
              Opportunities are automatically generated when you ingest conversations that contain pricing/budget details. Try parsing a simulation template on the Dashboard!
            </p>
            <Link 
              href="/"
              className="mt-5 px-4 py-2 bg-lf-primary text-white hover:bg-lf-primary-hover font-semibold rounded-lg text-xs shadow-xs transition-colors"
            >
              Go Ingest Activity
            </Link>
          </div>
        ) : (
          STAGES.map((col) => {
            const colOpps = opportunities.filter((opp: any) => opp.stage === col.key);
            const colValue = colOpps.reduce((sum: number, opp: any) => sum + opp.value, 0);

            return (
              <div 
                key={col.key} 
                className="w-72 flex flex-col max-h-full h-full border border-lf-border bg-neutral-50/50 rounded-xl overflow-hidden shrink-0 shadow-xs"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-lf-border bg-white flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400">({colOpps.length})</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-500 font-mono">
                    {formatCurrency(colValue)}
                  </span>
                </div>

                {/* Column Cards List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {colOpps.length === 0 ? (
                    <div className="h-20 border border-dashed border-neutral-200 rounded-lg flex items-center justify-center text-[10px] text-neutral-400 italic">
                      Empty stage
                    </div>
                  ) : (
                    colOpps.map((opp: any) => (
                      <div 
                        key={opp.id} 
                        className="bg-white border border-lf-border hover:border-lf-primary/20 p-4 rounded-xl shadow-2xs hover:shadow-xs transition-all relative group flex flex-col justify-between space-y-3"
                      >
                        {/* Card Header */}
                        <div>
                          <div className="flex items-start justify-between mb-1.5">
                            <span className="text-xs font-extrabold text-lf-primary truncate max-w-[150px]">
                              {opp.account?.name || 'Unknown Account'}
                            </span>
                            <Link
                              href="/memory"
                              className="text-[9px] text-neutral-400 hover:text-lf-primary transition-colors flex items-center"
                            >
                              View Memory
                            </Link>
                          </div>
                          <h4 className="text-[11px] text-neutral-500 truncate" title={opp.title}>
                            {opp.title}
                          </h4>
                        </div>

                        {/* Card details */}
                        <div className="flex items-center justify-between">
                          {/* Value display */}
                          <div className="flex items-center text-xs font-bold text-neutral-700">
                            <DollarSign className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>{formatCurrency(opp.value)}</span>
                          </div>

                          {/* Last updated timestamp */}
                          <div className="flex items-center space-x-1 text-[9px] text-neutral-400">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(opp.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Pipeline Stage controllers */}
                        <div className="border-t border-neutral-100 pt-2.5 flex items-center justify-between">
                          <button
                            onClick={() => handleMoveStage(opp.id, opp.stage, 'prev')}
                            disabled={opp.stage === 'Lead' || updating}
                            className="p-1 border border-lf-border rounded-md hover:bg-neutral-50 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move to previous stage"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Stage selector dropdown */}
                          <select
                            value={opp.stage}
                            onChange={(e) => handleStageSelect(opp.id, e.target.value)}
                            disabled={updating}
                            className="text-[10px] bg-neutral-50 border border-lf-border rounded px-1.5 py-0.5 focus:outline-none font-semibold text-neutral-600 hover:text-lf-primary"
                          >
                            {STAGES.map(s => (
                              <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleMoveStage(opp.id, opp.stage, 'next')}
                            disabled={opp.stage === 'Closed Lost' || updating}
                            className="p-1 border border-lf-border rounded-md hover:bg-neutral-50 text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move to next stage"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
