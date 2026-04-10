import React, { useState } from 'react';
import { Bookmark, FileText, Download, Share2, Search, Filter, Calendar, Clock, User, ChevronRight, ChevronDown } from 'lucide-react';
import { type PatientRecord } from '../App';

export const RecordsPage = ({ records, globalDate }: { records: PatientRecord[], globalDate?: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Records');
  const [expandedRecordId, setExpandedRecordId] = useState<string | number | null>(null);

  const handleDownload = (record: PatientRecord) => {
    const textBlob = new Blob([record.content], { type: 'text/plain' });
    const url = URL.createObjectURL(textBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async (record: PatientRecord) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: record.title,
          text: record.content,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(record.content);
      alert('Content copied to clipboard!');
    }
  };

  const sortedAndFilteredRecords = [...records].sort((a, b) => {
    if (globalDate) {
      if (a.date === globalDate && b.date !== globalDate) return -1;
      if (b.date === globalDate && a.date !== globalDate) return 1;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }).filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.type.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory === 'Clinical Reports') matchesCategory = record.type === 'Report';
    else if (selectedCategory === 'Lab Results') matchesCategory = record.type === 'Lab';
    else if (selectedCategory === 'Imaging') matchesCategory = record.type === 'Imaging';
    else if (selectedCategory === 'Nursing Notes') matchesCategory = record.type === 'Note';
    else if (selectedCategory === 'AI Analysis') matchesCategory = record.type === 'Data';

    return matchesSearch && matchesCategory;
  });

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <CategoryItem label="All Records" count={records.length} active={selectedCategory === 'All Records'} onClick={() => setSelectedCategory('All Records')} />
              <CategoryItem label="Clinical Reports" count={records.filter(r => r.type === 'Report').length} active={selectedCategory === 'Clinical Reports'} onClick={() => setSelectedCategory('Clinical Reports')} />
              <CategoryItem label="Lab Results" count={records.filter(r => r.type === 'Lab').length} active={selectedCategory === 'Lab Results'} onClick={() => setSelectedCategory('Lab Results')} />
              <CategoryItem label="Imaging" count={records.filter(r => r.type === 'Imaging').length} active={selectedCategory === 'Imaging'} onClick={() => setSelectedCategory('Imaging')} />
              <CategoryItem label="Nursing Notes" count={records.filter(r => r.type === 'Note').length} active={selectedCategory === 'Nursing Notes'} onClick={() => setSelectedCategory('Nursing Notes')} />
              <CategoryItem label="AI Analysis" count={records.filter(r => r.type === 'Data').length} active={selectedCategory === 'AI Analysis'} onClick={() => setSelectedCategory('AI Analysis')} />
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
              {sortedAndFilteredRecords.map((record) => (
                <div key={record.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                  <div 
                    className="p-6 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedRecordId(expandedRecordId === record.id ? null : record.id)}
                  >
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
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownload(record); }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleShare(record); }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      {expandedRecordId === record.id ? (
                        <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                      )}
                    </div>
                  </div>
                  
                  {expandedRecordId === record.id && (
                    <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                      <div className="p-6 bg-slate-800/30 rounded-3xl border border-white/5">
                        <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                          {record.content}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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

const CategoryItem = ({ label, count, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300",
      active ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
    )}
  >
    <span className="text-xs font-bold">{label}</span>
    <span className="text-[10px] font-mono opacity-60">{count}</span>
  </button>
);

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
