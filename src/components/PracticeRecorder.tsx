import React, { useState, useEffect, useRef } from 'react';
import { fetchAndParseMusicXml } from '../lib/musicxmlToTimeline';
import type { TimelineNote } from '../lib/musicxmlToTimeline';
import { detectPitch } from '../lib/pitchDetection';
import { frequencyToMidi, midiToNoteInfo } from '../lib/noteUtils';
import { calculateScoring } from '../lib/scoring';
import type { UserPitchSample, ScoringResult } from '../lib/scoring';
import { analyzePerformance } from '../lib/performanceAnalysis';
import { BpmControl } from './BpmControl';
import { VisualMetronome } from './VisualMetronome';

interface PracticeRecorderProps {
  musicXmlUrl: string;
  mrPlayerRef: React.RefObject<any>;
  onScored: (notes: any[] | null) => void;
}

export const PracticeRecorder: React.FC<PracticeRecorderProps> = ({ musicXmlUrl, mrPlayerRef, onScored }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [answerTimeline, setAnswerTimeline] = useState<TimelineNote[]>([]);
  const [currentPitch, setCurrentPitch] = useState<string>('---');
  const [currentFreq, setCurrentFreq] = useState<number>(0);
  const [centsError, setCentsError] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [scoredResult, setScoredResult] = useState<ScoringResult | null>(null);
  


  const [bpm, setBpm] = useState<number>(60);
  const [beats, setBeats] = useState<number>(4);
  const [beatType, setBeatType] = useState<number>(4);
  const [isCountingIn, setIsCountingIn] = useState<boolean>(false);
  const [countInBeat, setCountInBeat] = useState<number>(1);
  const [recordedSeconds, setRecordedSeconds] = useState<number>(0);
  const [sampleCount, setSampleCount] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const userPitchTimeline = useRef<UserPitchSample[]>([]);
  const startTimeRef = useRef<number>(0);
  const isCountingInRef = useRef<boolean>(false);
  const countInBeatsRef = useRef<number>(0);
  const lastProgressUpdateRef = useRef<number>(0);

  useEffect(() => {
    isCountingInRef.current = isCountingIn;
  }, [isCountingIn]);

  // Load MusicXML and create the answerTimeline
  useEffect(() => {
    async function loadTimeline() {
      try {
        const parsed = await fetchAndParseMusicXml(musicXmlUrl);
        setBeats(parsed.beats);
        setBeatType(parsed.beatType);
        
        // Match default BPM to musicXML file name logic, but allow manual modification
        const defaultBpm = musicXmlUrl.includes('ssgscore') ? 80 : 100;
        setBpm(defaultBpm);

        // Only keep the first 4 measures for MVP
        const mvpTimeline = parsed.notes.filter(note => note.measureNumber <= 4);
        setAnswerTimeline(mvpTimeline);
      } catch (err) {
        console.error("Error loading MusicXML for timeline:", err);
        setErrorMessage("악보에서 정답 타임라인을 파싱하지 못했습니다.");
      }
    }
    if (musicXmlUrl) {
      loadTimeline();
    }
  }, [musicXmlUrl]);

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const [isMrPlaying, setIsMrPlaying] = useState(false);

  // Synchronize backing track playing state
  useEffect(() => {
    const player = mrPlayerRef.current;
    if (player) {
      player.onStateChange = (playing: boolean) => {
        setIsMrPlaying(playing);
      };
      if (typeof player.isPlaying === 'function') {
        setIsMrPlaying(player.isPlaying());
      }
    }
    return () => {
      if (player) {
        player.onStateChange = null;
      }
    };
  }, [mrPlayerRef]);

  const handleListenExample = () => {
    if (mrPlayerRef && mrPlayerRef.current) {
      if (isMrPlaying) {
        mrPlayerRef.current.pause();
        setIsMrPlaying(false);
      } else {
        mrPlayerRef.current.unmute();
        mrPlayerRef.current.play();
        setIsMrPlaying(true);
      }
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setShowWarning(true);
    setScoredResult(null);
    onScored(null); // Reset colors in sheet music
    
    // Check debugging context diagnostics
    const isSecure = typeof window !== 'undefined' && window.isSecureContext;
    const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices;
    const hasGetUserMedia = hasMedia && typeof navigator.mediaDevices.getUserMedia === 'function';
    
    console.debug("[Microphone Diagnostics] Initializing: ", {
      isSecureContext: isSecure,
      hasMediaDevices: hasMedia,
      hasGetUserMedia: hasGetUserMedia
    });

    // Pre-check system constraints to prevent browser errors
    if (!hasMedia) {
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const errorMsg = (!isSecure && !isLocalhost)
        ? "모바일 마이크 사용을 위해 HTTPS 접속이 필요합니다."
        : "이 기기나 브라우저에서 마이크 사용(mediaDevices)을 지원하지 않습니다.";

      console.warn("[Microphone Diagnostics] Not Supported: navigator.mediaDevices is undefined");

      setErrorMessage(errorMsg);
      setIsRecording(false);
      setShowWarning(false);
      return;
    }

    // Stop and mute MP3 automatically
    if (mrPlayerRef && mrPlayerRef.current) {
      mrPlayerRef.current.pause();
      mrPlayerRef.current.mute();
    }

    try {
      if (typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new TypeError("navigator.mediaDevices.getUserMedia is not a function");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048; // enough for pitch detection
      analyserRef.current = analyser;
      source.connect(analyser);

      // Initialize recording variables and count-in
      userPitchTimeline.current = [];
      startTimeRef.current = performance.now();
      countInBeatsRef.current = 0;
      setIsCountingIn(true);
      setCountInBeat(1);
      setRecordedSeconds(0);
      setSampleCount(0);
      lastProgressUpdateRef.current = 0;
      setIsRecording(true);
      
      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);
      
      const updatePitch = () => {
        if (!analyserRef.current || !audioContextRef.current) return;
        analyserRef.current.getFloatTimeDomainData(dataArray);
        
        const [frequency, clarity] = detectPitch(dataArray, audioContextRef.current.sampleRate);
        const now = performance.now();
        const timeInSeconds = (now - startTimeRef.current) / 1000;
        const timeInBeats = timeInSeconds * (bpm / 60);

        if (frequency > 0 && clarity > 0.5) {
          const midi = frequencyToMidi(frequency);
          const { noteName, octave } = midiToNoteInfo(midi);
          const roundedMidi = Math.round(midi);
          const errorCents = Math.round((midi - roundedMidi) * 100);
          
          setCurrentPitch(`${noteName}${octave}`);
          setCurrentFreq(Math.round(frequency * 10) / 10);
          setCentsError(errorCents);

          if (!isCountingInRef.current) {
            // Push sample to timeline
            userPitchTimeline.current.push({
              time: timeInSeconds,
              timeInBeats,
              frequency,
              midiNumber: midi
            });
          }
        } else {
          if (!isCountingInRef.current) {
            // Push silence sample
            userPitchTimeline.current.push({
              time: timeInSeconds,
              timeInBeats,
              frequency: 0,
              midiNumber: 0
            });
          }
        }

        // Throttle progress updates to 100ms
        if (!isCountingInRef.current && now - lastProgressUpdateRef.current > 100) {
          lastProgressUpdateRef.current = now;
          setRecordedSeconds(timeInSeconds);
          setSampleCount(userPitchTimeline.current.length);
        }
        
        animationFrameRef.current = requestAnimationFrame(updatePitch);
      };
      
      animationFrameRef.current = requestAnimationFrame(updatePitch);

    } catch (err: any) {
      console.error("Microphone access failed: ", err);
      
      const errName = err ? (err.name || "UnknownError") : "UnknownError";
      const errMsg = err ? (err.message || String(err)) : "No error message provided";
      
      console.error(`[Microphone Diagnostics] Access Failed: ${errName} - ${errMsg}`, {
        isSecureContext: isSecure,
        hasMediaDevices: hasMedia,
        hasGetUserMedia: hasGetUserMedia
      });

      setErrorMessage(`마이크 연결에 실패했습니다. 권한을 허용해 주세요. (에러: ${errName} - ${errMsg})`);
      setIsRecording(false);
      setShowWarning(false);
    }
  };

  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsRecording(false);
    setIsCountingIn(false);
    setCurrentPitch('---');
    setCurrentFreq(0);
    setCentsError(0);

    // Calculate grading results
    if (userPitchTimeline.current.length > 0 && answerTimeline.length > 0) {
      const result = calculateScoring(answerTimeline, userPitchTimeline.current, bpm);
      setScoredResult(result);
      onScored(result.notes); // Pass scores to parent for note colorizing
    }
  };

  const handleReset = () => {
    setScoredResult(null);
    setShowWarning(false);
    onScored(null); // Reset colors in sheet music
  };

  const handleBeat = (beatNumber: number) => {
    if (isCountingInRef.current) {
      countInBeatsRef.current += 1;
      setCountInBeat(beatNumber);
      
      if (countInBeatsRef.current > beats) {
        // Count-in finished!
        setIsCountingIn(false);
        isCountingInRef.current = false;
        // Reset recording start time so that actual user pitch timeline starts at 0s
        startTimeRef.current = performance.now();
        userPitchTimeline.current = [];
      }
    }
  };

  // Convert cents error (-50 to +50) to percentage for gauge display
  const getGaugeLeftPercentage = (cents: number) => {
    const clamped = Math.max(-50, Math.min(50, cents));
    return 50 + (clamped / 50) * 40; // -50cents -> 10%, +50cents -> 90%
  };

  return (
    <>
      {/* 1단계: 곡 들어보기 */}
      <section className="section step1-section" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="section-header-row">
          <h3>🎵 곡 들어보기</h3>
          <span className={`status-indicator ${isMrPlaying ? 'done' : 'pending'}`}>
            {isMrPlaying ? '● 재생 중' : '■ 정지됨'}
          </span>
        </div>
        <p style={{ fontSize: '0.95rem', color: '#636e72', margin: '0 0 10px 0' }}>
          먼저 예시 연주를 들어보세요.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            className="rec-btn rec-btn-listen" 
            onClick={handleListenExample} 
            disabled={isRecording}
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '12px',
              background: isRecording ? '#dfe6e9' : 'white',
              color: isRecording ? '#b2bec3' : 'var(--primary-color)',
              border: `1px solid ${isRecording ? '#b2bec3' : 'var(--primary-color)'}`,
              cursor: isRecording ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '160px',
              justifyContent: 'center',
            }}
            title={isRecording ? "채점 중에는 사용할 수 없습니다." : "반주 듣기"}
          >
            <span>{isMrPlaying ? '⏸ 반주 일시정지' : '▶ 반주 듣기'}</span>
          </button>
          {isRecording && (
            <span style={{ fontSize: '0.85rem', color: 'var(--error-color)', fontWeight: 500 }}>
              ⚠️ 채점 중에는 사용할 수 없습니다.
            </span>
          )}
        </div>
      </section>

      {/* 2단계: 연주하고 채점하기 */}
      {scoredResult ? (
        <section key="result" className="section recorder-container" style={{ background: 'rgba(99, 102, 241, 0.08)', border: '2px solid var(--primary-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-header-row">
            <h3>🎻 연주하고 채점하기</h3>
            <span className="status-indicator done">평가 완료</span>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#636e72', margin: '0' }}>
            반주를 들은 후 직접 연주해 보세요.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', margin: '15px 0' }}>
            {/* Total score ring */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'var(--primary-color)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.85 }}>총점</span>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{scoredResult.totalScore}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>점</span>
            </div>

            {/* Breakdown bars */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Pitch breakdown */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>음정 정확도 (70%)</span>
                  <strong>{scoredResult.pitchScore}점</strong>
                </div>
                <div style={{ height: '6px', background: '#dfe6e9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${scoredResult.pitchScore}%`, height: '100%', background: 'var(--success-color)' }} />
                </div>
              </div>
              {/* Timing breakdown */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>박자 정확도 (20%)</span>
                  <strong>{scoredResult.timingScore}점</strong>
                </div>
                <div style={{ height: '6px', background: '#dfe6e9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${scoredResult.timingScore}%`, height: '100%', background: '#0984e3' }} />
                </div>
              </div>
              {/* Duration breakdown */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>길이 정확도 (10%)</span>
                  <strong>{scoredResult.durationScore}점</strong>
                </div>
                <div style={{ height: '6px', background: '#dfe6e9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${scoredResult.durationScore}%`, height: '100%', background: '#fdcb6e' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics section */}
          {(() => {
            const stats = analyzePerformance(scoredResult.notes);
            return (
              <div style={{
                background: 'rgba(255, 255, 255, 0.75)',
                borderRadius: '12px',
                padding: '15px',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '100%',
                fontSize: '0.85rem'
              }}>
                <h4 style={{ color: 'var(--primary-color)', margin: '0 0 5px 0', fontSize: '0.95rem' }}>📊 연주 종합 분석 보고서 (Phase 4)</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f2f6' }}>
                    <div style={{ fontSize: '0.72rem', color: '#636e72' }}>가장 많이 틀린 음</div>
                    <strong style={{ fontSize: '0.95rem', color: stats.mostWrongNote !== '없음' ? 'var(--error-color)' : 'var(--success-color)' }}>
                      {stats.mostWrongNote}
                    </strong>
                  </div>
                  <div style={{ background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f2f6' }}>
                    <div style={{ fontSize: '0.72rem', color: '#636e72' }}>음정이 낮게 치우친 음</div>
                    <strong style={{ fontSize: '0.95rem', color: stats.mostFlatNote !== '없음' ? '#0984e3' : '#636e72' }}>
                      {stats.mostFlatNote}
                    </strong>
                  </div>
                  <div style={{ background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f2f6' }}>
                    <div style={{ fontSize: '0.72rem', color: '#636e72' }}>음정이 높게 치우친 음</div>
                    <strong style={{ fontSize: '0.95rem', color: stats.mostSharpNote !== '없음' ? '#e17055' : '#636e72' }}>
                      {stats.mostSharpNote}
                    </strong>
                  </div>
                  <div style={{ background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f2f6' }}>
                    <div style={{ fontSize: '0.72rem', color: '#636e72' }}>박자 불안정 구간 (마디)</div>
                    <strong style={{ fontSize: '0.8rem', color: '#d63031' }}>
                      {stats.lateMeasures.length > 0 || stats.earlyMeasures.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {stats.lateMeasures.length > 0 && <span>늦음: {stats.lateMeasures.join(', ')}마디</span>}
                          {stats.earlyMeasures.length > 0 && <span>빠름: {stats.earlyMeasures.join(', ')}마디</span>}
                        </div>
                      ) : (
                        '안정적임'
                      )}
                    </strong>
                  </div>
                </div>

                {stats.wrongNotesList.length > 0 && (
                  <div style={{ marginTop: '5px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#636e72', marginBottom: '4px' }}>⚠️ 틀린 음 상세 목록</div>
                    <div style={{ maxHeight: '80px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {stats.wrongNotesList.map((item, idx) => (
                        <div key={idx} style={{ padding: '4px 8px', background: 'rgba(214, 48, 49, 0.05)', borderLeft: '3px solid var(--error-color)', borderRadius: '0 4px 4px 0', fontSize: '0.75rem', color: '#c0392b' }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Note-by-note analysis */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '15px', border: '1px solid #dfe6e9', maxHeight: '200px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-color)' }}>세부 음표 분석</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #dfe6e9', color: '#636e72' }}>
                  <th style={{ padding: '6px 0' }}>마디/순서</th>
                  <th>정답 음</th>
                  <th>연주 음</th>
                  <th>음정 오차</th>
                  <th>결과</th>
                  <th>교육용 피드백</th>
                </tr>
              </thead>
              <tbody>
                {scoredResult.notes.map((note, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f2f6' }}>
                    <td style={{ padding: '8px 0', color: '#636e72' }}>{note.measureNumber}마디-{note.noteIndex}번째</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{note.expectedNote}</td>
                    <td style={{ fontWeight: 600, color: note.detectedNote === 'Wrong' ? 'var(--error-color)' : '#2d3436' }}>
                      {note.detectedNote}
                    </td>
                    <td style={{
                      color: note.centsError === 0 && note.detectedNote === 'Wrong' ? 'var(--error-color)' :
                             Math.abs(note.centsError) <= 30 ? 'var(--success-color)' :
                             Math.abs(note.centsError) <= 50 ? '#0984e3' : 'var(--error-color)'
                    }}>
                      {note.detectedNote === 'Wrong' ? 'N/A' : (note.centsError >= 0 ? `+${note.centsError}c` : `${note.centsError}c`)}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: 'white',
                        background: note.resultStatus === 'Excellent' ? 'var(--success-color)' :
                                    note.resultStatus === 'Good' ? '#0984e3' :
                                    note.resultStatus === 'Almost' ? '#fdcb6e' : 'var(--error-color)'
                      }}>
                        {note.resultStatus}
                      </span>
                    </td>
                    <td style={{ color: '#555', fontStyle: 'italic' }}>
                      {note.feedbackMessage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
            <button className="rec-btn rec-btn-start" onClick={handleReset} style={{ width: '100%', maxWidth: '300px', height: '50px', justifyContent: 'center' }}>
              <span>🔄 다시 연주하기</span>
            </button>
          </div>
        </section>
      ) : (
        <section key="recorder" className="section recorder-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-header-row">
            <h3>🎻 연주하고 채점하기</h3>
            <span className={`status-indicator ${isRecording ? 'done' : 'pending'}`}>
              {isRecording ? (isCountingIn ? '● 카운트인 대기 중' : '● 실시간 분석 중') : '■ 준비 완료'}
            </span>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#636e72', margin: '0' }}>
            반주를 들은 후 직접 연주해 보세요.
          </p>

          {showWarning && (
            <div className="recorder-warning">
              <span>🎧 <strong>안내:</strong> 정확한 채점을 위해 이어폰을 착용해 주세요.</span>
              <br />
              <span>채점 모드에서는 예시 음원(MR)이 자동으로 정지되고 메트로놈은 무음으로 작동합니다.</span>
            </div>
          )}

          {errorMessage && (
            <div className="recorder-warning" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)', background: 'rgba(214, 48, 49, 0.05)' }}>
              <span>⚠️ <strong>오류:</strong> {errorMessage}</span>
            </div>
          )}

          {/* 1. 채점 버튼 및 시각 메트로놈 가로 배치 영역 */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            width: '100%',
            marginTop: '5px'
          }}>
            {/* Left: [채점 시작] / [채점 중지] 버튼 */}
            <div style={{ flex: '1 1 200px', maxWidth: '300px' }}>
              {!isRecording ? (
                <button className="rec-btn rec-btn-start" onClick={startRecording} style={{ width: '100%', height: '50px', justifyContent: 'center', margin: 0 }}>
                  <span>🎙️ 채점 시작</span>
                </button>
              ) : (
                <button className="rec-btn rec-btn-stop" onClick={stopRecording} style={{ width: '100%', height: '50px', justifyContent: 'center', margin: 0 }}>
                  <span>⏹️ 채점 중지</span>
                </button>
              )}
            </div>

            {/* Right: 시각 메트로놈 (빨간 불빛 + BPM) */}
            <div style={{
              flex: '0 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1e272e',
              borderRadius: '12px',
              padding: '10px 20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxSizing: 'border-box',
              minHeight: '50px',
              minWidth: '140px'
            }}>
              <VisualMetronome
                bpm={bpm}
                beats={beats}
                isPlaying={isRecording}
                onBeat={handleBeat}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#636e72', fontWeight: 500, marginTop: '-5px', marginBottom: '5px' }}>
            ℹ️ 반주가 자동으로 중지되고 채점이 시작됩니다.
          </div>

          {/* 2. BPM 설정 영역 */}
          <div style={{ width: '100%' }}>
            <BpmControl
              value={bpm}
              onChange={(newBpm) => setBpm(newBpm)}
              disabled={isRecording}
            />
          </div>

          {/* 4. 카운트인 오버레이 안내 */}
          {isRecording && isCountingIn && (
            <div style={{
              background: 'rgba(0, 206, 201, 0.08)',
              border: '2px solid #00cec9',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0, 206, 201, 0.15)',
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0097a7', marginBottom: '6px' }}>
                ⏳ 준비하세요! 1마디 카운트인 진행 중 ({beats}/{beatType} 박자)
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#00cec9', lineHeight: 1 }}>
                {countInBeat}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#636e72', marginTop: '6px' }}>
                {beats}박자 후 연주를 시작하세요!
              </div>
            </div>
          )}

          {/* 5. 실시간 수집 통계 패널 */}
          {isRecording && !isCountingIn && (
            <div style={{
              background: 'rgba(46, 204, 113, 0.06)',
              border: '1.5px solid var(--success-color)',
              borderRadius: '16px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(46, 204, 113, 0.03)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.5px' }}>박자표</div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{beats}/{beatType}</strong>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.5px' }}>녹음 시간</div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--success-color)' }}>{recordedSeconds.toFixed(1)}초</strong>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#636e72', textTransform: 'uppercase', letterSpacing: '0.5px' }}>수집된 음정 샘플</div>
                <strong style={{ fontSize: '1.1rem', color: '#2980b9' }}>{sampleCount}개</strong>
              </div>
            </div>
          )}

          {/* 6. Answer Timeline Preview */}
          <div className="timeline-preview">
            <h4>정답 악보 타임라인 (첫 4마디 MVP)</h4>
            {answerTimeline.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>악보 분석 중...</p>
            ) : (
              <div className="timeline-notes-list">
                {answerTimeline.map((note, idx) => (
                  <div key={idx} className="timeline-note-badge">
                    <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{note.noteName}{note.octave}</div>
                    <div style={{ fontSize: '0.7rem', color: '#7f8c8d' }}>
                      {note.measureNumber}마디 ({note.duration}박)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Real-time Pitch Detection Display */}
          <div className="pitch-display-card">
            <div className="pitch-display-grid">
              <div className="pitch-metric">
                <span className="pitch-label">감지된 음정</span>
                <span className="pitch-value" style={{ color: currentPitch === '---' ? '#b2bec3' : '#00cec9' }}>
                  {currentPitch}
                </span>
              </div>
              <div className="pitch-metric">
                <span className="pitch-label">실시간 주파수</span>
                <span className="pitch-value">
                  {currentFreq > 0 ? `${currentFreq} Hz` : '---'}
                </span>
              </div>
              <div className="pitch-metric">
                <span className="pitch-label">음정 편차 (Cents)</span>
                <span className="pitch-value cents" style={{ 
                  color: currentFreq === 0 ? '#b2bec3' : 
                         Math.abs(centsError) <= 30 ? 'var(--success-color)' : 
                         Math.abs(centsError) <= 50 ? '#81ecec' : 
                         Math.abs(centsError) <= 80 ? '#ffeaa7' : 'var(--error-color)'
                }}>
                  {currentFreq > 0 ? (centsError >= 0 ? `+${centsError}` : centsError) : '0'}
                </span>
              </div>
            </div>

            {/* Pitch Cents Deviation Gauge */}
            <div className="pitch-gauge-container">
              <div 
                className="pitch-gauge-marker"
                style={{ 
                  left: `${currentFreq > 0 ? getGaugeLeftPercentage(centsError) : 50}%`,
                  background: currentFreq === 0 ? '#b2bec3' : 
                              Math.abs(centsError) <= 30 ? 'var(--success-color)' : 
                              Math.abs(centsError) <= 80 ? '#ffeaa7' : 'var(--error-color)'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.65rem', color: '#b2bec3', marginTop: '6px' }}>
              <span>낮음 (-50c)</span>
              <span>정음 (0)</span>
              <span>높음 (+50c)</span>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default PracticeRecorder;
