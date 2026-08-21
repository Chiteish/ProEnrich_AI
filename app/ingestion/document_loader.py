import csv
import os

from app.ingestion.pdf_processor import extract_pdf_text


def _csv_row_to_text(row):
    parts = []

    for key, value in row.items():
        if value is None:
            continue

        clean_value = str(value).strip()

        if clean_value:
            parts.append(f"{key}: {clean_value}")

    return " | ".join(parts)


def load_documents(folder_path: str):

    documents = []

    if not os.path.isdir(folder_path):
        return documents

    for filename in os.listdir(folder_path):

        file_path = os.path.join(folder_path, filename)

        if filename.lower().endswith(".pdf"):

            pages = extract_pdf_text(file_path)

            for page in pages:

                documents.append({
                    "source": filename,
                    "page": page["page"],
                    "text": page["text"]
                })

        elif filename.lower().endswith(".csv"):

            try:
                with open(file_path, newline="", encoding="utf-8-sig") as csv_file:
                    reader = csv.DictReader(csv_file)

                    for row_number, row in enumerate(reader, start=1):
                        text = _csv_row_to_text(row)

                        if text:
                            documents.append({
                                "source": filename,
                                "page": row_number,
                                "text": text
                            })
            except Exception:
                continue

    return documents
def chunk_documents(documents, chunk_size=500, overlap=100):

    chunks = []

    for document in documents:

        text = document["text"]

        start = 0

        while start < len(text):

            end = start + chunk_size

            chunk_text = text[start:end]

            chunks.append({
                "text": chunk_text,
                "source": document["source"],
                "page": document["page"]
            })

            start += chunk_size - overlap

    return chunks