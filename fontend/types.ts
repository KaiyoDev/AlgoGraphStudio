export interface NodeData {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  weight: number;
  label?: string; // For things like "5/10" in Flow networks
  isDirected: boolean;
}

export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
  isDirected: boolean; // Global setting for the graph
}

// Visualization State for a specific step
export interface StepState {
  highlightNodes: { [nodeId: string]: string }; // nodeId -> color
  highlightEdges: { [edgeId: string]: string }; // edgeId -> color
  nodeLabels?: { [nodeId: string]: string }; // Temporary labels (e.g., distance in Dijkstra)
  edgeLabels?: { [edgeId: string]: string }; // Temporary labels (e.g., flow in Ford-Fulkerson)
  description: string;
}

export interface AlgorithmResponse {
  name: string;
  steps: StepState[];
}

export type ToolMode = 'pointer' | 'node' | 'edge' | 'delete';

export enum AlgorithmType {
  PRIM = 'prim',
  KRUSKAL = 'kruskal',
  DIJKSTRA = 'dijkstra',
  FORD_FULKERSON = 'ford_fulkerson',
  FLEURY = 'fleury',
  HIERHOLZER = 'hierholzer'
}