// Hypermoderne lucht: shader met kleurverloop, zon, drijvende wolken, dag-en-nachtritme, sterren en noorderlicht.
const SKY = {
  day: 480, // seconden voor een hele dag
  phase: 0.18, // begin in de ochtend
  mesh: null, uni: null,

  build(scene) {
    this.uni = { uTime: { value: 0 }, uSun: { value: new THREE.Vector3(0, 1, 0) }, uDay: { value: 1 }, uHaze: { value: new THREE.Color('#cfc6dc') }, uHazeAmt: { value: 0 } };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uni, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        varying vec3 vDir; uniform float uTime; uniform vec3 uSun; uniform float uDay; uniform vec3 uHaze; uniform float uHazeAmt;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
        float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*n(p); p*=2.03; a*=0.5; } return v; }
        void main(){
          vec3 d = normalize(vDir);
          float up = clamp(d.y, -0.2, 1.0);
          float sunH = uSun.y;
          // kleuren: dag, gouden uur, nacht
          vec3 dayTop = vec3(0.18,0.46,0.92), dayHor = vec3(0.68,0.84,0.98);
          vec3 setTop = vec3(0.22,0.20,0.48), setHor = vec3(1.0,0.52,0.28);
          vec3 nightTop = vec3(0.01,0.02,0.07), nightHor = vec3(0.06,0.08,0.18);
          float sunset = smoothstep(0.35, 0.0, abs(sunH)) ;
          vec3 top = mix(nightTop, dayTop, uDay); vec3 hor = mix(nightHor, dayHor, uDay);
          top = mix(top, setTop, sunset*0.6); hor = mix(hor, setHor, sunset*0.85);
          vec3 col = mix(hor, top, pow(max(up,0.0), 0.55));
          // zon met gloed
          float sd = max(dot(d, normalize(uSun)), 0.0);
          col += vec3(1.0,0.85,0.6) * pow(sd, 900.0) * 4.0 * step(-0.05, sunH);
          col += vec3(1.0,0.6,0.3) * pow(sd, 12.0) * 0.45 * (0.4 + sunset);
          // maan aan de andere kant
          float md = max(dot(d, -normalize(uSun)), 0.0);
          col += vec3(0.8,0.85,1.0) * smoothstep(0.9993, 0.9997, md) * (1.0 - uDay);
          // sterren
          if (up > 0.0) {
            vec2 sp = d.xz / (d.y + 0.3) * 160.0;
            float st = step(0.9965, h(floor(sp))) * (0.6 + 0.4*sin(uTime*3.0 + h(floor(sp))*40.0));
            col += vec3(st) * (1.0 - uDay) * smoothstep(0.0, 0.25, up);
            // noorderlicht
            float band = sin(d.x*3.0 + uTime*0.08 + fbm(d.xz*2.0 + uTime*0.03)*3.0);
            float aur = smoothstep(0.55, 1.0, band) * smoothstep(0.05, 0.35, up) * smoothstep(0.75, 0.3, up);
            col += mix(vec3(0.1,0.9,0.6), vec3(0.6,0.2,0.9), fbm(d.xz*3.0)) * aur * 0.55 * (1.0 - uDay);
          }
          // wolken
          if (up > 0.0) {
            vec2 cp = d.xz / (d.y + 0.15) * 1.6 + vec2(uTime*0.012, uTime*0.004);
            float c = fbm(cp*1.3);
            float cov = smoothstep(0.52, 0.78, c) * smoothstep(0.0, 0.18, up);
            vec3 cloudCol = mix(vec3(0.25,0.27,0.35), vec3(1.0,0.98,0.95), uDay);
            cloudCol = mix(cloudCol, vec3(1.0,0.66,0.48), sunset*0.7);
            cloudCol += vec3(1.0,0.8,0.6) * pow(sd, 6.0) * 0.5 * uDay;
            col = mix(col, cloudCol, cov * 0.85);
          }
          // onder de horizon
          col = mix(col, hor*0.7, smoothstep(0.0, -0.15, d.y));
          // vapedamp: rond de horizon loopt de lucht over in de mist
          col = mix(col, uHaze, uHazeAmt * (1.0 - smoothstep(-0.05, 0.55, d.y)));
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(150, 32, 16), mat);
    this.mesh.renderOrder = -10;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  },

  // werkt de lucht, het zonlicht en de mist bij; geeft de horizonkleur terug
  update(dt, camPos, hemi, sun, scene, inside) {
    this.phase = (this.phase + dt / this.day) % 1;
    const a = this.phase * Math.PI * 2;
    const sunV = new THREE.Vector3(Math.cos(a) * 0.8, Math.sin(a), 0.35).normalize();
    const day = THREE.MathUtils.smoothstep(sunV.y, -0.12, 0.18);
    this.uni.uTime.value += dt; this.uni.uSun.value.copy(sunV); this.uni.uDay.value = day;
    this.mesh.position.copy(camPos);
    this.mesh.visible = !inside;
    this.dayF = day;
    if (inside) return;
    const sunset = Math.max(0, 1 - Math.abs(sunV.y) / 0.35);
    // 's nachts maanlicht: blauwig en niet pikzwart
    hemi.intensity = 0.38 + 0.52 * day;
    hemi.color.setRGB(0.5 + 0.5 * day, 0.58 + 0.42 * day, 0.85 + 0.15 * day);
    sun.intensity = 0.12 + 0.48 * day;
    sun.color.setRGB(1, 0.9 - sunset * 0.3, 0.8 - sunset * 0.45);
    sun.position.set(sunV.x * 60, Math.max(sunV.y, 0.1) * 60, sunV.z * 60);
    const hor = new THREE.Color().setRGB(0.06 + 0.62 * day + sunset * 0.3, 0.08 + 0.76 * day + sunset * 0.05, 0.18 + 0.8 * day - sunset * 0.2);
    // de vapedamp: lila overdag, paarsig donker 's nachts
    const haze = hor.clone().lerp(new THREE.Color().setRGB(0.12 + 0.68 * day + sunset * 0.2, 0.1 + 0.66 * day, 0.2 + 0.68 * day), 0.6);
    scene.fog.color.copy(haze);
    this.uni.uHaze.value.copy(haze);
    this.uni.uHazeAmt.value = this.hazeAmt == null ? 0 : this.hazeAmt;
  },
  label() {
    const p = this.phase;
    return p < 0.05 || p > 0.95 ? 'ochtendgloren' : p < 0.45 ? 'dag' : p < 0.55 ? 'zonsondergang' : 'nacht';
  },
};
