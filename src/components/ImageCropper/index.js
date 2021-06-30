import { useState, useRef, useEffect } from "react";
import { crop } from "./utils";

const initialImageSource =
  "https://images.unsplash.com/photo-1572107998877-0f1749cf787b?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&w=400";

const ImageCropper = () => {
  const sourceImgRef = useRef(null);
  const figureContainerRef = useRef(null);
  const [imageSource, setImageSource] = useState(initialImageSource);
  const [sourceImageDimention, setSourceImageDimention] = useState({ width: 100, height: 100, x: 0, y: 0 });
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

  const undo = () => {
    setImageSource(initialImageSource);
  };

  const handleMouseMove = (e) => {
    const rect = figureContainerRef.current.getBoundingClientRect();
    const sourceImageWidth = sourceImageDimention.width,
      sourceImageHeight = sourceImageDimention.height;
    const getNewImageDimention = (_case) => {
      switch (_case) {
        case "x":
          const _width = e.pageX - rect.left;
          return {
            ...imageDimention,
            width: _width < 0 ? 0 : _width > sourceImageWidth ? sourceImageWidth : _width,
          };

        case "y":
          const _height = e.pageY - rect.top;
          return {
            ...imageDimention,
            height: _height < 0 ? 0 : _height > sourceImageHeight ? sourceImageHeight : _height,
          };

        case "xy":
          const _w = e.pageX - rect.left,
            _h = e.pageY - rect.top;
          return {
            ...imageDimention,
            width: _w < 0 ? 0 : _w > sourceImageWidth ? sourceImageWidth : _w,
            height: _h < 0 ? 0 : _h > sourceImageHeight ? sourceImageHeight : _h,
          };

        case "-x":
          // const _negetiveWidth = sourceImageWidth - (e.pageX - sourceImageDimention.left);
          const _negetiveWidth = rect.right - e.pageX;
          return {
            ...imageDimention,
            width: _negetiveWidth < 0 ? 0 : _negetiveWidth > sourceImageWidth ? sourceImageWidth : _negetiveWidth,
            x: e.pageX - sourceImageDimention.x,
          };
        case "-y":
          const _negetiveHeight = rect.bottom - e.pageY;
          return {
            ...imageDimention,
            height: _negetiveHeight < 0 ? 0 : _negetiveHeight > sourceImageHeight ? sourceImageHeight : _negetiveHeight,
            y: e.pageY - sourceImageDimention.y,
          };

        case "-xy":
          const _negetiveW = rect.right - e.pageX,
            _negentiveH = rect.bottom - e.pageY;
          return {
            ...imageDimention,
            width: _negetiveW < 0 ? 0 : _negetiveW > sourceImageWidth ? sourceImageWidth : _negetiveW,
            height: _negentiveH < 0 ? 0 : _negentiveH > sourceImageHeight ? sourceImageHeight : _negentiveH,
            x: e.pageX - sourceImageDimention.x,
            y: e.pageY - sourceImageDimention.y,
          };

        default:
          return { ...imageDimention };
      }
    };

    setImageDimention(getNewImageDimention(mouseMoveAxis));
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
    const rect = sourceImgRef.current.getBoundingClientRect();
    setSourceImageDimention(rect);
    setImageDimention({
      ...imageDimention,
      width: rect.width,
      height: rect.height,
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
            onMouseDown={handleMouseDown("-y")}
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
            onMouseDown={handleMouseDown("-xy")}
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
