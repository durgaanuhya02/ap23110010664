import { ScoredNotification } from "../types/notification.types";

// ─── Min-Heap for Top-N Priority Notifications ────────────────────────────────
//
// We use a min-heap of size N to efficiently maintain the top N notifications.
// When a new notification arrives:
//   - If heap size < N: push it in
//   - If its score > heap minimum: replace the minimum with the new notification
// This gives O(log N) per insertion and O(N log N) overall — much better than
// sorting all notifications every time new ones arrive.

export class MinHeap {
  private heap: ScoredNotification[] = [];

  private size(): number {
    return this.heap.length;
  }

  private parentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChild(i: number): number {
    return 2 * i + 1;
  }

  private rightChild(i: number): number {
    return 2 * i + 2;
  }

  // Swap two elements in the heap
  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Bubble up after insertion
  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = this.parentIndex(i);
      if (this.heap[parent].score > this.heap[i].score) {
        this.swap(parent, i);
        i = parent;
      } else {
        break;
      }
    }
  }

  // Bubble down after removal
  private bubbleDown(i: number): void {
    const n = this.size();
    while (true) {
      let smallest = i;
      const left = this.leftChild(i);
      const right = this.rightChild(i);

      if (left < n && this.heap[left].score < this.heap[smallest].score) {
        smallest = left;
      }
      if (right < n && this.heap[right].score < this.heap[smallest].score) {
        smallest = right;
      }
      if (smallest !== i) {
        this.swap(i, smallest);
        i = smallest;
      } else {
        break;
      }
    }
  }

  // Insert a new notification into the heap
  push(notification: ScoredNotification): void {
    this.heap.push(notification);
    this.bubbleUp(this.size() - 1);
  }

  // Remove and return the minimum score notification
  pop(): ScoredNotification | undefined {
    if (this.size() === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.size() > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }

  // Peek at the minimum without removing
  peek(): ScoredNotification | undefined {
    return this.heap[0];
  }

  // Return current heap size
  length(): number {
    return this.size();
  }

  // Return all elements sorted by score descending (highest priority first)
  toSortedArray(): ScoredNotification[] {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
}
