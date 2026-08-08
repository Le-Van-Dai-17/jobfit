import { Award, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

type CandidateProfile = {
  user: { name: string | null; email: string | null };
  headline?: string | null;
  summary?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  skills?: Array<{ id: string; name: string; category: string | null; level: number | null }>;
  certificates?: Array<{ id: string; name: string; issuer: string }>;
};

export function CandidateProfileView({ profile }: { profile: CandidateProfile }) {
  const skills = profile.skills ?? [];
  const certificates = profile.certificates ?? [];
  const hasDetails = Boolean(profile.headline || profile.summary || profile.phone || profile.location);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900">
          {profile.user.name ?? "Ứng viên"}
        </h1>
        {profile.headline ? <p className="mt-1 text-sm font-semibold text-indigo-600">{profile.headline}</p> : null}
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
          {profile.user.email ? <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{profile.user.email}</span> : null}
          {profile.phone ? <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{profile.phone}</span> : null}
          {profile.location ? <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span> : null}
        </div>
        {profile.summary ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{profile.summary}</p> : null}
        {!hasDetails ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có thông tin hồ sơ.</p> : null}
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Award className="h-4 w-4 text-indigo-600" />Kỹ năng</h2>
          {skills.length === 0 ? <p className="mt-4 text-sm text-slate-500">Chưa có kỹ năng nào.</p> : (
            <ul className="mt-4 space-y-2">
              {skills.map((skill) => <li key={skill.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-800"><span className="font-semibold">{skill.name}</span>{skill.category ? <span> · {skill.category}</span> : null}{skill.level ? <span> · {skill.level}/5</span> : null}</li>)}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><ShieldCheck className="h-4 w-4 text-emerald-600" />Chứng chỉ</h2>
          {certificates.length === 0 ? <p className="mt-4 text-sm text-slate-500">Chưa có chứng chỉ nào.</p> : (
            <ul className="mt-4 space-y-2">
              {certificates.map((certificate) => <li key={certificate.id} className="rounded-xl bg-slate-50 p-3"><p className="text-sm font-bold text-slate-900">{certificate.name}</p><p className="text-xs text-slate-500">{certificate.issuer}</p></li>)}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
