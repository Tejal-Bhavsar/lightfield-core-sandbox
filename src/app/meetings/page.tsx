'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { 
  Video, 
  Plus, 
  Loader2, 
  Calendar, 
  Building, 
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const GET_MEETINGS_PAGE_DATA = gql`
  query GetMeetingsPageData {
    meetings {
      id
      title
      date
      summary
      transcript
      createdAt
      account {
        id
        name
      }
    }
    accounts {
      id
      name
    }
  }
`;

const CREATE_MEETING = gql`
  mutation CreateMeeting($title: String!, $summary: String, $transcript: String, $accountId: ID!) {
    createMeeting(title: $title, summary: $summary, transcript: $transcript, accountId: $accountId) {
      id
      title
    }
  }
`;

export default function MeetingsPage() {
  const { data, loading, error, refetch } = useQuery<any>(GET_MEETINGS_PAGE_DATA);
  const [createMeeting, { loading: creating }] = useMutation(CREATE_MEETING);

  const [title, setTitle] = useState('');
  const [accountId, setAccountId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);

  const meetings = data?.meetings || [];
  const accounts = data?.accounts || [];

  if (accounts.length > 0 && !accountId) {
    setAccountId(accounts[0].id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !accountId) return;

    try {
      await createMeeting({
        variables: { 
          title, 
          accountId, 
          transcript: transcript || null,
          summary: summary || "Meeting logged in CRM."
        }
      });
      setTitle('');
      setTranscript('');
      setSummary('');
      setShowAddForm(false);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedMeetingId(expandedMeetingId === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-lf-border bg-white flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-lf-primary">Meetings & Transcripts</h1>
          <p className="text-xs text-neutral-400">Log meeting transcripts and view synthesized notes</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-lf-primary hover:bg-lf-primary-hover text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Video className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Hide Form' : 'Log Meeting'}</span>
        </button>
      </header>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Log Meeting Form */}
        {showAddForm && (
          <section className="bg-white border border-lf-border rounded-xl p-5 shadow-xs max-w-2xl">
            <h2 className="text-xs font-semibold text-lf-primary uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-neutral-400" />
              <span>Log Meeting & Run Ingestion Pipeline</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Meeting Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Acme Kickoff Demo"
                    className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 bg-neutral-50/50 focus:outline-none focus:bg-white focus:border-lf-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Company / Account</label>
                  {accounts.length === 0 ? (
                    <span className="block text-xs text-neutral-400 py-2">Create an account first.</span>
                  ) : (
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 bg-neutral-50/50 focus:outline-none focus:bg-white focus:border-lf-primary"
                    >
                      {accounts.map((acc: any) => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Brief Summary</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. Explored pricing structures and migration checklist."
                  className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 bg-neutral-50/50 focus:outline-none focus:bg-white focus:border-lf-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Raw Transcript / Discussion text (Triggers CRM Synthesis)</label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={6}
                  placeholder="Paste Zoom, Google Meet or Teams transcript text here... The engine will run natural language synthesis."
                  className="w-full text-xs font-mono border border-lf-border rounded-lg p-3 bg-neutral-50/50 focus:outline-none focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating || accounts.length === 0}
                  className="w-full flex items-center justify-center space-x-1.5 bg-lf-primary hover:bg-lf-primary-hover text-white py-2.5 rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Ingest & Log Meeting</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Meetings Timeline */}
        <section className="bg-white border border-lf-border rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-lf-border flex items-center justify-between">
            <h2 className="text-xs font-semibold text-lf-primary uppercase tracking-wider flex items-center space-x-2">
              <Video className="w-4 h-4 text-neutral-400" />
              <span>Meetings directory ({meetings.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <Video className="w-8 h-8 mx-auto mb-2 text-neutral-200" />
              <p className="text-xs font-semibold">No logged meetings</p>
              <p className="text-[10px]">Add meetings manually or run HubSpot migrations.</p>
            </div>
          ) : (
            <div className="divide-y divide-lf-border">
              {meetings.map((meeting: any) => (
                <div key={meeting.id} className="p-5 flex flex-col space-y-3 hover:bg-neutral-50/20 transition-colors">
                  {/* Meeting Metadata */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-lf-primary leading-tight">{meeting.title}</h3>
                      <div className="flex items-center space-x-3 mt-1 text-[10px] text-neutral-400">
                        <span className="inline-flex items-center font-semibold text-neutral-500">
                          <Building className="w-3 h-3 mr-1" />
                          <span>{meeting.account.name}</span>
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    {meeting.transcript && (
                      <button
                        onClick={() => toggleExpand(meeting.id)}
                        className="flex items-center space-x-1 text-[10px] border border-lf-border px-2 py-1 rounded-md text-neutral-500 hover:text-lf-primary hover:bg-neutral-50 transition-all font-semibold"
                      >
                        {expandedMeetingId === meeting.id ? (
                          <>
                            <span>Hide Transcript</span>
                            <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <span>View Transcript</span>
                            <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="text-xs text-neutral-600 bg-neutral-50 border border-lf-border p-3 rounded-lg leading-relaxed italic">
                    "{meeting.summary || 'No summary recorded.'}"
                  </div>

                  {/* Expandable Transcript Details */}
                  {expandedMeetingId === meeting.id && meeting.transcript && (
                    <div className="border border-lf-border rounded-lg bg-neutral-900 text-neutral-200 p-4 font-mono text-[11px] leading-relaxed max-h-60 overflow-y-auto shadow-inner whitespace-pre-wrap">
                      {meeting.transcript}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
