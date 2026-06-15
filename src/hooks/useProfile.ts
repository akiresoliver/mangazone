import { useState } from 'react';

// Compress and convert image to base64
export const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Use webp or jpeg with lower quality to save localstorage space
        const dataUrl = canvas.toDataURL('image/webp', 0.6);
        resolve(dataUrl);
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

export function useProfile() {
  const [banner, setBannerState] = useState<string | null>(() => {
    return localStorage.getItem('mangastop_banner');
  });

  const [avatar, setAvatarState] = useState<string | null>(() => {
    return localStorage.getItem('mangastop_avatar');
  });

  const updateBanner = async (file: File) => {
    try {
      const base64 = await processImage(file);
      setBannerState(base64);
      localStorage.setItem('mangastop_banner', base64);
    } catch (error) {
      console.error('Failed to process banner image', error);
      alert('Erro ao processar imagem.');
    }
  };

  const updateAvatar = async (file: File) => {
    try {
      const base64 = await processImage(file);
      setAvatarState(base64);
      localStorage.setItem('mangastop_avatar', base64);
    } catch (error) {
      console.error('Failed to process avatar image', error);
      alert('Erro ao processar imagem.');
    }
  };

  return { banner, avatar, updateBanner, updateAvatar };
}
