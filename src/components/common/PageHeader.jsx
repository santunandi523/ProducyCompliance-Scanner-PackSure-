export default function PageHeader({ title, subtitle, actions, kicker }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7 animate-fade-in">
      <div>
        {kicker && (
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] font-bold px-2.5 py-0.5 rounded-full bg-[#D4A017]/10 text-[#F5C842] border border-[#D4A017]/25 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />
            {kicker}
          </div>
        )}
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1.5 max-w-2xl leading-relaxed text-[#C8B89A]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
