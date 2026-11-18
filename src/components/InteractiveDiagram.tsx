import React, { useState } from 'react';
import { ArrowRight, Cpu, HardDrive, Network, Server, Shield } from 'lucide-react';
import { LessonPhases } from '../types/academy';

interface InteractiveDiagramProps {
  schema: LessonPhases['fase3_schemaVisivo'];
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({ schema }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const getIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <Cpu className="w-4 h-4 text-sky-400" />;
      case 'network':
        return <Network className="w-4 h-4 text-blue-400" />;
      case 'security':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'storage':
        return <HardDrive className="w-4 h-4 text-slate-300" />;
      default:
        return <Server className="w-4 h-4 text-amber-400" />;
    }
  };

  const currentFlow = schema.flows[activeStep];

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0B111C] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">{schema.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Seleziona uno step del flusso per evidenziare il percorso dei dati o dei pacchetti
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {schema.flows.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                activeStep === idx
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Passo {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Node Chain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {schema.nodes.map((node, idx) => {
          const isSource = currentFlow?.from === node.id;
          const isTarget = currentFlow?.to === node.id;
          const highlighted = isSource || isTarget;

          return (
            <div
              key={node.id}
              className={`rounded-md border p-3 transition-colors flex flex-col justify-between ${
                isTarget
                  ? 'border-emerald-500/60 bg-emerald-950/25'
                  : isSource
                  ? 'border-sky-500/60 bg-sky-950/25'
                  : highlighted
                  ? 'border-slate-700 bg-slate-900'
                  : 'border-slate-800/90 bg-[#0F1725]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0">{getIcon(node.type)}</span>
                    <span className="text-xs font-semibold text-slate-100 leading-snug">{node.label}</span>
                  </div>
                  {idx < schema.nodes.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden lg:block" />
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-400 leading-snug">{node.sublabel}</div>
              </div>
              {(isSource || isTarget) && (
                <div className="mt-2 text-[11px] font-medium text-sky-300">
                  {isSource ? 'Origine flusso' : 'Destinazione'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentFlow && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-200">
            <span className="font-mono text-sky-400 mr-2">Passo {activeStep + 1}:</span>
            {currentFlow.label}
          </div>
          {currentFlow.protocol && (
            <span className="font-mono text-emerald-400">{currentFlow.protocol}</span>
          )}
        </div>
      )}
    </div>
  );
};
