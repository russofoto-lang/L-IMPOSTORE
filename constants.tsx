
import React from 'react';

export const INITIAL_NAMES = ['Giocatore 1', 'Giocatore 2', 'Giocatore 3'];

export interface WordCategory {
  name: string;
  icon: string;
  words: string[];
}

export const WORD_CATEGORIES: WordCategory[] = [
  {
    name: "Viaggi & Luoghi",
    icon: "fa-plane",
    words: ["Passaporto", "Valigia", "Aereo", "Mappa", "Bussola", "Spiaggia", "Hotel", "Treno", "Biglietto", "Souvenir", "Aeroporto", "Binario", "Crociera", "Montagna", "Campeggio"],
  },
  {
    name: "Epoche Storiche",
    icon: "fa-landmark",
    words: ["Piramide", "Castello", "Spada", "Corona", "Cavaliere", "Pergamena", "Mummia", "Colosseo", "Trono", "Bandiera", "Armatura", "Vichingo", "Faraone", "Gladiatore"],
  },
  {
    name: "Mondi Fantasy",
    icon: "fa-hat-wizard",
    words: ["Drago", "Bacchetta", "Pozione", "Elfo", "Orco", "Tesoro", "Unicorno", "Mantello", "Cristallo", "Strega", "Fantasma", "Incantesimo", "Goblin", "Sirena"],
  },
  {
    name: "Lavori & Professioni",
    icon: "fa-briefcase",
    words: ["Dottore", "Martello", "Pompiere", "Computer", "Microfono", "Camice", "Lavagna", "Casco", "Bisturi", "Divisa", "Avvocato", "Poliziotto", "Cuoco", "Muratore"],
  },
  {
    name: "Cibo & Ristoranti",
    icon: "fa-utensils",
    words: ["Pizza", "Sushi", "Pasta", "Gelato", "Hamburger", "Forchetta", "Pentola", "Cioccolato", "Coltello", "Caffè", "Ristorante", "Menu", "Bicchiere", "Tovagliolo"],
  },
  {
    name: "Sport & Hobby",
    icon: "fa-futbol",
    words: ["Pallone", "Racchetta", "Piscina", "Medaglia", "Arbitro", "Porta", "Tifoso", "Fischietto", "Palestra", "Sci", "Calcio", "Tennis", "Nuoto", "Basket"],
  },
  {
    name: "Film & Media",
    icon: "fa-film",
    words: ["Televisione", "Cinema", "Popcorn", "Telecomando", "Cuffie", "Fotocamera", "Radio", "Giornale", "Internet", "Videogioco", "Attore", "Regista", "Schermo", "Notizia"],
  },
  {
    name: "Vita Quotidiana",
    icon: "fa-house",
    words: ["Divano", "Letto", "Lampada", "Chiave", "Specchio", "Frigorifero", "Cuscino", "Doccia", "Finestra", "Orologio", "Telefono", "Tavolo", "Sedia", "Armadio"],
  },
  {
    name: "Natura & Animali",
    icon: "fa-leaf",
    words: ["Albero", "Fiore", "Fiume", "Leone", "Sole", "Pioggia", "Fungo", "Farfalla", "Vulcano", "Cane", "Gatto", "Uccello", "Nuvola", "Delfino"],
  },
  {
    name: "Scienza & Tech",
    icon: "fa-microchip",
    words: ["Smartphone", "Robot", "Batteria", "Cavo", "Tablet", "Satellite", "Drone", "Router", "Tastiera", "Mouse", "Razzo", "Microscopio", "Laboratorio", "Codice"],
  },
  {
    name: "Scuola & Studio",
    icon: "fa-graduation-cap",
    words: ["Penna", "Quaderno", "Zaino", "Righello", "Gomma", "Libro", "Cattedra", "Compasso", "Astuccio", "Banco", "Esame", "Laurea", "Matita", "Calcolatrice"],
  },
];

// Flat list for backwards compat
export const WORDS = WORD_CATEGORIES.flatMap(c => c.words);
