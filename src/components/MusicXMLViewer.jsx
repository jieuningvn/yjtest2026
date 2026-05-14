import React, { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

const MusicXMLViewer = () => {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initOSMD = async () => {
      if (containerRef.current && !osmdRef.current) {
        osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          drawTitle: true,
          drawPartNames: false,
          responsive: true,
        });

        try {
          await osmdRef.current.load('/tongtong.musicxml');
          
          if (!isMounted) return;

          // Aggressive layout overrides to force 4 measures per line
          osmdRef.current.zoom = 0.6; 
          
          // Force fixed measures per line
          osmdRef.current.EngravingRules.FixedMeasuresPerLine = true;
          osmdRef.current.EngravingRules.MeasuresPerLine = 4;
          
          // Ignore the system breaks and widths defined in the MusicXML file
          osmdRef.current.EngravingRules.NewSystemAtMeasureEndParameters = []; // Clear any manual breaks
          
          // Ensure the sheet can stretch/shrink to fit
          osmdRef.current.EngravingRules.FixedMeasureWidth = false;
          
          osmdRef.current.render();
        } catch (error) {
          console.error('Error loading MusicXML:', error);
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
  }, []);

  return (
    <div className="musicxml-viewer-container">
      <div ref={containerRef} style={{ width: '100%', minHeight: '300px' }} />
    </div>
  );
};

export default MusicXMLViewer;
