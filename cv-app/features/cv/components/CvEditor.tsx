"use client";

import { useCvStore } from "../store/useCvStore";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";

export function CvEditor() {
  const { cvData, updatePersonalInfo, addExperience, updateExperience, removeExperience } = useCvStore();
  const { personalInfo, experiences } = cvData;

  const handleAddExperience = () => {
    addExperience({
      id: crypto.randomUUID(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    });
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8 bg-surface-white">
      {/* Personal Info */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Họ và tên</label>
            <Input 
              value={personalInfo.fullName} 
              onChange={(e) => updatePersonalInfo({ fullName: e.target.value })} 
              placeholder="Nguyễn Văn A" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Vị trí ứng tuyển (Title)</label>
            <Input 
              value={personalInfo.title} 
              onChange={(e) => updatePersonalInfo({ title: e.target.value })} 
              placeholder="Senior Frontend Developer" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email</label>
            <Input 
              value={personalInfo.email} 
              onChange={(e) => updatePersonalInfo({ email: e.target.value })} 
              placeholder="email@example.com" 
              type="email"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Số điện thoại</label>
            <Input 
              value={personalInfo.phone || ""} 
              onChange={(e) => updatePersonalInfo({ phone: e.target.value })} 
              placeholder="0901234567" 
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Địa chỉ</label>
            <Input 
              value={personalInfo.location || ""} 
              onChange={(e) => updatePersonalInfo({ location: e.target.value })} 
              placeholder="TP. Hồ Chí Minh" 
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Tóm tắt (Summary)</label>
            <Textarea 
              value={personalInfo.summary || ""} 
              onChange={(e) => updatePersonalInfo({ summary: e.target.value })} 
              placeholder="Một đoạn ngắn giới thiệu bản thân..." 
            />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Kinh nghiệm làm việc</h3>
          <Button variant="outline" size="sm" onClick={handleAddExperience}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm
          </Button>
        </div>

        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="p-4 rounded-xl border border-border-light bg-surface-low space-y-4 relative group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-error hover:bg-error-container/50"
                onClick={() => removeExperience(exp.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pr-8">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Công ty</label>
                  <Input 
                    value={exp.company} 
                    onChange={(e) => updateExperience(exp.id, { company: e.target.value })} 
                    placeholder="Tech Corp" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Vị trí</label>
                  <Input 
                    value={exp.role} 
                    onChange={(e) => updateExperience(exp.id, { role: e.target.value })} 
                    placeholder="Software Engineer" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Thời gian bắt đầu</label>
                  <Input 
                    value={exp.startDate || ""} 
                    onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} 
                    placeholder="01/2022" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Thời gian kết thúc</label>
                  <Input 
                    value={exp.endDate || ""} 
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })} 
                    placeholder="Hiện tại" 
                    disabled={exp.isCurrent}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Mô tả công việc</label>
                  <Textarea 
                    value={exp.description || ""} 
                    onChange={(e) => updateExperience(exp.id, { description: e.target.value })} 
                    placeholder="- Phát triển tính năng X..." 
                  />
                </div>
              </div>
            </div>
          ))}
          {experiences.length === 0 && (
            <div className="text-center py-8 text-sm text-text-muted border-2 border-dashed border-border-light rounded-xl">
              Chưa có kinh nghiệm làm việc nào.
            </div>
          )}
        </div>
      </section>

      {/* Other sections (Education, Skills) would follow similar patterns */}
    </div>
  );
}
