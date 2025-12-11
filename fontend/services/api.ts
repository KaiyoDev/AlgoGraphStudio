import axios from 'axios';
import { GraphData, AlgorithmResponse, AlgorithmType } from '../types';

// Cấu hình địa chỉ backend Flask
const API_URL = 'http://localhost:5000/api';

// Chỉ gọi backend, không xử lý thuật toán ở frontend
export const runAlgorithm = async (algo: AlgorithmType, graph: GraphData, params?: { source?: string; target?: string; start_node?: string }): Promise<AlgorithmResponse> => {
  const requestBody: any = { 
      algorithm: algo, 
      graph: {
          nodes: graph.nodes,
          edges: graph.edges,
          isDirected: graph.isDirected
      } 
  };
  
  // Thêm các tham số tùy chọn nếu có
  if (params) {
      if (params.source !== undefined) requestBody.source = params.source;
      if (params.target !== undefined) requestBody.target = params.target;
      if (params.start_node !== undefined) requestBody.start_node = params.start_node;
  }
  
  const response = await axios.post(`${API_URL}/run`, requestBody, {
      timeout: 5000
  });

  return response.data;
};