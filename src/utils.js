export const crop = (url, outputWidth = 100, outputHeight = 100, outputX = 0, outputY = 0) => {
  return new Promise((resolve) => {
    // this image will hold our source image data
    const inputImage = new Image();
    inputImage.crossOrigin = "anonymous";

    // we want to wait for our image to load
    inputImage.onload = () => {
      // create a canvas that will present the output image
      const outputImage = document.createElement("canvas");

      // set it to the same size as the image
      outputImage.width = outputWidth;
      outputImage.height = outputHeight;

      // draw our image at position 0, 0 on the canvas
      const ctx = outputImage.getContext("2d");
      ctx.drawImage(inputImage, -outputX, -outputY);

      //convert the canvas to image
      const imgUrl = outputImage.toDataURL("image/png");
      const img = document.createElement("img");
      img.src = `${imgUrl}`;

      //return the image
      resolve(img);
    };

    // start loading our image
    inputImage.src = url;
  });
};
