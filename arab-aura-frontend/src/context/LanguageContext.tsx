import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("app_lang") as Language) || "ar";
  });

  const toggleLanguage = () => {
    const nextLang = lang === "ar" ? "en" : "ar";
    setLang(nextLang);
    localStorage.setItem("app_lang", nextLang);
  };

  const isRtl = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
