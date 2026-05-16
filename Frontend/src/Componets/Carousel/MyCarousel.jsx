import React, { useState, useEffect, useCallback } from "react";
import { slides } from "../../assets/image/assest";

function MyCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning]
  );

  // Auto-advance slides every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentSlide, goToSlide]);

  return (
    <div className="relative w-full max-w-screen-2xl mx-auto mt-16 overflow-hidden select-none">
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-[600ms] ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative w-full flex-shrink-0
                       h-[100px] sm:h-[200px]
                       lg:h-[400px] 2xl:h-[300px]
                       overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyCarousel;

// md:h-[200px] lg:h-[300px] 
// xl:h-[300px] 2xl:h-[300px] 