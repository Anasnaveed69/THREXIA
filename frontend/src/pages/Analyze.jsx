import { useState } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Upload } from 'lucide-react';
import StarBorder from '../components/StarBorder';
import { API_BASE_URL } from '../apiConfig';

export default function Analyze() {
  const [features, setFeatures] = useState(
    "0, 1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 2, 1, 0"
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvResults, setCsvResults] = useState(null);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'csv'

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const featureArray = features.split(',').map(f => parseFloat(f.trim()));
      
      const response = await fetch(`${API_BASE_URL}/api/analyze_manual`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('threxia_auth')}`
        },
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

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      
      const response = await fetch(`${API_BASE_URL}/api/upload_csv`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('threxia_auth')}`
        },
        body: formData
      });
      
      const data = await response.json();
      setCsvResults(data);
    } catch (err) {
      console.error(err);
      setCsvResults({ error: "Failed to upload CSV file." });
    }
    setLoading(false);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/download_csv_template`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('threxia_auth')}` }
      });
      const data = await response.json();
      
      // Create blob and download
      const blob = new Blob([data.template], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download template');
    }
  };

  const handleDownloadResults = () => {
    if (!csvResults || !csvResults.results) {
      alert('No results to download');
      return;
    }

    // Create CSV rows with results
    const csvRows = [
      ['Row', 'Prediction', 'Confidence', 'Feature1', 'Feature2', 'Feature3', 'Feature4', 'Feature5', 'Feature6', 'Feature7', 'Feature8', 'Feature9', 'Feature10', 'Feature11', 'Feature12', 'Feature13', 'Feature14', 'Analysis']
    ];

    csvResults.results.forEach(result => {
      if (result.features) {
        csvRows.push([
          result.row,
          result.prediction,
          result.confidence || 'N/A',
          ...result.features,
          result.explanations?.join('; ') || 'N/A'
        ]);
      } else {
        csvRows.push([
          result.row,
          'Error',
          'N/A',
          ...Array(14).fill(''),
          result.error || 'Unknown error'
        ]);
      }
    });

    // Create CSV content
    const csv = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threxia_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const role = localStorage.getItem('threxia_role') || 'User';

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Manual Log Analysis</h1>
        <p className="page-subtitle">
          {role === 'Student/Researcher' ? (
            <span style={{ color: 'var(--success-green)', fontWeight: 600 }}>ACADEMIC SANDBOX MODE ACTIVE</span>
          ) : (
            <span style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>{role.toUpperCase()} CLEARANCE</span>
          )} • Upload CSV files or input specific 14-feature arrays to test the THREXIA prediction model.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-container">
        <button 
          onClick={() => setActiveTab('manual')}
          style={{ 
            padding: '0.5rem 1.25rem', 
            borderRadius: '4px', 
            border: 'none', 
            background: activeTab === 'manual' ? 'var(--primary-purple)' : 'transparent', 
            color: activeTab === 'manual' ? 'white' : 'var(--text-secondary)', 
            cursor: 'pointer', 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            transition: '0.3s' 
          }}
        >
          MANUAL ENTRY
        </button>
        <button 
          onClick={() => setActiveTab('csv')}
          style={{ 
            padding: '0.5rem 1.25rem', 
            borderRadius: '4px', 
            border: 'none', 
            background: activeTab === 'csv' ? 'var(--primary-purple)' : 'transparent', 
            color: activeTab === 'csv' ? 'white' : 'var(--text-secondary)', 
            cursor: 'pointer', 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            transition: '0.3s' 
          }}
        >
          CSV UPLOAD
        </button>
      </div>

      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
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
                <StarBorder as="button" type="submit" innerClassName="btn-primary" color="var(--primary-glow)" speed="4s" innerStyle={{ width: 'auto', padding: '0.75rem 2rem' }}>
                  {loading ? "ANALYZING..." : "ANALYZE LOG"}
                </StarBorder>
                
                <StarBorder as="button" type="button" onClick={() => setFeatures("1, 3, 0, 0, 0, 500, 50, 45, 0, 0, 2, 40, 2, 1")} innerClassName="btn-primary" color="rgba(255,255,255,0.4)" innerStyle={{ width: 'auto', padding: '0.75rem 2rem', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', boxShadow: 'none' }}>
                  Load Anomaly Preset
                </StarBorder>
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
                    {Array.isArray(result.explanations) ? (
                      result.explanations.map((exp, idx) => (
                        <div key={idx} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${result.prediction === "Threat" ? 'var(--danger-red)' : 'var(--primary-blue)'}`, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                          {exp}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid var(--danger-red)`, fontSize: '0.85rem' }}>
                        {typeof result.explanations === 'object' ? JSON.stringify(result.explanations) : result.explanations}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Tab */}
      {activeTab === 'csv' && (
        <div className="grid-dashboard">
          {/* File Upload Form */}
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={16} /> CSV File Upload
            </div>
            
            <form onSubmit={handleCsvUpload} style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Select CSV File
              </label>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-purple)', marginBottom: '1rem', fontStyle: 'italic' }}>
                CSV should have 14 columns per row: contractor, emp_class, foreign, criminal, medical, printed, off_hours, burned, burned_other, abroad, hostility, entries, campus, late
              </div>
              
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                required
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'var(--text-strong)',
                  cursor: 'pointer'
                }}
              />
              
              {csvFile && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--primary-blue)' }}>
                  Selected: {csvFile.name}
                </div>
              )}
              
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <StarBorder as="button" type="submit" innerClassName="btn-primary" color="var(--primary-glow)" speed="4s" innerStyle={{ width: 'auto', padding: '0.75rem 2rem' }}>
                  {loading ? "UPLOADING..." : "UPLOAD & ANALYZE"}
                </StarBorder>
                <StarBorder 
                  as="button"
                  type="button" 
                  onClick={handleDownloadTemplate} 
                  innerClassName="btn-primary" 
                  color="rgba(255,255,255,0.4)"
                  innerStyle={{ width: 'auto', padding: '0.75rem 2rem', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', boxShadow: 'none' }}
                >
                  Download Template
                </StarBorder>
              </div>
            </form>
          </div>

          {/* Results Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-title">Analysis Results</div>
            
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {!csvResults ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Upload a CSV file to see results...</div>
              ) : csvResults.error ? (
                <div style={{ color: 'var(--danger-red)' }}>{csvResults.error}</div>
              ) : (
                <div>
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>File: {csvResults.filename}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rows Processed: {csvResults.rows_processed}</div>
                  </div>

                  <button 
                    onClick={handleDownloadResults}
                    style={{ 
                      marginBottom: '1rem', 
                      padding: '0.5rem 1rem', 
                      background: 'var(--primary-blue)', 
                      border: 'none', 
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Download Results as CSV
                  </button>

                  <div className="data-table-container">
                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Row</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Prediction</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Confidence</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvResults.results.map((result, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td data-label="ROW" style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{result.row}</td>
                            <td data-label="PREDICTION" style={{ padding: '0.5rem', color: result.error ? 'var(--danger-red)' : result.prediction === 'Threat' ? 'var(--danger-red)' : 'var(--primary-blue)' }}>
                              {result.error ? 'Error' : result.prediction}
                            </td>
                            <td data-label="CONFIDENCE" style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
                              {result.error ? '-' : `${result.confidence}%`}
                            </td>
                            <td data-label="DETAILS" style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                              {result.error ? result.error : result.explanations?.[0] || 'No details'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
