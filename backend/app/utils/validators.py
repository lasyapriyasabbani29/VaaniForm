import re
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

def validate_mobile_number(val: Any) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Validates Indian 10-digit mobile number format.
    Accepts numbers with/without +91, spaces, or hyphens.
    Returns: (is_valid, error_message, normalized_10_digit_string)
    """
    if val is None or str(val).strip() == "":
        return False, "Mobile number is required", None

    clean_str = re.sub(r'[\s\-\(\)]', '', str(val))
    
    # Strip leading +91 or 91 if present and total length is 12
    if clean_str.startswith('+91') and len(clean_str) == 13:
        clean_str = clean_str[3:]
    elif clean_str.startswith('91') and len(clean_str) == 12:
        clean_str = clean_str[2:]
    elif clean_str.startswith('0') and len(clean_str) == 11:
        clean_str = clean_str[1:]

    # Check 10-digit starting with 6, 7, 8, 9
    if re.match(r'^[6-9]\d{9}$', clean_str):
        return True, None, clean_str
    
    return False, "Mobile number must be a valid 10-digit Indian number (e.g., 9876543210)", clean_str

def normalize_date(val: Any) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Normalizes spoken or text dates (e.g., '12 March 2004', '12/03/2004', '2004-03-12')
    into YYYY-MM-DD format.
    Returns: (is_valid, error_message, normalized_YYYY_MM_DD)
    """
    if val is None or str(val).strip() == "":
        return False, "Date of birth is required", None

    date_str = str(val).strip()

    # Formats to attempt parsing
    formats = [
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d %B %Y",  # 12 March 2004
        "%d %b %Y",  # 12 Mar 2004
        "%B %d, %Y", # March 12, 2004
        "%Y/%m/%d"
    ]

    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return True, None, dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    # Attempt regex extraction if words are present like "15th August 2005"
    cleaned = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str, flags=re.IGNORECASE)
    for fmt in ["%d %B %Y", "%d %b %Y"]:
        try:
            dt = datetime.strptime(cleaned, fmt)
            return True, None, dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    return False, "Invalid date format. Expected YYYY-MM-DD or DD/MM/YYYY (e.g., 2004-03-12)", date_str

def validate_annual_income(val: Any) -> Tuple[bool, Optional[str], Optional[float]]:
    """
    Validates annual income numeric input.
    """
    if val is None or str(val).strip() == "":
        return True, None, None  # Optional field

    try:
        # Strip currency symbols and commas
        clean_val = re.sub(r'[^\d.]', '', str(val))
        num = float(clean_val)
        if num < 0:
            return False, "Annual income cannot be negative", None
        return True, None, num
    except (ValueError, TypeError):
        return False, "Annual income must be a valid number", None
