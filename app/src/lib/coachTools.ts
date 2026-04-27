/**
 * Coach AI Tool Declarations — Version client (JSON pur)
 * 
 * Note : Les types SchemaType et FunctionDeclaration de @google/generative-ai
 * ne sont plus utilisés ici. Le SDK AI n'a pas besoin d'être dans le bundle client.
 * Les déclarations de fonction sont dupliquées côté Worker (functions/api/_coach-tools.ts).
 */

export const COACH_FUNCTION_DECLARATIONS = [
  {
    name: 'add_pr',
    description: 'Enregistre un nouveau record personnel (PR) pour un mouvement.',
    parameters: {
      type: 'OBJECT',
      properties: {
        lift: { type: 'STRING', description: 'Mouvement : squat, bench ou deadlift' },
        weight: { type: 'NUMBER', description: 'Poids en kg' },
        reps: { type: 'NUMBER', description: 'Nombre de répétitions' },
      },
      required: ['lift', 'weight', 'reps'],
    },
  },
  {
    name: 'complete_session',
    description: "Marque une session d'entraînement comme complétée.",
    parameters: {
      type: 'OBJECT',
      properties: {
        sessionId: { type: 'STRING', description: 'ID de la session, ex: s3_lun' },
      },
      required: ['sessionId'],
    },
  },
  {
    name: 'update_rm',
    description: "Met à jour les 1RM de l'athlète. Confirmer les valeurs avant d'appeler.",
    parameters: {
      type: 'OBJECT',
      properties: {
        squat: { type: 'NUMBER', description: '1RM squat en kg' },
        bench: { type: 'NUMBER', description: '1RM bench en kg' },
        deadlift: { type: 'NUMBER', description: '1RM deadlift en kg' },
      },
    },
  },
  {
    name: 'reschedule_session',
    description: "Prend note qu'une session est reportée à une autre date. Conversationnel uniquement, ne modifie pas l'état.",
    parameters: {
      type: 'OBJECT',
      properties: {
        sessionId: { type: 'STRING' },
        originalDate: { type: 'STRING', description: 'Date originale YYYY-MM-DD' },
        newDate: { type: 'STRING', description: 'Nouvelle date YYYY-MM-DD' },
      },
      required: ['sessionId', 'newDate'],
    },
  },
] as const;

