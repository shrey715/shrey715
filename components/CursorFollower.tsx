"use client";
import React, { useState, useEffect } from "react";
import AnimatedCursor from 'react-animated-cursor';

const CursorFollower = () => {
  const [hasMouse, setHasMouse] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setHasMouse(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHasMouse(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);
  
  return (
    hasMouse && <AnimatedCursor
      innerSize={12} 
      outerSize={12} 
      color='255, 255, 255'
      outerAlpha={0.2}
      innerScale={0.7}
      outerScale={5}
      outerStyle={{
        mixBlendMode: 'difference',
      }}
      innerStyle={{
        mixBlendMode: 'difference',
      }}
    />
  );
}

export default CursorFollower;