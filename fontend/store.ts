import { create } from 'zustand';
import { NodeData, EdgeData, ToolMode, StepState, GraphData } from './types';

interface GraphHistory {
  nodes: NodeData[];
  edges: EdgeData[];
  isDirected: boolean;
}

interface GraphStore {
  // Graph State
  nodes: NodeData[];
  edges: EdgeData[];
  isDirected: boolean;
  
  // History State
  past: GraphHistory[];
  future: GraphHistory[];
  
  // UI State
  mode: ToolMode; 
  showHelp: boolean;
  
  // Changed to Arrays for Multiple Selection
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  
  // Interaction State for Drag-to-Connect
  drawingEdge: { sourceId: string; x: number; y: number } | null;

  scale: number;
  position: { x: number; y: number };
  
  // Reference to Konva Stage for PNG Export
  stageRef: any;
  
  // Player State
  steps: StepState[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; 
  
  // Actions
  setMode: (mode: ToolMode) => void;
  toggleHelp: () => void;
  setDirected: (isDirected: boolean) => void;
  addNode: (x: number, y: number) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  updateNodeLabel: (id: string, label: string) => void;
  moveNodes: (deltas: {id: string, dx: number, dy: number}[]) => void; 
  addEdge: (source: string, target: string, weight?: number) => void;
  updateEdgeWeight: (id: string, weight: number) => void;
  updateEdgeControlPoint: (id: string, x: number | undefined, y: number | undefined) => void;
  deleteElement: (type: 'node' | 'edge', id: string) => void;
  deleteSelected: () => void;
  clearGraph: () => void; 
  
  // History Actions
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  
  setDrawingEdge: (data: { sourceId: string; x: number; y: number } | null) => void;
  
  // Selection Actions
  selectNode: (id: string | null, multi?: boolean) => void; 
  selectEdge: (id: string | null, multi?: boolean) => void; 
  selectRegion: (x: number, y: number, width: number, height: number) => void; 
  setSelectedNodes: (ids: string[]) => void; 
  setSelectedEdges: (ids: string[]) => void; 
  clearSelection: () => void; 

  setViewport: (scale: number, pos: {x: number, y: number}) => void;
  setStageRef: (ref: any) => void;
  
  // Player Actions
  loadSteps: (steps: StepState[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  resetPlayer: () => void;
  
  // Bulk
  setGraph: (data: GraphData) => void;
  getExportData: () => GraphData; 
}

const getSnapshot = (state: GraphStore): GraphHistory => ({
    nodes: state.nodes,
    edges: state.edges,
    isDirected: state.isDirected
});

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  isDirected: false,
  
  past: [],
  future: [],
  
  mode: 'pointer',
  showHelp: false,
  
  selectedNodeIds: [], 
  selectedEdgeIds: [], 
  
  drawingEdge: null,
  scale: 1,
  position: { x: 0, y: 0 },
  
  stageRef: null,
  
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  playbackSpeed: 800,
  
  setMode: (mode) => set({ 
    mode, 
    drawingEdge: null,
    selectedNodeIds: [],
    selectedEdgeIds: []
  }),

  toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),
  
  saveHistory: () => set((state) => ({
      past: [...state.past, getSnapshot(state)],
      future: []
  })),

  undo: () => set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
          nodes: previous.nodes,
          edges: previous.edges,
          isDirected: previous.isDirected,
          past: newPast,
          future: [getSnapshot(state), ...state.future],
          selectedNodeIds: [],
          selectedEdgeIds: []
      };
  }),

  redo: () => set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
          nodes: next.nodes,
          edges: next.edges,
          isDirected: next.isDirected,
          past: [...state.past, getSnapshot(state)],
          future: newFuture,
          selectedNodeIds: [],
          selectedEdgeIds: []
      };
  }),
  
  setDirected: (isDirected) => set((state) => {
      // Nếu đã có edges, không cho phép thay đổi loại đồ thị
      if (state.edges.length > 0 && isDirected !== state.isDirected) {
          // Không thay đổi gì, giữ nguyên state
          return state;
      }
      
      // Cho phép thay đổi nếu không có edges
      return { 
          past: [...state.past, getSnapshot(state)],
          future: [],
          isDirected 
      };
  }),
  
  addNode: (x, y) => set((state) => {
    const adjustedX = (x - state.position.x) / state.scale;
    const adjustedY = (y - state.position.y) / state.scale;
    
    const newId = String(state.nodes.length + 1);
    const newNode: NodeData = { 
        id: newId, 
        x: adjustedX, 
        y: adjustedY, 
        label: newId 
    };
    return { 
        past: [...state.past, getSnapshot(state)],
        future: [],
        nodes: [...state.nodes, newNode] 
    };
  }),
  
  updateNodePosition: (id, x, y) => set((state) => {
    const node = state.nodes.find(n => n.id === id);
    if (!node) return {};
    
    const dx = x - node.x;
    const dy = y - node.y;

    const newEdges = state.edges.map(edge => {
        if (!edge.controlPoint) return edge;
        if (edge.source === id || edge.target === id) {
             return {
                 ...edge,
                 controlPoint: {
                     x: edge.controlPoint.x + dx * 0.5,
                     y: edge.controlPoint.y + dy * 0.5
                 }
             };
        }
        return edge;
    });

    return {
        nodes: state.nodes.map(n => n.id === id ? { ...n, x, y } : n),
        edges: newEdges
    };
  }),

  moveNodes: (deltas) => set((state) => {
      const nodeMap = new Map<string, NodeData>(state.nodes.map(n => [n.id, n]));
      const movingNodeIds = new Set(deltas.map(d => d.id));

      deltas.forEach(({ id, dx, dy }) => {
          const node = nodeMap.get(id);
          if (node) {
              nodeMap.set(id, { ...node, x: node.x + dx, y: node.y + dy });
          }
      });

      const newEdges = state.edges.map(edge => {
          if (!edge.controlPoint) return edge;
          
          const sourceMoves = movingNodeIds.has(edge.source);
          const targetMoves = movingNodeIds.has(edge.target);
          
          if (!sourceMoves && !targetMoves) return edge;

          const dSource = deltas.find(d => d.id === edge.source) || { dx: 0, dy: 0 };
          const dTarget = deltas.find(d => d.id === edge.target) || { dx: 0, dy: 0 };

          let moveX = 0;
          let moveY = 0;

          if (sourceMoves && targetMoves) {
               moveX = (dSource.dx + dTarget.dx) / 2;
               moveY = (dSource.dy + dTarget.dy) / 2;
          } else if (sourceMoves) {
               moveX = dSource.dx * 0.5;
               moveY = dSource.dy * 0.5;
          } else if (targetMoves) {
               moveX = dTarget.dx * 0.5;
               moveY = dTarget.dy * 0.5;
          }

          return {
              ...edge,
              controlPoint: {
                  x: edge.controlPoint.x + moveX,
                  y: edge.controlPoint.y + moveY
              }
          };
      });

      return { 
          nodes: Array.from(nodeMap.values()),
          edges: newEdges
      };
  }),

  updateNodeLabel: (id, label) => set((state) => ({
    past: [...state.past, getSnapshot(state)],
    future: [],
    nodes: state.nodes.map(n => n.id === id ? { ...n, label } : n)
  })),
  
  addEdge: (source, target, weight = 1) => set((state) => {
    const newEdge: EdgeData = {
      id: `e${source}-${target}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      source,
      target,
      weight,
      isDirected: state.isDirected
    };
    return { 
        past: [...state.past, getSnapshot(state)],
        future: [],
        edges: [...state.edges, newEdge] 
    };
  }),
  
  updateEdgeWeight: (id, weight) => set((state) => ({
    past: [...state.past, getSnapshot(state)],
    future: [],
    edges: state.edges.map(e => e.id === id ? { ...e, weight } : e)
  })),

  updateEdgeControlPoint: (id, x, y) => set((state) => ({
    edges: state.edges.map(e => e.id === id ? { ...e, controlPoint: (x !== undefined && y !== undefined) ? {x, y} : undefined } : e)
  })),
  
  deleteElement: (type, id) => set((state) => {
    const newState = {
        past: [...state.past, getSnapshot(state)],
        future: []
    };
    if (type === 'node') {
      return {
        ...newState,
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id),
        selectedNodeIds: state.selectedNodeIds.filter(nid => nid !== id)
      };
    } else {
      return {
        ...newState,
        edges: state.edges.filter(e => e.id !== id),
        selectedEdgeIds: state.selectedEdgeIds.filter(eid => eid !== id)
      };
    }
  }),

  deleteSelected: () => set((state) => {
    if (state.selectedNodeIds.length === 0 && state.selectedEdgeIds.length === 0) return state;

    let newState: any = { 
        past: [...state.past, getSnapshot(state)],
        future: [],
        ...state 
    };

    if (state.selectedEdgeIds.length > 0) {
        newState.edges = state.edges.filter(e => !state.selectedEdgeIds.includes(e.id));
        newState.selectedEdgeIds = [];
    }

    if (state.selectedNodeIds.length > 0) {
        newState.nodes = state.nodes.filter(n => !state.selectedNodeIds.includes(n.id));
        newState.edges = newState.edges.filter((e: EdgeData) => 
            !state.selectedNodeIds.includes(e.source) && !state.selectedNodeIds.includes(e.target)
        );
        newState.selectedNodeIds = [];
    }
    
    return newState;
  }),

  clearGraph: () => set((state) => ({
      past: [...state.past, getSnapshot(state)],
      future: [],
      nodes: [],
      edges: [],
      steps: [],
      currentStepIndex: -1,
      isPlaying: false,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      drawingEdge: null,
      scale: 1,
      position: { x: 0, y: 0 }
  })),
  
  setDrawingEdge: (data) => set({ drawingEdge: data }),
  
  selectNode: (id, multi = false) => set((state) => {
      if (id === null) {
          return { selectedNodeIds: [], selectedEdgeIds: [] };
      }
      if (multi) {
          if (state.selectedNodeIds.includes(id)) {
              return { selectedNodeIds: state.selectedNodeIds.filter(nid => nid !== id) };
          }
          return { selectedNodeIds: [...state.selectedNodeIds, id], selectedEdgeIds: [] };
      }
      return { selectedNodeIds: [id], selectedEdgeIds: [] };
  }),

  selectEdge: (id, multi = false) => set((state) => {
      if (id === null) {
           return { selectedNodeIds: [], selectedEdgeIds: [] };
      }
      if (multi) {
          if (state.selectedEdgeIds.includes(id)) {
               return { selectedEdgeIds: state.selectedEdgeIds.filter(eid => eid !== id) };
          }
          return { selectedEdgeIds: [...state.selectedEdgeIds, id], selectedNodeIds: [] };
      }
      return { selectedEdgeIds: [id], selectedNodeIds: [] };
  }),

  selectRegion: (x, y, width, height) => set((state) => {
      const x1 = Math.min(x, x + width);
      const x2 = Math.max(x, x + width);
      const y1 = Math.min(y, y + height);
      const y2 = Math.max(y, y + height);

      const sNodeIds = state.nodes
          .filter(n => n.x >= x1 && n.x <= x2 && n.y >= y1 && n.y <= y2)
          .map(n => n.id);

      const sEdgeIds = state.edges
          .filter(e => sNodeIds.includes(e.source) && sNodeIds.includes(e.target))
          .map(e => e.id);

      return { 
          selectedNodeIds: sNodeIds, 
          selectedEdgeIds: sEdgeIds 
      };
  }),

  setSelectedNodes: (ids) => set({ selectedNodeIds: ids, selectedEdgeIds: [] }),
  setSelectedEdges: (ids) => set({ selectedEdgeIds: ids, selectedNodeIds: [] }),
  clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

  setViewport: (scale, pos) => set({ scale, position: pos }),
  setStageRef: (ref) => set({ stageRef: ref }),
  
  loadSteps: (steps) => set({ 
    steps, 
    currentStepIndex: -1, 
    isPlaying: false 
  }),
  
  nextStep: () => set((state) => {
    if (state.currentStepIndex < state.steps.length - 1) {
      return { currentStepIndex: state.currentStepIndex + 1 };
    }
    return { isPlaying: false };
  }),
  
  prevStep: () => set((state) => {
    if (state.currentStepIndex > -1) {
      return { currentStepIndex: state.currentStepIndex - 1 };
    }
    return {};
  }),
  
  setStep: (index) => set({ currentStepIndex: index }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  resetPlayer: () => set({ currentStepIndex: -1, isPlaying: false, steps: [] }),
  
  setGraph: (data) => set((state) => ({
    past: [...state.past, getSnapshot(state)],
    future: [],
    nodes: data.nodes,
    edges: data.edges,
    isDirected: data.isDirected,
    steps: [],
    currentStepIndex: -1
  })),

  getExportData: () => {
      const state = get();
      if (state.selectedNodeIds.length > 0) {
          const selectedNodes = state.nodes.filter(n => state.selectedNodeIds.includes(n.id));
          const selectedEdges = state.edges.filter(e => 
              state.selectedNodeIds.includes(e.source) && state.selectedNodeIds.includes(e.target)
          );
          return {
              nodes: selectedNodes,
              edges: selectedEdges,
              isDirected: state.isDirected
          };
      }
      return {
          nodes: state.nodes,
          edges: state.edges,
          isDirected: state.isDirected
      };
  }
}));