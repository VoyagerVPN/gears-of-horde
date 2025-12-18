export const formatSmartDate = (dateString: string, locale: 'en' | 'ru' = 'en'): string => {
  const date = new Date(dateString);

  // ЗАЩИТА
  if (isNaN(date.getTime())) {
    return dateString;
  }

  const now = new Date();

  // Сброс времени для сравнения только по датам
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Будущее
  if (diffDays < 0) {
    const locales = { en: 'en-US', ru: 'ru-RU' };
    return new Intl.DateTimeFormat(locales[locale], {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  if (diffDays === 0) {
    return locale === 'ru' ? 'Сегодня' : 'Today';
  }

  if (diffDays === 1) {
    return locale === 'ru' ? 'Вчера' : 'Yesterday';
  }

  if (diffDays === 2) {
    return locale === 'ru' ? 'Позавчера' : 'Day before yesterday';
  }

  if (diffDays >= 3 && diffDays < 7) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return rtf.format(-diffDays, 'day');
  }

  if (diffDays === 7) {
    return locale === 'ru' ? 'Неделю назад' : 'A week ago';
  }

  // Больше 7 дней — абсолютная дата
  const locales = {
    en: 'en-US',
    ru: 'ru-RU'
  };

  return new Intl.DateTimeFormat(locales[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const formatFullDateTime = (dateString: string, locale: 'en' | 'ru' = 'en'): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const locales = { en: 'en-US', ru: 'ru-RU' };

  return new Intl.DateTimeFormat(locales[locale], {
    dateStyle: 'full',
    timeStyle: 'medium'
  }).format(date);
};