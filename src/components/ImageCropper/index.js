import React, { useState, useRef, useEffect } from "react";

const ImageCropper = ({ imgAlt, imageSource, imageDimention, updateImageDimention, imgStyles }) => {
  const sourceImgRef = useRef(null);
  const figureContainerRef = useRef(null);
  const [sourceImageDimention, setSourceImageDimention] = useState({ width: 100, height: 100, x: 0, y: 0 });
  const [pressing, setPressing] = useState(false);
  const [mouseMoveAxis, setMouseMoveAxis] = useState(null);
  const [rectOffset, setRectOffset] = useState({ left: 0, top: 0 });

  // console.log(imageDimention, sourceImageDimention);

  const applicableDimention = (sourceValue, value) => {
    if (value < 0) {
      return 0;
    }
    if (value > sourceValue) {
      return sourceValue;
    }
    return value;
  };

  const handleMouseMove = (e) => {
    const rect = figureContainerRef.current.getBoundingClientRect();
    const sourceImageWidth = sourceImageDimention.width;
    const sourceImageHeight = sourceImageDimention.height;
    const getNewImageDimention = (_case) => {
      let width;
      let height;
      const left = applicableDimention(sourceImageWidth, e.pageX - sourceImageDimention.x);
      const top = applicableDimention(sourceImageHeight, e.pageY - sourceImageDimention.y);

      if (_case === "right" || _case === "top-right" || _case === "bottom-right") {
        width = applicableDimention(sourceImageWidth, e.pageX - rect.left);
      }
      if (_case === "bottom" || _case === "bottom-right" || _case === "bottom-left") {
        height = applicableDimention(sourceImageHeight, e.pageY - rect.top);
      }
      if (_case === "top" || _case === "top-right" || _case === "top-left") {
        height = applicableDimention(sourceImageHeight, rect.bottom - e.pageY);
      }
      if (_case === "left" || _case === "bottom-left" || _case === "top-left") {
        width = applicableDimention(sourceImageWidth, rect.right - e.pageX);
      }

      switch (_case) {
        case "right":
          return {
            ...imageDimention,
            width,
          };

        case "bottom":
          return {
            ...imageDimention,
            height,
          };

        case "left":
          return {
            ...imageDimention,
            width,
            x: left,
          };
        case "top":
          return {
            ...imageDimention,
            height,
            y: top,
          };

        case "top-left":
          return {
            ...imageDimention,
            width,
            height,
            x: left,
            y: top,
          };

        case "top-right":
          return {
            ...imageDimention,
            width,
            height,
            y: top,
          };

        case "bottom-left":
          return {
            ...imageDimention,
            width,
            height,
            x: left,
          };

        case "bottom-right":
          return {
            ...imageDimention,
            width,
            height,
          };

        case "rect":
          let rectLeft, rectTop;

          if (e.clientX + rectOffset.left <= 0) {
            rectLeft = 0;
          } else if (e.clientX + rectOffset.left + imageDimention.width >= sourceImageDimention.width) {
            rectLeft = sourceImageDimention.width - imageDimention.width;
          } else {
            rectLeft = e.clientX + rectOffset.left;
          }

          if (e.clientY + rectOffset.top <= 0) {
            rectTop = 0;
          } else if (e.clientY + rectOffset.top + imageDimention.height >= sourceImageDimention.height) {
            rectTop = sourceImageDimention.height - imageDimention.height;
          } else {
            rectTop = e.clientY + rectOffset.top;
          }

          return {
            ...imageDimention,
            x: rectLeft,
            y: rectTop,
          };

        default:
          return { ...imageDimention };
      }
    };

    updateImageDimention(getNewImageDimention(mouseMoveAxis));
  };

  const handleMouseDown = (param) => (e) => {
    setPressing(true);
    setMouseMoveAxis(param);
    setRectOffset({
      left: imageDimention.x - e.clientX,
      top: imageDimention.y - e.clientY,
    });
  };

  const handleMouseUp = () => {
    console.log("mouse is up");
    setPressing(false);
    setMouseMoveAxis(null);
  };

  const handleOnLoad = () => {
    const rect = sourceImgRef.current.getBoundingClientRect();
    setSourceImageDimention(rect);
    updateImageDimention({
      ...imageDimention,
      width: rect.width,
      height: rect.height,
    });
  };

  useEffect(() => {
    if (pressing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [pressing]);
  return (
    <div>
      <div className="image-container" style={{ position: "relative" }}>
        <figure style={{ margin: 0, pointerEvents: "none" }}>
          <img id="img" src={imageSource} alt={imgAlt} ref={sourceImgRef} onLoad={handleOnLoad} style={imgStyles} />
        </figure>
        <div
          style={{
            outline: "1px solid aqua",
            width: imageDimention.width,
            height: imageDimention.height,
            position: "absolute",
            left: imageDimention.x,
            top: imageDimention.y,
          }}
          ref={figureContainerRef}
        >
          <span
            className="move-rect"
            onMouseDown={handleMouseDown("rect")}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
              cursor: "move",
            }}
          />
          <span
            className="handle-right"
            onMouseDown={handleMouseDown("right")}
            style={{
              position: "absolute",
              top: 0,
              right: -2,
              width: 4,
              height: "100%",
              cursor: "e-resize",
            }}
          />
          <span
            className="handle-bottom"
            onMouseDown={handleMouseDown("bottom")}
            style={{
              position: "absolute",
              left: 0,
              bottom: -2,
              width: "100%",
              height: 4,
              cursor: "n-resize",
            }}
          />
          <span
            className="handle-corner"
            onMouseDown={handleMouseDown("bottom-right")}
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 10,
              height: 10,
              border: "3px solid",
              borderColor: "transparent aqua aqua transparent",
              cursor: "nw-resize",
            }}
          />
          <span
            className="handle-right"
            onMouseDown={handleMouseDown("left")}
            style={{
              position: "absolute",
              top: 0,
              left: -2,
              width: 4,
              height: "100%",
              cursor: "e-resize",
            }}
          />
          <span
            className="handle-bottom"
            onMouseDown={handleMouseDown("top")}
            style={{
              position: "absolute",
              left: 0,
              top: -2,
              width: "100%",
              height: 4,
              cursor: "n-resize",
            }}
          />
          <span
            className="handle-corner"
            onMouseDown={handleMouseDown("top-left")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 10,
              height: 10,
              border: "3px solid",
              borderColor: "aqua transparent transparent aqua",
              cursor: "nw-resize",
            }}
          />
          <span
            className="handle-corner"
            onMouseDown={handleMouseDown("top-right")}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 10,
              height: 10,
              border: "3px solid",
              borderColor: "aqua aqua transparent transparent",
              cursor: "ne-resize",
            }}
          />
          <span
            className="handle-corner"
            onMouseDown={handleMouseDown("bottom-left")}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 10,
              height: 10,
              border: "3px solid",
              borderColor: "transparent transparent aqua aqua",
              cursor: "ne-resize",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
