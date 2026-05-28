import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

const ScoreViewer = ({ musicXmlUrl }) => {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    if (!musicXmlUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Clear previous render
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    osmdRef.current = null;

    const initOSMD = async () => {
      if (containerRef.current) {
        try {
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: false, // Turn off title in score since we show page title
            drawPartNames: false,
            responsive: true,
          });

          await osmdRef.current.load(musicXmlUrl);

          if (!isMounted) return;

          // Zoom setting for readable size
          osmdRef.current.zoom = 0.8;

          // Configure engraving rules for clean, stable layout
          osmdRef.current.EngravingRules.FixedMeasuresPerLine = true;
          osmdRef.current.EngravingRules.MeasuresPerLine = 4;
          osmdRef.current.EngravingRules.NewSystemAtMeasureEndParameters = [];
          osmdRef.current.EngravingRules.FixedMeasureWidth = false;

          // Margins
          osmdRef.current.EngravingRules.PageLeftMargin = 20;
          osmdRef.current.EngravingRules.PageRightMargin = 20;

          osmdRef.current.render();
          if (isMounted) setLoading(false);
        } catch (err) {
          console.error('Error loading MusicXML:', err);
          if (isMounted) {
            setError('악보를 불러오는 중 오류가 발생했습니다.');
            setLoading(false);
          }
        }
      }
    };

    initOSMD();

    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      osmdRef.current = null;
    };
  }, [musicXmlUrl]);

  if (!musicXmlUrl) {
    return (
      <div className="score-viewer-placeholder">
        <div className="score-viewer-icon">🎼</div>
        <p>악보 준비 중입니다</p>
        <span className="score-viewer-subtext">정식 출시 버전에서 MusicXML 렌더링 기능이 제공될 예정입니다.</span>
      </div>
    );
  }

  return (
    <div className="musicxml-viewer-container" style={{ position: 'relative', width: '100%', minHeight: '200px' }}>
      {loading && (
        <div className="score-viewer-placeholder">
          <div className="score-viewer-icon">🎼</div>
          <p>악보를 불러오는 중입니다...</p>
        </div>
      )}
      {error && (
        <div className="score-viewer-placeholder" style={{ borderColor: 'var(--error-color)' }}>
          <div className="score-viewer-icon" style={{ color: 'var(--error-color)' }}>❌</div>
          <p>{error}</p>
        </div>
      )}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          background: 'white',
          borderRadius: '8px',
          padding: '10px',
          ...(loading || error ? {
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0,
            pointerEvents: 'none'
          } : {})
        }} 
      />
    </div>
  );
};

export default ScoreViewer;
