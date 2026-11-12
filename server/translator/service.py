"""Trialum local-only English translation engine. NOT a public endpoint.

Explicitly bootstrapped Hugging Face OPUS-MT pairs, pinned to local on-disk
safetensors. No runtime model downloads or third-party API requests.
This service intentionally supports mk/en and sq/en ONLY in its first phase.
"""
import json
import os
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock

BASE = Path(os.environ.get("TRIALUM_TRANSLATOR_MODELS", "/models"))
MODELS = {
    ("mk", "en"): "opus-mt-mk-en",
    ("en", "mk"): "opus-mt-en-mk",
    ("sq", "en"): "opus-mt-sq-en",
    ("en", "sq"): "opus-mt-en-sq",
}
URL_EMAIL = re.compile(r"(https?://|www\.|\S+@\S+)", re.I)
PAIR = set(MODELS)
gate = Lock()
runtimes = {}


def normalize(text):
    if not isinstance(text, str):
        raise ValueError("invalid_text")
    phrase = text.strip()
    if not phrase or len(phrase) > 160 or any(ord(x) < 32 or ord(x) == 127 for x in phrase):
        raise ValueError("invalid_text")
    if URL_EMAIL.search(phrase):
        raise ValueError("invalid_text")
    return phrase


def prepare_models():
    """Run only after an operator explicitly installs all four local models."""
    import torch
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

    torch.set_num_threads(2)
    for pair, folder in MODELS.items():
        path = BASE / folder
        if not (path / "config.json").is_file():
            raise RuntimeError("missing reviewed offline translator model: " + folder)
        tokenizer = AutoTokenizer.from_pretrained(str(path), local_files_only=True)
        model = AutoModelForSeq2SeqLM.from_pretrained(
            str(path), local_files_only=True, use_safetensors=True).eval()
        runtimes[pair] = (tokenizer, model)


def translate(text, source, target):
    from torch import inference_mode

    phrase = normalize(text)
    if not isinstance(source, str) or not isinstance(target, str) or (source, target) not in PAIR:
        raise ValueError("unsupported_language_pair")
    tokenizer, model = runtimes[(source, target)]
    with gate, inference_mode():
        tokens = tokenizer([phrase], return_tensors="pt", truncation=True,
                           max_length=128)
        generated = model.generate(**tokens, max_new_tokens=72, num_beams=3,
                                   do_sample=False)
        result = tokenizer.batch_decode(generated, skip_special_tokens=True)[0]
    return normalize(result)


class Handler(BaseHTTPRequestHandler):
    server_version = "TrialumTranslator/1"
    sys_version = ""

    def log_message(self, *args):
        pass  # Never log user/pet text, source IP or request paths.

    def reply(self, status, content):
        body = json.dumps(content, ensure_ascii=False).encode("utf8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/healthz":
            self.reply(200 if len(runtimes) == len(MODELS) else 503,
                       {"ready": len(runtimes) == len(MODELS),
                        "languages": ["en", "mk", "sq"]})
        else:
            self.reply(404, {"error": "not_found"})

    def do_POST(self):
        if self.path != "/translate":
            self.reply(404, {"error": "not_found"})
            return
        length = self.headers.get("Content-Length", "")
        if not length.isdigit() or int(length) > 1024:
            self.reply(413, {"error": "payload_too_large"})
            return
        try:
            data = json.loads(self.rfile.read(int(length)))
            if not isinstance(data, dict) or set(data) != {"q", "source", "target", "format"}:
                raise ValueError("invalid_request")
            if data["format"] != "text":
                raise ValueError("invalid_request")
            result = translate(data["q"], data["source"], data["target"])
            self.reply(200, {"translatedText": result})
        except (ValueError, KeyError, TypeError):
            self.reply(422, {"error": "invalid_translation"})
        except Exception:
            self.reply(503, {"error": "translator_unavailable"})


if __name__ == "__main__":
    prepare_models()  # Refuse startup if models are missing; never pretend ready.
    ThreadingHTTPServer(("0.0.0.0", 5000), Handler).serve_forever()
