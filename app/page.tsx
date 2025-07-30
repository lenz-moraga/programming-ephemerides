"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useIsMobile } from "@/hooks/use-mobile"
import { useOperatingSystem } from "@/hooks/use-os"

export default function ProgrammingEphemeris() {
  const [currentDate, setCurrentDate] = useState("")
  const [todayEphemeris, setTodayEphemeris] = useState("")
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showCursor, setShowCursor] = useState(true)
  const isMobile = useIsMobile()
  const os = useOperatingSystem()

  // Get the appropriate close command based on OS
  const getCloseCommand = () => {
    switch (os) {
      case "mac":
        return "Cmd+W"
      case "windows":
      case "linux":
        return "Ctrl+W"
      default:
        return "Ctrl+W"
    }
  }

  useEffect(() => {
    const now = new Date()
    const dateStr = now.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    setCurrentDate(dateStr)

    // Leer efeméride de hoy desde Supabase
    const fetchEphemeris = async () => {
      const day = now.getDate()
      const month = now.getMonth() + 1
      const { data, error } = await supabase
        .from("ephemerides")
        .select("event")
        .eq("day", day)
        .eq("month", month)
        .order("year", { ascending: false })
        .limit(1)

      if (error) {
        setTodayEphemeris("No hay efemérides registradas para hoy. ¡Pero cada día es una oportunidad para programar algo increíble!")
      } else if (data && data.length > 0) {
        setTodayEphemeris(data[0].event)
      } else {
        setTodayEphemeris("No hay efemérides registradas para hoy. ¡Pero cada día es una oportunidad para programar algo increíble!")
      }
    }
    fetchEphemeris()
  }, [])

  useEffect(() => {
    if (!todayEphemeris) return

    const fullText = `$ programming-ephemeris --date=today\n\nCargando efemérides de programación...\n\n═══════════════════════════════════════════════════════════════════════════════\n\n📅 ${currentDate}\n\n${todayEphemeris}\n\n═══════════════════════════════════════════════════════════════════════════════\n\n$ _`

    let index = 0
    const typeText = () => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1))
        index++
        setTimeout(typeText, Math.random() * 30 + 10)
      } else {
        setIsTyping(false)
      }
    }

    const timer = setTimeout(typeText, 1000)
    return () => clearTimeout(timer)
  }, [todayEphemeris, currentDate])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float-slower"></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-float"></div>

      {/* Glass container */}
      <div className="relative z-10 min-h-screen backdrop-blur-sm bg-black/40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent"></div>

        <div className="relative z-20 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Terminal window header */}
            <div className="mb-4 flex items-center gap-2 text-xs text-emerald-400/60">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
              </div>
              <span className="ml-2 text-emerald-300/40">programming-ephemeris@terminal:~</span>
            </div>

            {/* Terminal content */}
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-emerald-500/20 p-6 shadow-2xl">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-emerald-300 font-mono">
                {displayText}
                {(isTyping || showCursor) && (
                  <span
                    className={`${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100 text-emerald-400`}
                  >
                    █
                  </span>
                )}
              </pre>

              {!isTyping && !isMobile && (
                <div className="mt-8 text-xs text-emerald-400/60 border-t border-emerald-500/20 pt-4">
                  <p className="text-emerald-300/80 mb-2">Comandos disponibles:</p>
                  <div className="space-y-1">
                    <p>
                      • <span className="text-purple-300">{getCloseCommand()}</span> para salir
                    </p>
                    <p>
                      • <span className="text-blue-300">F5</span> para actualizar
                    </p>
                    <p>
                      • <span className="text-emerald-300">programming-ephemeris --help</span> para más información
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle scanlines effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-30">
        <div
          className="h-full w-full animate-scanlines"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.1) 2px, rgba(34, 197, 94, 0.1) 4px)",
          }}
        ></div>
      </div>
    </div>
  )
}
