let timer: NodeJS.Timeout | number | undefined;

// Simple debounce function which works well with jest.advanceTimersByTime
// (lodash debounce does not)
export function debounce<T extends (...args: any) => any>(
  func: T,
  wait: number,
) {
  return (...args: any) => {
    if (!timer) {
      timer = setTimeout(() => {
        timer = undefined;
        func(...args);
      }, wait);
    }
  };
}
