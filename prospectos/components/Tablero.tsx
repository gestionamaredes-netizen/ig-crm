"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { agregarProspecto, guardarCampo } from "@/app/actions";
import { salir } from "@/app/login/actions";
import type { Prospecto } from "@/lib/datos";
import type { Seguimiento } from "@/lib/seguimiento";

type Estado = { k: string; n: string; c: string };
type Props = {
  yo: string;
  prospectos: Prospecto[];
  seguimiento: Record<string, Seguimiento>;
  estados: Estado[];
  equipo: string[];
  rubros: string[];
  localidades: string[];
  cantera: { q: string; e: string; n: number }[];
  cazaderos: { t: string; d: string; c: string }[];
  estudio: { nombre: string; direccion: string; mapa: string };
};

const VACIO: Seguimiento = {
  estado: "nuevo", responsable: "Sin asignar", proxima: "", fecha: "",
  notas: "", editadoPor: "", editadoEn: 0, historial: [],
};

const VERTXT: Record<string, string> = {
  ok: "Datos ok", parcial: "Faltan datos", nombre: "Solo el nombre",
};
const CAMPOTXT: Record<string, string> = {
  estado: "el estado", responsable: "el responsable", proxima: "la próxima acción",
  fecha: "la fecha", notas: "las notas",
};

function cuando(ms: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Tablero(props: Props) {
  const { yo, prospectos, estados, equipo, rubros, localidades, cantera, cazaderos, estudio } = props;

  const [seg, setSeg] = useState(props.seguimiento);
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());
  const [hist, setHist] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [altaMsg, setAltaMsg] = useState("");
  const [, startTransition] = useTransition();

  const [busca, setBusca] = useState("");
  const [rubro, setRubro] = useState("");
  const [loc, setLoc] = useState("");
  const [resp, setResp] = useState("");
  const [estadoF, setEstadoF] = useState("");
  const [cerca, setCerca] = useState(false);

  const emap = useMemo(() => {
    const m: Record<string, Estado> = {};
    estados.forEach((e) => (m[e.k] = e));
    return m;
  }, [estados]);

  const de = (id: string): Seguimiento => seg[id] ?? VACIO;

  const visibles = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return prospectos.filter((p) => {
      const s = de(p.id);
      if (cerca && !p.cerca) return false;
      if (rubro && p.rubro !== rubro) return false;
      if (loc && p.localidad !== loc) return false;
      if (resp && s.responsable !== resp) return false;
      if (estadoF && s.estado !== estadoF) return false;
      if (q) {
        const h = `${p.nombre} ${p.rubro} ${p.localidad} ${p.direccion} ${p.instagram} ${p.contenido}`;
        if (!h.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospectos, seg, busca, rubro, loc, resp, estadoF, cerca]);

  function editar(id: string, campo: keyof Seguimiento & string, valor: string) {
    const ahora = Date.now();
    setSeg((prev) => {
      const base = prev[id] ?? VACIO;
      return {
        ...prev,
        [id]: {
          ...base,
          [campo]: valor,
          editadoPor: yo,
          editadoEn: ahora,
          historial: [{ quien: yo, campo, cuando: ahora }, ...base.historial].slice(0, 6),
        },
      };
    });
    startTransition(async () => {
      const r = await guardarCampo(id, campo, valor);
      setMsg((m) => ({ ...m, [id]: r.ok ? "Guardado" : r.error }));
      if (r.ok) setTimeout(() => setMsg((m) => ({ ...m, [id]: "" })), 2200);
    });
  }

  function alternar(set: Set<string>, id: string, fn: (s: Set<string>) => void) {
    const n = new Set(set);
    n.has(id) ? n.delete(id) : n.add(id);
    fn(n);
  }

  async function onAlta(formData: FormData) {
    const r = await agregarProspecto(formData);
    setAltaMsg(r.ok ? "Agregado y compartido con el equipo" : r.error);
    if (r.ok) (document.getElementById("alta") as HTMLFormElement | null)?.reset();
    setTimeout(() => setAltaMsg(""), 3200);
  }

  const conteo = (k: string) => prospectos.filter((p) => de(p.id).estado === k).length;

  return (
    <div className="wrap">
      <header>
        <div className="hrow">
          <Image src="/marca/nexo.png" alt="Nexo Studios" width={260} height={115} priority />
          <div className="htit">
            Prospectos de sponsoreo
            <small>General San Martín · PBA</small>
          </div>
          <div className="hcount">
            <b>{prospectos.length}</b> negocios
          </div>
        </div>
        <div className="embudo">
          {estados.map((e) => (
            <button
              key={e.k}
              type="button"
              className="est"
              style={{ ["--c" as string]: e.c }}
              aria-pressed={estadoF === e.k}
              onClick={() => setEstadoF(estadoF === e.k ? "" : e.k)}
            >
              <span className="n">{conteo(e.k)}</span>
              <span className="l">{e.n}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="yo">
        <span className="yl">Estás como</span>
        <strong className="yn">{yo}</strong>
        <form action={salir}>
          <button className="cambiar" type="submit">
            Salir
          </button>
        </form>
      </div>

      <div className="estudio">
        <span className="el">El estudio</span>
        <span className="ed">{estudio.direccion}</span>
        <a href={estudio.mapa} target="_blank" rel="noopener noreferrer">
          Ver en el mapa
        </a>
      </div>

      <div className="aviso">
        <span className="ic">Leer</span>
        <p>
          <b>Ningún teléfono ni mail está inventado.</b> Cada ficha dice de dónde salió el
          dato y qué falta. Los mails no son públicos en casi ningún comercio de la zona: se
          consiguen en el mostrador o por mensaje.
        </p>
      </div>

      <div className="filtros">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nombre, rubro o dirección…"
          aria-label="Buscar"
        />
        <select value={rubro} onChange={(e) => setRubro(e.target.value)} aria-label="Rubro">
          <option value="">Todos los rubros</option>
          {rubros.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select value={loc} onChange={(e) => setLoc(e.target.value)} aria-label="Localidad">
          <option value="">Todas las localidades</option>
          {localidades.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <select value={resp} onChange={(e) => setResp(e.target.value)} aria-label="Responsable">
          <option value="">Todo el equipo</option>
          {equipo.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <button
          type="button"
          className="soloc"
          aria-pressed={cerca}
          onClick={() => setCerca(!cerca)}
        >
          Cerca del estudio
        </button>
        <button
          type="button"
          className="limpiar"
          onClick={() => {
            setBusca(""); setRubro(""); setLoc(""); setResp(""); setEstadoF(""); setCerca(false);
          }}
        >
          Limpiar
        </button>
      </div>

      <h2>Prospectos</h2>
      <p className="sub">
        {visibles.length === prospectos.length
          ? "Tocá una ficha para ver los datos y cargar el seguimiento."
          : `${visibles.length} de ${prospectos.length} negocios.`}
      </p>

      <div className="lista">
        {visibles.length === 0 && (
          <div className="vacio">Ningún negocio coincide con ese filtro.</div>
        )}
        {visibles.map((p) => {
          const s = de(p.id);
          const e = emap[s.estado] ?? emap.nuevo;
          const ab = abiertas.has(p.id);
          const falta = [
            !p.instagram && !p.facebook ? "redes" : "",
            !p.direccion ? "dirección" : "",
            !p.telefono ? "teléfono" : "",
            !p.mail ? "mail" : "",
          ].filter(Boolean);

          return (
            <article
              key={p.id}
              className={`p${ab ? " abierta" : ""}${p.cerca ? " escerca" : ""}`}
              style={{ ["--c" as string]: e.c }}
            >
              <button
                className="phead"
                type="button"
                aria-expanded={ab}
                onClick={() => alternar(abiertas, p.id, setAbiertas)}
              >
                <div className="pnom">{p.nombre}</div>
                <div className="pmeta">
                  {p.rubro} · {p.localidad}
                </div>
                <div className="ptags">
                  <span className="pill">{e.n}</span>
                  {p.cerca && <span className="tag cerca">{p.cerca}</span>}
                  <span className={`tag ${p.ver}`}>{VERTXT[p.ver] ?? p.ver}</span>
                  {p.prioridad === "alta" && <span className="tag alta">Prioridad</span>}
                  {p.seguidores && <span className="tag">{p.seguidores}</span>}
                  {s.responsable !== "Sin asignar" && <span className="tag">{s.responsable}</span>}
                  {s.editadoPor && (
                    <span className="tag editor">
                      {s.editadoPor} · {cuando(s.editadoEn)}
                    </span>
                  )}
                </div>
              </button>

              {ab && (
                <div className="pbody">
                  <div className="campo">
                    <div className="lab">Contacto</div>
                    <div className="enl">
                      {p.instagram && (
                        <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noopener noreferrer">
                          @{p.instagram}
                        </a>
                      )}
                      {p.facebook && (
                        <a href={`https://facebook.com/${p.facebook}`} target="_blank" rel="noopener noreferrer">
                          Facebook
                        </a>
                      )}
                      {p.web && (
                        <a href={p.web} target="_blank" rel="noopener noreferrer">
                          Web
                        </a>
                      )}
                      {p.direccion && (
                        <a
                          className="mapa"
                          href={`https://www.google.com/maps/search/${encodeURIComponent(p.direccion)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver en el mapa
                        </a>
                      )}
                      {p.telefono && (
                        <a href={`tel:${p.telefono.replace(/[^0-9+]/g, "")}`}>{p.telefono}</a>
                      )}
                      {p.mail && <a href={`mailto:${p.mail}`}>{p.mail}</a>}
                      {!p.instagram && !p.facebook && !p.web && !p.direccion && !p.telefono && !p.mail && (
                        <span className="dato falta">Sin ningún contacto todavía</span>
                      )}
                    </div>
                  </div>

                  {falta.length > 0 && (
                    <div className="campo">
                      <div className="lab">Falta conseguir</div>
                      <div className="dato falta">{falta.join(" · ")}</div>
                    </div>
                  )}

                  {p.contenido && (
                    <div className="campo">
                      <div className="lab">Qué contenido viene haciendo</div>
                      <div className="contenido">{p.contenido}</div>
                    </div>
                  )}
                  {p.fuente && <div className="fuente">Fuente: {p.fuente}</div>}

                  <div className="campo" style={{ marginTop: 14 }}>
                    <div className="lab">Seguimiento</div>
                    <div className="seguimiento">
                      <div className="sgrid">
                        <label>
                          <span className="lab">Estado</span>
                          <select
                            value={s.estado}
                            onChange={(ev) => editar(p.id, "estado", ev.target.value)}
                          >
                            {estados.map((x) => (
                              <option key={x.k} value={x.k}>
                                {x.n}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span className="lab">Responsable</span>
                          <select
                            value={s.responsable}
                            onChange={(ev) => editar(p.id, "responsable", ev.target.value)}
                          >
                            {equipo.map((x) => (
                              <option key={x}>{x}</option>
                            ))}
                          </select>
                        </label>
                        <label className="full">
                          <span className="lab">Próxima acción</span>
                          <input
                            value={s.proxima}
                            maxLength={120}
                            placeholder="Pasar por el local y pedir el mail"
                            onChange={(ev) => editar(p.id, "proxima", ev.target.value)}
                          />
                        </label>
                        <label className="full">
                          <span className="lab">Fecha</span>
                          <input
                            type="date"
                            value={s.fecha}
                            onChange={(ev) => editar(p.id, "fecha", ev.target.value)}
                          />
                        </label>
                        <label className="full">
                          <span className="lab">Notas</span>
                          <textarea
                            value={s.notas}
                            maxLength={900}
                            placeholder="Con quién hablaste, qué dijo, qué le interesó"
                            onChange={(ev) => editar(p.id, "notas", ev.target.value)}
                          />
                        </label>
                      </div>
                      <div className={`guardado${msg[p.id] === "Guardado" ? " ok" : ""}`}>
                        {msg[p.id] ?? ""}
                      </div>

                      {s.editadoPor ? (
                        <>
                          <div className="firma">
                            Última edición: <b>{s.editadoPor}</b> · {cuando(s.editadoEn)}
                          </div>
                          {s.historial.length > 0 && (
                            <button
                              className="verhist"
                              type="button"
                              onClick={() => alternar(hist, p.id, setHist)}
                            >
                              {hist.has(p.id)
                                ? "Ocultar historial"
                                : `Ver historial (${s.historial.length})`}
                            </button>
                          )}
                          {hist.has(p.id) && (
                            <div className="hist">
                              {s.historial.map((h, i) => (
                                <div key={i}>
                                  <b>{h.quien}</b> cambió {CAMPOTXT[h.campo] ?? h.campo} ·{" "}
                                  {cuando(h.cuando)}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="firma">Todavía no lo tocó nadie</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <h2>Dónde están todos juntos</h2>
      <p className="sub">
        Sale más barato caminar esto que buscar de a uno. Los food trucks y los puestos
        chicos no figuran en ningún directorio: están acá.
      </p>
      <div className="caza">
        {cazaderos.map((z) => (
          <div className="zcard" key={z.t}>
            <div className="zt">{z.t}</div>
            <div className="zc">{z.c}</div>
            <div className="zd">{z.d}</div>
          </div>
        ))}
      </div>

      <h2>Lo que falta cubrir</h2>
      <p className="sub">Los números son la meta por frente, no lo que hay cargado.</p>
      <div className="cant">
        {cantera.map((c) => (
          <div className="crow" key={c.q}>
            <span className="cn">{c.n}</span>
            <div>
              <div className="ct">{c.q}</div>
              <div className="cd">{c.e}</div>
            </div>
          </div>
        ))}
      </div>

      <h2>Agregar un prospecto</h2>
      <p className="sub">Lo que cargues acá lo ve todo el equipo, firmado con tu nombre.</p>
      <form id="alta" className="alta" action={onAlta}>
        <div className="agrid">
          <label className="full">
            <span className="lab">Nombre del negocio</span>
            <input name="nombre" required maxLength={80} />
          </label>
          <label>
            <span className="lab">Rubro</span>
            <select name="rubro" defaultValue={rubros[0]}>
              {rubros.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="lab">Localidad</span>
            <select name="localidad" defaultValue={localidades[0]}>
              {localidades.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="lab">Instagram (sin @)</span>
            <input name="instagram" maxLength={60} />
          </label>
          <label>
            <span className="lab">Teléfono</span>
            <input name="telefono" maxLength={40} />
          </label>
          <label className="full">
            <span className="lab">Dirección</span>
            <input name="direccion" maxLength={120} />
          </label>
          <label className="full">
            <span className="lab">Mail</span>
            <input name="mail" type="email" maxLength={80} />
          </label>
          <label className="full">
            <span className="lab">Qué contenido viene haciendo</span>
            <textarea name="contenido" maxLength={600} />
          </label>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn" type="submit">
            Agregar
          </button>
          <span className="guardado">{altaMsg}</span>
        </div>
      </form>

      <footer>
        <span>Nexo Studios · Equipo comercial</span>
        <span>Datos base: búsqueda web, sept. 2026</span>
      </footer>
    </div>
  );
}
