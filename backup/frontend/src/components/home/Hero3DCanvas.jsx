import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

const Hero3DCanvas = forwardRef(function Hero3DCanvas(
  { imageSrc = "/static/hero-cinematic.jpg", phase = "preloader" },
  ref
) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const materialRef = useRef(null);
  const animFrameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isTransitioningRef = useRef(false);
  const [webglActive, setWebglActive] = useState(false);

  // Expose imperative triggers to parent (Hero.jsx)
  useImperativeHandle(ref, () => ({
    triggerTransition: (duration = 1.35) => {
      isTransitioningRef.current = true;

      // 1. WebGL Camera & Shader transition
      if (cameraRef.current && materialRef.current) {
        gsap.to(cameraRef.current.position, {
          z: 2.7,
          x: 0,
          y: 0,
          duration: duration,
          ease: "expo.inOut",
          onComplete: () => {
            isTransitioningRef.current = false;
          },
        });

        gsap.to(cameraRef.current.rotation, {
          x: 0,
          y: 0,
          z: 0,
          duration: duration,
          ease: "expo.inOut",
        });

        gsap.to(materialRef.current.uniforms.uProgress, {
          value: 1.0,
          duration: duration,
          ease: "power2.inOut",
        });

      } else {
        // Fallback CSS 3D transition
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, duration * 1000);
      }
    },
    resetToIntro: () => {
      isTransitioningRef.current = false;
      if (cameraRef.current && materialRef.current) {
        gsap.set(cameraRef.current.position, { z: 3.35, x: 0.05, y: -0.03 });
        gsap.set(cameraRef.current.rotation, { x: 0.025, y: -0.035, z: 0 });
        gsap.set(materialRef.current.uniforms.uProgress, { value: 0.0 });
      }
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Check if WebGL is supported by browser/GPU
    let renderer = null;
    let webglSuccess = false;

    try {
      renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        alpha: true,
        failIfMajorPerformanceCaveat: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      webglSuccess = true;
      setWebglActive(true);
    } catch (err) {
      console.info("WebGL not hardware-accelerated on this display, running Spatial 3D Canvas mode.");
      webglSuccess = false;
      setWebglActive(false);
    }

    // =========================================================================
    // CASE A: FULL WEBGL 3D SHADER & PARTICLE SYSTEM
    // =========================================================================
    if (webglSuccess && renderer) {
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0.05, -0.03, 3.35);
      camera.rotation.set(0.025, -0.035, 0);
      cameraRef.current = camera;

      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(imageSrc, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
      });

      const depthShaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uResolution: { value: new THREE.Vector2(width, height) },
          uProgress: { value: phase === "hero" ? 1.0 : 0.0 },
          uTime: { value: 0.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          uniform float uTime;

          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.z += sin(pos.x * 2.0 + uTime * 0.8) * 0.02 * sin(pos.y * 2.0);
            vPosition = pos;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform vec2 uMouse;
          uniform vec2 uResolution;
          uniform float uProgress;
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vPosition;

          float calculateVillaDepth(vec2 uv) {
            float leftMonolith = smoothstep(0.42, 0.02, uv.x) * 0.92;
            float floorRamp = clamp((0.55 - uv.y) * 1.5, 0.0, 0.6);
            float stairsX = 1.0 - abs(uv.x - 0.48) * 2.5;
            float stairsY = 1.0 - abs(uv.y - 0.48) * 2.2;
            float stairsMid = clamp(stairsX * stairsY, 0.0, 1.0) * 0.5;
            float exteriorWindow = smoothstep(0.45, 0.92, uv.x) * 0.18;
            return clamp(leftMonolith + floorRamp + stairsMid - exteriorWindow, 0.08, 0.98);
          }

          void main() {
            vec2 uv = vUv;
            float depth = calculateVillaDepth(uv);
            vec2 displacement = uMouse * (depth * 0.042);

            float r = texture2D(uTexture, uv - displacement * 1.025).r;
            float g = texture2D(uTexture, uv - displacement).g;
            float b = texture2D(uTexture, uv - displacement * 0.975).b;
            vec3 color = vec3(r, g, b);

            float dist = distance(uv, vec2(0.5, 0.5));
            float vignette = 1.0 - smoothstep(0.45, 0.98, dist) * 0.4;
            color *= vignette;

            gl_FragColor = vec4(color, 1.0);
          }
        `,
        depthWrite: false,
      });
      materialRef.current = depthShaderMaterial;

      const vFov = (camera.fov * Math.PI) / 180;
      const planeH = 2 * Math.tan(vFov / 2) * 2.75 * 1.15;
      const planeW = planeH * (width / height) * 1.15;
      const geometry = new THREE.PlaneGeometry(planeW, planeH, 32, 32);
      const mesh = new THREE.Mesh(geometry, depthShaderMaterial);
      scene.add(mesh);

      // Mouse listener
      const handlePointer = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        mouseRef.current.targetX = (clientX / window.innerWidth - 0.5) * 2;
        mouseRef.current.targetY = -(clientY / window.innerHeight - 0.5) * 2;
      };

      window.addEventListener("mousemove", handlePointer, { passive: true });
      window.addEventListener("touchmove", handlePointer, { passive: true });

      const clock = new THREE.Clock();
      const animate = () => {
        animFrameRef.current = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        const mouse = mouseRef.current;
        mouse.x += (mouse.targetX - mouse.x) * 0.055;
        mouse.y += (mouse.targetY - mouse.y) * 0.055;

        if (materialRef.current) {
          materialRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
          materialRef.current.uniforms.uTime.value = elapsed;
        }

        if (cameraRef.current && !isTransitioningRef.current) {
          cameraRef.current.rotation.y = -mouse.x * 0.045;
          cameraRef.current.rotation.x = mouse.y * 0.035;
        }

        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const newW = container.clientWidth || window.innerWidth;
        const newH = container.clientHeight || window.innerHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
        if (materialRef.current) {
          materialRef.current.uniforms.uResolution.value.set(newW, newH);
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("mousemove", handlePointer);
        window.removeEventListener("touchmove", handlePointer);
        window.removeEventListener("resize", handleResize);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        geometry.dispose();
        depthShaderMaterial.dispose();
        texture.dispose();
        renderer.dispose();
      };
    }

    setWebglActive(false);
    return undefined;
  }, [imageSrc, phase]);

  return (
    <div
      ref={containerRef}
      className={`hero-3d-webgl-container ${webglActive ? "webgl-active" : "spatial-css-active"}`}
      aria-hidden="true"
    >
    </div>
  );
});

export default Hero3DCanvas;
