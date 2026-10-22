"use client";

import { useRef, useEffect, useMemo, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { WebGLErrorBoundary, WebGLFallback } from "@/components/ui/webgl-error-boundary";

type PatternShape = "Checks" | "Stripes" | "Edge";
const PatternShapes: Record<PatternShape, number> = { Checks: 0, Stripes: 1, Edge: 2 };

interface PresetParams {
  color1: string;
  color2: string;
  color3: string;
  rotation: number;
  proportion: number;
  scale: number;
  speed: number;
  distortion: number;
  swirl: number;
  swirlIterations: number;
  softness: number;
  offset: number;
  shape: PatternShape;
  shapeSize: number;
}

type PresetName = "Aurora" | "Oceanic" | "Amber" | "Toxic" | "Ghost" | "Noir";

const presets: Record<PresetName, PresetParams> = {
  Aurora: { color1: "#0a001a", color2: "#1a0b2e", color3: "#f20089", rotation: -45, proportion: 60, scale: 0.6, speed: 15, distortion: 40, swirl: 80, swirlIterations: 10, softness: 100, offset: 200, shape: "Edge", shapeSize: 50 },
  Oceanic: { color1: "#000814", color2: "#001d3d", color3: "#00b4d8", rotation: 0, proportion: 70, scale: 0.4, speed: 10, distortion: 15, swirl: 50, swirlIterations: 12, softness: 80, offset: 150, shape: "Checks", shapeSize: 30 },
  Amber: { color1: "#140c00", color2: "#4a2500", color3: "#f57c00", rotation: 120, proportion: 80, scale: 0.8, speed: 20, distortion: 25, swirl: 60, swirlIterations: 8, softness: 90, offset: 500, shape: "Stripes", shapeSize: 40 },
  Toxic: { color1: "#050d05", color2: "#0a240a", color3: "#39ff14", rotation: -90, proportion: 55, scale: 0.5, speed: 25, distortion: 60, swirl: 100, swirlIterations: 15, softness: 70, offset: -100, shape: "Edge", shapeSize: 20 },
  Ghost: { color1: "#0a0a0a", color2: "#1c1c1c", color3: "#a3a3a3", rotation: 45, proportion: 50, scale: 0.3, speed: 8, distortion: 10, swirl: 30, swirlIterations: 5, softness: 100, offset: 0, shape: "Checks", shapeSize: 60 },
  // NOIR THREADS: Ghost-derived, darker silver so type and photography stay dominant.
  Noir: { color1: "#070708", color2: "#161618", color3: "#5d5e63", rotation: 45, proportion: 46, scale: 0.34, speed: 7, distortion: 12, swirl: 34, swirlIterations: 6, softness: 100, offset: 40, shape: "Checks", shapeSize: 55 },
};

export interface CustomConfig {
  preset: "custom";
  color1: string;
  color2: string;
  color3: string;
  rotation?: number;
  proportion?: number;
  scale?: number;
  speed?: number;
  distortion?: number;
  swirl?: number;
  swirlIterations?: number;
  softness?: number;
  offset?: number;
  shape?: PatternShape;
  shapeSize?: number;
}
export interface PresetConfig {
  preset: PresetName;
  speed?: number;
}
export type GradientConfig = CustomConfig | PresetConfig;

export interface NoiseConfig {
  opacity: number;
  scale?: number;
}

export interface AnimatedGradientProps {
  config?: GradientConfig;
  noise?: NoiseConfig;
  radius?: string;
  style?: CSSProperties;
  className?: string;
  /** Cap on devicePixelRatio. Lower = cheaper on phones. */
  maxPixelRatio?: number;
  /** Let the light field bend and brighten around a pointer without intercepting page input. */
  interactive?: boolean;
}

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function AnimatedGradient({
  config = { preset: "Noir" },
  noise,
  radius = "0px",
  style,
  className,
  maxPixelRatio = 1.5,
  interactive = true,
}: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const params = useMemo((): PresetParams => {
    if (config.preset === "custom") {
      return {
        color1: config.color1,
        color2: config.color2,
        color3: config.color3,
        rotation: config.rotation ?? 0,
        proportion: config.proportion ?? 35,
        scale: config.scale ?? 1,
        speed: config.speed ?? 25,
        distortion: config.distortion ?? 12,
        swirl: config.swirl ?? 80,
        swirlIterations: config.swirlIterations ?? 10,
        softness: config.softness ?? 100,
        offset: config.offset ?? 0,
        shape: config.shape ?? "Checks",
        shapeSize: config.shapeSize ?? 10,
      };
    }
    const preset = presets[config.preset] || presets.Noir;
    return { ...preset, speed: config.speed ?? preset.speed };
  }, [config]);

  useEffect(() => {
    if (hasWebGLError) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !isMounted) return;

    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) {
      setHasWebGLError(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      if (program) gl.deleteProgram(program);
      setHasWebGLError(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      setHasWebGLError(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      setHasWebGLError(true);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const names = [
      "u_time", "u_resolution", "u_pixelRatio", "u_scale", "u_rotation", "u_color1", "u_color2", "u_color3",
      "u_proportion", "u_softness", "u_shape", "u_shapeScale", "u_distortion", "u_swirl", "u_swirlIterations",
      "u_pointer", "u_pointerStrength",
    ] as const;
    const u = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)])) as Record<
      (typeof names)[number],
      WebGLUniformLocation | null
    >;

    let pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    const resize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
      canvas.width = Math.round(w * pixelRatio);
      canvas.height = Math.round(h * pixelRatio);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const c1 = hexToRgba(params.color1);
    const c2 = hexToRgba(params.color2);
    const c3 = hexToRgba(params.color3);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionPreference.matches;
    const start = performance.now();
    let frame = 0;
    let running = false;
    let inView = true;
    let pointerX = -1;
    let pointerY = -1;
    let targetPointerX = -1;
    let targetPointerY = -1;
    let pointerStrength = 0;
    let targetPointerStrength = 0;

    const draw = (time: number) => {
      const elapsed = reduced ? 0 : (time - start) / 1000;
      const speed = (params.speed / 100) * 5;
      gl.uniform1f(u.u_time, elapsed * speed + params.offset * 0.01);
      gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(u.u_pixelRatio, pixelRatio);
      gl.uniform1f(u.u_scale, params.scale);
      gl.uniform1f(u.u_rotation, (params.rotation * Math.PI) / 180);
      gl.uniform4f(u.u_color1, c1[0], c1[1], c1[2], c1[3]);
      gl.uniform4f(u.u_color2, c2[0], c2[1], c2[2], c2[3]);
      gl.uniform4f(u.u_color3, c3[0], c3[1], c3[2], c3[3]);
      gl.uniform1f(u.u_proportion, params.proportion / 100);
      gl.uniform1f(u.u_softness, params.softness / 100);
      gl.uniform1f(u.u_shape, PatternShapes[params.shape]);
      gl.uniform1f(u.u_shapeScale, params.shapeSize / 100);
      gl.uniform1f(u.u_distortion, params.distortion / 50);
      gl.uniform1f(u.u_swirl, params.swirl / 100);
      gl.uniform1f(u.u_swirlIterations, params.swirl === 0 ? 0 : params.swirlIterations);
      pointerX += (targetPointerX - pointerX) * 0.11;
      pointerY += (targetPointerY - pointerY) * 0.11;
      pointerStrength += (targetPointerStrength - pointerStrength) * 0.09;
      gl.uniform2f(u.u_pointer, pointerX, pointerY);
      gl.uniform1f(u.u_pointerStrength, reduced ? 0 : pointerStrength);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const loop = (t: number) => {
      draw(t);
      frame = requestAnimationFrame(loop);
    };
    const play = () => {
      if (reduced || running || !inView || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    resize();
    draw(performance.now());
    play();

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(performance.now());
    });
    ro.observe(container);
    // Pause the loop when scrolled out of view or the tab is hidden (one loop at a time).
    const io = new IntersectionObserver(([e]) => {
      inView = e?.isIntersecting ?? true;
      if (inView) play();
      else pause();
    });
    io.observe(container);
    const onVis = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVis);
    const onPointerMove = (event: PointerEvent) => {
      if (!interactive || reduced || event.pointerType === "touch") return;
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        targetPointerStrength = 0;
        return;
      }
      targetPointerX = x;
      targetPointerY = y;
      targetPointerStrength = 1;
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) targetPointerStrength = 0;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!interactive || reduced || event.pointerType !== "touch") return;
      const rect = container.getBoundingClientRect();
      targetPointerX = (event.clientX - rect.left) / Math.max(1, rect.width);
      targetPointerY = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);
      targetPointerStrength = 0.85;
    };
    if (interactive) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerout", onPointerOut, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
    }
    const onLost = (e: Event) => {
      e.preventDefault();
      pause();
      setHasWebGLError(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      if (reduced) {
        targetPointerStrength = 0;
        pause();
        draw(performance.now());
      } else {
        play();
      }
    };
    motionPreference.addEventListener("change", onMotionPreferenceChange);

    return () => {
      pause();
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      if (interactive) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerout", onPointerOut);
        window.removeEventListener("pointerdown", onPointerDown);
      }
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [hasWebGLError, isMounted, params, maxPixelRatio, interactive]);

  if (hasWebGLError) {
    return <WebGLFallback className={cn("absolute inset-0 overflow-hidden", className)} />;
  }

  return (
    <WebGLErrorBoundary fallback={<WebGLFallback className={cn("absolute inset-0 overflow-hidden", className)} />}>
      <div
        ref={containerRef}
        aria-hidden="true"
        className={cn("absolute inset-0 overflow-hidden", className)}
        style={{ borderRadius: radius, ...style }}
      >
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
        {noise && noise.opacity > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: GRAIN,
              backgroundSize: (noise.scale ?? 1) * 160,
              backgroundRepeat: "repeat",
              opacity: noise.opacity / 2,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </WebGLErrorBoundary>
  );
}

function hexToRgba(hex: string): [number, number, number, number] {
  let r = 0, g = 0, b = 0, a = 1;
  if (hex.startsWith("rgba(")) {
    const p = hex.slice(5, -1).split(",");
    r = parseInt(p[0] ?? "0") / 255; g = parseInt(p[1] ?? "0") / 255; b = parseInt(p[2] ?? "0") / 255; a = parseFloat(p[3] ?? "1");
  } else if (hex.startsWith("rgb(")) {
    const p = hex.slice(4, -1).split(",");
    r = parseInt(p[0] ?? "0") / 255; g = parseInt(p[1] ?? "0") / 255; b = parseInt(p[2] ?? "0") / 255;
  } else if (hex.startsWith("#")) {
    const c = hex.slice(1);
    if (c.length === 3) {
      r = parseInt(c.charAt(0) + c.charAt(0), 16) / 255;
      g = parseInt(c.charAt(1) + c.charAt(1), 16) / 255;
      b = parseInt(c.charAt(2) + c.charAt(2), 16) / 255;
    } else if (c.length >= 6) {
      r = parseInt(c.slice(0, 2), 16) / 255;
      g = parseInt(c.slice(2, 4), 16) / 255;
      b = parseInt(c.slice(4, 6), 16) / 255;
      if (c.length === 8) a = parseInt(c.slice(6, 8), 16) / 255;
    }
  }
  return [r, g, b, a];
}

const VERTEX_SHADER = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;
uniform vec2 u_pointer;
uniform float u_pointerStrength;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {
    vec3 color1 = c1.rgb * c1.a;
    vec3 color2 = c2.rgb * c2.a;
    vec3 color3 = c3.rgb * c3.a;

    float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);
    float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);

    vec3 blended_color_2 = mix(color1, color2, r1);
    float blended_opacity_2 = mix(c1.a, c2.a, r1);

    vec3 c = mix(blended_color_2, color3, r2);
    float o = mix(blended_opacity_2, c3.a, r2);
    return vec4(c, o);
}

void main() {
    vec2 rawUv = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv = rawUv;
    float aspect = u_resolution.x / max(1.0, u_resolution.y);
    vec2 pointerDelta = rawUv - u_pointer;
    pointerDelta.x *= aspect;
    float pointerDistance = length(pointerDelta);
    float pointerFalloff = exp(-pointerDistance * 17.0) * u_pointerStrength;
    vec2 pointerDirection = normalize(pointerDelta + vec2(0.0001));
    // A soft local displacement makes the monochrome field feel tactile under the pointer.
    uv += vec2(pointerDirection.x / aspect, pointerDirection.y) * pointerFalloff * 0.022;
    float t = .5 * u_time;
    float noise_scale = .0005 + .006 * u_scale;

    uv -= .5;
    uv *= (noise_scale * u_resolution);
    uv = rotate(uv, u_rotation * .5 * PI);
    uv /= u_pixelRatio;
    uv += .5;

    float n1 = noise(uv * 1. + t);
    float n2 = noise(uv * 2. - t);
    float angle = n1 * TWO_PI;
    uv.x += 4. * u_distortion * n2 * cos(angle);
    uv.y += 4. * u_distortion * n2 * sin(angle);

    float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
    for (float i = 1.; i <= iterations_number; i++) {
        uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
        uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);
    }

    float proportion = clamp(u_proportion, 0., 1.);
    float shape = 0.;
    float mixer = 0.;
    if (u_shape < .5) {
      vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);
      shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else if (u_shape < 1.5) {
      vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);
      float f = fract(stripes_shape_uv.y);
      shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else {
      float sh = 1. - uv.y;
      sh -= .5;
      sh /= (noise_scale * u_resolution.y);
      sh += .5;
      float shape_scaling = .2 * (1. - u_shapeScale);
      shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));
      mixer = shape;
    }

    vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);
    float pointerHalo = exp(-pointerDistance * 10.0) * u_pointerStrength;
    float ringRadius = 0.065 + 0.009 * sin(u_time * 1.6);
    float pointerRing = exp(-pow((pointerDistance - ringRadius) / 0.014, 2.0)) * u_pointerStrength;
    vec3 silverLight = vec3(0.72, 0.73, 0.76);
    color_mix.rgb = mix(color_mix.rgb, silverLight, clamp(pointerHalo * 0.25 + pointerRing * 0.17, 0.0, 0.3));
    fragColor = vec4(color_mix.rgb, color_mix.a);
}
`;
