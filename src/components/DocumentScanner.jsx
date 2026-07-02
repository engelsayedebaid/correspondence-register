import { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';

function DocumentScanner({
  onClose,
  onScanComplete,
  departments,
  responsiblePersons,
  commanders
}) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'camera'
  const [imageSrc, setImageSrc] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');

  // Extracted fields form
  const [fields, setFields] = useState({
    registrationNumber: '',
    registrationDate: '',
    type: 'وارد',
    source: '',
    summary: '',
    responsible: '',
    commander: '',
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Load cameras list when camera mode is active
  useEffect(() => {
    if (mode === 'camera') {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setCameras(videoDevices);
          if (videoDevices.length > 0 && !selectedCamera) {
            setSelectedCamera(videoDevices[0].deviceId);
          }
        })
        .catch(err => {
          console.error("Error listing cameras:", err);
          setStatusText("عذراً، فشل الوصول إلى الكاميرا");
        });
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  // Start selected camera stream
  useEffect(() => {
    if (mode === 'camera' && selectedCamera) {
      startCamera(selectedCamera);
    }
  }, [selectedCamera, mode]);

  const startCamera = async (deviceId) => {
    stopCamera();
    try {
      setCameraActive(false);
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error starting camera:", err);
      setStatusText("فشل تشغيل الكاميرا. يرجى التحقق من الصلاحيات.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      // Mirror if it's user facing camera (optional, standard draw here)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImageSrc(dataUrl);
      stopCamera();
      setMode('upload');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const runOCR = async () => {
    if (!imageSrc) return;
    setScanning(true);
    setProgress(0);
    setStatusText('جاري تهيئة محرك التعرّف على النصوص...');

    try {
      // Create Tesseract worker
      const worker = await createWorker('ara+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatusText(`جاري قراءة النصوص: ${Math.round(m.progress * 100)}%`);
          } else {
            setStatusText('جاري تحميل ملفات اللغة العربية...');
          }
        }
      });

      setStatusText('جاري معالجة الصورة وتحليل الكلمات...');
      const { data: { text } } = await worker.recognize(imageSrc);
      setExtractedText(text);
      await worker.terminate();

      // Parse the extracted text to auto-fill fields
      parseExtractedText(text);
      setStatusText('تم الانتهاء من المسح الضوئي بنجاح!');
    } catch (err) {
      console.error("OCR Error:", err);
      setStatusText('عذراً، حدث خطأ أثناء قراءة المستند.');
    } finally {
      setScanning(false);
    }
  };

  // Helper heuristic to parse fields from text
  const parseExtractedText = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    let parsedRegNum = '';
    let parsedDate = '';
    let parsedType = 'وارد';
    let parsedSource = '';
    let parsedResponsible = '';
    let parsedCommander = '';
    let parsedSummary = '';

    // 1. Match type (وارد / صادر)
    if (text.includes('صادر') || text.includes('مكاتبة صادرة')) {
      parsedType = 'صادر';
    }

    // 2. Match Date (looking for YYYY/MM/DD or DD/MM/YYYY or YYYY-MM-DD)
    const dateRegex = /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})|(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      parsedDate = dateMatch[0].replace(/-/g, '/');
    } else {
      parsedDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    }

    // 3. Match Registration Number (digits following keywords like رقم, قيد, معاملة)
    const regNumRegex = /(?:رقم|قيد|المعاملة|الوارد|الصادر)\s*[:#\-]*\s*(\d+)/i;
    const regMatch = text.match(regNumRegex);
    if (regMatch) {
      parsedRegNum = regMatch[1];
    } else {
      // fallback to find any standalone sequence of 3-7 digits
      const standaloneNum = text.match(/\b\d{3,7}\b/);
      if (standaloneNum) {
        parsedRegNum = standaloneNum[0];
      }
    }

    // 4. Match Department/Source
    for (const dept of departments) {
      if (text.includes(dept)) {
        parsedSource = dept;
        break;
      }
    }

    // 5. Match Responsible Person
    for (const person of responsiblePersons) {
      const parts = person.split(' ');
      // match first/second name to find in text
      if (parts.length >= 2 && (text.includes(parts[0]) && text.includes(parts[1]))) {
        parsedResponsible = person;
        break;
      }
    }

    // 6. Match Commander
    for (const cmd of commanders) {
      const nameOnly = cmd.replace(/(العقيد|العميد|اللواء|الرائد|المقدم|النقيب|العميد)\s*\/\s*/, '');
      if (text.includes(nameOnly)) {
        parsedCommander = cmd;
        break;
      }
    }

    // 7. Make a clean summary (use first long line or combination of lines that don't look like dates/numbers)
    const summaryLines = lines.filter(line => {
      // Exclude short lines or lines with mostly numbers/dates
      if (line.length < 15) return false;
      if (line.includes('التاريخ') || line.includes('الموضوع') || line.includes('رقم')) return true;
      return !dateRegex.test(line);
    });

    if (summaryLines.length > 0) {
      // Strip common prefixes
      parsedSummary = summaryLines[0].replace(/(الموضوع|بشأن|بخصوص|خلاصة)\s*[:\-]*\s*/, '');
      if (summaryLines[1] && parsedSummary.length < 50) {
        parsedSummary += ' - ' + summaryLines[1].replace(/(الموضوع|بشأن|بخصوص|خلاصة)\s*[:\-]*\s*/, '');
      }
    } else {
      // Fallback
      parsedSummary = lines.find(l => l.length > 10) || '';
    }

    setFields({
      registrationNumber: parsedRegNum,
      registrationDate: parsedDate,
      type: parsedType,
      source: parsedSource,
      summary: parsedSummary.substring(0, 150),
      responsible: parsedResponsible,
      commander: parsedCommander,
    });
  };

  const handleApply = () => {
    onScanComplete(fields);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal scanner-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%' }}>
        <div className="modal-header">
          <h2 className="modal-title">مسح المستند ضوئياً بالذكاء الاصطناعي</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {/* Scanner Mode Toggle */}
          <div className="scanner-tabs">
            <button
              className={`scanner-tab-btn ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode('upload')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              رفع صورة المستند
            </button>
            <button
              className={`scanner-tab-btn ${mode === 'camera' ? 'active' : ''}`}
              onClick={() => { setMode('camera'); setImageSrc(null); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              التقاط صورة بالكاميرا
            </button>
          </div>

          <div className="scanner-grid">
            {/* Left side: Camera feed / Image preview */}
            <div className="scanner-view-container">
              {mode === 'camera' && (
                <div className="camera-view">
                  {cameras.length > 1 && (
                    <div className="camera-select-wrapper">
                      <select
                        className="form-select camera-select"
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.target.value)}
                      >
                        {cameras.map((c) => (
                          <option key={c.deviceId} value={c.deviceId}>
                            {c.label || `كاميرا ${cameras.indexOf(c) + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="scanner-video"
                  />
                  {cameraActive ? (
                    <button type="button" className="btn btn-primary capture-btn" onClick={capturePhoto}>
                      📸 التقاط الصورة
                    </button>
                  ) : (
                    <div className="camera-loading">جاري تشغيل الكاميرا...</div>
                  )}
                </div>
              )}

              {mode === 'upload' && (
                <div className="upload-view">
                  {imageSrc ? (
                    <div className="preview-image-wrapper">
                      <img src={imageSrc} alt="Document preview" className="preview-image" />
                      {scanning && <div className="scanner-laser"></div>}
                      <button
                        type="button"
                        className="change-image-btn"
                        onClick={() => { setImageSrc(null); setExtractedText(''); }}
                        disabled={scanning}
                      >
                        إزالة الصورة
                      </button>
                    </div>
                  ) : (
                    <div
                      className="drag-drop-area"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-400)' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p>انقر هنا لرفع أو سحب وإفلات صورة المكاتبة</p>
                      <span>يدعم صيغ JPG, PNG (حد أقصى ٥ ميجابايت)</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Right side: Scanned content & parsing */}
            <div className="scanner-results-container">
              {/* Process indicator / Action */}
              {imageSrc && !extractedText && !scanning && (
                <div className="scan-trigger-card">
                  <button type="button" className="btn btn-success run-scan-btn" onClick={runOCR}>
                    ⚡ ابدأ التعرّف على النصوص
                  </button>
                  <p className="scan-helper">سيقوم النظام بقراءة المكاتبة ضوئياً وملء الحقول الممكنة تلقائياً.</p>
                </div>
              )}

              {scanning && (
                <div className="scan-progress-card">
                  <div className="ocr-spinner"></div>
                  <h4 style={{ margin: '1rem 0 0.5rem', color: '#fff' }}>{statusText}</h4>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              {statusText && !scanning && !extractedText && (
                <div className="scan-status-info">{statusText}</div>
              )}

              {extractedText && !scanning && (
                <div className="extracted-fields-form">
                  <h3 className="fields-title">البيانات المستخلصة</h3>

                  <div className="fields-grid">
                    <div className="form-group">
                      <label className="form-label">رقم القيد</label>
                      <input
                        className="form-input"
                        type="text"
                        value={fields.registrationNumber}
                        onChange={(e) => setFields({ ...fields, registrationNumber: e.target.value })}
                        placeholder="لم يستخلص رقم القيد"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">التاريخ</label>
                      <input
                        className="form-input"
                        type="text"
                        value={fields.registrationDate}
                        onChange={(e) => setFields({ ...fields, registrationDate: e.target.value })}
                        placeholder="YYYY/MM/DD"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">النوع</label>
                      <select
                        className="form-select"
                        value={fields.type}
                        onChange={(e) => setFields({ ...fields, type: e.target.value })}
                      >
                        <option value="وارد">وارد</option>
                        <option value="صادر">صادر</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">الجهة</label>
                      <select
                        className="form-select"
                        value={fields.source}
                        onChange={(e) => setFields({ ...fields, source: e.target.value })}
                      >
                        <option value="">لم يتم التعرف على الجهة</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">ملخص المكاتبة الواردة ومضمونها</label>
                      <textarea
                        className="form-textarea"
                        value={fields.summary}
                        onChange={(e) => setFields({ ...fields, summary: e.target.value })}
                        placeholder="لم يستخلص الموضوع"
                        style={{ minHeight: '60px' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">المسؤول</label>
                      <select
                        className="form-select"
                        value={fields.responsible}
                        onChange={(e) => setFields({ ...fields, responsible: e.target.value })}
                      >
                        <option value="">لم يتم التعرف على المسؤول</option>
                        {responsiblePersons.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">القائد</label>
                      <select
                        className="form-select"
                        value={fields.commander}
                        onChange={(e) => setFields({ ...fields, commander: e.target.value })}
                      >
                        <option value="">لم يتم التعرف على القائد</option>
                        {commanders.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="apply-section">
                    <button type="button" className="btn btn-primary apply-data-btn" onClick={handleApply}>
                      💾 اعتماد وتعبئة البيانات في الاستمارة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentScanner;
