export const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');

        const width = 300;
        const height = 400;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#333333';
          ctx.fillRect(0, 0, width, height);

          const imgRatio = img.width / img.height;
          const canvasRatio = width / height;

          let targetWidth, targetHeight, targetX, targetY;

          if (imgRatio > canvasRatio) {
            targetHeight = height;
            targetWidth = height * imgRatio;
            targetY = 0;
            targetX = (width - targetWidth) / 2;
          } else {
            targetWidth = width;
            targetHeight = width / imgRatio;
            targetX = 0;
            targetY = (height - targetHeight) / 2;
          }

          ctx.drawImage(img, targetX, targetY, targetWidth, targetHeight);

          const resizedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(resizedImageUrl);
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};
