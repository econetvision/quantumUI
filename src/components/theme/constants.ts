/**
 * Theme constants shared by server and client.
 *
 * This deliberately has no `'use client'` directive. The key is interpolated
 * into the pre-paint inline script rendered by the *server* layout; importing
 * it from the client-only ThemeProvider made Next replace the value with a
 * "cannot call a client function from the server" error stub, so the script
 * read from the wrong localStorage key and the stored theme never applied.
 */
export const THEME_STORAGE_KEY = 'quantumui-theme';
