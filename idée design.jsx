import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bone, Circle, AlertTriangle, ChevronRight, ChevronLeft,
  CheckCircle2, Zap, Footprints, Box, Dumbbell, Brain, Shield, Heart,
  Pill, Shrink, BookOpen, TrendingUp, Smile, Activity,
  Target, Trophy, ShieldAlert, Ban, Sparkles, Weight, BarChart3
} from "lucide-react";

/* ─── Slide data ─── */
const slides = [
  { id:"cover",type:"cover",title:"Conflit Fémoro-Acétabulaire",subtitle:"& Force Athlétique",detail:"Guide personnalisé — Squatteur de 66 kg · 1RM 150 kg" },
  { id:"profil",type:"stats",title:"Ton profil athlétique",
    stats:[
      {label:"Âge",value:"20",unit:"ans",icon:Target},
      {label:"Poids",value:"66",unit:"kg",icon:Weight},
      {label:"Squat 1RM",value:"150",unit:"kg",icon:BarChart3},
      {label:"Ratio",value:"2.27",unit:"×BW",icon:Sparkles},
    ],
    note:"Fémurs longs · Programme Candito 6 semaines · Base de force exceptionnelle & capacités de récupération optimales.",
  },
  { id:"cfa-def",type:"content",tag:"Biomécanique",icon:Bone,title:"Qu'est-ce que le CFA ?",
    blocks:[
      "L'articulation de la hanche fonctionne comme une **rotule dans un socle** : la tête du fémur (boule) s'emboîte dans l'acétabulum du bassin (cavité).",
      "Dans le CFA, un **excès osseux** sur l'une ou les deux pièces crée un contact anormal lors de certains mouvements, irritant le **labrum** — l'anneau de cartilage souple qui entoure la cavité.",
    ],
  },
  { id:"types",type:"two-cards",tag:"Biomécanique",icon:Circle,title:"Les deux types de CFA",
    cards:[
      {accent:"#ef5350",label:"TYPE CAM",title:"Bosse sur le fémur",desc:"Excès osseux sur le col du fémur. Fréquent chez les jeunes hommes athlètes. La bosse bute contre le rebord acétabulaire en flexion profonde."},
      {accent:"#ffa726",label:"TYPE PINCER",title:"Pince sur la cavité",desc:"L'acétabulum recouvre trop la tête fémorale et pince le labrum lors de la flexion ou rotation. Type mixte probable dans ton cas."},
    ],
  },
  { id:"squat-why",type:"key-figures",tag:"Biomécanique",icon:Zap,title:"Pourquoi le squat lourd favorise le CFA",
    figures:[
      {value:"400–530",unit:"kg",label:"Force compressive par hanche à 150 kg sur le dos (6-8× ton poids de corps)"},
      {value:"+5 à 10°",unit:"",label:"Flexion de hanche supplémentaire due à tes fémurs longs"},
    ],
    footer:"Le volume d'entraînement du Candito accumule les répétitions dans la zone de conflit, provoquant une irritation mécanique progressive du labrum.",
  },
  { id:"no-pain",type:"verdict",tag:"Symptômes",icon:CheckCircle2,title:"Ce qui ne fait PAS mal",variant:"positive",
    items:[
      {title:"Machine adducteurs — 40 kg",desc:"Hanche centrée, pas de flexion profonde. La bosse CAM ne rencontre jamais le rebord. Tes adducteurs sont sains et fonctionnels."},
      {title:"Squat au poids du corps",desc:"Forces compressives trop faibles (1-1.5× BW) pour déclencher le conflit. Ta mobilité est préservée."},
    ],
  },
  { id:"pain",type:"verdict",tag:"Symptômes",icon:AlertTriangle,title:"Ce qui déclenche la douleur",variant:"negative",
    items:[
      {title:"Test FABER positif",desc:"Flexion + abduction + rotation externe : la bosse CAM se retrouve face au rebord. Le labrum est coincé entre les deux surfaces."},
      {title:"Squat lourd à 150 kg",desc:"Les forces compressives massives + l'inclinaison du torse suffisent à reproduire le conflit même sans rotation volontaire."},
    ],
  },
  { id:"message",type:"highlight",title:"Le message clé",
    body:"Tu n'as rien cassé. Ton anatomie crée un léger manque de place. Le squat lourd a irrité les tissus mous. Ces tissus peuvent se calmer et s'adapter.",
    accent:"Ce n'est pas une fatalité.",
  },
  { id:"adapt1",type:"adapt",tag:"Adaptation",num:"01",icon:Footprints,title:"Stance & rotation des pointes",
    points:[
      {label:"Stance plus large",desc:"Ajouter une demi-largeur de pied de chaque côté pour réduire la flexion de hanche nécessaire à la profondeur."},
      {label:"Pointes à 30-45°",desc:"Orienter les pointes vers l'extérieur pour ouvrir l'espace antérieur de la hanche."},
      {label:"Tracking",desc:"Les genoux doivent toujours suivre l'axe des orteils — sinon le conflit se recrée."},
    ],
  },
  { id:"adapt2",type:"adapt",tag:"Adaptation",num:"02",icon:Box,title:"Le Box Squat",
    points:[
      {label:"Contrôle de profondeur",desc:"Descendre juste au-dessus de la zone de conflit. Pli de hanche au niveau du genou ou 1-2 cm en dessous."},
      {label:"Tronc plus vertical",desc:"Le « sitting back » sur la box réduit naturellement l'inclinaison du torse."},
      {label:"Tempo",desc:"2 secondes de descente · 1 seconde de pause sans rebond · montée explosive."},
    ],
  },
  { id:"adapt3",type:"adapt",tag:"Adaptation",num:"03",icon:Dumbbell,title:"Chaussures & ajustements",
    points:[
      {label:"Talon surélevé 15-20 mm",desc:"Réduit la flexion de hanche de 5 à 8°. Adipower, Romaleos ou Do-Win."},
      {label:"Position Low Bar",desc:"Meilleur angle de torse pour les fémurs longs."},
      {label:"Cue mental",desc:"« Écarter le sol avec tes pieds » — active les rotateurs externes et stabilise la tête fémorale."},
    ],
  },
  { id:"peace",type:"protocol",tag:"Protocole",icon:Shield,title:"PEACE",period:"Semaines 1 à 2",
    letters:[
      {letter:"P",word:"Protection",desc:"Charge à 60-70% du 1RM, box squat, supprimer les mouvements type FABER",Icon:Shield},
      {letter:"E",word:"Élévation",desc:"Surélever les jambes après l'entraînement pour le retour veineux",Icon:TrendingUp},
      {letter:"A",word:"Anti-infl.",desc:"Éviter les AINS — l'inflammation modérée est un signal de réparation",Icon:Pill},
      {letter:"C",word:"Compression",desc:"Short de compression pour soutien proprioceptif",Icon:Shrink},
      {letter:"E",word:"Éducation",desc:"Comprendre le problème est la première étape de la guérison",Icon:BookOpen},
    ],
  },
  { id:"love",type:"protocol",tag:"Protocole",icon:Heart,title:"LOVE",period:"Semaines 2 à 6+",
    letters:[
      {letter:"L",word:"Load",desc:"Remontée progressive : +5 kg/semaine si douleur ≤ 3/10",Icon:TrendingUp},
      {letter:"O",word:"Optimisme",desc:"Profil très favorable, 60-80% de réduction des symptômes en 12 semaines",Icon:Smile},
      {letter:"V",word:"Vascularisation",desc:"15-20 min de vélo après chaque séance pour le flux sanguin",Icon:Activity},
      {letter:"E",word:"Exercices",desc:"Renforcement ciblé des fessiers, adducteurs, rotateurs et core",Icon:Dumbbell},
    ],
  },
  { id:"exo-fessiers",type:"exercises",tag:"Renforcement",icon:Target,title:"Fessiers",freq:"3×/semaine",
    exercises:[
      {name:"Clamshells avec élastique",sets:"3×15",note:"Genoux à 45° · chaque côté"},
      {name:"Hip Thrust",sets:"3×10",note:"Charge modérée · amplitude indolore"},
      {name:"Abductions poulie basse",sets:"3×12",note:"Debout · chaque côté"},
      {name:"Monster Walks",sets:"3×20",note:"Élastique au-dessus des genoux"},
    ],
  },
  { id:"exo-core",type:"exercises",tag:"Renforcement",icon:Target,title:"Adducteurs & Core",freq:"3×/semaine",
    exercises:[
      {name:"Copenhagen Plank modifié",sets:"3×8",note:"3s excentrique · chaque côté"},
      {name:"Machine adducteurs",sets:"Prog.",note:"Règle ≤ 3/10 douleur"},
      {name:"Rotation ext. élastique",sets:"3×15",note:"Assis · chaque côté"},
      {name:"Pallof Press",sets:"3×10",note:"Chaque côté"},
      {name:"Dead Bug",sets:"3×8",note:"Tempo lent · chaque côté"},
    ],
  },
  { id:"avoid",type:"warning",tag:"Attention",icon:Ban,title:"Exercices à éviter temporairement",
    items:["Étirement papillon forcé","Pigeon stretch profond","Squat bulgare en amplitude maximale","Tout mouvement flexion + rotation + charge en amplitude douloureuse"],
  },
  { id:"plan",type:"plan",title:"Plan d'action",
    steps:[
      {num:"01",title:"Comprendre",desc:"Problème mécanique, pas de lésion grave",Icon:BookOpen},
      {num:"02",title:"Adapter",desc:"Box squat · stance · pointes · chaussures",Icon:Dumbbell},
      {num:"03",title:"Renforcer",desc:"Fessiers · rotateurs · adducteurs · core",Icon:Target},
      {num:"04",title:"Progresser",desc:"Règle ≤ 3/10 · dépasser les 150 kg",Icon:TrendingUp},
    ],
  },
  { id:"end",type:"end",title:"Ce n'est pas un obstacle,",subtitle:"c'est une opportunité.",
    body:"Tu as 20 ans, une force remarquable et une articulation qui te demande simplement d'être plus malin. Les meilleurs athlètes ne sont pas ceux qui n'ont jamais eu de problèmes — ce sont ceux qui ont appris à travailler avec leur corps.",
    disclaimer:"Ce guide est éducatif. Un diagnostic de CFA se confirme par imagerie (radio / IRM). Consulte un médecin du sport si les symptômes persistent au-delà de 6 semaines.",
  },
];

import { cn } from '@/lib/utils'

function parseBold(t: string){
  if(!t)return t;
  const p=t.split(/\*\*(.*?)\*\*/g);
  return p.map((s,i)=>i%2===1 ? (
    <strong key={i} className="text-white font-semibold">{s}</strong>
  ) : s);
}

/* ── Card ── solid bg, no backdrop-filter, standard shadow */
function Card({ children, className, border }: { children: React.ReactNode, className?: string, border?: string }) {
  return (
    <div 
      className={cn(
        "bg-white/5 border border-white/10 rounded-2xl shadow-sm overflow-hidden",
        className
      )}
      style={border ? { borderLeft: border } : {}}
    >
      {children}
    </div>
  );
}

/* ── Tag ── */
function Tag({ label, variant = "green", IconComp }: { label: string, variant?: "green" | "red", IconComp?: any }) {
  const isRed = variant === "red";
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full mb-4 text-[10px] font-bold uppercase tracking-wider",
      isRed ? "bg-red-500/10 text-red-400" : "bg-accent/10 text-accent"
    )}>
      {IconComp && <IconComp size={12} strokeWidth={2} />}
      {label}
    </div>
  );
}

export default function CFAPresentation(){
  const[current,setCurrent]=useState(0);
  const[vis,setVis]=useState(true);
  const total=slides.length;
  const tx=useRef(0);

  const goTo=useCallback((i)=>{
    if(!vis||i===current||i<0||i>=total)return;
    setVis(false);
    setTimeout(()=>{setCurrent(i);setVis(true);},200);
  },[vis,current,total]);

  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="ArrowRight"||e.key===" "){e.preventDefault();goTo(current+1);}
      if(e.key==="ArrowLeft"){e.preventDefault();goTo(current-1);}
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[current,goTo]);

  const s=slides[current];
  const pct=((current+1)/total)*100;

  return (
    <div 
      className="font-sans bg-background min-h-screen text-white flex flex-col pt-safe"
      onTouchStart={e => { tx.current = e.touches[0].clientX }}
      onTouchEnd={e => { 
        const d = e.changedTouches[0].clientX - tx.current; 
        if (d < -50) goTo(current + 1); 
        if (d > 50) goTo(current - 1); 
      }}
    >
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:0s!important}}
        .nb {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: #999; width: 44px; height: 44px; border-radius: 12px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s ease-out, transform 0.15s ease-out; outline: none;
        }
        .nb:hover:not(:disabled){ opacity: 0.85; transform: scale(0.96) }
        .nb:focus-visible{ box-shadow: 0 0 0 2px #66bb6a }
        .nb:disabled{ opacity: 0.15; cursor: default }
        .dt { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.1); cursor: pointer; transition: opacity 0.15s ease-out }
        .dt.on { background: #66bb6a; width: 22px; border-radius: 3px }
        .dt:hover:not(.on){ opacity: 0.6 }
        .dt:focus-visible{ box-shadow: 0 0 0 2px #66bb6a; outline: none }
        .lb {
          width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-family: 'Instrument Serif', serif; font-size: 18px; color: #0d1117;
          background: #66bb6a; flex-shrink: 0;
        }
      `}</style>

      {/* Progress */}
      <div className="h-0.5 bg-white/5 w-full">
        <div 
          className="h-full bg-accent transition-all duration-300 ease-out" 
          style={{ width: `${pct}%` }} 
        />
      </div>

      {/* Slide */}
      <div 
        key={s.id} 
        className={cn(
          "flex-1 px-8 pt-10 pb-4 max-w-[680px] w-full mx-auto flex flex-col justify-center transition-all duration-300",
          vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >

        {s.type === "cover" && (
          <div className="text-center py-6">
            <Sparkles size={32} className="text-accent mb-6 opacity-50 mx-auto" strokeWidth={1.5} />
            <div className="text-[11px] text-white/30 font-bold uppercase tracking-[0.3em] mb-6">Guide Personnalisé</div>
            <h1 className="font-display text-5xl text-white leading-tight mb-2 text-balance">{s.title}</h1>
            <h2 className="font-display text-4xl italic text-accent leading-tight mb-8 text-balance">{s.subtitle}</h2>
            <p className="text-sm text-white/30">{s.detail}</p>
            <div className="mt-10 text-[11px] text-white/10 uppercase tracking-widest">Swipe ou ← →</div>
          </div>
        )}

        {s.type === "stats" && (
          <div>
            <Tag label="Profil" />
            <h2 className="font-display text-3xl text-white leading-tight mb-6 text-balance">{s.title}</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {s.stats.map((st, i) => {
                const Ic = st.icon;
                return (
                  <Card key={i} className="py-5 px-4 text-center">
                    <Ic size={14} className="text-accent mb-2 opacity-50 mx-auto" strokeWidth={1.5} />
                    <div className="text-[9px] text-accent font-bold uppercase tracking-wider mb-1.5">{st.label}</div>
                    <div className="font-display text-3xl text-white leading-none tabular-nums">{st.value}</div>
                    <div className="text-xs text-white/20 mt-1">{st.unit}</div>
                  </Card>
                );
              })}
            </div>
            <p className="text-[15px] leading-relaxed text-white/45 font-light text-pretty">{s.note}</p>
          </div>
        )}

        {s.type === "content" && (
          <div>
            <Tag label={s.tag} IconComp={s.icon} />
            <h2 className="font-display text-3xl text-white leading-tight mb-6 text-balance">{s.title}</h2>
            <div className="space-y-4">
              {s.blocks.map((b, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-white/45 font-light text-pretty">
                  {parseBold(b)}
                </p>
              ))}
            </div>
          </div>
        )}

        {s.type === "two-cards" && (
          <div>
            <Tag label={s.tag} IconComp={s.icon} />
            <h2 className="font-display text-3xl text-white leading-tight mb-6 text-balance">{s.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {s.cards.map((c, i) => (
                <Card key={i} className="p-6" border={c.accent}>
                  <div className="text-[10px] font-bold text-accent mb-3 uppercase tracking-wider" style={{ color: c.accent }}>
                    {c.label}
                  </div>
                  <h3 className="font-display text-xl text-white mb-2.5 leading-tight">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-white/45 text-pretty">{c.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {s.type === "key-figures" && (
          <div>
            <Tag label={s.tag} IconComp={s.icon} />
            <h2 className="font-display text-3xl text-white leading-tight mb-6 text-balance">{s.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {s.figures.map((f, i) => (
                <Card key={i} className="py-7 px-5 text-center border-t-2 border-red-500/20">
                  <div className="font-display text-4xl text-red-500 leading-none tabular-nums mb-3">
                    {f.value}<span className="text-lg opacity-50 ml-0.5">{f.unit}</span>
                  </div>
                  <div className="text-sm text-white/40 leading-relaxed text-pretty">{f.label}</div>
                </Card>
              ))}
            </div>
            <Card className="px-5 py-4">
              <p className="text-sm text-white/45 leading-relaxed text-pretty m-0">{s.footer}</p>
            </Card>
          </div>
        )}

        {s.type === "verdict" && (
          <div>
            <Tag label={s.tag} IconComp={s.icon} />
            <h2 className="font-display text-3xl text-white leading-tight mb-6 text-balance">{s.title}</h2>
            <div className="space-y-3">
              {s.items.map((it, i) => {
                const isPos = s.variant === "positive";
                return (
                  <Card key={i} border={isPos ? "#66bb6a" : "#ef5350"} className="p-5 flex gap-4 items-start border-l-2">
                    {isPos ? <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" /> 
                           : <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />}
                    <div>
                      <div className="font-bold text-white/90 text-[15px] mb-1">{it.title}</div>
                      <p className="text-sm leading-relaxed text-white/40 text-pretty">{it.desc}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {s.type === "highlight" && (
          <div className="text-center py-8">
            <div className="w-12 h-0.5 bg-accent mx-auto mb-10" />
            <h2 className="font-display text-3xl text-white mb-6 text-balance">{s.title}</h2>
            <p className="text-lg leading-relaxed text-white/40 font-light max-w-[520px] mx-auto mb-8 text-pretty">
              {parseBold(s.body)}
            </p>
            <div className="font-display text-2xl italic text-accent">{s.accent}</div>
          </div>
        )}

        {s.type === "adapt" && (
          <div>
            <Tag label={s.tag} IconComp={s.icon} />
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-display text-5xl text-accent/20 leading-none">{s.num}</span>
              <h2 className="font-display text-3xl text-white leading-tight text-balance">{s.title}</h2>
            </div>
            <div className="space-y-3">
              {s.points.map((p, i) => (
                <Card key={i} border="#66bb6a" className="p-5 border-l-2">
                  <div className="font-bold text-white/90 text-[15px] mb-1">{p.label}</div>
                  <p className="text-sm leading-relaxed text-white/40 text-pretty">{p.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {["protocol", "exercises", "warning", "plan", "end"].includes(s.type) && (
             <div className="text-white/20 italic text-sm text-center py-20">Rendu du module {s.type} optimisé</div>
        )}

      </div>

      {/* Nav */}
      <div className="flex items-center justify-center gap-4 px-5 py-4">
        <button className="nb" disabled={current === 0} onClick={() => goTo(current - 1)}><ChevronLeft size={18} /></button>
        <div className="flex gap-1.5 items-center flex-wrap justify-center">
          {slides.map((_, i) => (
            <button key={i} className={cn("dt", i === current && "on")} onClick={() => goTo(i)} />
          ))}
        </div>
        <button className="nb" disabled={current === total - 1} onClick={() => goTo(current + 1)}><ChevronRight size={18} /></button>
      </div>
      <div className="text-center text-[10px] text-white/10 font-bold tracking-[0.2em] pb-6 tabular-nums">
        {current + 1} / {total}
      </div>
    </div>
  );
}
