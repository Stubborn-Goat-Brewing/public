"use client"

import { useState } from "react"
import Link from "next/link"
import { X, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnnouncementBannerProps {
  message: string
  linkText?: string
  linkHref?: string
  disclaimer?: string
  dismissible?: boolean
}

export function AnnouncementBanner({
  message,
  linkText,
  linkHref,
  disclaimer,
  dismissible = true,
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container py-3 px-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Main message row */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Tag className="h-5 w-5 text-brass shrink-0" />
              <p className="text-sm md:text-base font-medium">
                {message}
                {linkText && linkHref && (
                  <>
                    {" "}
                    <Link
                      href={linkHref}
                      className="underline underline-offset-4 hover:opacity-80 inline-flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {linkText}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </>
                )}
              </p>
            </div>
            {/* Disclaimer row */}
            {disclaimer && <p className="text-xs text-primary-foreground/60 text-center mt-1">{disclaimer}</p>}
          </div>
          {dismissible && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20 shrink-0"
              onClick={() => setIsVisible(false)}
              aria-label="Dismiss announcement"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
