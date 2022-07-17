import React, { useRef, useEffect, Suspense } from "react";
import "./App.scss";
import Header from "./components/header";
import { Section } from "./context/section";
import webState from "./context/state";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useProgress, useGLTF } from "@react-three/drei";
import { a, useTransition } from "@react-spring/web";
import { useInView } from "react-intersection-observer";

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
  return (
    <>
      <Header />
      <div className="container">
        <h1 className="title">Starter branch</h1>
      </div>
      <Loader />
    </>
  );
}
