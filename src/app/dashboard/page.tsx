'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { 
  Plus, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Circle,
  Clock, 
  Send,
  Loader2,
  Trash2,
  CheckSquare,
  Building
} from 'lucide-react';

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    accounts {
      id
      name
      stage
      website
      updatedAt
      tasks {
        id
        title
        completed
        dueDate
      }
      interactions {
        id
        type
        content
        sender
        timestamp
      }
      memories {
        id
        summary
      }
    }
  }
`;

const INGEST_ACTIVITY = gql`
  mutation IngestActivity(
    $type: String!
    $channel: String
    $content: String!
    $sender: String
    $senderEmail: String
    $accountName: String
  ) {
    ingestRawActivity(
      type: $type
      channel: $channel
      content: $content
      sender: $sender
      senderEmail: $senderEmail
      accountName: $accountName
    ) {
      id
      name
      stage
      website
      updatedAt
      tasks {
        id
        title
        completed
        dueDate
      }
      interactions {
        id
        type
        content
        sender
        timestamp
      }
      memories {
        id
        summary
      }
    }
  }
`;

const TOGGLE_TASK = gql`
  mutation ToggleTask($id: ID!, $completed: Boolean!) {
    toggleTask(id: $id, completed: $completed) {
      id
      completed
    }
  }
`;

const RESET_DATABASE = gql`
  mutation ResetDatabase {
    resetDatabase
  }
`;

const MOCK_TEMPLATES = [
  {
    label: "Vercel Demo Transcript",
    icon: Sparkles,
    type: "TRANSCRIPT",
    channel: "Zoom Demo Call",
    sender: "Guillermo Rauch",
    senderEmail: "guillermo@vercel.com",
    accountName: "Vercel",
    content: "Hi team, we just had a demo with Vercel's engineering director, Guillermo. They are currently locked into a Salesforce contract for their sales rep workspace but are extremely frustrated. They want to migrate to Lightfield within next month. They asked if we support custom SAML SSO and GDPR compliance out-of-the-box. Guillermo mentioned they have a budget of about $50,000 for their dev team licenses. I told him we'd send the GDPR compliance documents and scheduling links by Friday."
  },
  {
    label: "Stripe HubSpot Churn Email",
    icon: Send,
    type: "EMAIL",
    channel: "Inbound Email Inquiry",
    sender: "John Collison",
    senderEmail: "john@stripe.com",
    accountName: "Stripe",
    content: "Hey, we are currently exploring CRM options. Our sales ops lead mentioned Lightfield is much easier than HubSpot, which we currently use. HubSpot costs us too much and has strict limitations. Do you have details on startup pricing? Also, does your automated pipeline agent enrich LinkedIn contact records? Please send over a pricing sheet."
  },
  {
    label: "Figma Contract Signed",
    icon: CheckCircle2,
    type: "EMAIL",
    channel: "Legal & Invoicing",
    sender: "Dylan Field",
    senderEmail: "dylan@figma.com",
    accountName: "Figma",
    content: "Hi team, good news. Figma has reviewed the custom workspace proposal and has signed the contract. We are officially closed won! I will set up the kickoff call next Monday to onboard the team."
  }
];

export default function Dashboard() {
  const { data, loading, error, refetch } = useQuery<any>(GET_DASHBOARD_DATA);
  const [ingestRawActivity, { loading: ingesting }] = useMutation(INGEST_ACTIVITY);
  const [toggleTask] = useMutation(TOGGLE_TASK);
  const [resetDatabase, { loading: resetting }] = useMutation(RESET_DATABASE);

  const [customInput, setCustomInput] = useState('');
  const [customAccount, setCustomAccount] = useState('');
  const [customSender, setCustomSender] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customType, setCustomType] = useState('EMAIL');

  const handleTemplateIngest = async (template: typeof MOCK_TEMPLATES[0]) => {
    try {
      await ingestRawActivity({
        variables: {
          type: template.type,
          channel: template.channel,
          content: template.content,
          sender: template.sender,
          senderEmail: template.senderEmail,
          accountName: template.accountName
        }
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCustomIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    try {
      await ingestRawActivity({
        variables: {
          type: customType,
          content: customInput,
          sender: customSender || null,
          senderEmail: customEmail || null,
          accountName: customAccount || null
        }
      });
      setCustomInput('');
      setCustomAccount('');
      setCustomSender('');
      setCustomEmail('');
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await toggleTask({
        variables: { id: taskId, completed: !currentStatus },
        optimisticResponse: {
          toggleTask: {
            __typename: 'Task',
            id: taskId,
            completed: !currentStatus
          }
        }
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to clear the entire local database?")) {
      await resetDatabase();
      refetch();
    }
  };

  // Compile active tasks and recent activities
  const allAccounts = data?.accounts || [];
  const activeTasks = allAccounts.flatMap((acc: any) => 
    (acc.tasks || []).map((t: any) => ({ ...t, accountName: acc.name }))
  ).filter((t: any) => !t.completed).slice(0, 5);

  const recentInteractions = allAccounts.flatMap((acc: any) =>
    (acc.interactions || []).map((i: any) => ({ ...i, accountName: acc.name }))
  ).sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 5);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-lf-border bg-white flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-lf-primary">Up next</h1>
          <p className="text-xs text-neutral-400">Lightfield CRM Synthesis Control Center</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleReset} 
            disabled={resetting}
            className="flex items-center space-x-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Reset CRM</span>
          </button>
        </div>
      </header>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        
        {/* Quick Simulator Templates */}
        <section className="bg-white border border-lf-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center space-x-2 mb-3">
            <Activity className="w-4 h-4 text-lf-primary" />
            <h2 className="text-sm font-semibold text-lf-primary">Simulation Sandbox (Ingest Activity)</h2>
          </div>
          <p className="text-xs text-neutral-500 mb-4">
            Click one of the pre-loaded customer interaction templates below. Lightfield's pipeline will automatically parse the unstructured text, create the customer profile, suggest a sales stage, and extract key tasks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_TEMPLATES.map((tpl, idx) => {
              const Icon = tpl.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleTemplateIngest(tpl)}
                  disabled={ingesting}
                  className="flex flex-col items-start text-left p-4 border border-lf-border hover:border-lf-primary/30 rounded-lg hover:bg-neutral-50 transition-all group disabled:opacity-60"
                >
                  <div className="w-7 h-7 bg-neutral-100 group-hover:bg-white rounded-md flex items-center justify-between justify-center mb-3 border border-lf-border">
                    <Icon className="w-4 h-4 text-neutral-500 group-hover:text-lf-primary" />
                  </div>
                  <span className="text-xs font-semibold text-lf-primary mb-1">{tpl.label}</span>
                  <span className="text-[11px] text-neutral-400 line-clamp-2">{tpl.content}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Custom Activity Ingestion Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white border border-lf-border rounded-xl p-5 shadow-xs flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
              <Plus className="w-4 h-4 text-lf-primary" />
              <h2 className="text-sm font-semibold text-lf-primary">Ingest Custom Interaction</h2>
            </div>
            <form onSubmit={handleCustomIngest} className="space-y-4 flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={customAccount}
                    onChange={(e) => setCustomAccount(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 focus:outline-none focus:border-lf-primary bg-neutral-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={customSender}
                    onChange={(e) => setCustomSender(e.target.value)}
                    placeholder="e.g. John"
                    className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 focus:outline-none focus:border-lf-primary bg-neutral-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Sender Email</label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="john@stripe.com"
                    className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 focus:outline-none focus:border-lf-primary bg-neutral-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Unstructured Interaction Text</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCustomType('EMAIL')}
                      className={`text-[10px] px-2 py-0.5 rounded ${customType === 'EMAIL' ? 'bg-lf-primary text-white font-medium' : 'bg-neutral-100 text-neutral-500'}`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomType('SLACK')}
                      className={`text-[10px] px-2 py-0.5 rounded ${customType === 'SLACK' ? 'bg-lf-primary text-white font-medium' : 'bg-neutral-100 text-neutral-500'}`}
                    >
                      Slack
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomType('TRANSCRIPT')}
                      className={`text-[10px] px-2 py-0.5 rounded ${customType === 'TRANSCRIPT' ? 'bg-lf-primary text-white font-medium' : 'bg-neutral-100 text-neutral-500'}`}
                    >
                      Transcript
                    </button>
                  </div>
                </div>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  rows={5}
                  required
                  placeholder="Paste email conversation, meeting logs or notes here... The system will parse everything."
                  className="w-full text-xs border border-lf-border rounded-lg p-3 focus:outline-none focus:border-lf-primary font-mono bg-neutral-50/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={ingesting || !customInput.trim()}
                className="w-full flex items-center justify-center space-x-1.5 bg-lf-primary text-white hover:bg-lf-primary-hover py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {ingesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Ingest & Run Pipeline</span>
              </button>
            </form>
          </section>

          {/* Action List (Tasks) */}
          <section className="bg-white border border-lf-border rounded-xl p-5 shadow-xs flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-4 justify-between">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-lf-primary" />
                <h2 className="text-sm font-semibold text-lf-primary">Action items</h2>
              </div>
              <span className="text-[11px] font-medium text-neutral-400">{activeTasks.length} pending</span>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-neutral-400">
                <CheckCircle2 className="w-8 h-8 text-neutral-200 mb-2" />
                <p className="text-xs font-medium">All caught up!</p>
                <p className="text-[10px] text-neutral-400">Tasks will be automatically extracted from interaction history.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[300px]">
                {activeTasks.map((task: any) => (
                  <div 
                    key={task.id} 
                    onClick={() => handleToggleTask(task.id, task.completed)}
                    className="flex items-start space-x-3 p-2.5 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-lf-border group"
                  >
                    <button className="shrink-0 mt-0.5 text-neutral-300 group-hover:text-lf-primary">
                      {task.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-700 font-medium leading-relaxed group-hover:text-lf-primary transition-colors">{task.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{task.accountName}</span>
                        {task.dueDate && (
                          <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 rounded px-1 flex items-center space-x-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Pipeline / Ingested Accounts */}
        <section className="bg-white border border-lf-border rounded-xl p-5 shadow-xs">
          <h2 className="text-sm font-semibold text-lf-primary mb-4 flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>Active Accounts ({allAccounts.length})</span>
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
            </div>
          ) : allAccounts.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 border border-dashed border-lf-border rounded-lg bg-neutral-50/50">
              <Building className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-semibold">No accounts found</p>
              <p className="text-[10px]">Import database from templates above to populate records.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allAccounts.map((acc: any) => {
                const totalTasks = acc.tasks?.length || 0;
                const completedTasks = acc.tasks?.filter((t: any) => t.completed).length || 0;
                
                return (
                  <div key={acc.id} className="border border-lf-border p-4 rounded-xl flex flex-col justify-between hover:border-lf-primary/20 hover:shadow-xs transition-all bg-white">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-lf-primary truncate max-w-[130px]">{acc.name}</h3>
                          <a href={`https://${acc.website}`} target="_blank" rel="noreferrer" className="text-[10px] text-neutral-400 hover:text-lf-primary block truncate mb-2">{acc.website}</a>
                        </div>
                        <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          acc.stage === 'Closed Won' ? 'bg-green-50 text-green-700 border-green-200' :
                          acc.stage === 'Proposal Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          acc.stage === 'Demo Scheduled' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-neutral-50 text-neutral-600 border-neutral-200'
                        }`}>
                          {acc.stage}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-neutral-500 line-clamp-2 mt-2 italic">
                        "{acc.memories?.[0]?.summary || 'No memory recorded yet.'}"
                      </div>
                    </div>

                    <div className="border-t border-lf-border mt-4 pt-3 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Tasks: {completedTasks}/{totalTasks}</span>
                      <span>Updated {new Date(acc.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
