import React from "react";
import { Carousel } from "react-bootstrap";
import { slides } from "../../assets/image/assest";

function MyCarousel() {
  return (
    <Carousel
      controls={false} 
      indicators={false}
      interval={3000}
      pause="hover"
      className="w-full max-w-screen-2xl mx-auto mt-16"
    >
      {slides.map((slide, index) => (
        <Carousel.Item key={index}>
          <div
            className="relative w-full  
                       h-[100px] sm:h-[200px] 
                     
                       lg:h-[400px] 2xl:h-[300px]
                       overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default MyCarousel;

// md:h-[200px] lg:h-[300px] 
// xl:h-[300px] 2xl:h-[300px] 