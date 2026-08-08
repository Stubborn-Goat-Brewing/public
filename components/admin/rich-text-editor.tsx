"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bold, Italic, Link as LinkIcon, Link2Off, List, ListOrdered } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type RichTextEditorProps = {
  id?: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  ariaLabel?: string
}

/**
 * A deliberately small WYSIWYG editor for admin description fields.
 *
 * It is a `contentEditable` surface driven by `document.execCommand`, which
 * keeps the component dependency-free while still producing real HTML (bold,
 * italic, links, lists). The emitted HTML is the *draft*; the server action
 * runs it through `sanitizeHtml` before it is ever stored or rendered, so this
 * component only needs to focus on the editing experience.
 */
export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  className,
  ariaLabel,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const savedRange = useRef<Range | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkValue, setLinkValue] = useState("")
  const [isEmpty, setIsEmpty] = useState(() => isHtmlEmpty(value))

  // Push external value changes into the DOM, but never while the user is
  // typing - reassigning innerHTML would collapse their caret to the start.
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (document.activeElement === el) return
    const next = value ?? ""
    if (el.innerHTML !== next) {
      el.innerHTML = next
      setIsEmpty(isHtmlEmpty(next))
    }
  }, [value])

  const emit = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    const html = el.innerHTML
    setIsEmpty(isHtmlEmpty(html))
    onChange(html)
  }, [onChange])

  const exec = useCallback(
    (command: string, arg?: string) => {
      editorRef.current?.focus()
      document.execCommand(command, false, arg)
      emit()
    },
    [emit],
  )

  const saveSelection = useCallback(() => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    } else {
      savedRange.current = null
    }
  }, [])

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection()
    if (sel && savedRange.current) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
  }, [])

  const openLink = useCallback(() => {
    saveSelection()
    setLinkValue(currentLinkHref() ?? "")
    setLinkOpen(true)
  }, [saveSelection])

  const applyLink = useCallback(() => {
    const url = normalizeUrl(linkValue.trim())
    editorRef.current?.focus()
    restoreSelection()
    if (url) {
      document.execCommand("createLink", false, url)
    }
    setLinkOpen(false)
    setLinkValue("")
    emit()
  }, [linkValue, restoreSelection, emit])

  const removeLink = useCallback(() => {
    editorRef.current?.focus()
    restoreSelection()
    document.execCommand("unlink")
    setLinkOpen(false)
    setLinkValue("")
    emit()
  }, [restoreSelection, emit])

  // Paste as plain text so admins never smuggle in messy external markup; links
  // are added deliberately through the toolbar instead.
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault()
      const text = event.clipboardData.getData("text/plain")
      document.execCommand("insertText", false, text)
      emit()
    },
    [emit],
  )

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-input p-1">
        <ToolbarButton label="Bold" onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolbarButton label="Bulleted list" onClick={() => exec("insertUnorderedList")}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolbarButton label="Add link" onClick={openLink} active={linkOpen}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Remove link" onClick={removeLink}>
          <Link2Off className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {linkOpen && (
        <div className="flex items-center gap-2 border-b border-input bg-muted/40 p-2">
          <Input
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                applyLink()
              } else if (e.key === "Escape") {
                e.preventDefault()
                setLinkOpen(false)
              }
            }}
            placeholder="https://example.com"
            className="h-8"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <button
            type="button"
            onClick={applyLink}
            className="inline-flex h-8 shrink-0 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setLinkOpen(false)}
            className="inline-flex h-8 shrink-0 items-center rounded-md px-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="relative">
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          onPaste={handlePaste}
          className="prose prose-sm prose-neutral dark:prose-invert min-h-[7rem] max-w-none px-3 py-2 leading-relaxed focus:outline-none [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        />
        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string
  onClick: () => void
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      // Keep the editor's selection intact: mousedown would otherwise blur it
      // before the command runs.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </button>
  )
}

/** True when the markup has no visible text or media. */
function isHtmlEmpty(html: string): boolean {
  if (!html) return true
  const text = html
    .replace(/<(br|img|hr)\b[^>]*>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim()
  return text.length === 0
}

/** Normalizes user-entered link text and rejects unsafe schemes. */
function normalizeUrl(url: string): string | null {
  if (!url) return null
  if (url.startsWith("/") || url.startsWith("#")) return url
  if (/^(mailto:|tel:)/i.test(url)) return url
  if (/^https?:\/\//i.test(url)) return url
  if (/^(javascript|data|vbscript|file):/i.test(url)) return null
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(url)) return `https://${url}`
  return null
}

/** Returns the href of the anchor surrounding the current selection, if any. */
function currentLinkHref(): string | null {
  const sel = window.getSelection()
  let node = (sel?.anchorNode as Node | null) ?? null
  while (node) {
    if (node instanceof HTMLAnchorElement) return node.getAttribute("href")
    node = node.parentNode
  }
  return null
}
