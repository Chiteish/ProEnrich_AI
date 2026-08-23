/**
 * Enrichment Service Types
 */

export interface EnrichmentRequest {
  mpn: string;
  manufacturer: string;
  description: string;
  missing_attributes: string[];
}

export interface StructuredAttributes {
  LENGTH: string | null;
  WIDTH: string | null;
  HEIGHT: string | null;
  WEIGHT: string | null;
  VOLUME: string | null;
  UPC: string | null;
  GTIN: string | null;
  UNSPSC: string | null;
}

export interface WebDiscovery {
  mfr_url: string | null;
  ref_urls: string[];
  product_image: string | null;
  alternate_images: string[];
  specification_sheet: string | null;
  manual: string | null;
}

export interface RetrievedEvidence {
  source: string;
  source_url: string | null;
  product_id: string;
  page: number;
  text: string;
  similarity_distance: number;
  rank: number;
}

export interface AssetItem {
  available: boolean;
  url: string | null;
  external_url: string | null;
  error: string | null;
  source?: 'local' | 'remote' | null;
  filename?: string | null;
}

export interface AssetManifest {
  product_image: AssetItem | null;
  alternate_images: AssetItem[];
  specification_sheet: AssetItem | null;
  manual: AssetItem | null;
}

export interface EnrichmentResponse {
  product: {
    mpn: string;
    manufacturer: string;
    description: string;
    missing_attributes: string[];
  };
  status: 'FOUND' | 'NOT_FOUND' | 'ERROR';
  retrieved_evidence: RetrievedEvidence[];
  structured_attributes: StructuredAttributes;
  web_discovery: WebDiscovery;
  assets: AssetManifest;
}
