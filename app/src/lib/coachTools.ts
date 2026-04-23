export const COACH_TOOLS = [
  {
    name: 'add_pr',
    description: 'Enregistre un nouveau record personnel (PR) pour un mouvement.',
    input_schema: {
      type: 'object',
      properties: {
        lift: { type: 'string', description: 'Mouvement : squat, bench ou deadlift' },
        weight: { type: 'number', description: 'Poids en kg' },
        reps: { type: 'number', description: 'Nombre de répétitions' },
      },
      required: ['lift', 'weight', 'reps'],
    },
  },
  {
    name: 'complete_session',
    description: "Marque une session d'entraînement comme complétée.",
    input_schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'ID de la session, ex: s3_lun' },
      },
      required: ['sessionId'],
    },
  },
  {
    name: 'update_rm',
    description: "Met à jour les 1RM de l'athlète. Confirmer les valeurs avant d'appeler.",
    input_schema: {
      type: 'object',
      properties: {
        squat: { type: 'number', description: '1RM squat en kg' },
        bench: { type: 'number', description: '1RM bench en kg' },
        deadlift: { type: 'number', description: '1RM deadlift en kg' },
      },
    },
  },
  {
    name: 'reschedule_session',
    description: "Prend note qu'une session est reportée à une autre date. Conversationnel uniquement, ne modifie pas l'état.",
    input_schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        originalDate: { type: 'string', description: 'Date originale YYYY-MM-DD' },
        newDate: { type: 'string', description: 'Nouvelle date YYYY-MM-DD' },
      },
      required: ['sessionId', 'newDate'],
    },
  },
] as any[]
