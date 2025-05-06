import AcpClient from "./acpClient";
import { AcpJobPhases } from "./acpContractClient";
import AcpMemo from "./acpMemo";

class AcpJob {
  constructor(
    private acpClient: AcpClient,
    public id: number,
    public providerAddress: string,
    public memos: AcpMemo[],
    public phase: string
  ) {}

  async pay(amount: number) {
    const memo = this.memos.find(
      (m) => m.nextPhase === AcpJobPhases.NEGOTIOATION
    );

    if (!memo) {
      throw new Error("No transaction memo found");
    }

    return await this.acpClient.payJob(this.id, amount);
  }

  async respond(accept: boolean, reason?: string) {
    const memo = this.memos.find(
      (m) => m.nextPhase === AcpJobPhases.NEGOTIOATION
    );

    if (!memo) {
      throw new Error("No negotiation memo found");
    }

    return await this.acpClient.respondJob(memo.id, accept, reason);
  }

  async deliver(deliverable: string) {
    const memo = this.memos.find(
      (m) => m.nextPhase === AcpJobPhases.TRANSACTION
    );

    if (!memo) {
      throw new Error("No transaction memo found");
    }

    return await this.acpClient.deliverJob(this.id, deliverable);
  }

  async evaluate(accept: boolean, reason?: string) {
    const memo = this.memos.find((m) => m.nextPhase === AcpJobPhases.COMPLETED);

    if (!memo) {
      throw new Error("No evaluation memo found");
    }

    return await this.acpClient.acpContractClient.signMemo(
      memo.id,
      accept,
      reason
    );
  }
}

export default AcpJob;
