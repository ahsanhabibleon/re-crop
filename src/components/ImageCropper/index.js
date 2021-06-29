import { useState, useRef, useEffect } from "react";
import { crop } from "./utils";

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
    const maxWidthHeight = {
      width: x < 0 ? 0 : x <= sourceImgRef.current.naturalWidth ? x : sourceImgRef.current.naturalWidth,
      height: y < 0 ? 0 : y <= sourceImgRef.current.naturalHeight ? y : sourceImgRef.current.naturalHeight,
    };
    console.log("rect", rect.width - maxWidthHeight.width);
    let newImageDimention;
    switch (mouseMoveAxis) {
      case "x":
        newImageDimention = { ...imageDimention, width: maxWidthHeight.width };
        break;
      case "y":
        newImageDimention = { ...imageDimention, height: maxWidthHeight.height };
        break;
      case "xy":
        newImageDimention = { ...imageDimention, width: maxWidthHeight.width, height: maxWidthHeight.height };
        break;
      case "-x":
        newImageDimention = { ...imageDimention, width: rect.width - x };
        break;
      default:
        newImageDimention = { ...imageDimention };
    }
    setImageDimention(newImageDimention);
    console.log(e.clientX, rect);
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

  const handleOnLoad = () => {
    setImageDimention({
      ...imageDimention,
      width: sourceImgRef.current.naturalWidth,
      height: sourceImgRef.current.naturalHeight,
    });
  };

  const handleImageUpload = (e) => {
    console.log(e);
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      setImageSource(reader.result);
    };
    reader.readAsDataURL(file);
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
      <input type="file" name="" id="" onChange={handleImageUpload} />
      <div style={{ display: "flex", margin: "50px 0 50px" }}>
        <button className="btn" id="btn" onClick={cropImage}>
          Crop image
        </button>

        <button className="btn" id="btn" onClick={undo}>
          Undo
        </button>
      </div>

      <div className="image-container" style={{ position: "relative", margin: 100 }}>
        <figure style={{ margin: 0, pointerEvents: "none" }}>
          <img id="img" src={imageSource} alt="..." ref={sourceImgRef} onLoad={handleOnLoad}></img>
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
            className="handle-right"
            onMouseDown={handleMouseDown("x")}
            style={{
              position: "absolute",
              top: 0,
              right: -2,
              width: 4,
              height: "100%",
              cursor: "e-resize",
            }}
          ></span>
          <span
            className="handle-bottom"
            onMouseDown={handleMouseDown("y")}
            style={{
              position: "absolute",
              left: 0,
              bottom: -2,
              width: "100%",
              height: 4,
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
          <span
            className="handle-right"
            onMouseDown={handleMouseDown("-x")}
            style={{
              position: "absolute",
              top: 0,
              left: -2,
              width: 4,
              height: "100%",
              cursor: "e-resize",
            }}
          ></span>
          <span
            className="handle-bottom"
            onMouseDown={handleMouseDown("y")}
            style={{
              position: "absolute",
              left: 0,
              top: -2,
              width: "100%",
              height: 4,
              cursor: "n-resize",
            }}
          ></span>
          <span
            className="handle-corner"
            onMouseDown={handleMouseDown("xy")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
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
