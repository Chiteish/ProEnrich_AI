import sys
import os
from pathlib import Path
import pandas as pd

ROOT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = ROOT_DIR / "ai-service"

# 1. Load document loader and retriever from root app
sys.path.insert(0, str(ROOT_DIR))
from app.ingestion.document_loader import load_documents, chunk_documents
from app.retrieval.retriever import Retriever

# 2. Reset sys.modules for 'app' to load ai-service app package
sys.modules.pop('app', None)
for k in list(sys.modules.keys()):
    if k.startswith('app.'):
        sys.modules.pop(k, None)

if str(ROOT_DIR) in sys.path:
    sys.path.remove(str(ROOT_DIR))
sys.path.insert(0, str(AI_SERVICE_DIR))

# 3. Load AI Service components
from app.schemas.request import ProductRequest
from app.agents.product_understanding import ProductUnderstanding
from app.agents.attribute_extraction import AttributeExtractor
from app.agents.entity_resolution import EntityResolver
from app.services.taxonomy_service import TaxonomyService
from app.services.output_formatter import OutputFormatter, COLUMN_ORDER


def parse_rag_evidence(retrieved_items: list[dict]) -> dict:
    """Extract key-value pairs from RAG evidence text chunks."""
    rag_fields = {}
    for item in retrieved_items:
        text = item.get("text", "")
        if not text:
            continue
        parts = text.split(" | ")
        for part in parts:
            if ":" in part:
                k, v = part.split(":", 1)
                k, v = k.strip(), v.strip()
                if v and v.lower() not in {"none", "null", "n/a", ""}:
                    if k not in rag_fields:
                        rag_fields[k] = v
    return rag_fields


def generate_catalog_export():
    print("=" * 60)
    print("STARTING 1,000 x 252 CATALOG EXPORT GENERATION")
    print("=" * 60)

    # 1. Load input dataset
    input_path = ROOT_DIR / "reference" / "Unihack_ Sample Dataset excel- Input.xlsx"
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found at: {input_path}")

    input_df = pd.read_excel(input_path)
    total_rows = len(input_df)
    print(f"Loaded {total_rows} input rows from {input_path.name}")

    # 2. Load RAG vector retriever over local documents
    print("Loading RAG Document Retriever...")
    data_docs_folder = ROOT_DIR / "data" / "documents"
    retriever = None
    if data_docs_folder.exists():
        try:
            docs = load_documents(str(data_docs_folder))
            chunks = chunk_documents(docs)
            retriever = Retriever(chunks)
            print(f"RAG Retriever ready with {len(chunks)} chunks from local documents.")
        except Exception as e:
            print(f"Warning: RAG retriever initialization skipped: {e}")

    # 3. Initialize AI agents & services
    print("Initializing AI Enrichment Agents...")
    understanding_agent = ProductUnderstanding()
    attribute_extractor = AttributeExtractor()
    entity_resolver = EntityResolver(
        str(AI_SERVICE_DIR / "data" / "manufacturers.csv"),
        str(AI_SERVICE_DIR / "data" / "brands.csv")
    )
    taxonomy_service = TaxonomyService(
        str(AI_SERVICE_DIR / "data" / "taxonomy.csv")
    )
    formatter = OutputFormatter()

    # 4. Enrich each product row
    export_rows = []
    
    for idx, row in input_df.iterrows():
        mpn = str(row.get("Mfg_Part_Num", "") or "").strip()
        part_desc = str(row.get("Part_Desc", "") or "").strip()
        e1_brand = str(row.get("E1_Brand", "") or "").strip()
        unilog_brand = str(row.get("Unilog_Brand", "") or "").strip()
        dib_brand = str(row.get("DIB_Brand", "") or "").strip()
        part_manuf = str(row.get("Part_Manuf", "") or "").strip()

        # Step 1: Retrieve RAG evidence if available
        rag_fields = {}
        if retriever and mpn:
            retrieved_items = retriever.retrieve(mpn, top_k=5)
            rag_fields = parse_rag_evidence(retrieved_items)

        # Step 2: Product Understanding
        understanding = understanding_agent.analyze(part_desc, part_manuf)

        # Step 3: Attribute Extraction
        attributes = attribute_extractor.extract(understanding, part_desc)

        # Step 4: Entity Resolution (Manufacturer & Brand)
        # Prioritize RAG evidence MANUFACTURER_NAME / BRAND_NAME if retrieved
        if rag_fields.get("MANUFACTURER_NAME"):
            manufacturer = {
                "raw_value": part_manuf,
                "canonical_value": rag_fields["MANUFACTURER_NAME"],
                "confidence": 1.0,
                "method": "rag_evidence"
            }
        else:
            manufacturer = entity_resolver.resolve(part_manuf, "manufacturer")

        raw_brand = e1_brand if e1_brand and e1_brand.lower() not in {"-- unbranded --", ""} else (
            unilog_brand if unilog_brand and unilog_brand.lower() not in {"-- no unilog brand --", ""} else dib_brand
        )
        if rag_fields.get("BRAND_NAME"):
            brand = {
                "raw_value": raw_brand or part_desc,
                "canonical_value": rag_fields["BRAND_NAME"].replace("", ""),
                "confidence": 1.0,
                "method": "rag_evidence"
            }
        else:
            brand = entity_resolver.resolve(raw_brand, "brand")
            # Brand fallback from part_desc
            if not brand.get("canonical_value") and understanding.get("brand"):
                extracted_brand_res = entity_resolver.resolve(understanding["brand"], "brand")
                if extracted_brand_res.get("canonical_value"):
                    brand = extracted_brand_res
                else:
                    brand = {
                        "raw_value": understanding["brand"],
                        "canonical_value": understanding["brand"],
                        "confidence": 0.85,
                        "method": "description_extraction"
                    }

        # Step 5: Taxonomy Classification
        # Prioritize RAG evidence classification if available
        if rag_fields.get("Dept") and rag_fields.get("Class") and rag_fields.get("Fine"):
            classification = {
                "department": rag_fields.get("Dept"),
                "class_name": rag_fields.get("Class"),
                "fine": rag_fields.get("Fine"),
                "classpath": rag_fields.get("Classpath"),
                "confidence": 1.0,
                "method": "rag_evidence"
            }
        else:
            classification = taxonomy_service.find_match(
                product_type=understanding.get("product_type", "") or "",
                description=part_desc
            )
            if not classification:
                classification = {
                    "department": None,
                    "class_name": None,
                    "fine": None,
                    "classpath": None,
                    "confidence": 0,
                    "method": "no_taxonomy"
                }

        # Construct enriched product dict
        product = {
            "product_id": mpn,
            "identity": {
                "mpn": mpn,
                "manufacturer": manufacturer,
                "brand": brand
            },
            "understanding": understanding,
            "classification": classification,
            "attributes": attributes,
            "web_discovery": {}
        }

        # Format into 252 company columns with RAG priority override
        formatted_row = formatter.format_product(product, raw_input=row.to_dict(), rag_fields=rag_fields)
        export_rows.append(formatted_row)

    # 5. Create DataFrame and export to CSV
    export_df = pd.DataFrame(export_rows, columns=COLUMN_ORDER)
    output_path = ROOT_DIR / "output_1000x252.csv"
    export_df.to_csv(output_path, index=False, encoding="utf-8")

    print("\n" + "=" * 60)
    print(f"EXPORT COMPLETE: {output_path}")
    print(f"Output shape: {export_df.shape} (Expected: ({total_rows}, 252))")
    print("=" * 60)

    # 6. Verification statistics & reference comparison
    print("\nFIELD FILL STATISTICS:")
    filled_counts = (export_df != "").sum(axis=0)
    non_empty_cols = (filled_counts > 0).sum()
    print(f"- Columns with populated values: {non_empty_cols} / 252")
    print(f"- MANUFACTURER_NAME filled: {(export_df['MANUFACTURER_NAME'] != '').sum()} / {total_rows}")
    print(f"- BRAND_NAME filled: {(export_df['BRAND_NAME'] != '').sum()} / {total_rows}")
    print(f"- Dept filled: {(export_df['Dept'] != '').sum()} / {total_rows}")
    print(f"- Class filled: {(export_df['Class'] != '').sum()} / {total_rows}")
    print(f"- Fine filled: {(export_df['Fine'] != '').sum()} / {total_rows}")
    print(f"- Classpath filled: {(export_df['Classpath'] != '').sum()} / {total_rows}")
    print(f"- Attribute 1 populated: {(export_df['ATTRIBUTE_LABEL 1'] != '').sum()} / {total_rows}")

    # Compare reference examples (PDSH4816AF & WDTS7024RZ)
    print("\nREFERENCE COMPARISON CHECK:")
    for ref_mpn in ["PDSH4816AF", "WDTS7024RZ"]:
        matching_rows = export_df[export_df["Mfg_Part_Num"] == ref_mpn]
        if not matching_rows.empty:
            r = matching_rows.iloc[0]
            non_blank = (r != "").sum()
            print(f"  [{ref_mpn}] Populated fields: {non_blank} / 252")
            print(f"    - BRAND_NAME: {r['BRAND_NAME']}")
            print(f"    - MANUFACTURER_NAME: {r['MANUFACTURER_NAME']}")
            print(f"    - Dept: {r['Dept']}")
            print(f"    - Class: {r['Class']}")
            print(f"    - Fine: {r['Fine']}")
            print(f"    - MFR URL: {r['MFR URL'][:60] if r['MFR URL'] else ''}")
            print(f"    - Specification Sheet: {r['Specification Sheet']}")

    assert export_df.shape == (total_rows, 252), f"Expected shape ({total_rows}, 252), got {export_df.shape}"
    assert list(export_df.columns) == COLUMN_ORDER, "Column names/order do not match reference schema!"
    print("\n[SUCCESS] All assertions passed successfully!")

if __name__ == "__main__":
    generate_catalog_export()
