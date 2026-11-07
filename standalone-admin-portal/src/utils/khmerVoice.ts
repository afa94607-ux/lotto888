import { ChannelLetter } from '../types/lottery';

// Authentic Khmer spoken pronunciation for lottery announcements
export const getKhmerChannelSpoken = (channel: ChannelLetter): string => {
  switch (channel) {
    case 'A':
      return 'អា';
    case 'B':
      return 'បេ';
    case 'C':
      return 'សេ';
    case 'D':
      return 'ដេ';
    case 'E':
      return 'អឺ';
  }
};

export const getKhmerNumberSpoken = (numStr: string): string => {
  const n = parseInt(numStr, 10);
  if (isNaN(n)) return numStr;

  const ones = ['', 'មួយ', 'ពីរ', 'បី', 'បួន', 'ប្រាំ', 'ប្រាំមួយ', 'ប្រាំពីរ', 'ប្រាំបី', 'ប្រាំបួន'];
  const tens = ['', 'ដប់', 'ម្ភៃ', 'សាមសិប', 'សែសិប', 'ហាសិប', 'ហុកសិប', 'ចិតសិប', 'ប៉ែតសិប', 'កៅសិប'];

  if (n < 10) {
    return numStr.startsWith('0') ? `សូន្យ ${ones[n]}` : ones[n];
  }
  if (n === 10) return 'ដប់';
  if (n > 10 && n < 20) {
    const digit = n % 10;
    return `ដប់${ones[digit]}`;
  }

  const t = Math.floor(n / 10);
  const d = n % 10;
  if (d === 0) {
    return tens[t];
  }
  return `${tens[t]} ${ones[d]}`;
};

export const announceKhmerDraw = (
  channel: ChannelLetter,
  numStr: string,
  isMuted: boolean
): string => {
  const chKh = getKhmerChannelSpoken(channel);
  const numKh = getKhmerNumberSpoken(numStr);
  const announcementText = `ប៉ុស្តិ៍ ${chKh} លេខ ${numKh}`;

  if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(announcementText);
      utterance.rate = 0.9;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const kmVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes('km') ||
          v.name.toLowerCase().includes('khmer') ||
          v.lang.toLowerCase().includes('kh')
      );

      if (kmVoice) {
        utterance.voice = kmVoice;
        utterance.lang = kmVoice.lang;
      } else {
        utterance.lang = 'km-KH';
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis fallback
    }
  }

  return announcementText;
};
