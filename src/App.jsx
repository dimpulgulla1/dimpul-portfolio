
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import ChromeScene from "./ChromeScene";
import "./PortfolioProjects.css";
import "./ReturnOverlay.css";

export default function App() {
  const heroRef = useRef(null);
  const projectRef = useRef(null);
  const projectBallRef = useRef(null);
  const timelineRef = useRef(null);

  const morphProgress = useRef({ value: 0 });
  const busyRef = useRef(false);

  const [mode, setMode] = useState("home");

  const homeElements =
    ".hero-content, .site-header, .site-footer";

  const projectElements =
    ".dg-work-header, .dg-work-copy, " +
    ".dg-work-visual-top, .dg-work-visual-bottom, " +
    ".dg-work-footer";

  const reducedMotion = () =>
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  useEffect(() => {
    let context;

    if (!reducedMotion()) {
      context = gsap.context(() => {
        gsap.fromTo(
          ".hero-title",
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          }
        );

        gsap.fromTo(
          ".reveal-ui",
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
          }
        );
      }, heroRef);
    }

    return () => {
      context?.revert();
      timelineRef.current?.kill();
    };
  }, []);

  const stopPreviousAnimations = () => {
    timelineRef.current?.kill();

    gsap.killTweensOf([
      ".hero-title",
      ".reveal-ui",
      ".hero-content",
      ".site-header",
      ".site-footer",
    ]);
  };

  const finishHome = () => {
    morphProgress.current.value = 0;

    gsap.set(projectRef.current, {
      autoAlpha: 0,
    });

    gsap.set(homeElements, {
      opacity: 1,
      clearProps: "transform",
    });

    gsap.set(projectElements, {
      opacity: 1,
      clearProps: "transform",
    });

    gsap.set(".dg-work-orb", {
      opacity: 1,
    });

    busyRef.current = false;
    setMode("home");
  };

  const finishProject = () => {
    morphProgress.current.value = 1;

    gsap.set(projectRef.current, {
      autoAlpha: 1,
    });

    gsap.set(projectElements, {
      opacity: 1,
      clearProps: "transform",
    });

    gsap.set(".dg-work-orb", {
      opacity: 1,
    });

    busyRef.current = false;
    setMode("project");
  };

  const viewMyWork = () => {
    if (busyRef.current) return;

    busyRef.current = true;
    stopPreviousAnimations();

    if (reducedMotion()) {
      gsap.set(homeElements, { opacity: 0 });
      finishProject();
      return;
    }

    setMode("enter");

    gsap.set(projectRef.current, {
      autoAlpha: 0,
    });

    gsap.set(projectElements, {
      opacity: 0,
      y: 12,
    });

    gsap.set(".dg-work-orb", {
      opacity: 0,
    });

    const tl = gsap.timeline({
      onComplete: finishProject,
    });

    timelineRef.current = tl;

    // Hide text while the chrome begins dissolving.
    tl.to(
      homeElements,
      {
        opacity: 0,
        duration: 0.35,
        ease: "power2.inOut",
      },
      0
    );

    // Original spiral becomes particles.
    tl.to(
      morphProgress.current,
      {
        value: 0.65,
        duration: 0.85,
        ease: "power2.inOut",
      },
      0.05
    );

    // Reveal project section without scrolling.
    tl.set(
      projectRef.current,
      { visibility: "visible" },
      0.48
    );

    tl.to(
      projectRef.current,
      {
        opacity: 1,
        duration: 0.55,
        ease: "power2.inOut",
      },
      0.48
    );

    // Move particles toward the Voice Assistant ball.
    tl.to(
      morphProgress.current,
      {
        value: 1,
        duration: 0.82,
        ease: "power2.inOut",
      },
      0.88
    );

    // Project ball appears.
    tl.to(
      ".dg-work-orb",
      {
        opacity: 1,
        duration: 0.48,
        ease: "power2.inOut",
      },
      1.19
    );

    // Project information fades into view.
    tl.to(
      projectElements,
      {
        opacity: 1,
        y: 0,
        duration: 0.48,
        stagger: 0.025,
        ease: "power2.out",
      },
      1.05
    );
  };

  const backToHome = () => {
    if (busyRef.current) return;

    busyRef.current = true;
    stopPreviousAnimations();

    if (reducedMotion()) {
      finishHome();
      return;
    }

    setMode("exit");

    // Keep homepage content hidden at the start.
    // Its layer will remain ABOVE the sculpture.
    gsap.set(homeElements, {
      opacity: 0,
    });

    const tl = gsap.timeline({
      onComplete: finishHome,
    });

    timelineRef.current = tl;

    // Project ball dissolves.
    tl.to(
      ".dg-work-orb",
      {
        opacity: 0,
        duration: 0.35,
        ease: "power2.inOut",
      },
      0
    );

    // Project text fades.
    tl.to(
      projectElements,
      {
        opacity: 0,
        y: 10,
        duration: 0.32,
        ease: "power2.inOut",
      },
      0
    );

    // Reverse the particle transformation.
    tl.to(
      morphProgress.current,
      {
        value: 0.75,
        duration: 0.45,
        ease: "power2.inOut",
      },
      0.05
    );

    // Project background disappears gradually.
    tl.to(
      projectRef.current,
      {
        opacity: 0,
        duration: 0.65,
        ease: "power2.inOut",
      },
      0.3
    );

    // Move particles back to the original center.
    tl.to(
      morphProgress.current,
      {
        value: 0.3,
        duration: 0.75,
        ease: "power2.inOut",
      },
      0.4
    );

    tl.set(
      projectRef.current,
      {
        visibility: "hidden",
      },
      1.02
    );

    // Complete the original chrome spiral.
    tl.to(
      morphProgress.current,
      {
        value: 0,
        duration: 0.55,
        ease: "power3.out",
      },
      1.1
    );

    // Reveal the name while the spiral reforms.
    // The text remains ABOVE the 3D object.
    tl.fromTo(
      ".hero-content",
      {
        opacity: 0,
        y: 12,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "power3.out",
        immediateRender: false,
      },
      1.05
    );

    // Navigation and footer return smoothly.
    tl.to(
      ".site-header, .site-footer",
      {
        opacity: 1,
        duration: 0.55,
        ease: "power2.out",
      },
      1.15
    );
  };

  return (
    <div className="dg-seamless-root">
      {/* ONE SHARED 3D SCULPTURE */}
      <ChromeScene
        morphProgress={morphProgress}
        targetRef={projectBallRef}
        mode={mode}
      />

      {/* HOMEPAGE */}
      <main
        ref={heroRef}
        id="hero"
        className="portfolio-hero"
        style={{
          // Critical fix:
          // During return, homepage content sits
          // above the transitioning 3D sculpture.
          zIndex: mode === "exit" ? 40 : 1,
          background: "transparent",
        }}
      >
        <header className="site-header reveal-ui">
          <a href="#hero" className="site-brand">
            DG<span>.</span>
          </a>

          <a
            href="mailto:dimpulgulla1@gmail.com"
            className="header-contact"
          >
            CONTACT ↗
          </a>
        </header>

        <div className="hero-content">
          <p className="welcome-text reveal-ui">
            WELCOME TO MY WORLD
          </p>

          <h1 className="hero-title">
            DIMPUL
            <br />
            <span>GULLA.</span>
          </h1>

          <p className="hero-description reveal-ui">
            Software Developer • QA • AI Evaluation
          </p>

          <button
            type="button"
            className="connect-button reveal-ui"
            onClick={viewMyWork}
            disabled={mode !== "home"}
          >
            VIEW MY WORK <span>↗</span>
          </button>
        </div>

        <footer className="site-footer reveal-ui">
          <div className="footer-status">
            <span className="status-dot" />
            BUILT WITH CURIOSITY
          </div>

          <span className="footer-hint">
            MOVE YOUR CURSOR TO EXPLORE
          </span>
        </footer>
      </main>

      {/* AI VOICE ASSISTANT PROJECT */}
      <section
        ref={projectRef}
        id="projects"
        className="dg-work"
        aria-hidden={mode === "home"}
        style={{
          pointerEvents:
            mode === "project" ? "auto" : "none",
        }}
      >
        <header className="dg-work-header">
          <span>01 / SELECTED WORK</span>
          <span>PERSONAL PROJECT</span>
        </header>

        <div className="dg-work-body">
          <div className="dg-work-copy">
            <p className="dg-work-eyebrow">
              FEATURED PROJECT / 001
            </p>

            <h2>
              AI VOICE
              <br />
              <span>ASSISTANT.</span>
            </h2>

            <p className="dg-work-lead">
              Exploring voice-based interaction and
              AI-powered assistance.
            </p>

            <div className="dg-work-divider" />

            <h3>PROJECT OVERVIEW</h3>

            <p>
              A personal project exploring how
              conversational AI and voice interaction
              can create more natural digital
              experiences.
            </p>

            <h3>PROJECT FOCUS</h3>

            <p>
              Voice interaction, conversational AI,
              and software development.
            </p>

            <div className="dg-work-tags">
              <span>AI</span>
              <span>VOICE INTERACTION</span>
              <span>SOFTWARE DEVELOPMENT</span>
            </div>
          </div>

          <div className="dg-work-visual">
            <div className="dg-work-visual-top">
              <span>VOICE / AI</span>
              <span>001</span>
            </div>

            <div className="dg-work-orb">
              <div
                ref={projectBallRef}
                className="dg-work-orb-core"
              />

              <div className="dg-work-ring dg-work-ring-one" />
              <div className="dg-work-ring dg-work-ring-two" />
            </div>

            <div className="dg-work-wave">
              {Array.from({ length: 35 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    "--height": `${
                      12 +
                      Math.abs(Math.sin(i * 0.8)) * 50
                    }px`,
                    "--delay": `${-i * 0.08}s`,
                  }}
                />
              ))}
            </div>

            <div className="dg-work-visual-bottom">
              <span>CONCEPT VISUALIZATION</span>
              <span>DG / 001</span>
            </div>
          </div>
        </div>

        <footer className="dg-work-footer">
          <span>PROJECT 01 / 01</span>

          <button
            type="button"
            onClick={backToHome}
            disabled={mode !== "project"}
          >
            BACK TO HOME ↑
          </button>
        </footer>
      </section>
    </div>
  );
}
