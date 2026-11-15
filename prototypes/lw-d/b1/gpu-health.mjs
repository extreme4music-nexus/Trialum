/** B1-R2: bounded Android WebGL resolution and deterministic framebuffer health.
 * Pure functions, shared by runtime and Node CI. No gameplay dependencies.
 */
export const B1_QUALITY_SCALE=Object.freeze({eco:1,balanced:1.35,high:1.7});
export const B1_MAX_PIXELS=1_600_000;
export const B1_MAX_SIDE=1920;

export function planDrawingBuffer(cssWidth,cssHeight,devicePixelRatio,quality,glMaxSide=4096) {
  if (![cssWidth,cssHeight].every(n=>Number.isFinite(n)&&n>=2)) return null;
  const width=Math.floor(cssWidth),height=Math.floor(cssHeight);
  const tier=B1_QUALITY_SCALE[quality]||B1_QUALITY_SCALE.balanced;
  const device=Number.isFinite(devicePixelRatio)&&devicePixelRatio>0?devicePixelRatio:1;
  const sideLimit=Math.min(B1_MAX_SIDE,
    Number.isFinite(glMaxSide)&&glMaxSide>=2?glMaxSide:B1_MAX_SIDE);
  const scale=Math.min(tier,device,sideLimit/width,sideLimit/height,
    Math.sqrt(B1_MAX_PIXELS/(width*height)));
  if (!Number.isFinite(scale)||scale<.25) return null;
  const drawWidth=Math.max(2,Math.floor(width*scale));
  const drawHeight=Math.max(2,Math.floor(height*scale));
  return {cssWidth:width,cssHeight:height,drawWidth,drawHeight,
    effectiveScale:Math.min(drawWidth/width,drawHeight/height),
    pixels:drawWidth*drawHeight,quality};
}

/** Default canvas clear color is blue, never pure black. Four near-black
 * framebuffer samples after renderer.render indicate a truly blank frame.
 * Null means readback was unavailable: NEVER mistake it for a black frame.
 */
export function classifyPixelProbe(samples) {
  if (!Array.isArray(samples)||samples.length<3 ||
      samples.some(v=>!v||v.length<3||!Array.from(v).slice(0,3).every(Number.isFinite)))
    return "unavailable";
  return samples.some(v=>Number(v[0])+Number(v[1])+Number(v[2])>18)?"visible":"black";
}
