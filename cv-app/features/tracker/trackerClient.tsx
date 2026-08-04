"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Briefcase, ChevronRight, CheckCircle2, Clock, XCircle, Building2, LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";

type ApplicationStatus = "DRAFT" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED" | "WITHDRAWN";

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    company: string;
  };
  status: ApplicationStatus;
  appliedAt: string | null;
}

const STATUS_COLUMNS: { id: ApplicationStatus; label: string; icon: LucideIcon; color: string }[] = [
  { id: "APPLIED", label: "Đã nộp", icon: Clock, color: "text-blue-500" },
  { id: "INTERVIEWING", label: "Phỏng vấn", icon: Briefcase, color: "text-warning-heavy" },
  { id: "OFFER", label: "Nhận Offer", icon: CheckCircle2, color: "text-success-heavy" },
  { id: "REJECTED", label: "Bị từ chối", icon: XCircle, color: "text-error" },
];

export default function TrackerClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (res.ok) {
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to load applications", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchApplications();
  }, [fetchApplications]);

  const handleAddApplication = async () => {
    if (!newTitle.trim() || !newCompany.trim()) return;

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          company: newCompany,
          status: "APPLIED"
        }),
      });
      if (res.ok) {
        const app = await res.json();
        setApplications((prev) => [app, ...prev]);
        setIsAdding(false);
        setNewTitle("");
        setNewCompany("");
      }
    } catch (error) {
      console.error("Failed to add application", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    // Optimistic UI update
    setApplications((prev) => 
      prev.map((app) => app.id === id ? { ...app, status: newStatus } : app)
    );

    try {
      await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status", error);
      fetchApplications(); // Revert on failure
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            Theo dõi ứng tuyển (Tracker)
          </h1>
          <p className="mt-2 text-text-muted">
            Quản lý và theo dõi trạng thái các công việc bạn đã nộp CV.
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="h-5 w-5" />
          Thêm thủ công
        </Button>
      </div>

      {isAdding && (
        <div className="bg-surface-white p-6 rounded-2xl shadow-sm border border-border-light animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold text-foreground mb-4">Thêm công việc mới</h3>
          <div className="flex gap-4 items-center">
            <Input 
              placeholder="Tên vị trí (VD: Frontend Developer)" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
            />
            <Input 
              placeholder="Tên công ty" 
              value={newCompany} 
              onChange={(e) => setNewCompany(e.target.value)} 
            />
            <Button onClick={handleAddApplication}>Lưu lại</Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Hủy</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20 text-text-muted">Đang tải danh sách...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUS_COLUMNS.map((col) => {
            const columnApps = applications.filter(app => app.status === col.id);
            const Icon = col.icon;
            
            return (
              <div key={col.id} className="bg-surface-low rounded-2xl border border-border-light p-4 flex flex-col min-h-[500px]">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-base">
                  <Icon className={`h-5 w-5 ${col.color}`} />
                  <h3 className="font-bold text-foreground">{col.label}</h3>
                  <span className="ml-auto bg-surface-white text-xs font-bold px-2 py-1 rounded-full border border-border-light">
                    {columnApps.length}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 flex-1">
                  {columnApps.map((app) => (
                    <div key={app.id} className="bg-surface-white p-4 rounded-xl shadow-sm border border-border-light hover:border-primary/30 transition-colors group">
                      <h4 className="font-bold text-foreground text-sm line-clamp-2">{app.job.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{app.job.company}</span>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-border-base flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <select 
                          className="text-xs bg-surface-low border border-border-light rounded px-2 py-1 outline-none focus:border-primary"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        >
                          <option value="APPLIED">Đã nộp</option>
                          <option value="INTERVIEWING">Phỏng vấn</option>
                          <option value="OFFER">Nhận Offer</option>
                          <option value="REJECTED">Bị từ chối</option>
                        </select>
                        <ChevronRight className="h-4 w-4 text-text-muted" />
                      </div>
                    </div>
                  ))}
                  
                  {columnApps.length === 0 && (
                    <div className="text-center p-6 text-sm text-text-muted border border-dashed border-border-light rounded-xl mt-2">
                      Chưa có công việc nào
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
