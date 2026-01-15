# AI Workflows

## OCR Pipeline
Image → Grayscale → OCR → Raw Text

## Parsing Pipeline
Raw Text → Prompt Template → GPT-4 → JSON → Validation

## Validation Steps
- JSON parse
- Schema validation
- Price sanity check

## Human-in-the-loop
- Always before publish