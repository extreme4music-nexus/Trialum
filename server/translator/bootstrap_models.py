"""EXPLICIT manual offline-model preparation script.

Run in a disposable download environment with an approved Hugging Face source.
Models are saved as local safetensors, not fetched by the live translation API.
Requires transformers<5, torch, sentencepiece and huggingface-hub.
"""
import json
from pathlib import Path
from huggingface_hub import HfApi
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

ROOT = Path("/models")
PAIRS = {
    "opus-mt-mk-en": "Helsinki-NLP/opus-mt-mk-en",
    "opus-mt-en-mk": "Helsinki-NLP/opus-mt-en-mk",
    "opus-mt-sq-en": "Helsinki-NLP/opus-mt-sq-en",
    "opus-mt-en-sq": "Helsinki-NLP/opus-mt-en-sq",
}
api = HfApi()
ROOT.mkdir(parents=True, exist_ok=True)
manifest = []
for folder, repo in PAIRS.items():
    sha = api.model_info(repo_id=repo).sha  # Lock actual fetched revision.
    if not sha or len(sha) != 40:
        raise RuntimeError("Unverified upstream model revision")
    dest = ROOT / folder
    dest.mkdir(parents=True, exist_ok=True)
    tokenizer = AutoTokenizer.from_pretrained(repo, revision=sha)
    model = AutoModelForSeq2SeqLM.from_pretrained(repo, revision=sha)
    tokenizer.save_pretrained(dest)
    model.save_pretrained(dest, safe_serialization=True)
    manifest.append({"repo": repo, "source_revision": sha, "folder": folder})
    del model, tokenizer
(ROOT / "TRIALUM_TRANSLATOR_MODEL_MANIFEST.json").write_text(
    json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
)
print("Four local models prepared. Inspect licenses/revisions and test privately before enabling.")
