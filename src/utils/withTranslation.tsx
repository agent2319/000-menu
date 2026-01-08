
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
    if (typeof value !== 'string') {
      translated[key] = value;
      return;
    }

    const langKey = `${key}_${lang}`;
    const cacheKey = `${lang}:${value}`;
    
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
