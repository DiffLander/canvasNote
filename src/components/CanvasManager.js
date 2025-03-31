import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

/**
 * CanvasManager - Manages canvas transformations (panning, zooming)
 * Wraps children with TransformWrapper for these capabilities
 */
const CanvasManager = ({ children }) => {
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(0.5);
  const [isMiddleMouseDown, setIsMiddleMouseDown] = useState(false);
  const transformRef = useRef();

  const handleTransform = useCallback((ref) => {
    const { positionX, positionY, scale } = ref.instance.transformState;
    setCanvasPosition({ x: positionX, y: positionY });
    setCanvasScale(scale);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (transformRef.current) {
        transformRef.current.resetTransform();
      }
    }, 100);
  }, []);

  // Update panning state on mouse down/up
  const handleMouseDown = (e) => {
    if (e.nativeEvent.button === 1) {
      setIsMiddleMouseDown(true);
    }
  };

  const handleMouseUp = (e) => {
    if (e.nativeEvent.button === 1) {
      setIsMiddleMouseDown(false);
    }
  };

  return (
    <div
      className="canvas-manager-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'default'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={0.5}
        initialPositionX={0}
        initialPositionY={0}
        minScale={0.1}
        maxScale={2}
        onTransformed={handleTransform}
        doubleClick={{ disabled: false, mode: 'reset' }}
        wheel={{ disabled: false, step: 0.05 }}
        zoomAnimation={{ disabled: false, size: 0.1 }}
        limitToBounds={false}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Add this wrapper div to intercept mouse down events */}
            <div
              onMouseDown={(e) => {
                // If it's not the middle button (button 1), stop the event
                if (e.nativeEvent.button !== 1) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                  overflow: 'visible'
                }}
                contentStyle={{
                  width: '100%',
                  height: '100%',
                  minWidth: '10000px',
                  minHeight: '10000px'
                }}
              >
                {typeof children === 'function'
                  ? children(canvasPosition, canvasScale)
                  : (
                    <div className="canvas-container">
                      <div className="canvas-background"></div>
                      <div className="canvas" style={{ transform: `scale(${canvasScale})`, transformOrigin: '0 0' }}>
                        {React.Children.map(children, child =>
                          React.cloneElement(child, { canvasScale })
                        )}
                      </div>
                    </div>
                  )
                }
              </TransformComponent>
            </div>
            <div className="zoom-controls">
              <button onClick={() => zoomOut()}>-</button>
              <button onClick={() => resetTransform()}>Reset</button>
              <button onClick={() => zoomIn()}>+</button>
            </div>
          </>
        )}
      </TransformWrapper>

    </div>
  );
};

export default CanvasManager;
