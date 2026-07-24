"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const COOKIE_NAME = "sgb_age_verified"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year in seconds
const MIN_AGE = 21

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function AgeVerification() {
  const [visible, setVisible] = useState(false)
  const [month, setMonth] = useState("")
  const [day, setDay] = useState("")
  const [year, setYear] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    const verified = getCookie(COOKIE_NAME)
    if (verified !== "true") {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  function handleVerify() {
    setError(null)

    const m = parseInt(month, 10)
    const d = parseInt(day, 10)
    const y = parseInt(year, 10)

    if (!month || !day || !year) {
      setError("Please enter your full date of birth.")
      return
    }

    if (isNaN(m) || isNaN(d) || isNaN(y) || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900) {
      setError("Please enter a valid date of birth.")
      return
    }

    const dob = new Date(y, m - 1, d)
    if (isNaN(dob.getTime())) {
      setError("Please enter a valid date of birth.")
      return
    }

    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }

    if (age >= MIN_AGE) {
      setCookie(COOKIE_NAME, "true", COOKIE_MAX_AGE)
      setVisible(false)
    } else {
      setDenied(true)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-verify-title"
      aria-describedby="age-verify-desc"
    >
      <div className="w-full max-w-md mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header band */}
        <div className="bg-primary px-8 pt-8 pb-6 text-center flex flex-col items-center gap-4">
          <Image
            src="/images/full-logo.png"
            alt="Stubborn Goat Brewing logo"
            width={180}
            height={80}
            className="object-contain"
            priority
          />
          <h1
            id="age-verify-title"
            className="text-2xl font-bold text-primary-foreground text-balance"
          >
            Age Verification
          </h1>
        </div>

        <div className="px-8 py-8">
          {denied ? (
            <div className="text-center space-y-4">
              <p className="text-foreground font-semibold text-lg">
                We&apos;re sorry.
              </p>
              <p id="age-verify-desc" className="text-muted-foreground text-sm leading-relaxed">
                You must be at least {MIN_AGE} years of age to access the Stubborn Goat Brewing website. Please come back when you&apos;re of legal drinking age.
              </p>
            </div>
          ) : (
            <>
              <p
                id="age-verify-desc"
                className="text-center text-muted-foreground text-sm leading-relaxed mb-6"
              >
                You must be {MIN_AGE} years of age or older to visit Stubborn Goat Brewing. Please enter your date of birth to continue.
              </p>

              <fieldset className="mb-4">
                <legend className="sr-only">Date of birth</legend>
                <div className="flex gap-3">
                  {/* Month */}
                  <div className="flex flex-col gap-1 flex-1">
                    <label
                      htmlFor="dob-month"
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      Month
                    </label>
                    <input
                      id="dob-month"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={12}
                      placeholder="MM"
                      value={month}
                      onChange={(e) => {
                        setMonth(e.target.value)
                        setError(null)
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  {/* Day */}
                  <div className="flex flex-col gap-1 flex-1">
                    <label
                      htmlFor="dob-day"
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      Day
                    </label>
                    <input
                      id="dob-day"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={31}
                      placeholder="DD"
                      value={day}
                      onChange={(e) => {
                        setDay(e.target.value)
                        setError(null)
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  {/* Year */}
                  <div className="flex flex-col gap-1 flex-[2]">
                    <label
                      htmlFor="dob-year"
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      Year
                    </label>
                    <input
                      id="dob-year"
                      type="number"
                      inputMode="numeric"
                      min={1900}
                      max={new Date().getFullYear()}
                      placeholder="YYYY"
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value)
                        setError(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                          handleVerify()
                        }
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                </div>
              </fieldset>

              {error && (
                <p role="alert" className="text-destructive text-sm text-center mb-4">
                  {error}
                </p>
              )}

              <Button
                onClick={handleVerify}
                className="w-full"
                size="lg"
              >
                Verify My Age
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
                By entering this site you agree to our{" "}
                <a href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
