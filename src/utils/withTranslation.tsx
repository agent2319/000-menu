
import { useStore } from '@/store';
import { translateText } from './autoTranslate';

export const translateData = (data: any, lang: string) => {
  if (!data) return {};
  if (!lang || lang === 'en') return data;

  const state = useStore.getState();
  const translationCache = state.translationCache || {};
  const setTranslation = state.setTranslation || (() => {});

  const translated: any = Array.isArray(data) ? [] : {};

  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== null && typeof value === 'object') {
      translated[key] = translateData(value, lang);
      return;
    }
    
    // SKIP translation for non-strings, URLs, DataURLs, or image-related keys
    const isUrl = typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:') || value.includes('://'));
    const isImageKey = ['url', 'image', 'src', 'imageUrl', 'bgImage', 'avatar', 'logo', 'icon', 'photo'].includes(key);

    if (typeof value !== 'string' || isUrl || isImageKey) {
      translated[key] = value;
      return;
    }

    const langKey = \`\${key}_\${lang}\`;
    const cacheKey = \`\${lang}:\${value}\`;
    
    if (data[langKey] !== undefined) {
      translated[key] = data[langKey];
    } else if (translationCache[cacheKey]) {
      translated[key] = translationCache[cacheKey];
    } else {
      translated[key] = value; 
      translateText(value, lang).then(result => {
        if (result && result !== value) setTranslation(cacheKey, result);
      });
    }
  });

  return translated;
};
