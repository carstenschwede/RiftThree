
vec3 rgb2hsv(vec3 c) {

  float M = max(max(c.r, c.g), c.b);
  float m = min(min(c.r, c.g), c.b);
  float C = M - m;
  float del = 60.0 / C;

  float h = 0.0;
  float s = M > 0.0 ? 1.0 - m / M : 0.0;
  float v = M;

  if (M == c.r) {
    h = (c.g - c.b) * del;
    if (h < 0.0) h += 360.0;
  } else if (M == c.g)
    h = (c.b - c.r) * del + 120.0;
  else
    h = (c.r - c.g) * del + 240.0;

  return vec3(h, s, v);

}

vec3 hsv2rgb(vec3 c) {

  float H = c.x / 60.0;
  float Hi = H - 6.0 * floor(H / 6.0);
  float f = H - floor(H);

  float p = c.z * (1.0 - c.y);
  float q = c.z * (1.0 - f * c.y);
  float t = c.z * (1.0 - (1.0 - f) * c.y);

  if (Hi < 1.0)
    return vec3(c.z, t, p);
  else if (Hi < 2.0)
    return vec3(q, c.z, p);
  else if (Hi < 3.0)
    return vec3(p, c.z, t);
  else if (Hi < 4.0)
    return vec3(p, q, c.z);
  else if (Hi < 5.0)
    return vec3(t, p, c.z);
  else
    return vec3(c.z, p, q);

}

vec3 rgb2hsl(vec3 c) {

  float M = max(max(c.r, c.g), c.b);
  float m = min(min(c.r, c.g), c.b);
  float C = M - m;
  float del = 60.0 / C;

  float h = 0.0;
  float l = M + m;
  float t = 1.0 - abs(l - 1.0);
  float s = t > 0.0 ? C / t : 0.0;

  l /= 2.0;

  if (M == c.r) {
    h = (c.g - c.b) * del;
    if (h < 0.0) h += 360.0;
  } else if (M == c.g)
    h = (c.b - c.r) * del + 120.0;
  else
    h = (c.r - c.g) * del + 240.0;

  return vec3(h, s, l);

}

vec3 hsl2rgb(vec3 c) {

  float H = c.x / 60.0;
  float Hi = H - 6.0 * floor(H / 6.0);
  float f = H - floor(H);

  float C = (1.0 - abs(2.0 * c.z - 1.0)) * c.y;
  float X = C * (1.0 - abs(H - 2.0 * floor(H / 2.0) - 1.0));
  float m = c.z - C / 2.0;

  if (Hi < 1.0)
    return vec3(C + m, X + m, m);
  else if (Hi < 2.0)
    return vec3(X + m, C + m, m);
  else if (Hi < 3.0)
    return vec3(m, C + m, X + m);
  else if (Hi < 4.0)
    return vec3(m, X + m, C + m);
  else if (Hi < 5.0)
    return vec3(X + m, m, C + m);
  else
    return vec3(C + m, m, X + m);
}

  #define GammaCorrection(color, gamma) vec3(pow(color.x, 1.0 / (gamma)),pow(color.y, 1.0 / (gamma)),pow(color.z, 1.0 / (gamma)))

  uniform sampler2D texture;
  uniform float fContrast;
  uniform float fBrightness;
  uniform float fSaturation;
  uniform float fGamma;
  varying vec2 vUv;

void main() {
  vec4 texColor = texture2D(texture, vUv); // Displays Nothing
  texColor.rgb /= texColor.a;
  float contrast = 0.0 + fContrast;
  float brightness = 0.0 + fBrightness;
  //CONTRAST
  texColor.rgb = ((texColor.rgb - 0.5) * contrast) + 0.5;
  //texColor.rgb += brightness;
  //SATURATION
  vec3 rgbColor = vec3(texColor.r,texColor.g,texColor.b);
  vec3 hslColor = rgb2hsl(rgbColor);
  hslColor.y*=fSaturation;
  hslColor.y = hslColor.y > 1.0 ? 1.0 : hslColor.y;
  rgbColor = hsl2rgb(hslColor);
  rgbColor = GammaCorrection(rgbColor,fGamma);
  rgbColor.rgb *= texColor.a;
  gl_FragColor =  vec4(rgbColor.x,rgbColor.y,rgbColor.z,1.0);
}