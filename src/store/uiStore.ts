import { makeAutoObservable } from 'mobx';

class UIStore {
  simulateError = false;
  likedCommentIds = new Set<string>();

  constructor() {
    makeAutoObservable(this);
  }

  setSimulateError(value: boolean) {
    this.simulateError = value;
  }

  toggleSimulateError() {
    this.simulateError = !this.simulateError;
  }

  toggleCommentLike(id: string) {
    if (this.likedCommentIds.has(id)) {
      this.likedCommentIds.delete(id);
    } else {
      this.likedCommentIds.add(id);
    }
  }
}

export const uiStore = new UIStore();
