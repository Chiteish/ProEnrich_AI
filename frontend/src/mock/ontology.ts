/**
 * Mock Ontology Data
 */
import type { OntologyNode, OntologyEdge } from '../types';

export const mockOntologyNodes: OntologyNode[] = [
  {
    id: 'node-1',
    name: 'Product',
    type: 'root',
    canonicalId: 'PROD-ROOT',
    mappedValues: ['Item', 'Product', 'SKU'],
  },
  {
    id: 'node-2',
    name: 'Category',
    type: 'dimension',
    canonicalId: 'CAT-001',
    mappedValues: ['Type', 'Category', 'Class'],
    parentId: 'node-1',
  },
  {
    id: 'node-3',
    name: 'Sanding Belt',
    type: 'concept',
    canonicalId: 'CAT-002-001',
    mappedValues: ['Sanding Belt', 'Abrasive Belt', 'Sandpaper Belt'],
    parentId: 'node-2',
  },
  {
    id: 'node-4',
    name: 'Material',
    type: 'attribute',
    canonicalId: 'MAT-DIM',
    mappedValues: ['Material', 'Composition', 'Substance'],
    parentId: 'node-1',
  },
  {
    id: 'node-5',
    name: 'Aluminum Oxide',
    type: 'concept',
    canonicalId: 'MAT-001',
    mappedValues: ['Aluminum Oxide', 'Alumina', 'Al2O3', 'Corundum'],
    parentId: 'node-4',
  },
  {
    id: 'node-6',
    name: 'Brand',
    type: 'dimension',
    canonicalId: 'BRD-DIM',
    mappedValues: ['Brand', 'Manufacturer', 'Make'],
    parentId: 'node-1',
  },
  {
    id: 'node-7',
    name: 'Diablo',
    type: 'concept',
    canonicalId: 'BRD-001',
    mappedValues: ['Diablo', 'Freud Diablo'],
    parentId: 'node-6',
  },
  {
    id: 'node-8',
    name: 'Specifications',
    type: 'dimension',
    canonicalId: 'SPEC-DIM',
    mappedValues: ['Specs', 'Specifications', 'Features'],
    parentId: 'node-1',
  },
  {
    id: 'node-9',
    name: 'Dimensions',
    type: 'attribute',
    canonicalId: 'DIM-001',
    mappedValues: ['Dimensions', 'Size', 'Length', 'Width'],
    parentId: 'node-8',
  },
  {
    id: 'node-10',
    name: 'Grit',
    type: 'attribute',
    canonicalId: 'GRIT-001',
    mappedValues: ['Grit', 'Abrasiveness', 'Grain Size'],
    parentId: 'node-8',
  },
];

export const mockOntologyEdges: OntologyEdge[] = [
  {
    source: 'node-1',
    target: 'node-2',
    relationship: 'belongsTo',
  },
  {
    source: 'node-2',
    target: 'node-3',
    relationship: 'hasType',
  },
  {
    source: 'node-1',
    target: 'node-4',
    relationship: 'hasMaterial',
  },
  {
    source: 'node-4',
    target: 'node-5',
    relationship: 'hasValue',
  },
  {
    source: 'node-1',
    target: 'node-6',
    relationship: 'hasBrand',
  },
  {
    source: 'node-6',
    target: 'node-7',
    relationship: 'hasValue',
  },
  {
    source: 'node-1',
    target: 'node-8',
    relationship: 'hasSpecifications',
  },
  {
    source: 'node-8',
    target: 'node-9',
    relationship: 'includes',
  },
  {
    source: 'node-8',
    target: 'node-10',
    relationship: 'includes',
  },
];
