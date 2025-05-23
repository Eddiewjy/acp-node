import { Address } from "viem";
import AcpClient from "./acpClient";
import Ajv from "ajv";

class AcpJobOffering {
  private ajv: Ajv;

  constructor(
    private readonly acpClient: AcpClient,
    public providerAddress: Address,
    public type: string,
    public price: number,
    public requirementSchema?: Object
  ) {
    this.ajv = new Ajv({ allErrors: true });
  }

  async initiateJob(
    serviceRequirement: Object | string,
    amount: number,
    evaluatorAddress?: Address,
    expiredAt: Date = new Date(Date.now() + 1000 * 60 * 60 * 24) // default: 1 day
  ) {
    if (this.requirementSchema) {
      const validator = this.ajv.compile(this.requirementSchema);
      const valid = validator(serviceRequirement);

      if (!valid) {
        throw new Error(this.ajv.errorsText(validator.errors));
      }
    }

    return await this.acpClient.initiateJob(
      this.providerAddress,
      serviceRequirement,
      amount,
      evaluatorAddress,
      expiredAt
    );
  }
}

export default AcpJobOffering;
