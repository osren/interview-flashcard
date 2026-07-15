#!/usr/bin/env bash
# drift-check.sh —— 纯 grep 检测「项目当前接口」相对「triage 清单」的漂移（零 LLM，可挂 CI）
#
# 用法:
#   drift-check.sh <项目src目录> <team-urls.js清单> [关注前缀...]
#   关注前缀默认 /esapp/；若该业务还有非 /esapp/ 的自有/关注前缀（如 /marketing/ /eos/ /perceive/ /invoice-api/），追加传入。
#
# 输出: 新增未接入的 url、清单中已消失的 url（疑似删除/改名）及计数。
# 退出码: 0=无漂移；1=有新增或删除（CI 可据此 gate 或告警）。
#
# 定位: 这是「该不该跑一次增量同步」的廉价哨兵。发现漂移后，用 discover-triage-urls 的 sync 模式只分类新增项即可。
set -uo pipefail

PROJ="${1:?用法: drift-check.sh <项目src目录> <清单.js> [前缀...]}"
MANIFEST="${2:?缺少 team-urls.js 清单路径}"
shift 2 || true
PREFIXES=("$@"); [ ${#PREFIXES[@]} -eq 0 ] && PREFIXES=("/esapp/")

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cur="$tmp/cur.txt"; kn="$tmp/known.txt"; : > "$cur"; : > "$kn"

# 两边用「同样的前缀 grep」对称提取，避免不对称造成假漂移：
#   - 清单侧扫整份文件（含 footer 记录的死代码 pathname），这样"故意剔除的死代码"不会被误报成新增；
#   - 项目侧非锚定 grep，以兼容 https://host/path 内嵌的 pathname。
for p in "${PREFIXES[@]}"; do
  grep -oE   "${p}[A-Za-z0-9/_.-]*" "$MANIFEST" 2>/dev/null >> "$kn"  || true
  grep -rEohI "${p}[A-Za-z0-9/_.-]*" "$PROJ"    2>/dev/null >> "$cur" || true
done
sort -u "$cur" -o "$cur"; sort -u "$kn" -o "$kn"

# 滤掉注释散文碎片：裸前缀（以 / 结尾）、含 ... 占位、段数不足两段的
for f in "$cur" "$kn"; do
  grep -E '^/[^/]+/[^/]+' "$f" | grep -vE '(\.\.\.|/$)' | sort -u > "$f.f" && mv "$f.f" "$f"
done

NEW="$(comm -13 "$kn" "$cur")"
GONE="$(comm -23 "$kn" "$cur")"
nnew="$(printf '%s\n' "$NEW" | sed '/^$/d' | wc -l | tr -d ' ')"
ngone="$(printf '%s\n' "$GONE" | sed '/^$/d' | wc -l | tr -d ' ')"

echo "== triage 清单漂移检查 =="
echo "关注前缀: ${PREFIXES[*]}"
echo "已登记(该前缀内): $(wc -l < "$kn" | tr -d ' ')   当前项目: $(wc -l < "$cur" | tr -d ' ')"
echo "── 新增未接入: $nnew"
[ "$nnew" -gt 0 ] && printf '%s\n' "$NEW" | sed '/^$/d;s/^/  + /'
echo "── 清单中已消失(疑似删除/改名): $ngone"
[ "$ngone" -gt 0 ] && printf '%s\n' "$GONE" | sed '/^$/d;s/^/  - /'

if [ "$nnew" -eq 0 ] && [ "$ngone" -eq 0 ]; then
  echo "无漂移 ✅"; exit 0
fi
echo "有漂移 → 建议跑一次 discover-triage-urls 的 sync 模式，只分类上面的新增项。"
exit 1
