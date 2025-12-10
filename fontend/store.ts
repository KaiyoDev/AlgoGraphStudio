import { create } from 'zustand';
import { NodeData, EdgeData, ToolMode, StepState, GraphData } from './types';

interface GraphStore {
  // Graph State
  nodes: NodeData[];
  edges: EdgeData[];
  isDirected: boolean;
  
  // UI State
  mode: ToolMode;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  tempSourceNodeId: string | null; 
  scale: number;
  position: { x: number; y: number };
  
  // Player State
  steps: StepState[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; 
  
  // Actions
  setMode: (mode: ToolMode) => void;
  setDirected: (isDirected: boolean) => void;
  addNode: (x: number, y: number) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  addEdge: (source: string, target: string, weight?: number) => void;
  updateEdgeWeight: (id: string, weight: number) => void;
  deleteElement: (type: 'node' | 'edge', id: string) => void;
  deleteSelected: () => void;
  setTempSource: (id: string | null) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  setViewport: (scale: number, pos: {x: number, y: number}) => void; // Zoom/Pan
  
  // Player Actions
  loadSteps: (steps: StepState[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  resetPlayer: () => void;
  
  // Bulk (for AI/Load)
  setGraph: (data: GraphData) => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  isDirected: false,
  
  mode: 'pointer',
  selectedNodeId: null,
  selectedEdgeId: null,
  tempSourceNodeId: null,
  scale: 1,
  position: { x: 0, y: 0 },
  
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  playbackSpeed: 800,
  
  setMode: (mode) => set({ 
    mode, 
    tempSourceNodeId: null, 
    selectedNodeId: null, 
    selectedEdgeId: null 
  }),
  
  setDirected: (isDirected) => set({ isDirected }),
  
  addNode: (x, y) => set((state) => {
    // Điều chỉnh tọa độ dựa trên viewport hiện tại để đặt đúng vị trí chuột
    const adjustedX = (x - state.position.x) / state.scale;
    const adjustedY = (y - state.position.y) / state.scale;
    
    const newId = String(state.nodes.length + 1);
    const newNode: NodeData = { 
        id: newId, 
        x: adjustedX, 
        y: adjustedY, 
        label: newId 
    };
    return { nodes: [...state.nodes, newNode] };
  }),
  
  updateNodePosition: (id, x, y) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, x, y } : n)
  })),
  
  addEdge: (source, target, weight = 1) => set((state) => {
    if (source === target) return state; // Không cho phép khuyên (self-loop) đơn giản ở đây
    const exists = state.edges.find(e => 
      (e.source === source && e.target === target) || 
      (!state.isDirected && e.source === target && e.target === source)
    );
    if (exists) return state;

    const newEdge: EdgeData = {
      id: `e${source}-${target}`,
      source,
      target,
      weight,
      isDirected: state.isDirected
    };
    return { edges: [...state.edges, newEdge] };
  }),
  
  updateEdgeWeight: (id, weight) => set((state) => ({
    edges: state.edges.map(e => e.id === id ? { ...e, weight } : e)
  })),
  
  deleteElement: (type, id) => set((state) => {
    if (type === 'node') {
      return {
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
      };
    } else {
      return {
        edges: state.edges.filter(e => e.id !== id),
        selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId
      };
    }
  }),

  deleteSelected: () => set((state) => {
    let newState = { ...state };
    if (state.selectedNodeId) {
        const id = state.selectedNodeId;
        newState.nodes = state.nodes.filter(n => n.id !== id);
        newState.edges = state.edges.filter(e => e.source !== id && e.target !== id);
        newState.selectedNodeId = null;
    }
    if (state.selectedEdgeId) {
        const id = state.selectedEdgeId;
        newState.edges = state.edges.filter(e => e.id !== id);
        newState.selectedEdgeId = null;
    }
    return newState;
  }),
  
  setTempSource: (id) => set({ tempSourceNodeId: id }),
  
  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  setViewport: (scale, pos) => set({ scale, position: pos }),
  
  // Player Actions Implementation
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
  
  resetPlayer: () => set({ currentStepIndex: -1, isPlaying: false }),
  
  setGraph: (data) => set({
    nodes: data.nodes,
    edges: data.edges,
    isDirected: data.isDirected,
    steps: [],
    currentStepIndex: -1
  })
}));