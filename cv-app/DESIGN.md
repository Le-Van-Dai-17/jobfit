# Design System - CV Project (Lumina Tech Talent System)

Document trích xuất thông số thiết kế (bảng màu & kiểu chữ) từ Stitch Project **CV** (`projects/15284716824981595245`).

---

## 🎨 Bảng Màu (Color Palette)

### 1. Thương hiệu & Màu chủ đạo (Brand & Core Colors)
| Phân loại | Tên token | Giá trị Hex | Mô tả |
| :--- | :--- | :--- | :--- |
| **Primary** | `primary` | `#4648d4` (`#6366F1`) | Màu Indigo chính cho nút chính, điểm nhấn thương hiệu |
| **Primary Container** | `primary-container` | `#6063ee` | Nền cho phần tử primary nổi bật |
| **Secondary** | `secondary` | `#6b38d4` (`#8B5CF6`) | Màu tím Violet cho AI features, CTA phụ |
| **Secondary Container** | `secondary-container` | `#8455ef` | Container màu phụ |
| **Tertiary** | `tertiary` | `#00628d` (`#0EA5E9`) | Màu Sky Blue cho dữ liệu & chỉ số |
| **Tertiary Container** | `tertiary-container` | `#007cb1` | Container cho chỉ số bổ trợ |

### 2. Nền & Bề mặt (Background & Surfaces)
| Phân loại | Tên token | Giá trị Hex | Mô tả |
| :--- | :--- | :--- | :--- |
| **Background** | `background` | `#f8f9ff` | Màu nền tổng thể trang |
| **Surface** | `surface` | `#f8f9ff` | Nền bề mặt cơ bản |
| **Surface Container Lowest**| `surface-container-lowest` | `#ffffff` | Nền thẻ (cards), modal màu trắng |
| **Surface Container Low** | `surface-container-low` | `#eff4ff` | Bề mặt phụ cấp thấp |
| **Surface Container** | `surface-container` | `#e5eeff` | Bề mặt container tiêu chuẩn |
| **Surface Container High** | `surface-container-high` | `#dce9ff` | Bề mặt container cấp cao |
| **Surface Container Highest**| `surface-container-highest` | `#d3e4fe` | Bề mặt container phân cấp cao nhất |

### 3. Chữ & Viền (Text & Outlines)
| Phân loại | Tên token | Giá trị Hex | Mô tả |
| :--- | :--- | :--- | :--- |
| **On Surface / Text** | `on-surface` / `on-background` | `#0b1c30` | Màu chữ chính (Tối đậm trên nền sáng) |
| **On Surface Variant** | `on-surface-variant` | `#464554` | Màu chữ phụ, phụ đề, chú thích |
| **On Primary** | `on-primary` | `#ffffff` | Màu chữ trên nền primary |
| **Outline** | `outline` | `#767586` | Viền phần tử chính |
| **Outline Variant** | `outline-variant` | `#c7c4d7` | Viền nhạt cho cards/dividers |

### 4. Trạng thái & Lỗi (Status & Semantic)
| Phân loại | Tên token | Giá trị Hex | Mô tả |
| :--- | :--- | :--- | :--- |
| **Error** | `error` | `#ba1a1a` | Màu đỏ thông báo lỗi |
| **Error Container** | `error-container` | `#ffdad6` | Nền thông báo lỗi |

---

## 🔤 Kiểu Chữ (Typography System)

**Font Family chính:** `Inter`, sans-serif

| Kiểu dáng (Token) | Font Family | Size (Kích thước) | Weight (Độ dày) | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Large** | Inter | 48px | 800 (ExtraBold) | 56px | -0.02em |
| **Headline Large** | Inter | 32px | 700 (Bold) | 40px | -0.01em |
| **Headline Large (Mobile)** | Inter | 28px | 700 (Bold) | 36px | normal |
| **Headline Medium** | Inter | 24px | 600 (SemiBold) | 32px | normal |
| **Body Large** | Inter | 18px | 400 (Regular) | 28px | normal |
| **Body Medium** | Inter | 16px | 400 (Regular) | 24px | normal |
| **Body Small** | Inter | 14px | 400 (Regular) | 20px | normal |
| **Label Medium** | Inter | 14px | 600 (SemiBold) | 16px | normal |
| **Label Small** | Inter | 12px | 500 (Medium) | 16px | normal |

---

## 📐 Bo Góc & Khoảng Cách (Radius & Spacing)

### Bo Góc (Border Radius)
- **Small (`rounded-sm`):** `0.25rem` (4px)
- **Default (`rounded`):** `0.5rem` (8px) - Sử dụng cho Nút bấm & Input
- **Medium (`rounded-md`):** `0.75rem` (12px) - Icon containers
- **Large (`rounded-lg`):** `1rem` (16px)
- **Extra Large (`rounded-xl`):** `1.5rem` (24px) - Sử dụng cho Cards lớn & Modals
- **Full (`rounded-full`):** `9999px` - Badges & Status Chips

### Khoảng Cách Base (Spacing)
- **Base Unit:** 4px (8pt grid rhythm)
- **Small Padding (`sm`):** 16px (`1rem`)
- **Medium Padding (`md`):** 24px (`1.5rem`)
- **Large Padding (`lg`):** 32px (`2rem`)
- **Desktop Margin:** 40px (`2.5rem`)
- **Mobile Margin:** 16px (`1rem`)
