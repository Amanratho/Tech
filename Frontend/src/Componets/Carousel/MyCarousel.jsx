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
    // margin-bottom (mb-4) add kiya hai taaki neeche wale text se chipke nahi
    <div className="relative w-full max-w-screen-2xl mx-auto mt-0 mb-4 overflow-hidden select-none">
      
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-[600ms] ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            // 🔥 Height ko Native App banners ke hisaab se chota aur adjust kar diya hai
            className="relative w-full flex-shrink-0
                       h-[150px] sm:h-[180px]
                       md:h-[200px] lg:h-[250px] xl:h-[300px]
                       overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          >
            {/* Smooth overlay that blends into the light app background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-[var(--bg-main)]"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyCarousel;