from typing import Dict, Any

# Extract token usage from Azure OpenAI response payloads.
# We avoid local counting; we trust upstream 'usage' fields.

def extract_token_usage(payload: Dict[str, Any]) -> int:
    usage = payload.get("usage")
    if not usage:
        return 0
    total = 0
    for k, v in usage.items():
        if isinstance(v, int):
            total += v
    # Prefer explicit total if present
    if isinstance(usage.get("total_tokens"), int):
        return int(usage["total_tokens"])
    return int(total)
