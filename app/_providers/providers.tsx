// 'use client'

// import { HeroUIProvider } from "@heroui/react"

// export function Providers({ children }: { children: React.ReactNode }) {
//     return (
//         <HeroUIProvider>
//             {children}
//         </HeroUIProvider>
//     )
// }
// // 
'use client'

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}