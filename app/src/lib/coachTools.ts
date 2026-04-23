import { SchemaType, type FunctionDeclaration } from '@google/generative-ai'

export const COACH_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'add_pr',
    description: 'Enregistre un nouveau record personnel (PR) pour un mouvement.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        lift: { type: SchemaType.STRING, description: 'Mouvement : squat, bench ou deadlift' },
        weight: { type: SchemaType.NUMBER, description: 'Poids en kg' },
        reps: { type: SchemaType.NUMBER, description: 'Nombre de répétitions' },
      },
      required: ['lift', 'weight', 'reps'],
    },
  },
  {
    name: 'complete_session',
    description: "Marque une session d'entraînement comme complétée.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sessionId: { type: SchemaType.STRING, description: 'ID de la session, ex: s3_lun' },
      },
      required: ['sessionId'],
    },
  },
  {
    name: 'update_rm',
    description: "Met à jour les 1RM de l'athlète. Confirmer les valeurs avant d'appeler.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        squat: { type: SchemaType.NUMBER, description: '1RM squat en kg' },
        bench: { type: SchemaType.NUMBER, description: '1RM bench en kg' },
        deadlift: { type: SchemaType.NUMBER, description: '1RM deadlift en kg' },
      },
    },
  },
  {
    name: 'reschedule_session',
    description: "Prend note qu'une session est reportée à une autre date. Conversationnel uniquement, ne modifie pas l'état.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sessionId: { type: SchemaType.STRING },
        originalDate: { type: SchemaType.STRING, description: 'Date originale YYYY-MM-DD' },
        newDate: { type: SchemaType.STRING, description: 'Nouvelle date YYYY-MM-DD' },
      },
      required: ['sessionId', 'newDate'],
    },
  },
]
