"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Link2, Quote, Type, Undo2, Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ============================================================
// RichTextEditor — WYSIWYG editor dengan contentEditable
// ============================================================
// Features:
//   - Bold, Italic, Underline
//   - Font size (12px, 14px, 16px, 18px, 20px, 24px, 28px, 32px)
//   - Headings (H1, H2, H3, Normal)
//   - Bullet list, Numbered list
//   - Link
//   - Quote (blockquote)
//   - Undo/Redo
//
// Output: HTML string (disimpan ke Firestore)
// Frontend: render dengan dangerouslySetInnerHTML
// ============================================================

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  label = "Konten",
  placeholder = "Tulis konten di sini...",
  minHeight = 250,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value → editor (only when value changes externally)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  // Handle input → emit HTML
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Execute formatting command
  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  // Font size via execCommand
  const setFontSize = useCallback((size: string) => {
    if (size === "normal") {
      // Remove font size by setting to default
      document.execCommand("removeFormat", false);
    } else {
      // execCommand fontSize uses 1-7 scale, not px. We use CSS instead.
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement("span");
        span.style.fontSize = size;
        try {
          range.surroundContents(span);
        } catch {
          // If range crosses elements, use extractContents
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
        }
      } else {
        // No selection — set for future typing
        document.execCommand("fontSize", false, "7");
        const fonts = editorRef.current?.querySelectorAll('font[size="7"]');
        fonts?.forEach(font => {
          const el = font as HTMLElement;
          el.removeAttribute("size");
          el.style.fontSize = size;
        });
      }
    }
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  // Set heading / paragraph
  const setBlock = useCallback((tag: string) => {
    if (tag === "p") {
      document.execCommand("formatBlock", false, "p");
    } else {
      document.execCommand("formatBlock", false, tag);
    }
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  // Insert link
  const insertLink = useCallback(() => {
    const url = window.prompt("Masukkan URL link:");
    if (url) {
      exec("createLink", url);
    }
  }, [exec]);

  // Toolbar button component
  const ToolButton = ({ onClick, icon: Icon, title, active }: {
    onClick: () => void; icon: React.ElementType; title: string; active?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
        active ? "bg-primary text-white" : "hover:bg-secondary text-foreground/70"
      }`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  const fontSizes = [
    { value: "12px", label: "12px" },
    { value: "14px", label: "14px" },
    { value: "16px", label: "16px (Normal)" },
    { value: "18px", label: "18px" },
    { value: "20px", label: "20px" },
    { value: "24px", label: "24px" },
    { value: "28px", label: "28px" },
    { value: "32px", label: "32px" },
  ];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 rounded-xl border border-border bg-secondary/30 flex-wrap sticky top-0 z-10">
        <ToolButton onClick={() => exec("undo")} icon={Undo2} title="Undo" />
        <ToolButton onClick={() => exec("redo")} icon={Redo2} title="Redo" />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Block format */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setBlock("p"); }}
          className="px-2 h-8 rounded-lg text-xs font-medium hover:bg-secondary text-foreground/70"
          title="Paragraf Normal"
        >
          Normal
        </button>
        <ToolButton onClick={() => setBlock("h1")} icon={Heading1} title="Heading 1" />
        <ToolButton onClick={() => setBlock("h2")} icon={Heading2} title="Heading 2" />
        <ToolButton onClick={() => setBlock("h3")} icon={Heading3} title="Heading 3" />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Font size */}
        <Select onValueChange={setFontSize}>
          <SelectTrigger className="w-[130px] h-8 rounded-lg text-xs">
            <Type className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Ukuran" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map(fs => (
              <SelectItem key={fs.value} value={fs.value} style={{ fontSize: fs.value }}>
                {fs.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Inline format */}
        <ToolButton onClick={() => exec("bold")} icon={Bold} title="Bold (Ctrl+B)" />
        <ToolButton onClick={() => exec("italic")} icon={Italic} title="Italic (Ctrl+I)" />
        <ToolButton onClick={() => exec("underline")} icon={Underline} title="Underline (Ctrl+U)" />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <ToolButton onClick={() => exec("insertUnorderedList")} icon={List} title="Bullet List" />
        <ToolButton onClick={() => exec("insertOrderedList")} icon={ListOrdered} title="Numbered List" />
        <ToolButton onClick={() => exec("formatBlock", "blockquote")} icon={Quote} title="Quote" />
        <ToolButton onClick={insertLink} icon={Link2} title="Insert Link" />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="rounded-xl border border-border bg-background p-4 outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all prose-pbr max-w-none"
        style={{ minHeight: `${minHeight}px` }}
        suppressContentEditableWarning
      />

      {/* Hint */}
      <p className="text-[10px] text-muted-foreground">
        Pilih teks lalu klik toolbar untuk format. Gunakan Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline).
      </p>
    </div>
  );
}
