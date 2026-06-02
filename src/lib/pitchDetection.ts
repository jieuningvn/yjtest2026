/**
 * Detects the pitch of a time-domain audio buffer (Float32Array).
 * Returns [frequency, clarity] where frequency is in Hz, and clarity is a confidence score between 0 and 1.
 */
export function detectPitch(buffer: Float32Array, sampleRate: number): [number, number] {
  const size = buffer.length;
  
  // 1. Calculate root-mean-square (RMS) to check if there is enough signal
  let sumOfSquares = 0;
  for (let i = 0; i < size; i++) {
    sumOfSquares += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumOfSquares / size);
  
  // If the volume is too quiet (noise floor), return no pitch
  if (rms < 0.012) {
    return [0, 0];
  }
  
  // 2. Center clipping to improve fundamental frequency detection
  // This helps eliminate higher harmonics that might confuse the autocorrelation
  const clipped = new Float32Array(size);
  let maxVal = 0;
  for (let i = 0; i < size; i++) {
    const val = Math.abs(buffer[i]);
    if (val > maxVal) maxVal = val;
  }
  
  const clipThreshold = maxVal * 0.3;
  for (let i = 0; i < size; i++) {
    if (Math.abs(buffer[i]) > clipThreshold) {
      clipped[i] = buffer[i] > 0 ? buffer[i] - clipThreshold : buffer[i] + clipThreshold;
    } else {
      clipped[i] = 0;
    }
  }
  
  // 3. Define lag range for violin (G3 is ~196 Hz, up to E6 or above)
  // Let's set the search range to 130 Hz - 1500 Hz
  const minLag = Math.floor(sampleRate / 1500);
  const maxLag = Math.ceil(sampleRate / 130);
  
  if (maxLag >= size) {
    return [0, 0];
  }
  
  const r = new Float32Array(maxLag + 1);
  
  // 4. Perform autocorrelation
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < size - lag; i++) {
      sum += clipped[i] * clipped[i + lag];
    }
    r[lag] = sum;
  }
  
  // 5. Find the absolute maximum correlation peak in the range
  let maxR = -1;
  let bestLag = -1;
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (r[lag] > maxR) {
      maxR = r[lag];
      bestLag = lag;
    }
  }
  
  // 6. Find the first peak that is reasonably high (above 85% of maxR)
  // This prevents choosing subharmonics (octave-below errors)
  let peakLag = bestLag;
  const threshold = maxR * 0.85;
  for (let lag = minLag + 1; lag <= maxLag - 1; lag++) {
    if (r[lag] > r[lag - 1] && r[lag] > r[lag + 1]) {
      if (r[lag] > threshold) {
        peakLag = lag;
        break;
      }
    }
  }
  
  if (peakLag > minLag && peakLag < maxLag) {
    // 7. Parabolic interpolation for fine-grained frequency resolution
    const alpha = r[peakLag - 1];
    const beta = r[peakLag];
    const gamma = r[peakLag + 1];
    
    const denom = alpha - 2 * beta + gamma;
    if (Math.abs(denom) > 1e-5) {
      const p = 0.5 * (alpha - gamma) / denom;
      const interpolatedLag = peakLag + p;
      const frequency = sampleRate / interpolatedLag;
      
      // Calculate normalized clarity
      let sumZero = 0;
      for (let i = 0; i < size; i++) {
        sumZero += clipped[i] * clipped[i];
      }
      const clarity = sumZero > 0 ? r[peakLag] / sumZero : 0;
      
      if (frequency >= 130 && frequency <= 1500 && clarity > 0.45) {
        return [frequency, clarity];
      }
    }
  }
  
  return [0, 0];
}
