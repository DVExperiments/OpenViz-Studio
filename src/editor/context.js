// Shared editor context for modules split out of app.js. app.js binds live accessors at start-up,
// so modules always see the current project, UI state and helpers (no copies, no globals).
export const ctx={};
export function bindEditorContext(api){Object.defineProperties(ctx,Object.getOwnPropertyDescriptors(api));}
