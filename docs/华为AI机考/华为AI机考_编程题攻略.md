# 华为 AI 机考编程题攻略

> 来源：[华为AI机考一周速成攻略](https://onefly.top/zero2Leetcode/04_real_interviews/huawei/ai-exam-guide/index.html)、[华为机考备考完全指南](https://onefly.top/zero2Leetcode/04_real_interviews/huawei/exam-guide/index.html)

## 一、编程题概述

### 1.1 考试形式
- **语言选择**：Python、C++、Java
- **题目数量**：通常2-3道编程题
- **分值分布**：选择题60分 + 编程题40分（部分题目可能占20分/题）
- **时间要求**：需在规定时间内完成代码编写和提交

### 1.2 难度分布

| 难度 | 占比 | 题目特征 |
|------|------|---------|
| 简单 | 30% | 基础数据结构操作，暴力可解 |
| 中等 | 50% | 需掌握经典算法，常见变形 |
| 困难 | 20% | 综合应用，需较强算法能力 |

### 1.3 高频考点
1. **动态规划**（最重要）
2. **数组/链表操作**
3. **二叉树遍历**
4. **DFS/BFS搜索**
5. **滑动窗口**
6. **双指针**
7. **回溯算法**
8. **单调栈**

---

## 二、动态规划（DP）

### 2.1 解题框架

动态规划适用于具有**最优子结构**和**重叠子问题**的问题。

#### DP通用步骤
```
1. 确定dp数组含义
2. 确定状态转移方程
3. 确定初始条件
4. 确定遍历顺序
5. 举例验证
```

#### DP类型判断
- **坐标型DP**：dp[i]表示以第i个位置结尾的xxx
- **序列型DP**：dp[i]表示前i个xxx
- **划分型DP**：dp[i]表示前i个xxx是否可以/最优
- **区间型DP**：dp[i][j]表示区间[i,j]的xxx
- **背包型DP**：二维dp[i][j]表示前i个物品/容量j的xxx

### 2.2 经典模板

## 1. 爬楼梯问题

## 答案

### 核心要点

爬楼梯，每次可以爬1或2步，问第n步有多少种爬法。

### 详细说明

这是一个典型的斐波那契数列问题：
- dp[i] = dp[i-1] + dp[i-2]
- 初始化：dp[1] = 1, dp[2] = 2
- 最终答案：dp[n]

### 示例代码

```python
def climbStairs(n: int) -> int:
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
```

### 复杂度
- 时间复杂度：O(n)
- 空间复杂度：O(n)，可优化到O(1)

---

## 2. 路径问题

## 答案

### 核心要点

给定m×n网格，从左上角到右下角，每次只能向右或向下，求路径数。

### 详细说明

- dp[i][j]表示到达(i,j)位置的路径数
- 状态转移：dp[i][j] = dp[i-1][j] + dp[i][j-1]
- 边界：dp[0][j] = 1, dp[i][0] = 1

### 示例代码

```python
def uniquePaths(m: int, n: int) -> int:
    dp = [[0] * n for _ in range(m)]
    for i in range(m):
        dp[i][0] = 1
    for j in range(n):
        dp[0][j] = 1
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]
```

### 复杂度
- 时间复杂度：O(m×n)
- 空间复杂度：O(m×n)

---

## 3. 0-1背包问题

## 答案

### 核心要点

有n件物品，每件重量w[i]，价值v[i]，容量为C，求最大价值。

### 详细说明

- 二维DP：dp[i][j]表示前i件物品、容量为j时的最大价值
- 状态转移：
  - 不选第i件：dp[i-1][j]
  - 选第i件：dp[i-1][j-w[i-1]] + v[i-1]
- dp[i][j] = max(上述两者)

### 示例代码

```python
def knapsack(w: list, v: list, C: int) -> int:
    n = len(w)
    dp = [[0] * (C + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(C + 1):
            if j >= w[i-1]:
                dp[i][j] = max(dp[i-1][j], dp[i-1][j-w[i-1]] + v[i-1])
            else:
                dp[i][j] = dp[i-1][j]
    return dp[n][C]
```

### 复杂度
- 时间复杂度：O(n×C)
- 空间复杂度：O(n×C)，可优化到O(C)

---

## 4. 完全背包问题

## 答案

### 核心要点

每种物品可以选任意多次，求最大价值。

### 详细说明

与0-1背包的区别在于状态转移：
- 选第i件：dp[i][j-w[i-1]] + v[i-1]（正向遍历）

### 示例代码

```python
def completeKnapsack(w: list, v: list, C: int) -> int:
    n = len(w)
    dp = [0] * (C + 1)
    for i in range(n):
        for j in range(w[i], C + 1):
            dp[j] = max(dp[j], dp[j - w[i]] + v[i])
    return dp[C]
```

---

### 2.3 真题精选

## 5. 最长上升子序列

## 答案

### 核心要点

给定整数数组nums，找到最长严格递增子序列的长度。

### 详细说明

- dp[i]表示以nums[i]结尾的最长上升子序列长度
- 状态转移：dp[i] = max(dp[j] + 1) for j < i if nums[j] < nums[i]
- 可用二分优化到O(n log n)

### 示例代码

```python
# O(n²) 版本
def lengthOfLIS(nums: list) -> int:
    if not nums:
        return 0
    n = len(nums)
    dp = [1] * n
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)

# O(n log n) 二分优化版本
from bisect import bisect_left

def lengthOfLIS(nums: list) -> int:
    if not nums:
        return 0
    tails = [nums[0]]
    for num in nums[1:]:
        pos = bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)
        else:
            tails[pos] = num
    return len(tails)
```

---

## 6. 编辑距离

## 答案

### 核心要点

将word1转换成word2所使用的最少操作数（插入、删除、替换）。

### 详细说明

- dp[i][j]表示word1前i个字符转换到word2前j个字符的最少操作数
- 状态转移：
  - 删除：dp[i-1][j] + 1
  - 插入：dp[i][j-1] + 1
  - 替换：dp[i-1][j-1] + 1（若不同）
  - 不替换：dp[i-1][j-1]（若相同）

### 示例代码

```python
def minDistance(word1: str, word2: str) -> int:
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i  # 删除i个字符
    for j in range(n + 1):
        dp[0][j] = j  # 插入j个字符
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1
    return dp[m][n]
```

---

## 7. 买卖股票最佳时机

## 答案

### 核心要点

给定股票价格数组，最多只能完成一笔交易，求最大利润。

### 详细说明

方法1（暴力O(n²)）：
- 枚举所有买卖组合

方法2（优化O(n)）：
- 记录最低价格
- 实时计算最大利润

### 示例代码

```python
def maxProfit(prices: list) -> int:
    if not prices:
        return 0
    min_price = prices[0]
    max_profit = 0
    for price in prices[1:]:
        max_profit = max(max_profit, price - min_price)
        min_price = min(min_price, price)
    return max_profit
```

---

## 8. 打家劫舍

## 答案

### 核心要点

小偷偷沿街房屋，不能偷相邻两家，求最大盗窃金额。

### 详细说明

- dp[i]表示偷到第i家时的最大金额
- dp[i] = max(dp[i-1], dp[i-2] + nums[i])
- 初始化：dp[0] = nums[0], dp[1] = max(nums[0], nums[1])

### 示例代码

```python
def rob(nums: list) -> int:
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    for i in range(2, n):
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return dp[n-1]
```

---

### 2.4 拓展题库

## 9. 完全平方数

## 答案

### 核心要点

给定正整数n，找到完全平方数的最少数量使它们的和恰好为n。

### 详细说明

- dp[i]表示凑成i所需的最少完全平方数数量
- dp[i] = min(dp[i], dp[i - j*j] + 1) for j from 1 to sqrt(i)

### 示例代码

```python
def numSquares(n: int) -> int:
    dp = [float('inf')] * (n + 1)
    dp[0] = 0
    for i in range(1, n + 1):
        j = 1
        while j * j <= i:
            dp[i] = min(dp[i], dp[i - j * j] + 1)
            j += 1
    return dp[n]
```

---

## 10. 分割等和子集

## 答案

### 核心要点

给定数组，判断能否分成两个子集，使元素和相等。

### 详细说明

- 转换为背包问题：能否凑出 sum/2
- 使用集合优化空间复杂度

### 示例代码

```python
def canPartition(nums: list) -> bool:
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2
    dp = set([0])
    for num in nums:
        new_dp = set()
        for t in dp:
            if t + num == target:
                return True
            new_dp.add(t)
            new_dp.add(t + num)
        dp = new_dp
    return False
```

---

## 三、数组与链表

### 3.1 数组操作模板

## 11. 二分查找

## 答案

### 核心要点

在有序数组中查找目标值，返回下标或-1。

### 详细说明

- left, right双指针
- while left <= right
- mid = (left + right) // 2
- 根据大小关系调整边界

### 示例代码

```python
def binary_search(nums: list, target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

---

## 12. 滑动窗口

## 答案

### 核心要点

找出长度为k的连续子数组的最大平均值。

### 详细说明

- 先计算第一个窗口的和
- 然后滑动：减去左边元素，加上右边元素
- 维护最大平均值

### 示例代码

```python
def findMaxAverage(nums: list, k: int) -> float:
    window_sum = sum(nums[:k])
    max_avg = window_sum / k
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_avg = max(max_avg, window_sum / k)
    return max_avg
```

---

## 13. 双指针 - 移除元素

## 答案

### 核心要点

移除数组中值为val的元素，返回新长度。

### 详细说明

- 快慢指针：fast遍历，slow标记位置
- 当nums[fast] != val时，才移动slow

### 示例代码

```python
def removeElement(nums: list, val: int) -> int:
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != val:
            nums[slow] = nums[fast]
            slow += 1
    return slow
```

---

### 3.2 链表操作模板

## 14. 反转链表

## 答案

### 核心要点

反转单向链表，返回新的头结点。

### 详细说明

- 三指针：prev, curr, next_temp
- 遍历时反转next指向
- 最后prev就是新的头

### 示例代码

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head: ListNode) -> ListNode:
    prev = None
    curr = head
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    return prev
```

---

## 15. 链表环检测

## 答案

### 核心要点

判断链表是否有环。

### 详细说明

快慢指针法：
- slow每次走1步
- fast每次走2步
- 若有环，fast会追上slow

### 示例代码

```python
def hasCycle(head: ListNode) -> bool:
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
```

---

## 16. 合并两个有序链表

## 答案

### 核心要点

合并两个有序链表为一个有序链表。

### 详细说明

- 使用虚拟头节点简化操作
- 比较两个链表当前节点，较小者接入结果

### 示例代码

```python
def mergeTwoLists(l1: ListNode, l2: ListNode) -> ListNode:
    dummy = ListNode(0)
    curr = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2
    return dummy.next
```

---

### 3.3 真题精选

## 17. 两数之和

## 答案

### 核心要点

给定整数数组和目标值，找出和为目标值的两个数的下标。

### 详细说明

使用哈希表：
- 遍历时检查complement是否在哈希表中
- 若在则找到答案，若不在则存入当前位置

### 示例代码

```python
def twoSum(nums: list, target: int) -> list:
    hashmap = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    return []
```

---

## 18. 合并区间

## 答案

### 核心要点

给出一个区间的集合，合并所有重叠的区间。

### 详细说明

- 先按起始位置排序
- 遍历并合并有重叠的区间

### 示例代码

```python
def merge(intervals: list) -> list:
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged
```

---

## 19. 链表中倒数第k个节点

## 答案

### 核心要点

输入一个链表，输出该链表中倒数第k个节点。

### 详细说明

快慢指针法：
- fast先走k步
- 然后slow和fast一起走
- 当fast到达末尾时，slow正好在倒数第k个位置

### 示例代码

```python
def kthToLast(head: ListNode, k: int) -> int:
    slow = head
    fast = head
    for _ in range(k):
        fast = fast.next
    while fast:
        slow = slow.next
        fast = fast.next
    return slow.val
```

---

### 3.4 拓展题库

## 20. 盛水最多的容器

## 答案

### 核心要点

给定高度数组，找出两条线段构成的容器能容纳最多的水。

### 详细说明

双指针从两端向中间移动：
- 宽固定为两端距离
- 高由较短的一边决定
- 每次移动较短那边的指针

### 示例代码

```python
def maxArea(height: list) -> int:
    left, right = 0, len(height) - 1
    max_area = 0
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_area = max(max_area, width * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_area
```

---

## 21. 旋转数组

## 答案

### 核心要点

将数组向右旋转k个位置。

### 详细说明

三次反转法：
- 反转整个数组
- 反转前k个
- 反转后n-k个

### 示例代码

```python
def rotate(nums: list, k: int) -> None:
    k = k % len(nums)
    nums.reverse()
    nums[:k] = reversed(nums[:k])
    nums[k:] = reversed(nums[k:])
```

---

## 四、二叉树

### 4.1 遍历模板

## 22. 二叉树最大深度

## 答案

### 核心要点

给定二叉树，找出其最大深度。

### 详细说明

- 递归：maxDepth(root) = max(maxDepth(root.left), maxDepth(root.right)) + 1
- 也可以用层序遍历（BFS）

### 示例代码

```python
def maxDepth(root: ListNode) -> int:
    if not root:
        return 0
    return max(maxDepth(root.left), maxDepth(root.right)) + 1
```

---

## 23. 验证二叉搜索树

## 答案

### 核心要点

给定二叉树，判断其是否是一个有效的BST。

### 详细说明

利用BST性质：
- 左子树所有节点小于根节点
- 右子树所有节点大于根节点
- 递归时传递min和max边界

### 示例代码

```python
def isValidBST(root: ListNode) -> bool:
    def validate(node, min_val, max_val):
        if not node:
            return True
        if node.val <= min_val or node.val >= max_val:
            return False
        return validate(node.left, min_val, node.val) and validate(node.right, node.val, max_val)
    return validate(root, float('-inf'), float('inf'))
```

---

## 24. 二叉树最近公共祖先

## 答案

### 核心要点

给定二叉树和两个节点，找出这两个节点的最近公共祖先。

### 详细说明

- 如果当前节点等于p或q，返回当前节点
- 递归左右子树
- 如果左右都找到，返回当前节点
- 否则返回非空的那个

### 示例代码

```python
def lowestCommonAncestor(root: ListNode, p: ListNode, q: ListNode) -> ListNode:
    if not root or root == p or root == q:
        return root
    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)
    if left and right:
        return root
    return left or right
```

---

### 4.2 拓展题库

## 25. 路径总和

## 答案

### 核心要点

判断二叉树中是否存在根到叶节点的路径，使得节点值之和等于目标值。

### 详细说明

- 递归减去当前节点值
- 到达叶节点时判断是否等于目标
- 空节点返回False

### 示例代码

```python
def hasPathSum(root: ListNode, targetSum: int) -> bool:
    if not root:
        return False
    if not root.left and not root.right:
        return root.val == targetSum
    return hasPathSum(root.left, targetSum - root.val) or hasPathSum(root.right, targetSum - root.val)
```

---

## 五、DFS与BFS

### 5.1 搜索模板

## 26. 岛屿数量

## 答案

### 核心要点

给定'1'（陆）和'0'（水）的网格，计算岛屿的数量。

### 详细说明

- 遍历每个格子
- 遇到'1'则DFS/BFS标记所有相连的'1'为'0'
- 每发现一个新的'1'岛屿数+1

### 示例代码

```python
def numIslands(grid: list) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0
    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == '0':
            return
        grid[r][c] = '0'
        dfs(r+1, c)
        dfs(r-1, c)
        dfs(r, c+1)
        dfs(r, c-1)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count
```

---

## 27. 克隆图

## 答案

### 核心要点

给定无向图中的一个节点，返回该图的深拷贝。

### 详细说明

BFS + 哈希表：
- 用哈希表存储 visited[node] = clone(node)
- BFS遍历原图，构建新图的边

### 示例代码

```python
def cloneGraph(node: 'Node') -> 'Node':
    if not node:
        return None
    clone = {node: Node(node.val)}
    queue = deque([node])
    while queue:
        cur = queue.popleft()
        for neighbor in cur.neighbors:
            if neighbor not in clone:
                clone[neighbor] = Node(neighbor.val)
                queue.append(neighbor)
            clone[cur].neighbors.append(clone[neighbor])
    return clone[node]
```

---

### 5.2 拓展题库

## 28. 矩阵中的最短路径

## 答案

### 核心要点

给定mxn迷宫，'1'表示障碍，找最短路径长度。

### 详细说明

BFS：
- 从(0,0)开始
- 上下左右四个方向
- 只访问为'0'且未访问的点

### 示例代码

```python
def shortestPath(grid: list) -> int:
    if not grid or grid[0][0] == '1':
        return -1
    rows, cols = len(grid), len(grid[0])
    queue = deque([(0, 0, 1)])
    visited = {(0, 0)}
    directions = [(0,1), (0,-1), (1,0), (-1,0)]
    while queue:
        r, c, dist = queue.popleft()
        if r == rows - 1 and c == cols - 1:
            return dist
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '0' and (nr, nc) not in visited:
                visited.add((nr, nc))
                queue.append((nr, nc, dist + 1))
    return -1
```

---

## 六、回溯算法

### 6.1 回溯模板

## 29. 全排列

## 答案

### 核心要点

给定不含重复数字的数组，返回所有可能的全排列。

### 详细说明

回溯框架：
- 用used数组标记已使用的元素
- 做选择 → 递归 → 撤销选择

### 示例代码

```python
def permute(nums: list) -> list:
    result = []
    def backtrack(path, used):
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack(path, used)
            path.pop()
            used[i] = False
    backtrack([], [False] * len(nums))
    return result
```

---

## 30. 组合总和

## 答案

### 核心要点

给定候选数字和目标值，找出所有和为目标值的组合。

### 详细说明

- 可重复选取同一元素，所以start从i开始
- 剪枝：若target < 0则返回
- 回溯直到target == 0

### 示例代码

```python
def combinationSum(candidates: list, target: int) -> list:
    result = []
    def backtrack(start, path, target):
        if target == 0:
            result.append(path[:])
            return
        if target < 0:
            return
        for i in range(start, len(candidates)):
            backtrack(i, path + [candidates[i]], target - candidates[i])
    backtrack(0, [], target)
    return result
```

---

### 6.2 拓展题库

## 31. 子集

## 答案

### 核心要点

给定整数数组（元素互不相同），返回所有子集。

### 详细说明

- 每个元素都可以选或不选
- 按顺序选择，保持字典序

### 示例代码

```python
def subsets(nums: list) -> list:
    result = []
    def backtrack(start, path):
        result.append(path[:])
        for i in range(start, len(nums)):
            backtrack(i + 1, path + [nums[i]])
    backtrack(0, [])
    return result
```

---

## 32. 括号生成

## 答案

### 核心要点

给定n对括号，生成所有有效的括号组合。

### 详细说明

- 左括号随时可以加
- 右括号必须少于左括号才能加
- 当左右括号都用完时添加到结果

### 示例代码

```python
def generateParenthesis(n: int) -> list:
    result = []
    def backtrack(left, right, path):
        if left == n and right == n:
            result.append(path)
            return
        if left < n:
            backtrack(left + 1, right, path + '(')
        if right < left:
            backtrack(left, right + 1, path + ')')
    backtrack(0, 0, '')
    return result
```

---

## 七、单调栈

### 7.1 单调栈模板

## 33. 柱状图中最大的矩形

## 答案

### 核心要点

给定柱状图高度，计算最大矩形面积。

### 详细说明

单调递增栈：
- 维护一个单调递增的栈
- 当遇到比栈顶小的元素时弹出
- 计算弹出元素能形成的最大矩形

### 示例代码

```python
def largestRectangleArea(heights: list) -> int:
    heights = [0] + heights + [0]
    stack = [0]
    max_area = 0
    for i in range(1, len(heights)):
        while heights[i] < heights[stack[-1]]:
            h = heights[stack.pop()]
            w = i - stack[-1] - 1
            max_area = max(max_area, h * w)
        stack.append(i)
    return max_area
```

---

## 34. 接雨水

## 答案

### 核心要点

给定高度图，计算下雨后能接多少雨水。

### 详细说明

双指针法：
- 从两端向中间收缩
- 维护左右最大高度
- 每次移动较矮那边的指针

### 示例代码

```python
def trap(heights: list) -> int:
    left, right = 0, len(heights) - 1
    left_max, right_max = 0, 0
    water = 0
    while left < right:
        if heights[left] < heights[right]:
            if heights[left] >= left_max:
                left_max = heights[left]
            else:
                water += left_max - heights[left]
            left += 1
        else:
            if heights[right] >= right_max:
                right_max = heights[right]
            else:
                water += right_max - heights[right]
            right -= 1
    return water
```

---

## 八、常见陷阱与技巧

### 8.1 时间复杂度注意

| 操作 | 常见复杂度 |
|------|-----------|
| 数组查找 | O(n)，二分 O(log n) |
| 排序数组操作 | 考虑二分 |
| n层嵌套循环 | 考虑降维 |
| 暴力超时 | 考虑DP或滑动窗口 |

### 8.2 空间复杂度注意
- 尽量使用原地操作
- 二维DP可优化为一维
- 链表问题注意O(1)空间要求

### 8.3 代码规范
- 处理空数组/链表
- 处理边界条件
- 变量命名清晰
- 添加适当注释

---

## 九、备考建议

### 9.1 刷题路线
1. **基础入门**（2-3天）：数组、链表、二叉树遍历
2. **核心算法**（3-4天）：DP、DFS/BFS、回溯
3. **高频真题**（2-3天）：按企业分类刷真题
4. **查漏补缺**（1-2天）：薄弱环节专项练习

### 9.2 推荐资源
- LeetCode Hot 100
- 《剑指Offer》所有题目
- 华为历年机考真题

### 9.3 真题链接
- [2026年4月8日AI选择题真题](https://onefly.top/zero2Leetcode/04_real_interviews/huawei/ai-20260408/index.html)
- [2026年4月15日AI选择题真题](https://onefly.top/zero2Leetcode/04_real_interviews/huawei/ai-20260415/index.html)
- [2026年4月22日AI选择题真题](https://onefly.top/zero2Leetcode/04_real_interviews/huawei/ai-20260422/index.html)
- [2026年4月29日AI选择题真题](https://onefly.top/zero2Leetcode/04_real_interviews/huawei/ai-20260429/index.html)
