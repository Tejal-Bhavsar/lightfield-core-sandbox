'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { 
  Users, 
  Plus, 
  Loader2, 
  Mail, 
  Building,
  Briefcase,
  UserPlus
} from 'lucide-react';

const GET_CONTACTS_PAGE_DATA = gql`
  query GetContactsPageData {
    allContacts {
      id
      name
      email
      role
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

const CREATE_CONTACT = gql`
  mutation CreateContact($name: String!, $email: String!, $role: String, $accountId: ID!) {
    createContact(name: $name, email: $email, role: $role, accountId: $accountId) {
      id
      name
    }
  }
`;

export default function ContactsPage() {
  const { data, loading, error, refetch } = useQuery<any>(GET_CONTACTS_PAGE_DATA);
  const [createContact, { loading: creating }] = useMutation(CREATE_CONTACT);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Key Contact');
  const [accountId, setAccountId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const contacts = data?.allContacts || [];
  const accounts = data?.accounts || [];

  // Set default account id on load
  if (accounts.length > 0 && !accountId) {
    setAccountId(accounts[0].id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !accountId) return;

    try {
      await createContact({
        variables: { name, email, role, accountId }
      });
      setName('');
      setEmail('');
      setRole('Key Contact');
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
          <h1 className="text-base font-semibold text-lf-primary">Contacts</h1>
          <p className="text-xs text-neutral-400">View and manage customer team contacts</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-lf-primary hover:bg-lf-primary-hover text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Hide Form' : 'Add Contact'}</span>
        </button>
      </header>

      {/* Main layout */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Toggleable Add Contact Form */}
        {showAddForm && (
          <section className="bg-white border border-lf-border rounded-xl p-5 shadow-xs max-w-2xl">
            <h2 className="text-xs font-semibold text-lf-primary uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create New Contact</span>
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karri Saarinen"
                  className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 bg-neutral-50/50 focus:outline-none focus:bg-white focus:border-lf-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. karri@linear.app"
                  className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 bg-neutral-50/50 focus:outline-none focus:bg-white focus:border-lf-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Role / Job Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. CEO or Founder"
                  className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 bg-neutral-50/50 focus:outline-none focus:bg-white focus:border-lf-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Associated Account</label>
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

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={creating || accounts.length === 0}
                  className="w-full flex items-center justify-center space-x-1 bg-lf-primary hover:bg-lf-primary-hover text-white py-2.5 rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Contact</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Contacts list table */}
        <section className="bg-white border border-lf-border rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-lf-border flex items-center justify-between">
            <h2 className="text-xs font-semibold text-lf-primary uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-neutral-400" />
              <span>Contact Directory ({contacts.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-neutral-200" />
              <p className="text-xs font-semibold">No contacts registered</p>
              <p className="text-[10px]">Add contacts manually or ingest conversation logs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-lf-border text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lf-border">
                  {contacts.map((contact: any) => (
                    <tr key={contact.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4 font-bold text-lf-primary">{contact.name}</td>
                      <td className="p-4 text-neutral-500 font-mono flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-300" />
                        <span>{contact.email}</span>
                      </td>
                      <td className="p-4 font-semibold text-neutral-600">
                        <span className="inline-flex items-center space-x-1 bg-neutral-100 border border-lf-border rounded-md px-1.5 py-0.5 text-[11px]">
                          <Building className="w-3 h-3 text-neutral-400" />
                          <span>{contact.account.name}</span>
                        </span>
                      </td>
                      <td className="p-4 text-neutral-500">
                        <span className="inline-flex items-center space-x-1 text-neutral-500">
                          <Briefcase className="w-3 h-3 text-neutral-300 mr-1" />
                          <span>{contact.role || 'Contact'}</span>
                        </span>
                      </td>
                      <td className="p-4 text-neutral-400">{new Date(parseInt(contact.createdAt) || Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
