#!/usr/bin/env python3
"""Submit all URLs in a sitemap to the IndexNow API."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse


DEFAULT_ENDPOINT = "https://api.indexnow.org/indexnow"


def read_urls(sitemap_path: Path) -> list[str]:
    root = ET.parse(sitemap_path).getroot()
    urls = [
        element.text.strip()
        for element in root.findall(".//{*}loc")
        if element.text and element.text.strip()
    ]
    if not urls:
        raise ValueError(f"No <loc> URLs found in {sitemap_path}")
    return list(dict.fromkeys(urls))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sitemap", type=Path, default=Path("sitemap.xml"))
    parser.add_argument("--key-file", type=Path, required=True)
    parser.add_argument("--endpoint", default=DEFAULT_ENDPOINT)
    args = parser.parse_args()

    key = args.key_file.read_text(encoding="utf-8").strip()
    if len(key) != 32 or any(char not in "0123456789abcdefABCDEF" for char in key):
        raise ValueError("IndexNow key must be exactly 32 hexadecimal characters")

    urls = read_urls(args.sitemap)
    parsed_urls = [urlparse(url) for url in urls]
    host = parsed_urls[0].hostname
    if not host or any(item.scheme not in {"http", "https"} for item in parsed_urls):
        raise ValueError("Sitemap contains an invalid URL")
    if any(item.hostname != host for item in parsed_urls):
        raise ValueError("All sitemap URLs must use the same host")

    payload = {
        "host": host,
        "key": key,
        "keyLocation": f"https://{host}/{key}.txt",
        "urlList": urls,
    }
    request = urllib.request.Request(
        args.endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            status = response.status
            body = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        status = error.code
        body = error.read().decode("utf-8", errors="replace")

    print(f"IndexNow response: HTTP {status}; submitted {len(urls)} URLs")
    if body:
        print(body)
    return 0 if status in {200, 202} else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, ET.ParseError) as error:
        print(f"IndexNow submission failed: {error}", file=sys.stderr)
        sys.exit(1)
