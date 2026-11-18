import React, { useState } from 'react';
import {
  FileText,
  ImagePlus,
  Plus,
  Printer,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { ACADEMY_MODULES } from '../data/modules';
import { NoteEntry } from '../types/academy';

interface NotesDispenseViewProps {
  notes: NoteEntry[];
  onUpdateNotes: (next: NoteEntry[]) => void;
  onAskMentor: (prompt: string, imageBase64?: string) => void;
}

export const NotesDispenseView: React.FC<NotesDispenseViewProps> = ({
  notes,
  onUpdateNotes,
  onAskMentor,
}) => {
  const [search, setSearch] = useState('');
  const [filterModuleId, setFilterModuleId] = useState<number | 'all'>('all');
  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState<number>(3);
  const [content, setContent] = useState('');
  const [commandsInput, setCommandsInput] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [dispensaModuleId, setDispensaModuleId] = useState<number>(8);

  const filteredNotes = notes.filter((n) => {
    const matchMod = filterModuleId === 'all' || n.moduleId === filterModuleId;
    const q = search.trim().toLowerCase();
    const matchText =
      !q ||
      n.titolo.toLowerCase().includes(q) ||
      n.contenuto.toLowerCase().includes(q) ||
      n.comandiSalvati.some((c) => c.toLowerCase().includes(q));
    return matchMod && matchText;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const cmds = commandsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newNote: NoteEntry = {
      id: `note-${Date.now()}`,
      moduleId,
      titolo: title.trim(),
      contenuto: content.trim(),
      comandiSalvati: cmds,
      immagineBase64: photoBase64,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onUpdateNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
    setCommandsInput('');
    setPhotoBase64(undefined);
  };

  const handleDeleteNote = (id: string) => {
    onUpdateNotes(notes.filter((n) => n.id !== id));
  };

  const dispensaMod = ACADEMY_MODULES.find((m) => m.id === dispensaModuleId) ?? ACADEMY_MODULES[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-[#0F1623] p-5 no-print">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            I Miei Appunti, Comandi Salvati & Dispense Stampabili
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organizza appunti e comandi per modulo, allega foto di appunti o screenshot di terminale, chiedi a Cyber Mentor di correggere errori o esporta le dispense in PDF.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 whitespace-nowrap"
        >
          <Printer className="w-3.5 h-3.5" />
          Esporta / Stampa PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* New Note Form */}
        <form
          onSubmit={handleAddNote}
          className="lg:col-span-5 rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-3 no-print"
        >
          <h3 className="text-sm font-semibold text-slate-100">Nuovo Appunto / Comando</h3>

          <div>
            <label htmlFor="note-module" className="block text-xs text-slate-400 mb-1">
              Modulo associato
            </label>
            <select
              id="note-module"
              value={moduleId}
              onChange={(e) => setModuleId(Number(e.target.value))}
              className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-xs text-slate-100"
            >
              {ACADEMY_MODULES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.codice} — {m.titolo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="note-title" className="block text-xs text-slate-400 mb-1">
              Titolo appunto
            </label>
            <input
              id="note-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Analisi permessi SMB e smbclient"
              className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="note-content" className="block text-xs text-slate-400 mb-1">
              Spiegazione / Appunti personali
            </label>
            <textarea
              id="note-content"
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Annota concetti chiave, errori incontrati o schemi..."
              className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="note-commands" className="block text-xs text-slate-400 mb-1">
              Comandi da salvare (uno per riga)
            </label>
            <textarea
              id="note-commands"
              rows={2}
              value={commandsInput}
              onChange={(e) => setCommandsInput(e.target.value)}
              placeholder={'grep Failed /var/log/auth.log\nchmod 600 chiave_lab.pem'}
              className="w-full rounded border border-slate-700 bg-[#090D14] px-3 py-2 text-xs font-mono text-emerald-300"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 cursor-pointer">
              <ImagePlus className="w-3.5 h-3.5 text-sky-400" />
              <span>{photoBase64 ? 'Foto allegata' : 'Allega Foto/Screenshot'}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
            </label>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Salva Appunto
            </button>
          </div>
        </form>

        {/* Saved Notes List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2 no-print">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="search"
                aria-label="Cerca tra gli appunti"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca argomento o comando salvato..."
                className="w-full rounded border border-slate-700 bg-[#0F1623] pl-8 pr-3 py-2 text-xs text-slate-100"
              />
            </div>

            <select
              aria-label="Filtra appunti per modulo"
              value={filterModuleId}
              onChange={(e) => setFilterModuleId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="rounded border border-slate-700 bg-[#0F1623] px-3 py-2 text-xs text-slate-100"
            >
              <option value="all">Tutti i moduli</option>
              {ACADEMY_MODULES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.codice}
                </option>
              ))}
            </select>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-6 text-xs text-slate-400">
              Nessun appunto trovato con questo filtro. Crea il tuo primo appunto usando il modulo qui a fianco.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((n) => {
                const mod = ACADEMY_MODULES.find((m) => m.id === n.moduleId);
                return (
                  <div key={n.id} className="rounded-lg border border-slate-800 bg-[#0F1623] p-4 space-y-2.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-mono text-sky-400">
                          {mod?.codice} · {mod?.titolo} · {n.updatedAt}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100 mt-0.5">{n.titolo}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 no-print">
                        <button
                          type="button"
                          onClick={() =>
                            onAskMentor(
                              `Analizza i miei appunti sul ${mod?.codice} ("${n.titolo}"): correggi eventuali imprecisioni tecniche e genera uno schema visivo riassuntivo.\n\nTesto:\n${n.contenuto}\n\nComandi:\n${n.comandiSalvati.join('\n')}`,
                              n.immagineBase64
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded border border-sky-500/40 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25"
                        >
                          <Sparkles className="w-3 h-3" />
                          Correggi & Genera Schema AI
                        </button>
                        <button
                          type="button"
                          aria-label={`Elimina appunto ${n.titolo}`}
                          onClick={() => handleDeleteNote(n.id)}
                          className="p-1.5 rounded border border-slate-800 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{n.contenuto}</p>

                    {n.comandiSalvati.length > 0 && (
                      <div className="rounded bg-[#06090F] border border-slate-800 p-2.5 font-mono text-[11px] text-emerald-400 space-y-1">
                        {n.comandiSalvati.map((c, idx) => (
                          <div key={idx}>$ {c}</div>
                        ))}
                      </div>
                    )}

                    {n.immagineBase64 && (
                      <img
                        src={n.immagineBase64}
                        alt={`Allegato appunto ${n.titolo}`}
                        className="max-h-48 rounded border border-slate-700"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Printable Handout Viewer */}
      <div className="rounded-lg border border-slate-800 bg-[#0F1623] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Archivio Rapido Dispense Stampabili per Modulo
            </h3>
          </div>
          <select
            aria-label="Seleziona modulo per dispensa"
            value={dispensaModuleId}
            onChange={(e) => setDispensaModuleId(Number(e.target.value))}
            className="rounded border border-slate-700 bg-[#090D14] px-3 py-1.5 text-xs text-slate-100 no-print"
          >
            {ACADEMY_MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.codice} — {m.titolo}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded border border-slate-800 bg-[#0B111C] p-4 space-y-2">
            <div className="font-semibold text-sky-400">DISPENSA COMPLETA — {dispensaMod.codice}</div>
            <p className="text-slate-200">{dispensaMod.dispensa.completa.sommario}</p>
            {dispensaMod.dispensa.completa.definizioniChiave.map((d) => (
              <div key={d.termine}>
                <span className="font-semibold text-slate-100">{d.termine}: </span>
                <span className="text-slate-300">{d.definizione}</span>
              </div>
            ))}
          </div>
          <div className="rounded border border-slate-800 bg-[#0B111C] p-4 space-y-2">
            <div className="font-semibold text-emerald-400">DISPENSA SINTETICA — {dispensaMod.codice}</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-200">
              {dispensaMod.dispensa.sintetica.puntiEssenziali.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
