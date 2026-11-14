import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import api from "@/services/api";
import { Search, Package, ArrowRight, Loader2, Filter } from "lucide-react";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  useEffect(() => {
    let active = true;
    api.get("/products")
      .then((res) => {
        if (active) {
          setProducts(res.data || []);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("Failed to load products:", e);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const rows = products.filter((p) =>
    (cat === "All" || p.category === cat) &&
    (!q || (p.name && p.name.toLowerCase().includes(q.toLowerCase())) || (p.brand && p.brand.toLowerCase().includes(q.toLowerCase())))
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-7 animate-fade-in">
      <PageHeader
        kicker="Statutory Commodity Registry"
        title="Commodities Database"
        subtitle="Catalog of packaged products registered through officer inspections and automated OCR screenings."
      />

      <div className="bg-[#111118] border border-[#D4A017]/20 rounded-2xl p-4 flex flex-wrap gap-3.5 items-center shadow-xl">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 flex-1 min-w-[240px] input-dark">
          <Search className="w-4 h-4 text-[#8E8271]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search commodity or brand..."
            className="bg-transparent outline-none text-xs text-white placeholder:text-[#6E6454] flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#D4A017]" />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="input-dark px-3 py-2 text-xs font-bold text-white focus:outline-none"
          >
            {["All", "FOOD", "COSMETIC", "HOUSEHOLD", "ELECTRONICS", "TEXTILE", "OTHER"].map((c) => (
              <option key={c} value={c} className="bg-[#111118] text-white">{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#111118] border border-[#D4A017]/15 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-[#8E8271]">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2.5 text-[#F5C842]" />
            <span className="text-xs">Loading commodities registry...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-dark">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5">Commodity</th>
                  <th className="text-left px-5 py-3.5">Brand</th>
                  <th className="text-left px-5 py-3.5">Category</th>
                  <th className="text-left px-5 py-3.5">Barcode / EAN</th>
                  <th className="text-left px-5 py-3.5">Manufacturer</th>
                  <th className="text-right px-5 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252538]/60">
                {rows.map((p) => (
                  <tr key={p.id} className="transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2A220A] border border-[#D4A017]/30 flex items-center justify-center text-[#F5C842] shadow-inner shrink-0">
                        <Package className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-[#8E8271]">Version: {p.labelVersion || "LV-01"}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#F5E8C7]">{p.brand || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-[#7C3AED]/20 text-[#C084FC] border border-[#7C3AED]/35 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#F5C842]">{p.barcode || "—"}</td>
                    <td className="px-5 py-3.5 text-[#C8B89A] text-xs max-w-xs truncate">{p.manufacturer || "—"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5C842] hover:text-white px-3 py-1.5 rounded-lg bg-[#D4A017]/10 hover:bg-[#D4A017]/20 border border-[#D4A017]/25 transition cursor-pointer"
                      >
                        <span>History</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-[#8E8271] text-xs">
                      No commodities cataloged yet. Start an inspection scan to automatically index commodities.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
