// frontend/src/context/SearchContext.jsx
//
// Satu sumber kebenaran untuk teks pencarian — sebelumnya ada 2 search box
// terpisah (Navbar.jsx yang tidak berfungsi, dan state lokal di Home.jsx
// yang berfungsi tapi terpisah). Sekarang keduanya berbagi state yang sama
// lewat Context ini, supaya cuma ada satu yang aktif & konsisten.

import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
