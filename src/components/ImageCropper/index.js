import { useState, useRef, useEffect } from "react";
import { crop } from "../utils";

const initialImageSource =
  "https://images.unsplash.com/photo-1572107998877-0f1749cf787b?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&w=400";

const ImageCropper = () => {
  const sourceImgRef = useRef(null);
  const figureContainerRef = useRef(null);
  const [imageSource, setImageSource] = useState(initialImageSource);
  const [imageDimention, setImageDimention] = useState({ width: 100, height: 100, x: 0, y: 0 });
  const [pressing, setPressing] = useState(false);
  const [mouseMoveAxis, setMouseMoveAxis] = useState(null);

  const cropImage = () => {
    //crop(imageSource, outputWidth, outputHeight, cropStartXAxis, cropStartYAxis).then((img)) { do something...})
    const x = imageDimention.x,
      y = imageDimention.y,
      w = imageDimention.width,
      h = imageDimention.height;
    crop(imageSource, w, h, x, y).then((img) => {
      setImageSource(img.src);
    });
  };
  // console.log(sourceImgRef.current.naturalWidth);

  const undo = () => {
    setImageSource(initialImageSource);
  };

  const handleMouseMove = (e) => {
    const rect = figureContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let newImageDimention;
    switch (mouseMoveAxis) {
      case "x":
        newImageDimention = { ...imageDimention, width: x };
        break;
      case "y":
        newImageDimention = { ...imageDimention, height: y };
        break;
      case "xy":
        newImageDimention = { ...imageDimention, width: x, height: y };
        break;
      default:
        newImageDimention = { ...imageDimention };
    }
    setImageDimention(newImageDimention);
  };

  const handleMouseDown = (param) => () => {
    console.log("mouse is down", param);
    setPressing(true);
    setMouseMoveAxis(param);
  };

  const handleMouseUp = () => {
    console.log("mouse is up");
    setPressing(false);
    setMouseMoveAxis(null);
  };

  useEffect(() => {
    setTimeout(() => {
      setImageDimention({
        ...imageDimention,
        width: sourceImgRef.current.naturalWidth,
        height: sourceImgRef.current.naturalHeight,
      });
    }, 100);
  }, []);

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
      <div style={{ display: "flex", margin: "50px 0 50px" }}>
        <button className="btn" id="btn" onClick={cropImage}>
          Crop image
        </button>

        <button className="btn" id="btn" onClick={undo}>
          Undo
        </button>
      </div>

      <div className="image-container" style={{ position: "relative" }}>
        <figure style={{ margin: 0, pointerEvents: "none" }}>
          <img id="img" src={imageSource} alt="..." ref={sourceImgRef}></img>
        </figure>
        <div
          style={{
            outline: "1px solid aqua",
            width: imageDimention.width,
            height: imageDimention.height,
            position: "absolute",
            left: 0,
            top: 0,
          }}
          ref={figureContainerRef}
        >
          <span
            className="handle-right"
            onMouseDown={handleMouseDown("x")}
            style={{
              position: "absolute",
              top: "calc( 50% - 15px)",
              right: -2,
              width: 4,
              height: 30,
              background: "aqua",
              cursor: "e-resize",
            }}
          ></span>
          <span
            className="handle-bottom"
            onMouseDown={handleMouseDown("y")}
            style={{
              position: "absolute",
              left: "calc( 50% - 15px)",
              bottom: -2,
              width: 30,
              height: 4,
              background: "aqua",
              cursor: "n-resize",
            }}
          ></span>
          <span
            className="handle-corner"
            onMouseDown={handleMouseDown("xy")}
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 10,
              height: 10,
              background: "aqua",
              cursor: "nw-resize",
            }}
          ></span>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
