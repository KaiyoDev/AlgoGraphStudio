import axios from 'axios';
import { GraphData, AlgorithmResponse, AlgorithmType } from '../types';

// Cấu hình địa chỉ backend Flask
const API_URL = 'http://localhost:5000/api';

// Chỉ gọi backend, không xử lý thuật toán ở frontend
export const runAlgorithm = async (algo: AlgorithmType, graph: GraphData): Promise<AlgorithmResponse> => {
  const response = await axios.post(`${API_URL}/run`, { 
      algorithm: algo, 
      graph: {
          nodes: graph.nodes,
          edges: graph.edges,
          isDirected: graph.isDirected
      } 
  }, {
      timeout: 5000
  });

  return response.data;
};