"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/cart-context";
import {
  useOrders,
  type OrderType,
  type PaymentMethod,
} from "@/contexts/order-context";
import {
  Check,
  CreditCard,
  MapPin,
  Truck,
  DollarSign,
  Clock,
  Store,
  QrCode,
  Copy,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

type CheckoutStep = "info" | "payment" | "confirmation" | "pix" | "success";

export function CheckoutModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<CheckoutStep>("info");
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    complement: "",
    instructions: "",
    observation: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);

  const { items, getTotal, clearCart } = useCart();
  const { addOrder, markPixAsPaid } = useOrders();
  const { toast } = useToast();

  const cartTotal = getTotal();

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirmation");
  };

  const sendOrderToApi = async () => {
    try {
      const translatedOrderType = (orderType as string) === "pickup" ? "retirada" : orderType;

      let translatedPaymentMethod: string;
      switch (paymentMethod) {
        case "cash":
          translatedPaymentMethod = "dinheiro";
          break;
        case "credit":
          translatedPaymentMethod = "credito/debito";
          break;
        default:
          translatedPaymentMethod = paymentMethod;
      }

      const orderData = {
        deliveryInfo: {
          name: deliveryInfo.name,
          phone: deliveryInfo.phone,
          address: orderType === "delivery" ? deliveryInfo.address : "",
          complement: orderType === "delivery" ? deliveryInfo.complement : "",
          instructions: deliveryInfo.instructions,
          observation: deliveryInfo.observation,
        },
        orderType: translatedOrderType,
        paymentMethod: translatedPaymentMethod,
        status: "pendente",
        total: cartTotal,
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log(orderData);

      const response = await fetch(
        "https://iurygabriel.com.br/projeto-cardapio/src/api_novo_pedido.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setCurrentOrderId(data.pedidoId);
        return true;
      } else {
        setApiError(data.message || "Erro ao processar o pedido");
        return false;
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      setApiError("Erro de conexão. Tente novamente.");
      return false;
    }
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setApiError(null);

    // Enviar o pedido para a API
    const success = await sendOrderToApi();

    if (success) {
      // Criar o pedido localmente para exibição na interface
      const newOrder = addOrder({
        items: [...items],
        total: cartTotal,
        orderType,
        paymentMethod,
        deliveryInfo: {
          name: deliveryInfo.name,
          phone: deliveryInfo.phone,
          address: orderType === "delivery" ? deliveryInfo.address : undefined,
          complement:
            orderType === "delivery" ? deliveryInfo.complement : undefined,
          instructions: deliveryInfo.instructions,
          observation: deliveryInfo.observation,
        },
      });

      setCurrentOrderId(newOrder.id);

      // Se o método de pagamento for PIX, mostrar a tela de PIX
      if (paymentMethod === "pix") {
        setStep("pix");
      } else {
        // Para outros métodos de pagamento, ir direto para a tela de sucesso
        setStep("success");
        clearCart();
      }
    }

    setIsSubmitting(false);
  };

  const handlePixPaid = async () => {
    try {
      // Aqui você pode adicionar uma chamada à API para atualizar o status do pagamento PIX
      // Por exemplo:
      // await fetch(`https://seu-site.com/api/atualizar-pix.php?pedido=${currentOrderId}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ pago: true })
      // });

      // Simular uma resposta da API
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (currentOrderId) {
        markPixAsPaid(currentOrderId);
      }
      setStep("success");
      clearCart();
    } catch (error) {
      console.error("Erro ao confirmar pagamento PIX:", error);
      toast({
        title: "Erro ao confirmar pagamento",
        description:
          "Seu pedido foi registrado, mas houve um erro ao confirmar o pagamento.",
        variant: "destructive",
      });
    }
  };

  const formatWhatsAppMessage = () => {
    const orderDetails = items
      .map(
        (item) =>
          `${item.quantity}x ${item.name} - R$ ${(
            item.price * item.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    let message = `*Novo Pedido - Sabor Fitness*\n\n`;
    message += `*Cliente:* ${deliveryInfo.name}\n`;
    message += `*Telefone:* ${deliveryInfo.phone}\n\n`;

    if (orderType === "delivery") {
      message += `*Tipo:* Entrega\n`;
      message += `*Endereço:* ${deliveryInfo.address}\n`;
      if (deliveryInfo.complement)
        message += `*Complemento:* ${deliveryInfo.complement}\n`;
    } else {
      message += `*Tipo:* Retirada\n`;
    }

    if (deliveryInfo.instructions) {
      message += `*Instruções:* ${deliveryInfo.instructions}\n`;
    }

    if (deliveryInfo.observation) {
      message += `*Observações do Pedido:* ${deliveryInfo.observation}\n\n`;
    }

    message += `\n*Forma de Pagamento:* ${
      paymentMethod === "credit"
        ? "Cartão (na entrega)"
        : paymentMethod === "pix"
        ? "PIX"
        : "Dinheiro (na entrega)"
    }\n\n`;

    message += `*Itens do Pedido:*\n${orderDetails}\n\n`;
    message += `*Total:* R$ ${cartTotal.toFixed(2)}`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppSend = () => {
    const message = formatWhatsAppMessage();
    window.open(`https://wa.me/5599981036660?text=${message}`, "_blank");
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(
      "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000"
    );
    toast({
      title: "Código PIX copiado!",
      description: "Cole o código no seu aplicativo de banco para pagar.",
    });
  };

  const handleClose = () => {
    if (step === "success") {
      setStep("info");
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && step !== "success") {
          const confirmed = window.confirm(
            "Tem certeza que deseja cancelar o pedido?"
          );
          if (confirmed) {
            setStep("info");
            onOpenChange(false);
          }
        } else {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="sticky top-0 z-10 bg-white pb-2 border-b">
          <DialogTitle>
            {step === "info" && "Informações do Pedido"}
            {step === "payment" && "Forma de Pagamento"}
            {step === "confirmation" && "Confirmar Pedido"}
            {step === "pix" && "Pagamento via PIX"}
            {step === "success" && "Pedido Realizado!"}
          </DialogTitle>
        </DialogHeader>

        {step === "info" && (
          <form
            onSubmit={handleInfoSubmit}
            className="space-y-4 pt-2 overflow-y-auto flex-1"
          >
            <Tabs
              defaultValue="delivery"
              onValueChange={(value) => setOrderType(value as OrderType)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="delivery"
                  className="flex items-center gap-2"
                >
                  <Truck className="h-4 w-4" /> Entrega
                </TabsTrigger>
                <TabsTrigger value="pickup" className="flex items-center gap-2">
                  <Store className="h-4 w-4" /> Retirada
                </TabsTrigger>
              </TabsList>

              <TabsContent value="delivery" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={deliveryInfo.name}
                    onChange={(e) =>
                      setDeliveryInfo({ ...deliveryInfo, name: e.target.value })
                    }
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={deliveryInfo.phone}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        phone: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço completo</Label>
                  <Input
                    id="address"
                    value={deliveryInfo.address}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        address: e.target.value,
                      })
                    }
                    placeholder="Rua, número, bairro, cidade"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento (opcional)</Label>
                  <Input
                    id="complement"
                    value={deliveryInfo.complement}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        complement: e.target.value,
                      })
                    }
                    placeholder="Apto, bloco, referência"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">
                    Instruções para entrega (opcional)
                  </Label>
                  <Textarea
                    id="instructions"
                    value={deliveryInfo.instructions}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        instructions: e.target.value,
                      })
                    }
                    placeholder="Informações adicionais para o entregador"
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observation">
                    Observações do pedido (opcional)
                  </Label>
                  <Textarea
                    id="observation"
                    value={deliveryInfo.observation}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        observation: e.target.value,
                      })
                    }
                    placeholder="Alguma observação sobre o seu pedido (ex: sem cebola, sem pimenta, etc)"
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pickup" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup-name">Nome completo</Label>
                  <Input
                    id="pickup-name"
                    value={deliveryInfo.name}
                    onChange={(e) =>
                      setDeliveryInfo({ ...deliveryInfo, name: e.target.value })
                    }
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickup-phone">Telefone</Label>
                  <Input
                    id="pickup-phone"
                    value={deliveryInfo.phone}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        phone: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickup-instructions">
                    Instruções adicionais (opcional)
                  </Label>
                  <Textarea
                    id="pickup-instructions"
                    value={deliveryInfo.instructions}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        instructions: e.target.value,
                      })
                    }
                    placeholder="Alguma informação adicional para o seu pedido"
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickup-observation">
                    Observações do pedido (opcional)
                  </Label>
                  <Textarea
                    id="pickup-observation"
                    value={deliveryInfo.observation}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        observation: e.target.value,
                      })
                    }
                    placeholder="Alguma observação sobre o seu pedido (ex: sem cebola, sem pimenta, etc)"
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  <h3 className="font-medium flex items-center gap-2">
                    <Store className="h-4 w-4 text-green-600" />
                    Local de Retirada
                  </h3>
                  <p className="text-sm mt-2">
                    Sabor Fitness - Av. Exemplo, 1234, Centro
                    <br />
                    Horário de funcionamento: 19:00 - 22:00
                    <br />
                    Seu pedido estará disponível para retirada em
                    aproximadamente 30 minutos após a confirmação.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continuar para Pagamento
              </Button>
            </div>
          </form>
        )}

        {step === "payment" && (
          <form
            onSubmit={handlePaymentSubmit}
            className="space-y-6 pt-2 overflow-y-auto flex-1"
          >
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-neutral-50">
                <RadioGroupItem value="credit" id="credit" />
                <Label
                  htmlFor="credit"
                  className="flex items-center cursor-pointer flex-1"
                >
                  <CreditCard className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium">Cartão de Crédito/Débito</div>
                    <div className="text-sm text-neutral-500">
                      {orderType === "delivery"
                        ? "Pagamento na entrega"
                        : "Pagamento na retirada"}
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-neutral-50">
                <RadioGroupItem value="pix" id="pix" />
                <Label
                  htmlFor="pix"
                  className="flex items-center cursor-pointer flex-1"
                >
                  <div className="h-5 w-5 mr-3 text-green-600 font-bold">
                    PIX
                  </div>
                  <div>
                    <div className="font-medium">Pix</div>
                    <div className="text-sm text-neutral-500">
                      Pagamento antecipado
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-neutral-50">
                <RadioGroupItem value="cash" id="cash" />
                <Label
                  htmlFor="cash"
                  className="flex items-center cursor-pointer flex-1"
                >
                  <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium">Dinheiro</div>
                    <div className="text-sm text-neutral-500">
                      {orderType === "delivery"
                        ? "Pagamento na entrega"
                        : "Pagamento na retirada"}
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="flex flex-col space-y-2 sticky bottom-0 pt-2 bg-white border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("info")}
              >
                Voltar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Revisar Pedido
              </Button>
            </div>
          </form>
        )}

        {step === "confirmation" && (
          <div className="space-y-6 pt-2 overflow-y-auto flex-1">
            <div className="space-y-4">
              {orderType === "delivery" ? (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium">Endereço de Entrega</h3>
                  </div>
                  <div className="text-sm text-neutral-700">
                    <p className="font-medium">{deliveryInfo.name}</p>
                    <p>{deliveryInfo.phone}</p>
                    <p>{deliveryInfo.address}</p>
                    {deliveryInfo.complement && (
                      <p>{deliveryInfo.complement}</p>
                    )}
                    {deliveryInfo.instructions && (
                      <p className="mt-1 italic text-neutral-500">
                        {deliveryInfo.instructions}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <Store className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium">Retirada no Local</h3>
                  </div>
                  <div className="text-sm text-neutral-700">
                    <p className="font-medium">{deliveryInfo.name}</p>
                    <p>{deliveryInfo.phone}</p>
                    <p>Sabor Fitness - Av. Exemplo, 1234, Centro</p>
                    {deliveryInfo.instructions && (
                      <p className="mt-1 italic text-neutral-500">
                        {deliveryInfo.instructions}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {deliveryInfo.observation && (
                <div className="border rounded-lg p-4 space-y-3 mt-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="font-medium">Observações do Pedido</h3>
                  </div>
                  <p className="text-sm text-neutral-700">
                    {deliveryInfo.observation}
                  </p>
                </div>
              )}

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium">Forma de Pagamento</h3>
                </div>
                <p className="text-sm text-neutral-700">
                  {paymentMethod === "credit" &&
                    `Cartão de Crédito/Débito (${
                      orderType === "delivery" ? "na entrega" : "na retirada"
                    })`}
                  {paymentMethod === "pix" && "Pix (pagamento antecipado)"}
                  {paymentMethod === "cash" &&
                    `Dinheiro (${
                      orderType === "delivery" ? "na entrega" : "na retirada"
                    })`}
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium">
                    {orderType === "delivery"
                      ? "Tempo de Entrega Estimado"
                      : "Tempo de Preparo Estimado"}
                  </h3>
                </div>
                <div className="flex items-center text-sm text-neutral-700">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {orderType === "delivery"
                      ? "30-45 minutos"
                      : "20-30 minutos"}
                  </span>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium">Resumo do Pedido</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center py-2 border-b"
                    >
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-sm">
                            {item.name}
                          </span>
                          <span className="text-sm">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          Qtd: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de entrega</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t mt-2">
                    <span>Total</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{apiError}</p>
              </div>
            )}

            <div className="flex flex-col space-y-2 sticky bottom-0 pt-2 bg-white border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("payment")}
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirmOrder}
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processando..." : "Confirmar Pedido"}
              </Button>
            </div>
          </div>
        )}

        {step === "pix" && (
          <div className="space-y-6 pt-2 overflow-y-auto flex-1">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 border rounded-lg mb-4">
                <div className="bg-neutral-100 p-2 rounded-lg">
                  <QrCode className="h-48 w-48 text-neutral-800" />
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Código PIX</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-green-600"
                      onClick={copyPixCode}
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copiar
                    </Button>
                  </div>
                  <p className="text-xs mt-2 bg-neutral-50 p-2 rounded border overflow-x-auto">
                    00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000
                  </p>
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg border">
                  <h3 className="font-medium text-neutral-800">Instruções:</h3>
                  <ol className="text-sm text-neutral-600 mt-2 space-y-2 list-decimal pl-4">
                    <li>Abra o aplicativo do seu banco</li>
                    <li>Escolha pagar via PIX com QR Code ou código</li>
                    <li>Escaneie o QR Code acima ou cole o código copiado</li>
                    <li>
                      Confirme o pagamento de{" "}
                      <strong>R$ {cartTotal.toFixed(2)}</strong>
                    </li>
                    <li>Após o pagamento, clique em "Já Paguei" abaixo</li>
                  </ol>
                </div>

                <div className="flex flex-col space-y-2 sticky bottom-0 pt-2 bg-white border-t mt-4">
                  <Button
                    onClick={handlePixPaid}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Já Paguei
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleWhatsAppSend}
                    className="flex items-center justify-center gap-2"
                  >
                    Enviar Pedido via WhatsApp{" "}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4 overflow-y-auto flex-1">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="text-xl font-bold text-center">
              Pedido Realizado com Sucesso!
            </h2>

            <p className="text-center text-neutral-600">
              {orderType === "delivery"
                ? "Seu pedido foi recebido e está sendo preparado. Você receberá atualizações sobre o status do seu pedido."
                : "Seu pedido foi recebido e está sendo preparado. Você pode retirá-lo no local quando estiver pronto."}
            </p>

            <div className="bg-neutral-50 p-4 rounded-lg w-full text-center">
              <p className="text-sm text-neutral-500">Tipo do pedido</p>
              <p className="text-lg font-bold flex items-center justify-center gap-2">
                {orderType === "delivery" ? (
                  <>
                    <Truck className="h-5 w-5" /> Entrega
                  </>
                ) : (
                  <>
                    <Store className="h-5 w-5" /> Retirada
                  </>
                )}
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg w-full text-center">
              <p className="text-sm text-neutral-500">
                {orderType === "delivery"
                  ? "Tempo estimado de entrega"
                  : "Tempo estimado de preparo"}
              </p>
              <p className="text-lg font-bold">
                {orderType === "delivery" ? "30-45 minutos" : "20-30 minutos"}
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg w-full text-center">
              <p className="text-sm text-neutral-500">Número do pedido</p>
              <p className="text-lg font-bold">
                #{currentOrderId.substring(0, 8)}
              </p>
            </div>

            <Button
              onClick={handleWhatsAppSend}
              className="bg-green-600 hover:bg-green-700 w-full"
            >
              Enviar Pedido via WhatsApp
            </Button>

            <Button
              onClick={() => {
                setStep("info");
                onOpenChange(false);
              }}
              className="mt-2 w-full"
              variant="outline"
            >
              Voltar ao Cardápio
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
