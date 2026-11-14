import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import api from "@/services/api";
import { ArrowLeft, Package, Calendar, Loader2, Sparkles } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get(`/products/${id}/history`)
      .then((res) => {
        if (active) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("Failed to load product history:", e);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24 text-[#8E8271]">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#F5C842] mb-3" />
        <p className="text-xs font-semibold">Loading commodity statutory history...</p>
      </div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="p-16 text-center text-[#8E8271] text-xs">
        Commodity record not found in database.
      </div>
    );
  }

  const { product: p, timeline = [], inspectionsCount = 0, latestStatus } = data;

  return (
    <div className="max-w-[1280px] mx-auto space-y-7 animate-fade-in">
      <PageHeader
        kicker={p.barcode ? `Barcode: ${p.barcode}` : `Entity ID: ${p.id}`}
        title={p.name}
        subtitle={`${p.brand || "Generic Brand"} · ${p.category || "FOOD"} · ${p.manufacturer || "Manufacturer / Packer"}`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="btn-dark flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4A017]" />
              <span>Back</span>
            </button>
            <StatusBadge status={latestStatus} />
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-6 space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#2A220A] border border-[#D4A017]/30 text-[#F5C842] flex items-center justify-center shadow-inner">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] text-[#8E8271] uppercase tracking-wider font-bold">Commodity Profile</div>
            <div className="font-display font-black text-white text-xl mt-0.5">{p.name}</div>
          </div>
          <div className="text-xs space-y-3 border-t border-[#252538] pt-4">
            <div className="flex justify-between">
              <span className="text-[#8E8271]">Brand Name:</span>
              <span className="font-bold text-white">{p.brand || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E8271]">Statutory Category:</span>
              <span className="font-bold text-[#F5C842]">{p.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E8271]">Packaging Version:</span>
              <span className="font-mono text-white font-bold">{p.labelVersion || "LV-01"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E8271]">Recorded Inspections:</span>
              <span className="font-black text-[#F5C842] font-mono text-sm">{inspectionsCount}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-6 shadow-xl">
          <div className="font-display font-black text-white text-lg mb-5 flex items-center gap-2">
            <span>Inspection History &amp; Packaging Modification Log</span>
            <Sparkles className="w-4 h-4 text-[#F5C842]" />
          </div>

          {timeline.length > 0 ? (
            <div className="space-y-4">
              {timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#252538] bg-[#161622] flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1E1E2E] border border-[#2A2A3D] flex items-center justify-center text-[#D4A017]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {item.inspectionNumber || `Inspection #${idx + 1}`}
                      </div>
                      <div className="text-[11px] text-[#9E927C] mt-0.5">
                        {item.date ? new Date(item.date).toLocaleString() : "Audit date recorded"} · Score: {item.score || 85}%
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={item.status || "COMPLIANT"} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-[#8E8271] text-xs">
              No historical inspection timeline recorded yet for this commodity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
