
interface IApp {
  name: string;
  logo: string;
}

interface IUser {
  name: string;
  email: string;
  phone: string;
  isPrime: boolean;
}


interface ICart {
  count: number;
  items: Array<object>;
}

interface IPrice  {
  price: number;
  oldPrice: number;
  discountStr: string;
  discountedAmount: string;
  discounts: Array;
  isPrimeDiscount: boolean;
}

interface IItem {
  id: string;
  name: string;
  image: string;
  images: Array<string>;
  purchaseCount: number;
  reviewCount: number;
  rating: number;
  ratings: object;

  stock: number;
  variants: Array<object>;
  wishId: number;

  shortDescription: string;
  description: string;
  specification: string;

  hasStock: boolean;
  lowStockAlert: boolean;

  unit: string;
  isPack: number;
  minOrderQty: number;
  maxOrderQty: number;
  qtyPerSlice: number;

  tags: Array<string>;

  price: IPrice;

  canPurchase: boolean,
  errorReason: string,
  inCart: number;

  timeSlotId: number;
  deliverySlot: boolean|{from: string, to: string}
}

interface ICartItem {
  id: string,
  item: IItem;
  qty: string;
  totalAmount: number;
  totalDiscount: number;
}

interface ICartTotal {
  subTotal: number;
  totalDiscount: number;
  deliveryCharge: number;
  couponDiscount: number;
  grandTotal: number;
}

interface IDeliveryLocation {
  isDeliverable: boolean;
  location: {
    name: string;
    pincode: string;
  };
  fee: number;
}

interface IDeliveryTimeSlot {
  isAvailable: boolean;
  currentSlot: ITimeSlot | null;
  nextSlot: ITimeSlot | null,
  slots: Array<ITimeSlot>
}

interface ICouponDetails {
  coupon: {
    id: number;
    code: string;
  };
  status: string;
  discountAmount: number;
}

interface IOrderSummary {
  pricingDetails: ICartTotal;
  couponDetails: ICouponDetails;
  timeSlot: IDeliveryTimeSlot;
  locationDetails: IDeliveryLocation;
  items: Array<ICartItem>;
}

interface ITimeSlot {
  from: string;
  to: string;
}

interface ICategory {
  id: string;
  name: string;
  image: string;
  items: Array<IItem>|null
}

interface IDashboard {
  banners: Array<{image: string}>;
  categories: Array<ICategory>
  featuredItems: Array<IItem>;
  popularItems: Array<IItem>;
  categorySamples: Array<ICategory>
}

interface IContact {
  type: string;
  value: string;
  icon: string;
  url: string;
}

interface ICompany {
  name: string;
  contact: Array<IContact>
}

interface IAddress {
  id: number;
  name: string;
  email: string;
  phone: string;
  street: string;
  address1: string;
  address2: string;
  landmark: string;
  city: string;
  pincode: string;
}

interface IOrderCheckout {
  deliveryAddress: IAddress,
  deliveryType: string,
  deliveryCharge: number,
  paymentType: object,
  items: Array<IItem>,
}


interface IWidget {
  title: IWidgetTitle;
  padding: string;
  breakpoints: Array<any>;
  pagination: boolean;
  autoplay: boolean;
  loop: boolean;
  item: IWidgetItem;
  defaultTitle: Array<string>
}

interface IWidgetItem {
  type: string,
  title: IWidgetItemTitle,
  subtitle: IWidgetItemTitle,
  position: WidgetItemPosition,
  overlay: boolean;
  bordered: boolean;
  corner: string;
}

interface IWidgetItemTitle {
  color: string;
  align: string;
}

interface IWidgetTitle {
  title: string,
  color: string,
  align: string,
  btn: {
    label: string,
    unelevated: boolean,
    color: string,
    to: string
  }
}

enum WidgetItemPosition {
  'top', 'bottom', 'center', 'below'
}
