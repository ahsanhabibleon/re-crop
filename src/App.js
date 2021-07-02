import React, { useState } from "react";
import { crop } from "./utils";
import ImageCropper from "./components/ImageCropper";

const initialImageSource =
  "https://images.unsplash.com/photo-1572107998877-0f1749cf787b?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&w=400";
function App() {
  const [imageSource, setImageSource] = useState(initialImageSource);
  const [imageDimention, setImageDimention] = useState({
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const cropImage = () => {
    // crop(imageSource, outputWidth, outputHeight, cropStartXAxis, cropStartYAxis).then((img)) { do something...})
    const x = imageDimention.x;
    const y = imageDimention.y;
    const w = imageDimention.width;
    const h = imageDimention.height;
    crop(imageSource, w, h, x, y)
      .then((img) => {
        setImageSource(img.src);
      })
      .then(() => {
        setImageDimention({
          ...imageDimention,
          x: 0,
          y: 0,
        });
      });
  };

  const undo = () => {
    setImageSource(initialImageSource);
  };

  const updateImageDimention = (val) => {
    setImageDimention(val);
  };
  return (
    <div className="App">
      <div style={{ marginBottom: 50 }}>
        <button onClick={cropImage}>Crop image</button>
        <button onClick={undo}>Undo</button>
      </div>
      <ImageCropper
        imageSource={imageSource}
        imageDimention={imageDimention}
        updateImageDimention={updateImageDimention}
      />
    </div>
  );
}

export default App;
