export default function PageHeader({ title, subtitle, actions, kicker }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        {kicker && <div className="text-[11px] uppercase tracking-widest text-blue-700 font-semibold mb-1.5">{kicker}</div>}
        <h1 className="font-display font-extrabold text-slate-900 text-2xl sm:text-3xl leading-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
