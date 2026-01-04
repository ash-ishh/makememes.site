import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List

TEMPLATES_DIR = Path(__file__).parent / "templates"
REGISTRY_PATH = TEMPLATES_DIR / "registry.json"


@dataclass
class TemplateDef:
    template_id: str
    name: str
    description: str
    tags: List[str]
    difficulty: str
    params_schema: List[Dict[str, Any]]
    demo_inputs: Dict[str, Any]
    code_path: Path
    preview_stream_url: str = None
    source_assets: List[Dict[str, Any]] = None

    def to_list_item(self) -> Dict[str, Any]:
        result = {
            "template_id": self.template_id,
            "name": self.name,
            "description": self.description,
            "tags": self.tags,
            "difficulty": self.difficulty,
        }
        if self.preview_stream_url:
            result["preview_stream_url"] = self.preview_stream_url
        return result

    def to_detail(self) -> Dict[str, Any]:
        result = {
            **self.to_list_item(),
            "params_schema": self.params_schema,
            "demo_inputs": self.demo_inputs,
            "code": self.read_code(),
        }
        if self.source_assets:
            result["source_assets"] = self.source_assets
        return result

    def read_code(self) -> str:
        return self.code_path.read_text(encoding="utf-8")


def load_registry() -> Dict[str, TemplateDef]:
    data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    templates = {}
    for item in data["templates"]:
        code_path = TEMPLATES_DIR / item["code_path"]
        templates[item["template_id"]] = TemplateDef(
            template_id=item["template_id"],
            name=item["name"],
            description=item["description"],
            tags=item.get("tags", []),
            difficulty=item.get("difficulty", "basic"),
            params_schema=item["params_schema"],
            demo_inputs=item.get("demo_inputs", {}),
            code_path=code_path,
            preview_stream_url=item.get("preview_stream_url"),
            source_assets=item.get("source_assets", []),
        )
    return templates
