import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

const ScoreViewer = ({ musicXmlUrl, scoredNotes }) => {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const osmdRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);
  const [wrapperHeight, setWrapperHeight] = useState('auto');

  // Calculates scale dynamically to fit score within parent viewport bounds
  const updateScale = () => {
    if (!containerRef.current || !wrapperRef.current) return;

    // Desktop viewports (>= 1025px) keep standard scale
    const isDesktop = window.innerWidth >= 1025;
    if (isDesktop) {
      setScale(1);
      setWrapperHeight('auto');
      containerRef.current.style.transform = 'none';
      containerRef.current.style.transformOrigin = 'unset';
      return;
    }

    const parentWidth = wrapperRef.current.clientWidth;
    const scoreWidth = containerRef.current.offsetWidth || 750;

    if (parentWidth > 0 && scoreWidth > 0) {
      // Set minScale to prevent score from shrinking too much on mobile devices (e.g. 390px, 430px)
      const minScale = 0.7;
      const calculatedScale = Math.max(minScale, Math.min(1, parentWidth / scoreWidth));
      setScale(calculatedScale);

      // Height compensation to close empty spaces left by CSS scale transform
      const originalHeight = containerRef.current.offsetHeight;
      // Add a safety buffer of 25px to accommodate potential horizontal scrollbar overlaps
      const newHeight = originalHeight * calculatedScale + (calculatedScale < 1 ? 25 : 0);
      setWrapperHeight(newHeight > 0 ? `${newHeight}px` : 'auto');

      containerRef.current.style.transform = `scale(${calculatedScale})`;
      containerRef.current.style.transformOrigin = 'top left';
    }
  };


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
            newSystemFromXML: false,
          });

          await osmdRef.current.load(musicXmlUrl);

          if (!isMounted) return;

          // Zoom setting for readable size
          osmdRef.current.zoom = 0.65;

          // Configure engraving rules for clean, stable layout
          const isSpring = musicXmlUrl && musicXmlUrl.includes('spring');
          const isNewWorld = musicXmlUrl && musicXmlUrl.includes('ssgscore');

          if (isSpring) {
            // Vivaldi Spring: custom phrase-based breaking [5, 4, 5] measures
            osmdRef.current.EngravingRules.NewSystemAtMeasureEndParameters = [5, 9];
            osmdRef.current.EngravingRules.RenderXMeasuresPerLineAkaSystem = undefined;
            osmdRef.current.EngravingRules.FixedMeasureWidth = true;
            osmdRef.current.EngravingRules.StretchLastSystemLine = true;
          } else if (isNewWorld) {
            // New World Symphony: force 4 measures per line
            osmdRef.current.EngravingRules.RenderXMeasuresPerLineAkaSystem = 4;
            osmdRef.current.EngravingRules.NewSystemAtMeasureEndParameters = [];
            osmdRef.current.EngravingRules.FixedMeasureWidth = true;
            osmdRef.current.EngravingRules.StretchLastSystemLine = true;
          } else {
            // TongTongTongTong & generic scores: force 4 measures per line
            osmdRef.current.EngravingRules.RenderXMeasuresPerLineAkaSystem = 4;
            osmdRef.current.EngravingRules.NewSystemAtMeasureEndParameters = [];
            osmdRef.current.EngravingRules.FixedMeasureWidth = false;
          }

          // Margins
          osmdRef.current.EngravingRules.PageLeftMargin = 20;
          osmdRef.current.EngravingRules.PageRightMargin = 20;

          osmdRef.current.render();
          if (isMounted) {
            setLoading(false);
            // Trigger scale calculation once score has finished rendering
            setTimeout(updateScale, 100);
          }
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
      osmdRef.current = null;
    };
  }, [musicXmlUrl]);

  // Color OSMD notes when rendering completes or scoredNotes changes
  useEffect(() => {
    if (!loading && osmdRef.current) {
      colorNotesInOSMD(osmdRef.current, scoredNotes);
      // Recalculate scale after note coloring (as it triggers re-rendering)
      setTimeout(updateScale, 100);
    }
  }, [loading, scoredNotes]);

  // Handle screen resize, orientation shifts, and initial delay shifts
  useEffect(() => {
    const handleResize = () => {
      updateScale();
    };

    window.addEventListener('resize', handleResize);

    if (!loading) {
      // Extra layouts sync delay
      setTimeout(updateScale, 150);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [loading]);

  const colorNotesInOSMD = (osmd, notes) => {
    const measures = osmd.GraphicSheet?.MeasureList;
    if (!measures) return;

    const colorMap = {
      'Excellent': '#00b894',
      'Good': '#55efc4',
      'Almost': '#fdcb6e',
      'Wrong': '#d63031'
    };

    // 1. Reset colors if notes is empty/null
    if (!notes || notes.length === 0) {
      measures.forEach((measureList) => {
        const staffMeasure = measureList[0];
        if (staffMeasure && staffMeasure.staffEntries) {
          staffMeasure.staffEntries.forEach((staffEntry) => {
            if (!staffEntry.voiceEntries) return;
            staffEntry.voiceEntries.forEach((voiceEntry) => {
              if (!voiceEntry.notes) return;
              voiceEntry.notes.forEach((gNote) => {
                if (gNote.sourceNote) {
                  gNote.sourceNote.NoteheadColor = undefined;
                  gNote.sourceNote.StemColor = undefined;
                }
              });
            });
          });
        }
      });
      try {
        osmd.render();
      } catch (err) {
        console.error("Failed to reset note colors:", err);
      }
      return;
    }

    // 2. Map notes to lookup status
    const statusMap = {};
    notes.forEach((note) => {
      statusMap[`${note.measureNumber}-${note.noteIndex}`] = note.resultStatus;
    });

    // 3. Apply colors
    measures.forEach((measureList) => {
      const staffMeasure = measureList[0];
      if (!staffMeasure) return;

      const measureNumber = staffMeasure.ParentMeasure?.MeasureNumber || 0;
      let playableNoteCounter = 1;

      const staffEntries = staffMeasure.staffEntries;
      if (!staffEntries) return;

      staffEntries.forEach((staffEntry) => {
        if (!staffEntry.voiceEntries) return;
        staffEntry.voiceEntries.forEach((voiceEntry) => {
          if (!voiceEntry.notes) return;
          voiceEntry.notes.forEach((gNote) => {
            if (!gNote.sourceNote) return;
            
            // Check if it's a rest
            const isRest = (typeof gNote.sourceNote.isRest === 'function' && gNote.sourceNote.isRest()) || !gNote.sourceNote.Pitch;
            if (isRest) return;

            const key = `${measureNumber}-${playableNoteCounter}`;
            const status = statusMap[key];
            if (status) {
              const color = colorMap[status];
              gNote.sourceNote.NoteheadColor = color;
              gNote.sourceNote.StemColor = color;
            }
            playableNoteCounter++;
          });
        });
      });
    });

    try {
      osmd.render();
    } catch (err) {
      console.error("Failed to render note colors:", err);
    }
  };

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
        ref={wrapperRef} 
        key={musicXmlUrl} 
        className="osmd-container-wrapper" 
        style={{ 
          width: '100%', 
          overflowX: 'auto',
          overflowY: 'hidden',
          height: wrapperHeight,
          transition: 'height 0.2s ease',
          position: 'relative'
        }}
      >
        <div 
          ref={containerRef} 
          style={{ 
            width: '100%', 
            minWidth: '750px',
            background: 'white',
            borderRadius: '8px',
            padding: '10px',
            transition: 'transform 0.2s ease',
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
    </div>
  );
};

export default ScoreViewer;
