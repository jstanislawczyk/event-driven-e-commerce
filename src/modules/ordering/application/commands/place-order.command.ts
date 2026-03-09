export interface PlaceOrderCommand {
  orderId: string;
  customerId: string;
  items: OrderItem[];
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}
