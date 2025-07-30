import * as React from "react"

export type OperatingSystem = "windows" | "mac" | "linux" | "unknown"

export function useOperatingSystem() {
  const [os, setOs] = React.useState<OperatingSystem>("unknown")

  React.useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes("win")) {
      setOs("windows")
    } else if (userAgent.includes("mac")) {
      setOs("mac")
    } else if (userAgent.includes("linux")) {
      setOs("linux")
    } else {
      setOs("unknown")
    }
  }, [])

  return os
} 