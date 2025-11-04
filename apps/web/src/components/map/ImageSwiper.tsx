"use client";

import { X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// --- DATA STRUCTURE INTERFACE ---
interface CardData {
  id: string;
  imageUrl: string;
  title: string;
  caption?: string;
}

// --- PROPS INTERFACE ---
interface ImageSwiperProps {
  cards: CardData[];
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
  onClose: () => void;
  onViewFullStory: () => void;
  travelTitle: string;
}

export const ImageSwiper: React.FC<ImageSwiperProps> = ({
  cards,
  cardWidth = 320,
  cardHeight = 480,
  className = "",
  onClose,
  onViewFullStory,
  travelTitle,
}) => {
  // --- STATE AND REFS ---
  const cardStackRef = useRef<HTMLDivElement>(null);
  const isSwiping = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // The cardOrder state tracks the visual order of the cards in the stack.
  const [cardOrder, setCardOrder] = useState<number[]>(() =>
    Array.from({ length: cards.length }, (_, i) => i)
  );

  // --- HELPER FUNCTIONS (MEMOIZED) ---

  // Gets all card elements from the DOM.
  const getCards = useCallback((): HTMLElement[] => {
    if (!cardStackRef.current) return [];
    return Array.from(cardStackRef.current.querySelectorAll(".image-card"));
  }, []);

  // Gets the topmost card element.
  const getActiveCard = useCallback(
    (): HTMLElement | null => getCards()[0] || null,
    [getCards]
  );

  // Updates CSS custom properties for all cards to position them in a stack.
  const updateCardPositions = useCallback(() => {
    for (const [i, card] of getCards().entries()) {
      card.style.setProperty("--i", i.toString());
      card.style.setProperty("--swipe-x", "0px");
      card.style.setProperty("--swipe-rotate", "0deg");
      card.style.opacity = "1";
      card.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    }
  }, [getCards]);

  // Applies instantaneous swipe styles to the active card during a drag.
  const applySwipeStyles = useCallback(
    (deltaX: number) => {
      const card = getActiveCard();
      if (!card) return;
      const rotation = deltaX * 0.1; // Rotation based on horizontal movement
      const opacity = 1 - Math.abs(deltaX) / (cardWidth * 1.5); // Fade out as it moves
      card.style.setProperty("--swipe-x", `${deltaX}px`);
      card.style.setProperty("--swipe-rotate", `${rotation}deg`);
      card.style.opacity = opacity.toString();
    },
    [getActiveCard, cardWidth]
  );

  // --- INTERACTION HANDLERS (MEMOIZED) ---

  // Called on pointerdown: captures starting position and disables card transition.
  const handleStart = useCallback(
    (clientX: number) => {
      if (isSwiping.current) return;
      isSwiping.current = true;
      startX.current = clientX;
      currentX.current = clientX;

      const card = getActiveCard();
      if (card) {
        card.style.transition = "none"; // Allow direct manipulation
      }

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    },
    [getActiveCard]
  );

  // Called on pointermove: calculates drag distance and applies styles via rAF.
  const handleMove = useCallback(
    (clientX: number) => {
      if (!isSwiping.current) return;
      currentX.current = clientX;

      animationFrameId.current = requestAnimationFrame(() => {
        const deltaX = currentX.current - startX.current;
        applySwipeStyles(deltaX);
      });
    },
    [applySwipeStyles]
  );

  // Called on pointerup: determines whether to swipe away or snap back.
  const handleEnd = useCallback(() => {
    if (!isSwiping.current) return;
    isSwiping.current = false;

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    const deltaX = currentX.current - startX.current;
    const threshold = cardWidth / 3; // Swipe threshold is 1/3 of the card's width
    const card = getActiveCard();
    if (!card) return;

    // Re-enable transition for the swipe or snap-back animation.
    card.style.transition = "transform 0.3s ease, opacity 0.3s ease";

    if (Math.abs(deltaX) > threshold) {
      // --- SWIPE AWAY ---
      const direction = Math.sign(deltaX);
      const swipeOutX = direction * (cardWidth * 1.5);
      card.style.setProperty("--swipe-x", `${swipeOutX}px`);
      card.style.setProperty("--swipe-rotate", `${direction * 15}deg`);
      card.style.opacity = "0";

      // After animation, move the card to the back of the stack.
      setTimeout(() => {
        setCardOrder((prev) => [...prev.slice(1), prev[0]]);
      }, 300); // Must match transition duration
    } else {
      // --- SNAP BACK ---
      applySwipeStyles(0); // Resets to initial state with animation
    }
  }, [getActiveCard, applySwipeStyles, cardWidth]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // --- LIFECYCLE HOOKS ---

  // Effect to add and clean up pointer event listeners.
  useEffect(() => {
    const element = cardStackRef.current;
    if (!element) return;

    const onPointerDown = (e: PointerEvent) => handleStart(e.clientX);
    const onPointerMove = (e: PointerEvent) => handleMove(e.clientX);
    const onPointerUp = () => handleEnd();
    const onPointerLeave = () => handleEnd(); // Also end swipe if cursor leaves element

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointerleave", onPointerLeave);

    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointerleave", onPointerLeave);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleStart, handleMove, handleEnd]);

  // Effect to update card positions whenever the order changes.
  useEffect(() => {
    updateCardPositions();
  }, [cardOrder, updateCardPositions]);

  // --- RENDER ---
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - transparent to work with map overlay */}
      <button
        aria-label="Close gallery backdrop"
        className={`pointer-events-auto absolute inset-0 bg-transparent transition-all duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        type="button"
      />

      {/* Main Container */}
      <div
        className={`pointer-events-auto relative z-10 flex flex-col items-center gap-6 transition-all duration-300 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-95 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          aria-label="Close gallery"
          className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20"
          onClick={handleClose}
          type="button"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Card Stack */}
        <section
          className={`relative grid select-none place-content-center ${className}`}
          ref={cardStackRef}
          style={
            {
              width: cardWidth + 32,
              height: cardHeight + 32,
              perspective: "1000px",
              touchAction: "none",
            } as React.CSSProperties
          }
        >
          {cardOrder.map((originalIndex) => {
            const card = cards[originalIndex];
            const displayIndex = cardOrder.indexOf(originalIndex);
            return (
              <article
                className="image-card absolute cursor-grab place-self-center overflow-hidden rounded-2xl border-2 border-white/20 bg-slate-900 shadow-2xl will-change-transform active:cursor-grabbing"
                key={card.id}
                style={
                  {
                    "--i": displayIndex.toString(),
                    "--swipe-x": "0px",
                    "--swipe-rotate": "0deg",
                    width: cardWidth,
                    height: cardHeight,
                    zIndex: cards.length - displayIndex,
                    transform: `
                      translateY(calc(var(--i) * 10px))
                      translateZ(calc(var(--i) * -45px))
                      translateX(var(--swipe-x))
                      rotate(var(--swipe-rotate))
                    `,
                  } as React.CSSProperties
                }
              >
                <img
                  alt={card.caption || card.title}
                  className="pointer-events-none h-full w-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://placehold.co/${cardWidth}x${cardHeight}/2d3748/e2e8f0?text=Image+Not+Found`;
                  }}
                  src={card.imageUrl}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="font-bold text-white text-xl drop-shadow-lg">
                    {card.caption || card.title}
                  </h3>
                </div>
              </article>
            );
          })}
        </section>

        {/* Info and Action Button */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-black/50 px-4 py-2 font-medium text-sm text-white backdrop-blur-sm">
            {cards.length} {cards.length === 1 ? "photo" : "photos"} •{" "}
            {travelTitle}
          </div>
          <button
            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            onClick={onViewFullStory}
            type="button"
          >
            View Full Story →
          </button>
        </div>
      </div>
    </div>
  );
};
