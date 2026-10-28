'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Building2,
  Search,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ALL_117_BENGALURU_PINCODES,
  getPincodeDepartmentMatrix,
  normalizePincode,
} from '@/lib/routing-engine';
import { CategoryIllustration } from '@/components/icons/category-illustrations';

export default function AdminPincodeDirectoryPage() {
  const [selectedPin, setSelectedPin] = useState('560038');
  const [pinSearchFilter, setPinSearchFilter] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const activeMatrix = getPincodeDepartmentMatrix(selectedPin);
  const activePinObj = normalizePincode(selectedPin);

  const copyCreds = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Filter 117 PIN codes based on search input
  const filteredPincodes = useMemo(() => {
    if (!pinSearchFilter.trim()) {
      return ALL_117_BENGALURU_PINCODES;
    }
    const q = pinSearchFilter.toLowerCase();
    return ALL_117_BENGALURU_PINCODES.filter(
      (p) =>
        p.pincode.includes(q) ||
        p.suffix.includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q)
    );
  }, [pinSearchFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Bengaluru Ward & PIN Code Matrix
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            117 PIN Codes × 6 = 702 Official Accounts Active
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Bengaluru All-117 Department Official Directory
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Every PIN code from 560001 to 560117 maps to its 6 dedicated department official accounts with auto-generated credentials.
        </p>
      </div>

      {/* Select PIN Code / Search Filter across all 117 PINs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Browse 117 PIN Codes ({filteredPincodes.length} shown):
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Click any PIN to inspect its 6 department logins
            </span>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={pinSearchFilter}
              onChange={(e) => setPinSearchFilter(e.target.value)}
              placeholder="Search PIN or Locality (e.g. 560100, HSR, Indiranagar)..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* 117 PIN Code Chips Grid (Scrollable) */}
        <div className="max-h-56 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
          <div className="flex flex-wrap gap-1.5 p-2">
            {filteredPincodes.map((loc) => {
              const isSelected = selectedPin === loc.pincode;
              return (
                <button
                  key={loc.pincode}
                  onClick={() => setSelectedPin(loc.pincode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1E1B4B] text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span className="font-mono">{loc.pincode}</span>
                  <span className="text-[10px] font-normal opacity-75 truncate max-w-[120px]">
                    {loc.name.split('/')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* The 6 Department Logins for Selected PIN */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                PIN {activePinObj.pincode} (Suffix: {activePinObj.suffix}) — 6 Department Logins
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Locality: {ALL_117_BENGALURU_PINCODES.find((p) => p.pincode === activePinObj.pincode)?.name || 'Bengaluru'}
              </span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            Unified PIN Password: <strong className="font-mono text-slate-900 font-bold ml-1">Dept{activePinObj.suffix}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {activeMatrix.map((dept) => (
            <div
              key={dept.email}
              className="bg-white rounded-2xl border border-slate-200 p-4.5 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <CategoryIllustration categoryId={dept.category} size={40} />
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                      {dept.departmentName}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      PIN {dept.pincode} Official
                    </span>
                  </div>
                </div>

                {/* Credentials Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Official Email
                    </span>
                    <button
                      onClick={() => copyCreds(dept.email)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedEmail === dept.email ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200 truncate">
                    {dept.email}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Password
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {dept.password}
                    </span>
                  </div>
                </div>
              </div>

              {/* Login shortcut */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active in System
                </span>
                <Link
                  href={`/portal?tab=official`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <span>Test Login</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
