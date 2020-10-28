import _ from "lodash";
import { applyOperationToCamp, Camp } from "./camp";
import { CampOperation } from "./campOperations";

export class CampStore {
  current: Camp;
  server?: Camp;
  lastServerOperation: number = 0;
  operations: CampOperation[] = [];
  operationsStartIndex = 0;
  lazySynchronize = _.debounce(this.synchronize.bind(this), 2000);
  synchronizing = false;

  constructor(camp: Camp) {
    this.current = camp;
  }

  applyUserOperation(operation: CampOperation) {
    this.operations.push(operation);
    this.current = applyOperationToCamp(this.current, operation);
    this.lazySynchronize();
  }

  async synchronize() {
    if (this.synchronizing) {
      this.lazySynchronize();
      return;
    }

    this.synchronizing = true;
  }
}
