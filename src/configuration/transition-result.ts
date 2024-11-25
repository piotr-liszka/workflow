export class TransitionResult {
  constructor(
    public status: boolean,
    public reason?: string,
  ) {}

  isSuccessful(): boolean {
    return this.status;
  }
}
