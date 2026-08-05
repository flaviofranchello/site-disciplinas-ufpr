#!/usr/bin/env python3
"""Copia PDFs das pastas de origem e atualiza os catálogos do site."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import unicodedata
from datetime import date
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parent.parent
COURSES = {
    "fisica-3": {
        "nome": "Física III",
        "origem": Path("/home/flavio/Área de trabalho/UFPR Segundo Semestre 2026/Física III/PDF_aulas"),
    },
    "fisica-experimental-1": {
        "nome": "Física Experimental I",
        "origem": Path("/home/flavio/Área de trabalho/UFPR Segundo Semestre 2026/Física Experimental I/PDF"),
    },
}


def slugify(filename: str) -> str:
    stem = unicodedata.normalize("NFKD", Path(filename).stem)
    stem = stem.encode("ascii", "ignore").decode("ascii").lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    return f"{stem or 'material'}.pdf"


def human_size(size: int) -> str:
    if size < 1024:
        return f"{size} B"
    if size < 1024**2:
        return f"{size / 1024:.0f} KB"
    return f"{size / 1024**2:.1f} MB".replace(".", ",")


def display_title(path: Path) -> str:
    title = re.sub(r"[_-]+", " ", path.stem)
    return re.sub(r"\s+", " ", title).strip()


def category_for(relative_path: Path) -> tuple[str, str]:
    normalized = unicodedata.normalize("NFKD", str(relative_path)).encode("ascii", "ignore").decode("ascii").lower()
    if "complement" in normalized:
        return "complementares", "Material complementar"
    return "aulas", "Aula"


def unique_destination(output_dir: Path, filename: str, used: set[str]) -> Path:
    stem = Path(filename).stem
    candidate = filename
    counter = 2
    while candidate in used:
        candidate = f"{stem}-{counter}.pdf"
        counter += 1
    used.add(candidate)
    return output_dir / candidate


def sync_course(slug: str, course: dict[str, object], dry_run: bool = False) -> int:
    source = Path(course["origem"])
    output_dir = SITE_ROOT / slug / "materiais" / "arquivos"
    manifest_path = SITE_ROOT / slug / "materiais.json"

    if not source.exists():
        print(f"[aviso] Pasta não encontrada: {source}")
        return 0

    pdfs = sorted(source.rglob("*.pdf"), key=lambda item: item.name.casefold())
    output_dir.mkdir(parents=True, exist_ok=True)
    materials: list[dict[str, str]] = []
    used: set[str] = set()

    for pdf in pdfs:
        destination = unique_destination(output_dir, slugify(pdf.name), used)
        category, category_label = category_for(pdf.relative_to(source))
        if not dry_run:
            shutil.copy2(pdf, destination)
        materials.append(
            {
                "titulo": display_title(pdf),
                "categoria": category,
                "categoria_label": category_label,
                "formato": "PDF",
                "tamanho": human_size(pdf.stat().st_size),
                "arquivo": f"materiais/arquivos/{destination.name}",
            }
        )

    manifest = {
        "disciplina": course["nome"],
        "atualizado_em": date.today().isoformat(),
        "materiais": materials,
    }
    if not dry_run:
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[ok] {course['nome']}: {len(materials)} PDF(s)")
    return len(materials)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="lista o que seria sincronizado sem escrever arquivos")
    args = parser.parse_args()
    total = sum(sync_course(slug, course, args.dry_run) for slug, course in COURSES.items())
    print(f"[concluído] {total} material(is) no catálogo")


if __name__ == "__main__":
    main()
