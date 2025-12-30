"use client"

import { Query, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

interface DefaultProvidersProps {
    children: React.ReactNode
}

export default function  DefaultProviders({children}:DefaultProvidersProps){
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient} >
            {children}
        </QueryClientProvider>
    )
}