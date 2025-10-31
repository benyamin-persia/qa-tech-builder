"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { useUser } from "../../contexts/UserContext";

const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

const AnimatedCharacters = ({ className }) => {
  const { userProfile, updateCharactersPosition } = useUser();
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isBlackLeftEyeBlinking, setIsBlackLeftEyeBlinking] = useState(false);
  const [isBlackRightEyeBlinking, setIsBlackRightEyeBlinking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(() => {
    // Try localStorage first (works for all users)
    const savedPosition = localStorage.getItem('charactersPosition');
    if (savedPosition) {
      try {
        return JSON.parse(savedPosition);
      } catch (e) {
        return { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 900, y: 200 };
      }
    }
    // Fall back to user profile (for logged-in users)
    return userProfile?.charactersPosition || { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 900, y: 200 };
  });
  const [sizes, setSizes] = useState(() => {
    const savedSizes = localStorage.getItem('charactersSizes');
    if (savedSizes) {
      try {
        return JSON.parse(savedSizes);
      } catch (e) {
        return { purple: 133, black: 98, orange: 67, yellow: 45 };
      }
    }
    return { purple: 133, black: 98, orange: 67, yellow: 45 };
  });
  const [purpleLeftEyePosition, setPurpleLeftEyePosition] = useState({ x: 0, y: 0 });
  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
      
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Sync with user profile
  useEffect(() => {
    if (userProfile?.charactersPosition) {
      setPosition(userProfile.charactersPosition);
    }
  }, [userProfile?.charactersPosition]);

  // Save position changes to user profile (works for both logged in and logged out users)
  useEffect(() => {
    // Save to localStorage for immediate persistence
    const savedPosition = JSON.parse(localStorage.getItem('charactersPosition') || '{"x":200,"y":200}');
    
    if (position.x !== savedPosition.x || position.y !== savedPosition.y) {
      localStorage.setItem('charactersPosition', JSON.stringify(position));
      
      // If user is logged in, also save to server
      if (userProfile) {
        const timeoutId = setTimeout(() => {
          updateCharactersPosition(position);
        }, 500); // Delay to prevent rapid updates
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [position, userProfile, updateCharactersPosition]);


  // Force update black character size to 98 (10% taller than 89)
  useEffect(() => {
    setSizes(prev => ({ ...prev, black: 98 }));
  }, []); // Run once on mount

  // Save sizes to localStorage
  useEffect(() => {
    localStorage.setItem('charactersSizes', JSON.stringify(sizes));
  }, [sizes]);

  // Randomly move purple character's left eye
  useEffect(() => {
    const getRandomPosition = () => {
      const x = (Math.random() - 0.5) * 6; // -3 to 3
      const y = (Math.random() - 0.5) * 6; // -3 to 3
      return { x, y };
    };

    // Set initial random position
    setPurpleLeftEyePosition(getRandomPosition());

    // Update position every 2-4 seconds
    const getRandomInterval = () => Math.random() * 2000 + 2000;

    const updatePosition = () => {
      setPurpleLeftEyePosition(getRandomPosition());
      setTimeout(updatePosition, getRandomInterval());
    };

    const timeout = setTimeout(updatePosition, getRandomInterval());
    return () => clearTimeout(timeout);
  }, []);

  // Blinking effects - separated to ensure different timing with slower intervals
  useEffect(() => {
    // Purple character blinking
    const schedulePurpleBlink = () => {
      const getRandomPurpleInterval = () => Math.random() * 7000 + 8000; // 8-15 seconds
      const purpleTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          schedulePurpleBlink();
        }, 150);
      }, getRandomPurpleInterval());
      return purpleTimeout;
    };

    // Black character left eye blinking independently
    const scheduleBlackLeftEyeBlink = () => {
      const getRandomLeftInterval = () => Math.random() * 7000 + 8000; // 8-15 seconds
      const leftTimeout = setTimeout(() => {
        setIsBlackLeftEyeBlinking(true);
        setTimeout(() => {
          setIsBlackLeftEyeBlinking(false);
          scheduleBlackLeftEyeBlink();
        }, 150);
      }, getRandomLeftInterval());
      return leftTimeout;
    };

    // Black character right eye blinking independently
    const scheduleBlackRightEyeBlink = () => {
      const getRandomRightInterval = () => Math.random() * 7000 + 8000; // 8-15 seconds
      const rightTimeout = setTimeout(() => {
        setIsBlackRightEyeBlinking(true);
        setTimeout(() => {
          setIsBlackRightEyeBlinking(false);
          scheduleBlackRightEyeBlink();
        }, 150);
      }, getRandomRightInterval());
      return rightTimeout;
    };

    const purpleTimeout = schedulePurpleBlink();
    const blackLeftTimeout = scheduleBlackLeftEyeBlink();
    const blackRightTimeout = scheduleBlackRightEyeBlink();

    return () => {
      clearTimeout(purpleTimeout);
      clearTimeout(blackLeftTimeout);
      clearTimeout(blackRightTimeout);
    };
  }, []);

  const calculatePosition = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    // Calculate safe movement limits based on character width
    const characterWidth = rect.width;
    const maxMoveX = (characterWidth / 2) - 10; // Leave 10px margin for eyes
    
    const faceX = Math.max(-maxMoveX, Math.min(maxMoveX, deltaX / 20));
    const faceY = Math.max(-5, Math.min(5, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleResizeMouseDown = (character, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startSize = sizes[character];

    const handleResizeMouseMove = (e) => {
      const deltaY = e.clientY - startY;
      const newSize = Math.max(30, Math.min(200, startSize - deltaY));
      setSizes(prev => ({ ...prev, [character]: newSize }));
    };

    const handleResizeMouseUp = () => {
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
    };

    window.addEventListener('mousemove', handleResizeMouseMove);
    window.addEventListener('mouseup', handleResizeMouseUp);
  };

  return (
    <div className={cn("relative w-full h-full", className)}>
      
      {/* Characters positioned overlapping each other - Draggable */}
      <div 
        ref={containerRef}
        className="absolute cursor-move select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '183px',
          height: '133px',
          transform: 'translate(-50%, 0)',
          opacity: 1,
          zIndex: 99999,
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
          pointerEvents: 'auto',
        }}
        onMouseDown={handleMouseDown}
      >
        
        {/* Purple tall rectangle character - Back layer (z-1) */}
        <div 
          ref={purpleRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: '23px',
            width: '60px',
            height: `${sizes.purple}px`,
            backgroundColor: '#6C3FF5',
            borderRadius: '10px 10px 0 0',
            zIndex: 1,
            transform: `skewX(${purplePos.bodySkew}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Resize handle */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown('purple', e)}
          />
          {/* Eyes */}
          <div 
            className="absolute flex gap-2 transition-all duration-700 ease-in-out"
            style={{
              left: `${15 + purplePos.faceX}px`,
              top: `${13 + purplePos.faceY}px`,
            }}
          >
            <EyeBall 
              size={10} 
              pupilSize={4} 
              maxDistance={2} 
              eyeColor="white" 
              pupilColor="#2D2D2D" 
              isBlinking={isPurpleBlinking}
              forceLookX={purpleLeftEyePosition.x}
              forceLookY={purpleLeftEyePosition.y}
            />
            <EyeBall 
              size={10} 
              pupilSize={4} 
              maxDistance={2} 
              eyeColor="white" 
              pupilColor="#2D2D2D" 
              isBlinking={isPurpleBlinking}
            />
          </div>
        </div>

        {/* Black medium rectangle character - Middle layer (z-2) */}
        <div 
          ref={blackRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: '74px',
            width: '40px',
            height: `${sizes.black}px`,
            backgroundColor: '#2D2D2D',
            borderRadius: '8px 8px 0 0',
            zIndex: 2,
            transform: `skewX(${blackPos.bodySkew}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Resize handle */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown('black', e)}
          />
          {/* Eyes */}
          <div 
            className="absolute flex gap-0 transition-all duration-700 ease-in-out"
            style={{
              left: `${9 + blackPos.faceX}px`,
              top: `${11 + blackPos.faceY}px`,
            }}
          >
            <EyeBall 
              size={8} 
              pupilSize={4} 
              maxDistance={1} 
              eyeColor="white" 
              pupilColor="#2D2D2D" 
              isBlinking={isBlackLeftEyeBlinking}
            />
            <EyeBall 
              size={8} 
              pupilSize={4} 
              maxDistance={1} 
              eyeColor="white" 
              pupilColor="#2D2D2D" 
              isBlinking={isBlackRightEyeBlinking}
            />
          </div>
        </div>

        {/* Orange semi-circle character - Front left (z-3) */}
        <div 
          ref={orangeRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: '0px',
            width: '80px',
            height: `${sizes.orange}px`,
            backgroundColor: '#FF9B6B',
            borderRadius: '40px 40px 0 0',
            zIndex: 3,
            transform: `skewX(${orangePos.bodySkew}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Resize handle */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown('orange', e)}
          />
          {/* Eyes - white circles behind glasses */}
          <div 
            className="absolute flex gap-0 transition-all duration-200 ease-out"
            style={{
              left: `${20 + orangePos.faceX}px`,
              top: `${20 + orangePos.faceY}px`,
            }}
          >
            <EyeBall size={16} pupilSize={4} maxDistance={3} eyeColor="white" pupilColor="#2D2D2D" isBlinking={false} />
            <div style={{ marginLeft: '6px' }}>
              <EyeBall size={16} pupilSize={4} maxDistance={3} eyeColor="white" pupilColor="#2D2D2D" isBlinking={false} />
            </div>
          </div>
          {/* Glasses - overlay on top of eyes */}
          <div 
            className="absolute transition-all duration-200 ease-out"
            style={{
              left: `${20 + orangePos.faceX}px`,
              top: `${20 + orangePos.faceY}px`,
              zIndex: 10,
            }}
          >
            {/* Left lens frame */}
            <div 
              className="absolute border-[3px] border-[#2D2D2D] rounded-full bg-transparent"
              style={{
                width: '16px',
                height: '16px',
              }}
            />
            {/* Right lens frame */}
            <div 
              className="absolute border-[3px] border-[#2D2D2D] rounded-full bg-transparent"
              style={{
                left: '22px',
                width: '16px',
                height: '16px',
              }}
            />
            {/* Bridge */}
            <div 
              className="absolute bg-[#2D2D2D]"
              style={{
                left: '16px',
                top: '7px',
                width: '8px',
                height: '2px',
              }}
            />
          </div>
        </div>

        {/* Yellow rounded rectangle character - Front right (z-4) */}
        <div 
          ref={yellowRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: '103px',
            width: '46px',
            height: `${sizes.yellow}px`,
            backgroundColor: '#E8D754',
            borderRadius: '23px 23px 0 0',
            zIndex: 4,
            transform: `skewX(${yellowPos.bodySkew}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Resize handle */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown('yellow', e)}
          />
          {/* Eyes - just pupils */}
          <div 
            className="absolute flex gap-2 transition-all duration-200 ease-out"
            style={{
              left: `${17 + yellowPos.faceX}px`,
              top: `${13 + yellowPos.faceY}px`,
            }}
          >
            <Pupil size={4} maxDistance={2} pupilColor="#2D2D2D" />
            <Pupil size={4} maxDistance={2} pupilColor="#2D2D2D" />
          </div>
          {/* Mouth */}
          <div 
            className="absolute w-7 h-1 bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
            style={{
              left: `${13 + yellowPos.faceX}px`,
              top: `${29 + yellowPos.faceY}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { AnimatedCharacters };
