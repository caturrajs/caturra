export type SignalSubscriber = () => void;

export class ContextStack {
  static stack: SignalSubscriber[] = [];

  static push(subscriber: SignalSubscriber) {
    return this.stack.push(subscriber);
  }

  static pop() {
    return this.stack.pop();
  }

  static includes(subscriber: SignalSubscriber) {
    return this.stack.includes(subscriber);
  }

  static peek() {
    return this.stack[this.stack.length - 1];
  }
}
