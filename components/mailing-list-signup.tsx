"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"

export function MailingListSignup() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: null, message: "" })

    try {
      // Make a direct POST request to the API route
      const response = await fetch("/api/mailchimp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setEmail("")
        setStatus({
          type: "success",
          message: "Thanks for subscribing! Please check your email to confirm.",
        })
      } else {
        setStatus({
          type: "error",
          message: result.message || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error subscribing to newsletter:", error)
      setStatus({
        type: "error",
        message: "Failed to subscribe. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>

      {status.type === "success" && (
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="mr-1 h-4 w-4" />
          {status.message}
        </div>
      )}

      {status.type === "error" && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="mr-1 h-4 w-4" />
          {status.message}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        By subscribing, you agree to receive marketing emails from Stubborn Goat Brewing. You can unsubscribe at any
        time.
      </p>
    </form>
  )
}
