// Define the AppStep values as constants, compatible with verbatimModuleSyntax
export const AppStep = {
    INITIAL: 'INITIAL',
    ANSWERING: 'ANSWERING',
    FINAL: 'FINAL',
} as const;

// Infer the type from the values for type safety
export type AppStep = typeof AppStep[keyof typeof AppStep];