#!/usr/bin/env python
"""Скачивание полного дампа Open Food Facts и распаковка.

Скачивает openfoodfacts-products.jsonl.gz (~7 ГБ) с докачкой при обрыве,
проверяет sha256 и распаковывает в openfoodfacts-products.jsonl (~43 ГБ).

Все пути — относительно корня проекта (скрипт в scripts/).
"""

from __future__ import annotations

import gzip
import hashlib
import shutil
import sys
import time
from pathlib import Path

import requests
from tqdm import tqdm

ROOT = Path(__file__).resolve().parent.parent
DL_DIR = ROOT / "data" / "downloads"
DL_DIR.mkdir(parents=True, exist_ok=True)

URL_GZ = "https://static.openfoodfacts.org/data/openfoodfacts-products.jsonl.gz"
URL_SHA = "https://static.openfoodfacts.org/data/openfoodfacts-products.jsonl.gz.sha256sum"

GZ_PATH = DL_DIR / "openfoodfacts-products.jsonl.gz"
SHA_PATH = DL_DIR / "openfoodfacts-products.jsonl.gz.sha256sum"
JSONL_PATH = DL_DIR / "openfoodfacts-products.jsonl"

CHUNK = 1024 * 1024  # 1 МБ


def fmt_bytes(n: int) -> str:
    for unit in ("Б", "КБ", "МБ", "ГБ"):
        if n < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} ТБ"


def download() -> None:
    """Скачивание с автоматической докачкой при обрывах соединения.

    Сервер OFF часто рвёт длинные соединения. При обрыве возобновляем с места
    разрыва через Range-заголовок, с растущей паузой между попытками.
    """
    MAX_ATTEMPTS = 50
    headers_base = {"User-Agent": "DietApp/0.1 (download)"}

    for attempt in range(1, MAX_ATTEMPTS + 1):
        # Узнать размер на сервере (каждую попытку — могло поменяться)
        head = requests.head(URL_GZ, timeout=60, allow_redirects=True, headers=headers_base)
        total = int(head.headers.get("Content-Length", 0))
        supports_range = head.headers.get("Accept-Ranges", "").lower() == "bytes"

        if attempt == 1:
            print(f"[off] размер файла на сервере: {fmt_bytes(total)}")
        else:
            have = GZ_PATH.stat().st_size if GZ_PATH.exists() else 0
            print(f"[off] попытка {attempt}: скачано {fmt_bytes(have)} из {fmt_bytes(total)}")

        # Уже скачано целиком?
        have = GZ_PATH.stat().st_size if GZ_PATH.exists() else 0
        if total and have >= total:
            print(f"[off] файл уже скачан целиком ({fmt_bytes(have)})")
            return

        # Настроим Range для докачки
        if have and supports_range:
            headers = {**headers_base, "Range": f"bytes={have}-"}
            mode = "ab"
        else:
            if have:
                print("[off] сервер не поддерживает докачку — начинаю заново")
            headers = headers_base
            mode = "wb"

        try:
            r = requests.get(URL_GZ, headers=headers, stream=True, timeout=90)
            r.raise_for_status()
            content_len = int(r.headers.get("Content-Length", total - have))
            target = have + content_len

            with open(GZ_PATH, mode) as f, tqdm(
                total=target, initial=have, unit="Б",
                unit_scale=True, desc="download", ncols=80, leave=True,
            ) as bar:
                for chunk in r.iter_content(chunk_size=CHUNK):
                    if chunk:
                        f.write(chunk)
                        bar.update(len(chunk))
            # Цикл завершился без исключения — проверим, всё ли скачано
            have = GZ_PATH.stat().st_size
            if total and have >= total:
                print(f"[off] скачивание завершено ({fmt_bytes(have)})")
                return
            # иначе — соединение закрылось досрочно, цикл повторится
        except (requests.exceptions.ChunkedEncodingError,
                requests.exceptions.ConnectionError,
                requests.exceptions.ReadTimeout) as e:
            have = GZ_PATH.stat().st_size if GZ_PATH.exists() else 0
            print(f"[off] обрыв на {fmt_bytes(have)}: {type(e).__name__} — возобновляю")

        # пауза между попытками, растущая
        wait = min(10 * attempt, 60)
        print(f"[off] пауза {wait}с перед следующей попыткой ...")
        import time as _t
        _t.sleep(wait)

    raise RuntimeError(f"Не удалось скачать за {MAX_ATTEMPTS} попыток")


def download_sha() -> str | None:
    """Скачивает sha256sum, возвращает ожидаемый хэш или None."""
    try:
        r = requests.get(URL_SHA, timeout=60,
                         headers={"User-Agent": "DietApp/0.1 (download)"})
        r.raise_for_status()
        SHA_PATH.write_bytes(r.content)
        # Файл вида "<hash>  filename.gz"
        return r.text.strip().split()[0].lower()
    except Exception as e:
        print(f"[off] не удалось скачать sha256sum: {e}")
        return None


def verify_sha256(expected: str | None) -> bool:
    if not expected:
        print("[off] проверка sha256 пропущена (нет эталона)")
        return True
    print(f"[off] считаю sha256 (это займёт пару минут для 7 ГБ) ...")
    t = time.time()
    h = hashlib.sha256()
    with open(GZ_PATH, "rb") as f:
        for chunk in iter(lambda: f.read(8 * CHUNK), b""):
            h.update(chunk)
    actual = h.hexdigest().lower()
    ok = actual == expected
    print(f"[off] sha256 за {time.time()-t:.0f}s: {'OK' if ok else 'НЕ СОВПАЛ'}")
    if not ok:
        print(f"   ожидался:  {expected}")
        print(f"   получен:   {actual}")
    return ok


def extract() -> None:
    """Распаковка .gz → .jsonl."""
    if JSONL_PATH.exists() and JSONL_PATH.stat().st_size > 0:
        print(f"[off] jsonl уже распакован: {fmt_bytes(JSONL_PATH.stat().st_size)}")
        return
    print(f"[off] распаковываю {GZ_PATH.name} (~43 ГБ) ...")
    t = time.time()
    with gzip.open(GZ_PATH, "rb") as src, open(JSONL_PATH, "wb") as dst, tqdm(
        total=GZ_PATH.stat().st_size, unit="Б", unit_scale=True,
        desc="extract", ncols=80,
    ) as bar:
        while True:
            chunk = src.read(8 * CHUNK)
            if not chunk:
                break
            dst.write(chunk)
            # прогресс приблизительный по позиции в gzip-потоке
            bar.update(8 * CHUNK if len(chunk) == 8 * CHUNK else len(chunk))
    print(f"[off] распаковано за {time.time()-t:.0f}s -> {JSONL_PATH.name}")


def main() -> int:
    download()
    expected = download_sha()
    if not verify_sha256(expected):
        print("[off] ХЭШ НЕ СОВПАЛ — файл повреждён. Удалите и запустите заново.",
              file=sys.stderr)
        return 1
    extract()
    print(f"\n[off] ГОТОВО. Файлы в {DL_DIR}:")
    for p in (GZ_PATH, JSONL_PATH):
        if p.exists():
            print(f"   {p.name}: {fmt_bytes(p.stat().st_size)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
