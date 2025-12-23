import React from 'react';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  return (
    <Select value={language} onValueChange={changeLanguage}>
      <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-foreground" data-testid="language-selector">
        <Globe className="w-4 h-4 mr-2" strokeWidth={1.5} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-zinc-950 dark:bg-zinc-950 border-white/10">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="text-white">
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
