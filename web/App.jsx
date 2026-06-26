import { useState, useRef } from "react";
const CURRICULUM_CONTEXT = `
أنت مساعد تربوي.
مهمتك توليد أنشطة تعلم متمايز بناءً على الوحدة والدرس المحددين في المنهج المرفق.

يجب أن تولّد ثلاثة أنشطة:
1. نشاط داعم: للطلاب الذين يحتاجون دعماً إضافياً - بسيط ومباشر، يركز على المفاهيم الأساسية فقط
2. نشاط أساسي: للطلاب ذوي المستوى المتوسط - يغطي أهداف الدرس بشكل كامل
3. نشاط إثراء: للطلاب المتقدمين - يتحدى التفكير ويوسع الفهم

قواعد مهمة:
- المدة المحددة ملزمة لكل نشاط
- اجعل التعليمات واضحة ومناسبة لعمر الطلاب
- استخدم اللغة العربية الفصحى البسيطة
- أضف هدف التعلم لكل نشاط
- استند فقط إلى محتوى المنهج المرفق

أجب فقط بصيغة JSON بهذا الشكل بالضبط بدون أي نص خارجه:
{
  "داعم": {
    "العنوان": "...",
    "الهدف": "...",
    "التعليمات": "...",
    "المواد": "..."
  },
  "أساسي": {
    "العنوان": "...",
    "الهدف": "...",
    "التعليمات": "...",
    "المواد": "..."
  },
  "إثراء": {
    "العنوان": "...",
    "الهدف": "...",
    "التعليمات": "...",
    "المواد": "..."
  }
}
`;

const levelColors = {
  "داعم":   { bg: "#FFF7ED", border: "#FB923C", badge: "#EA580C", icon: "🌱" },
  "أساسي":  { bg: "#F0FDF4", border: "#4ADE80", badge: "#16A34A", icon: "⚡" },
  "إثراء":  { bg: "#EFF6FF", border: "#60A5FA", badge: "#2563EB", icon: "🚀" },
};

export default function App() {
  const [unit, setUnit]           = useState("");
  const [lesson, setLesson]       = useState("");
  const [duration, setDuration]   = useState("15");
  const [level, setLevel]         = useState("متوسط");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfName, setPdfName]     = useState("");
  const fileRef = useRef();

  function handlePdf(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPdfName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setPdfBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (!pdfBase64) {
      setError("يرجى رفع ملف المنهج PDF أولاً");
      return;
    }
    if (!unit.trim() || !lesson.trim()) {
      setError("يرجى إدخال الوحدة والدرس");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const userPrompt = `
الوحدة: ${unit}
الدرس: ${lesson}
مدة النشاط: ${duration} دقيقة
مستوى المجموعة: ${level}

بناءً على محتوى المنهج في الملف المرفق، ولّد الأنشطة الثلاثة المناسبة لهذا الدرس.
    `;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_KEY;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: CURRICULUM_CONTEXT }] },
            generationConfig: {maxOutputTokens: 4096},
            contents: [{
              parts: [
                { inline_data: { mime_type: "application/pdf", data: pdfBase64 } },
                { text: userPrompt }
              ]
            }],
          }),
        }
      );

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      const clean = match ? match[0] : "";
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("خطأ: " + (e.message || JSON.stringify(e)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      fontFamily: "'Noto Kufi Arabic', 'Segoe UI', sans-serif",
      padding: "2rem 1rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; }
        input, select { outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        input:focus, select:focus {
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.15);
        }
        .card-appear { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pulse-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .pulse-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(56,189,248,0.4);
        }
        .pulse-btn:active:not(:disabled) { transform: translateY(0); }
        .spin { display: inline-block; animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .upload-zone {
          border: 2px dashed rgba(255,255,255,0.2);
          border-radius: 12px; padding: 1.2rem;
          text-align: center; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .upload-zone:hover { border-color: #38bdf8; background: rgba(56,189,248,0.05); }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.75rem",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "100px", padding: "0.5rem 1.25rem", marginBottom: "1.25rem",
        }}>
          <span style={{ fontSize: "1.1rem" }}>⚗️</span>
          <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
            Prepared by Abdullah AL-Zayer
          </span>
        </div>
        <h1 style={{
          color: "#f8fafc", fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
          fontWeight: 900, margin: "0 0 0.5rem",
          textShadow: "0 2px 20px rgba(56,189,248,0.3)",
        }}>
          مولّد أنشطة التعلم المتمايز
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>
          ارفع المنهج وأدخل معلومات الدرس واحصل على ثلاثة أنشطة متمايزة فوراً
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        maxWidth: "680px", margin: "0 auto 2rem",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px", padding: "2rem",
        backdropFilter: "blur(10px)",
      }}>

        {/* PDF Upload */}
        <div style={{ marginBottom: "1.25rem" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>
            ملف المنهج (PDF)
          </span>
          <div className="upload-zone" onClick={() => fileRef.current.click()}>
            <input ref={fileRef} type="file" accept="application/pdf" onChange={handlePdf} style={{ display: "none" }} />
            {pdfBase64 ? (
              <div style={{ color: "#4ADE80", fontSize: "0.95rem", fontWeight: 600 }}>
                ✅ {pdfName}
              </div>
            ) : (
              <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                📄 اضغط هنا لرفع ملف المنهج
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600 }}>الوحدة</span>
            <input
              value={unit} onChange={e => setUnit(e.target.value)}
              placeholder="مثال: الحركة والقوى"
              style={{
                background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", padding: "0.7rem 1rem", color: "#f1f5f9",
                fontSize: "0.95rem", width: "100%",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600 }}>الدرس</span>
            <input
              value={lesson} onChange={e => setLesson(e.target.value)}
              placeholder="مثال: قانون نيوتن الثاني"
              style={{
                background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", padding: "0.7rem 1rem", color: "#f1f5f9",
                fontSize: "0.95rem", width: "100%",
              }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600 }}>مدة النشاط (دقيقة)</span>
            <select value={duration} onChange={e => setDuration(e.target.value)} style={{
              background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", padding: "0.7rem 1rem", color: "#f1f5f9",
              fontSize: "0.95rem", width: "100%", cursor: "pointer",
            }}>
              {["10","15","20","25","30","45"].map(d => (
                <option key={d} value={d} style={{ background: "#1e293b" }}>{d} دقيقة</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600 }}>مستوى النشاط</span>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{
              background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", padding: "0.7rem 1rem", color: "#f1f5f9",
              fontSize: "0.95rem", width: "100%", cursor: "pointer",
            }}>
              {["مبتدئ","متوسط","متقدم","مختلط"].map(l => (
                <option key={l} value={l} style={{ background: "#1e293b" }}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px", padding: "0.7rem 1rem", color: "#fca5a5",
            fontSize: "0.9rem", marginBottom: "1rem", textAlign: "center",
          }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={generate} disabled={loading} className="pulse-btn" style={{
          width: "100%", padding: "0.9rem",
          background: loading ? "rgba(56,189,248,0.3)" : "linear-gradient(135deg, #0ea5e9, #38bdf8)",
          border: "none", borderRadius: "12px",
          color: "#0f172a", fontWeight: 800, fontSize: "1.05rem",
          cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
        }}>
          {loading ? <><span className="spin">⚙️</span> جاري التوليد...</> : "✨ توليد الأنشطة"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={{
          maxWidth: "960px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}>
          {["داعم", "أساسي", "إثراء"].map((type, i) => {
            const c = levelColors[type];
            const d = result[type];
            if (!d) return null;
            return (
              <div key={type} className="card-appear" style={{
                animationDelay: `${i * 0.12}s`,
                background: c.bg, border: `2px solid ${c.border}`,
                borderRadius: "18px", padding: "1.5rem",
                boxShadow: `0 4px 24px ${c.border}22`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.6rem" }}>{c.icon}</span>
                  <span style={{
                    background: c.badge, color: "#fff",
                    borderRadius: "100px", padding: "0.25rem 0.9rem",
                    fontSize: "0.82rem", fontWeight: 700,
                  }}>نشاط {type}</span>
                </div>
                <h3 style={{ color: "#1e293b", fontSize: "1.05rem", fontWeight: 800, margin: "0 0 0.75rem" }}>
                  {d["العنوان"]}
                </h3>
                <div style={{
                  background: "rgba(0,0,0,0.05)", borderRadius: "10px",
                  padding: "0.6rem 0.9rem", marginBottom: "0.9rem",
                }}>
                  <span style={{ color: "#475569", fontSize: "0.8rem", fontWeight: 700 }}>🎯 الهدف: </span>
                  <span style={{ color: "#334155", fontSize: "0.88rem" }}>{d["الهدف"]}</span>
                </div>
                <div style={{ marginBottom: "0.9rem" }}>
                  <p style={{ color: "#475569", fontSize: "0.8rem", fontWeight: 700, margin: "0 0 0.3rem" }}>📋 التعليمات:</p>
                  <p style={{ color: "#334155", fontSize: "0.88rem", margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {d["التعليمات"]}
                  </p>
                </div>
                {d["المواد"] && (
                  <div style={{ borderTop: `1px solid ${c.border}66`, paddingTop: "0.8rem", color: "#64748b", fontSize: "0.83rem" }}>
                    🛠️ <strong>المواد:</strong> {d["المواد"]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p style={{ textAlign: "center", color: "#334155", fontSize: "0.78rem", marginTop: "3rem" }}>
        مدعوم بالذكاء الاصطناعي · للمعلمين فقط · لا تُحفظ أي بيانات
      </p>
    </div>
  );
}
