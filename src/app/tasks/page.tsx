'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { 
  CheckSquare, 
  Plus, 
  Loader2, 
  Circle, 
  CheckCircle2, 
  Calendar,
  Building,
  Filter,
  Clock
} from 'lucide-react';

const GET_TASKS_PAGE_DATA = gql`
  query GetTasksPageData {
    allTasks {
      id
      title
      completed
      dueDate
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

const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $accountId: ID!, $dueDate: String) {
    createTask(title: $title, accountId: $accountId, dueDate: $dueDate) {
      id
      title
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

export default function TasksPage() {
  const { data, loading, error, refetch } = useQuery<any>(GET_TASKS_PAGE_DATA);
  const [createTask, { loading: creating }] = useMutation(CREATE_TASK);
  const [toggleTask] = useMutation(TOGGLE_TASK);

  const [title, setTitle] = useState('');
  const [accountId, setAccountId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  const tasks = data?.allTasks || [];
  const accounts = data?.accounts || [];

  if (accounts.length > 0 && !accountId) {
    setAccountId(accounts[0].id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !accountId) return;

    try {
      await createTask({
        variables: { 
          title, 
          accountId, 
          dueDate: dueDate || null 
        }
      });
      setTitle('');
      setDueDate('');
      setShowAddForm(false);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleTask({
        variables: { id, completed: !currentStatus },
        optimisticResponse: {
          toggleTask: {
            __typename: 'Task',
            id,
            completed: !currentStatus
          }
        }
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter tasks locally
  const filteredTasks = tasks.filter((t: any) => {
    if (filter === 'PENDING') return !t.completed;
    if (filter === 'COMPLETED') return t.completed;
    return true;
  });

  const pendingCount = tasks.filter((t: any) => !t.completed).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-lf-border bg-white flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-lf-primary">Action Items</h1>
          <p className="text-xs text-neutral-400">Manage checklist tasks automatically extracted by AI or added manually</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-lf-primary hover:bg-lf-primary-hover text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Hide Form' : 'New Task'}</span>
        </button>
      </header>

      {/* Scrollable Panel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Manually Add Task Form */}
        {showAddForm && (
          <section className="bg-white border border-lf-border rounded-xl p-5 shadow-xs max-w-2xl">
            <h2 className="text-xs font-semibold text-lf-primary uppercase tracking-wider mb-4 flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-neutral-400" />
              <span>Create New Task</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule follow-up pricing proposal"
                  className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 bg-neutral-50/50 focus:outline-none focus:bg-white focus:border-lf-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Associated Company</label>
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

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs border border-lf-border rounded-lg px-3 py-2 bg-neutral-50/50 focus:outline-none focus:bg-white focus:border-lf-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating || accounts.length === 0}
                  className="w-full flex items-center justify-center space-x-1 bg-lf-primary hover:bg-lf-primary-hover text-white py-2.5 rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Task</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Task Control Filters & List */}
        <section className="bg-white border border-lf-border rounded-xl shadow-xs overflow-hidden">
          
          {/* Filters Bar */}
          <div className="p-4 border-b border-lf-border flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-xs font-semibold text-lf-primary uppercase tracking-wider flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-neutral-400" />
              <span>Global Tasks ({pendingCount} pending)</span>
            </h2>

            <div className="flex items-center space-x-1.5 border border-lf-border rounded-lg p-0.5 bg-neutral-50 shrink-0">
              <button
                onClick={() => setFilter('ALL')}
                className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${filter === 'ALL' ? 'bg-white text-lf-primary border border-lf-border shadow-2xs' : 'text-neutral-500 hover:text-lf-primary'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${filter === 'PENDING' ? 'bg-white text-lf-primary border border-lf-border shadow-2xs' : 'text-neutral-500 hover:text-lf-primary'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('COMPLETED')}
                className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${filter === 'COMPLETED' ? 'bg-white text-lf-primary border border-lf-border shadow-2xs' : 'text-neutral-500 hover:text-lf-primary'}`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 text-neutral-200" />
              <p className="text-xs font-semibold">No tasks match selected filter</p>
              <p className="text-[10px]">Add tasks manually or run template flows on the dashboard.</p>
            </div>
          ) : (
            <div className="divide-y divide-lf-border">
              {filteredTasks.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => handleToggle(task.id, task.completed)}
                  className="flex items-start space-x-4 p-4 hover:bg-neutral-50/50 cursor-pointer transition-colors group"
                >
                  <button className="shrink-0 mt-0.5 text-neutral-300 group-hover:text-lf-primary transition-colors">
                    {task.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-relaxed transition-colors ${task.completed ? 'text-neutral-400 line-through' : 'text-lf-primary group-hover:text-lf-primary-hover'}`}>
                      {task.title}
                    </p>
                    
                    <div className="flex items-center space-x-3 mt-1.5">
                      <span className="inline-flex items-center space-x-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 border border-lf-border rounded px-1.5 py-0.2">
                        <Building className="w-2.5 h-2.5 text-neutral-400 mr-0.5" />
                        <span>{task.account?.name || 'Unknown'}</span>
                      </span>

                      {task.dueDate && (
                        <span className={`text-[9px] font-semibold border rounded px-1.5 py-0.2 flex items-center space-x-1 ${
                          task.completed 
                            ? 'bg-neutral-100 text-neutral-400 border-neutral-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
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
    </div>
  );
}
