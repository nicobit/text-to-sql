

def clean_text(text: str) -> str:
    """Trim whitespace and sanitize text."""
    return text.strip() if text else ""

def format_memory_item(item) -> str:
    """Return the text from a memory item or stringify it."""
    try:
        return clean_text(item.text) if hasattr(item, "text") else clean_text(str(item))
    except Exception:
        return "<unreadable memory item>"

def summarize_context(items: list) -> str:
    """Create a human-readable summary of memory context for prompt injection."""
    return "\n".join(format_memory_item(i) for i in items if i)
