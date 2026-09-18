import json
import re
from typing import Dict, Any, Optional

def clean_llm_json(raw_text: str) -> Dict[str, Any]:
    """
    Extracts and parses JSON strictly from raw LLM output text.
    Handles markdown code blocks, preamble text, trailing commas, and unquoted values.
    """
    if not raw_text:
        return {}

    text = raw_text.strip()

    # 1. Remove markdown code blocks if present
    code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text, re.IGNORECASE)
    if code_block_match:
        text = code_block_match.group(1).strip()

    # 2. Search for the outermost JSON object bounds { ... }
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        text = json_match.group(0)

    # 3. Attempt direct JSON parsing
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    # 4. Attempt cleanup of common LLM syntax flaws (trailing commas, single quotes)
    cleaned = text
    # Replace single quotes with double quotes for keys/strings
    cleaned = re.sub(r"'([^'\\]*(?:\\.[^'\\]*)*)'", r'"\1"', cleaned)
    # Remove trailing commas before closing braces/brackets
    cleaned = re.sub(r',\s*([\}\]])', r'\1', cleaned)

    try:
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    # 5. Fallback regex field-value extractor if JSON parsing fails completely
    fallback_dict = {}
    pattern = r'"?([a-zA-Z0-9_]+)"?\s*:\s*("(?:[^"\\]|\\.)*"|null|\d+|true|false)'
    matches = re.findall(pattern, text)
    for key, val in matches:
        val = val.strip()
        if val == "null" or val == "None":
            fallback_dict[key] = None
        elif val.startswith('"') and val.endswith('"'):
            fallback_dict[key] = val[1:-1]
        elif val.isdigit():
            fallback_dict[key] = int(val)
        else:
            fallback_dict[key] = val

    return fallback_dict
