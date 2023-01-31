import { z } from 'zod';
import { SearchType } from './model';
import { procedure, router } from './trpc';

export const appRouter = router({
  doSearch: procedure
    .input(z.object({
      query: z.string(),
      lang: z.string(),
      filters: z.array(z.object({
        name: z.string(),
        value: z.any(),
        minMax: z.boolean().optional(),
        array: z.boolean().optional(),
        formArray: z.string().optional(),
        entryName: z.string().optional(),
        canExclude: z.boolean().optional(),
        displayName: z.string().optional(),
        type: z.nativeEnum(SearchType).optional()
      })).optional()
    }))
    .query(req => {
      const { input } = req;
      const { query, lang, filters } = input;

      return 'Hello World';
    })
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
