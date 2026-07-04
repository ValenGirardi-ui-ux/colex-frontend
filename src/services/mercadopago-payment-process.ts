import { fetchMercadoPagoPayment } from "@/src/services/mercadopago-server";
import {
  cancelOrderAfterMercadoPagoPayment,
  fulfillOrderAfterMercadoPagoPayment,
} from "@/src/services/order-payment-server";

export type MercadoPagoReturnStatus = "success" | "pending" | "failure" | "unknown";

export type ProcessMercadoPagoPaymentResult = {
  returnStatus: MercadoPagoReturnStatus;
  orderId: string | null;
  conversationId: string | null;
  mpPaymentId: string | null;
  alreadyPaid: boolean;
  error: string | null;
};

function mapMpStatusToReturn(mpStatus: string): MercadoPagoReturnStatus {
  const status = mpStatus.toLowerCase();
  if (status === "approved") return "success";
  if (status === "pending" || status === "in_process" || status === "in_mediation") return "pending";
  if (
    status === "rejected" ||
    status === "cancelled" ||
    status === "refunded" ||
    status === "charged_back"
  ) {
    return "failure";
  }
  return "unknown";
}

/** Consulta el pago en MP y actualiza la orden (idempotente). Usado por webhook y URL de retorno. */
export async function processMercadoPagoPaymentById(
  paymentId: string,
): Promise<ProcessMercadoPagoPaymentResult> {
  const { payment, error } = await fetchMercadoPagoPayment(paymentId);
  if (error || !payment) {
    return {
      returnStatus: "unknown",
      orderId: null,
      conversationId: null,
      mpPaymentId: paymentId,
      alreadyPaid: false,
      error: error ?? "No se pudo consultar el pago.",
    };
  }

  const orderId = payment.external_reference?.trim() ?? null;
  const mpPaymentId = String(payment.id);
  const returnStatus = mapMpStatusToReturn(payment.status);

  if (!orderId) {
    return {
      returnStatus,
      orderId: null,
      conversationId: null,
      mpPaymentId,
      alreadyPaid: false,
      error: null,
    };
  }

  if (returnStatus === "success") {
    const result = await fulfillOrderAfterMercadoPagoPayment(orderId, mpPaymentId);
    return {
      returnStatus: "success",
      orderId,
      conversationId: result.conversationId,
      mpPaymentId,
      alreadyPaid: result.alreadyPaid,
      error: result.ok || result.alreadyPaid ? null : result.error,
    };
  }

  if (returnStatus === "failure") {
    await cancelOrderAfterMercadoPagoPayment(orderId, mpPaymentId);
    return {
      returnStatus: "failure",
      orderId,
      conversationId: null,
      mpPaymentId,
      alreadyPaid: false,
      error: null,
    };
  }

  return {
    returnStatus,
    orderId,
    conversationId: null,
    mpPaymentId,
    alreadyPaid: false,
    error: null,
  };
}
