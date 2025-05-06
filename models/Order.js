
const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    selectedSize: { type: String, required: true },
    selectedColor: { type: String, required: true }
  }, { _id: true });


const OrderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    addressId: { type: Schema.Types.ObjectId, required: true },
    items: { type: [OrderItemSchema], required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    total: { type: Number, required: true },
    vat: { type: Number, required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    orderDate: { type: Date, default: Date.now }
  });

export const Order = model("Order", OrderSchema)
export const OrderItem = model("OrderItem", OrderItemSchema)