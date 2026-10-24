// The Heart of Noticing — living stream.
// Brings the forest-stream photo to life inside its arch window with WebGL: flowing water,
// a little cascade, ferns swaying, dappled light, drifting pollen, and ripples where you tap.
// It only renders while the window is on screen, loads its textures only when the window is
// near, and leaves the still photo in place when WebGL is unavailable or motion is reduced.
(function () {
  "use strict"

  var windows = document.querySelectorAll("[data-living-stream]")
  if (!windows.length) return
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  // Image is 941 x 1672. Per-row stream data (256 rows): flow centre x, perspective scale, distance upstream.
  var IMG_W = 941, IMG_H = 1672
  var ROWS = [0.648,10.21657,16.64938,0.648,10.21657,16.52174,0.648,10.21657,16.3941,0.648,10.21657,16.26647,0.648,10.21657,16.13883,0.648,10.21657,16.01119,0.648,10.21657,15.88355,0.648,10.21657,15.75591,0.648,10.21657,15.62827,0.648,10.21657,15.50063,0.648,10.21657,15.37299,0.648,10.21657,15.24535,0.648,10.21657,15.11771,0.648,10.21657,14.99007,0.648,10.21657,14.86243,0.648,10.21657,14.73479,0.648,10.21657,14.60715,0.648,10.21657,14.47952,0.648,10.21657,14.35188,0.648,10.21657,14.22424,0.648,10.21657,14.0966,0.648,10.21657,13.96896,0.648,10.21657,13.84132,0.648,10.21657,13.71368,0.648,10.21657,13.58604,0.648,10.21657,13.4584,0.648,10.21657,13.33076,0.648,10.21657,13.20312,0.648,10.21657,13.07548,0.648,10.21657,12.94784,0.648,10.21657,12.8202,0.648,10.21657,12.69257,0.648,10.21657,12.56493,0.648,10.21657,12.43729,0.648,10.21657,12.30965,0.648,10.21657,12.18201,0.648,10.21657,12.05437,0.648,10.21657,11.92673,0.648,10.21657,11.79909,0.648,10.21657,11.67145,0.648,10.21657,11.54381,0.648,10.21657,11.41617,0.648,10.21657,11.28853,0.648,10.21657,11.16089,0.648,10.21657,11.03325,0.648,10.21657,10.90562,0.648,10.21657,10.77798,0.648,10.21657,10.65034,0.648,10.21657,10.5227,0.648,10.21657,10.39506,0.648,10.21657,10.26742,0.648,10.21657,10.13978,0.648,10.21657,10.01214,0.648,10.21657,9.8845,0.648,10.21657,9.75686,0.648,10.21657,9.62922,0.648,10.21657,9.50158,0.648,10.21657,9.37394,0.648,10.21657,9.2463,0.648,10.21657,9.11867,0.648,10.21657,8.99103,0.648,10.21657,8.86339,0.648,10.21657,8.73575,0.648,10.21657,8.60811,0.648,10.21657,8.48047,0.648,10.21657,8.35283,0.648,10.21657,8.22519,0.648,10.21657,8.09755,0.648,10.21657,7.96991,0.648,10.21657,7.84227,0.648,10.21657,7.71463,0.648,10.21657,7.58699,0.648,10.21657,7.45935,0.648,10.21657,7.33172,0.648,10.21657,7.20408,0.648,10.21657,7.07644,0.648,10.21657,6.9488,0.648,9.86011,6.82282,0.648,9.47507,6.70169,0.648,9.10841,6.58527,0.648,8.75788,6.47335,0.648,8.42187,6.36572,0.648,8.09937,6.26222,0.648,7.78993,6.16269,0.648,7.49348,6.06694,0.648,7.21034,5.97484,0.648,6.94089,5.88619,0.648,6.68577,5.80085,0.648,6.44536,5.7186,0.648,6.22022,5.63929,0.648,6.01046,5.5627,0.648,5.81628,5.48866,0.648,5.63741,5.41695,0.648,5.4736,5.3474,0.648,5.32427,5.27982,0.648,5.18877,5.21404,0.648,5.06625,5.14987,0.648,4.95577,5.08717,0.648,4.85636,5.0258,0.648,4.76694,4.96561,0.648,4.68647,4.90649,0.648,4.61383,4.84833,0.648,4.54805,4.79104,0.648,4.48807,4.73454,0.648,4.43304,4.67877,0.648,4.3821,4.62366,0.648,4.3346,4.56916,0.648,4.28996,4.51525,0.648,4.24781,4.46188,0.648,4.20787,4.40902,0.648,4.17004,4.35665,0.648,4.13433,4.30475,0.648,4.10085,4.25327,0.648,4.06976,4.20221,0.648,4.04125,4.15152,0.648,4.0155,4.10117,0.648,3.9926,4.05112,0.648,3.9726,4.00135,0.648,3.95543,3.95181,0.648,3.94092,3.90248,0.648,3.92874,3.85331,0.648,3.9185,3.80428,0.648,3.90966,3.75537,0.648,3.90163,3.70657,0.648,3.89375,3.65787,0.648,3.88534,3.60927,0.648,3.87574,3.56078,0.648,3.86431,3.51241,0.648,3.85052,3.4642,0.648,3.83395,3.41618,0.648,3.81428,3.36839,0.648,3.79139,3.32085,0.648,3.76524,3.27362,0.648,3.73599,3.22673,0.648,3.70386,3.18022,0.648,3.66919,3.13413,0.648,3.63233,3.08848,0.648,3.59369,3.0433,0.648,3.55364,2.99862,0.648,3.51256,2.95444,0.648,3.47074,2.91077,0.648,3.42845,2.86764,0.648,3.38592,2.82503,0.648,3.3433,2.78295,0.648,3.30072,2.74141,0.648,3.25826,2.7004,0.648,3.21599,2.65991,0.648,3.17391,2.61996,0.648,3.13204,2.58053,0.648,3.09037,2.54162,0.648,3.04885,2.50323,0.648,3.00748,2.46536,0.648,2.96621,2.428,0.648,2.92505,2.39116,0.648,2.88399,2.35483,0.648,2.84308,2.31902,0.648,2.80239,2.28372,0.648,2.76203,2.24892,0.648,2.72214,2.21462,0.648,2.68288,2.18082,0.648,2.64444,2.14751,0.648,2.60699,2.11467,0.648,2.5707,2.08229,0.648,2.53571,2.05036,0.648,2.50215,2.01886,0.648,2.47008,1.98777,0.648,2.43953,1.95708,0.648,2.41047,1.92675,0.648,2.38288,1.89679,0.648,2.35665,1.86716,0.648,2.33167,1.83785,0.648,2.30783,1.80885,0.648,2.28499,1.78014,0.648,2.26301,1.7517,0.648,2.24177,1.72355,0.648,2.22117,1.69565,0.648,2.20112,1.668,0.648,2.18155,1.64061,0.648,2.16241,1.61346,0.648,2.14367,1.58654,0.648,2.12531,1.55986,0.648,2.10735,1.5334,0.648,2.08979,1.50716,0.648,2.07264,1.48115,0.648,2.05592,1.45534,0.648,2.03962,1.42974,0.648,2.02377,1.40434,0.648,2.00834,1.37914,0.648,1.99334,1.35413,0.648,1.97873,1.32931,0.648,1.9645,1.30466,0.648,1.95061,1.28019,0.648,1.93704,1.25589,0.648,1.92374,1.23176,0.648,1.91071,1.2078,0.648,1.8979,1.184,0.648,1.88531,1.16035,0.648,1.87293,1.13686,0.648,1.86073,1.11353,0.648,1.84874,1.09035,0.648,1.83695,1.06731,0.648,1.82536,1.04442,0.648,1.814,1.02168,0.648,1.80287,0.99908,0.648,1.79197,0.97661,0.648,1.7813,0.95428,0.648,1.77087,0.93208,0.648,1.76067,0.91001,0.648,1.75066,0.88807,0.648,1.74083,0.86625,0.648,1.73115,0.84455,0.648,1.72159,0.82297,0.648,1.7121,0.80151,0.648,1.70266,0.78017,0.648,1.69324,0.75895,0.648,1.68379,0.73785,0.648,1.67431,0.71686,0.648,1.66476,0.69599,0.648,1.65513,0.67525,0.648,1.64541,0.65462,0.648,1.63559,0.63411,0.648,1.62565,0.61373,0.648,1.61561,0.59348,0.648,1.60545,0.57335,0.648,1.59517,0.55334,0.648,1.58477,0.53347,0.648,1.57424,0.51372,0.648,1.56359,0.49411,0.648,1.55281,0.47464,0.648,1.54189,0.45529,0.648,1.53083,0.43609,0.648,1.51962,0.41702,0.648,1.50825,0.3981,0.648,1.49671,0.37931,0.648,1.485,0.36068,0.648,1.47311,0.34219,0.648,1.46104,0.32385,0.648,1.44879,0.30566,0.648,1.43638,0.28762,0.648,1.4238,0.26975,0.648,1.41109,0.25202,0.648,1.39824,0.23446,0.648,1.38529,0.21706,0.648,1.37225,0.19982,0.648,1.35915,0.18275,0.648,1.34604,0.16584,0.648,1.33294,0.14909,0.648,1.31991,0.13251,0.648,1.30704,0.11609,0.648,1.29439,0.09982,0.648,1.28207,0.08372,0.648,1.27019,0.06776,0.648,1.25886,0.05196,0.648,1.24818,0.03629,0.648,1.23827,0.02075,0.648,1.2292,0.00532];

  var VERT = "#version 300 es\n" +
    "in vec2 aPos;\n" +
    "void main() { gl_Position = vec4(aPos, 0.0, 1.0); }"

  var FRAG = `#version 300 es
    precision highp float;
    uniform sampler2D uPhoto;   // the forest stream photo
    uniform sampler2D uAux;     // r: depth map, g: water mask, b: wind weight
    uniform sampler2D uColor;   // water colour texture
    uniform sampler2D uNormal;  // water normal map
    uniform sampler2D uRows;    // per-row stream perspective data
    uniform vec2  uRes;
    uniform vec4  uView;        // image uv = xy + screen uv * zw
    uniform float uAspect;      // image width / height
    uniform float uFlow;        // flow time
    uniform float uDrift;       // plane units per second the water travels
    uniform float uClock;
    uniform vec2  uCam;
    uniform vec4  uRip[6];      // plane U, plane V at birth, birth time, strength
    out vec4 outColor;

    const float SPEED = 0.16;

    vec3 rowAt(float iy) {
      float f = clamp(iy, 0.0, 1.0) * 256.0 - 0.5;
      float fl = floor(f);
      int i0 = int(clamp(fl, 0.0, 255.0));
      int i1 = min(i0 + 1, 255);
      float w = f < 0.0 ? 0.0 : clamp(f - fl, 0.0, 1.0);
      return mix(texelFetch(uRows, ivec2(i0, 0), 0).rgb, texelFetch(uRows, ivec2(i1, 0), 0).rgb, w);
    }
    vec2 nm(vec2 p) { return texture(uNormal, p).xy * 2.0 - 1.0; }
    vec2 waterN(vec2 P, float f) {
      vec2 a = nm(P + vec2(0.0, f));
      vec2 b = nm(P * vec2(1.9, 1.6) + vec2(0.37, f * 1.35));
      vec2 c = nm(P * 0.45 + vec2(0.71, f * 0.7));
      return (a * 0.6 + b * 0.45 + c * 0.6) * 2.2;
    }
    vec2 ripples(vec2 P) {
      vec2 s = vec2(0.0);
      for (int i = 0; i < 6; i++) {
        vec4 r = uRip[i];
        float age = uClock - r.z;
        if (r.w <= 0.0 || age < 0.0 || age > 4.5) continue;
        vec2 d = P - vec2(r.x, r.y - age * uDrift);
        float dist = length(d) + 1e-4;
        float x = dist - age * 0.22;
        float env = exp(-x * x * 140.0) * exp(-age * 0.85) * smoothstep(0.0, 0.08, age) / (1.0 + dist * 4.0);
        s += (d / dist) * sin(x * 110.0) * env * r.w;
      }
      return s;
    }
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    vec2 hash2(vec2 p) { return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }

    void main() {
      vec2 suv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
      vec2 uv = uView.xy + suv * uView.zw;

      // depth parallax: nearer things slide further as the camera drifts
      float dep = textureLod(uAux, uv, 2.0).r;
      uv += (dep - 0.3) * uCam * vec2(0.011, 0.007);

      // wind: fern fronds and canopy sway, nearer leaves sway more
      float wnd = texture(uAux, uv).b;
      if (wnd > 0.004) {
        float gust = 0.5 + 0.5 * sin(uClock * 0.41 + uv.x * 3.1 - uv.y * 2.3) * (0.6 + 0.4 * sin(uClock * 0.19 + 1.7));
        float ph = uClock * 1.8 + uv.y * 26.0 + uv.x * 9.0;
        vec2 sway = vec2(sin(ph) + 0.45 * sin(ph * 2.3 + 1.3), 0.35 * cos(ph * 1.6));
        uv += sway * wnd * gust * vec2(0.0036, 0.0019) * (0.55 + dep);
      }

      vec3 col = texture(uPhoto, uv).rgb;
      float water = texture(uAux, uv).g;

      if (water > 0.01) {
        vec3 row = rowAt(uv.y);
        float sN = row.g;
        vec2 P = vec2((uv.x - row.r) * sN, row.b);
        float f = uFlow * SPEED;

        vec2 n = waterN(P, f) + ripples(P) * 1.4;
        float inner = smoothstep(0.3, 0.95, textureLod(uAux, uv, 3.0).g);
        vec2 offP = n * 0.012;
        vec2 offUV = vec2(offP.x / sN, -offP.y / (sN * 1.8) * uAspect) * inner;

        vec3 refr = texture(uPhoto, uv + offUV).rgb;
        vec3 low  = textureLod(uPhoto, uv + offUV, 4.0).rgb;

        vec3 tex = texture(uColor, P * 0.85 + vec2(0.13, f * 0.9) + n * 0.02).rgb;
        float tl = dot(tex, vec3(0.3, 0.5, 0.2)) / 0.53;
        vec3 flowing = low * mix(1.0, clamp(tl, 0.4, 1.8), 0.9);
        float nearF = clamp(2.5 / sN, 0.0, 1.0);
        vec3 w = mix(refr, flowing, 0.6 * inner * mix(0.3, 1.0, nearF));

        // the little cascade: fast vertical streaks
        vec2 cq = (uv - vec2(0.648, 0.468)) / vec2(0.07, 0.052);
        float casc = 1.0 - smoothstep(0.55, 1.0, length(cq));
        if (casc > 0.0) {
          float fr = uFlow * 0.9;
          vec2 sq = vec2(uv.x * 34.0, uv.y * 5.0 - fr);
          float s1 = dot(texture(uColor, sq).rgb, vec3(0.333));
          float s2 = dot(texture(uColor, sq * vec2(1.7, 1.3) + vec2(0.3, -fr * 0.4)).rgb, vec3(0.333));
          vec3 cc = low * (0.62 + 0.95 * (s1 * 0.6 + s2 * 0.4));
          w = mix(w, cc, casc * 0.8);
        }

        // sun glints, only where the water is already lit
        vec3 N = normalize(vec3(n * 0.6, 1.0));
        float sp = pow(max(dot(N, normalize(vec3(0.0, 0.55, 1.0))), 0.0), 220.0);
        float lit = smoothstep(0.42, 0.85, dot(low, vec3(0.333)));
        w += vec3(1.0, 0.96, 0.86) * sp * lit * 1.5;

        col = mix(col, w, water);
      }

      // dappled light: the canopy above moves, so sunlit patches breathe
      float L = dot(col, vec3(0.299, 0.587, 0.114));
      float litAll = smoothstep(0.35, 0.8, L);
      vec2 dq = uv * vec2(1.3, 2.3) + vec2(uClock * 0.012, -uClock * 0.006);
      float dap = dot(texture(uColor, dq).rgb, vec3(0.333)) - 0.53;
      float dap2 = dot(texture(uColor, dq * 1.7 + vec2(-uClock * 0.02, 0.0)).rgb, vec3(0.333)) - 0.53;
      col *= 1.0 + (dap * 0.8 + dap2 * 0.5) * litAll * 0.5;

      // light shafts and haze in the far, backlit part of the scene
      float far = 1.0 - smoothstep(0.04, 0.4, dep);
      float q = dot(uv, vec2(1.0, 0.5));
      float shaft = textureLod(uColor, vec2(q * 1.3 + uClock * 0.004, 0.37), 3.5).g;
      shaft = smoothstep(0.5, 0.66, shaft) * far * pow(1.0 - clamp(uv.y, 0.0, 1.0), 1.5);
      col += vec3(1.0, 0.9, 0.7) * shaft * 0.12;
      col = mix(col, vec3(0.78, 0.82, 0.66), far * 0.03);

      // gentle grade and vignette inside the window
      col *= 0.95;
      vec2 vq = (suv - 0.5) * vec2(1.0, 0.9);
      col *= mix(0.74, 1.0, 1.0 - smoothstep(0.45, 1.05, length(vq) * 1.4));

      // pollen drifting through the light
      vec2 px = gl_FragCoord.xy / uRes.y;
      float cs = 0.065;
      vec2 mq = px + vec2(-uClock * 0.006, uClock * 0.004) + uCam * 0.004;
      vec2 cell = floor(mq / cs);
      vec2 h = hash2(cell);
      if (h.x > 0.6) {
        vec2 lp = fract(mq / cs);
        vec2 p0 = 0.25 + 0.5 * hash2(cell + 7.3) + 0.12 * vec2(sin(uClock * 0.6 + h.y * 6.28), cos(uClock * 0.45 + h.x * 6.28));
        float d = length(lp - p0) * cs * uRes.y;
        float rad = (1.1 + 2.0 * h.y) * uRes.y / 900.0;
        float tw = 0.55 + 0.45 * sin(uClock * (1.0 + h.y * 2.0) + h.x * 20.0);
        col += vec3(1.0, 0.93, 0.75) * exp(-d * d / (rad * rad)) * tw * 0.5 * (0.35 + far * 0.65);
      }

      col += (hash(gl_FragCoord.xy + fract(uClock)) - 0.5) / 255.0;
      outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }`

  var load = function (src) {
    return new Promise(function (resolve, reject) {
      var img = new Image()
      img.onload = function () { resolve(img) }
      img.onerror = reject
      img.src = src
    })
  }

  function rowAt(iy) {
    var f = Math.min(1, Math.max(0, iy)) * 256 - 0.5
    var i0 = Math.max(0, Math.min(255, Math.floor(f))), i1 = Math.min(i0 + 1, 255)
    var w = f < 0 ? 0 : Math.min(1, f - Math.floor(f))
    return [0, 1, 2].map(function (k) { return ROWS[i0 * 3 + k] + (ROWS[i1 * 3 + k] - ROWS[i0 * 3 + k]) * w })
  }

  function start(el) {
    var base = el.getAttribute("data-living-stream") || "images/stream/"
    var hint = el.parentElement.querySelector("[data-stream-hint]")
    var canvas = document.createElement("canvas")
    canvas.className = "arch__canvas"
    canvas.setAttribute("aria-hidden", "true")
    el.appendChild(canvas)

    var gl = null
    try { gl = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power" }) } catch (e) {}
    if (!gl) { canvas.remove(); return }

    function compile(type, src) {
      var s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null }
      return s
    }
    var vs = compile(gl.VERTEX_SHADER, VERT)
    var fs = compile(gl.FRAGMENT_SHADER, FRAG)
    var prog = gl.createProgram()
    if (vs && fs) { gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog) }
    if (!vs || !fs || !gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return }
    gl.useProgram(prog)

    gl.bindVertexArray(gl.createVertexArray())
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    var aPos = gl.getAttribLocation(prog, "aPos")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    var U = {}
    ;["uPhoto", "uAux", "uColor", "uNormal", "uRows", "uRes", "uView", "uAspect", "uFlow", "uDrift", "uClock", "uCam", "uRip"]
      .forEach(function (n) { U[n] = gl.getUniformLocation(prog, n === "uRip" ? "uRip[0]" : n) })

    var aniso = gl.getExtension("EXT_texture_filter_anisotropic")
    function texture(img, unit, raw, repeat) {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, raw ? gl.NONE : gl.BROWSER_DEFAULT_WEBGL)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, gl.RGB, gl.UNSIGNED_BYTE, img)
      gl.generateMipmap(gl.TEXTURE_2D)
      var wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      if (aniso && repeat) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))
    }
    function rowsTexture(unit) {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
      var data = new Float32Array(256 * 4)
      for (var i = 0; i < 256; i++) { data[i * 4] = ROWS[i * 3]; data[i * 4 + 1] = ROWS[i * 3 + 1]; data[i * 4 + 2] = ROWS[i * 3 + 2] }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 256, 1, 0, gl.RGBA, gl.FLOAT, data)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }

    // The water mask on the CPU too, so taps only ripple the stream
    var maskData = null, maskW = 236, maskH = 419
    function readMask(img) {
      try {
        var c = document.createElement("canvas")
        c.width = maskW; c.height = maskH
        var cx = c.getContext("2d", { willReadFrequently: true })
        cx.drawImage(img, 0, 0, maskW, maskH)
        maskData = cx.getImageData(0, 0, maskW, maskH).data
      } catch (e) { maskData = null }
    }
    function waterAt(ix, iy) {
      if (!maskData) return true
      var x = Math.min(maskW - 1, Math.max(0, Math.floor(ix * maskW)))
      var y = Math.min(maskH - 1, Math.max(0, Math.floor(iy * maskH)))
      return maskData[(y * maskW + x) * 4 + 1] > 110
    }

    // View: cover-fit the photo to the window, and drift downstream as the window scrolls past
    var scale = Math.min(window.devicePixelRatio || 1, 1.5)
    var dirty = true
    var view = [0, 0, 1, 1]
    // pan 0.5 matches the still photo's framing (see .arch--photo in site.css), so the
    // crossfade from still to moving water doesn't jump; it follows the scroll afterwards
    var pan = 0.5, panTarget = 0.5
    var holdUntil = Infinity
    function resize() {
      var cw = canvas.clientWidth, ch = canvas.clientHeight
      var s = scale
      var maxPx = 1.2e6
      if (cw * ch * s * s > maxPx) s = Math.sqrt(maxPx / (cw * ch))
      var w = Math.max(1, Math.round(cw * s)), h = Math.max(1, Math.round(ch * s))
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
      gl.viewport(0, 0, w, h)
      dirty = false
    }
    function updateView() {
      var cw = canvas.clientWidth || 1, ch = canvas.clientHeight || 1
      var zoom = Math.max(cw / IMG_W, ch / IMG_H) * 1.06
      var wf = cw / (zoom * IMG_W), hf = ch / (zoom * IMG_H)
      view[2] = wf; view[3] = hf
      view[0] = Math.min(1 - wf, Math.max(0, 0.6 - wf / 2))
      view[1] = (1 - hf) * (0.22 + 0.56 * pan)
    }
    function scrollProgress() {
      var r = el.getBoundingClientRect()
      var p = (window.innerHeight - r.top) / (window.innerHeight + r.height)
      return Math.min(1, Math.max(0, p))
    }

    // Ripples where you tap the water, and a gentle handheld drift (plus the mouse, where there is one)
    var SLOTS = 6
    var rip = new Float32Array(SLOTS * 4)
    var ripIdx = 0
    var t0 = performance.now()
    var clock = 0
    function toImage(e) {
      var r = canvas.getBoundingClientRect()
      var sx = (e.clientX - r.left) / r.width, sy = (e.clientY - r.top) / r.height
      return [view[0] + sx * view[2], view[1] + sy * view[3], sx, sy]
    }
    canvas.addEventListener("pointerdown", function (e) {
      var p = toImage(e)
      if (!waterAt(p[0], p[1])) return
      var row = rowAt(p[1])
      rip.set([(p[0] - row[0]) * row[1], row[2], clock, 1], ripIdx * 4)
      ripIdx = (ripIdx + 1) % SLOTS
      if (hint) hint.classList.add("is-done")
    })
    var cam = [0, 0]
    var camTarget = null
    canvas.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return
      var p = toImage(e)
      camTarget = [p[2] * 2 - 1, p[3] * 2 - 1]
    })
    canvas.addEventListener("pointerleave", function () { camTarget = null })

    var running = false, ready = false, raf = 0
    var prev = 0, flowT = 0, frames = 0, slowAcc = 0
    function frame(now) {
      if (!running) { raf = 0; return }
      var dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      clock = (now - t0) / 1000
      flowT += dt
      if (dirty) resize()
      panTarget = scrollProgress()
      if (now > holdUntil) pan += (panTarget - pan) * (1 - Math.pow(0.3, dt))
      updateView()

      var drift = [Math.sin(clock * 0.13) * 0.45 + Math.sin(clock * 0.31) * 0.15, Math.sin(clock * 0.09 + 1.2) * 0.3]
      var tgt = camTarget ? [camTarget[0] * 0.9 + drift[0] * 0.3, camTarget[1] * 0.6 + drift[1] * 0.3] : drift
      var k = 1 - Math.pow(0.05, dt)
      cam[0] += (tgt[0] - cam[0]) * k
      cam[1] += (tgt[1] - cam[1]) * k

      gl.uniform1i(U.uPhoto, 0)
      gl.uniform1i(U.uAux, 1)
      gl.uniform1i(U.uColor, 2)
      gl.uniform1i(U.uNormal, 3)
      gl.uniform1i(U.uRows, 4)
      gl.uniform2f(U.uRes, canvas.width, canvas.height)
      gl.uniform4f(U.uView, view[0], view[1], view[2], view[3])
      gl.uniform1f(U.uAspect, IMG_W / IMG_H)
      gl.uniform1f(U.uFlow, flowT)
      gl.uniform1f(U.uDrift, 0.16)
      gl.uniform1f(U.uClock, clock)
      gl.uniform2f(U.uCam, cam[0], cam[1])
      gl.uniform4fv(U.uRip, rip)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (!el.classList.contains("is-living")) {
        el.classList.add("is-living")
        holdUntil = now + 1600 // the canvas takes 1.4s to fade in over the still
        if (hint) hint.hidden = false
      }

      // On a slow device, draw fewer pixels rather than stutter
      frames++
      slowAcc += dt
      if (frames === 90) {
        if (slowAcc / frames > 0.024 && scale > 0.55) { scale *= 0.82; dirty = true }
        frames = 0; slowAcc = 0
      }
      raf = requestAnimationFrame(frame)
    }
    function play() {
      if (running || !ready) return
      running = true
      prev = performance.now()
      raf = requestAnimationFrame(frame)
    }
    function stop() { running = false }

    if (window.ResizeObserver) new ResizeObserver(function () { dirty = true }).observe(canvas)
    window.addEventListener("resize", function () { dirty = true })
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); stop(); canvas.remove(); el.classList.remove("is-living") })

    // Runs only while the window is on screen and not paused (the offerings list pauses hidden panels)
    var visible = false
    function paused() { return el.hasAttribute("data-stream-paused") }
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting
      if (visible && !paused()) play()
      else stop()
    }).observe(el)
    new MutationObserver(function () {
      if (paused()) stop()
      else if (visible) play()
    }).observe(el, { attributes: true, attributeFilter: ["data-stream-paused"] })

    Promise.all(["photo.jpg", "aux.png", "color.jpg", "normal.jpg"].map(function (f) { return load(base + f) }))
      .then(function (imgs) {
        texture(imgs[0], 0, false, false)
        texture(imgs[1], 1, true, false)
        texture(imgs[2], 2, false, true)
        texture(imgs[3], 3, true, true)
        rowsTexture(4)
        readMask(imgs[1])
        resize()
        ready = true
        if (visible && !paused()) play()
      })
      .catch(function () { canvas.remove() })
  }

  // Start each window once it comes near the screen, so the textures never load for nothing
  var near = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return
      near.unobserve(entry.target)
      start(entry.target)
    })
  }, { rootMargin: "500px 0px" })
  Array.prototype.forEach.call(windows, function (el) { near.observe(el) })
})()
