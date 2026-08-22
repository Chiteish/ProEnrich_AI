from pathlib import Path


class DocumentLoader:

    def __init__(
        self,
        document_dir: Path,
        chunk_size: int = 800
    ):

        self.document_dir = document_dir
        self.chunk_size = chunk_size

    def load_documents(self):

        documents = []

        if not self.document_dir.exists():
            return documents

        for file_path in self.document_dir.glob(
            "*.txt"
        ):

            text = file_path.read_text(
                encoding="utf-8"
            )

            chunks = self._chunk_text(
                text
            )

            for i, chunk in enumerate(
                chunks
            ):

                documents.append({
                    "id":
                        f"{file_path.stem}_{i}",

                    "text":
                        chunk,

                    "source":
                        str(file_path),

                    "chunk_index":
                        i
                })

        return documents

    def _chunk_text(
        self,
        text: str
    ):

        words = text.split()

        chunks = []

        for i in range(
            0,
            len(words),
            self.chunk_size
        ):

            chunk = " ".join(
                words[
                    i:i + self.chunk_size
                ]
            )

            if chunk.strip():
                chunks.append(chunk)

        return chunks