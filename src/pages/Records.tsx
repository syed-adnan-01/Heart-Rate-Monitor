import React from 'react';
import { Bookmark, FileText, Download, Share2, Search, Filter, Calendar, Clock, User, ChevronRight } from 'lucide-react';

const PATIENT_RECORDS = [
  { id: 1, title: 'Admission Summary', date: '2026-03-28', type: 'Report', doctor: 'Dr. Fred', size: '1.2 MB' },
  { id: 2, title: 'Daily Clinical Note - Apr 03', date: '2026-04-03', type: 'Note', doctor: 'Nurse Sarah', size: '450 KB' },
  { id: 3, title: 'Respiratory Trend Analysis', date: '2026-04-02', type: 'Data', doctor: 'NeoVision AI', size: '2.8 MB' },
  { id: 4, title: 'Blood Gas Results', date: '2026-04-01', type: 'Lab', doctor: 'Lab Services', size: '850 KB' },
  { id: 5, title: 'Neurological Assessment', date: '2026-03-30', type: 'Report', doctor: 'Dr. Chen', size: '1.5 MB' },
  { id: 6, title: 'Feeding Protocol - Initial', date: '2026-03-29', type: 'Protocol', doctor: 'Dr. Fred', size: '320 KB' },
];

export const RecordsPage = ({ selectedDate }: { selectedDate: string }) => {
  const filteredRecords = PATIENT_RECORDS.filter(record => record.date === selectedDate);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Patient Records</h2>
          <p className="text-slate-500 text-sm">Access and manage historical clinical data, reports, and assessment notes.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="pl-10 pr-4 py-2 bg-slate-800/50 border border-white/5 rounded-full text-xs focus:outline-none focus:border-cyan-500/50 transition-colors w-64"
            />
          </div>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Categories */}
        <div className="space-y-6">
          <div className="card-glass rounded-5xl p-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-cyan-400" />
              Categories
            </h3>
            <div className="space-y-2">
              <CategoryItem label="All Records" count={24} active />
              <CategoryItem label="Clinical Reports" count={8} />
              <CategoryItem label="Lab Results" count={12} />
              <CategoryItem label="Imaging" count={4} />
              <CategoryItem label="Nursing Notes" count={15} />
              <CategoryItem label="AI Analysis" count={32} />
            </div>
          </div>

          <div className="card-glass rounded-5xl p-8">
            <h3 className="font-bold text-lg mb-4">Storage Usage</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                <p className="text-xs font-bold text-white">Cloud Storage</p>
                <p className="text-[10px] text-slate-500 font-mono">1.2 GB / 5 GB</p>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 w-[24%]" />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Your clinical data is securely encrypted and backed up daily.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Records List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card-glass rounded-5xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent Documents</h3>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {filteredRecords.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                  <Calendar className="w-8 h-8 mb-3 opacity-50" />
                  <p className="font-bold">No records found</p>
                  <p className="text-xs mt-1">There are no patient records for {selectedDate}.</p>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <div key={record.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{record.title}</h4>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {record.date}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {record.doctor}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {record.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[8px] font-black px-2 py-1 bg-slate-800 text-slate-400 rounded uppercase tracking-widest">
                      {record.type}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
                ))
              )}
            </div>
            <div className="p-6 bg-slate-800/20 text-center">
              <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                Load More Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryItem = ({ label, count, active }: any) => (
  <button className={cn(
    "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300",
    active ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
  )}>
    <span className="text-xs font-bold">{label}</span>
    <span className="text-[10px] font-mono opacity-60">{count}</span>
  </button>
);

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
