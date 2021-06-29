import { useState, useRef, useEffect } from "react";
import { crop } from "./utils";

const initialImageSource =
  "https://images.unsplash.com/photo-1572107998877-0f1749cf787b?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&w=400";

const ImageCropper = () => {
  const sourceImgRef = useRef(null);
  const figureContainerRef = useRef(null);
  const figureContainerGhostRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSource, setImageSource] = useState(initialImageSource);
  const [originalImageDimention, setOriginalImageDimention] = useState({});
  const [outputImageDimention, setOutputImageDimention] = useState({ width: 100, height: 100, x: 0, y: 0 });

  const handleImageLoad = () => {
    setImageLoaded(true);
    setOriginalImageDimention(sourceImgRef.current.getBoundingClientRect());
  };
  const cropImage = () => {
    //crop(imageSource, outputWidth, outputHeight, cropStartXAxis, cropStartYAxis).then((img)) { do something...})
    const x = outputImageDimention.x,
      y = outputImageDimention.y,
      w = outputImageDimention.width,
      h = outputImageDimention.height;
    crop(imageSource, w, h, x, y).then((img) => {
      setImageSource(img.src);
    });
  };
  // console.log(sourceImgRef.current.naturalWidth);
  // console.log(sourceImgRef.current.getBoundingClientRect());

  const undo = () => {
    setImageSource(initialImageSource);
  };

  // console.log(sourceImgRef, figureContainerRef);

  // Minimum resizable area
  var minWidth = 60;
  var minHeight = 40;

  // Thresholds
  var FULLSCREEN_MARGINS = -10;
  var MARGINS = 4;

  // End of what's configurable.
  var clicked = null;
  var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;

  var rightScreenEdge, bottomScreenEdge;

  var preSnapped;

  var b, x, y;

  var redraw = false;
  // var pane = figureContainerRef.current;
  var pane = document.getElementById("pane");
  var ghostpane = document.getElementById("ghostpane");
  // var ghostpane = figureContainerGhostRef.current;

  function setBounds(element, x, y, w, h) {
    element.style.left = x + "px";
    element.style.top = y + "px";
    element.style.width = w + "px";
    element.style.height = h + "px";
  }

  function hintHide() {
    setBounds(ghostpane, b.left, b.top, b.width, b.height);
    ghostpane.style.opacity = 0;

    // var b = ghostpane.getBoundingClientRect();
    // ghostpane.style.top = b.top + b.height / 2;
    // ghostpane.style.left = b.left + b.width / 2;
    // ghostpane.style.width = 0;
    // ghostpane.style.height = 0;
  }

  // Mouse events
  // pane.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  // Touch events
  // pane.addEventListener("touchstart", onTouchDown);
  window.addEventListener("touchmove", onTouchMove);
  window.addEventListener("touchend", onTouchEnd);

  function onTouchDown(e) {
    onDown(e.touches[0]);
    e.preventDefault();
  }

  function onTouchMove(e) {
    onMove(e.touches[0]);
  }

  function onTouchEnd(e) {
    if (e.touches.length === 0) onUp(e.changedTouches[0]);
  }

  function onMouseDown(e) {
    onDown(e);
    e.preventDefault();
  }

  function onDown(e) {
    calc(e);

    var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

    clicked = {
      x: x,
      y: y,
      cx: e.clientX,
      cy: e.clientY,
      w: b.width,
      h: b.height,
      isResizing: isResizing,
      isMoving: !isResizing && canMove(),
      onTopEdge: onTopEdge,
      onLeftEdge: onLeftEdge,
      onRightEdge: onRightEdge,
      onBottomEdge: onBottomEdge,
    };
  }

  function canMove() {
    return x > 0 && x < b.width && y > 0 && y < b.height && y < 30;
  }

  function calc(e) {
    b = originalImageDimention;
    x = e.clientX - b.left;
    y = e.clientY - b.top;

    onTopEdge = y < MARGINS;
    onLeftEdge = x < MARGINS;
    onRightEdge = x >= b.width - MARGINS;
    onBottomEdge = y >= b.height - MARGINS;

    rightScreenEdge = window.innerWidth - MARGINS;
    bottomScreenEdge = window.innerHeight - MARGINS;
  }

  var e;

  function onMove(ee) {
    calc(ee);

    e = ee;

    redraw = true;
  }

  function animate() {
    requestAnimationFrame(animate);

    if (!redraw) return;

    redraw = false;

    if (clicked && clicked.isResizing) {
      if (clicked.onRightEdge) pane.style.width = Math.max(x, minWidth) + "px";
      if (clicked.onBottomEdge) pane.style.height = Math.max(y, minHeight) + "px";

      if (clicked.onLeftEdge) {
        var currentWidth = Math.max(clicked.cx - e.clientX + clicked.w, minWidth);
        if (currentWidth > minWidth) {
          pane.style.width = currentWidth + "px";
          pane.style.left = e.clientX + "px";
        }
      }

      if (clicked.onTopEdge) {
        var currentHeight = Math.max(clicked.cy - e.clientY + clicked.h, minHeight);
        if (currentHeight > minHeight) {
          pane.style.height = currentHeight + "px";
          pane.style.top = e.clientY + "px";
        }
      }

      hintHide();

      return;
    }

    if (clicked && clicked.isMoving) {
      if (
        b.top < FULLSCREEN_MARGINS ||
        b.left < FULLSCREEN_MARGINS ||
        b.right > window.innerWidth - FULLSCREEN_MARGINS ||
        b.bottom > window.innerHeight - FULLSCREEN_MARGINS
      ) {
        // hintFull();
        setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight);
        ghostpane.style.opacity = 0.2;
      } else if (b.top < MARGINS) {
        // hintTop();
        setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight / 2);
        ghostpane.style.opacity = 0.2;
      } else if (b.left < MARGINS) {
        // hintLeft();
        setBounds(ghostpane, 0, 0, window.innerWidth / 2, window.innerHeight);
        ghostpane.style.opacity = 0.2;
      } else if (b.right > rightScreenEdge) {
        // hintRight();
        setBounds(ghostpane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        ghostpane.style.opacity = 0.2;
      } else if (b.bottom > bottomScreenEdge) {
        // hintBottom();
        setBounds(ghostpane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
        ghostpane.style.opacity = 0.2;
      } else {
        hintHide();
      }

      if (preSnapped) {
        setBounds(
          pane,
          e.clientX - preSnapped.width / 2,
          e.clientY - Math.min(clicked.y, preSnapped.height),
          preSnapped.width,
          preSnapped.height
        );
        return;
      }

      // moving
      pane.style.top = e.clientY - clicked.y + "px";
      pane.style.left = e.clientX - clicked.x + "px";

      return;
    }

    // This code executes when mouse moves without clicking
    // console.log(pane, ghostpane);

    // style cursor

    if (imageLoaded) {
      if ((onRightEdge && onBottomEdge) || (onLeftEdge && onTopEdge)) {
        pane.style.cursor = "nwse-resize";
      } else if ((onRightEdge && onTopEdge) || (onBottomEdge && onLeftEdge)) {
        pane.style.cursor = "nesw-resize";
      } else if (onRightEdge || onLeftEdge) {
        pane.style.cursor = "ew-resize";
      } else if (onBottomEdge || onTopEdge) {
        pane.style.cursor = "ns-resize";
      } else if (canMove()) {
        pane.style.cursor = "move";
      } else {
        pane.style.cursor = "default";
      }
    }
  }

  animate();

  function onUp(e) {
    calc(e);

    if (clicked && clicked.isMoving) {
      // Snap
      var snapped = {
        width: b.width,
        height: b.height,
      };

      if (
        b.top < FULLSCREEN_MARGINS ||
        b.left < FULLSCREEN_MARGINS ||
        b.right > window.innerWidth - FULLSCREEN_MARGINS ||
        b.bottom > window.innerHeight - FULLSCREEN_MARGINS
      ) {
        // hintFull();
        setBounds(pane, 0, 0, window.innerWidth, window.innerHeight);
        preSnapped = snapped;
      } else if (b.top < MARGINS) {
        // hintTop();
        setBounds(pane, 0, 0, window.innerWidth, window.innerHeight / 2);
        preSnapped = snapped;
      } else if (b.left < MARGINS) {
        // hintLeft();
        setBounds(pane, 0, 0, window.innerWidth / 2, window.innerHeight);
        preSnapped = snapped;
      } else if (b.right > rightScreenEdge) {
        // hintRight();
        setBounds(pane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        preSnapped = snapped;
      } else if (b.bottom > bottomScreenEdge) {
        // hintBottom();
        setBounds(pane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
        preSnapped = snapped;
      } else {
        preSnapped = null;
      }

      hintHide();
    }

    clicked = null;
  }

  return (
    <div>
      <div style={{ display: "flex", margin: "50px 0 50px" }}>
        <button className="btn" id="btn" onClick={cropImage}>
          Crop image
        </button>

        <button className="btn" id="btn" onClick={undo}>
          Undo
        </button>
      </div>

      <div className="image-container" style={{ position: "relative", margin: 100 }}>
        <figure style={{ margin: 0, pointerEvents: "none" }} onMouseDown={onMouseDown} onTouchStart={onTouchDown}>
          <img id="img" src={imageSource} alt="..." ref={sourceImgRef} onLoad={handleImageLoad} />
        </figure>
        <div
          // style={{
          //   outline: "1px solid aqua",
          //   width: outputImageDimention.width,
          //   height: outputImageDimention.height,
          //   position: "absolute",
          //   left: outputImageDimention.x,
          //   top: outputImageDimention.y,
          // }}
          ref={figureContainerRef}
          id="pane"
        ></div>
        <div
          // style={{
          //   outline: "1px solid aqua",
          //   width: outputImageDimention.width,
          //   height: outputImageDimention.height,
          //   position: "absolute",
          //   left: outputImageDimention.x,
          //   top: outputImageDimention.y,
          // }}
          ref={figureContainerGhostRef}
          id="ghostpane"
        ></div>
      </div>
    </div>
  );
};

export default ImageCropper;
