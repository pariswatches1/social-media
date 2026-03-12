"use client";

import { useState, useCallback, useEffect } from "react";
import ViralityMeter from "./ViralityMeter";
import CopyButton from "./ui/CopyButton";
import LoadingCard from "./ui/LoadingCard";

import { PLATFORMS } from "@/lib/platforms";

interface BrandProfileOption {
  id: string;
  name: string;
  voice: string;
  tone: string;
}

const TONES = ["Authority", "Storytelling", "Educational", "Controversial", "Inspirational", "Data-driven"];
const POST_TYPES = ["Text Post", "Carousel", "Reel/Short", "Poll", "Thread"];

interface Variation {
  copy: string;
  hook: string;
  cta: string;
}

interface PlatformResult {
  charLimit: number;
  variations: Variation[];
}

interface GenerateResults {
  error?: string;
  viralityScore: number;
  bestTimeToPost: string;
  hashtags: string[];
  imagePrompt: string;
  platforms: Record<string, PlatformResult>;
}

interface Prefill {
  topic?: string;
  angle?: string;
  hook?: string;
  postType?: string;
}

interface Props {
  prefill: Prefill | null;
  clearPrefill: () => void;
}

export default function CreatePanel({ prefill, clearPrefill }: Props) {
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [hook, setHook] = useState("");
  const [tone, setTone] = useState("Authority");
  const [postType, setPostType] = useState("Text Post");
  const [selPlatforms, setSelPlatforms] = useState(["instagram", "linkedin"]);
  const [variations, setVariations] = useState(2);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerateResults | null>(null);
  const [activePlatform, setActivePlatform] = useState("instagram");
  const [activeVar, setActiveVar] = useState(0);
  const [brandVoice, setBrandVoice] = useState("");
  const [brandProfiles, setBrandProfiles] = useState<BrandProfileOption[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [savingToLibrary, setSavingToLibrary] = useState(false);
  const [savedVariations, setSavedVariations] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/brand")
      .then((r) => r.json())
      .then((data) => {
        if (data.profiles) {
          setBrandProfiles(data.profiles);
          const def = data.profiles.find((p: BrandProfileOption & { isDefault?: boolean }) => p.isDefault);
          if (def) {
            setSelectedProfileId(def.id);
            setBrandVoice(`${def.voice} — ${def.tone}`);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (prefill) {
      setTopic(prefill.topic || "");
      setAngle(prefill.angle || "");
      setHook(prefill.hook || "");
      setPostType(prefill.postType || "Text Post");
      clearPrefill();
    }
  }, [prefill, clearPrefill]);

  const togglePlatform = (id: string) => {
    setSelPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const generate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResults(null);
    setSavedVariations(new Set());

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          angle,
          hook,
          tone,
          postType,
          platforms: selPlatforms,
          variations,
          brandVoice,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const parsed = await res.json();
      setResults(parsed);
      setActivePlatform(selPlatforms[0]);
      setActiveVar(0);
    } catch (e) {
      setResults({ error: e instanceof Error ? e.message : "Generation failed. Try again." } as GenerateResults);
    }
    setLoading(false);
  }, [topic, angle, hook, tone, postType, selPlatforms, variations, brandVoice]);

  const currentPlatformData = results?.platforms?.[activePlatform];
  const currentVariation = currentPlatformData?.variations?.[activeVar];
  const plat = PLATFORMS.find((p) => p.id === activePlatform);
  const charCount = currentVariation?.copy?.length || 0;

  const saveToLibrary = async () => {
    if (!currentVariation || !results) return;
    const key = `${activePlatform}-${activeVar}`;
    if (savedVariations.has(key)) return;
    setSavingToLibrary(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          platform: activePlatform,
          copy: currentVariation.copy,
          hook: currentVariation.hook,
          cta: currentVariation.cta,
          hashtags: JSON.stringify(results.hashtags || []),
          viralityScore: results.viralityScore || 0,
          tone,
          postType,
          imagePrompt: results.imagePrompt || "",
          brandProfileId: selectedProfileId || undefined,
        }),
      });
      if (res.ok) {
        setSavedVariations((prev) => new Set(prev).add(key));
      }
    } catch {
      // ignore
    } finally {
      setSavingToLibrary(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, height: "calc(100vh - 120px)", overflow: "hidden" }}>
      {/* LEFT: Controls */}
      <div style={{ overflowY: "auto", paddingRight: 4, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 14 }}>CONTENT BRIEF</div>

          {[
            { label: "TOPIC *", val: topic, set: setTopic, placeholder: "What to post about..." },
            { label: "ANGLE", val: angle, set: setAngle, placeholder: "Unique angle / perspective..." },
            { label: "HOOK IDEA", val: hook, set: setHook, placeholder: "Opening line idea..." },
          ].map(({ label, val, set, placeholder }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 5, fontFamily: "'DM Mono', monospace" }}>{label}</label>
              <textarea
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                rows={2}
                style={{ width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "none" }}
              />
            </div>
          ))}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 5, fontFamily: "'DM Mono', monospace" }}>BRAND VOICE</label>
            {brandProfiles.length > 0 && (
              <select
                value={selectedProfileId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedProfileId(id);
                  if (id === "") {
                    setBrandVoice("");
                  } else {
                    const p = brandProfiles.find((bp) => bp.id === id);
                    if (p) setBrandVoice(`${p.voice} — ${p.tone}`);
                  }
                }}
                style={{ width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, fontFamily: "'DM Mono', monospace", outline: "none", marginBottom: 8, cursor: "pointer" }}
              >
                <option value="">Custom voice...</option>
                {brandProfiles.map((bp) => (
                  <option key={bp.id} value={bp.id}>{bp.name}</option>
                ))}
              </select>
            )}
            <input
              value={brandVoice}
              onChange={(e) => { setBrandVoice(e.target.value); setSelectedProfileId(""); }}
              placeholder="e.g. direct, no fluff, data-driven..."
              style={{ width: "100%", background: "#060810", border: "1px solid #1e2535", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
            />
          </div>
        </div>

        <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 12 }}>PLATFORMS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PLATFORMS.map((p) => (
              <button key={p.id} onClick={() => togglePlatform(p.id)} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", background: selPlatforms.includes(p.id) ? p.bg : "transparent", border: `1px solid ${selPlatforms.includes(p.id) ? p.border : "#1e2535"}`, color: selPlatforms.includes(p.id) ? p.color : "#4a5568", fontSize: 12, fontFamily: "'DM Mono', monospace", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s" }}>
                {p.label}
                {selPlatforms.includes(p.id) && <span style={{ fontSize: 10 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2, marginBottom: 12 }}>TONE & FORMAT</div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>TONE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TONES.map((t) => (
                <button key={t} onClick={() => setTone(t)} style={{ padding: "5px 10px", borderRadius: 6, cursor: "pointer", background: tone === t ? "rgba(6,182,212,0.15)" : "transparent", border: `1px solid ${tone === t ? "rgba(6,182,212,0.4)" : "#1e2535"}`, color: tone === t ? "#06b6d4" : "#4a5568", fontSize: 11, fontFamily: "'DM Mono', monospace", transition: "all 0.15s" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>POST FORMAT</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {POST_TYPES.map((pt) => (
                <button key={pt} onClick={() => setPostType(pt)} style={{ padding: "5px 10px", borderRadius: 6, cursor: "pointer", background: postType === pt ? "rgba(245,158,11,0.15)" : "transparent", border: `1px solid ${postType === pt ? "rgba(245,158,11,0.4)" : "#1e2535"}`, color: postType === pt ? "#f59e0b" : "#4a5568", fontSize: 11, fontFamily: "'DM Mono', monospace", transition: "all 0.15s" }}>
                  {pt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, color: "#4a5568", display: "block", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>VARIATIONS · {variations}</label>
            <input type="range" min={1} max={3} value={variations} onChange={(e) => setVariations(+e.target.value)} style={{ width: "100%", accentColor: "#06b6d4" }} />
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !topic.trim() || selPlatforms.length === 0}
          style={{ padding: "14px", borderRadius: 10, cursor: loading || !topic.trim() || selPlatforms.length === 0 ? "not-allowed" : "pointer", background: loading || !topic.trim() ? "#0d1017" : "linear-gradient(135deg, #0891b2, #0e7490)", border: "none", color: loading ? "#4a5568" : "#fff", fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: 1, transition: "all 0.2s" }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span className="animate-spin" style={{ width: 14, height: 14, border: "2px solid #4a5568", borderTopColor: "#06b6d4", borderRadius: "50%", display: "inline-block" }} />
              GENERATING...
            </span>
          ) : (
            `GENERATE ${selPlatforms.length} PLATFORM${selPlatforms.length > 1 ? "S" : ""} →`
          )}
        </button>
      </div>

      {/* RIGHT: Results */}
      <div style={{ overflowY: "auto", paddingRight: 4 }}>
        {!results && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, opacity: 0.4 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid #1e2535", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✍️</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4a5568", textAlign: "center" }}>
              Fill in your topic and hit generate
              <br />
              to create platform-optimized content
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[...Array(4)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        )}

        {results?.error && (
          <div style={{ padding: 20, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#ef4444", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{results.error}</div>
        )}

        {results && !results.error && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Meta row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>VIRALITY SCORE</div>
                <ViralityMeter score={results.viralityScore} />
              </div>
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>BEST TIME TO POST</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{results.bestTimeToPost}</div>
              </div>
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>HASHTAGS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {results.hashtags?.slice(0, 4).map((h) => (
                    <span key={h} style={{ fontSize: 10, color: "#06b6d4", fontFamily: "'DM Mono', monospace" }}>{h}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform tabs */}
            <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {selPlatforms.map((pid) => {
                  const p = PLATFORMS.find((pl) => pl.id === pid);
                  if (!p) return null;
                  return (
                    <button key={pid} onClick={() => { setActivePlatform(pid); setActiveVar(0); }} style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", background: activePlatform === pid ? p.bg : "transparent", border: `1px solid ${activePlatform === pid ? p.border : "#1e2535"}`, color: activePlatform === pid ? p.color : "#4a5568", fontSize: 12, fontFamily: "'DM Mono', monospace", transition: "all 0.15s" }}>
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Variation selector */}
              {currentPlatformData && (
                <>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {currentPlatformData.variations?.map((_, i) => (
                      <button key={i} onClick={() => setActiveVar(i)} style={{ padding: "5px 14px", borderRadius: 6, cursor: "pointer", background: activeVar === i ? "rgba(245,158,11,0.15)" : "transparent", border: `1px solid ${activeVar === i ? "rgba(245,158,11,0.4)" : "#1e2535"}`, color: activeVar === i ? "#f59e0b" : "#4a5568", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                        VAR {i + 1}
                      </button>
                    ))}
                  </div>

                  {currentVariation && (
                    <div className="fade-in">
                      {/* Hook */}
                      <div style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "#06b6d4", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>HOOK</div>
                        <div style={{ fontSize: 14, color: "#e2e8f0", fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{currentVariation.hook}</div>
                      </div>

                      {/* Full copy */}
                      <div style={{ background: "#060810", border: "1px solid #1e2535", borderRadius: 10, padding: 16, marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "'DM Mono', monospace" }}>FULL COPY · {charCount} CHARS</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: charCount > (plat?.limit || 9999) ? "#ef4444" : "#4a5568" }}>
                              {charCount}/{plat?.limit}
                            </div>
                            <CopyButton text={currentVariation.copy} />
                          </div>
                        </div>
                        <div style={{ fontSize: 14, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{currentVariation.copy}</div>
                      </div>

                      {/* CTA */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, padding: "10px 14px", flex: 1, marginRight: 10 }}>
                          <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>CTA</div>
                          <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{currentVariation.cta}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <CopyButton text={[currentVariation.copy, "\n\n" + results.hashtags?.join(" ")].join("")} />
                          <button
                            onClick={saveToLibrary}
                            disabled={savingToLibrary || savedVariations.has(`${activePlatform}-${activeVar}`)}
                            style={{
                              padding: "8px 14px",
                              borderRadius: 6,
                              border: `1px solid ${savedVariations.has(`${activePlatform}-${activeVar}`) ? "rgba(34,197,94,0.4)" : "rgba(6,182,212,0.3)"}`,
                              background: savedVariations.has(`${activePlatform}-${activeVar}`) ? "rgba(34,197,94,0.1)" : "rgba(6,182,212,0.05)",
                              color: savedVariations.has(`${activePlatform}-${activeVar}`) ? "#22c55e" : "#06b6d4",
                              fontSize: 10,
                              fontFamily: "'DM Mono', monospace",
                              cursor: savingToLibrary || savedVariations.has(`${activePlatform}-${activeVar}`) ? "default" : "pointer",
                              letterSpacing: 0.5,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {savedVariations.has(`${activePlatform}-${activeVar}`) ? "SAVED ✓" : savingToLibrary ? "SAVING..." : "SAVE"}
                          </button>
                          <button
                            onClick={() => {
                              sessionStorage.setItem("signal_schedule_prefill", JSON.stringify({
                                content: currentVariation.copy,
                                platform: activePlatform,
                                hashtags: results.hashtags?.join(" ") || "",
                              }));
                              window.location.href = "/schedule";
                            }}
                            style={{
                              padding: "8px 14px",
                              borderRadius: 6,
                              border: "none",
                              background: "linear-gradient(135deg, #0891b2, #0e7490)",
                              color: "#fff",
                              fontSize: 10,
                              fontFamily: "'DM Mono', monospace",
                              cursor: "pointer",
                              letterSpacing: 0.5,
                              whiteSpace: "nowrap",
                            }}
                          >
                            SCHEDULE
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Image prompt */}
            {results.imagePrompt && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2 }}>IMAGE PROMPT</div>
                  <CopyButton text={results.imagePrompt} />
                </div>
                <div style={{ fontSize: 13, color: "#64748b", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{results.imagePrompt}</div>
              </div>
            )}

            {/* All hashtags */}
            {results.hashtags && (
              <div style={{ background: "#0a0d14", border: "1px solid #1e2535", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4a5568", letterSpacing: 2 }}>HASHTAGS · {results.hashtags.length}</div>
                  <CopyButton text={results.hashtags.join(" ")} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {results.hashtags.map((h) => (
                    <span key={h} className="tag-chip" style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", color: "#06b6d4" }}>{h}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
