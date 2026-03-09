import { ScrollViewStyleReset } from "expo-router/html"
import type { PropsWithChildren } from "react"
import { useServerUnistyles } from "react-native-unistyles"

import "../lib/unistyles"

export default function Root({ children }: PropsWithChildren) {
  const serverUnistyles = useServerUnistyles({ includeRNWStyles: false })

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        {serverUnistyles}
      </head>
      <body>{children}</body>
    </html>
  )
}
