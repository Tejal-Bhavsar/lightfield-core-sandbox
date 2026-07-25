'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { 
  FileText, 
  Plus, 
  Loader2, 
  Building, 
  Calendar,
  Layers,
  StickyNote
} from 'lucide-react';

const GET_NOTES_PAGE_DATA = gql`
  query GetNotesPageData {
    notes {
      id
      title
      content
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

const CREATE_NOTE = gql`
  mutation CreateNote($title: String!, $content: String!, $accountId: ID!) {
    createNote(title: $title, content: $content, accountId: $accountId) {
      id
      title
    }
  }
`;

export default function NotesPage() {
  const { data, loading, error, refetch } = useQuery<any>(GET_NOTES_PAGE_DATA);
  const [createNote, { loading: creating }] = useMutation(CREATE_NOTE);

  const [title, setTitle] = useState('');
  const [accountId, setAccountId] = useState('');
  const [content, setContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const notes = data?.notes || [];
  const accounts = data?.accounts || [];

  if (accounts.length > 0 && !accountId) {
    setAccountId(accounts[0].id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !accountId) return;

    try {
      await createNote({
        variables: { title, content, accountId }
      });
      setTitle('');
      setContent('');
      setShowAddForm(false);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-lf-border bg-white flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-lf-primary">Notes</h1>
          <p className="text-xs text-neutral-400">Save and organize quick thoughts, annotations, and client summaries</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-lf-primary hover:bg-lf-primary-hover text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Hide Form' : 'Add Note'}</span>
        </button>
      </header>

      {/* Main scroll view */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Create Note Form */}
        {showAddForm && (
          <section className="bg-white border border-lf-border rounded-xl p-5 shadow-xs max-w-2xl">
            <h2 className="text-xs font-semibold text-lf-primary uppercase tracking-wider mb-4 flex items-center space-x-2">
              <StickyNote className="w-4 h-4 text-neutral-400" />
              <span>Create New Note</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Note Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Action plan for security review"
                    className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 bg-neutral-50/50 focus:outline-none focus:bg-white focus:border-lf-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Link to Account</label>
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
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Note Content</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Type note details here..."
                  className="w-full text-xs border border-lf-border rounded-lg p-3 bg-neutral-50/50 focus:outline-none focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating || accounts.length === 0}
                  className="w-full flex items-center justify-center space-x-1 bg-lf-primary hover:bg-lf-primary-hover text-white py-2.5 rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Notes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 border border-dashed border-lf-border rounded-xl bg-white max-w-xl mx-auto p-8 shadow-xs">
            <FileText className="w-10 h-10 mx-auto mb-2 text-neutral-200" />
            <h3 className="text-xs font-semibold text-lf-primary">No notes created</h3>
            <p className="text-[10px] text-neutral-400 mt-1">Log sticky notes manually to keep records of fast thoughts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note: any) => (
              <div 
                key={note.id} 
                className="border border-lf-border rounded-xl bg-white p-5 shadow-2xs hover:shadow-xs hover:border-lf-primary/20 transition-all flex flex-col justify-between h-48"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex items-center space-x-1 bg-neutral-100 border border-lf-border rounded-md px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">
                      <Building className="w-2.5 h-2.5 text-neutral-400" />
                      <span>{note.account?.name || 'General'}</span>
                    </span>
                    <span className="text-[9px] text-neutral-400 flex items-center">
                      <Calendar className="w-2.5 h-2.5 mr-0.5 text-neutral-300" />
                      <span>{new Date(parseInt(note.createdAt) || Date.now()).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-lf-primary truncate mb-2">{note.title}</h3>
                  <p className="text-[11px] text-neutral-600 line-clamp-4 leading-relaxed font-sans">
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
