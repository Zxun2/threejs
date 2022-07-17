import React, { useRef, useEffect, Suspense } from "react";
import "./App.scss";
//Components
import Header from "./components/header";
import { Section } from "./context/section";

// Page State
import webState from "./context/state";

// R3F
import { Canvas, useFrame } from "@react-three/fiber";

// You cannot use HTML in the Canvas. Drei allows us to do just that
import { Html, useProgress, useGLTF } from "@react-three/drei";

// React Spring
import { a, useTransition } from "@react-spring/web";

// P15: Intersection Observer
import { useInView } from "react-intersection-observer";

// P7: Load model
// P12: Add URL prop
function Model({ url }) {
  // Pass in the URL
  const gltf = useGLTF(url, true);
  return <primitive object={gltf.scene} dispose={null} />;
}

// P10: Add Lights
const Lights = () => {
  return (
    <>
      {/* Ambient Light illuminates lights for all objects */}
      <ambientLight intensity={0.3} />
      {/* Direction light */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight
        castShadow
        position={[0, 10, 0]}
        intensity={1.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* Play around with the position */}
      {/* Spotlight Large overhead light */}
      <spotLight intensity={1} position={[1000, 0, 0]} castShadow />
    </>
  );
};

// P3: Abstract the HTML component from step 2 (with no arguments)
// P12: Make this HTML component reusuable
const HTMLContent = ({
  domContent,
  children,
  bgColor,
  modelPath,
  position,
}) => {
  // P15: Add intersection observer
  const [refItem, inView] = useInView({
    threshold: 0,
  });
  useEffect(() => {
    inView && (document.body.style.background = bgColor);
  }, [bgColor, inView]);
  // P11: Make it spin!
  const ref = useRef();
  // This hook allows you to execute code on every rendered frame, like running effects, updating controls, and so on.
  useFrame(() => {
    ref.current.rotation.y += 0.01;
    // Quite funny 👇
    // ref.current.rotation.x += 0.01;
  });
  return (
    // P4: Wrap HTML content with Section with factor and offset props
    // This is related to the offset and the inertia for each section
    // P5: Remove HTMLContent from P2
    <Section factor={1.5} offset={1}>
      {/* P6: Add a group, position={[0, 250, 0]}. Add HTMLContent in the group */}
      {/* Play around with position to see what values the other sections require. (250, 0, -250) */}
      <group position={[0, position, 0]}>
        {/* P8: Create a mesh and pass in the Model as children */}
        {/* Will get an Error. Add Suspense below. */}
        {/* P11: Add ref to mesh (spin) */}
        <mesh ref={ref} position={[0, -35, 0]}>
          <Model url={modelPath} />
        </mesh>
        <Html fullscreen portal={domContent}>
          {/* P15: Add ref */}
          <div ref={refItem} className="container">
            <h1 className="title">{children}</h1>
          </div>
        </Html>
      </group>
    </Section>
  );
};

function Loader() {
  const { active, progress } = useProgress();
  const transition = useTransition(active, {
    from: { opacity: 1, progress: 0 },
    leave: { opacity: 0 },
    update: { progress },
  });
  return transition(
    ({ progress, opacity }, active) =>
      active && (
        <a.div className="loading" style={{ opacity }}>
          <div className="loading-bar-container">
            <a.div className="loading-bar" style={{ width: progress }}></a.div>
          </div>
        </a.div>
      )
  );
}

export default function App() {
  const domContent = useRef();
  // P14: define onScroll
  const scrollArea = useRef();
  const onScroll = (e) => (webState.top.current = e.target.scrollTop);
  useEffect(() => void onScroll({ target: scrollArea.current }), []);

  return (
    <>
      <Header />
      {/* R3F Canvas */}
      {/* P1: Add the Canvas  */}
      {/* The Canvas object is where you start to define your React Three Fiber Scene. */}
      {/* Canvas: The canvas object is your portal into ThreeJS. It renders ThreeJs elements, not DOM elements! 
       The Canvas stretches to 100% of the next relative/absolute parent-container. make sure your canvas is given enough space to show contents!
       You can give it additional properties like style and className, which will be added to the container that holds the dom-canvas element.  */}
      <Canvas
        // orthographic - Converts current camera to orthographic. But we don't need it in this project.
        camera={{ position: [0, 0, 120], fov: 70 }}
      >
        {/* P2: Introduce HTML in Canvas */}
        {/* <Html fullscreen>
          <div className="container">
            <h1 className="'title">Hello</h1>
          </div>
        </Html> */}

        {/* Lights Component */}
        {/* P10: Add Lights */}
        <Lights />
        {/* P9: Add Suspense */}
        <Suspense fallback={null}>
          <HTMLContent
            domContent={domContent}
            bgColor="#f15946"
            modelPath="/armchairYellow.gltf"
            position={250}
          >
            <span>Meet the new </span>
            <span>shopping experience </span>
            <span>for online chairs</span>
          </HTMLContent>
          <HTMLContent
            domContent={domContent}
            bgColor="#571ec1"
            modelPath="/armchairGreen.gltf"
            position={0}
          >
            <span>And... we even</span>
            <span>got different colors</span>
          </HTMLContent>
          <HTMLContent
            domContent={domContent}
            bgColor="#636567"
            modelPath="/armchairGray.gltf"
            position={-250}
          >
            <span>And yes</span>
            <span>we even got</span>
            <span>monochrome!</span>
          </HTMLContent>
        </Suspense>
      </Canvas>
      <Loader />
      {/* P13: Add scrollArea. Portal-ing out of Canvas. No ref, no onScroll. */}
      {/* P14: Add ref, add onScroll */}
      <div className="scrollArea" ref={scrollArea} onScroll={onScroll}>
        <div style={{ position: "sticky", top: 0 }} ref={domContent} />
        {/*Not dynamic to page height. A better way would be to use a custom hook */}
        <div style={{ height: `${webState.sections * 100}vh` }} />
      </div>
    </>
  );
}
