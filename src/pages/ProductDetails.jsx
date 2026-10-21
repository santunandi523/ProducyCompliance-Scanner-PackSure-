import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import api from "@/services/api";
import { ArrowLeft, Package, Calendar, Loader2 } from "lucide-react";

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
      <div className="max-w-3xl mx-auto text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-slate-500 text-sm">Loading commodity history...</p>
      </div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="p-10 text-center text-slate-500">
        Product record not found.
      </div>
    );
  }

  const { product: p, timeline = [], inspectionsCount = 0, latestStatus } = data;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <PageHeader
        kicker={p.barcode ? `Barcode: ${p.barcode}` : `ID: ${p.id}`}
        title={p.name}
        subtitle={`${p.brand || "Generic"} · ${p.category || "FOOD"} · ${p.manufacturer || "Manufacturer"}`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <StatusBadge status={latestStatus} />
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Commodity</div>
            <div className="font-bold text-slate-900 text-lg">{p.name}</div>
          </div>
          <div className="text-sm space-y-2 border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Brand:</span>
              <span className="font-semibold text-slate-800">{p.brand || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{p.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Label Version:</span>
              <span className="font-mono text-slate-800 font-bold">{p.labelVersion || "LV-01"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Inspections:</span>
              <span className="font-bold text-blue-700">{inspectionsCount}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="font-display font-bold text-slate-900 mb-4">Inspection History & Change Log</div>
          <div className="space-y-3">
            {timeline.length === 0 ? (
              <div className="text-sm text-slate-400 py-8 text-center">No inspections recorded for this product yet.</div>
            ) : (
              timeline.map((h) => (
                <div
                  key={h.inspectionId}
                  onClick={() => navigate(`/inspections/${h.inspectionId}`)}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-xs font-mono font-bold text-blue-600">{h.inspectionNumber}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {h.date ? new Date(h.date).toLocaleString() : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-900">{h.score} / 100</span>
                    <StatusBadge status={h.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
