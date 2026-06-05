import { Assets } from "pixi.js";
import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import { useLayoutStore } from "../../store/useLayoutStore";
import { useWinningNumberStore } from "../../store/useWinningNumberStore";
import type { Container } from "pixi.js";
import WinningNumberWheel from "./WinningNumberWheel";
import { sfx } from "../../utils/audio";

const HEADER_BOTTOM_DESKTOP = 42 + 60 / 2;
const HEADER_BOTTOM_MOBILE = 24 + 32 / 2;
const HEADER_GAP = 32;
const SIDE_PADDING = 32;
const TABLE_GAP = 8;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const MAX_WHEEL_MOBILE_PORTRAIT = 290;
const MAX_WHEEL_MOBILE_LANDSCAPE = 310;
const MAX_WHEEL_DESKTOP = 600;

// European roulette wheel sequence (clockwise starting from 0 at top)
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const TOTAL_NUMBERS = WHEEL_NUMBERS.length; // 37
const ANGLE_PER_NUMBER = (2 * Math.PI) / TOTAL_NUMBERS;

// Get the angle for a specific number (0 is at top, angles go clockwise)
const getNumberAngle = (number: number): number => {
  const index = WHEEL_NUMBERS.indexOf(number);
  if (index === -1) return 0;
  // Subtract PI/2 to make 0 at the top (12 o'clock position)
  return index * ANGLE_PER_NUMBER - Math.PI / 2;
};

// Animation timing constants
const BALL_SPIN_DURATION = 5; // Total ball spin time
const WHEEL_SPIN_DURATION = 7; // Total wheel spin time
const BALL_ROTATIONS = 6; // Number of full rotations before settling
const WHEEL_ROTATIONS = 4; // Number of full wheel rotations

// Ball trajectory constants
const OUTER_RADIUS_RATIO = 0.95; // Ball starts at outer edge of base
const MID_RADIUS_RATIO = 0.7; // Ball transitions through this mid-point
const INNER_RADIUS_RATIO = 0.48; // Ball settles on the number ring

const RouletteWheel = ({ onSpinComplete }: { onSpinComplete: () => void }) => {
  const { width, height, layoutMode } = useLayoutStore();
  const { winningNumber } = useWinningNumberStore();
  const rotatingRef = useRef<Container | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const lastWinningNumberRef = useRef<number | null>(null);

  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isDesktop = layoutMode === "desktop";

  // --- Wheel size (capped per layout) ---
  const rawWheelSize = isDesktop
    ? width * 0.35
    : isMobilePortrait
      ? width * 0.8
      : width * 0.33;

  const maxWheel = isDesktop
    ? MAX_WHEEL_DESKTOP
    : isMobilePortrait
      ? MAX_WHEEL_MOBILE_PORTRAIT
      : MAX_WHEEL_MOBILE_LANDSCAPE;

  const wheelSize = Math.min(rawWheelSize, maxWheel);
  const numberRingSize = wheelSize * 0.75;
  const centerSize = numberRingSize * 0.55;
  const wheelRadius = wheelSize / 2;

  // Ball radius positions
  const outerBallRadius = wheelRadius * OUTER_RADIUS_RATIO;
  const midBallRadius = wheelRadius * MID_RADIUS_RATIO;
  const innerBallRadius = wheelRadius * INNER_RADIUS_RATIO;

  // --- Header bottom boundary ---
  const headerBottom = isDesktop ? HEADER_BOTTOM_DESKTOP : HEADER_BOTTOM_MOBILE;

  const gameAreaTop = headerBottom + HEADER_GAP;

  const bettingSettingsHeight = Math.max(48, height * 0.06);
  const footerTop = height - bettingSettingsHeight - TABLE_GAP;

  // --- Wheel position in same panel used by BonusMultiplierContainer ---
  let wheelX = width / 2;
  let wheelY = gameAreaTop + wheelRadius;

  if (isMobilePortrait) {
    const tableW = Math.round(clamp(width * 0.46, 200, 280));
    const tableH = Math.round(clamp(tableW * 1.72, 320, 500));
    const preferredCY = gameAreaTop + (footerTop - gameAreaTop) * 0.72;
    const footerSafeCY = footerTop - tableH / 2 - 10;
    const tableCY = Math.min(preferredCY, footerSafeCY);
    const tableTop = tableCY - tableH / 2;
    const topAreaBottom = tableTop - 16;
    const topAreaCenterY = gameAreaTop + (topAreaBottom - gameAreaTop) / 2;
    wheelX = width / 2;
    wheelY = topAreaCenterY;
  } else {
    const rightMargin = isDesktop ? 24 : 14;
    const tableW = Math.round(
      clamp(
        width * (isDesktop ? 0.37 : 0.39),
        isDesktop ? 400 : 250,
        isDesktop ? 560 : 320,
      ),
    );
    const tableLeft = width - rightMargin - tableW;
    const leftAreaX = SIDE_PADDING;
    const leftAreaW = Math.max(0, tableLeft - 20 - leftAreaX);
    wheelX = leftAreaX + leftAreaW / 2;
    wheelY = gameAreaTop + (footerTop - gameAreaTop) * 0.45;
  }

  // Spin the wheel and ball to the winning number
  const spinToWinningNumber = useCallback(
    (targetNumber: number) => {
      const rotating = rotatingRef.current;
      if (!rotating || isSpinning) return;

      setIsSpinning(true);
      setShowResult(false); // Reset result display when starting new spin

      // Play roulette wheel sound
      sfx.play("sounds-roulette-wheel");

      // Kill any existing animations
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const targetAngle = getNumberAngle(targetNumber);

      // Calculate final wheel rotation (opposite direction to ball)
      const wheelFinalRotation = -(WHEEL_ROTATIONS * Math.PI * 2);

      // Ball starts at outer edge, spins opposite to wheel direction
      const ballStartAngle = Math.random() * Math.PI * 2; // Random start position
      const ballFullRotations = BALL_ROTATIONS * Math.PI * 2;

      // The ball needs to land on the winning number position
      const ballFinalAngle = targetAngle;

      // Create main timeline
      const tl = gsap.timeline({
        onComplete: () => {
          setIsSpinning(false);
          setShowResult(true);
          onSpinComplete();
        },
      });

      timelineRef.current = tl;

      // Animation state object for ball
      const ballState = {
        angle: ballStartAngle,
        radius: outerBallRadius,
      };

      // Phase 1: Ball spins fast on outer track (on the base edge)
      tl.to(
        ballState,
        {
          angle: ballStartAngle + ballFullRotations * 0.4,
          radius: outerBallRadius, // Stay on outer edge
          duration: BALL_SPIN_DURATION * 0.3,
          ease: "none", // Constant speed at first
          onUpdate: () => {
            const x = Math.cos(ballState.angle) * ballState.radius;
            const y = Math.sin(ballState.angle) * ballState.radius;
            setBallPosition({ x, y });
          },
        },
        0,
      );

      // Phase 2: Ball starts decelerating and spiraling inward toward number ring
      tl.to(
        ballState,
        {
          angle: ballStartAngle + ballFullRotations * 0.7,
          radius: midBallRadius, // Move to mid-point
          duration: BALL_SPIN_DURATION * 0.25,
          ease: "power1.out",
          onUpdate: () => {
            // Add slight wobble as ball loses momentum
            const wobble = Math.sin(ballState.angle * 6) * 3;
            const x = Math.cos(ballState.angle) * (ballState.radius + wobble);
            const y = Math.sin(ballState.angle) * (ballState.radius + wobble);
            setBallPosition({ x, y });
          },
        },
        BALL_SPIN_DURATION * 0.3,
      );

      // Phase 3: Ball enters the number ring area with more deceleration
      tl.to(
        ballState,
        {
          angle: ballStartAngle + ballFullRotations * 0.9,
          radius: innerBallRadius + 15, // Just above final position
          duration: BALL_SPIN_DURATION * 0.2,
          ease: "power2.out",
          onUpdate: () => {
            // Stronger wobble as ball hits deflectors
            const wobble = Math.sin(ballState.angle * 10) * 5;
            const x = Math.cos(ballState.angle) * (ballState.radius + wobble);
            const y = Math.sin(ballState.angle) * (ballState.radius + wobble);
            setBallPosition({ x, y });
          },
        },
        BALL_SPIN_DURATION * 0.55,
      );

      // Phase 4: Ball bounces and settles into the winning number pocket
      tl.to(
        ballState,
        {
          angle: ballFinalAngle + ballFullRotations,
          radius: innerBallRadius,
          duration: BALL_SPIN_DURATION * 0.25,
          ease: "power3.out",
          onUpdate: () => {
            // Simulate bouncing as ball settles into pocket
            const phaseProgress =
              (tl.time() - BALL_SPIN_DURATION * 0.75) /
              (BALL_SPIN_DURATION * 0.25);
            const bounceDecay = Math.max(0, 1 - phaseProgress);
            const bounceFreq = 12;
            const bounce =
              Math.sin(phaseProgress * Math.PI * bounceFreq) * bounceDecay * 8;

            const radiusWithBounce = ballState.radius + bounce;
            const x = Math.cos(ballState.angle) * radiusWithBounce;
            const y = Math.sin(ballState.angle) * radiusWithBounce;
            setBallPosition({ x, y });
          },
        },
        BALL_SPIN_DURATION * 0.75,
      );

      // Wheel rotation (spins opposite to ball, slower deceleration)
      tl.to(
        rotating,
        {
          rotation: wheelFinalRotation,
          duration: WHEEL_SPIN_DURATION,
          ease: "power2.out",
        },
        0,
      );

      // Final settling - tiny vibrations as ball comes to complete rest
      tl.to(
        ballState,
        {
          duration: 0.4,
          onUpdate: () => {
            const settleTime = tl.time() - BALL_SPIN_DURATION;
            const settleProgress = Math.min(1, settleTime / 0.4);
            const vibration =
              Math.sin(settleProgress * Math.PI * 25) *
              (1 - settleProgress) *
              2;
            const x =
              Math.cos(ballState.angle) * (ballState.radius + vibration);
            const y =
              Math.sin(ballState.angle) * (ballState.radius + vibration);
            setBallPosition({ x, y });
          },
          onComplete: () => {
            // Ensure ball is exactly on the winning number
            const finalX = Math.cos(ballFinalAngle) * innerBallRadius;
            const finalY = Math.sin(ballFinalAngle) * innerBallRadius;
            setBallPosition({ x: finalX, y: finalY });
          },
        },
        BALL_SPIN_DURATION,
      );
    },
    [
      isSpinning,
      outerBallRadius,
      midBallRadius,
      innerBallRadius,
      onSpinComplete,
    ],
  );

  // Effect to trigger spin when winning number changes
  useEffect(() => {
    if (
      winningNumber !== null &&
      winningNumber !== lastWinningNumberRef.current
    ) {
      lastWinningNumberRef.current = winningNumber;
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        spinToWinningNumber(winningNumber);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [winningNumber, spinToWinningNumber]);

  // Initialize ball position at rest
  useEffect(() => {
    if (!isSpinning && winningNumber !== null) {
      const angle = getNumberAngle(winningNumber);
      const x = Math.cos(angle) * innerBallRadius;
      const y = Math.sin(angle) * innerBallRadius;
      setBallPosition({ x, y });
    } else if (!isSpinning) {
      // Default position at 0 (top of wheel)
      const angle = getNumberAngle(0);
      const x = Math.cos(angle) * innerBallRadius;
      const y = Math.sin(angle) * innerBallRadius;
      setBallPosition({ x, y });
    }
  }, [innerBallRadius, isSpinning, winningNumber]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    <PixiContainer x={wheelX} y={wheelY}>
      {/* Static base */}
      <PixiSprite
        texture={Assets.get("roulette-wheel-base")}
        width={wheelSize}
        height={wheelSize}
        anchor={0.5}
      />
      {/* Rotating inner wheel */}
      <pixiContainer ref={rotatingRef}>
        <PixiSprite
          texture={Assets.get("roulette-wheel-number-ring")}
          width={numberRingSize}
          height={numberRingSize}
          anchor={0.5}
        />
        {/* Show center or winning background based on spin state */}
        {showResult && winningNumber !== null ? (
          <WinningNumberWheel size={centerSize} />
        ) : (
          <PixiSprite
            texture={Assets.get("roulette-wheel-center")}
            width={centerSize}
            height={centerSize}
            anchor={0.5}
          />
        )}
      </pixiContainer>
      {/* Ball - independent of wheel rotation */}
      <PixiSprite
        texture={Assets.get("roulette-wheel-ball")}
        width={centerSize * 0.08}
        height={centerSize * 0.08}
        anchor={0.5}
        x={ballPosition.x}
        y={ballPosition.y}
      />
    </PixiContainer>
  );
};

export default RouletteWheel;
