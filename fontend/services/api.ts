import axios from 'axios';
import { GraphData, AlgorithmResponse, AlgorithmType, StepState } from '../types';

// Cấu hình địa chỉ backend Flask (có thể cấu hình qua environment variable)
const API_URL = (import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// --- MOCK DATA GENERATOR (Dự phòng khi Backend Offline) ---
const generateMockSteps = (algo: AlgorithmType, graph: GraphData): StepState[] => {
  const steps: StepState[] = [];
  const nodeIds = graph.nodes.map(n => n.id);
  
  steps.push({
    highlightNodes: {},
    highlightEdges: {},
    description: `[MOCK] Bắt đầu thuật toán ${algo} (Chế độ giả lập do không kết nối được Server).`
  });

  if (algo === AlgorithmType.PRIM && nodeIds.length > 0) {
    const startNode = nodeIds[0];
    steps.push({
      highlightNodes: { [startNode]: '#10b981' },
      highlightEdges: {},
      description: `Chọn nút bắt đầu ${startNode}.`
    });
    
    const connectedEdge = graph.edges.find(e => e.source === startNode || e.target === startNode);
    if (connectedEdge) {
       steps.push({
        highlightNodes: { [startNode]: '#10b981' },
        highlightEdges: { [connectedEdge.id]: '#f59e0b' },
        description: `Đang xét cạnh trọng số ${connectedEdge.weight}.`
      });
      const otherNode = connectedEdge.source === startNode ? connectedEdge.target : connectedEdge.source;
      steps.push({
        highlightNodes: { [startNode]: '#10b981', [otherNode]: '#10b981' },
        highlightEdges: { [connectedEdge.id]: '#10b981' },
        description: `Thêm ${otherNode} vào cây khung.`
      });
    }
  } else {
      steps.push({
          highlightNodes: {},
          highlightEdges: {},
          description: `Thuật toán ${algo} chưa có logic giả lập chi tiết. Vui lòng kết nối Backend Python để chạy chính xác.`
      });
  }

  return steps;
};
// ---------------------------------------------------------

export const runAlgorithm = async (algo: AlgorithmType, graph: GraphData): Promise<AlgorithmResponse> => {
  try {
    console.log(`📡 Đang gửi yêu cầu tới ${API_URL}/run...`);
    
    // Gửi request thực tới Flask API
    // Payload khớp với mong đợi của Python: { algorithm: string, graph: dict }
    const response = await axios.post(`${API_URL}/run`, { 
        algorithm: algo, 
        graph: {
            nodes: graph.nodes,
            edges: graph.edges,
            isDirected: graph.isDirected
        } 
    }, {
        timeout: 5000 // Timeout sau 5s nếu server không phản hồi
    });

    console.log("✅ Kết nối Backend thành công!");
    return response.data;

  } catch (error: any) {
    console.warn("⚠️ Không thể kết nối tới Flask API. Chuyển sang chế độ MOCK.", error.message);
    
    // Fallback: Sử dụng dữ liệu giả lập để UI không bị treo
    // Giả lập độ trễ mạng để trải nghiệm người dùng tự nhiên hơn
    await new Promise(resolve => setTimeout(resolve, 600)); 
    
    return {
      name: algo,
      steps: generateMockSteps(algo, graph)
    };
  }
};