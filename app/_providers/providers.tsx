'use client'

import { SessionProvider } from "next-auth/react"
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { setCookie } from 'cookies-next'

function TokenSyncer() {
  const { data: session } = useSession()

  useEffect(() => {
    const access  = (session?.user as any)?.accessToken
    const refresh = (session?.user as any)?.refreshToken

    if (access)  setCookie('caposa_access_token', access, { path: '/', maxAge: 60 * 60 * 24 })
    if (refresh) setCookie('caposa_refresh_token', refresh, { path: '/', maxAge: 60 * 60 * 24 * 30 })
  }, [session])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TokenSyncer />
      {children}
    </SessionProvider>
  )
}
//Documents\Final Project\caposa-ui\app\_providers\providers.tsx