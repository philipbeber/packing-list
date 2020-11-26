import _ from "lodash";

let debounceFunc = _.debounce;

export function debounce<T extends (...args: any) => any>(
  func: T,
  wait?: number | undefined,
  options?: _.DebounceSettings | undefined
): _.DebouncedFunc<T> {
  return debounceFunc(func, wait, options);
}

export function setDebounceFunction(
  func: (
    func: (...args: any) => any,
    wait?: number | undefined,
    options?: _.DebounceSettings | undefined
  ) => _.DebouncedFunc<any>
) {
  debounceFunc = func;
}

export function resetDebounceFunction() {
  debounceFunc = _.debounce;
}
