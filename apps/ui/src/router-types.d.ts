import type { QueryClient } from '@tanstack/react-query'

declare module '@tanstack/react-router' {
    // Tells TS that route loader context includes `queryClient`
    interface RouterContext {
        queryClient: QueryClient
    }
}