import type { AssessmentSeniority, AssessmentTaskType, Prisma } from "@prisma/client";
import { AssessmentRubricSchema } from "../schemas/assessment.schema";

export type ScenarioFile = {
  path: string;
  content: string;
  language: string;
};

export type ScenarioTask = {
  id: string; // Unique within the scenario
  orderIndex: number;
  type: AssessmentTaskType;
  title: string;
  prompt: string;
  skills: string[];
  rubric: Prisma.InputJsonValue;
  expectedEvidence: string[];
  initialCode: string;
};

export type Scenario = {
  id: string;
  title: string;
  targetRole: string; // e.g. "Backend Developer", "Frontend Developer"
  seniority: AssessmentSeniority[];
  description: string;
  files: ScenarioFile[];
  databaseSchema?: string;
  tasks: ScenarioTask[];
};

const commonRubric = [
  {
    id: "problem_framing",
    label: "Định nghĩa vấn đề và ràng buộc",
    maxScore: 5,
    evidenceHints: ["mục tiêu", "phạm vi", "ràng buộc", "trade-off"],
  },
  {
    id: "architecture",
    label: "Thiết kế kỹ thuật phù hợp",
    maxScore: 5,
    evidenceHints: ["api", "database", "cache", "service", "schema"],
  },
  {
    id: "implementation",
    label: "Kế hoạch triển khai và kiểm thử",
    maxScore: 5,
    evidenceHints: ["test", "migration", "validation", "rollback", "monitoring"],
  },
  {
    id: "risk",
    label: "Nhận diện rủi ro vận hành",
    maxScore: 5,
    evidenceHints: ["rủi ro", "security", "privacy", "failure", "timeout"],
  },
];

const rubric = AssessmentRubricSchema.parse(commonRubric) as Prisma.InputJsonValue;

export const SCENARIO_BANK: Scenario[] = [
  {
    id: "backend-java-n1",
    title: "Tối ưu hiệu năng Backend Java (N+1 Query)",
    targetRole: "Backend Developer",
    seniority: ["JUNIOR", "MID", "SENIOR"],
    description: "Hệ thống cũ gặp vấn đề nghiêm trọng về hiệu năng do lỗi truy vấn N+1 khi xử lý đơn hàng.",
    databaseSchema: `// Database Schema (PostgreSQL)

Table: users
- id (UUID, Primary Key)
- balance (DECIMAL)
- status (VARCHAR)
* Rows: ~5,000,000

Table: orders
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- product_ids (JSONB)
- status (VARCHAR)
- created_at (TIMESTAMP)
* Rows: ~50,000,000

Table: products
- id (VARCHAR, Primary Key)
- price (DECIMAL)
- stock (INTEGER)
* Rows: ~100,000`,
    files: [
      {
        path: "src/OrderService.java",
        language: "java",
        content: `// LƯU Ý: Đây là đoạn code cũ (Legacy Code) đang chạy trên Production
// Hệ thống đang gặp tình trạng bottleneck khi xử lý hàng loạt đơn hàng.
// Hãy phân tích và tối ưu hóa lại đoạn code này!

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public List<Order> processPendingOrders(List<String> orderIds) {
        List<Order> processedOrders = new ArrayList<>();

        // Cảnh báo: Vòng lặp N+1 queries tiềm ẩn
        for (String orderId : orderIds) {
            Order order = orderRepository.findById(orderId);

            if (order != null && order.getStatus() == OrderStatus.PENDING) {
                User user = userRepository.findById(order.getUserId());

                double totalAmount = 0;
                for (String productId : order.getProductIds()) {
                    Product product = productRepository.findById(productId);
                    if (product != null && product.getStock() > 0) {
                        totalAmount += product.getPrice();
                        product.setStock(product.getStock() - 1);
                        productRepository.save(product); // Gọi DB liên tục trong vòng lặp
                    }
                }

                if (user.getBalance() >= totalAmount) {
                    user.setBalance(user.getBalance() - totalAmount);
                    userRepository.save(user);

                    order.setStatus(OrderStatus.COMPLETED);
                    order.setTotal(totalAmount);
                    orderRepository.save(order);
                    processedOrders.add(order);
                }
            }
        }

        return processedOrders;
    }
}`
      }
    ],
    tasks: [
      {
        id: "task-1",
        orderIndex: 1,
        type: "CODE_REVIEW",
        title: "Tối ưu hóa mã nguồn (Legacy Code)",
        prompt: "Hệ thống cũ đang gặp vấn đề nghiêm trọng về hiệu năng (Bottleneck). API xử lý đôi khi mất tới 2.8s và CPU Database tăng vọt lên 92%.\n\nBên dưới là mã nguồn (Legacy Code) đang chạy trên Production. Hãy đọc hiểu code, nhận diện vấn đề (ví dụ: N+1 query, thuật toán kém tối ưu, vòng lặp vô tận, thiếu caching...) và sửa trực tiếp mã nguồn để hệ thống chạy nhanh và an toàn hơn.",
        skills: ["Java", "Performance Optimization", "Code Review"],
        expectedEvidence: ["Xác định đúng nguyên nhân gây chậm (Bottleneck)", "Mã nguồn sau khi sửa chạy hiệu quả hơn", "Đảm bảo tính đúng đắn của dữ liệu"],
        initialCode: "",
        rubric
      },
      {
        id: "task-2",
        orderIndex: 2,
        type: "SYSTEM_DESIGN",
        title: "Cải tiến Kiến trúc Cơ sở dữ liệu",
        prompt: "Tiếp tục với bài toán tối ưu trên, giải pháp sửa code là chưa đủ nếu lượng dữ liệu tăng gấp 10 lần trong tương lai. Hãy xem cấu trúc Database hiện tại (bảng schema ở tab Database) và đề xuất các thay đổi về kiến trúc. Bạn có thể đề xuất thêm Index, Caching layer (Redis), Message Queue, hoặc thay đổi kiểu dữ liệu.",
        skills: ["System Design", "Database Optimization", "Caching"],
        expectedEvidence: ["Đề xuất Indexing/Partitioning hợp lý", "Thiết kế Caching hoặc Queue", "Đánh giá Trade-off của thiết kế mới"],
        initialCode: "",
        rubric
      }
    ]
  },
  {
    id: "frontend-react-performance",
    title: "Tối ưu Re-render Frontend (React)",
    targetRole: "Frontend Developer",
    seniority: ["JUNIOR", "MID", "SENIOR"],
    description: "Trang danh sách sản phẩm bị giật lag khi người dùng scroll nhanh, do component re-render quá nhiều lần.",
    databaseSchema: `// Không có Database Schema cho tình huống Frontend.`,
    files: [
      {
        path: "src/ProductList.tsx",
        language: "typescript",
        content: `import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';

export function ProductList({ categoryId }: { categoryId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(\`/api/products?category=\${categoryId}\`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [categoryId]);

  // Vấn đề: Hàm tính toán nặng chạy lại mỗi lần gõ phím tìm kiếm
  const expensiveFilteredProducts = products.filter(p => {
    // Giả lập logic tính toán phức tạp
    let score = 0;
    for(let i=0; i<10000; i++) score += Math.random();
    return p.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
      />

      <div className="grid">
        {expensiveFilteredProducts.map(product => (
           <ProductCard
             key={product.id}
             product={product}
             // Vấn đề: Truyền inline function làm ProductCard luôn re-render
             onAddToCart={() => console.log('Added', product.id)}
           />
        ))}
      </div>
    </div>
  );
}`
      }
    ],
    tasks: [
      {
        id: "task-1",
        orderIndex: 1,
        type: "CODE_REVIEW",
        title: "Tối ưu hóa Re-render React",
        prompt: "Đoạn code bên trái là một trang danh sách sản phẩm bằng React. Hiện tại, mỗi khi người dùng gõ phím vào ô tìm kiếm, toàn bộ trang bị giật lag nghiêm trọng.\n\nHãy phân tích và sửa lại đoạn code để tối ưu hóa hiệu năng, giảm thiểu số lần re-render không cần thiết và tránh các phép tính nặng chạy lại liên tục.",
        skills: ["React", "Performance Optimization", "Frontend"],
        expectedEvidence: ["Sử dụng useMemo để cache kết quả tính toán đắt đỏ", "Sử dụng useCallback để tránh tạo mới function onAddToCart", "Sử dụng debounce cho ô tìm kiếm (nếu cần)"],
        initialCode: "",
        rubric
      }
    ]
  }
];

export function matchScenario(title: string, requirements: string): Scenario {
  const text = (title + " " + requirements).toLowerCase();

  if (text.includes("react") || text.includes("frontend") || text.includes("vue") || text.includes("ui")) {
    return SCENARIO_BANK.find(s => s.id === "frontend-react-performance")!;
  }

  return SCENARIO_BANK.find(s => s.id === "backend-java-n1")!;
}
