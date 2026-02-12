
import React from 'react';
import { Button } from './ui/Button';

interface InstructionsScreenProps {
  onBack: () => void;
}

const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onBack }) => {
  return (
    <div className="w-full flex flex-col h-full animate-in slide-in-from-right duration-300 relative">
      <div className="sticky top-0 z-10 bg-[#0f172a]/90 backdrop-blur-md p-5 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-2xl font-bungee text-white">Come Giocare</h2>
        <Button size="sm" variant="ghost" onClick={onBack}>
          <i className="fa-solid fa-xmark text-2xl"></i>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-20">
        
        {/* Intro */}
        <section className="space-y-3">
          <p className="text-slate-300 text-lg leading-relaxed">
            <strong>L'Impostore</strong> è un gioco di deduzione, bluff e parole. 
            Tutti conoscono la parola segreta tranne i nemici. 
            Il vostro obiettivo cambia in base al ruolo.
          </p>
        </section>

        {/* Victory Condition Clarification */}
        <section className="bg-slate-800/50 p-5 rounded-2xl border border-indigo-500/30">
          <h3 className="text-xl font-bold text-indigo-400 mb-3">
            <i className="fa-solid fa-gavel mr-2"></i>
            Come si vota?
          </h3>
          <p className="text-base text-slate-300 leading-relaxed">
            Alla fine del tempo, il gruppo deve decidere <strong>una sola persona</strong> da eliminare.
          </p>
          <ul className="list-disc list-inside text-base text-slate-400 mt-3 space-y-2">
            <li>Se eliminate un <strong>Nemico</strong> (Impostore o Wolf), i Civili vincono!</li>
            <li>Se eliminate un <strong>Civile</strong>, i Nemici vincono.</li>
            <li>In partite con <strong>Entrambi i nemici</strong>, basta eliminarne UNO qualsiasi per vincere il round.</li>
          </ul>
        </section>

        {/* Roles & Tactics */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-indigo-400 border-b border-indigo-500/30 pb-2">
            <i className="fa-solid fa-users mr-2"></i>
            I Civili
          </h3>
          <div className="bg-indigo-900/20 p-5 rounded-xl border border-indigo-500/20 space-y-3">
            <p className="text-base text-slate-300">
              <strong>Obiettivo:</strong> Scoprire chi sono i nemici e votarli alla fine del round, senza rivelare troppo la parola segreta.
            </p>
            <div className="mt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Strategia:</span>
              <ul className="list-disc list-inside text-base text-slate-400 mt-2 space-y-2">
                <li><strong>Siate Criptici:</strong> Se la parola è "Pizza", non dite "Margherita". Dite "Rotonda" o "Sabato sera".</li>
                <li><strong>Attenti a Wolf:</strong> Se date un indizio troppo ovvio, Mr. Wolf capirà la parola e vi ruberà la vittoria.</li>
                <li><strong>Analizzate i Tempi:</strong> Chi esita troppo prima di parlare? Chi ripete concetti già detti?</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-rose-500 border-b border-rose-500/30 pb-2 pt-2">
            <i className="fa-solid fa-user-secret mr-2"></i>
            L'Impostore
          </h3>
          <div className="bg-rose-900/20 p-5 rounded-xl border border-rose-500/20 space-y-3">
            <p className="text-base text-slate-300">
              <strong>Obiettivo:</strong> Mimetizzarsi tra i civili e non farsi votare.
            </p>
            <div className="mt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Strategia:</span>
              <ul className="list-disc list-inside text-base text-slate-400 mt-2 space-y-2">
                <li><strong>Ascoltate Bene:</strong> Cercate di parlare per ultimi. Ascoltate gli indizi degli altri per capire il contesto.</li>
                <li><strong>Siate Vaghi:</strong> Usate parole che stanno bene con tutto (es. "Divertente", "Utile", "Estivo").</li>
                <li><strong>Sicurezza:</strong> Parlate senza esitazione. L'insicurezza è il primo segnale di colpevolezza.</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-amber-500 border-b border-amber-500/30 pb-2 pt-2">
            <i className="fa-solid fa-dog mr-2"></i>
            Mr. Wolf
          </h3>
          <div className="bg-amber-900/20 p-5 rounded-xl border border-amber-500/20 space-y-3">
            <p className="text-base text-slate-300">
              <strong>Obiettivo:</strong> Capire la parola segreta. Se vieni scoperto, hai un'ultima chance per indovinare e vincere da solo!
            </p>
            <div className="mt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Strategia:</span>
              <ul className="list-disc list-inside text-base text-slate-400 mt-2 space-y-2">
                <li><strong>Provocate:</strong> Date indizi leggermente sbagliati per vedere chi vi corregge (o chi vi guarda male).</li>
                <li><strong>Sacrificio Tattico:</strong> Se avete capito la parola, fatevi scoprire apposta! Indovinando alla fine, ruberete tutti i punti.</li>
                <li><strong>Bluff Totale:</strong> Fingetevi un Civile confuso per far abbassare la guardia agli altri.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Modes */}
        <section className="space-y-5 pt-4">
          <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">
            <i className="fa-solid fa-trophy mr-2 text-yellow-400"></i>
            Modalità Torneo
          </h3>
          <p className="text-base text-slate-300">
            Nel torneo si giocano più round e si accumulano punti.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="glass p-4 rounded-xl text-center">
               <div className="text-3xl font-bungee text-indigo-400">+100</div>
               <div className="text-xs text-slate-400 uppercase font-bold">Civili</div>
             </div>
             <div className="glass p-4 rounded-xl text-center">
               <div className="text-3xl font-bungee text-rose-500">+300</div>
               <div className="text-xs text-slate-400 uppercase font-bold">Impostore</div>
             </div>
             <div className="glass p-5 rounded-xl text-center col-span-2">
               <div className="text-3xl font-bungee text-amber-500">+500</div>
               <div className="text-xs text-slate-400 uppercase font-bold">Mr. Wolf Indovina</div>
             </div>
          </div>
          <p className="text-sm text-slate-500 mt-2 italic text-center">
            * Se ci sono sia Wolf che Impostore, i nemici vincono 300 punti se viene eliminato un civile.
          </p>
        </section>

      </div>
      
      <div className="p-5 border-t border-slate-700 bg-[#0f172a]">
        <Button fullWidth size="lg" onClick={onBack} className="text-xl py-5">Ho Capito, Giochiamo!</Button>
      </div>
    </div>
  );
};

export default InstructionsScreen;
