import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import api from "@/services/api";
import { Search, Package, ArrowRight, Loader2 } from "lucide-react";

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
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        kicker="Catalog"
        title="Commodities Database"
        subtitle="Catalog of packaged products registered through officer scans and enforcement screenings."
      />

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search commodity or brand…"
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          {["All", "FOOD", "COSMETIC", "HOUSEHOLD", "ELECTRONICS", "TEXTILE", "OTHER"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading catalog...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Commodity</th>
                <th className="text-left px-5 py-3 font-semibold">Brand</th>
                <th className="text-left px-5 py-3 font-semibold">Category</th>
                <th className="text-left px-5 py-3 font-semibold">Barcode / EAN</th>
                <th className="text-left px-5 py-3 font-semibold">Manufacturer</th>
                <th className="text-right px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <Package className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500">Version: {p.labelVersion || "LV-01"}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{p.brand || "—"}</td>
                  <td className="px-5 py-3 text-slate-700">
                    <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{p.barcode || "—"}</td>
                  <td className="px-5 py-3 text-slate-600 text-xs max-w-xs truncate">{p.manufacturer || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                      History <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No products cataloged yet. Start a scan to add products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
