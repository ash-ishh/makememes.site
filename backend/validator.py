from typing import Any, Dict, List, Tuple


class ParamError(ValueError):
    pass


def _is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def validate_params(schema: List[Dict[str, Any]], params: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    cleaned = {}
    errors = []

    for field in schema:
        name = field["name"]
        field_type = field["type"]
        required = field.get("required", False)
        default = field.get("default")
        options = field.get("options", [])

        if name not in params:
            if required and default is None:
                errors.append(f"Missing required param: {name}")
                continue
            cleaned[name] = default
            continue

        value = params[name]

        if field_type in {"text", "video_asset_id", "image_asset_id", "audio_asset_id", "color"}:
            if not isinstance(value, str):
                errors.append(f"{name} must be a string")
                continue
        elif field_type == "number":
            if not _is_number(value):
                errors.append(f"{name} must be a number")
                continue
        elif field_type == "enum":
            if value not in options:
                errors.append(f"{name} must be one of {options}")
                continue
        else:
            errors.append(f"Unsupported param type: {field_type}")
            continue

        cleaned[name] = value

    return cleaned, errors
