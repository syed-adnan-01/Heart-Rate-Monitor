import React, { useState } from 'react';
import { Bookmark, FileText, Download, Share2, Search, Filter, Calendar, Clock, User, ChevronRight, ChevronDown } from 'lucide-react';
import { type PatientRecord } from '../App';

export const RecordsPage = ({ selectedDate, records, onRecordRead }: { selectedDate: string, records: PatientRecord[], onRecordRead: (id: string | number) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Records');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState<string | number | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (record: any) => {
    const textBlob = new Blob([record.content], { type: 'text/plain' });
    const url = URL.createObjectURL(textBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async (record: any) => {
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

  const filteredRecords = records.filter(record => {
    const matchesDate = record.date === selectedDate;
    
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.type.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory === 'Clinical Reports') matchesCategory = record.type === 'Report';
    else if (selectedCategory === 'Lab Results') matchesCategory = record.type === 'Lab';
    else if (selectedCategory === 'Imaging') matchesCategory = record.type === 'Imaging';
    else if (selectedCategory === 'Nursing Notes') matchesCategory = record.type === 'Note';
    else if (selectedCategory === 'AI Analysis') matchesCategory = record.type === 'Data';

    let matchesStatus = true;
    if (statusFilter === 'New') matchesStatus = record.status === 'New';
    else if (statusFilter === 'Unread') matchesStatus = record.status === 'Unread';
    else if (statusFilter === 'Read') matchesStatus = record.status === 'Read';

    return matchesDate && matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-text-primary tracking-tight mb-2">Patient Records</h2>
          <p className="text-text-secondary text-base">Access and manage historical clinical data, reports, and assessment notes.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-theme-border/50 border border-theme-border rounded-full text-sm focus:outline-none focus:border-cyan-500/50 transition-colors w-64"
            />
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={cn(
                "p-2 rounded-full transition-all duration-300",
                statusFilter !== 'All Status' ? "bg-cyan-500 text-black" : "bg-theme-card-hover text-text-secondary hover:bg-slate-700"
              )}
            >
              <Filter className="w-4 h-4" />
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-3 w-48 bg-theme-card border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 space-y-1">
                  {['All Status', 'New', 'Unread', 'Read'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterDropdown(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-2xl text-[12px] font-bold uppercase tracking-widest transition-colors",
                        statusFilter === status ? "bg-accent-cyan/10 text-accent-cyan" : "text-text-secondary hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {status === 'All Status' ? 'All Records' : `${status} Reports`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Categories */}
        <div className="space-y-6">
          <div className="card-glass rounded-5xl p-8">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-accent-cyan" />
              Categories
            </h3>
            <div className="space-y-2">
              <CategoryItem label="All Records" count={records.filter(r => r.date === selectedDate).length} active={selectedCategory === 'All Records'} onClick={() => setSelectedCategory('All Records')} />
              <CategoryItem label="Clinical Reports" count={records.filter(r => r.date === selectedDate && r.type === 'Report').length} active={selectedCategory === 'Clinical Reports'} onClick={() => setSelectedCategory('Clinical Reports')} />
              <CategoryItem label="Lab Results" count={records.filter(r => r.date === selectedDate && r.type === 'Lab').length} active={selectedCategory === 'Lab Results'} onClick={() => setSelectedCategory('Lab Results')} />
              <CategoryItem label="Imaging" count={records.filter(r => r.date === selectedDate && r.type === 'Imaging').length} active={selectedCategory === 'Imaging'} onClick={() => setSelectedCategory('Imaging')} />
              <CategoryItem label="Nursing Notes" count={records.filter(r => r.date === selectedDate && r.type === 'Note').length} active={selectedCategory === 'Nursing Notes'} onClick={() => setSelectedCategory('Nursing Notes')} />
              <CategoryItem label="AI Analysis" count={records.filter(r => r.date === selectedDate && r.type === 'Data').length} active={selectedCategory === 'AI Analysis'} onClick={() => setSelectedCategory('AI Analysis')} />
            </div>
          </div>

          <div className="card-glass rounded-5xl p-8">
            <h3 className="font-bold text-xl mb-4">Storage Usage</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-bold text-text-primary">Cloud Storage</p>
                <p className="text-[12px] text-text-secondary font-mono">1.2 GB / 5 GB</p>
              </div>
              <div className="h-1.5 w-full bg-theme-card-hover rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 w-[24%]" />
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Your clinical data is securely encrypted and backed up daily.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Records List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card-glass rounded-5xl overflow-hidden">
            <div className="p-8 border-b border-theme-border flex justify-between items-center">
              <h3 className="font-bold text-xl">Recent Documents</h3>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-sm font-bold text-accent-cyan">
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {filteredRecords.length === 0 ? (
                <div className="p-12 text-center text-text-secondary flex flex-col items-center justify-center">
                  <Calendar className="w-8 h-8 mb-3 opacity-50" />
                  <p className="font-bold">No records found</p>
                  <p className="text-sm mt-1">There are no patient records for {selectedDate}.</p>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <div key={record.id} className="border-b border-theme-border last:border-0 hover:bg-white/5 transition-colors group">
                    <div 
                      className="p-6 flex items-center justify-between cursor-pointer"
                      onClick={() => {
                        const newId = expandedRecordId === record.id ? null : record.id;
                        setExpandedRecordId(newId);
                        if (newId !== null && record.status !== 'Read') {
                          onRecordRead(record.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-theme-border/50 rounded-2xl flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-text-primary flex items-center gap-3">
                            {record.title}
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black",
                              record.status === 'New' ? "bg-accent-yellow text-black" :
                              record.status === 'Unread' ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30" :
                              "bg-theme-card-hover text-text-secondary"
                            )}>
                              {record.status}
                            </span>
                          </h4>
                          <div className="flex items-center gap-4 text-[12px] text-text-secondary">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {record.date}</span>
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {record.doctor}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {record.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black px-2 py-1 bg-theme-card-hover text-text-secondary rounded uppercase tracking-widest">
                          {record.type}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownload(record); }}
                            className="p-2 bg-theme-card-hover hover:bg-slate-700 rounded-lg text-text-secondary transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleShare(record); }}
                            className="p-2 bg-theme-card-hover hover:bg-slate-700 rounded-lg text-text-secondary transition-colors"
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
                        <div className="p-6 bg-slate-800/30 rounded-3xl border border-theme-border">
                          <pre className="text-sm text-text-primary font-sans whitespace-pre-wrap leading-relaxed">
                            {record.content}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="p-6 bg-slate-800/20 text-center">
              <button className="text-sm font-bold text-text-secondary hover:text-white transition-colors uppercase tracking-widest">
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
      active ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20" : "text-text-secondary hover:bg-white/5 hover:text-slate-300"
    )}
  >
    <span className="text-sm font-bold">{label}</span>
    <span className="text-[12px] font-mono opacity-60">{count}</span>
  </button>
);

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
