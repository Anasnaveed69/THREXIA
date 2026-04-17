import { useState } from 'react';
import { Activity, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Analyze() {
  const [features, setFeatures] = useState(
    "0, 1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 2, 1, 0"
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const featureArray = features.split(',').map(f => parseFloat(f.trim()));
      
      const response = await fetch('http://localhost:8000/api/analyze_manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: featureArray })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to connect to Analytics Engine." });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Manual Log Analysis</h1>
        <p className="page-subtitle">Upload custom logs or input specific 14-feature arrays to test the THREXIA prediction model.</p>
      </div>

      <div className="grid-dashboard">
        {/* Input Form */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} /> Data Input
          </div>
          
          <form onSubmit={handleAnalyze} style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Feature Array (Comma Separated - 14 values total)
            </label>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary-purple)', marginBottom: '1rem', fontStyle: 'italic' }}>
              Format: contractor, emp_class, foreign, criminal, medical, printed, off_hours, burned, burned_other, abroad, hostility, entries, campus, late
            </div>
            
            <textarea 
              className="login-input" 
              style={{ width: '100%', height: '100px', resize: 'vertical' }}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              required
            />
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                {loading ? "ANALYZING..." : "ANALYZE LOG"}
              </button>
              
              <button type="button" onClick={() => setFeatures("1, 3, 0, 0, 0, 500, 50, 45, 0, 0, 2, 40, 2, 1")} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', boxShadow: 'none' }}>
                Load Anomaly Preset
              </button>
            </div>
          </form>
        </div>

        {/* Output Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">Prediction Result</div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!result ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Awaiting manual feed...</div>
            ) : result.error ? (
              <div style={{ color: 'var(--danger-red)' }}>{result.error}</div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  {result.prediction === "Threat" ? (
                    <ShieldAlert size={48} color="var(--danger-red)" />
                  ) : (
                    <ShieldCheck size={48} color="var(--primary-blue)" />
                  )}
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: result.prediction === "Threat" ? 'var(--danger-red)' : 'var(--primary-blue)', textShadow: `0 0 15px ${result.prediction === "Threat" ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'}` }}>
                      {result.prediction}
                    </div>
                    {result.prediction === "Threat" && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Confidence: {result.confidence}%</div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>BEHAVIORAL ANALYSIS:</div>
                  {result.explanations.map((exp, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${result.prediction === "Threat" ? 'var(--danger-red)' : 'var(--primary-blue)'}`, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {exp}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
