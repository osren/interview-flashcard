#!/bin/bash

# 页面性能分析脚本
# 用法: ./analyze.sh <页面路径> [输出文件名]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 参数检查
if [ $# -lt 1 ]; then
    echo -e "${RED}错误: 缺少页面路径参数${NC}"
    echo "用法: $0 <页面路径> [输出文件名]"
    echo "示例: $0 src/pages/home/index.mpx"
    exit 1
fi

PAGE_PATH=$1
OUTPUT_FILE=${2:-"性能分析报告_$(date +%Y%m%d_%H%M%S).md"}

# 检查文件是否存在
if [ ! -f "$PAGE_PATH" ]; then
    echo -e "${RED}错误: 页面文件不存在: $PAGE_PATH${NC}"
    exit 1
fi

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}页面性能分析工具${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 获取文件信息
FILE_NAME=$(basename "$PAGE_PATH")
FILE_DIR=$(dirname "$PAGE_PATH")
FILE_EXT="${FILE_NAME##*.}"

echo -e "${GREEN}✓ 目标文件:${NC} $FILE_NAME"
echo -e "${GREEN}✓ 文件路径:${NC} $PAGE_PATH"
echo -e "${GREEN}✓ 文件类型:${NC} $FILE_EXT"
echo ""

# 检测技术栈
detect_tech_stack() {
    local file="$1"
    local ext="${file##*.}"

    case $ext in
        mpx|vue)
            echo "MPX/Vue"
            ;;
        tsx|jsx)
            echo "React"
            ;;
        js|ts)
            if grep -q "createPage\|createComponent" "$file" 2>/dev/null; then
                echo "MPX"
            elif grep -q "React\|useState\|useEffect" "$file" 2>/dev/null; then
                echo "React"
            else
                echo "JavaScript"
            fi
            ;;
        *)
            echo "Unknown"
            ;;
    esac
}

TECH_STACK=$(detect_tech_stack "$PAGE_PATH")
echo -e "${GREEN}✓ 技术栈:${NC} $TECH_STACK"
echo ""

# 分析页面结构
echo -e "${YELLOW}正在分析页面结构...${NC}"

# 统计代码行数
TOTAL_LINES=$(wc -l < "$PAGE_PATH")
echo -e "  - 总代码行数: $TOTAL_LINES"

# 统计函数数量
FUNCTION_COUNT=$(grep -oE "(function\s+\w+|const\s+\w+\s*=\s*\(.*\)\s*=>|\w+\s*\(.*\)\s*\{)" "$PAGE_PATH" 2>/dev/null | wc -l | awk '{print $1}')
echo -e "  - 函数数量: $FUNCTION_COUNT"

# 统计网络请求
if [ -d "$FILE_DIR" ]; then
    API_COUNT=$(find "$FILE_DIR" -name "*.js" -o -name "*.ts" 2>/dev/null | xargs grep -l "api\|request\|fetch" 2>/dev/null | wc -l | awk '{print $1}')
    echo -e "  - API 文件数: $API_COUNT"
fi

echo ""

# 生成分析报告
echo -e "${YELLOW}正在生成性能分析报告...${NC}"

cat > "$OUTPUT_FILE" << EOF
# 页面性能分析报告

**生成时间**: $(date '+%Y-%m-%d %H:%M:%S')
**分析文件**: $PAGE_PATH
**技术栈**: $TECH_STACK
**代码行数**: $TOTAL_LINES

---

## 一、页面概述

### 1.1 基本信息
- **页面名称**: ${FILE_NAME%.*}
- **文件路径**: $PAGE_PATH
- **技术栈**: $TECH_STACK
- **文件类型**: $FILE_EXT

### 1.2 代码统计
- 总代码行数: $TOTAL_LINES
- 函数数量: $FUNCTION_COUNT
- API文件数: ${API_COUNT:-0}

---

## 二、分析维度

### 2.1 页面加载阶段
待 Claude 深度分析...

### 2.2 用户交互阶段
待 Claude 深度分析...

### 2.3 数据监听阶段
待 Claude 深度分析...

---

## 三、函数执行耗时排序

### 🔴 第一梯队：高耗时函数（>500ms）

待分析...

### 🟡 第二梯队：中等耗时函数（200-500ms）

待分析...

### 🟢 第三梯队：低耗时函数（<200ms）

待分析...

---

## 四、性能瓶颈分析

待 Claude 深度分析...

---

## 五、优化建议

### P0 级（立即优化）

待分析...

### P1 级（中期优化）

待分析...

### P2 级（长期优化）

待分析...

---

## 六、性能指标对比

| 指标 | 当前值 | 目标值 | 优化建议 |
|------|--------|--------|----------|
| FCP | 待测量 | < 1.8s | - |
| LCP | 待测量 | < 2.5s | - |
| TTI | 待测量 | < 3.8s | - |
| FID | 待测量 | < 100ms | - |

---

**报告说明**: 本报告由自动化脚本生成初步框架，需要 Claude 进行深度分析后完善。

EOF

echo -e "${GREEN}✓ 分析报告已生成: $OUTPUT_FILE${NC}"
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${YELLOW}下一步:${NC}"
echo -e "  1. 将报告内容提供给 Claude"
echo -e "  2. Claude 将进行深度分析并完善报告"
echo -e "  3. 获得完整的性能优化建议"
echo -e "${BLUE}================================${NC}"
