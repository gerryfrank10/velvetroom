import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    home: 'Home',
    about: 'About Us',
    contact: 'Contact',
    support: 'Support',
    postListing: 'Post Listing',
    dashboard: 'Dashboard',
    messages: 'Messages',
    signIn: 'Sign In',
    logout: 'Logout',
    search: 'Search',
    filter: 'Filter',
    category: 'Category',
    location: 'Location',
    services: 'Services',
    pricing: 'Pricing',
    viewProfile: 'View Full Profile',
    sendMessage: 'Send Message',
    addToFavorites: 'Add to Favorites',
    buynow: 'Buy Now',
    purchased: 'Purchased'
  },
  fr: {
    home: 'Accueil',
    about: 'À Propos',
    contact: 'Contact',
    support: 'Support',
    postListing: 'Publier une Annonce',
    dashboard: 'Tableau de Bord',
    messages: 'Messages',
    signIn: 'Se Connecter',
    logout: 'Déconnexion',
    search: 'Rechercher',
    filter: 'Filtrer',
    category: 'Catégorie',
    location: 'Emplacement',
    services: 'Services',
    pricing: 'Tarification',
    viewProfile: 'Voir le Profil Complet',
    sendMessage: 'Envoyer un Message',
    addToFavorites: 'Ajouter aux Favoris',
    buynow: 'Acheter Maintenant',
    purchased: 'Acheté'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
