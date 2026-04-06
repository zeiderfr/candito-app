// js/data.js — NAV, SECTION_META, PROGRAM, ALL_SESSIONS
// Aucune dépendance — module racine du graphe
// Lexique : Tactical Blueprint

export const NAV = [
    {id:'accueil',label:'Tableau de bord'},
    {id:'echauffement',label:'Protocole Init'},
    {id:'s1s2',label:'S1-S2'},
    {id:'s3',label:'S3'},
    {id:'s4',label:'S4'},
    {id:'s5',label:'S5'},
    {id:'s6',label:'S6'},
    {id:'nutrition',label:'Carburant'},
    {id:'rpe',label:'RPE'},
    {id:'charges',label:'Télémétrie'},
];

export const SECTION_META = {
    accueil:       {title:'Tableau de bord',          subtitle:''},
    echauffement:  {title:'Protocole d\'Initialisation', subtitle:'Activation Wenning • Gammes montantes'},
    s1s2:          {title:'Semaines 1-2',     subtitle:'Phase d\'accumulation — 5 séances — 78-82%'},
    s3:            {title:'Semaine 3',        subtitle:'Phase de transmutation — 3 séances — 85-88%'},
    s4:            {title:'Semaine 4',        subtitle:'Phase d\'acclimatation — 3 séances — 90-93%'},
    s5:            {title:'Semaine 5',        subtitle:'Phase de peaking — Tests AMRAP — 95%'},
    s6:            {title:'Semaine 6',        subtitle:'Test Maxis ou Protocole de refroidissement'},
    nutrition:     {title:'Matrice Carburant',  subtitle:'Macros • Timing • Hydratation'},
    rpe:           {title:'RPE & Autorégulation', subtitle:'Échelle RPE-RIR • Signaux d\'alerte'},
    charges:       {title:'Matrice de Télémétrie',  subtitle:'Calculateur intégré — 40% à 102%'},
};

export const PROGRAM = [
  { id:'s1s2', sessions:[
    { id:'s12_lun', day:'Lundi', focus:'Squat & Deadlift', exercises:[
      {name:'Squat Low Bar',sets:4,reps:'6-8',lo:.78,hi:.82,lift:'squat',primary:['Quadriceps','Fessiers'],secondary:['Ischio-jambiers','Core','Adducteurs']},
      {name:'Soulevé de terre',sets:2,reps:'6',lo:.78,hi:.82,lift:'deadlift',primary:['Érecteurs','Ischio-jambiers','Fessiers'],secondary:['Quadriceps','Trapèzes','Avant-bras']},
      {name:'Hip Thrust',sets:3,reps:'8-10',lift:null,primary:['Fessiers'],secondary:['Ischio-jambiers','Core']},
      {name:'Hack Squat',sets:3,reps:'8-12',lift:null,primary:['Quadriceps'],secondary:['Fessiers','Mollets']},
      {name:'Hanging Leg Raises',sets:3,reps:'10-15',lift:null,primary:['Abdominaux'],secondary:['Fléchisseurs hanche']},
    ]},
    { id:'s12_mar', day:'Mardi', focus:'Bench & Upper', exercises:[
      {name:'Développé couché',sets:4,reps:'6-8',lo:.78,hi:.82,lift:'bench',primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.','Core']},
      {name:'Dips',sets:3,reps:'8-12',lift:null,primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.']},
      {name:'Rowing buste penché',sets:3,reps:'8-12',lift:null,primary:['Dorsaux','Trapèzes','Biceps'],secondary:['Érecteurs','Deltoïdes post.']},
      {name:'Face Pulls',sets:4,reps:'15-20',lift:null,primary:['Deltoïdes post.','Trapèzes moy.'],secondary:['Rhomboïdes','Rotateurs ext.']},
    ]},
    { id:'s12_jeu', day:'Jeudi', focus:'Upper Accessoire', exercises:[
      {name:'Larsen Press',sets:4,reps:'8-10',lo:.65,hi:.75,lift:'bench',primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.']},
      {name:'OHP Dév. militaire',sets:3,reps:'6-8',lift:null,primary:['Deltoïdes','Triceps'],secondary:['Trapèzes','Core']},
      {name:'Tractions',sets:3,reps:'8-10',lift:null,primary:['Dorsaux','Biceps'],secondary:['Trapèzes','Deltoïdes post.']},
      {name:'Face Pulls',sets:4,reps:'15-20',lift:null,primary:['Deltoïdes post.','Trapèzes moy.'],secondary:['Rhomboïdes']},
    ]},
    { id:'s12_ven', day:'Vendredi', focus:'Lower Accessoire', exercises:[
      {name:'Pause Squat',sets:3,reps:'8',lo:.68,hi:.72,lift:'squat',primary:['Quadriceps','Fessiers'],secondary:['Ischio-jambiers','Core','Adducteurs']},
      {name:'RDL Romanian DL',sets:3,reps:'8',lo:.65,hi:.70,lift:'deadlift',primary:['Ischio-jambiers','Fessiers','Érecteurs'],secondary:['Trapèzes','Avant-bras']},
      {name:'Nordic Curls',sets:3,reps:'4-6',lift:null,primary:['Ischio-jambiers'],secondary:['Mollets','Fessiers']},
      {name:'Ab Wheel',sets:3,reps:'10-15',lift:null,primary:['Abdominaux','Obliques'],secondary:['Deltoïdes','Dorsaux']},
    ]},
    { id:'s12_sam', day:'Samedi', focus:'Bench Volume', exercises:[
      {name:'Développé couché',sets:3,reps:'6-8',lo:.78,hi:.82,lift:'bench',primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.','Core']},
      {name:'Dév. incliné haltères',sets:3,reps:'8-12',lift:null,primary:['Pectoraux sup.','Deltoïdes ant.'],secondary:['Triceps']},
      {name:'Élévations latérales',sets:3,reps:'12-15',lift:null,primary:['Deltoïdes médians'],secondary:['Trapèzes sup.']},
      {name:'Triceps Pushdowns',sets:3,reps:'10-15',lift:null,primary:['Triceps'],secondary:['Anconé']},
      {name:'Face Pulls',sets:3,reps:'15-20',lift:null,primary:['Deltoïdes post.'],secondary:['Rhomboïdes']},
    ]},
  ]},
  { id:'s3', sessions:[
    { id:'s3_lun', day:'Lundi', focus:'Squat & Deadlift', exercises:[
      {name:'Squat Low Bar',sets:3,reps:'4-6',lo:.85,hi:.88,lift:'squat',primary:['Quadriceps','Fessiers'],secondary:['Ischio-jambiers','Core']},
      {name:'Soulevé de terre',sets:2,reps:'4-6',lo:.85,hi:.88,lift:'deadlift',primary:['Érecteurs','Ischio-jambiers','Fessiers'],secondary:['Quadriceps','Trapèzes']},
      {name:'Hanging Leg Raises',sets:2,reps:'10-15',lift:null,primary:['Abdominaux'],secondary:['Fléchisseurs hanche']},
    ]},
    { id:'s3_mar', day:'Mardi', focus:'Bench', exercises:[
      {name:'Développé couché',sets:3,reps:'4-6',lo:.85,hi:.88,lift:'bench',primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.','Core']},
      {name:'Rowing buste penché',sets:2,reps:'6-8',lift:null,primary:['Dorsaux','Trapèzes','Biceps'],secondary:['Érecteurs']},
      {name:'Face Pulls',sets:3,reps:'15',lift:null,primary:['Deltoïdes post.'],secondary:['Rhomboïdes']},
    ]},
    { id:'s3_ven', day:'Vendredi', focus:'Bench / Larsen', exercises:[
      {name:'Bench / Larsen Press',sets:3,reps:'4-6',lo:.82,hi:.85,lift:'bench',primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.']},
      {name:'Tractions',sets:2,reps:'6-8',lift:null,primary:['Dorsaux','Biceps'],secondary:['Trapèzes']},
      {name:'Face Pulls',sets:2,reps:'15',lift:null,primary:['Deltoïdes post.'],secondary:['Rhomboïdes']},
    ]},
  ]},
  { id:'s4', sessions:[
    { id:'s4_lun', day:'Lundi', focus:'Squat & Deadlift', exercises:[
      {name:'Squat Low Bar',sets:3,reps:'2-3',lo:.90,hi:.93,lift:'squat',primary:['Quadriceps','Fessiers'],secondary:['Ischio-jambiers','Core']},
      {name:'Soulevé de terre',sets:2,reps:'2-3',lo:.90,hi:.93,lift:'deadlift',primary:['Érecteurs','Ischio-jambiers','Fessiers'],secondary:['Quadriceps','Trapèzes']},
    ]},
    { id:'s4_mar', day:'Mardi', focus:'Bench', exercises:[
      {name:'Développé couché',sets:3,reps:'2-3',lo:.90,hi:.93,lift:'bench',primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.','Core']},
      {name:'Rowing buste penché',sets:2,reps:'5-6',lift:null,primary:['Dorsaux','Trapèzes','Biceps'],secondary:['Érecteurs']},
    ]},
    { id:'s4_ven', day:'Vendredi', focus:'Bench Léger', exercises:[
      {name:'Développé couché',sets:3,reps:'2-3',lo:.90,hi:.92,lift:'bench',primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.']},
      {name:'Face Pulls',sets:2,reps:'15',lift:null,primary:['Deltoïdes post.'],secondary:['Rhomboïdes']},
    ]},
  ]},
  { id:'s5', sessions:[
    { id:'s5_lun', day:'Lundi', focus:'TEST Squat & Deadlift', exercises:[
      {name:'TEST Squat AMRAP',sets:1,reps:'AMRAP',lo:.95,hi:.95,lift:'squat',isTest:true,primary:['Quadriceps','Fessiers'],secondary:['Ischio-jambiers','Core']},
      {name:'TEST Deadlift AMRAP',sets:1,reps:'AMRAP',lo:.95,hi:.95,lift:'deadlift',isTest:true,primary:['Érecteurs','Ischio-jambiers','Fessiers'],secondary:['Quadriceps','Trapèzes']},
    ]},
    { id:'s5_mar', day:'Mardi', focus:'TEST Bench', exercises:[
      {name:'TEST Bench AMRAP',sets:1,reps:'AMRAP',lo:.95,hi:.95,lift:'bench',isTest:true,primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.','Core']},
      {name:'Rowing buste penché',sets:3,reps:'8',lift:null,primary:['Dorsaux','Trapèzes','Biceps'],secondary:['Érecteurs']},
      {name:'Face Pulls',sets:2,reps:'15',lift:null,primary:['Deltoïdes post.'],secondary:['Rhomboïdes']},
    ]},
  ]},
  { id:'s6', sessions:[
    { id:'s6_test_lun', day:'Lundi (Test)', focus:'SQ + DL Maxis', alt:'test', exercises:[
      {name:'Squat Opener',sets:1,reps:'1',lo:.90,hi:.92,lift:'squat',primary:['Quadriceps','Fessiers'],secondary:['Ischio-jambiers','Core']},
      {name:'Squat 2ème',sets:1,reps:'1',lo:.96,hi:.98,lift:'squat',primary:['Quadriceps','Fessiers'],secondary:['Ischio-jambiers','Core']},
      {name:'Squat PR',sets:1,reps:'1',lo:1.00,hi:1.02,lift:'squat',isPR:true,primary:['Quadriceps','Fessiers'],secondary:['Ischio-jambiers','Core']},
      {name:'Deadlift Opener',sets:1,reps:'1',lo:.90,hi:.92,lift:'deadlift',primary:['Érecteurs','Ischio-jambiers','Fessiers'],secondary:['Quadriceps','Trapèzes']},
      {name:'Deadlift 2ème',sets:1,reps:'1',lo:.96,hi:.98,lift:'deadlift',primary:['Érecteurs','Ischio-jambiers','Fessiers'],secondary:['Quadriceps','Trapèzes']},
      {name:'Deadlift PR',sets:1,reps:'1',lo:1.00,hi:1.02,lift:'deadlift',isPR:true,primary:['Érecteurs','Ischio-jambiers','Fessiers'],secondary:['Quadriceps','Trapèzes']},
    ]},
    { id:'s6_test_mer', day:'Mercredi (Test)', focus:'Bench Maxis', alt:'test', exercises:[
      {name:'Bench Opener',sets:1,reps:'1',lo:.90,hi:.92,lift:'bench',primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.','Core']},
      {name:'Bench 2ème',sets:1,reps:'1',lo:.96,hi:.98,lift:'bench',primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.','Core']},
      {name:'Bench PR',sets:1,reps:'1',lo:1.00,hi:1.02,lift:'bench',isPR:true,primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.','Core']},
    ]},
    { id:'s6_dec_lun', day:'Lundi (Refroidissement)', focus:'SQ + DL Léger', alt:'decharge', exercises:[
      {name:'Squat',sets:2,reps:'3',lo:.80,hi:.80,lift:'squat',primary:['Quadriceps','Fessiers'],secondary:['Ischio-jambiers']},
      {name:'Soulevé de terre',sets:1,reps:'3',lo:.80,hi:.80,lift:'deadlift',primary:['Érecteurs','Ischio-jambiers','Fessiers'],secondary:['Quadriceps']},
    ]},
    { id:'s6_dec_mer', day:'Mercredi (Refroidissement)', focus:'Bench Léger', alt:'decharge', exercises:[
      {name:'Développé couché',sets:2,reps:'3',lo:.80,hi:.80,lift:'bench',primary:['Pectoraux','Triceps'],secondary:['Deltoïdes ant.']},
    ]},
  ]},
];

export const ALL_SESSIONS = PROGRAM.flatMap(w => w.sessions);
