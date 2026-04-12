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

function parseBold(t){if(!t)return t;const p=t.split(/\*\*(.*?)\*\*/g);return p.map((s,i)=>i%2===1?<strong key={i} style={{color:"#fff",fontWeight:600}}>{s}</strong>:s);}

/* ── Card ── solid bg, no backdrop-filter, standard shadow */
function Card({children,style={},border}){
  return(
    <div style={{
      background:"rgba(255,255,255,0.04)",
      border:border||"1px solid rgba(255,255,255,0.07)",
      borderRadius:16,
      boxShadow:"0 1px 3px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)",
      ...style,
    }}>{children}</div>
  );
}

/* ── Tag ── */
function Tag({label,variant="green",IconComp}){
  const red=variant==="red";
  return(
    <div style={{
      display:"inline-flex",alignItems:"center",gap:6,
      padding:"5px 14px",borderRadius:100,marginBottom:16,
      fontSize:10,fontWeight:700,textTransform:"uppercase",
      background:red?"rgba(239,83,80,0.1)":"rgba(76,175,80,0.1)",
      color:red?"#ef9a9a":"#81c784",
    }}>
      {IconComp&&<IconComp size={12} strokeWidth={2}/>}
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

  return(
    <div style={S.root}
      onTouchStart={e=>{tx.current=e.touches[0].clientX}}
      onTouchEnd={e=>{const d=e.changedTouches[0].clientX-tx.current;if(d<-50)goTo(current+1);if(d>50)goTo(current-1);}}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:0s!important}}
        .nb{
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
          color:#999;width:44px;height:44px;border-radius:12px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          transition:opacity 0.15s ease-out,transform 0.15s ease-out;outline:none;
        }
        .nb:hover:not(:disabled){opacity:0.85;transform:scale(0.96)}
        .nb:focus-visible{box-shadow:0 0 0 2px #66bb6a}
        .nb:disabled{opacity:0.15;cursor:default}
        .dt{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.1);cursor:pointer;transition:opacity 0.15s ease-out}
        .dt.on{background:#66bb6a;width:22px;border-radius:3px}
        .dt:hover:not(.on){opacity:0.6}
        .dt:focus-visible{box-shadow:0 0 0 2px #66bb6a;outline:none}
        .lb{
          width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;
          font-family:'Instrument Serif',serif;font-size:18px;color:#0d1117;
          background:#66bb6a;flex-shrink:0;
        }
      `}</style>

      {/* Progress — solid color, no gradient */}
      <div style={S.pTrack}><div style={{...S.pBar,width:`${pct}%`}}/></div>

      {/* Slide */}
      <div key={s.id} style={{...S.slide,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(8px)",transition:"opacity 0.2s ease-out, transform 0.2s ease-out"}}>

        {s.type==="cover"&&(
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <Sparkles size={32} color="#66bb6a" strokeWidth={1.5} style={{marginBottom:24,opacity:0.5}}/>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",fontWeight:600,textTransform:"uppercase",marginBottom:24}}>Guide Personnalisé</div>
            <h1 style={{...S.h1,textWrap:"balance"}}>{s.title}</h1>
            <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:36,fontWeight:400,fontStyle:"italic",color:"#66bb6a",lineHeight:1.2,marginBottom:28,textWrap:"balance"}}>{s.subtitle}</h2>
            <p style={{fontSize:14,color:"rgba(255,255,255,0.3)"}}>{s.detail}</p>
            <div style={{marginTop:40,fontSize:12,color:"rgba(255,255,255,0.18)"}}>Swipe ou ← →</div>
          </div>
        )}

        {s.type==="stats"&&(
          <div>
            <Tag label="Profil"/>
            <h2 style={{...S.h2,textWrap:"balance"}}>{s.title}</h2>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",margin:"22px 0"}}>
              {s.stats.map((st,i)=>{const Ic=st.icon;return(
                <Card key={i} style={{flex:1,minWidth:100,padding:"20px 14px",textAlign:"center"}}>
                  <Ic size={14} color="#66bb6a" strokeWidth={1.5} style={{marginBottom:8,opacity:0.5}}/>
                  <div style={{fontSize:9,color:"#66bb6a",fontWeight:700,textTransform:"uppercase",marginBottom:6}}>{st.label}</div>
                  <div style={{fontFamily:"'Instrument Serif',serif",fontSize:32,color:"#fff",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{st.value}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.25)",marginTop:4}}>{st.unit}</div>
                </Card>
              );})}
            </div>
            <p style={{...S.body,textWrap:"pretty"}}>{s.note}</p>
          </div>
        )}

        {s.type==="content"&&(
          <div>
            <Tag label={s.tag} IconComp={s.icon}/>
            <h2 style={{...S.h2,textWrap:"balance"}}>{s.title}</h2>
            <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:14}}>
              {s.blocks.map((b,i)=><p key={i} style={{...S.body,textWrap:"pretty"}}>{parseBold(b)}</p>)}
            </div>
          </div>
        )}

        {s.type==="two-cards"&&(
          <div>
            <Tag label={s.tag} IconComp={s.icon}/>
            <h2 style={{...S.h2,textWrap:"balance"}}>{s.title}</h2>
            <div style={{display:"flex",gap:12,marginTop:20,flexWrap:"wrap"}}>
              {s.cards.map((c,i)=>(
                <Card key={i} border={`1px solid rgba(255,255,255,0.07)`} style={{flex:1,minWidth:230,padding:"22px 20px",borderLeft:`3px solid ${c.accent}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:c.accent,marginBottom:12,textTransform:"uppercase"}}>{c.label}</div>
                  <h3 style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:"#fff",marginBottom:10,fontWeight:400,textWrap:"balance"}}>{c.title}</h3>
                  <p style={{fontSize:14,lineHeight:1.65,color:"rgba(255,255,255,0.45)",textWrap:"pretty"}}>{c.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {s.type==="key-figures"&&(
          <div>
            <Tag label={s.tag} IconComp={s.icon}/>
            <h2 style={{...S.h2,textWrap:"balance"}}>{s.title}</h2>
            <div style={{display:"flex",gap:12,marginTop:20,flexWrap:"wrap"}}>
              {s.figures.map((f,i)=>(
                <Card key={i} style={{flex:1,minWidth:200,padding:"26px 20px",textAlign:"center",borderTop:"2px solid rgba(239,83,80,0.25)"}}>
                  <div style={{fontFamily:"'Instrument Serif',serif",fontSize:36,color:"#ef5350",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{f.value}<span style={{fontSize:16,color:"rgba(239,83,80,0.45)"}}>{f.unit}</span></div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:12,lineHeight:1.5,textWrap:"pretty"}}>{f.label}</div>
                </Card>
              ))}
            </div>
            <Card style={{marginTop:14,padding:"14px 18px"}}>
              <p style={{...S.body,margin:0,fontSize:14,textWrap:"pretty"}}>{s.footer}</p>
            </Card>
          </div>
        )}

        {s.type==="verdict"&&(
          <div>
            <Tag label={s.tag} IconComp={s.icon}/>
            <h2 style={{...S.h2,textWrap:"balance"}}>{s.title}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:18}}>
              {s.items.map((it,i)=>{const pos=s.variant==="positive";return(
                <Card key={i} style={{padding:"20px",borderLeft:`3px solid ${pos?"#66bb6a":"#ef5350"}`,display:"flex",gap:16,alignItems:"flex-start"}}>
                  {pos?<CheckCircle2 size={20} color="#66bb6a" strokeWidth={1.5} style={{flexShrink:0,marginTop:2}}/>
                       :<AlertTriangle size={20} color="#ef5350" strokeWidth={1.5} style={{flexShrink:0,marginTop:2}}/>}
                  <div>
                    <div style={{fontWeight:600,color:"#e8f5e9",fontSize:15,marginBottom:5}}>{it.title}</div>
                    <div style={{fontSize:14,lineHeight:1.65,color:"rgba(255,255,255,0.45)",textWrap:"pretty"}}>{it.desc}</div>
                  </div>
                </Card>
              );})}
            </div>
          </div>
        )}

        {s.type==="highlight"&&(
          <div style={{textAlign:"center",padding:"28px 0"}}>
            <div style={{width:48,height:2,background:"#66bb6a",margin:"0 auto 36px"}}/>
            <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:30,fontWeight:400,color:"#fff",marginBottom:24,textWrap:"balance"}}>{s.title}</h2>
            <p style={{fontSize:18,lineHeight:1.8,color:"rgba(255,255,255,0.5)",maxWidth:520,margin:"0 auto 28px",fontWeight:300,textWrap:"pretty"}}>{parseBold(s.body)}</p>
            <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:26,color:"#66bb6a"}}>{s.accent}</div>
          </div>
        )}

        {s.type==="adapt"&&(
          <div>
            <Tag label={s.tag} IconComp={s.icon}/>
            <div style={{display:"flex",alignItems:"baseline",gap:16,marginBottom:18}}>
              <span style={{fontFamily:"'Instrument Serif',serif",fontSize:44,color:"rgba(76,175,80,0.18)",lineHeight:1}}>{s.num}</span>
              <h2 style={{...S.h2,textWrap:"balance"}}>{s.title}</h2>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {s.points.map((p,i)=>(
                <Card key={i} style={{padding:"16px 20px",borderLeft:"3px solid #66bb6a"}}>
                  <div style={{fontWeight:600,color:"#e8f5e9",fontSize:15,marginBottom:4}}>{p.label}</div>
                  <div style={{fontSize:14,lineHeight:1.6,color:"rgba(255,255,255,0.4)",textWrap:"pretty"}}>{p.desc}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {s.type==="protocol"&&(
          <div>
            <Tag label={s.tag} IconComp={s.icon}/>
            <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:6}}>
              <h2 style={{...S.h2,fontSize:30}}>{s.title}</h2>
              <span style={{fontSize:14,color:"rgba(255,255,255,0.25)"}}>{s.period}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:14}}>
              {s.letters.map((l,i)=>(
                <Card key={i} style={{display:"flex",gap:14,alignItems:"flex-start",padding:"13px 16px"}}>
                  <div className="lb">{l.letter}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:15,color:"#e8f5e9",marginBottom:2}}>{l.word}</div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.55,textWrap:"pretty"}}>{l.desc}</div>
                  </div>
                  <l.Icon size={15} color="rgba(255,255,255,0.1)" strokeWidth={1.5} style={{flexShrink:0,marginTop:4}}/>
                </Card>
              ))}
            </div>
          </div>
        )}

        {s.type==="exercises"&&(
          <div>
            <Tag label={s.tag} IconComp={s.icon}/>
            <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:16}}>
              <h2 style={{...S.h2,textWrap:"balance"}}>{s.title}</h2>
              <span style={{fontSize:12,color:"#66bb6a",fontWeight:600,background:"rgba(76,175,80,0.08)",padding:"4px 12px",borderRadius:100}}>{s.freq}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {s.exercises.map((ex,i)=>(
                <Card key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderLeft:"3px solid #66bb6a"}}>
                  <ChevronRight size={14} color="#66bb6a" strokeWidth={2} style={{flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <span style={{fontWeight:600,color:"#e8f5e9",fontSize:14}}>{ex.name}</span>
                    <span style={{color:"rgba(255,255,255,0.25)",fontSize:12,marginLeft:10}}>{ex.note}</span>
                  </div>
                  <div style={{fontFamily:"'Instrument Serif',serif",fontSize:16,color:"#66bb6a",flexShrink:0,fontVariantNumeric:"tabular-nums"}}>{ex.sets}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {s.type==="warning"&&(
          <div>
            <Tag label={s.tag} variant="red" IconComp={s.icon}/>
            <h2 style={{...S.h2,textWrap:"balance"}}>{s.title}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:18}}>
              {s.items.map((it,i)=>(
                <Card key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"15px 18px",borderLeft:"3px solid #ef5350"}}>
                  <ShieldAlert size={16} color="#ef9a9a" strokeWidth={1.5} style={{flexShrink:0}}/>
                  <span style={{color:"#ef9a9a",fontSize:15}}>{it}</span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {s.type==="plan"&&(
          <div>
            <div style={{width:40,height:2,background:"#66bb6a",marginBottom:18}}/>
            <h2 style={{...S.h2,fontSize:30,marginBottom:20,textWrap:"balance"}}>{s.title}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {s.steps.map((st,i)=>(
                <Card key={i} style={{display:"flex",gap:18,alignItems:"flex-start",padding:"20px 22px"}}>
                  <div style={{fontFamily:"'Instrument Serif',serif",fontSize:30,color:"#66bb6a",lineHeight:1,flexShrink:0,opacity:0.6,fontVariantNumeric:"tabular-nums"}}>{st.num}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:17,color:"#fff",marginBottom:4}}>{st.title}</div>
                    <div style={{fontSize:14,color:"rgba(255,255,255,0.38)",lineHeight:1.5,textWrap:"pretty"}}>{st.desc}</div>
                  </div>
                  <st.Icon size={16} color="rgba(255,255,255,0.08)" strokeWidth={1.5} style={{flexShrink:0,marginTop:4}}/>
                </Card>
              ))}
            </div>
          </div>
        )}

        {s.type==="end"&&(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <Trophy size={32} color="#66bb6a" strokeWidth={1.2} style={{marginBottom:28,opacity:0.45}}/>
            <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,fontWeight:400,color:"#fff",marginBottom:4,lineHeight:1.3,textWrap:"balance"}}>{s.title}</h2>
            <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,fontWeight:400,fontStyle:"italic",color:"#66bb6a",marginBottom:28,textWrap:"balance"}}>{s.subtitle}</h2>
            <p style={{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,0.45)",maxWidth:500,margin:"0 auto 28px",fontWeight:300,textWrap:"pretty"}}>{s.body}</p>
            <Card style={{fontSize:11,lineHeight:1.7,color:"rgba(255,255,255,0.2)",maxWidth:460,margin:"0 auto",padding:"14px 18px"}}>
              {s.disclaimer}
            </Card>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,padding:"14px 20px"}}>
        <button className="nb" disabled={current===0} onClick={()=>goTo(current-1)} aria-label="Slide précédente"><ChevronLeft size={18}/></button>
        <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          {slides.map((_,i)=>(
            <div key={i} className={`dt ${i===current?"on":""}`} onClick={()=>goTo(i)} tabIndex={0} role="button" aria-label={`Slide ${i+1}`} onKeyDown={e=>e.key==="Enter"&&goTo(i)}/>
          ))}
        </div>
        <button className="nb" disabled={current===total-1} onClick={()=>goTo(current+1)} aria-label="Slide suivante"><ChevronRight size={18}/></button>
      </div>
      <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.13)",paddingBottom:10,fontVariantNumeric:"tabular-nums"}}>{current+1} / {total}</div>
    </div>
  );
}

const S={
  root:{fontFamily:"'DM Sans',sans-serif",background:"#0a0e13",minHeight:"100vh",color:"#fff",display:"flex",flexDirection:"column"},
  pTrack:{height:2,background:"rgba(255,255,255,0.04)",width:"100%"},
  pBar:{height:"100%",background:"#66bb6a",transition:"width 0.2s ease-out"},
  slide:{flex:1,padding:"34px 30px 16px",maxWidth:680,width:"100%",margin:"0 auto",display:"flex",flexDirection:"column",justifyContent:"center"},
  h1:{fontFamily:"'Instrument Serif',serif",fontSize:40,fontWeight:400,color:"#fff",lineHeight:1.12,marginBottom:2},
  h2:{fontFamily:"'Instrument Serif',serif",fontSize:27,fontWeight:400,color:"#fff",lineHeight:1.25},
  body:{fontSize:15,lineHeight:1.75,color:"rgba(255,255,255,0.45)",fontWeight:300},
};
