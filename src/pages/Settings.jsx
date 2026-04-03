import React, { useState } from 'react';
import db from '../db';
import { useTransactions, useCategories, useSavingsGoals } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { vaultService } from '../services/VaultService';

export default function Settings() {
  const { user, signOut } = useAuth();
  const transactions = useTransactions();
  const categories = useCategories();
  const savingsGoals = useSavingsGoals();
  const [exportStatus, setExportStatus] = useState('');
  const [vaultConfigured, setVaultConfigured] = useState(vaultService.isConfigured());
  const [biometricSupported] = useState(vaultService.isBiometricSupported());

  const totalRecords = transactions.length + categories.length + savingsGoals.length;

  async function exportAllData() {
    setExportStatus('Exporting...');
    const data = {
      exportDate: new Date().toISOString(),
      app: 'Aeon Finance',
      version: '1.0.0',
      transactions: await db.transactions.toArray(),
      categories: await db.categories.toArray(),
      savingsGoals: await db.savingsGoals.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aeon_finance_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setExportStatus('Export Complete');
    setTimeout(() => setExportStatus(''), 3000);
  }

  async function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.transactions) await db.transactions.bulkPut(data.transactions);
          if (data.categories) await db.categories.bulkPut(data.categories);
          if (data.savingsGoals) await db.savingsGoals.bulkPut(data.savingsGoals);
          alert('Data Architectural Import Successful');
          window.location.reload();
        } catch (err) {
          alert('Invalid architectural file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  async function clearAllData() {
    if (window.confirm('WARNING: This will permanently deconstruct all architectural data. Continue?')) {
      await db.transactions.clear();
      // Keep categories? Usually yes, but user can reset them.
      if (confirm('Clear structural nodes (categories) as well?')) {
        await db.categories.clear();
      }
      await db.savingsGoals.clear();
      window.location.reload();
    }
  }

  const setupVault = async () => {
    const pin = prompt('Define a 4-6 digit Security PIN:');
    if (!pin || pin.length < 4) return alert('PIN must be at least 4 digits.');
    await vaultService.setPIN(pin);
    if (biometricSupported && confirm('Synchronize with Biometric Authentication?')) {
      try { await vaultService.registerBiometrics(); } catch (e) { alert(e.message); }
    }
    setVaultConfigured(true);
  };

  const removeVault = () => {
    if (confirm('Deconstruct Vault Security? This reduces structural integrity.')) {
      localStorage.removeItem(vaultService.PIN_STORAGE_KEY);
      localStorage.removeItem(vaultService.WEBAUTHN_ID_KEY);
      setVaultConfigured(false);
    }
  };

  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBgCTnSpMLqKQX7hVIqu-kvRpD8T_T7TJD2vGn8MAQiGyHuFAUMhCaEON1C0hdd4YtAbJLEL1aP3c_P6X6bg3WauPSSJ_u0D6O5S0BSCy0HwvCxE_DFVCwG9mTIyyMXDtKXOR6RFFQtHWU28RL7F3_1mVD4Ofr7kXY3KPjCgsaVXrblTjamADEQe5A9ZLRth-EuVjqop2FPQoNBr5WbchwCpdAD63KKmCRIoCQdh4kyG72Ik1ssViuwTVJDRFjioMbWAR0OKzzf2pc";

  return (
    <div className="max-w-3xl mx-auto pb-32 animate-in fade-in duration-700">
      <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight mb-8 px-2">Infrastructure</h1>

      {/* Profile Hero */}
      <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20 mb-8">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden shadow-xl shrink-0">
            <img 
              src={user?.photoURL || defaultAvatar} 
              alt="avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="text-center md:text-left flex-grow">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">
              <span className="material-symbols-outlined text-[14px]">architecture</span>
              Firebase Architect
            </div>
            <h2 className="text-2xl font-headline font-extrabold tracking-tight mb-1">
              {user?.displayName || user?.email?.split('@')[0] || 'Gallery Curator'}
            </h2>
            <p className="text-xs font-medium opacity-60">
              {user ? user.email : 'Local Archive Mode'}
            </p>
          </div>
          <button 
            onClick={signOut}
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-xs uppercase tracking-widest border border-white/5 active:scale-95"
          >
            Sign Out
          </button>
        </div>
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        
        {/* Data Architecture */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">database</span>
            </div>
            <h3 className="text-lg font-headline font-extrabold text-primary tracking-tight">Data Architecture</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl group hover:bg-surface-container-high transition-colors cursor-pointer" onClick={exportAllData}>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant">download</span>
                <div>
                  <p className="text-sm font-bold text-primary tracking-tight">Export Structural Export</p>
                  <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest opacity-60">JSON Format · {totalRecords} Records</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl group hover:bg-surface-container-high transition-colors cursor-pointer" onClick={importData}>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant">upload</span>
                <div>
                  <p className="text-sm font-bold text-primary tracking-tight">Import Architectural File</p>
                  <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest opacity-60">Restructures from JSON</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl group hover:bg-error-container/20 transition-colors cursor-pointer text-error" onClick={clearAllData}>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined">delete_forever</span>
                <div>
                  <p className="text-sm font-bold tracking-tight">Deconstruct Local Archive</p>
                  <p className="text-[10px] font-medium uppercase tracking-widest opacity-60">Permantent Data Removal</p>
                </div>
              </div>
              <span className="material-symbols-outlined opacity-40">chevron_right</span>
            </div>
          </div>
        </div>

        {/* Structural Integrity (Security) */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">shield</span>
              </div>
              <h3 className="text-lg font-headline font-extrabold text-primary tracking-tight">Structural Integrity</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${vaultConfigured ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-surface-container-high text-on-surface-variant'}`}>
              {vaultConfigured ? 'Secured' : 'Open'}
            </span>
          </div>

          <div 
            onClick={vaultConfigured ? removeVault : setupVault}
            className="p-6 rounded-[1.5rem] border border-outline-variant/20 hover:border-primary/20 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${vaultConfigured ? 'bg-secondary shadow-[0_0_20px_rgba(0,108,79,0.3)]' : 'bg-surface-container-high'}`}>
                  <span className={`material-symbols-outlined text-2xl ${vaultConfigured ? 'text-white' : 'text-on-surface-variant opacity-40'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {vaultConfigured ? 'lock' : 'lock_open'}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-headline font-extrabold text-primary tracking-tight">Vault Guard</h4>
                  <p className="text-xs font-medium text-on-surface-variant opacity-60">
                    {vaultConfigured ? 'PIN & Biometrics active' : 'Click to initialize security layers'}
                  </p>
                </div>
              </div>
              <div className="w-12 h-6 bg-surface-container-high rounded-full relative transition-colors group-hover:bg-surface-container-highest">
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${vaultConfigured ? 'left-7 bg-secondary' : 'left-1 bg-outline/40'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Support & Infrastructure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-low rounded-[2rem] p-6 border border-outline-variant/10 group hover:border-primary/10 transition-colors">
            <span className="material-symbols-outlined text-primary mb-3">support_agent</span>
            <h4 className="text-sm font-headline font-extrabold text-primary tracking-tight">Technical Support</h4>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest opacity-60">24/7 Architectural Consultation</p>
          </div>
          <div className="bg-surface-container-low rounded-[2rem] p-6 border border-outline-variant/10 group hover:border-primary/10 transition-colors">
            <span className="material-symbols-outlined text-primary mb-3">info</span>
            <h4 className="text-sm font-headline font-extrabold text-primary tracking-tight">Aeon Core v1.0</h4>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest opacity-60">Modern Engineering v2024.1</p>
          </div>
        </div>

      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.3em]">Built for Architectural Prosperity</p>
      </div>
    </div>
  );
}
