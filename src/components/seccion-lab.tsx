'use client';

import { useState } from 'react';
import { Pildora } from './pildora';
import { Punto } from './seccion';
import {
  CATEGORIAS_LAB,
  SIMBOLO_ESTADO,
  type CategoriaLab,
  type Experimento,
} from '@/lib/site/lab';
import { getDictionary, type Lang } from '@/lib/i18n';

/**
 * El Lab.
 *
 * Es cliente —y no servidor— solo por los filtros. Se podrían haber hecho con
 * enlaces y un parámetro en la URL, pero eso recarga la página y hace perder la
 * posición del scroll para filtrar cuatro tarjetas; y un `:has()` en CSS no
 * puede, además, marcar el filtro activo.
 *
 * Los filtros se calculan a partir de lo que hay: no aparece «Hardware» si no
 * hay ningún experimento de hardware. Un filtro que no devuelve nada es una
 * promesa incumplida.
 */
export function SeccionLab({
  experimentos,
  lang = 'es',
}: {
  experimentos: readonly Experimento[];
  lang?: Lang;
}) {
  const dict = getDictionary(lang);
  const [filtro, setFiltro] = useState<CategoriaLab | null>(null);

  const presentes = (Object.keys(CATEGORIAS_LAB) as CategoriaLab[]).filter((categoria) =>
    experimentos.some((experimento) => experimento.categoria === categoria),
  );

  const visibles = filtro
    ? experimentos.filter((experimento) => experimento.categoria === filtro)
    : experimentos;

  const estados = Object.entries(SIMBOLO_ESTADO) as [keyof typeof SIMBOLO_ESTADO, string][];

  return (
    <>
      <span className="inline-flex items-center gap-2 rounded-full bg-tinta px-3.5 py-2 font-mono text-[13px] text-crema">
        <span aria-hidden className="size-2 rounded-full bg-verde" />
        {dict.sections.lab.badge}
      </span>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
        <h2 className="text-gigante font-extrabold">
          {dict.sections.lab.title}
          <Punto />
        </h2>
        <p className="mb-2 max-w-md text-[17px] leading-relaxed text-ink-muted sm:text-[21px]">
          {dict.sections.lab.desc}
        </p>
      </div>

      {presentes.length > 1 ? (
        <div className="mt-10 flex flex-wrap gap-2">
          <Pildora
            variante={filtro === null ? 'tinta' : 'contorno'}
            activa={filtro === null}
            onClick={() => setFiltro(null)}
          >
            {dict.sections.lab.all}
          </Pildora>
          {presentes.map((categoria) => (
            <Pildora
              key={categoria}
              variante={filtro === categoria ? 'tinta' : 'contorno'}
              activa={filtro === categoria}
              onClick={() => setFiltro(categoria)}
            >
              {CATEGORIAS_LAB[categoria][lang]}
            </Pildora>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,30rem),1fr))] gap-4">
        {visibles.map((experimento) => (
          <article
            key={experimento.id}
            className={`flex flex-col overflow-hidden rounded-tarjeta border-[1.5px] border-tinta ${
              experimento.invertida ? 'bg-noche text-ink-inverso' : 'bg-crema text-tinta'
            }`}
          >
            <VisualExperimento experimento={experimento} />

            <div className="flex flex-1 flex-col gap-4 p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[12px]">
                <span className={experimento.invertida ? 'text-ink-inverso-faint' : 'text-ink-faint'}>
                  {experimento.etiqueta}
                </span>
                <span className="rounded-full bg-naranja px-2.5 py-1 font-bold text-tinta">
                  <span aria-hidden>{SIMBOLO_ESTADO[experimento.estado]}</span>{' '}
                  {dict.sections.lab.status[experimento.estado]}
                </span>
              </div>

              <h3 className="text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[0.95] tracking-[-0.03em]">
                {experimento.titulo}
              </h3>

              <p
                className={`text-[16px] leading-relaxed ${
                  experimento.invertida ? 'text-ink-inverso-muted' : 'text-ink-muted'
                }`}
              >
                {experimento.resumen}
              </p>

              {experimento.enlace ? (
                <a
                  href={experimento.enlace}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`mt-auto pt-2 font-mono text-[14px] font-bold hover:underline ${
                    experimento.invertida ? 'text-naranja-claro' : 'text-accent-strong'
                  }`}
                >
                  {experimento.enlaceTexto ?? experimento.enlace}
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px] text-ink-faint">
        <span>{dict.sections.lab.legendTitle}:</span>
        {estados.map(([estado, simbolo]) => (
          <span key={estado} className="inline-flex items-center gap-1.5">
            <span aria-hidden>{simbolo}</span>
            {dict.sections.lab.status[estado]}
          </span>
        ))}
      </p>
    </>
  );
}

/**
 * Cabecera ilustrada de la tarjeta.
 *
 * Tres de los cuatro experimentos no tienen captura que enseñar —están a
 * medias, y uno la tiene pero con nombres de personas dentro—, así que lo que
 * se dibuja es una recreación en HTML, rotulada como tal. Insinuar un producto
 * terminado con una imagen de archivo sería mentir justo en la sección que
 * presume de decir en qué punto está cada cosa.
 */
function VisualExperimento({ experimento }: { experimento: Experimento }) {
  const marco = `relative flex aspect-16/10 flex-col justify-center gap-3 overflow-hidden p-6 ${experimento.colorVisual}`;

  if (experimento.visual === 'imagen' && experimento.imagen) {
    return (
      <div className={`aspect-16/10 overflow-hidden ${experimento.colorVisual}`}>
        <img
          src={experimento.imagen}
          alt={experimento.imagenAlt ?? ''}
          loading="lazy"
          className="size-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    );
  }

  if (experimento.visual === 'chat') {
    return (
      <div className={marco}>
        <p className="max-w-[78%] self-end rounded-[16px_16px_4px_16px] bg-tinta px-4 py-3 text-[14px] text-crema sm:text-[16px]">
          ¿Cuánto es x en 3x + 5 = 20?
        </p>
        <p className="max-w-[86%] self-start rounded-[16px_16px_16px_4px] bg-crema px-4 py-3 text-[14px] text-tinta sm:text-[16px]">
          Antes de despejar: ¿qué operación harías para dejar solo el 3x?
        </p>
        <Rotulo />
      </div>
    );
  }

  if (experimento.visual === 'hud') {
    return (
      <div className={marco}>
        <div className="flex items-center justify-between font-mono text-[11px] text-crema">
          <span>TÚ</span>
          <span className="rounded bg-naranja px-2 py-0.5 font-bold text-tinta">07:42</span>
          <span>RIVAL</span>
        </div>
        <div className="flex gap-3">
          <span className="h-2 flex-1 rounded-full bg-verde" />
          <span className="h-2 flex-1 rounded-full bg-crema/30" />
        </div>
        <p className="mt-auto font-mono text-[10px] uppercase tracking-[0.12em] text-crema/70">
          Próxima estación
        </p>
        <Rotulo />
      </div>
    );
  }

  return <div className={`aspect-16/10 ${experimento.colorVisual}`} />;
}

/** Deja claro que lo de arriba es un dibujo y no una captura. */
function Rotulo() {
  return (
    <span className="absolute right-3 top-3 rounded-full bg-tinta/70 px-2 py-1 font-mono text-[10px] text-crema">
      recreación
    </span>
  );
}
