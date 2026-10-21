import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  UploadCloud, Camera, CheckCircle2, AlertTriangle, Loader2,
  FileCheck2, Download, ZoomIn, ZoomOut, Check, X,
  ShieldCheck, RefreshCw, Smartphone, Plus, Eye, Layers, Trash2, ArrowRight
} from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ConfidenceBar from "@/components/common/ConfidenceBar";
import ComplianceAssessmentCard from "@/components/common/ComplianceAssessmentCard";
import ProductCategoryBanner from "@/components/common/ProductCategoryBanner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { inspectionService } from "@/services/inspectionService";
import { violationService } from "@/services/violationService";
import { useAuth } from "@/context/AuthContext";

const PIPELINE_STAGES = [
  { name: "Multi-Image Quality Assessment", desc: "Evaluating resolution, contrast, blur & glare across all captured package photos" },
  { name: "Preprocessing & Enhancement", desc: "Applying CLAHE contrast normalization & noise reduction" },
  { name: "PaddleOCR PP-OCRv4", desc: "Executing deep text detection & bounding box localization on every image" },
  { name: "Barcode & QR Scanning", desc: "Scanning EAN-13, UPC and QR codes" },
  { name: "Legal Metrology Field Extraction", desc: "Extracting MRP, Net Qty, Manufacturer, Customer Care & Date declarations" },
  { name: "Multi-Image Information Fusion", desc: "Combining declarations across panels & resolving conflicting values" },
  { name: "Statutory Rule Evaluation", desc: "Evaluating Legal Metrology (Packaged Commodities) Rules, 2011" },
];

export default function ScanProduct() {
  return (
    <ErrorBoundary title="Scan Product Error">
      <ScanProductContent />
    </ErrorBoundary>
  );
}

function ScanProductContent() {
  const { user } = useAuth();

  // Mode & Camera Session State
  const [fieldMode, setFieldMode] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Local Captured Images Collection: Array of { id, file, previewUrl }
  const [capturedImages, setCapturedImages] = useState([]);

  // Workflow state: 'intake' -> 'processing' -> 'workspace'
  const [stage, setStage] = useState("intake");
  const [activePipelineIndex, setActivePipelineIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Inspection & Inspection Results
  const [inspection, setInspection] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [declarations, setDeclarations] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [product, setProduct] = useState(null);
  const [changeDetected, setChangeDetected] = useState(false);
  const [changeDetails, setChangeDetails] = useState("");
  const [screeningScore, setScreeningScore] = useState(0);
  const [complianceStatus, setComplianceStatus] = useState("NEEDS REVIEW");
  const [scoreSummary, setScoreSummary] = useState(null);
  const [scoreProblems, setScoreProblems] = useState([]);

  // Interaction State
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editingDeclId, setEditingDeclId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [addingNewImage, setAddingNewImage] = useState(false);

  // Finalization & Report
  const [finalRemarks, setFinalRemarks] = useState("Verified in compliance with Legal Metrology Act, 2009.");
  const [selectedFinalStatus, setSelectedFinalStatus] = useState("COMPLIANT");
  const [reportData, setReportData] = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  // -------------------------------------------------------------
  // CAMERA SESSION LIFECYCLE (OPEN ONCE, REMAIN ACTIVE)
  // -------------------------------------------------------------
  const startCameraSession = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      toast.error("Camera access failed. You can upload photo files manually instead.");
      setIsCameraOpen(false);
    }
  };

  const stopCameraSession = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, []);

  // Capture frame from active camera stream without stopping the camera!
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    const vW = videoRef.current.videoWidth || 1280;
    const vH = videoRef.current.videoHeight || 720;
    canvas.width = vW;
    canvas.height = vH;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, vW, vH);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `package-${Date.now()}-${capturedImages.length + 1}.jpg`, { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(blob);
        const newImgObj = { id: `local-${Date.now()}-${Math.random()}`, file, previewUrl };

        setCapturedImages((prev) => [...prev, newImgObj]);
        toast.success(`Photo ${capturedImages.length + 1} captured! Camera remains open.`);
      }
    }, "image/jpeg", 0.95);
  };

  // Remove single captured image from local list
  const handleRemoveCapturedImage = (idToRemove) => {
    setCapturedImages((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  // Add manually selected files to local collection
  const handleManualFilesSelect = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const newItems = files.map((file, idx) => ({
      id: `file-${Date.now()}-${idx}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setCapturedImages((prev) => [...prev, ...newItems]);
    toast.success(`Added ${files.length} photo(s) to inspection collection`);
  };

  // Cleanup camera stream on page unmount
  useEffect(() => {
    return () => {
      stopCameraSession();
    };
  }, [stopCameraSession]);

  // -------------------------------------------------------------
  // START SCANNING PIPELINE (ONLY WHEN OFFICER CLICKS SCAN)
  // -------------------------------------------------------------
  const handleExecuteScan = async () => {
    if (capturedImages.length === 0) {
      return toast.error("Please capture or select at least one package photo before scanning.");
    }
    if (isScanning) return;

    setIsScanning(true);
    stopCameraSession(); // Stop camera cleanly when scanning starts
    setStage("processing");
    setActivePipelineIndex(0);

    const interval = setInterval(() => {
      setActivePipelineIndex((prev) => (prev < PIPELINE_STAGES.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      // Step 1: Create ONE inspection
      const newInsp = await inspectionService.createInspection(user?.location || "Field Inspection");
      setInspection(newInsp);

      // Step 2: Batch upload ALL captured images to that ONE inspection
      const fileArray = capturedImages.map((ci) => ci.file);
      const uploadedImgs = await inspectionService.uploadImagesBatch(newInsp.id, fileArray);
      setImages(uploadedImgs);
      setSelectedImageIndex(0);

      // Step 3: Run AI Analysis across ALL images
      const res = await inspectionService.analyzeInspection(newInsp.id);

      clearInterval(interval);
      setActivePipelineIndex(PIPELINE_STAGES.length);

      setInspection(res.inspection);
      setDeclarations(res.declarations || []);
      setEvaluations(res.evaluations || []);
      setProduct(res.product);
      setChangeDetected(res.changeDetected || false);
      setChangeDetails(res.changeDetails || "");
      setScreeningScore(res.complianceScore ?? res.screeningScore ?? 85);
      setComplianceStatus(res.complianceStatus || res.inspection?.finalStatus || "COMPLIANT");
      setScoreSummary(res.summary || null);
      setScoreProblems(res.problems || []);
      setSelectedFinalStatus(res.complianceStatus || res.inspection?.finalStatus || "COMPLIANT");

      setStage("workspace");
      toast.success(`Multi-Image AI Analysis completed across ${capturedImages.length} package photos!`);
    } catch (err) {
      clearInterval(interval);
      const errMsg = err.response?.data?.message || err.message || "Analysis failed. Please ensure backend & AI service are running.";
      toast.error(errMsg);
      setStage("intake");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCategoryUpdated = (data) => {
    if (data.inspection) setInspection(data.inspection);
    if (data.declarations) setDeclarations(data.declarations);
    if (data.evaluations) setEvaluations(data.evaluations);
    if (data.product) setProduct(data.product);
    if (data.complianceScore !== undefined) setScreeningScore(data.complianceScore);
    if (data.complianceStatus) setComplianceStatus(data.complianceStatus);
    if (data.summary) setScoreSummary(data.summary);
    if (data.problems) setScoreProblems(data.problems);
    if (data.complianceStatus) setSelectedFinalStatus(data.complianceStatus);
  };

  // Add additional photo post-scan to existing inspection
  const handleAddPostScanImage = async (file) => {
    if (!inspection || !file) return;
    setAddingNewImage(true);
    try {
      const newImg = await inspectionService.uploadImage(inspection.id, file, "ADDITIONAL");
      const updatedImages = [...images, newImg];
      setImages(updatedImages);

      toast.info("Re-evaluating multi-image package declarations...");
      const res = await inspectionService.analyzeInspection(inspection.id);

      setInspection(res.inspection);
      setDeclarations(res.declarations || []);
      setEvaluations(res.evaluations || []);
      setProduct(res.product);
      setScreeningScore(res.complianceScore ?? res.screeningScore ?? 85);
      setComplianceStatus(res.complianceStatus || "COMPLIANT");
      setScoreSummary(res.summary || null);
      setScoreProblems(res.problems || []);
      setSelectedImageIndex(updatedImages.length - 1);
      toast.success("New package photo added and merged into inspection!");
    } catch (err) {
      toast.error(err.message || "Failed to add image");
    } finally {
      setAddingNewImage(false);
    }
  };

  // Verification & Finalization Handlers with real-time recalculation
  const handleVerifyDeclaration = async (decl, verified, overrideVal = null) => {
    try {
      const val = overrideVal !== null ? overrideVal : decl.detectedValue;
      const res = await inspectionService.verifyDeclaration(decl.id, val, verified);

      if (res && res.complianceScore !== undefined) {
        setScreeningScore(res.complianceScore);
        setComplianceStatus(res.complianceStatus);
        setScoreSummary(res.summary);
        setScoreProblems(res.problems || []);
        if (res.declarations) setDeclarations(res.declarations);
        if (res.evaluations) setEvaluations(res.evaluations);
        if (res.inspection) setInspection(res.inspection);
        setSelectedFinalStatus(res.complianceStatus || "COMPLIANT");
        toast.success(`${decl.fieldName} ${verified ? "verified" : "updated"} · Recalculated: ${Math.round(res.complianceScore)}% (${res.complianceStatus})`);
      } else {
        setDeclarations((prev) => prev.map((d) => (d.id === decl.id ? (res.verifiedDeclaration || res) : d)));
        toast.success(`${decl.fieldName} ${verified ? "verified" : "updated"}`);
      }
      setEditingDeclId(null);
    } catch (err) {
      toast.error(err.message || "Failed to update declaration");
    }
  };

  const handleFinalize = async () => {
    if (!inspection) return;
    setFinalizing(true);
    try {
      const fin = await inspectionService.finalizeInspection(inspection.id, finalRemarks, selectedFinalStatus);
      setInspection(fin);

      const rep = await inspectionService.generateReport(fin.id);
      setReportData(rep);
      toast.success("Inspection locked and official PDF generated");
    } catch (err) {
      toast.error(err.message || "Finalization failed");
    } finally {
      setFinalizing(false);
    }
  };

  const handleSelectDeclarationCard = (decl) => {
    setSelectedDeclaration(decl);
    if (decl.evidence && decl.evidence.imageId) {
      const imgIdStr = decl.evidence.imageId;
      let targetIndex = 0;
      if (imgIdStr.startsWith("img-")) {
        targetIndex = parseInt(imgIdStr.replace("img-", ""), 10) - 1;
      }
      if (targetIndex >= 0 && targetIndex < images.length) {
        setSelectedImageIndex(targetIndex);
      }
    }
  };

  return (
    <div className={`space-y-6 ${fieldMode ? "bg-slate-900 text-white p-4 rounded-xl" : ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
              Package Inspection Scanner
            </h1>
            {inspection && (
              <span className="bg-blue-100 text-blue-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                {inspection.inspectionNumber}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Legal Metrology Act, 2009 · Single Camera Session Multi-Photo Evidence Capture
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFieldMode(!fieldMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              fieldMode ? "bg-blue-600 text-white border-blue-500" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Field Mode
          </button>

          {stage === "workspace" && (
            <button
              onClick={() => {
                stopCameraSession();
                setStage("intake");
                setCapturedImages([]);
                setInspection(null);
                setImages([]);
                setDeclarations([]);
                setEvaluations([]);
                setReportData(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Scan Session
            </button>
          )}
        </div>
      </div>

      {/* STAGE 1: INTAKE & SINGLE CAMERA CAPTURE SESSION */}
      {stage === "intake" && (
        <div className="max-w-4xl mx-auto space-y-6 py-2">
          {/* Active Camera Viewport */}
          {isCameraOpen ? (
            <div className="bg-slate-950 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800">
              <video ref={videoRef} autoPlay playsInline className="w-full h-[400px] object-cover" />

              {/* Viewfinder overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/50 m-6 rounded-xl flex items-center justify-center">
                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-semibold backdrop-blur-md">
                  Align Package Panel · Tap "Capture Photo" as many times as needed
                </span>
              </div>

              {/* Camera Action Toolbar */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-between px-6">
                <button
                  type="button"
                  onClick={stopCameraSession}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl backdrop-blur-md transition"
                >
                  Close Camera
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition text-sm hover:scale-105 active:scale-95"
                >
                  <Camera className="w-5 h-5" /> CAPTURE PHOTO
                </button>

                <div className="bg-black/60 text-white text-xs font-mono font-bold px-3 py-2 rounded-xl backdrop-blur-md">
                  Captured: {capturedImages.length}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Single Camera Session Capture</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Open the camera once and capture all visible package sides (Front, Back, Sides, MRP & Customer Care close-ups). Tap <strong>SCAN</strong> when finished.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={startCameraSession}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition hover:scale-105"
                >
                  <Camera className="w-5 h-5" /> OPEN CAMERA
                </button>

                <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-3 rounded-xl border border-slate-300 cursor-pointer transition flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-slate-600" /> Select Image Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleManualFilesSelect(e.target.files)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Captured Photos Thumbnail Collection Bar */}
          {capturedImages.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" /> Captured Package Photos ({capturedImages.length})
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Review captured photos or remove bad shots before scanning
                </span>
              </div>

              {/* Thumbnails Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {capturedImages.map((item, idx) => (
                  <div key={item.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square">
                    <img src={item.previewUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleRemoveCapturedImage(item.id)}
                      className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md shadow transition opacity-90 hover:opacity-100"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* SCAN / SUBMIT BUTTON */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="text-xs text-slate-500">
                  Ready to process <strong className="text-slate-800">{capturedImages.length}</strong> photo(s) into one consolidated Legal Metrology inspection.
                </div>

                <button
                  onClick={handleExecuteScan}
                  disabled={isScanning}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-8 py-3 rounded-xl shadow-lg flex items-center gap-2 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  SCAN NOW ({capturedImages.length} Photos)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE 2: PROCESSING STATE */}
      {stage === "processing" && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Processing Multi-Image Package Scan</h2>
            <p className="text-xs text-slate-500 mt-1">
              Fusing text, declarations & Legal Metrology rules across {capturedImages.length} package photos...
            </p>
          </div>

          <div className="space-y-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
            {PIPELINE_STAGES.map((stg, idx) => {
              const isDone = idx < activePipelineIndex;
              const isCurrent = idx === activePipelineIndex;
              return (
                <div key={stg.name} className="flex items-center gap-3 text-xs">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                  )}
                  <span className={isDone ? "font-semibold text-slate-800" : isCurrent ? "font-bold text-blue-600" : "text-slate-400"}>
                    {stg.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE 3: WORKSPACE (3-PANEL REVIEW & EVIDENCE VIEWER) */}
      {stage === "workspace" && inspection && (
        <div className="space-y-6">
          {/* Product Category Banner */}
          <ProductCategoryBanner
            inspection={inspection}
            onCategoryUpdated={handleCategoryUpdated}
          />

          {/* Top Prominent Compliance Assessment Card */}
          <ComplianceAssessmentCard
            score={screeningScore}
            status={complianceStatus}
            summary={scoreSummary}
            evaluations={evaluations}
            problems={scoreProblems}
            onSelectDeclaration={handleSelectDeclarationCard}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL: EVIDENCE IMAGE & SVG BOUNDING BOXES (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="font-semibold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" /> Package Evidence ({selectedImageIndex + 1}/{images.length})
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))} className="p-1 rounded hover:bg-slate-100">
                  <ZoomOut className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-600 px-1">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))} className="p-1 rounded hover:bg-slate-100">
                  <ZoomIn className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                    selectedImageIndex === idx ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={`http://localhost:8081/api/inspections/images/${img.id}/content`}
                    alt="Side"
                    className="w-14 h-14 object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[9px] font-bold text-center py-0.5">
                    {img.imageType || `#${idx + 1}`}
                  </span>
                </button>
              ))}

              {/* Add Post-Scan Image Button */}
              <label className="w-14 h-14 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100/50 flex flex-col items-center justify-center cursor-pointer flex-shrink-0 transition">
                {addingNewImage ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="text-[9px] font-bold text-blue-700">+ Photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleAddPostScanImage(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {/* Image Preview & SVG Bounding Boxes Overlay */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950 flex items-center justify-center min-h-[350px]">
              {images[selectedImageIndex] && (
                <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }} className="relative transition-transform duration-200 w-full">
                  <img
                    src={`http://localhost:8081/api/inspections/images/${images[selectedImageIndex].id}/content`}
                    alt="Inspection Evidence"
                    className="w-full h-auto block"
                  />

                  {/* SVG Overlay for Bounding Boxes */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {declarations.map((d) => {
                      if (!d.xPct && !d.yPct) return null;
                      const isSelected = selectedDeclaration?.id === d.id;
                      return (
                        <g key={d.id}>
                          <rect
                            x={`${d.xPct}%`}
                            y={`${d.yPct}%`}
                            width={`${d.widthPct || 20}%`}
                            height={`${d.heightPct || 8}%`}
                            fill={isSelected ? "rgba(59, 130, 246, 0.25)" : "rgba(16, 185, 129, 0.15)"}
                            stroke={isSelected ? "#2563eb" : "#10b981"}
                            strokeWidth={isSelected ? "3" : "2"}
                            rx="4"
                          />
                          <text
                            x={`${d.xPct}%`}
                            y={`${Math.max(0, d.yPct - 2)}%`}
                            fill={isSelected ? "#1e40af" : "#065f46"}
                            fontSize="10"
                            fontWeight="bold"
                          >
                            {d.fieldName} ({Math.round((d.finalConfidence || 0.9) * 100)}%)
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* CENTER PANEL: FUSED DECLARATIONS & OFFICER VERIFICATION (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="font-semibold text-xs text-slate-700 uppercase tracking-wider">
                Fused Declarations ({declarations.length})
              </div>
              <div className="text-xs font-bold text-slate-500">
                Score: <span className="text-blue-600 font-mono">{screeningScore}%</span>
              </div>
            </div>

            {/* Conflict Warning */}
            {declarations.some((d) => d.conflictDetected) && (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-3 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Conflicting Values Across Images!
                </div>
                <p className="text-slate-700">
                  Different package sides produced conflicting values. Officer visual verification is required.
                </p>
              </div>
            )}

            {/* Declarations List */}
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {declarations.map((d) => {
                const isEditing = editingDeclId === d.id;
                const isSelected = selectedDeclaration?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDeclarationCard(d)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-100"
                        : d.conflictDetected
                        ? "border-rose-300 bg-rose-50/30"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">{d.fieldName}</span>
                      <ConfidenceBar value={d.finalConfidence || 0.85} />
                    </div>

                    {isEditing ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifyDeclaration(d, true, editValue);
                          }}
                          className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDeclId(null);
                          }}
                          className="bg-slate-200 text-slate-600 p-1 rounded hover:bg-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-sm font-semibold text-slate-900">
                          {d.officerValue || d.displayValue || d.detectedValue}
                          {d.fieldName === "COUNTRY_OF_ORIGIN" && d.evidenceType === "INFERRED_FROM_MANUFACTURER_ADDRESS" && (
                            <span className="block text-[11px] font-normal text-amber-700 mt-0.5">
                              inferred from manufacturer address
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleVerifyDeclaration(d, true)}
                            className={`px-2 py-1 text-[11px] font-bold rounded transition ${
                              d.officerVerified
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200"
                            }`}
                          >
                            ✓ Verify
                          </button>
                          <button
                            onClick={() => {
                              setEditingDeclId(d.id);
                              setEditValue(d.officerValue || d.displayValue || d.detectedValue || "");
                            }}
                            className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: RULE EVALUATIONS & FINAL DECISION (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <div className="font-semibold text-xs text-slate-700 uppercase tracking-wider">
                PCR 2011 Rule Findings ({evaluations.length})
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[350px]">
              {evaluations.map((ev) => (
                <div key={ev.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{ev.rule?.ruleCode || ev.fieldName}</span>
                    <StatusBadge status={ev.result} />
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{ev.reasoning}</p>
                </div>
              ))}
            </div>

            {/* Finalization Box */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="font-bold text-xs text-slate-800 uppercase tracking-wider">Final Enforcement Decision</div>
              <select
                value={selectedFinalStatus}
                onChange={(e) => setSelectedFinalStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold bg-white"
              >
                <option value="COMPLIANT">COMPLIANT (Pass)</option>
                <option value="NEEDS_FURTHER_REVIEW">NEEDS FURTHER REVIEW</option>
                <option value="POTENTIAL_NON_COMPLIANCE">POTENTIAL NON-COMPLIANCE</option>
              </select>

              <textarea
                value={finalRemarks}
                onChange={(e) => setFinalRemarks(e.target.value)}
                rows={2}
                placeholder="Officer remarks..."
                className="w-full border border-slate-300 rounded-lg p-2 text-xs"
              />

              <button
                onClick={handleFinalize}
                disabled={finalizing || inspection.status === "FINALIZED"}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {finalizing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileCheck2 className="w-4 h-4" />
                )}
                {inspection.status === "FINALIZED" ? "Inspection Finalized" : "Finalize & Lock Inspection"}
              </button>

              {reportData && (
                <a
                  href={inspectionService.getReportDownloadUrl(reportData.id || inspection.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 transition text-center"
                >
                  <Download className="w-4 h-4" /> Download Court-Ready PDF
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
