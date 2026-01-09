import React, { useState, useEffect } from 'react';
import { 
  UserPlus, ShieldCheck, Key, User, 
  CheckCircle2, Loader2, Info, Lock, 
  RotateCcw, Shield, Check, ToggleLeft, ToggleRight, XCircle
} from 'lucide-react';
import { UserAccount, AuthUser } from './types';
import { PERMISSIONS, FormInput } from './App';

const N8N_BASE_URL = 'https://primary-n8n.your-instance.com';
const SECRET_HEADER = 'X-APP-SECRET';
const SECRET_VALUE = process.env.API_KEY || 'enterprise-secret-key';

interface UserManagementPageProps {
  loggedInUser: AuthUser;
  sharedUsers: UserAccount[];
  setSharedUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ loggedInUser, sharedUsers, setSharedUsers }) => {
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    permissions: [] as string[]
  });

  const n8nCall = async (endpoint: string, body: any) => {
    try {
      const response = await fetch(`${N8N_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [SECRET_HEADER]: SECRET_VALUE
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error(`API Call failed:`, err);
      return null;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const data = await n8nCall('/webhook/users/list', { user_id: loggedInUser.id });
    if (data && data.users) {
      setSharedUsers(data.users);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return alert('Username and Password are required.');
    if (newUser.permissions.length === 0) return alert('Select at least one permission.');

    setCreateLoading(true);
    const data = await n8nCall('/webhook/users/create', { 
      username: newUser.username, 
      password: newUser.password, 
      permissions: newUser.permissions,
      created_by: loggedInUser.id
    });

    if (data && data.status === 'success') {
      alert('User created successfully via server sync!');
      setNewUser({ username: '', password: '', permissions: [] });
      fetchUsers();
    } else {
       // Fallback for local persistence
       const mockNewUser: UserAccount = {
         id: `u${Date.now()}`,
         username: newUser.username.trim().toLowerCase(),
         password: newUser.password,
         role: newUser.permissions.includes('admin_users') ? 'admin' : 'user',
         permissions: newUser.permissions,
         isActive: true
       };
       if (sharedUsers.some(u => u.username === mockNewUser.username)) {
         alert('Username already exists.');
       } else {
         setSharedUsers(prev => [...prev, mockNewUser]);
         setNewUser({ username: '', password: '', permissions: [] });
         alert('User account created (Local Persistence).');
       }
    }
    setCreateLoading(false);
  };

  const togglePermission = (permId: string) => {
    setNewUser(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId) 
        ? prev.permissions.filter(p => p !== permId) 
        : [...prev.permissions, permId]
    }));
  };

  const handleResetPassword = async (userAcc: UserAccount) => {
    const targetId = userAcc.id;
    if (!targetId) return alert('Error: User ID not found.');

    const newPass = prompt(`Enter NEW password for ${userAcc.username}:`);
    if (newPass === null) return; // User cancelled
    if (newPass.trim() === '') return alert('Password cannot be empty.');

    if (!confirm(`Confirm resetting password for ${userAcc.username}?`)) return;

    // Persist immediately to the shared state (same storage as Create User)
    setSharedUsers(prev => prev.map(u => u.id === targetId ? { ...u, password: newPass.trim() } : u));
    
    // Background sync attempt
    n8nCall('/webhook/users/reset-password', { 
      user_id: targetId, 
      new_password: newPass.trim(), 
      reset_by: loggedInUser.id 
    });

    alert(`SUCCESS: Password has been reset for ${userAcc.username}.`);
  };

  const handleToggleStatus = async (userAcc: UserAccount) => {
    const targetId = userAcc.id;
    if (!targetId) return alert('Error: User ID not found.');
    
    if (userAcc.username === loggedInUser.username) {
      alert("SECURITY: You cannot deactivate your own account.");
      return;
    }
    
    const currentlyActive = userAcc.isActive !== false; // Default true
    const targetActive = !currentlyActive;
    
    const msg = targetActive 
      ? `Are you sure you want to ACTIVATE ${userAcc.username}'s account?` 
      : `Are you sure you want to DEACTIVATE ${userAcc.username}'s account? This user will be blocked from logging in.`;
      
    if (!confirm(msg)) return;

    // Update shared state (local persistence)
    setSharedUsers(prev => prev.map(u => u.id === targetId ? { ...u, isActive: targetActive } : u));

    // Background sync attempt
    n8nCall('/webhook/users/toggle-status', { 
      user_id: targetId, 
      is_active: targetActive,
      updated_by: loggedInUser.id 
    });

    alert(`Account for ${userAcc.username} is now ${targetActive ? 'ACTIVE' : 'INACTIVE'}.`);
  };

  return (
    <div className="user-management-premium max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <style>{`
        .user-management-premium {
          --depth-shadow: 4px 4px 10px rgba(0,0,0,0.05), inset 1px 1px 3px rgba(255,255,255,0.8);
          --glass-bg: rgba(255, 255, 255, 0.7);
        }
        .premium-card {
          background: white;
          border-radius: 2rem;
          border: 1px solid #f1f5f9;
          box-shadow: var(--depth-shadow);
        }
        .permission-checkbox {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          transition: all 0.2s;
          cursor: pointer;
          user-select: none;
        }
        .permission-checkbox:hover {
          background: #f8faff;
          border-color: #e2e8f0;
        }
        .permission-checkbox.active {
          background: #f0f4ff;
          border-color: #6366f1;
        }
        .permission-checkbox .check-box {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .permission-checkbox.active .check-box {
          background: #6366f1;
          border-color: #6366f1;
          color: white;
        }
        .role-tag {
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .btn-premium {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 14px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .btn-premium:active {
          transform: translateY(1px);
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <header className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">User Access Management</h2>
        <p className="text-slate-500 font-medium">Control team access levels and security</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="premium-card p-8 sticky top-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <UserPlus size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Create New User</h3>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-4">
                <FormInput 
                  label="User ID / Username" 
                  placeholder="e.g. manager_rahim"
                  value={newUser.username}
                  onChange={(e: any) => setNewUser({...newUser, username: e.target.value})}
                />
                <FormInput 
                  label="Password" 
                  type="password" 
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e: any) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permissions</label>
                <div className="grid grid-cols-1 gap-2">
                  {PERMISSIONS.map(p => (
                    <div 
                      key={p.id} 
                      className={`permission-checkbox ${newUser.permissions.includes(p.id) ? 'active' : ''}`}
                      onClick={() => togglePermission(p.id)}
                    >
                      <div className="check-box">
                        {newUser.permissions.includes(p.id) && <Check size={14} strokeWidth={4} />}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={createLoading}
                className="w-full btn-premium bg-indigo-600 text-white hover:bg-indigo-700 justify-center mt-8"
              >
                {createLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                Create User Account
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="premium-card overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800">Existing Access</h3>
              </div>
              <button onClick={fetchUsers} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <RotateCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase sticky top-0 z-10">
                  <tr>
                    <th className="p-6">User Account</th>
                    <th className="p-6">Permissions</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {sharedUsers.map(u => {
                    const isActive = u.isActive !== false;
                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/50 transition-colors ${!isActive ? 'opacity-50' : ''}`}>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                              <User size={20} />
                            </div>
                            <div>
                              <div className="font-black text-slate-800 flex items-center gap-2">
                                {u.username}
                                {u.username === loggedInUser.username && (
                                  <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">You</span>
                                )}
                                {!isActive && (
                                  <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><XCircle size={10}/> Inactive</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                            {u.permissions.map(pId => {
                              const pName = PERMISSIONS.find(p => p.id === pId)?.label || pId;
                              return (
                                <span key={pId} className="role-tag bg-slate-100 text-slate-500">{pName}</span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex flex-col gap-2 items-end">
                            <button 
                              onClick={() => handleResetPassword(u)}
                              className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <Key size={14} /> Reset Password
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(u)}
                              className={`text-[10px] font-black uppercase flex items-center gap-1 transition-colors ${!isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-rose-400 hover:text-rose-500'}`}
                            >
                              {!isActive ? <><ToggleLeft size={16}/> Activate Account</> : <><ToggleRight size={16}/> Deactivate Account</>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {sharedUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="p-20 text-center text-slate-300 italic font-bold">
                        No team accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 text-slate-400 text-[10px] font-bold italic flex items-center gap-2">
              <Info size={14} /> Deactivated accounts cannot access the system. Passwords can be updated by administrators.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;