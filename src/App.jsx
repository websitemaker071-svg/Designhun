import React, { useState, useEffect } from "react";
import {
  Gift, ShoppingBag, Globe, ChevronRight, ChevronLeft, Check, CheckCircle2,
  Truck, Package, Home as HomeIcon, Mail, X, Plus, Minus, Sparkles, Heart,
  Lock, Menu, Watch, Users, Star, MapPin, RefreshCw, LogOut, Flower2, Gem,
  ClipboardList, Loader2
} from "lucide-react";
import {
  onAuthStateChanged, signInWithPopup, signInAnonymously, signOut as firebaseSignOut,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase.js";

/* ============================== BRAND DATA ============================== */

const CONTACT_EMAIL = "designhub370@gmail.com";
const ADMIN_PASSCODE = "DESIGNHUBGUPTAJIMKTJ";

// Fill these in after creating a free account at https://www.emailjs.com
// to make new orders land in the Gmail inbox automatically. Until then,
// orders are still safely recorded and visible on the Orders Dashboard.
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

const PACKAGES = {
  mens: {
    icon: Watch,
    accent: "teal",
    tiers: [
      { price: 150, items: ["1 Website"] },
      { price: 300, items: ["1 Website", "1 Necklace OR Digital Album (10 Photos) — your choice"] },
      { price: 600, items: ["1 Website", "1 Boy's Necklace", "1 Digital Album (20 Photos)", "1 Chocolate", "1 Reel Edit"] },
      { price: 1200, items: ["1 Boy's Necklace", "1 Watch", "1 Perfume", "5 Reel Edits", "1 Digital Album (30 Photos)", "1 Chocolate", "1 Boy's Bracelet", "1 Website"] },
      { price: 2500, items: ["1 Boy's Necklace", "1 Watch", "1 Perfume", "10 Reel Edits", "1 Digital Album (40 Photos)", "1 Chocolate", "1 Boy's Bracelet", "1 Website", "1 Wallet", "1 Coffee Cup", "1 Pair of Shoes", "1 Ring", "1 Cap"] },
    ],
  },
  womens: {
    icon: Gem,
    accent: "rose",
    tiers: [
      { price: 150, items: ["1 Website"] },
      { price: 300, items: ["1 Website", "1 Necklace OR Digital Album (10 Photos) — your choice"] },
      { price: 600, items: ["1 Website", "1 Necklace", "1 Digital Album (20 Photos)", "1 Chocolate", "1 Reel Edit"] },
      { price: 1200, items: ["1 Necklace", "1 Watch", "1 Lipstick", "5 Reel Edits", "1 Digital Album (30 Photos)", "1 Chocolate", "1 Pair of Earrings", "1 Website"] },
      { price: 2500, items: ["1 Necklace", "1 Watch", "1 Lipstick", "10 Reel Edits", "1 Digital Album (40 Photos)", "1 Chocolate", "1 Pair of Earrings", "1 Website", "1 Purse", "2 Nail Paints (your favourite colour)", "1 Pair of Shoes", "1 Ring", "1 Hair Clutcher", "1 Mini Diary", "1 Mini Mirror"] },
    ],
  },
  family: {
    icon: Users,
    accent: "marigold",
    tiers: [
      { price: 150, items: ["1 Website"] },
      { price: 300, items: ["1 Website", "1 Rainbow Scratch Paper Note", "1 Digital Album (20 Photos)"] },
      { price: 600, items: ["1 Website", "1 Rainbow Scratch Paper Note", "1 Digital Album (30 Photos)", "1 Women's Watch", "1 Men's Watch", "2 Reel Edits"] },
      { price: 1200, items: ["1 Website", "1 Rainbow Scratch Paper Note", "1 Digital Album (40 Photos)", "1 Women's Watch", "1 Men's Watch", "1 Cup", "5 Reel Edits", "1 Jumbo Happy Home Building Block Set", "1 Lunch Box"] },
      { price: 2500, items: ["1 Website", "1 Rainbow Scratch Paper Note", "1 Digital Album (50 Photos)", "1 Women's Watch", "1 Men's Watch", "1 Cup", "10 Reel Edits", "1 Jumbo Happy Home Building Block Set", "1 Lunch Box", "1 Massager Gun", "1 Keychain", "1 Chocolate"] },
    ],
  },
};

const CATEGORY_META = {
  mens: { textClass: "dh-teal", bgClass: "dh-teal-bg", softClass: "dh-teal-soft" },
  womens: { textClass: "dh-rose", bgClass: "dh-rose-bg", softClass: "dh-rose-soft" },
  family: { textClass: "dh-marigold", bgClass: "dh-marigold-bg", softClass: "dh-marigold-soft" },
};

const SINGLE_ITEMS = [
  { id: "rose-bouquet", icon: Flower2, min: 3000, max: 6000, step: 1000, nameKey: "itemRoseBouquet" },
  { id: "melody-choc", icon: Heart, min: 100, max: 500, step: 100, nameKey: "itemMelodyChoc" },
  { id: "gift-hamper", icon: Package, min: 2500, max: 4000, step: 500, nameKey: "itemGiftHamper" },
  { id: "kitkat-bouquet", icon: Gift, min: 1500, max: 3500, step: 500, nameKey: "itemKitkatBouquet" },
];

/* ============================== TRANSLATIONS ============================== */

const T = {
  hinglish: {
    brand: "Design Hub", tagline: "Har rishtey ko banayein aur bhi khaas",
    signupHeading: "Shuru Karein", signupSub: "Account banayein aur gifting shuru karein",
    continueGoogle: "Google se Continue Karein", orDivider: "ya apni details se",
    fullNamePh: "Poora Naam", emailPh: "Email Address", phonePh: "Phone Number",
    signUpBtn: "Sign Up Karein", quickSignupTitle: "Google Sign Up",
    quickSignupSub: "Naam aur email daalein, aage badhne ke liye",
    googleModalContinue: "Continue Karein",
    chooseLangHeading: "Apni Bhasha Chunein", chooseLangSub: "Website kis bhasha mein dekhna pasand karenge?",
    hinglishLabel: "Hindilish", hinglishDesc: "Hindi + English mix mein",
    englishLabel: "English", englishDesc: "Pure English mein", continueBtn: "Aage Badhein",
    navHome: "Home", navBouquets: "Bouquets", navCart: "Cart", navOrders: "Orders",
    heroTitle: "Pyaar Bhare Pal,", heroTitle2: "Yaadgar Gifts",
    heroSub: "Personalised gift packages, bouquets aur hampers — har khaas rishtey ke liye",
    catMensTitle: "Men's Special", catWomensTitle: "Women's Special", catFamilyTitle: "Family Special",
    catMensDesc: "Uske liye khaas packages", catWomensDesc: "Uski smile ke liye special packages",
    catFamilyDesc: "Pura parivar, ek saath khushiyan", viewPackagesBtn: "Packages Dekhein",
    bouquetsHeading: "Bouquets & Gift Hampers", bouquetsSub: "Fresh bouquets aur curated hampers, har occasion ke liye",
    startingFrom: "se shuru", selectPriceLabel: "Price Chunein", addToCartBtn: "Cart mein Daalein",
    addedBtn: "Cart mein Daal Diya", customCardTitle: "Kuch Alag Chahiye?",
    customCardDesc: "Apni pasand ka bouquet ya hamper customise karwayein",
    requestCustomBtn: "Custom Design Request Karein", customModalTitle: "Custom Order Request",
    itemTypeLabel: "Item Type", occasionLabel: "Occasion", occasionPh: "Jaise: Anniversary, Birthday...",
    budgetLabel: "Aapka Budget (₹)", budgetPh: "Jaise: 3500", messageLabel: "Details / Message",
    messagePh: "Colour, flavour, ya koi khaas baat likhein", submitCustomBtn: "Request Bhejein",
    cancelBtn: "Cancel", tierPackageLabel: "Package", backBtn: "Wapas",
    cartHeading: "Aapka Cart", cartEmpty: "Cart abhi khaali hai", cartEmptyCta: "Shopping Shuru Karein",
    removeBtn: "Remove", totalLabel: "Total", proceedCheckoutBtn: "Checkout Karein",
    checkoutHeading: "Checkout", nameLabel: "Naam", emailLabel: "Email", phoneLabel: "Phone Number",
    addressLabel: "Delivery Address", addressPh: "Poora address likhein (ghar/flat no., area, city, pincode)",
    notesLabel: "Special Instructions (optional)",
    notesPh: "Photos baad mein email/WhatsApp par bhej sakte hain. Koi khaas message likhna ho toh yahan likhein",
    orderSummary: "Order Summary", reviewOrderBtn: "Order Review Karein", placeOrderBtn: "Order Place Karein", placingOrder: "Order Place ho raha hai...",
    reviewHeading: "Order Confirm Karein", reviewSub: "Order place karne se pehle ek baar details check kar lein",
    confirmOrderBtn: "Order Confirm Karein",
    confirmHeading: "Order Place Ho Gaya!", confirmSub: "Dhanyawaad! Aapka order humein mil gaya hai.",
    orderIdLabel: "Order ID", queryHelpText: "Kisi bhi sawaal ya doubt ke liye email karein",
    viewOrdersBtn: "Mere Orders Dekhein", continueShoppingBtn: "Shopping Jaari Rakhein",
    myOrdersHeading: "Mere Orders", noOrdersText: "Abhi tak koi order nahi hai",
    noOrdersCta: "Shopping Shuru Karein", orderDate: "Order Date", orderTotal: "Total",
    statusPlaced: "Order Placed", statusOutForDelivery: "Out for Delivery", statusDelivered: "Delivered",
    adminLoginHeading: "Business Login", passcodeLabel: "Passcode", passcodePh: "Apna passcode daalein",
    loginBtn: "Login Karein", wrongPasscode: "Galat passcode, dubara try karein",
    adminDashHeading: "Orders Dashboard", refreshBtn: "Refresh", logoutBtn: "Logout",
    totalOrdersLabel: "Total Orders", pendingLabel: "Pending", deliveredLabel: "Delivered",
    customerLabel: "Customer", itemsLabel: "Items", markOutForDeliveryBtn: "Out for Delivery Mark Karein",
    markDeliveredBtn: "Delivered Mark Karein", noOrdersYetAdmin: "Abhi tak koi order nahi aaya",
    footerQueryText: "Sawaal ya doubt ho toh email karein:", loadingText: "Load ho raha hai...",
    signOut: "Sign Out", required: "Yeh field zaroori hai",
    itemRoseBouquet: "Rose Bouquet", itemMelodyChoc: "Melody Chocolate Bouquet",
    itemGiftHamper: "Gift Hamper", itemKitkatBouquet: "KitKat Bouquet",
    yourOrderTag: "Design Hub se, khaas aapke liye",
  },
  english: {
    brand: "Design Hub", tagline: "Making every relationship extra special",
    signupHeading: "Get Started", signupSub: "Create your account and start gifting",
    continueGoogle: "Continue with Google", orDivider: "or with your details",
    fullNamePh: "Full Name", emailPh: "Email Address", phonePh: "Phone Number",
    signUpBtn: "Sign Up", quickSignupTitle: "Google Sign Up",
    quickSignupSub: "Enter your name and email to continue",
    googleModalContinue: "Continue",
    chooseLangHeading: "Choose Your Language", chooseLangSub: "Which language would you like to browse in?",
    hinglishLabel: "Hindilish", hinglishDesc: "A mix of Hindi + English",
    englishLabel: "English", englishDesc: "Pure English", continueBtn: "Continue",
    navHome: "Home", navBouquets: "Bouquets", navCart: "Cart", navOrders: "Orders",
    heroTitle: "Moments of Love,", heroTitle2: "Gifts to Remember",
    heroSub: "Personalised gift packages, bouquets and hampers — for every special relationship",
    catMensTitle: "Men's Special", catWomensTitle: "Women's Special", catFamilyTitle: "Family Special",
    catMensDesc: "Special packages for him", catWomensDesc: "Special packages for her smile",
    catFamilyDesc: "The whole family, happy together", viewPackagesBtn: "View Packages",
    bouquetsHeading: "Bouquets & Gift Hampers", bouquetsSub: "Fresh bouquets and curated hampers, for every occasion",
    startingFrom: "onwards", selectPriceLabel: "Select Price", addToCartBtn: "Add to Cart",
    addedBtn: "Added to Cart", customCardTitle: "Want Something Different?",
    customCardDesc: "Get a fully customised bouquet or hamper made",
    requestCustomBtn: "Request Custom Design", customModalTitle: "Custom Order Request",
    itemTypeLabel: "Item Type", occasionLabel: "Occasion", occasionPh: "E.g., Anniversary, Birthday...",
    budgetLabel: "Your Budget (₹)", budgetPh: "E.g., 3500", messageLabel: "Details / Message",
    messagePh: "Colour, flavour, or anything specific", submitCustomBtn: "Send Request",
    cancelBtn: "Cancel", tierPackageLabel: "Package", backBtn: "Back",
    cartHeading: "Your Cart", cartEmpty: "Your cart is empty", cartEmptyCta: "Start Shopping",
    removeBtn: "Remove", totalLabel: "Total", proceedCheckoutBtn: "Proceed to Checkout",
    checkoutHeading: "Checkout", nameLabel: "Name", emailLabel: "Email", phoneLabel: "Phone Number",
    addressLabel: "Delivery Address", addressPh: "Full address (house/flat no., area, city, pincode)",
    notesLabel: "Special Instructions (optional)",
    notesPh: "You can share photos later via email/WhatsApp. Add any special note here",
    orderSummary: "Order Summary", reviewOrderBtn: "Review Order", placeOrderBtn: "Place Order", placingOrder: "Placing your order...",
    reviewHeading: "Confirm Your Order", reviewSub: "Please check your details once before the order is placed",
    confirmOrderBtn: "Confirm Order",
    confirmHeading: "Order Placed!", confirmSub: "Thank you! We've received your order.",
    orderIdLabel: "Order ID", queryHelpText: "For any questions or doubts, email us at",
    viewOrdersBtn: "View My Orders", continueShoppingBtn: "Continue Shopping",
    myOrdersHeading: "My Orders", noOrdersText: "You haven't placed any orders yet",
    noOrdersCta: "Start Shopping", orderDate: "Order Date", orderTotal: "Total",
    statusPlaced: "Order Placed", statusOutForDelivery: "Out for Delivery", statusDelivered: "Delivered",
    adminLoginHeading: "Business Login", passcodeLabel: "Passcode", passcodePh: "Enter your passcode",
    loginBtn: "Login", wrongPasscode: "Incorrect passcode, please try again",
    adminDashHeading: "Orders Dashboard", refreshBtn: "Refresh", logoutBtn: "Logout",
    totalOrdersLabel: "Total Orders", pendingLabel: "Pending", deliveredLabel: "Delivered",
    customerLabel: "Customer", itemsLabel: "Items", markOutForDeliveryBtn: "Mark Out for Delivery",
    markDeliveredBtn: "Mark Delivered", noOrdersYetAdmin: "No orders yet",
    footerQueryText: "For queries, email us at:", loadingText: "Loading...",
    signOut: "Sign Out", required: "This field is required",
    itemRoseBouquet: "Rose Bouquet", itemMelodyChoc: "Melody Chocolate Bouquet",
    itemGiftHamper: "Gift Hamper", itemKitkatBouquet: "KitKat Bouquet",
    yourOrderTag: "From Design Hub, made for you",
  },
};

/* ============================== HELPERS ============================== */

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function genOrderId() {
  const n = Date.now().toString().slice(-7);
  const r = Math.floor(Math.random() * 90 + 10);
  return "DH" + n + r;
}

async function notifyOrderByEmail(order) {
  if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID.indexOf("YOUR_") === 0) return;
  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: CONTACT_EMAIL,
          order_id: order.id,
          customer_name: order.customer.name,
          customer_email: order.customer.email,
          customer_phone: order.customer.phone,
          address: order.address,
          items: order.items.map(function (i) { return i.name + " x" + i.qty + " - " + formatINR(i.price); }).join(", "),
          total: formatINR(order.total),
          notes: order.notes || "-",
        },
      }),
    });
  } catch (e) {
    // silent - order is already saved regardless of email notification
  }
}

/* ============================== SMALL COMPONENTS ============================== */

function GoogleIcon({ size }) {
  const s = size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.2 3 9.5 7.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.8 14.2-5l-6.6-5.4C29.6 36 26.9 37 24 37c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.4 40.6 16.1 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.4C41.5 35.6 45 30.4 45 24c0-1.4-.1-2.5-.4-3.5z" />
    </svg>
  );
}

function TagHole({ className }) {
  return (
    <div
      className={"w-2.5 h-2.5 rounded-full dh-void " + (className || "")}
      style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.45)" }}
    />
  );
}

function Spinner({ light }) {
  return <Loader2 size={18} className={"animate-spin " + (light ? "text-white" : "dh-gold")} />;
}

function StatusStepper({ status, t }) {
  const steps = [
    { key: "placed", label: t.statusPlaced, icon: ClipboardList },
    { key: "outfordelivery", label: t.statusOutForDelivery, icon: Truck },
    { key: "delivered", label: t.statusDelivered, icon: CheckCircle2 },
  ];
  const order = ["placed", "outfordelivery", "delivered"];
  const currentIdx = order.indexOf(status);
  return (
    <div className="flex items-start w-full mt-3">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const active = i <= currentIdx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: "64px" }}>
              <div className={"w-7 h-7 rounded-full flex items-center justify-center " + (active ? "dh-gold-bg" : "bg-stone-200")}>
                <Icon size={14} className={active ? "dh-ink" : "text-stone-400"} />
              </div>
              <span className={"text-xs mt-1 text-center leading-tight dh-sans " + (active ? "dh-ink font-medium" : "text-stone-400")}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={"flex-1 mt-3 h-0.5 " + (i < currentIdx ? "dh-gold-bg" : "bg-stone-200")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PackageTierCard({ tier, t, accent, onAdd, added }) {
  return (
    <div className="dh-paper rounded-2xl shadow-lg p-5 mb-4 relative">
      <TagHole className="absolute -top-1 left-6" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold dh-ink dh-serif">{formatINR(tier.price)}</span>
        <span className={"text-xs px-2.5 py-1 rounded-full font-medium dh-sans " + CATEGORY_META[accent].softClass + " " + CATEGORY_META[accent].textClass}>
          {t.tierPackageLabel}
        </span>
      </div>
      <ul className="space-y-1.5 mb-4">
        {tier.items.map(function (item, idx) {
          return (
            <li key={idx} className="flex items-start text-sm dh-ink dh-sans opacity-90">
              <Check size={14} className="dh-gold mt-0.5 mr-2 flex-shrink-0" />
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
      <button
        onClick={function () { onAdd(tier); }}
        className={"w-full py-2.5 rounded-xl font-medium text-sm dh-sans transition active:opacity-80 " + (added ? "bg-stone-200 dh-ink" : "dh-gold-bg dh-ink")}
      >
        {added ? t.addedBtn : t.addToCartBtn}
      </button>
    </div>
  );
}

function Header({ t, lang, setLang, cartCount, onCart, onOrders, onHome, onAdmin }) {
  return (
    <div
      className="sticky top-0 z-30 dh-void px-4 py-3 flex items-center justify-between"
      style={{ borderBottom: "1px solid rgba(205,161,83,0.25)" }}
    >
      <button onClick={onHome} className="flex items-center gap-1.5">
        <Gift size={20} className="dh-gold" />
        <span className="dh-serif-i text-lg" style={{ color: "#F1E6DA" }}>{t.brand}</span>
      </button>
      <div className="flex items-center gap-3">
        <button
          onClick={function () { setLang(lang === "hinglish" ? "english" : "hinglish"); }}
          className="flex items-center gap-1 text-xs dh-sans px-2 py-1 rounded-full"
          style={{ color: "#F1E6DA", border: "1px solid rgba(205,161,83,0.4)" }}
        >
          <Globe size={12} />
          {lang === "hinglish" ? "EN" : "हि"}
        </button>
        <button onClick={onOrders} className="relative" aria-label="orders">
          <ClipboardList size={20} style={{ color: "#F1E6DA" }} />
        </button>
        <button onClick={onCart} className="relative" aria-label="cart">
          <ShoppingBag size={20} style={{ color: "#F1E6DA" }} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 dh-gold-bg dh-ink text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
        <button onClick={onAdmin} className="opacity-40" aria-label="business login">
          <Lock size={15} style={{ color: "#F1E6DA" }} />
        </button>
      </div>
    </div>
  );
}

function BottomNav({ t, screen, onHome, onBouquets, onCart, onOrders, cartCount }) {
  const items = [
    { key: "home", label: t.navHome, icon: HomeIcon, onClick: onHome },
    { key: "singleItems", label: t.navBouquets, icon: Flower2, onClick: onBouquets },
    { key: "cart", label: t.navCart, icon: ShoppingBag, onClick: onCart },
    { key: "myOrders", label: t.navOrders, icon: ClipboardList, onClick: onOrders },
  ];
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 dh-void flex justify-center"
      style={{ borderTop: "1px solid rgba(205,161,83,0.25)" }}
    >
      <div className="w-full flex" style={{ maxWidth: "448px" }}>
        {items.map(function (it) {
          const Icon = it.icon;
          const active = screen === it.key;
          return (
            <button key={it.key} onClick={it.onClick} className="flex-1 flex flex-col items-center py-2.5 relative">
              {it.key === "cart" && cartCount > 0 && (
                <span className="absolute top-1 right-1/4 dh-gold-bg dh-ink text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
              <Icon size={19} className={active ? "dh-gold" : "text-stone-500"} />
              <span className={"text-xs mt-1 dh-sans " + (active ? "dh-gold font-medium" : "text-stone-500")}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== MAIN APP ============================== */

export default function App() {
  const [screen, setScreen] = useState("signup");
  const [lang, setLang] = useState("hinglish");
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [addedFlash, setAddedFlash] = useState({});

  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [checkoutForm, setCheckoutForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupErr, setSignupErr] = useState("");

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customType, setCustomType] = useState("rose-bouquet");
  const [customOccasion, setCustomOccasion] = useState("");
  const [customBudget, setCustomBudget] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  const [selectedPrices, setSelectedPrices] = useState({});

  const [passcodeInput, setPasscodeInput] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminOrders, setAdminOrders] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const t = T[lang];

  useEffect(function () {
    const unsub = onAuthStateChanged(auth, async function (fbUser) {
      if (fbUser) {
        try {
          const ref = doc(db, "users", fbUser.uid);
          const snap = await getDoc(ref);
          let profile;
          if (snap.exists()) {
            profile = snap.data();
          } else {
            profile = { name: fbUser.displayName || "", email: fbUser.email || "", phone: "" };
            await setDoc(ref, profile);
          }
          setUser({ uid: fbUser.uid, name: profile.name || "", email: profile.email || "", phone: profile.phone || "" });
          setCheckoutForm(function (f) { return { ...f, name: profile.name || "", email: profile.email || "", phone: profile.phone || "" }; });
          if (profile.lang) {
            setLang(profile.lang);
            setScreen("home");
          } else {
            setScreen("language");
          }
        } catch (e) {
          console.error("auth boot failed:", e);
        }
      } else {
        setUser(null);
        setScreen("signup");
      }
      setBooting(false);
    });
    return function () { unsub(); };
  }, []);

  function goHome() { setScreen("home"); }

  function openCategory(cat) { setActiveCategory(cat); setScreen("category"); }

  function addPackageToCart(cat, tier) {
    const line = {
      cartItemId: Date.now() + "-" + Math.random(),
      kind: "package",
      category: cat,
      name: t["cat" + cat.charAt(0).toUpperCase() + cat.slice(1) + "Title"],
      price: tier.price,
      qty: 1,
      details: tier.items.join(", "),
    };
    setCart(function (c) { return [...c, line]; });
    const key = cat + "-" + tier.price;
    setAddedFlash(function (a) { return { ...a, [key]: true }; });
    setTimeout(function () { setAddedFlash(function (a) { return { ...a, [key]: false }; }); }, 1500);
  }

  function addSingleItemToCart(item) {
    const price = selectedPrices[item.id] || item.min;
    const line = {
      cartItemId: Date.now() + "-" + Math.random(),
      kind: "item",
      category: "single",
      name: t[item.nameKey],
      price: price,
      qty: 1,
      details: "",
    };
    setCart(function (c) { return [...c, line]; });
    setAddedFlash(function (a) { return { ...a, [item.id]: true }; });
    setTimeout(function () { setAddedFlash(function (a) { return { ...a, [item.id]: false }; }); }, 1500);
  }

  function updateQty(cartItemId, delta) {
    setCart(function (c) {
      return c.map(function (it) {
        if (it.cartItemId !== cartItemId) return it;
        const q = Math.max(1, it.qty + delta);
        return { ...it, qty: q };
      });
    });
  }

  function removeFromCart(cartItemId) {
    setCart(function (c) { return c.filter(function (it) { return it.cartItemId !== cartItemId; }); });
  }

  const cartTotal = cart.reduce(function (sum, it) { return sum + it.price * it.qty; }, 0);
  const cartCount = cart.reduce(function (sum, it) { return sum + it.qty; }, 0);

  async function handleGoogleSignIn() {
    setSignupErr("");
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged handles the rest (profile load + navigation)
    } catch (err) {
      setSignupErr((err && err.message) ? err.message : String(err));
    }
  }

  async function handleManualSignup() {
    setSignupErr("");
    if (!signupName.trim() || !signupEmail.trim()) {
      setSignupErr(t.required);
      return;
    }
    try {
      const result = await signInAnonymously(auth);
      const profile = { name: signupName.trim(), email: signupEmail.trim(), phone: signupPhone.trim() };
      await setDoc(doc(db, "users", result.user.uid), profile);
      // onAuthStateChanged will fire and pick up this profile automatically
    } catch (err) {
      setSignupErr((err && err.message) ? err.message : String(err));
    }
  }

  async function handleLanguageSelect(selected) {
    setLang(selected);
    if (user && user.uid) {
      try { await setDoc(doc(db, "users", user.uid), { lang: selected }, { merge: true }); } catch (e) {}
    }
    setScreen("home");
  }

  function validateCheckout() {
    const errs = {};
    if (!checkoutForm.name.trim()) errs.name = true;
    if (!checkoutForm.email.trim()) errs.email = true;
    if (!checkoutForm.phone.trim()) errs.phone = true;
    if (!checkoutForm.address.trim()) errs.address = true;
    setCheckoutErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function reviewOrder() {
    if (!validateCheckout()) return;
    setScreen("orderReview");
  }

  async function placeOrder() {
    if (!validateCheckout()) return;
    setPlacing(true);
    setOrderError("");
    const orderId = genOrderId();
    const order = {
      id: orderId,
      userId: user ? user.uid : null,
      customer: { name: checkoutForm.name, email: checkoutForm.email, phone: checkoutForm.phone },
      address: checkoutForm.address,
      notes: checkoutForm.notes,
      items: cart,
      total: cartTotal,
      status: "placed",
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, "orders", orderId), order);
      setLastOrder(order);
      setCart([]);
      notifyOrderByEmail(order);
      setScreen("confirmation");
    } catch (err) {
      console.error("placeOrder failed:", err);
      const msg = (err && err.message) ? err.message : String(err);
      setOrderError(
        (lang === "hinglish" ? "Order save nahi ho paya. Dubara try karein. (" : "Could not save the order. Please try again. (") + msg + ")"
      );
    }
    setPlacing(false);
  }

  async function loadMyOrders() {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const orders = snap.docs.map(function (d) { return d.data(); });
      orders.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      setMyOrders(orders);
    } catch (e) {
      console.error("loadMyOrders failed:", e);
    }
    setLoadingOrders(false);
  }

  function goToMyOrders() { setScreen("myOrders"); loadMyOrders(); }

  async function submitCustomRequest() {
    const item = SINGLE_ITEMS.find(function (i) { return i.id === customType; });
    const price = parseInt(customBudget, 10) || item.min;
    const line = {
      cartItemId: Date.now() + "-" + Math.random(),
      kind: "custom",
      category: "single",
      name: (t[item.nameKey] || "Custom") + " (Custom)",
      price: price,
      qty: 1,
      details: (customOccasion ? customOccasion + ". " : "") + customMessage,
    };
    setCart(function (c) { return [...c, line]; });
    setShowCustomModal(false);
    setCustomOccasion("");
    setCustomBudget("");
    setCustomMessage("");
    setScreen("cart");
  }

  function handleAdminLogin() {
    if (passcodeInput === ADMIN_PASSCODE) {
      setAdminAuthed(true);
      setAdminError("");
      setScreen("adminDashboard");
      loadAllOrders();
    } else {
      setAdminError(t.wrongPasscode);
    }
  }

  async function loadAllOrders() {
    setLoadingAdmin(true);
    try {
      const snap = await getDocs(collection(db, "orders"));
      const orders = snap.docs.map(function (d) { return d.data(); });
      orders.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      setAdminOrders(orders);
    } catch (e) {
      console.error("loadAllOrders failed:", e);
    }
    setLoadingAdmin(false);
  }

  async function updateOrderStatus(orderId, newStatus) {
    const order = adminOrders.find(function (o) { return o.id === orderId; });
    if (!order) return;
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setAdminOrders(function (prev) { return prev.map(function (o) { return o.id === orderId ? { ...o, status: newStatus } : o; }); });
    } catch (e) {
      console.error("updateOrderStatus failed:", e);
    }
  }

  function adminLogout() {
    setAdminAuthed(false);
    setPasscodeInput("");
    setScreen("home");
  }

  async function signOut() {
    try { await firebaseSignOut(auth); } catch (e) {}
    setUser(null);
    setCart([]);
    setMyOrders([]);
    setCheckoutForm({ name: "", email: "", phone: "", address: "", notes: "" });
    setScreen("signup");
  }

  /* ---------- shared style helpers ---------- */
  const globalStyle = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,500;1,600&family=Work+Sans:wght@400;500;600;700&display=swap');
      .dh-serif{font-family:'Fraunces',Georgia,serif;}
      .dh-serif-i{font-family:'Fraunces',Georgia,serif;font-style:italic;}
      .dh-sans{font-family:'Work Sans',system-ui,sans-serif;}
      .dh-void{background-color:#1B0E19;}
      .dh-paper{background-color:#FBF3EA;}
      .dh-ink{color:#2A1420;}
      .dh-gold{color:#CDA153;}
      .dh-gold-bg{background-color:#CDA153;}
      .dh-rose{color:#B23A63;}
      .dh-rose-bg{background-color:#B23A63;}
      .dh-rose-soft{background-color:#F3DCE5;}
      .dh-teal{color:#2E6B5C;}
      .dh-teal-bg{background-color:#2E6B5C;}
      .dh-teal-soft{background-color:#DBEAE5;}
      .dh-marigold{color:#B96A2A;}
      .dh-marigold-bg{background-color:#D98C3D;}
      .dh-marigold-soft{background-color:#F5E1C8;}
      * { font-family: 'Work Sans', system-ui, sans-serif; }
    `}</style>
  );

  const wrapperClass = "min-h-screen w-full flex justify-center dh-sans";
  const innerClass = "w-full min-h-screen relative dh-void";
  const innerStyle = { maxWidth: "448px" };

  /* ---------- BOOTING ---------- */
  if (booting) {
    return (
      <div className={wrapperClass} style={{ backgroundColor: "#0F0810" }}>
        {globalStyle}
        <div className={innerClass} style={{ ...innerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner light />
        </div>
      </div>
    );
  }

  /* ---------- SIGNUP SCREEN ---------- */
  if (screen === "signup") {
    return (
      <div className={wrapperClass} style={{ backgroundColor: "#0F0810" }}>
        {globalStyle}
        <div className={innerClass} style={{ ...innerStyle, paddingBottom: "40px" }}>
          <div className="px-6 pt-16 pb-10">
            <div className="relative mx-auto" style={{ maxWidth: "260px", transform: "rotate(-2deg)" }}>
              <div className="dh-paper rounded-2xl px-7 py-9 shadow-2xl relative">
                <div
                  className="absolute left-1/2 -top-2.5 w-5 h-5 rounded-full dh-void"
                  style={{ transform: "translateX(-50%)", boxShadow: "inset 0 2px 3px rgba(0,0,0,0.5)" }}
                />
                <Gift size={26} className="dh-gold mx-auto mb-2" />
                <p className="text-center dh-serif-i text-3xl dh-ink mb-1">{t.brand}</p>
                <p className="text-center dh-sans text-sm dh-ink opacity-70">{t.tagline}</p>
              </div>
            </div>
          </div>

          <div className="px-6">
            <h1 className="dh-serif text-2xl mb-1" style={{ color: "#F1E6DA" }}>{t.signupHeading}</h1>
            <p className="text-sm text-stone-400 mb-6">{t.signupSub}</p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full dh-paper rounded-xl py-3 flex items-center justify-center gap-3 font-medium text-sm dh-ink shadow-lg active:opacity-80"
            >
              <GoogleIcon size={18} />
              {t.continueGoogle}
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-stone-700" />
              <span className="text-xs text-stone-500">{t.orDivider}</span>
              <div className="flex-1 h-px bg-stone-700" />
            </div>

            <div className="space-y-3">
              <input
                value={signupName}
                onChange={function (e) { setSignupName(e.target.value); }}
                placeholder={t.fullNamePh}
                className="w-full dh-paper rounded-xl px-4 py-3 text-sm dh-ink outline-none"
              />
              <input
                value={signupEmail}
                onChange={function (e) { setSignupEmail(e.target.value); }}
                placeholder={t.emailPh}
                type="email"
                className="w-full dh-paper rounded-xl px-4 py-3 text-sm dh-ink outline-none"
              />
              <input
                value={signupPhone}
                onChange={function (e) { setSignupPhone(e.target.value); }}
                placeholder={t.phonePh}
                type="tel"
                className="w-full dh-paper rounded-xl px-4 py-3 text-sm dh-ink outline-none"
              />
              {signupErr && <p className="text-xs" style={{ color: "#E38B9E" }}>{signupErr}</p>}
              <button
                onClick={handleManualSignup}
                className="w-full dh-gold-bg dh-ink rounded-xl py-3 font-semibold text-sm active:opacity-80"
              >
                {t.signUpBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- LANGUAGE SCREEN ---------- */
  if (screen === "language") {
    return (
      <div className={wrapperClass} style={{ backgroundColor: "#0F0810" }}>
        {globalStyle}
        <div className={innerClass} style={{ ...innerStyle, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px" }}>
          <Sparkles size={26} className="dh-gold mb-4" />
          <h1 className="dh-serif text-3xl mb-2" style={{ color: "#F1E6DA" }}>{t.chooseLangHeading}</h1>
          <p className="text-sm text-stone-400 mb-8">{t.chooseLangSub}</p>

          <button
            onClick={function () { handleLanguageSelect("hinglish"); }}
            className="w-full dh-paper rounded-2xl p-5 mb-4 text-left flex items-center justify-between shadow-lg active:opacity-80"
          >
            <div>
              <p className="dh-serif text-xl dh-ink">{T.hinglish.hinglishLabel}</p>
              <p className="text-xs dh-ink opacity-60 mt-0.5">{T.hinglish.hinglishDesc}</p>
            </div>
            <ChevronRight size={20} className="dh-gold" />
          </button>

          <button
            onClick={function () { handleLanguageSelect("english"); }}
            className="w-full dh-paper rounded-2xl p-5 text-left flex items-center justify-between shadow-lg active:opacity-80"
          >
            <div>
              <p className="dh-serif text-xl dh-ink">{T.english.englishLabel}</p>
              <p className="text-xs dh-ink opacity-60 mt-0.5">{T.english.englishDesc}</p>
            </div>
            <ChevronRight size={20} className="dh-gold" />
          </button>
        </div>
      </div>
    );
  }

  /* ---------- ADMIN LOGIN ---------- */
  if (screen === "adminLogin") {
    return (
      <div className={wrapperClass} style={{ backgroundColor: "#0F0810" }}>
        {globalStyle}
        <div className={innerClass + " dh-paper"} style={{ ...innerStyle, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px" }}>
          <button onClick={goHome} className="flex items-center gap-1 dh-ink text-sm mb-8 opacity-60">
            <ChevronLeft size={16} /> {t.backBtn}
          </button>
          <Lock size={28} className="dh-ink mb-4 opacity-70" />
          <h1 className="dh-serif text-2xl dh-ink mb-1">{t.adminLoginHeading}</h1>
          <p className="text-sm dh-ink opacity-60 mb-6">{t.passcodeLabel}</p>
          <input
            value={passcodeInput}
            onChange={function (e) { setPasscodeInput(e.target.value); }}
            onKeyDown={function (e) { if (e.key === "Enter") handleAdminLogin(); }}
            placeholder={t.passcodePh}
            type="password"
            className="w-full rounded-xl px-4 py-3 text-sm dh-ink outline-none border border-stone-300 mb-3"
          />
          {adminError && <p className="text-xs mb-3" style={{ color: "#B23A63" }}>{adminError}</p>}
          <button onClick={handleAdminLogin} className="w-full dh-gold-bg dh-ink rounded-xl py-3 font-semibold text-sm active:opacity-80">
            {t.loginBtn}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- ADMIN DASHBOARD ---------- */
  if (screen === "adminDashboard" && adminAuthed) {
    const pending = adminOrders.filter(function (o) { return o.status !== "delivered"; }).length;
    const delivered = adminOrders.filter(function (o) { return o.status === "delivered"; }).length;
    return (
      <div className={wrapperClass} style={{ backgroundColor: "#0F0810" }}>
        {globalStyle}
        <div className={innerClass + " dh-paper"} style={innerStyle}>
          <div className="sticky top-0 dh-paper px-5 py-4 flex items-center justify-between z-20" style={{ borderBottom: "1px solid rgba(42,20,32,0.1)" }}>
            <h1 className="dh-serif text-xl dh-ink">{t.adminDashHeading}</h1>
            <div className="flex items-center gap-3">
              <button onClick={loadAllOrders} className="dh-ink opacity-70"><RefreshCw size={18} /></button>
              <button onClick={adminLogout} className="dh-ink opacity-70"><LogOut size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 px-5 py-4">
            <div className="dh-teal-soft rounded-xl p-3 text-center">
              <p className="text-lg font-bold dh-teal">{adminOrders.length}</p>
              <p className="text-xs dh-ink opacity-60">{t.totalOrdersLabel}</p>
            </div>
            <div className="dh-marigold-soft rounded-xl p-3 text-center">
              <p className="text-lg font-bold dh-marigold">{pending}</p>
              <p className="text-xs dh-ink opacity-60">{t.pendingLabel}</p>
            </div>
            <div className="dh-rose-soft rounded-xl p-3 text-center">
              <p className="text-lg font-bold dh-rose">{delivered}</p>
              <p className="text-xs dh-ink opacity-60">{t.deliveredLabel}</p>
            </div>
          </div>

          <div className="px-5 pb-10">
            {loadingAdmin && (
              <div className="flex justify-center py-10"><Spinner /></div>
            )}
            {!loadingAdmin && adminOrders.length === 0 && (
              <p className="text-center text-sm dh-ink opacity-50 py-10">{t.noOrdersYetAdmin}</p>
            )}
            {adminOrders.map(function (order) {
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4 mb-3 border border-stone-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold dh-ink">{order.id}</p>
                      <p className="text-xs dh-ink opacity-50">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    <p className="dh-serif text-lg dh-gold">{formatINR(order.total)}</p>
                  </div>
                  <div className="text-xs dh-ink opacity-80 mb-2">
                    <p className="font-medium mb-0.5">{t.customerLabel}</p>
                    <p>{order.customer.name} · {order.customer.email} · {order.customer.phone}</p>
                    <p className="flex items-start gap-1 mt-1"><MapPin size={12} className="mt-0.5 flex-shrink-0" />{order.address}</p>
                    {order.notes ? <p className="mt-1 italic opacity-70">"{order.notes}"</p> : null}
                  </div>
                  <div className="text-xs dh-ink opacity-70 mb-3">
                    <p className="font-medium opacity-100 mb-0.5">{t.itemsLabel}</p>
                    {order.items.map(function (it, idx) {
                      return <p key={idx}>{it.name} x{it.qty} — {formatINR(it.price)}</p>;
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={"text-xs px-2.5 py-1 rounded-full font-medium " +
                        (order.status === "placed" ? "dh-marigold-soft dh-marigold" :
                         order.status === "outfordelivery" ? "dh-teal-soft dh-teal" : "dh-rose-soft dh-rose")}
                    >
                      {order.status === "placed" ? t.statusPlaced : order.status === "outfordelivery" ? t.statusOutForDelivery : t.statusDelivered}
                    </span>
                    <div className="flex gap-2">
                      {order.status === "placed" && (
                        <button
                          onClick={function () { updateOrderStatus(order.id, "outfordelivery"); }}
                          className="text-xs dh-teal-bg text-white px-3 py-1.5 rounded-lg font-medium active:opacity-80"
                        >
                          {t.markOutForDeliveryBtn}
                        </button>
                      )}
                      {order.status === "outfordelivery" && (
                        <button
                          onClick={function () { updateOrderStatus(order.id, "delivered"); }}
                          className="text-xs dh-gold-bg dh-ink px-3 py-1.5 rounded-lg font-medium active:opacity-80"
                        >
                          {t.markDeliveredBtn}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- MAIN APP SHELL (home / category / singleItems / cart / checkout / confirmation / myOrders) ---------- */
  const showBottomNav = ["home", "singleItems", "cart", "myOrders"].indexOf(screen) !== -1;

  return (
    <div className={wrapperClass} style={{ backgroundColor: "#0F0810" }}>
      {globalStyle}
      <div className={innerClass} style={innerStyle}>
        <Header
          t={t} lang={lang} setLang={function (l) { setLang(l); if (user && user.uid) { setDoc(doc(db, "users", user.uid), { lang: l }, { merge: true }).catch(function () {}); } }}
          cartCount={cartCount}
          onCart={function () { setScreen("cart"); }}
          onOrders={goToMyOrders}
          onHome={goHome}
          onAdmin={function () { setScreen("adminLogin"); }}
        />

        <div style={{ paddingBottom: showBottomNav ? "80px" : "24px" }}>
          {/* ---------- HOME ---------- */}
          {screen === "home" && (
            <div>
              <div className="px-6 pt-8 pb-4">
                <div className="relative mx-auto mb-2" style={{ maxWidth: "230px", transform: "rotate(-1.5deg)" }}>
                  <div className="dh-paper rounded-2xl px-6 py-7 shadow-2xl relative">
                    <div className="absolute left-1/2 -top-2.5 w-4 h-4 rounded-full dh-void" style={{ transform: "translateX(-50%)", boxShadow: "inset 0 2px 3px rgba(0,0,0,0.5)" }} />
                    <p className="text-center dh-serif text-2xl dh-ink leading-tight">{t.heroTitle}</p>
                    <p className="text-center dh-serif-i text-2xl dh-gold leading-tight">{t.heroTitle2}</p>
                  </div>
                </div>
                <p className="text-center text-sm text-stone-400 mt-6 px-2">{t.heroSub}</p>
              </div>

              <div className="px-5 mt-4 space-y-3">
                {["mens", "womens", "family"].map(function (cat) {
                  const meta = CATEGORY_META[cat];
                  const Icon = PACKAGES[cat].icon;
                  const titleKey = "cat" + cat.charAt(0).toUpperCase() + cat.slice(1) + "Title";
                  const descKey = "cat" + cat.charAt(0).toUpperCase() + cat.slice(1) + "Desc";
                  return (
                    <button
                      key={cat}
                      onClick={function () { openCategory(cat); }}
                      className="w-full dh-paper rounded-2xl p-4 flex items-center gap-4 shadow-lg active:opacity-80 relative"
                    >
                      <TagHole className="absolute -top-1 left-8" />
                      <div className={"w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 " + meta.softClass}>
                        <Icon size={22} className={meta.textClass} />
                      </div>
                      <div className="text-left flex-1">
                        <p className="dh-serif text-lg dh-ink">{t[titleKey]}</p>
                        <p className="text-xs dh-ink opacity-60">{t[descKey]}</p>
                      </div>
                      <ChevronRight size={18} className="dh-gold flex-shrink-0" />
                    </button>
                  );
                })}
              </div>

              <div className="px-5 mt-5">
                <button
                  onClick={function () { setScreen("singleItems"); }}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 shadow-lg active:opacity-80"
                  style={{ background: "linear-gradient(135deg, #2E6B5C 0%, #B23A63 60%, #D98C3D 100%)" }}
                >
                  <Flower2 size={24} className="text-white flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="dh-serif text-lg text-white">{t.bouquetsHeading}</p>
                    <p className="text-xs text-white opacity-80">{t.bouquetsSub}</p>
                  </div>
                  <ChevronRight size={18} className="text-white flex-shrink-0" />
                </button>
              </div>

              <div className="px-6 mt-8 text-center">
                <button onClick={signOut} className="text-xs text-stone-500 underline">{t.signOut}</button>
              </div>
            </div>
          )}

          {/* ---------- CATEGORY DETAIL ---------- */}
          {screen === "category" && activeCategory && (
            <div className="px-5 pt-4">
              <button onClick={goHome} className="flex items-center gap-1 text-sm mb-4" style={{ color: "#F1E6DA" }}>
                <ChevronLeft size={16} /> {t.backBtn}
              </button>
              <h1 className="dh-serif text-2xl mb-1" style={{ color: "#F1E6DA" }}>
                {t["cat" + activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) + "Title"]}
              </h1>
              <p className="text-sm text-stone-400 mb-5">
                {t["cat" + activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) + "Desc"]}
              </p>
              {PACKAGES[activeCategory].tiers.map(function (tier, idx) {
                const key = activeCategory + "-" + tier.price;
                return (
                  <PackageTierCard
                    key={idx}
                    tier={tier}
                    t={t}
                    accent={activeCategory}
                    added={!!addedFlash[key]}
                    onAdd={function (tr) { addPackageToCart(activeCategory, tr); }}
                  />
                );
              })}
            </div>
          )}

          {/* ---------- SINGLE ITEMS (Bouquets & Hampers) ---------- */}
          {screen === "singleItems" && (
            <div className="px-5 pt-4">
              <h1 className="dh-serif text-2xl mb-1" style={{ color: "#F1E6DA" }}>{t.bouquetsHeading}</h1>
              <p className="text-sm text-stone-400 mb-5">{t.bouquetsSub}</p>

              {SINGLE_ITEMS.map(function (item) {
                const Icon = item.icon;
                const options = [];
                for (let p = item.min; p <= item.max; p += item.step) options.push(p);
                const selected = selectedPrices[item.id] || item.min;
                return (
                  <div key={item.id} className="dh-paper rounded-2xl shadow-lg p-5 mb-4 relative">
                    <TagHole className="absolute -top-1 left-6" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl dh-rose-soft flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="dh-rose" />
                      </div>
                      <div>
                        <p className="dh-serif text-lg dh-ink">{t[item.nameKey]}</p>
                        <p className="text-xs dh-ink opacity-60">{formatINR(item.min)} – {formatINR(item.max)} {t.startingFrom}</p>
                      </div>
                    </div>
                    <p className="text-xs dh-ink opacity-60 mb-2">{t.selectPriceLabel}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {options.map(function (p) {
                        const isSel = selected === p;
                        return (
                          <button
                            key={p}
                            onClick={function () { setSelectedPrices(function (s) { return { ...s, [item.id]: p }; }); }}
                            className={"text-xs px-3 py-1.5 rounded-full font-medium border " + (isSel ? "dh-gold-bg dh-ink border-transparent" : "dh-ink border-stone-300")}
                          >
                            {formatINR(p)}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={function () { addSingleItemToCart(item); }}
                      className={"w-full py-2.5 rounded-xl font-medium text-sm active:opacity-80 " + (addedFlash[item.id] ? "bg-stone-200 dh-ink" : "dh-gold-bg dh-ink")}
                    >
                      {addedFlash[item.id] ? t.addedBtn : t.addToCartBtn}
                    </button>
                  </div>
                );
              })}

              <div className="dh-paper rounded-2xl shadow-lg p-5 mb-4 relative border-2" style={{ borderColor: "#CDA153", borderStyle: "dashed" }}>
                <Sparkles size={22} className="dh-gold mb-2" />
                <p className="dh-serif text-lg dh-ink mb-1">{t.customCardTitle}</p>
                <p className="text-xs dh-ink opacity-60 mb-4">{t.customCardDesc}</p>
                <button
                  onClick={function () { setShowCustomModal(true); }}
                  className="w-full dh-ink text-white py-2.5 rounded-xl font-medium text-sm active:opacity-80"
                  style={{ backgroundColor: "#2A1420" }}
                >
                  {t.requestCustomBtn}
                </button>
              </div>
            </div>
          )}

          {/* ---------- CART ---------- */}
          {screen === "cart" && (
            <div className="px-5 pt-4">
              <h1 className="dh-serif text-2xl mb-5" style={{ color: "#F1E6DA" }}>{t.cartHeading}</h1>
              {cart.length === 0 && (
                <div className="text-center py-16">
                  <ShoppingBag size={36} className="text-stone-600 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm mb-5">{t.cartEmpty}</p>
                  <button onClick={goHome} className="dh-gold-bg dh-ink px-5 py-2.5 rounded-xl font-medium text-sm">{t.cartEmptyCta}</button>
                </div>
              )}
              {cart.map(function (it) {
                return (
                  <div key={it.cartItemId} className="dh-paper rounded-2xl shadow-lg p-4 mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-2">
                        <p className="dh-serif text-base dh-ink">{it.name}</p>
                        {it.details ? <p className="text-xs dh-ink opacity-50 mt-0.5">{it.details}</p> : null}
                      </div>
                      <p className="dh-serif text-base dh-gold flex-shrink-0">{formatINR(it.price)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3">
                        <button onClick={function () { updateQty(it.cartItemId, -1); }} className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center">
                          <Minus size={13} className="dh-ink" />
                        </button>
                        <span className="text-sm dh-ink font-medium w-4 text-center">{it.qty}</span>
                        <button onClick={function () { updateQty(it.cartItemId, 1); }} className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center">
                          <Plus size={13} className="dh-ink" />
                        </button>
                      </div>
                      <button onClick={function () { removeFromCart(it.cartItemId); }} className="text-xs dh-rose font-medium">
                        {t.removeBtn}
                      </button>
                    </div>
                  </div>
                );
              })}
              {cart.length > 0 && (
                <div>
                  <div className="dh-paper rounded-2xl shadow-lg p-4 mt-4 flex items-center justify-between">
                    <span className="dh-serif text-lg dh-ink">{t.totalLabel}</span>
                    <span className="dh-serif text-xl dh-gold">{formatINR(cartTotal)}</span>
                  </div>
                  <button
                    onClick={function () { setScreen("checkout"); }}
                    className="w-full dh-gold-bg dh-ink py-3 rounded-xl font-semibold text-sm mt-4 active:opacity-80"
                  >
                    {t.proceedCheckoutBtn}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---------- CHECKOUT ---------- */}
          {screen === "checkout" && (
            <div className="px-5 pt-4">
              <button onClick={function () { setScreen("cart"); }} className="flex items-center gap-1 text-sm mb-4" style={{ color: "#F1E6DA" }}>
                <ChevronLeft size={16} /> {t.backBtn}
              </button>
              <h1 className="dh-serif text-2xl mb-5" style={{ color: "#F1E6DA" }}>{t.checkoutHeading}</h1>

              <div className="dh-paper rounded-2xl shadow-lg p-4 mb-4">
                <p className="text-xs dh-ink opacity-60 mb-2 font-medium">{t.orderSummary}</p>
                {cart.map(function (it) {
                  return (
                    <div key={it.cartItemId} className="flex justify-between text-sm dh-ink py-1">
                      <span>{it.name} x{it.qty}</span>
                      <span>{formatINR(it.price * it.qty)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-2 mt-2" style={{ borderTop: "1px solid rgba(42,20,32,0.15)" }}>
                  <span className="dh-serif dh-ink">{t.totalLabel}</span>
                  <span className="dh-serif dh-gold">{formatINR(cartTotal)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <input
                    value={checkoutForm.name}
                    onChange={function (e) { setCheckoutForm({ ...checkoutForm, name: e.target.value }); }}
                    placeholder={t.nameLabel}
                    className={"w-full dh-paper rounded-xl px-4 py-3 text-sm dh-ink outline-none " + (checkoutErrors.name ? "ring-2" : "")}
                    style={checkoutErrors.name ? { boxShadow: "0 0 0 2px #B23A63" } : {}}
                  />
                </div>
                <input
                  value={checkoutForm.email}
                  onChange={function (e) { setCheckoutForm({ ...checkoutForm, email: e.target.value }); }}
                  placeholder={t.emailLabel}
                  type="email"
                  className="w-full dh-paper rounded-xl px-4 py-3 text-sm dh-ink outline-none"
                  style={checkoutErrors.email ? { boxShadow: "0 0 0 2px #B23A63" } : {}}
                />
                <input
                  value={checkoutForm.phone}
                  onChange={function (e) { setCheckoutForm({ ...checkoutForm, phone: e.target.value }); }}
                  placeholder={t.phoneLabel}
                  type="tel"
                  className="w-full dh-paper rounded-xl px-4 py-3 text-sm dh-ink outline-none"
                  style={checkoutErrors.phone ? { boxShadow: "0 0 0 2px #B23A63" } : {}}
                />
                <textarea
                  value={checkoutForm.address}
                  onChange={function (e) { setCheckoutForm({ ...checkoutForm, address: e.target.value }); }}
                  placeholder={t.addressPh}
                  rows={3}
                  className="w-full dh-paper rounded-xl px-4 py-3 text-sm dh-ink outline-none resize-none"
                  style={checkoutErrors.address ? { boxShadow: "0 0 0 2px #B23A63" } : {}}
                />
                <textarea
                  value={checkoutForm.notes}
                  onChange={function (e) { setCheckoutForm({ ...checkoutForm, notes: e.target.value }); }}
                  placeholder={t.notesPh}
                  rows={2}
                  className="w-full dh-paper rounded-xl px-4 py-3 text-sm dh-ink outline-none resize-none"
                />
              </div>

              <button
                onClick={reviewOrder}
                className="w-full dh-gold-bg dh-ink py-3 rounded-xl font-semibold text-sm mt-5 mb-2 active:opacity-80"
              >
                {t.reviewOrderBtn}
              </button>
            </div>
          )}

          {/* ---------- ORDER REVIEW (confirm / cancel) ---------- */}
          {screen === "orderReview" && (
            <div className="px-5 pt-4">
              <h1 className="dh-serif text-2xl mb-1" style={{ color: "#F1E6DA" }}>{t.reviewHeading}</h1>
              <p className="text-sm text-stone-400 mb-5">{t.reviewSub}</p>

              <div className="dh-paper rounded-2xl shadow-lg p-4 mb-4 relative">
                <TagHole className="absolute -top-1 left-6" />
                <p className="text-xs dh-ink opacity-60 mb-2 font-medium">{t.orderSummary}</p>
                {cart.map(function (it) {
                  return (
                    <div key={it.cartItemId} className="flex justify-between text-sm dh-ink py-1">
                      <span>{it.name} x{it.qty}</span>
                      <span>{formatINR(it.price * it.qty)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-2 mt-2" style={{ borderTop: "1px solid rgba(42,20,32,0.15)" }}>
                  <span className="dh-serif dh-ink">{t.totalLabel}</span>
                  <span className="dh-serif dh-gold">{formatINR(cartTotal)}</span>
                </div>
              </div>

              <div className="dh-paper rounded-2xl shadow-lg p-4 mb-6 text-sm dh-ink space-y-1">
                <p><span className="opacity-60">{t.nameLabel}: </span>{checkoutForm.name}</p>
                <p><span className="opacity-60">{t.emailLabel}: </span>{checkoutForm.email}</p>
                <p><span className="opacity-60">{t.phoneLabel}: </span>{checkoutForm.phone}</p>
                <p className="flex items-start gap-1"><MapPin size={13} className="mt-0.5 flex-shrink-0 opacity-60" />{checkoutForm.address}</p>
                {checkoutForm.notes ? <p className="opacity-70 italic">"{checkoutForm.notes}"</p> : null}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={function () { setScreen("checkout"); }}
                  disabled={placing}
                  className="flex-1 py-3 rounded-xl font-medium text-sm active:opacity-80 disabled:opacity-60"
                  style={{ color: "#F1E6DA", border: "1px solid rgba(241,230,218,0.3)" }}
                >
                  {t.cancelBtn}
                </button>
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="flex-1 dh-gold-bg dh-ink py-3 rounded-xl font-semibold text-sm active:opacity-80 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {placing && <Spinner />}
                  {placing ? t.placingOrder : t.confirmOrderBtn}
                </button>
              </div>
              {orderError && (
                <p className="text-xs mt-3 text-center" style={{ color: "#E38B9E" }}>{orderError}</p>
              )}
            </div>
          )}

          {/* ---------- CONFIRMATION ---------- */}
          {screen === "confirmation" && lastOrder && (
            <div className="px-6 pt-10 text-center">
              <div className="w-16 h-16 rounded-full dh-gold-bg flex items-center justify-center mx-auto mb-5">
                <Check size={28} className="dh-ink" />
              </div>
              <h1 className="dh-serif text-2xl mb-2" style={{ color: "#F1E6DA" }}>{t.confirmHeading}</h1>
              <p className="text-sm text-stone-400 mb-6">{t.confirmSub}</p>

              <div className="dh-paper rounded-2xl shadow-lg p-5 mb-5 text-left relative">
                <TagHole className="absolute -top-1 left-6" />
                <p className="text-xs dh-ink opacity-50">{t.orderIdLabel}</p>
                <p className="dh-serif text-lg dh-ink mb-3">{lastOrder.id}</p>
                <p className="text-xs dh-ink opacity-50">{t.totalLabel}</p>
                <p className="dh-serif text-lg dh-gold">{formatINR(lastOrder.total)}</p>
              </div>

              <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: "rgba(205,161,83,0.12)", border: "1px solid rgba(205,161,83,0.35)" }}>
                <Mail size={18} className="dh-gold mx-auto mb-2" />
                <p className="text-xs text-stone-300 mb-1">{t.queryHelpText}</p>
                <a href={"mailto:" + CONTACT_EMAIL} className="text-sm dh-gold font-medium">{CONTACT_EMAIL}</a>
              </div>

              <button onClick={goToMyOrders} className="w-full dh-gold-bg dh-ink py-3 rounded-xl font-semibold text-sm mb-3 active:opacity-80">
                {t.viewOrdersBtn}
              </button>
              <button onClick={goHome} className="w-full py-3 rounded-xl font-medium text-sm active:opacity-80" style={{ color: "#F1E6DA", border: "1px solid rgba(241,230,218,0.3)" }}>
                {t.continueShoppingBtn}
              </button>
            </div>
          )}

          {/* ---------- MY ORDERS ---------- */}
          {screen === "myOrders" && (
            <div className="px-5 pt-4">
              <h1 className="dh-serif text-2xl mb-5" style={{ color: "#F1E6DA" }}>{t.myOrdersHeading}</h1>
              {loadingOrders && <div className="flex justify-center py-10"><Spinner light /></div>}
              {!loadingOrders && myOrders.length === 0 && (
                <div className="text-center py-16">
                  <ClipboardList size={36} className="text-stone-600 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm mb-5">{t.noOrdersText}</p>
                  <button onClick={goHome} className="dh-gold-bg dh-ink px-5 py-2.5 rounded-xl font-medium text-sm">{t.noOrdersCta}</button>
                </div>
              )}
              {myOrders.map(function (order) {
                return (
                  <div key={order.id} className="dh-paper rounded-2xl shadow-lg p-4 mb-4 relative">
                    <TagHole className="absolute -top-1 left-6" />
                    <div className="flex justify-between items-start mb-1">
                      <p className="dh-serif text-base dh-ink">{order.id}</p>
                      <p className="dh-serif dh-gold">{formatINR(order.total)}</p>
                    </div>
                    <p className="text-xs dh-ink opacity-50 mb-2">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <div className="text-xs dh-ink opacity-70 space-y-0.5">
                      {order.items.map(function (it, idx) { return <p key={idx}>{it.name} x{it.qty} — {formatINR(it.price)}</p>; })}
                    </div>
                    <StatusStepper status={order.status} t={t} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showBottomNav && (
          <BottomNav
            t={t} screen={screen} cartCount={cartCount}
            onHome={goHome}
            onBouquets={function () { setScreen("singleItems"); }}
            onCart={function () { setScreen("cart"); }}
            onOrders={goToMyOrders}
          />
        )}
      </div>

      {/* ---------- CUSTOM ORDER MODAL ---------- */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
          <div className="w-full dh-paper rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto" style={{ maxWidth: "448px" }}>
            <div className="flex justify-between items-center mb-4">
              <span className="dh-serif text-lg dh-ink">{t.customModalTitle}</span>
              <button onClick={function () { setShowCustomModal(false); }}><X size={20} className="dh-ink" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs dh-ink opacity-60 mb-1">{t.itemTypeLabel}</p>
                <select
                  value={customType}
                  onChange={function (e) { setCustomType(e.target.value); }}
                  className="w-full rounded-xl px-4 py-3 text-sm dh-ink outline-none border border-stone-300"
                >
                  {SINGLE_ITEMS.map(function (item) {
                    return <option key={item.id} value={item.id}>{t[item.nameKey]}</option>;
                  })}
                </select>
              </div>
              <input
                value={customOccasion}
                onChange={function (e) { setCustomOccasion(e.target.value); }}
                placeholder={t.occasionPh}
                className="w-full rounded-xl px-4 py-3 text-sm dh-ink outline-none border border-stone-300"
              />
              <input
                value={customBudget}
                onChange={function (e) { setCustomBudget(e.target.value); }}
                placeholder={t.budgetPh}
                type="number"
                className="w-full rounded-xl px-4 py-3 text-sm dh-ink outline-none border border-stone-300"
              />
              <textarea
                value={customMessage}
                onChange={function (e) { setCustomMessage(e.target.value); }}
                placeholder={t.messagePh}
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm dh-ink outline-none border border-stone-300 resize-none"
              />
              <div className="flex gap-3 pt-1">
                <button onClick={function () { setShowCustomModal(false); }} className="flex-1 py-3 rounded-xl font-medium text-sm dh-ink border border-stone-300">
                  {t.cancelBtn}
                </button>
                <button onClick={submitCustomRequest} className="flex-1 dh-gold-bg dh-ink py-3 rounded-xl font-semibold text-sm">
                  {t.submitCustomBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
