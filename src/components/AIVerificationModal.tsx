import React, { useState, useEffect } from "react";
import { 
  X, CheckCircle, AlertTriangle, Cpu, Sparkles, Loader2, 
  ExternalLink, Play, Clock
} from "lucide-react";
import { Campaign, TaskSubmission } from "../types";

interface AIVerificationModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: (updatedSub: TaskSubmission) => void;
}

export default function AIVerificationModal({ campaign, onClose, onSuccess }: AIVerificationModalProps) {
  const isVideoTask = 
    campaign.category === "Video Engagement" || 
    campaign.title.toLowerCase().includes("video") || 
    campaign.title.toLowerCase().includes("youtube") || 
    campaign.title.toLowerCase().includes("watch");

  // Extract YouTube ID helper
  const getYouTubeId = (url?: string): string | null => {
    if (!url) return "dQw4w9WgXcQ"; // Default fallback
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : "dQw4w9WgXcQ";
  };

  const youtubeId = getYouTubeId(campaign.targetLink);

  const [videoTimer, setVideoTimer] = useState(60);
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);

  const [userProofText, setUserProofText] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<"idle" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Video Watch Timer
  useEffect(() => {
    if (!isVideoTask || !videoStarted || videoCompleted) return;

    const interval = setInterval(() => {
      setVideoTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setVideoCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVideoTask, videoStarted, videoCompleted]);

  // Submit task verification to backend
  const handleVerifyAndSubmit = async () => {
    if (!isVideoTask) {
      if (!userProofText.trim()) {
        setErrorMsg("Please enter your account handle/username so the platform AI can analyze and confirm your task execution.");
        setOutcome("error");
        return;
      }
    }

    setSubmitting(true);
    setOutcome("idle");
    setErrorMsg("");

    try {
      const submissionProof = isVideoTask
        ? `Embedded Video Player Watch Confirmed: Duration 60s completed for "${campaign.title}"`
        : userProofText;

      const res = await fetch("/api/gemini/verify-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          submissionText: submissionProof
        })
      });

      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
        setOutcome("error");
        setSubmitting(false);
        return;
      }

      if (data.aiAnalysis?.status === "rejected" || data.submission?.status === "rejected") {
        setErrorMsg(data.aiAnalysis?.feedback || "Automated AI Auditor could not verify valid task compliance from your submission handle.");
        setOutcome("error");
        setSubmitting(false);
        return;
      }

      setFeedback(data.aiAnalysis?.feedback || "Task successfully analyzed and verified! NGN reward credited.");
      setOutcome("success");
      setSubmitting(false);
      if (data.submission) {
        onSuccess(data.submission);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Connection error verifying task proof. Please retry.");
      setOutcome("error");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2 text-left">
            <Cpu size={16} className="text-emerald-400 animate-pulse" />
            <div>
              <span className="font-extrabold text-xs tracking-wider uppercase block">EarnPay Automated Task Verifier</span>
              <span className="text-[9px] text-emerald-400 font-bold block mt-0.5 uppercase tracking-widest">
                {isVideoTask ? "EMBEDDED VIDEO PLAYER" : "AUTOMATED AI ANALYSIS & CONFIRMATION"}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Campaign Info Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-left">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Campaign Target</span>
          <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{campaign.title}</h4>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-[9px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-black uppercase">
              {campaign.category}
            </span>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded font-black uppercase border border-emerald-100/30">
              Reward: ₦{campaign.rewardValue}
            </span>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-black uppercase">
              {campaign.difficulty}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh] space-y-4 text-left">
          
          {/* OPTION A: VIDEO WATCH TASK EMBEDDED PLAYER */}
          {isVideoTask ? (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl overflow-hidden shadow-md relative">
                {!videoStarted ? (
                  <div className="p-8 text-center space-y-3 bg-slate-900 text-white">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
                      <Play size={22} className="fill-white text-white ml-0.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm">Watch Video Directly inside EarnPay</h4>
                      <p className="text-[11px] text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                        Watch the full sponsored clip for 60 seconds below. The platform will automatically verify your view and activate your reward.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVideoStarted(true)}
                      className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider"
                    >
                      Start Video Playback ▶
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="aspect-video w-full">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                        title={campaign.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="bg-slate-950 p-3 text-white flex justify-between items-center border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-amber-400 animate-spin" />
                        <span className="text-xs font-mono font-bold">
                          {videoCompleted ? "✓ Required Duration Watched!" : `Watch Time Remaining: ${videoTimer}s`}
                        </span>
                      </div>
                      {!videoCompleted && (
                        <span className="text-[9px] bg-amber-950/80 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded font-bold">
                          Stay on page
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {videoCompleted && outcome !== "success" && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleVerifyAndSubmit}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Automated AI Verification in Progress...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Claim Verified Video Reward (+₦{campaign.rewardValue})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            /* OPTION B: AUTOMATED PROOF VERIFICATION FORM FOR MICRO-TASKS */
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1.5 text-xs">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block">Instructions:</span>
                <p className="whitespace-pre-line text-slate-300 leading-normal font-sans text-[11px]">{campaign.instructions}</p>
              </div>

              {campaign.targetLink && (
                <a
                  href={campaign.targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    fetch("/api/user/visit-link", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ link: campaign.targetLink })
                    }).catch(e => console.error(e));
                  }}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-200/60 rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-all text-center"
                >
                  <span>🔗 Open Target Page / App Link</span>
                  <ExternalLink size={12} />
                </a>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Account Handle / Username / Profile Reference <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={userProofText}
                  onChange={e => setUserProofText(e.target.value)}
                  placeholder="e.g. @my_handle or username used to perform task"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
                <p className="text-[10px] text-slate-500">
                  ⚡ EarnPay's automated system verifies your handle against advertiser logs. No screenshots required!
                </p>
              </div>

              {outcome !== "success" && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleVerifyAndSubmit}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 active:scale-98 text-white rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-emerald-400" />
                      <span>Automated System Analyzing & Confirming...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} className="text-amber-400" />
                      <span>Analyze, Verify & Confirm Task</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* SUCCESS OUTCOME NOTIFICATION */}
          {outcome === "success" && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200 pt-2">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3.5 text-emerald-950">
                <CheckCircle size={28} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h5 className="font-black text-xs uppercase tracking-wide text-emerald-800">Task Verified & Approved!</h5>
                  <p className="leading-relaxed font-medium">{feedback}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-black tracking-wide uppercase cursor-pointer transition-all shadow-md"
              >
                Return to Active Tasks
              </button>
            </div>
          )}

          {/* ERROR OUTCOME NOTIFICATION */}
          {outcome === "error" && (
            <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-950 animate-in fade-in duration-200">
              <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <h5 className="font-bold text-rose-850">Verification Refused</h5>
                <p className="leading-relaxed text-rose-800 text-[11px]">{errorMsg || "Unable to confirm task execution."}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

