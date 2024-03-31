const video = document.getElementById("videoElement");
      const startButton = document.getElementById("startButton");
      const stopButton = document.getElementById("stopButton");
      const captureButton = document.getElementById("captureButton");
      const uploadButton = document.getElementById("uploadButton");
      const enhanceButton = document.getElementById("enhanceButton");
      const resetButton = document.getElementById("resetButton");
      const deleteButton = document.getElementById("deleteButton");
      const downloadButton = document.getElementById("downloadButton");
      const capturedImagesDiv = document.getElementById("capturedImages");
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const fileInput = document.getElementById("fileInput");
      const modeToggle = document.getElementById("modeToggle");
      let stream = null;
      let capturedImages = [];

      const currentTheme = localStorage.getItem("theme");
      const currentEmoji = localStorage.getItem("emoji");
      if (currentTheme) {
        document.body.classList.add(currentTheme);
      }
      if (currentEmoji) {
        modeToggle.textContent = currentEmoji;
      }

      modeToggle.addEventListener("click", () => {
        // Toggle dark mode class on the body
        document.body.classList.toggle("dark-mode");

        // Update the theme preference in localStorage
        if (document.body.classList.contains("dark-mode")) {
          localStorage.setItem("theme", "dark-mode");
        } else {
          localStorage.setItem("theme", "");
        }

        // Toggle emoji between moon and sun
        if (modeToggle.textContent === "🌙") {
          modeToggle.textContent = "🔆";
          localStorage.setItem("emoji", "🔆"); // Update emoji preference
        } else {
          modeToggle.textContent = "🌙";
          localStorage.setItem("emoji", "🌙"); // Update emoji preference
        }
      });

      startButton.addEventListener("click", () => {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((mediaStream) => {
            stream = mediaStream;
            video.srcObject = stream;
          })
          .catch((error) => {
            console.error("Error accessing media devices:", error);
          });
      });

      stopButton.addEventListener("click", () => {
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
          video.srcObject = null;
          stream = null;
        }
      });

      captureButton.addEventListener("click", () => {
        if (stream) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const capturedImage = new Image();
          capturedImage.src = canvas.toDataURL("image/png");
          capturedImage.classList.add("captured-image");
          capturedImagesDiv.appendChild(capturedImage);
          capturedImages.push(capturedImage);
        }
      });

      uploadButton.addEventListener("click", () => {
        fileInput.click();
      });

      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
              // Resize the image to have a fixed width of 300px and auto height
              const aspectRatio = img.width / img.height;
              const newWidth = 300;
              const newHeight = newWidth / aspectRatio;
              img.width = newWidth;
              img.height = newHeight;
              capturedImagesDiv.appendChild(img);
              capturedImages.push(img);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      enhanceButton.addEventListener("click", () => {
        capturedImages.forEach((image) => {
          applyFilter(image);
        });
      });

      resetButton.addEventListener("click", () => {
        capturedImages.forEach((image) => {
          image.style.filter = "none";
        });
      });

      deleteButton.addEventListener("click", () => {
        if (capturedImages.length > 0) {
          const lastImage = capturedImages.pop();
          capturedImagesDiv.removeChild(lastImage);
        }
      });

      downloadButton.addEventListener("click", () => {
        capturedImages.forEach((image, index) => {
          const link = document.createElement("a");
          const filteredCanvas = applyFilterToCanvas(image);
          link.href = filteredCanvas.toDataURL("image/png");
          link.download = `enhanced_image_${index + 1}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      });

      function applyFilter(image) {
        const filters = [
          "blur(5px)",
          "grayscale(100%)",
          "sepia(50%) saturate(200%)",
          "hue-rotate(200deg) brightness(90%)",
          "brightness(60%)",
        ];
        const randomFilter =
          filters[Math.floor(Math.random() * filters.length)];
        image.style.filter = randomFilter;
      }

      function applyFilterToCanvas(image) {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
        const filter = image.style.filter;
        tempCtx.filter = filter;
        tempCtx.drawImage(
          tempCanvas,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        return tempCanvas;
      }