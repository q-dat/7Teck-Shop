"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArchive,
  FiBattery,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiCopy,
  FiDatabase,
  FiDownload,
  FiEdit3,
  FiFileText,
  FiImage,
  FiMonitor,
  FiPhone,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiShare2,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { toast, ToastContainer, type ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ProductImage = {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  type: string;
  createdAt: string;
};

type LocalProduct = {
  id: string;
  name: string;
  description: string;
  pin: string;
  status: string;
  price: number;
  priceText: string;
  category: string;
  images: ProductImage[];
  internalImages: ProductImage[];
  isDone: boolean;
  doneAt: string;
  createdAt: string;
  updatedAt: string;
};

type ProductDraft = {
  name: string;
  description: string;
  pin: string;
  status: string;
  priceText: string;
  category: string;
  images: ProductImage[];
  internalImages: ProductImage[];
};

type ProductImageField = "images" | "internalImages";

type ContactOption = {
  id: string;
  text: string;
};

type GlobalSettings = {
  commonDescription: string;
  globalNote: string;
  contactOptions: ContactOption[];
  selectedContactId: string;
  includeSocialTags: boolean;
  updatedAt: string;
};

type ExportPayload = {
  version: 8;
  settings: GlobalSettings;
  products: LocalProduct[];
  scheduleConfig: ScheduleConfig;
  scheduleAssignments: ScheduleAssignmentMap;
  postedRecords: PostedRecord[];
};

type ParsedImportPayload = {
  settings?: GlobalSettings;
  products: LocalProduct[];
  scheduleConfig?: ScheduleConfig;
  scheduleAssignments?: ScheduleAssignmentMap;
  postedRecords?: PostedRecord[];
};

type LatestBlobBackup = {
  pathname: string;
  downloadUrl: string;
  size: number;
  uploadedAt: string;
  etag: string;
};

type ConfirmTone = "default" | "danger" | "warning";

type ConfirmRequest = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

type BlobUploadRequest = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: (uploadKey: string) => void | Promise<void>;
  onCancel?: () => void;
};

type ScheduleConfig = {
  dateFrom: string;
  dateTo: string;
  startTime: string;
  endTime: string;
  gapHours: number;
  taskCount: number;
  taskNames: string[];
  selectedCategories: string[];
};

type ScheduleSlot = {
  id: string;
  date: string;
  time: string;
  productId: string;
  productName: string;
  category: string;
  image?: string;
  images: ProductImage[];
  priceText: string;
  description: string;
  postText: string;
};

type ScheduleWarning = {
  type:
  | "emptyProducts"
  | "emptyCategory"
  | "notEnoughProducts"
  | "overflow"
  | "invalidTime";
  message: string;
};

type BuildScheduleResult = {
  slots: ScheduleSlot[];
  warnings: ScheduleWarning[];
};

type PostedRecord = {
  slotId: string;
  postedAt: string;
};

type ScheduleAssignmentMap = Record<string, string>;

type AlbumSource = {
  title: string;
  description: string;
  priceText: string;
  images: ProductImage[];
  internalImages?: ProductImage[];
};

type ModalName =
  | "product"
  | "productList"
  | "schedule"
  | "globalNote"
  | "globalDescription"
  | "contact"
  | "importExport"
  | "slotDetail"
  | "imageAlbum"
  | "imageDownload"
  | "";

type CategoryTab = "all" | string;

type DownloadMode = "single" | "multiple";

type DownloadRequest = {
  title: string;
  description: string;
  mode: DownloadMode;
  images: ProductImage[];
  internalImages?: ProductImage[];
  startIndex: number;
  textToCopy?: string;
};

type SelectedDescriptionCopy = {
  productId: string;
  text: string;
};

type NativeShareData = {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
};

type NativeShareNavigator = Navigator & {
  share?: (data: NativeShareData) => Promise<void>;
  canShare?: (data: NativeShareData) => boolean;
};

type ShareContentMode = "post" | "comment" | "imagesOnly";

type ShareDialogStep = "share" | "facebookGroup";

type ShareRequest = {
  title: string;
  images: ProductImage[];
  internalImages?: ProductImage[];
  postText: string;
  commentText: string;
  shareKey: string;
  successMessage: string;
};

type PreparedBackup = {
  blob: Blob;
  filename: string;
  label: string;
};

type DocumentPictureInPictureOptions = {
  width?: number;
  height?: number;
};

type DocumentPictureInPictureApi = {
  window: Window | null;
  requestWindow: (
    options?: DocumentPictureInPictureOptions,
  ) => Promise<Window>;
};

type WindowWithDocumentPictureInPicture = Window & {
  documentPictureInPicture?: DocumentPictureInPictureApi;
};

type ClipboardItemConstructor = new (
  items: Record<string, Blob | PromiseLike<Blob>>,
) => ClipboardItem;

type ClipboardCapableWindow = Window & {
  ClipboardItem?: ClipboardItemConstructor;
};

const DB_NAME = "local_product_store";
const DB_VERSION = 1;
const STORE_NAME = "products";
const SETTINGS_KEY = "local_product_global_settings";
const POSTED_KEY = "local_product_posted_slots_v1";
const SCHEDULE_CONFIG_KEY = "local_product_schedule_config_v1";
const SCHEDULE_ASSIGNMENTS_KEY = "local_product_schedule_assignments_v1";

const emptyDraft: ProductDraft = {
  name: "",
  description: "",
  pin: "",
  status: "",
  priceText: "",
  category: "",
  images: [],
  internalImages: [],
};

const defaultSettings: GlobalSettings = {
  commonDescription: "",
  globalNote: "",
  contactOptions: [],
  selectedContactId: "",
  includeSocialTags: false,
  updatedAt: "",
};

const defaultScheduleConfig: ScheduleConfig = {
  dateFrom: "",
  dateTo: "",
  startTime: "08:00",
  endTime: "22:00",
  gapHours: 3,
  taskCount: 1,
  taskNames: ["Task 1"],
  selectedCategories: [],
};


const iconClassName =
  "h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110";

const productActionButtonBaseClassName =
  "group relative flex min-h-7 items-center justify-center gap-1 overflow-hidden whitespace-nowrap border px-1.5 py-1 text-[9px] font-black tracking-[0.025em] [clip-path:polygon(6px_0,calc(100%_-_6px)_0,100%_6px,100%_calc(100%_-_6px),calc(100%_-_6px)_100%,6px_100%,0_calc(100%_-_6px),0_6px)] transition-[color,background-color,border-color,transform,box-shadow,filter] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8c99f]/[0.45] active:scale-[0.97] active:brightness-95";

const headerActionButtonBaseClassName =
  "group relative flex min-h-5 cursor-pointer items-center justify-start gap-1 overflow-hidden whitespace-nowrap border p-1.5 text-[10px] font-semibold [clip-path:polygon(7px_0,calc(100%_-_7px)_0,100%_7px,100%_calc(100%_-_7px),calc(100%_-_7px)_100%,7px_100%,0_calc(100%_-_7px),0_7px)] transition-[color,background-color,border-color,transform,box-shadow,filter] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8c99f]/[0.45] active:scale-[0.97] active:brightness-95 xl:justify-center";

const headerNeutralButtonClassName =
  "border-white/[0.07] bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] hover:-translate-y-px hover:border-[#d8c99f]/40 hover:bg-[#d8c99f]/[0.075] hover:text-[#f3e7c6] hover:shadow-[0_8px_20px_rgba(0,0,0,0.26)]";

const headerPrimaryButtonClassName =
  "border-[#f0e3c0]/80 bg-[linear-gradient(135deg,#f2e8cd_0%,#c9b47c_52%,#eadcb8_100%)] !text-[#17130a] shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_6px_18px_rgba(190,164,99,0.16)] hover:border-[#fff4d7] hover:brightness-105";

const headerActiveButtonClassName =
  "border-[#e8d9ae]/75 bg-[linear-gradient(135deg,#e8dbb9_0%,#bda66d_100%)] !text-[#18140b] shadow-[inset_0_1px_0_rgba(255,255,255,0.48),0_5px_16px_rgba(190,164,99,0.13)] hover:border-[#f5e8c5] hover:brightness-105";

const albumActionButtonBaseClassName =
  "group flex min-h-8 shrink-0 items-center justify-center gap-1 overflow-hidden border px-1.5 py-1 text-[9px] font-black tracking-[0.025em] transition-[color,background-color,border-color,transform,box-shadow,filter] duration-200 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const getActiveInteractionWindow = (): Window => {
  if (typeof window === "undefined") {
    throw new Error("Cửa sổ trình duyệt chưa sẵn sàng");
  }

  const browserWindow = window as WindowWithDocumentPictureInPicture;
  const pictureInPictureWindow = browserWindow.documentPictureInPicture?.window;

  if (pictureInPictureWindow && !pictureInPictureWindow.closed) {
    return pictureInPictureWindow;
  }

  return window;
};

const IMPORT_BACKUP_INPUT_ID = "local-products-backup-input";
const RESTORE_BACKUP_AFTER_RELOAD_KEY =
  "local-products-restore-backup-after-reload";

const LoadingOverlay = ({ text }: { text: string }) => {
  return (
    <div
      className="fixed inset-0 z-[999998] flex h-dvh w-full items-center justify-center bg-[#03070d]/[0.9] backdrop-blur-xl"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div aria-hidden="true" className="relative h-24 w-24">
        <div className="absolute inset-0 animate-[spin_2.4s_linear_infinite] border-2 border-[#e6cf8b]/80 border-r-transparent shadow-[0_0_30px_rgba(230,207,139,0.24)] [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]" />
        <div className="absolute inset-[10px] animate-[spin_1.8s_linear_infinite_reverse] border border-[#f3e5ba]/55 border-b-transparent [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]" />
        <div className="absolute inset-[24px] animate-[spin_1.2s_linear_infinite] border border-slate-300/40 border-l-transparent [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#e6cf8b]/40 to-transparent" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-[#f3e5ba]/35 to-transparent" />
        <div className="absolute inset-[39px] animate-pulse bg-[#f3e5ba] shadow-[0_0_24px_rgba(230,207,139,0.7)] [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]" />
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
};

const waitForUiPaint = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.resolve();

  const interactionWindow = getActiveInteractionWindow();

  return new Promise((resolve) => {
    interactionWindow.requestAnimationFrame(() => {
      interactionWindow.setTimeout(resolve, 0);
    });
  });
};

const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === "AbortError";
};

const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";

  const units = ["B", "KB", "MB", "GB"] as const;
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** unitIndex;

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
};

const copyStylesToDocument = (
  sourceDocument: Document,
  targetDocument: Document,
): void => {
  const styleNodes = sourceDocument.querySelectorAll(
    'link[rel="stylesheet"], style',
  );

  styleNodes.forEach((node) => {
    targetDocument.head.appendChild(node.cloneNode(true));
  });

  Array.from(sourceDocument.documentElement.attributes).forEach((attribute) => {
    targetDocument.documentElement.setAttribute(attribute.name, attribute.value);
  });

  const viewport = targetDocument.createElement("meta");

  viewport.name = "viewport";
  viewport.content = "width=device-width, initial-scale=1";
  targetDocument.head.appendChild(viewport);

  targetDocument.documentElement.style.backgroundColor = "#0b1220";
  targetDocument.body.style.margin = "0";
  targetDocument.body.style.minWidth = "320px";
  targetDocument.body.style.backgroundColor = "#0b1220";
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!target) return false;

  const editableTarget = target as EventTarget & {
    tagName?: string;
    isContentEditable?: boolean;
    closest?: (selector: string) => Element | null;
  };

  const tagName = editableTarget.tagName?.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    editableTarget.isContentEditable === true ||
    Boolean(editableTarget.closest?.('[contenteditable="true"]'))
  );
};

const Toastify = (
  message: string | Record<string, string>,
  statusCode: number,
): void => {
  const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    style: {
      zIndex: 999999,
      marginTop: "0",
    },
  };

  const showToast = (text: string): void => {
    if (statusCode >= 200 && statusCode < 300) {
      toast.success(text, toastOptions);
      return;
    }

    if (statusCode >= 300 && statusCode < 400) {
      toast.warning(text, toastOptions);
      return;
    }

    if (statusCode >= 400) {
      toast.error(text, toastOptions);
      return;
    }

    toast.info(text, toastOptions);
  };

  if (typeof message === "string") {
    showToast(message);
    return;
  }

  Object.values(message).forEach(showToast);
};

const getTodayString = (): string => {
  return new Date().toISOString().slice(0, 10);
};

const getCurrentTimeString = (): string => {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const normalizeTextKey = (value: string): string => {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
};

const normalizeCategoryName = (value: string): string => {
  return value.trim().replace(/\s+/g, " ");
};

const DONE_PRODUCT_PREFIX = "✅";

const hasDoneProductPrefix = (name: string): boolean => {
  return name.trim().startsWith(DONE_PRODUCT_PREFIX);
};

const removeDoneProductPrefix = (name: string): string => {
  return name.replace(/^✅\s*/u, "").trim();
};

const addDoneProductPrefix = (name: string): string => {
  const cleanName = removeDoneProductPrefix(name);

  return cleanName
    ? `${DONE_PRODUCT_PREFIX} ${cleanName}`
    : DONE_PRODUCT_PREFIX;
};

const normalizeDoneProductName = (name: string, isDone: boolean): string => {
  return isDone ? addDoneProductPrefix(name) : removeDoneProductPrefix(name);
};

const getTaskName = (config: ScheduleConfig, taskIndex: number): string => {
  const name = config.taskNames[taskIndex]?.trim();

  return name || `Task ${taskIndex + 1}`;
};

const createScheduleAssignmentKey = (
  date: string,
  slotIndex: number,
  taskIndex: number,
): string => {
  return `${date}::task${taskIndex + 1}::slot${slotIndex + 1}`;
};

const createLegacyScheduleAssignmentKey = (
  date: string,
  time: string,
  taskIndex: number,
): string => {
  return `${date}::task${taskIndex + 1}::${time}`;
};

const createPostedKey = (
  date: string,
  slotIndex: number,
  taskIndex = 0,
): string => {
  return createScheduleAssignmentKey(date, slotIndex, taskIndex);
};

const createLegacyPostedProductKey = (
  date: string,
  productId: string,
  taskIndex = 0,
): string => {
  return `${date}::task${taskIndex + 1}::${productId}`;
};

const createLegacyPostedKey = (date: string, productId: string): string => {
  return `${date}::${productId}`;
};

const createSlotPostedKey = (slot: ScheduleSlot, taskIndex = 0): string => {
  return createLegacyPostedProductKey(slot.date, slot.productId, taskIndex);
};

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error("Không thể mở IndexedDB"));
    };

    request.onblocked = () => {
      reject(
        new Error(
          "IndexedDB đang bị khóa bởi một tab khác. Hãy đóng các tab đang mở ứng dụng rồi thử lại.",
        ),
      );
    };

    request.onsuccess = () => {
      const database = request.result;

      database.onversionchange = () => {
        database.close();
      };

      resolve(database);
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };
  });
};

const getTransactionError = (
  transaction: IDBTransaction,
  fallbackMessage: string,
): Error => {
  return transaction.error ?? new Error(fallbackMessage);
};

const getAllProductsFromDb = async (): Promise<LocalProduct[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    let rawProducts: unknown[] = [];

    request.onsuccess = () => {
      rawProducts = request.result as unknown[];
    };

    request.onerror = () => {
      transaction.abort();
    };

    transaction.oncomplete = () => {
      database.close();
      resolve(normalizeProductsArray(rawProducts));
    };

    transaction.onerror = () => {
      const error = getTransactionError(
        transaction,
        "Không thể đọc danh sách sản phẩm",
      );
      database.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error = getTransactionError(
        transaction,
        "Quá trình đọc IndexedDB đã bị hủy",
      );
      database.close();
      reject(error);
    };
  });
};

const saveProductToDb = async (product: LocalProduct): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put(product);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      const error = getTransactionError(transaction, "Không thể lưu sản phẩm");
      database.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error = getTransactionError(
        transaction,
        "Quá trình lưu sản phẩm đã bị hủy",
      );
      database.close();
      reject(error);
    };
  });
};

const deleteProductFromDb = async (id: string): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.delete(id);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      const error = getTransactionError(transaction, "Không thể xóa sản phẩm");
      database.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error = getTransactionError(
        transaction,
        "Quá trình xóa sản phẩm đã bị hủy",
      );
      database.close();
      reject(error);
    };
  });
};

const replaceAllProductsInDb = async (
  products: LocalProduct[],
): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.clear();

    products.forEach((product) => {
      store.put(product);
    });

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      const error = getTransactionError(
        transaction,
        "Không thể thay thế dữ liệu trong IndexedDB",
      );
      database.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error = getTransactionError(
        transaction,
        "Import IndexedDB đã bị hủy. Dữ liệu cũ được giữ nguyên.",
      );
      database.close();
      reject(error);
    };
  });
};

const LOCAL_PRODUCT_STORAGE_KEYS = [
  SETTINGS_KEY,
  POSTED_KEY,
  SCHEDULE_CONFIG_KEY,
  SCHEDULE_ASSIGNMENTS_KEY,
] as const;

const clearLocalProductStorage = (): void => {
  if (typeof window === "undefined") return;

  LOCAL_PRODUCT_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
};

const clearAllLocalProductData = async (): Promise<void> => {
  await replaceAllProductsInDb([]);
  clearLocalProductStorage();
};

const normalizeContactOptions = (value: unknown): ContactOption[] => {
  if (!Array.isArray(value)) return [];

  const usedIds = new Set<string>();

  return value.reduce<ContactOption[]>((options, item, index) => {
    if (typeof item !== "object" || item === null) return options;

    const record = item as Record<string, unknown>;
    const text = typeof record.text === "string" ? record.text.trim() : "";
    const rawId = typeof record.id === "string" ? record.id.trim() : "";
    const id = rawId || `contact-${index + 1}`;

    if (!text || usedIds.has(id)) return options;

    usedIds.add(id);
    options.push({ id, text });

    return options;
  }, []);
};

const extractSocialTagText = (value: string): string => {
  const matches = value.match(/#[\p{L}\p{N}_]+/gu) ?? [];

  return Array.from(new Set(matches)).join(" ");
};

const removeSocialTags = (value: string): string => {
  return value
    .replace(/#[\p{L}\p{N}_]+/gu, "")
    .split(/\r?\n/u)
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
};

const loadGlobalSettings = (): GlobalSettings => {
  if (typeof window === "undefined") return defaultSettings;

  const raw = localStorage.getItem(SETTINGS_KEY);

  if (!raw) return defaultSettings;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) return defaultSettings;

    const record = parsed as Record<string, unknown>;

    const contactOptions = normalizeContactOptions(record.contactOptions);
    const selectedContactId =
      typeof record.selectedContactId === "string" &&
        contactOptions.some(
          (option) => option.id === record.selectedContactId,
        )
        ? record.selectedContactId
        : "";

    return {
      commonDescription:
        typeof record.commonDescription === "string"
          ? record.commonDescription
          : "",
      globalNote:
        typeof record.globalNote === "string" ? record.globalNote : "",
      contactOptions,
      selectedContactId,
      includeSocialTags:
        typeof record.includeSocialTags === "boolean"
          ? record.includeSocialTags
          : false,
      updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : "",
    };
  } catch {
    return defaultSettings;
  }
};

const saveGlobalSettings = (settings: GlobalSettings): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const loadPostedRecords = (): PostedRecord[] => {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(POSTED_KEY);

  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is PostedRecord => {
      if (typeof item !== "object" || item === null) return false;

      const record = item as Record<string, unknown>;

      return (
        typeof record.slotId === "string" && typeof record.postedAt === "string"
      );
    });
  } catch {
    return [];
  }
};

const savePostedRecords = (records: PostedRecord[]): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(POSTED_KEY, JSON.stringify(records));
};

const loadScheduleConfig = (): ScheduleConfig => {
  const today = getTodayString();

  if (typeof window === "undefined") {
    return {
      ...defaultScheduleConfig,
      dateFrom: today,
      dateTo: today,
    };
  }

  const raw = localStorage.getItem(SCHEDULE_CONFIG_KEY);

  if (!raw) {
    return {
      ...defaultScheduleConfig,
      dateFrom: today,
      dateTo: today,
    };
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) {
      return {
        ...defaultScheduleConfig,
        dateFrom: today,
        dateTo: today,
      };
    }

    const record = parsed as Record<string, unknown>;
    const selectedCategories = Array.isArray(record.selectedCategories)
      ? Array.from(
        new Map(
          record.selectedCategories
            .filter((item): item is string => typeof item === "string")
            .map((item) => [
              normalizeTextKey(item),
              normalizeCategoryName(item),
            ]),
        ).values(),
      ).filter(Boolean)
      : [];
    const taskNames = Array.isArray(record.taskNames)
      ? record.taskNames.filter(
        (item): item is string => typeof item === "string",
      )
      : [];

    return {
      dateFrom:
        typeof record.dateFrom === "string" && record.dateFrom
          ? record.dateFrom
          : today,
      dateTo:
        typeof record.dateTo === "string" && record.dateTo
          ? record.dateTo
          : today,
      startTime:
        typeof record.startTime === "string" && record.startTime
          ? record.startTime
          : defaultScheduleConfig.startTime,
      endTime:
        typeof record.endTime === "string" && record.endTime
          ? record.endTime
          : defaultScheduleConfig.endTime,
      gapHours:
        typeof record.gapHours === "number" && Number.isFinite(record.gapHours)
          ? record.gapHours
          : defaultScheduleConfig.gapHours,
      taskCount:
        typeof record.taskCount === "number" &&
          Number.isFinite(record.taskCount)
          ? Math.max(1, Math.min(64, Math.round(record.taskCount)))
          : defaultScheduleConfig.taskCount,
      taskNames,
      selectedCategories,
    };
  } catch {
    return {
      ...defaultScheduleConfig,
      dateFrom: today,
      dateTo: today,
    };
  }
};

const saveScheduleConfig = (config: ScheduleConfig): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(SCHEDULE_CONFIG_KEY, JSON.stringify(config));
};

const loadScheduleAssignments = (): ScheduleAssignmentMap => {
  if (typeof window === "undefined") return {};

  const raw = localStorage.getItem(SCHEDULE_ASSIGNMENTS_KEY);

  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return {};

    const record = parsed as Record<string, unknown>;
    const result: ScheduleAssignmentMap = {};

    Object.entries(record).forEach(([key, value]) => {
      if (typeof value === "string") {
        result[key] = value;
      }
    });

    return result;
  } catch {
    return {};
  }
};

const saveScheduleAssignments = (assignments: ScheduleAssignmentMap): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(SCHEDULE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
};

const parsePriceNumber = (priceText: string): number => {
  const normalized = priceText
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/,/g, ".")
    .replace("triệu", "tr")
    .replace("ty", "tỷ");

  if (!normalized) return 0;

  if (normalized.includes("tr")) {
    const value = Number(normalized.replace("tr", ""));
    return Number.isFinite(value) ? Math.round(value * 1_000_000) : 0;
  }

  if (normalized.includes("tỷ")) {
    const value = Number(normalized.replace("tỷ", ""));
    return Number.isFinite(value) ? Math.round(value * 1_000_000_000) : 0;
  }

  const value = Number(normalized.replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : 0;
};

const getSortablePrice = (product: LocalProduct): number => {
  if (product.price > 0) return product.price;

  return Number.MAX_SAFE_INTEGER;
};

const getProductDoneSortValue = (
  product: LocalProduct,
  pendingDoneProductIds: Set<string>,
): number => {
  if (!product.isDone) return 0;

  return pendingDoneProductIds.has(product.id) ? 0 : 1;
};

const sortProductsByDoneThenUpdated = (
  items: LocalProduct[],
  pendingDoneProductIds: Set<string> = new Set<string>(),
): LocalProduct[] => {
  return [...items].sort((firstProduct, secondProduct) => {
    const doneDiff =
      getProductDoneSortValue(firstProduct, pendingDoneProductIds) -
      getProductDoneSortValue(secondProduct, pendingDoneProductIds);

    if (doneDiff !== 0) return doneDiff;

    const updatedDiff =
      new Date(secondProduct.updatedAt).getTime() -
      new Date(firstProduct.updatedAt).getTime();

    if (updatedDiff !== 0) return updatedDiff;

    return normalizeTextKey(firstProduct.name).localeCompare(
      normalizeTextKey(secondProduct.name),
      "vi",
    );
  });
};

const sortProductsByDoneThenPrice = (
  items: LocalProduct[],
  pendingDoneProductIds: Set<string> = new Set<string>(),
): LocalProduct[] => {
  return [...items].sort((firstProduct, secondProduct) => {
    const doneDiff =
      getProductDoneSortValue(firstProduct, pendingDoneProductIds) -
      getProductDoneSortValue(secondProduct, pendingDoneProductIds);

    if (doneDiff !== 0) return doneDiff;

    const priceDiff =
      getSortablePrice(firstProduct) - getSortablePrice(secondProduct);

    if (priceDiff !== 0) return priceDiff;

    return normalizeTextKey(firstProduct.name).localeCompare(
      normalizeTextKey(secondProduct.name),
      "vi",
    );
  });
};

const sortProductsByCategoryThenDoneThenPrice = (
  items: LocalProduct[],
  pendingDoneProductIds: Set<string> = new Set<string>(),
): LocalProduct[] => {
  return [...items].sort((firstProduct, secondProduct) => {
    const categoryDiff = normalizeTextKey(
      firstProduct.category || "Chưa phân loại",
    ).localeCompare(
      normalizeTextKey(secondProduct.category || "Chưa phân loại"),
      "vi",
    );

    if (categoryDiff !== 0) return categoryDiff;

    const doneDiff =
      getProductDoneSortValue(firstProduct, pendingDoneProductIds) -
      getProductDoneSortValue(secondProduct, pendingDoneProductIds);

    if (doneDiff !== 0) return doneDiff;

    const priceDiff =
      getSortablePrice(firstProduct) - getSortablePrice(secondProduct);

    if (priceDiff !== 0) return priceDiff;

    return normalizeTextKey(firstProduct.name).localeCompare(
      normalizeTextKey(secondProduct.name),
      "vi",
    );
  });
};

const createGroupedProducts = (
  items: LocalProduct[],
  pendingDoneProductIds: Set<string> = new Set<string>(),
): {
  category: string;
  products: LocalProduct[];
  lowestPrice: number;
}[] => {
  const groupedMap = new Map<
    string,
    { category: string; products: LocalProduct[] }
  >();

  items.forEach((product) => {
    const category =
      normalizeCategoryName(product.category) || "Chưa phân loại";
    const categoryKey = normalizeTextKey(category);
    const currentGroup = groupedMap.get(categoryKey);

    if (!currentGroup) {
      groupedMap.set(categoryKey, {
        category,
        products: [product],
      });
      return;
    }

    currentGroup.products.push(product);
  });

  return Array.from(groupedMap.values())
    .map((group) => {
      const sortedProducts = sortProductsByDoneThenPrice(
        group.products,
        pendingDoneProductIds,
      );

      return {
        category: group.category,
        products: sortedProducts,
        lowestPrice: Math.min(...sortedProducts.map(getSortablePrice)),
      };
    })
    .sort((firstGroup, secondGroup) =>
      normalizeTextKey(firstGroup.category).localeCompare(
        normalizeTextKey(secondGroup.category),
        "vi",
      ),
    );
};

const buildCopyableProductListText = (
  groups: {
    category: string;
    products: LocalProduct[];
  }[],
): string => {
  return groups
    .map((group) => {
      const lines = group.products.map((product, index) => {
        const price = product.priceText.trim();

        return [
          `${index + 1}. ${removeDoneProductPrefix(product.name)}`,
          price ? `Giá: ${price}` : "",
        ]
          .filter(Boolean)
          .join(" | ");
      });

      return [`📌 ${group.category}`, ...lines].join("\n");
    })
    .join("\n\n");
};

const escapeCsvCell = (value: string): string => {
  return `"${value.replace(/"/g, '""')}"`;
};

const buildProductsCsvContent = (
  groups: {
    category: string;
    products: LocalProduct[];
  }[],
): string => {
  const rows = [["Danh mục", "STT", "Tên sản phẩm", "Giá"]];

  groups.forEach((group) => {
    group.products.forEach((product, index) => {
      rows.push([
        group.category,
        String(index + 1),
        removeDoneProductPrefix(product.name),
        product.priceText,
      ]);
    });
  });

  return `\ufeffsep=,\n${rows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n")}`;
};

const fileToCompressedDataUrl = async (file: File): Promise<string> => {
  const imageBitmap = await createImageBitmap(file);

  const maxWidth = 1600;
  const scale = imageBitmap.width > maxWidth ? maxWidth / imageBitmap.width : 1;

  const width = Math.round(imageBitmap.width * scale);
  const height = Math.round(imageBitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Không thể xử lý ảnh");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(imageBitmap, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.92);
};

const convertFilesToImages = async (files: File[]): Promise<ProductImage[]> => {
  const validFiles = files.filter((file) => file.type.startsWith("image/"));

  return Promise.all(
    validFiles.map(async (file, index) => {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const dataUrl = await fileToCompressedDataUrl(file);

      return {
        id,
        name: createSystemImageFilename(index, id),
        dataUrl,
        size: file.size,
        type: "image/jpeg",
        createdAt: now,
      };
    }),
  );
};

const normalizeImages = (value: unknown): ProductImage[] => {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is ProductImage => {
    if (typeof item !== "object" || item === null) return false;

    const record = item as Record<string, unknown>;

    return (
      typeof record.id === "string" &&
      typeof record.name === "string" &&
      typeof record.dataUrl === "string" &&
      typeof record.size === "number" &&
      typeof record.type === "string" &&
      typeof record.createdAt === "string"
    );
  });
};

const normalizeProduct = (value: unknown): LocalProduct | null => {
  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;

  if (typeof record.id !== "string") return null;
  if (typeof record.name !== "string") return null;

  const priceText =
    typeof record.priceText === "string" ? record.priceText : "";
  const description =
    typeof record.description === "string" ? record.description : "";
  const pin = typeof record.pin === "string" ? record.pin : "";
  const status = typeof record.status === "string" ? record.status : "";
  const category = typeof record.category === "string" ? record.category : "";
  const isDone =
    typeof record.isDone === "boolean"
      ? record.isDone
      : hasDoneProductPrefix(record.name);

  return {
    id: record.id,
    name: normalizeDoneProductName(record.name, isDone),
    description,
    pin,
    status,
    price:
      typeof record.price === "number"
        ? record.price
        : parsePriceNumber(priceText),
    priceText,
    category,
    images: normalizeImages(record.images),
    internalImages: normalizeImages(record.internalImages),
    isDone,
    doneAt: typeof record.doneAt === "string" ? record.doneAt : "",
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof record.updatedAt === "string"
        ? record.updatedAt
        : new Date().toISOString(),
  };
};

const normalizeProductsArray = (value: unknown): LocalProduct[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => normalizeProduct(item))
    .filter((item): item is LocalProduct => item !== null);
};

const normalizeGlobalSettings = (
  value: unknown,
): GlobalSettings | undefined => {
  if (typeof value !== "object" || value === null) return undefined;

  const record = value as Record<string, unknown>;
  const contactOptions = normalizeContactOptions(record.contactOptions);
  const selectedContactId =
    typeof record.selectedContactId === "string" &&
      contactOptions.some((option) => option.id === record.selectedContactId)
      ? record.selectedContactId
      : "";

  return {
    commonDescription:
      typeof record.commonDescription === "string"
        ? record.commonDescription
        : "",
    globalNote: typeof record.globalNote === "string" ? record.globalNote : "",
    contactOptions,
    selectedContactId,
    includeSocialTags:
      typeof record.includeSocialTags === "boolean"
        ? record.includeSocialTags
        : false,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : "",
  };
};

const normalizeScheduleConfig = (
  value: unknown,
): ScheduleConfig | undefined => {
  if (typeof value !== "object" || value === null) return undefined;

  const record = value as Record<string, unknown>;
  const taskNames = Array.isArray(record.taskNames)
    ? record.taskNames.filter(
      (item): item is string => typeof item === "string",
    )
    : defaultScheduleConfig.taskNames;
  const selectedCategories = Array.isArray(record.selectedCategories)
    ? Array.from(
      new Map(
        record.selectedCategories
          .filter((item): item is string => typeof item === "string")
          .map((item) => [
            normalizeTextKey(item),
            normalizeCategoryName(item),
          ]),
      ).values(),
    ).filter(Boolean)
    : [];

  return {
    dateFrom:
      typeof record.dateFrom === "string" && record.dateFrom
        ? record.dateFrom
        : getTodayString(),
    dateTo:
      typeof record.dateTo === "string" && record.dateTo
        ? record.dateTo
        : getTodayString(),
    startTime:
      typeof record.startTime === "string" && record.startTime
        ? record.startTime
        : defaultScheduleConfig.startTime,
    endTime:
      typeof record.endTime === "string" && record.endTime
        ? record.endTime
        : defaultScheduleConfig.endTime,
    gapHours:
      typeof record.gapHours === "number" && Number.isFinite(record.gapHours)
        ? record.gapHours
        : defaultScheduleConfig.gapHours,
    taskCount:
      typeof record.taskCount === "number" && Number.isFinite(record.taskCount)
        ? Math.max(1, Math.min(64, Math.round(record.taskCount)))
        : defaultScheduleConfig.taskCount,
    taskNames,
    selectedCategories,
  };
};

const normalizeScheduleAssignments = (
  value: unknown,
): ScheduleAssignmentMap | undefined => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const result: ScheduleAssignmentMap = {};

  Object.entries(record).forEach(([key, assignmentValue]) => {
    if (typeof assignmentValue === "string") {
      result[key] = assignmentValue;
    }
  });

  return result;
};

const normalizePostedRecords = (value: unknown): PostedRecord[] | undefined => {
  if (!Array.isArray(value)) return undefined;

  return value.filter((item): item is PostedRecord => {
    if (typeof item !== "object" || item === null) return false;

    const record = item as Record<string, unknown>;

    return (
      typeof record.slotId === "string" && typeof record.postedAt === "string"
    );
  });
};

const parseImportPayload = (value: unknown): ParsedImportPayload | null => {
  if (Array.isArray(value)) {
    const products = normalizeProductsArray(value);

    if (products.length === 0) return null;

    return {
      products,
    };
  }

  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;
  const products = normalizeProductsArray(record.products);

  if (products.length === 0) return null;

  return {
    settings: normalizeGlobalSettings(record.settings),
    products,
    scheduleConfig: normalizeScheduleConfig(record.scheduleConfig),
    scheduleAssignments: normalizeScheduleAssignments(
      record.scheduleAssignments,
    ),
    postedRecords: normalizePostedRecords(record.postedRecords),
  };
};

const copyTextWithExecCommand = (
  interactionWindow: Window,
  value: string,
): boolean => {
  const targetDocument = interactionWindow.document;
  const textarea = targetDocument.createElement("textarea");

  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  textarea.style.opacity = "0";

  targetDocument.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = targetDocument.execCommand("copy");

  textarea.remove();
  return copied;
};

const copyText = async (value: string): Promise<void> => {
  const interactionWindow = getActiveInteractionWindow();
  const clipboard = interactionWindow.navigator.clipboard;

  if (clipboard) {
    try {
      await clipboard.writeText(value);
      return;
    } catch {
      // Dùng fallback trong chính cửa sổ đang nhận thao tác.
    }
  }

  if (copyTextWithExecCommand(interactionWindow, value)) {
    return;
  }

  throw new Error("Không thể copy. Hãy kiểm tra quyền clipboard của trình duyệt.");
};

const getSelectedContactText = (settings: GlobalSettings): string => {
  return (
    settings.contactOptions.find(
      (option) => option.id === settings.selectedContactId,
    )?.text.trim() ?? ""
  );
};

const composeCopyText = (
  value: string,
  contactText: string,
  includeSocialTags: boolean,
  socialTagSource = value,
): string => {
  const cleanValue = removeSocialTags(value);
  const cleanContactText = contactText.trim();
  const cleanSocialTagText = includeSocialTags
    ? extractSocialTagText(socialTagSource)
    : "";
  const sections = cleanValue ? [cleanValue] : [];

  if (
    cleanContactText &&
    !sections.join("\n\n").endsWith(cleanContactText)
  ) {
    sections.push(cleanContactText);
  }

  if (
    cleanSocialTagText &&
    !sections.join("\n\n").endsWith(cleanSocialTagText)
  ) {
    sections.push(cleanSocialTagText);
  }

  return sections.join("\n\n");
};

const buildPostText = (
  product: LocalProduct,
  commonDescription: string,
  contactText: string,
  includeSocialTags: boolean,
): string => {
  const description = product.description.trim() || commonDescription.trim();

  const lines = [
    product.name,
    product.priceText ? `Giá: ${product.priceText}` : "",
    product.category ? `Danh mục: ${product.category}` : "",
    description,
  ].filter(Boolean);

  return composeCopyText(lines.join("\n"), contactText, includeSocialTags);
};

const normalizeCommentPrice = (priceText: string): string => {
  const cleanPrice = priceText
    .trim()
    .replace(/^📌?\s*giá\s*:\s*/iu, "")
    .trim();

  if (!cleanPrice) return "";

  if (/liên\s*hệ/iu.test(cleanPrice)) {
    return cleanPrice;
  }

  const normalizedPrice = cleanPrice
    .replace(/\s*(triệu|trieu)\s*$/iu, "tr")
    .replace(/\s*tr\s*$/iu, "tr")
    .replace(/,/g, ".")
    .replace(/\s+/g, "");

  return /tr$/iu.test(normalizedPrice)
    ? normalizedPrice
    : `${normalizedPrice}tr`;
};

const buildCommentContentText = (
  title: string,
  description: string,
  priceText: string,
  contactText: string,
): string => {
  const cleanTitle = title.trim();
  const commentPrice = normalizeCommentPrice(priceText);
  const plusLines = description
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("+"));

  const headingLines = [
    cleanTitle,
    commentPrice ? `📌Giá: ${commentPrice}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const content = [
    headingLines,
    plusLines.length > 0 ? plusLines.join("\n") : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return composeCopyText(
    content,
    contactText,
    false,
    description,
  );
};

const createImageFilenameSuffix = (imageId: string): string => {
  const normalizedId = imageId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);

  if (normalizedId) return normalizedId;

  return String(Math.floor(Math.random() * 900) + 100);
};

const createSystemImageFilename = (index: number, imageId: string): string => {
  return `sanpham${index + 1}-${createImageFilenameSuffix(imageId)}.jpg`;
};

const renameImagesByOrder = (images: ProductImage[]): ProductImage[] => {
  return images.map((image, index) => ({
    ...image,
    name: createSystemImageFilename(index, image.id),
  }));
};

const renameInternalImagesByOrder = (
  images: ProductImage[],
): ProductImage[] => {
  return images.map((image, index) => ({
    ...image,
    name: `anh-noi-bo-${index + 1}-${createImageFilenameSuffix(image.id)}.jpg`,
  }));
};

const renameDraftImagesByField = (
  images: ProductImage[],
  imageField: ProductImageField,
): ProductImage[] => {
  return imageField === "internalImages"
    ? renameInternalImagesByOrder(images)
    : renameImagesByOrder(images);
};

const convertDataUrlToJpeg = async (dataUrl: string): Promise<string> => {
  if (dataUrl.startsWith("data:image/jpeg")) {
    return dataUrl;
  }

  return new Promise((resolve, reject) => {
    const image = document.createElement("img");

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Không thể convert ảnh sang JPG"));
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };

    image.onerror = () => {
      reject(new Error("Không thể đọc ảnh"));
    };

    image.src = dataUrl;
  });
};

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);

  return response.blob();
};

const getNativeShareNavigator = (): NativeShareNavigator | null => {
  if (typeof navigator === "undefined") return null;

  return navigator as NativeShareNavigator;
};

const dataUrlToShareFile = async (
  dataUrl: string,
  fileName: string,
): Promise<File> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const fallbackType = dataUrl.startsWith("data:image/png")
    ? "image/png"
    : "image/jpeg";

  return new File([blob], fileName || "sanpham.jpg", {
    type: blob.type || fallbackType,
  });
};

const dataUrlToPngBlob = async (dataUrl: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = document.createElement("img");

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Không thể xử lý ảnh để copy"));
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Không thể tạo ảnh PNG để copy"));
          return;
        }

        resolve(blob);
      }, "image/png");
    };

    image.onerror = () => {
      reject(new Error("Không thể đọc ảnh để copy"));
    };

    image.src = dataUrl;
  });
};

const copyImageToClipboard = async (image: ProductImage): Promise<void> => {
  if (typeof window === "undefined") {
    throw new Error("Clipboard chỉ hoạt động trên trình duyệt");
  }

  const interactionWindow =
    getActiveInteractionWindow() as ClipboardCapableWindow;
  const clipboard = interactionWindow.navigator.clipboard;
  const ClipboardItemClass =
    interactionWindow.ClipboardItem ??
    (typeof ClipboardItem !== "undefined"
      ? (ClipboardItem as ClipboardItemConstructor)
      : undefined);

  if (!clipboard || !ClipboardItemClass) {
    throw new Error("Trình duyệt chưa hỗ trợ copy ảnh vào clipboard");
  }

  const pngBlobPromise = dataUrlToPngBlob(image.dataUrl);

  await clipboard.write([
    new ClipboardItemClass({
      "image/png": pngBlobPromise,
    }),
  ]);
};

const downloadDataUrl = (dataUrl: string, filename: string): void => {
  const targetDocument = getActiveInteractionWindow().document;
  const link = targetDocument.createElement("a");

  link.href = dataUrl;
  link.download = filename;

  targetDocument.body.appendChild(link);
  link.click();
  link.remove();
};

const downloadImageAsJpg = async (
  image: ProductImage,
  index: number,
): Promise<void> => {
  const jpegDataUrl = await convertDataUrlToJpeg(image.dataUrl);

  downloadDataUrl(jpegDataUrl, createSystemImageFilename(index, image.id));
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const interactionWindow = getActiveInteractionWindow();
  const targetDocument = interactionWindow.document;
  const link = targetDocument.createElement("a");

  link.href = url;
  link.download = filename;
  link.rel = "noopener";

  targetDocument.body.appendChild(link);
  link.click();
  link.remove();

  // Safari iPhone có thể chưa tiếp nhận xong Blob nếu URL bị thu hồi ngay.
  interactionWindow.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
};

const saveBackupBlob = async (
  blob: Blob,
  filename: string,
): Promise<"shared" | "downloaded"> => {
  const shareNavigator = getNativeShareNavigator();

  if (shareNavigator?.share && shareNavigator.canShare) {
    const file = new File([blob], filename, {
      type: blob.type || "application/octet-stream",
      lastModified: Date.now(),
    });
    const shareData: NativeShareData = {
      title: filename,
      files: [file],
    };

    try {
      if (shareNavigator.canShare(shareData)) {
        await shareNavigator.share(shareData);
        return "shared";
      }
    } catch (error) {
      if (isAbortError(error)) throw error;
      // Nếu Share Sheet không mở được, chuyển sang tải Blob thông thường.
    }
  }

  downloadBlob(blob, filename);
  return "downloaded";
};

const createExportPayload = (params: {
  settings: GlobalSettings;
  products: LocalProduct[];
  scheduleConfig: ScheduleConfig;
  scheduleAssignments: ScheduleAssignmentMap;
  postedRecords: PostedRecord[];
}): ExportPayload => {
  return {
    version: 8,
    settings: params.settings,
    products: params.products,
    scheduleConfig: params.scheduleConfig,
    scheduleAssignments: params.scheduleAssignments,
    postedRecords: params.postedRecords,
  };
};

const createBackupFileName = (extension: "json" | "json.gz"): string => {
  const safeDate = new Date().toISOString().replace(/[:.]/g, "-");

  return `local-products-${safeDate}.${extension}`;
};

const textToGzipBlob = async (text: string): Promise<Blob> => {
  if (typeof CompressionStream === "undefined") {
    throw new Error("Trình duyệt chưa hỗ trợ nén gzip");
  }

  const stream = new Blob([text], {
    type: "application/json;charset=utf-8",
  })
    .stream()
    .pipeThrough(new CompressionStream("gzip"));

  return new Response(stream).blob();
};

const gzipBlobToText = async (blob: Blob): Promise<string> => {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("Trình duyệt chưa hỗ trợ giải nén gzip");
  }

  const stream = blob.stream().pipeThrough(new DecompressionStream("gzip"));

  return new Response(stream).text();
};

const isGzipFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();

  return (
    fileName.endsWith(".gz") ||
    fileName.endsWith(".json.gz") ||
    file.type === "application/gzip" ||
    file.type === "application/x-gzip"
  );
};

const readJsonOrGzipFileText = async (file: File): Promise<string> => {
  if (isGzipFile(file)) {
    return gzipBlobToText(file);
  }

  return file.text();
};

const parseJsonTextToPayload = (text: string): ParsedImportPayload | null => {
  const parsed: unknown = JSON.parse(text);

  return parseImportPayload(parsed);
};

const restorePayloadToLocal = async (
  payload: ParsedImportPayload,
  params: {
    setSettings: (settings: GlobalSettings) => void;
    setScheduleConfig: (config: ScheduleConfig) => void;
    setScheduleAssignments: (assignments: ScheduleAssignmentMap) => void;
    setPostedRecords: (records: PostedRecord[]) => void;
    loadProducts: () => Promise<void>;
  },
): Promise<void> => {
  const today = getTodayString();
  const nextSettings = payload.settings ?? {
    ...defaultSettings,
    contactOptions: [],
  };
  const nextScheduleConfig = payload.scheduleConfig ?? {
    ...defaultScheduleConfig,
    dateFrom: today,
    dateTo: today,
    taskNames: [...defaultScheduleConfig.taskNames],
    selectedCategories: [],
  };
  const nextScheduleAssignments = payload.scheduleAssignments ?? {};
  const nextPostedRecords = payload.postedRecords ?? [];

  // Clear và ghi mới trong cùng một transaction để IndexedDB tự rollback khi lỗi.
  await replaceAllProductsInDb(payload.products);
  clearLocalProductStorage();

  params.setSettings(nextSettings);
  saveGlobalSettings(nextSettings);

  params.setScheduleConfig(nextScheduleConfig);
  saveScheduleConfig(nextScheduleConfig);

  params.setScheduleAssignments(nextScheduleAssignments);
  saveScheduleAssignments(nextScheduleAssignments);

  params.setPostedRecords(nextPostedRecords);
  savePostedRecords(nextPostedRecords);

  await params.loadProducts();
};

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: () => Promise<{
    getFileHandle: (
      name: string,
      options?: { create?: boolean },
    ) => Promise<{
      createWritable: () => Promise<{
        write: (data: Blob) => Promise<void>;
        close: () => Promise<void>;
      }>;
    }>;
  }>;
};

const canUseDirectoryPicker = (): boolean => {
  if (typeof window === "undefined") return false;

  const interactionWindow = getActiveInteractionWindow();

  return (
    typeof (interactionWindow as DirectoryPickerWindow).showDirectoryPicker ===
    "function"
  );
};

const saveImagesToChosenFolder = async (
  request: DownloadRequest,
): Promise<void> => {
  const interactionWindow = getActiveInteractionWindow();
  const directoryPicker = (interactionWindow as DirectoryPickerWindow)
    .showDirectoryPicker;

  if (!directoryPicker) {
    throw new Error("Trình duyệt chưa hỗ trợ chọn thư mục lưu.");
  }

  const directoryHandle = await directoryPicker();

  for (let index = 0; index < request.images.length; index += 1) {
    const image = request.images[index];

    if (!image) continue;

    const jpegDataUrl = await convertDataUrlToJpeg(image.dataUrl);
    const blob = await dataUrlToBlob(jpegDataUrl);
    const fileHandle = await directoryHandle.getFileHandle(
      createSystemImageFilename(request.startIndex + index, image.id),
      { create: true },
    );
    const writable = await fileHandle.createWritable();

    await writable.write(blob);
    await writable.close();
  }
};

const toMinutes = (time: string): number => {
  const [hour, minute] = time.split(":").map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;

  return hour * 60 + minute;
};

const toTimeString = (minutes: number): string => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const getDatesBetween = (dateFrom: string, dateTo: string): string[] => {
  if (!dateFrom || !dateTo) return [];

  const result: string[] = [];
  const current = new Date(`${dateFrom}T00:00:00`);
  const end = new Date(`${dateTo}T00:00:00`);

  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) return [];
  if (current > end) return [];

  while (current <= end) {
    result.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return result;
};

const createDailyTimes = (
  startTime: string,
  endTime: string,
  gapHours: number,
): {
  times: string[];
  warning?: string;
} => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const gap = gapHours * 60;

  if (start > end) {
    return {
      times: [],
      warning: "Mốc đầu đang lớn hơn mốc cuối. Vui lòng chọn lại khung giờ.",
    };
  }

  const times: string[] = [];
  let cursor = start;

  while (cursor <= end) {
    times.push(toTimeString(cursor));
    cursor += gap;
  }

  const lastValid = times[times.length - 1];
  const nextTime = toTimeString(cursor);

  const warning =
    cursor > end && lastValid && toMinutes(lastValid) !== end
      ? `Thông báo giờ: khung giờ hiện tại không chia đều. Mốc gần nhất theo khoảng cách đang chọn là ${lastValid}; mốc kế tiếp sẽ là ${nextTime}.`
      : undefined;

  return {
    times,
    warning,
  };
};

const shuffleProducts = <T,>(items: T[]): T[] => {
  const cloned = [...items];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = cloned[index];

    cloned[index] = cloned[randomIndex];
    cloned[randomIndex] = current;
  }

  return cloned;
};

const createCategoryBalancedProducts = (
  items: LocalProduct[],
): LocalProduct[] => {
  const groupedProducts = new Map<string, LocalProduct[]>();

  shuffleProducts(items).forEach((product) => {
    const categoryKey = normalizeTextKey(product.category || "Chưa phân loại");
    const currentProducts = groupedProducts.get(categoryKey) ?? [];

    groupedProducts.set(categoryKey, [...currentProducts, product]);
  });

  const categoryQueues = Array.from(groupedProducts.entries()).map(
    ([categoryKey, products]) => ({
      categoryKey,
      products: shuffleProducts(products),
    }),
  );
  const result: LocalProduct[] = [];
  let previousCategoryKey = "";

  while (categoryQueues.some((item) => item.products.length > 0)) {
    const availableQueues = categoryQueues
      .filter((item) => item.products.length > 0)
      .sort((first, second) => second.products.length - first.products.length);
    const preferredQueue =
      availableQueues.find(
        (item) => item.categoryKey !== previousCategoryKey,
      ) ?? availableQueues[0];

    if (!preferredQueue) break;

    const product = preferredQueue.products.shift();

    if (!product) continue;

    result.push(product);
    previousCategoryKey = preferredQueue.categoryKey;
  }

  return result;
};

const buildRandomSchedule = (
  products: LocalProduct[],
  config: ScheduleConfig,
  commonDescription: string,
  contactText: string,
  includeSocialTags: boolean,
): BuildScheduleResult => {
  const activeProducts = products.filter((product) => !product.isDone);

  if (activeProducts.length === 0) {
    return {
      slots: [],
      warnings: [],
    };
  }

  const warnings: ScheduleWarning[] = [];

  const selectedCategoryKeys = new Set(
    config.selectedCategories.map((category) => normalizeTextKey(category)),
  );

  const usableProducts =
    config.selectedCategories.length === 0
      ? activeProducts
      : activeProducts.filter((product) =>
        selectedCategoryKeys.has(normalizeTextKey(product.category)),
      );

  if (usableProducts.length === 0) {
    return {
      slots: [],
      warnings: [
        {
          type: "emptyCategory",
          message: "Không có sản phẩm phù hợp để chia lịch.",
        },
      ],
    };
  }

  const dates = getDatesBetween(config.dateFrom, config.dateTo);

  if (dates.length === 0) {
    return {
      slots: [],
      warnings: [
        {
          type: "invalidTime",
          message: "Khoảng ngày chưa hợp lệ.",
        },
      ],
    };
  }

  const dailyTimeResult = createDailyTimes(
    config.startTime,
    config.endTime,
    config.gapHours,
  );

  if (dailyTimeResult.warning) {
    warnings.push({
      type: "overflow",
      message: dailyTimeResult.warning,
    });
  }

  const times = dailyTimeResult.times;

  if (usableProducts.length < times.length) {
    warnings.push({
      type: "notEnoughProducts",
      message: `Mỗi ngày có ${times.length} mốc đăng nhưng chỉ có ${usableProducts.length} sản phẩm khả dụng.`,
    });
  }

  const slots: ScheduleSlot[] = [];
  let previousDayLastTwoProductIds: string[] = [];

  for (const date of dates) {
    const dailyUsedProductIds = new Set<string>();
    let dailyPool = shuffleProducts(usableProducts);

    for (const time of times) {
      const isFirstSlotOfDay = dailyUsedProductIds.size === 0;

      let candidate = dailyPool.find((product) => {
        const duplicatedToday = dailyUsedProductIds.has(product.id);
        const duplicatedWithPreviousDay =
          isFirstSlotOfDay && previousDayLastTwoProductIds.includes(product.id);

        return !duplicatedToday && !duplicatedWithPreviousDay;
      });

      if (!candidate) {
        candidate = dailyPool.find(
          (product) => !dailyUsedProductIds.has(product.id),
        );
      }

      if (!candidate) {
        break;
      }

      const description =
        candidate.description.trim() || commonDescription.trim();
      const postText = buildPostText(
        candidate,
        commonDescription,
        contactText,
        includeSocialTags,
      );

      dailyUsedProductIds.add(candidate.id);

      slots.push({
        id: `${date}-${time}-${candidate.id}`,
        date,
        time,
        productId: candidate.id,
        productName: candidate.name,
        category: candidate.category,
        image: candidate.images[0]?.dataUrl,
        images: candidate.images,
        priceText: candidate.priceText,
        description,
        postText,
      });

      dailyPool = dailyPool.filter((product) => product.id !== candidate.id);
    }

    const currentDayProductIds = slots
      .filter((slot) => slot.date === date)
      .map((slot) => slot.productId);

    previousDayLastTwoProductIds = currentDayProductIds.slice(-2);
  }

  return {
    slots,
    warnings,
  };
};

export default function LocalProductsPage() {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const handleLocalWorkspaceKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>): void => {
      if (event.key.toLowerCase() !== "f" || !isTypingTarget(event.target)) {
        return;
      }

      event.stopPropagation();
    },
    [],
  );
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [contactDraft, setContactDraft] = useState<string>("");
  const [editingId, setEditingId] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [activeCategoryTab, setActiveCategoryTab] =
    useState<CategoryTab>("all");
  const [isMobileCategoryMenuOpen, setIsMobileCategoryMenuOpen] =
    useState<boolean>(false);
  const prefersReducedMotion = useReducedMotion();
  const [imageDownloadCategory, setImageDownloadCategory] =
    useState<CategoryTab>("all");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [scheduleQuery, setScheduleQuery] = useState<string>("");
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const [compactScheduleConfig, setCompactScheduleConfig] =
    useState<boolean>(true);
  const [activeScheduleTaskIndex, setActiveScheduleTaskIndex] =
    useState<number>(0);
  const [draggingProductId, setDraggingProductId] = useState<string>("");
  const [draggingDraftImageId, setDraggingDraftImageId] = useState<string>("");
  const [pendingRemoveTaskIndex, setPendingRemoveTaskIndex] = useState<
    number | null
  >(null);
  const [pendingDownload, setPendingDownload] =
    useState<DownloadRequest | null>(null);
  const [pendingShare, setPendingShare] = useState<ShareRequest | null>(null);
  const [includeInternalShareImages, setIncludeInternalShareImages] =
    useState<boolean>(false);
  const [skipInternalDownloadImages, setSkipInternalDownloadImages] =
    useState<boolean>(false);
  const [shareDialogStep, setShareDialogStep] =
    useState<ShareDialogStep>("share");
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmRequest | null>(
    null,
  );
  const [pendingBackup, setPendingBackup] =
    useState<PreparedBackup | null>(null);
  const [isConfirmExecuting, setIsConfirmExecuting] = useState<boolean>(false);
  const [isShareExecuting, setIsShareExecuting] = useState<boolean>(false);
  const [isBackupSaving, setIsBackupSaving] = useState<boolean>(false);
  const [isBackupRestoreReady, setIsBackupRestoreReady] =
    useState<boolean>(false);
  const [pendingBlobUpload, setPendingBlobUpload] =
    useState<BlobUploadRequest | null>(null);
  const [blobUploadPassword, setBlobUploadPassword] = useState<string>("");
  const [scheduleAssignments, setScheduleAssignments] =
    useState<ScheduleAssignmentMap>(() => loadScheduleAssignments());
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false);
  const [isSettingsReady, setIsSettingsReady] = useState<boolean>(false);
  const [pageLoadingText, setPageLoadingText] = useState<string>("");
  const [modalStack, setModalStack] = useState<ModalName[]>([]);
  const activeModal = modalStack[modalStack.length - 1] ?? "";
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedAlbumImageId, setSelectedAlbumImageId] = useState<string>("");
  const [selectedAlbumImageIds, setSelectedAlbumImageIds] = useState<
    Set<string>
  >(() => new Set<string>());
  const [albumSource, setAlbumSource] = useState<AlbumSource | null>(null);
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [selectedDescriptionCopy, setSelectedDescriptionCopy] =
    useState<SelectedDescriptionCopy | null>(null);
  const [pendingDoneProductIds, setPendingDoneProductIds] = useState<
    Set<string>
  >(() => new Set<string>());
  const [postedRecords, setPostedRecords] = useState<PostedRecord[]>([]);
  const [nowTick, setNowTick] = useState<Date>(new Date());
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(() =>
    loadScheduleConfig(),
  );
  const [pictureInPictureWindow, setPictureInPictureWindow] =
    useState<Window | null>(null);

  const activeContactText = useMemo(
    () => getSelectedContactText(settings),
    [settings],
  );

  const today = useMemo(() => nowTick.toISOString().slice(0, 10), [nowTick]);
  const currentTime = useMemo(() => getCurrentTimeString(), [nowTick]);

  const handleOpenPictureInPicture = useCallback(async (): Promise<void> => {
    const browserWindow = window as WindowWithDocumentPictureInPicture;
    const pictureInPictureApi = browserWindow.documentPictureInPicture;

    if (!pictureInPictureApi) {
      Toastify(
        "Trình duyệt chưa hỗ trợ cửa sổ nổi. Vui lòng dùng Chrome hoặc Edge phiên bản mới.",
        400,
      );
      return;
    }

    const existingWindow =
      pictureInPictureWindow ?? pictureInPictureApi.window;

    if (existingWindow && !existingWindow.closed) {
      existingWindow.focus();
      setPictureInPictureWindow(existingWindow);
      return;
    }

    try {
      const nextWindow = await pictureInPictureApi.requestWindow({
        width: 520,
        height: 760,
      });

      nextWindow.document.title = "Local Product Manager";
      nextWindow.document.body.replaceChildren();
      copyStylesToDocument(document, nextWindow.document);

      nextWindow.addEventListener(
        "pagehide",
        () => {
          setPictureInPictureWindow((currentWindow) =>
            currentWindow === nextWindow ? null : currentWindow,
          );
        },
        { once: true },
      );

      setPictureInPictureWindow(nextWindow);
      nextWindow.focus();
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        Toastify("Hãy nhấn trực tiếp nút Cửa sổ nổi để mở", 400);
        return;
      }

      Toastify("Không thể mở cửa sổ nổi", 400);
    }
  }, [pictureInPictureWindow]);

  const handleClosePictureInPicture = useCallback((): void => {
    const browserWindow = window as WindowWithDocumentPictureInPicture;
    const activeWindow =
      pictureInPictureWindow ?? browserWindow.documentPictureInPicture?.window;

    if (activeWindow && !activeWindow.closed) {
      activeWindow.close();
    }

    setPictureInPictureWindow(null);
  }, [pictureInPictureWindow]);

  const handleFocusPictureInPicture = useCallback((): void => {
    if (!pictureInPictureWindow || pictureInPictureWindow.closed) {
      setPictureInPictureWindow(null);
      return;
    }

    pictureInPictureWindow.focus();
  }, [pictureInPictureWindow]);

  useEffect(() => {
    return () => {
      const browserWindow = window as WindowWithDocumentPictureInPicture;
      const activeWindow = browserWindow.documentPictureInPicture?.window;

      if (activeWindow && !activeWindow.closed) {
        activeWindow.close();
      }
    };
  }, []);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, string>();

    products.forEach((product) => {
      const category = normalizeCategoryName(product.category);
      const key = normalizeTextKey(category);

      if (!category || categoryMap.has(key)) return;
      categoryMap.set(key, category);
    });

    return Array.from(categoryMap.values());
  }, [products]);

  // Danh sách tab theo thứ tự: "all" + các danh mục
  const orderedCategoryTabs = useMemo<CategoryTab[]>(
    () => ["all", ...categories],
    [categories],
  );

  // Chuyển sang danh mục kế tiếp / trước đó (dùng cho vuốt ngang)
  const goToAdjacentCategory = useCallback(
    (direction: 1 | -1) => {
      setActiveCategoryTab((current) => {
        if (orderedCategoryTabs.length <= 1) return current;

        const currentKey = normalizeTextKey(current);
        const currentIndex = orderedCategoryTabs.findIndex(
          (tab) => normalizeTextKey(tab) === currentKey,
        );
        const safeIndex = currentIndex < 0 ? 0 : currentIndex;
        const nextIndex =
          (safeIndex + direction + orderedCategoryTabs.length) %
          orderedCategoryTabs.length;

        return orderedCategoryTabs[nextIndex];
      });
    },
    [orderedCategoryTabs],
  );

  // Lưu điểm chạm để phát hiện thao tác vuốt ngang
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  // Thanh tab danh mục — giữ lại một tab phía trước tab đang chọn
  const categoryTabsRef = useRef<HTMLDivElement | null>(null);
  const previousCategoryTabRef = useRef(activeCategoryTab);

  useEffect(() => {
    const previousCategoryKey = normalizeTextKey(
      previousCategoryTabRef.current,
    );
    const activeCategoryKey = normalizeTextKey(activeCategoryTab);

    if (previousCategoryKey === activeCategoryKey) return;
    previousCategoryTabRef.current = activeCategoryTab;

    const interactionWindow = getActiveInteractionWindow();
    interactionWindow.requestAnimationFrame(() => {
      interactionWindow.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }, [activeCategoryTab, prefersReducedMotion]);

  useEffect(() => {
    const container = categoryTabsRef.current;
    if (!container) return;

    const categoryButtons = Array.from(
      container.querySelectorAll<HTMLElement>("[data-category-tab]"),
    );
    const activeCategoryKey = normalizeTextKey(activeCategoryTab);
    const activeButtonIndex = categoryButtons.findIndex(
      (button) => button.dataset.categoryTab === activeCategoryKey,
    );
    if (activeButtonIndex < 0) return;

    const leadingButton =
      categoryButtons[Math.max(0, activeButtonIndex - 1)] ??
      categoryButtons[activeButtonIndex];
    if (!leadingButton) return;

    const maximumScrollLeft = Math.max(
      0,
      container.scrollWidth - container.clientWidth,
    );
    const targetScrollLeft =
      activeButtonIndex === 0
        ? 0
        : Math.min(leadingButton.offsetLeft, maximumScrollLeft);

    // Khi về Tất cả luôn cuộn hẳn về đầu; các tab khác chừa một tab phía trước.
    container.scrollTo({
      left: targetScrollLeft,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [activeCategoryTab, prefersReducedMotion]);

  useEffect(() => {
    const container = categoryTabsRef.current;
    if (!container) return;

    const handleDesktopCategoryWheel = (event: WheelEvent) => {
      const maximumScrollLeft = Math.max(
        0,
        container.scrollWidth - container.clientWidth,
      );
      if (maximumScrollLeft === 0) return;

      const horizontalDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (horizontalDelta === 0) return;

      event.preventDefault();
      event.stopPropagation();
      container.scrollLeft = Math.min(
        maximumScrollLeft,
        Math.max(0, container.scrollLeft + horizontalDelta),
      );
    };

    container.addEventListener("wheel", handleDesktopCategoryWheel, {
      passive: false,
    });

    return () => {
      container.removeEventListener("wheel", handleDesktopCategoryWheel);
    };
  }, []);

  const handleProductsTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      if (!touch) return;
      swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [],
  );

  const handleProductsTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const start = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!start) return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;

      // Chỉ tính là vuốt ngang khi đủ dài và không phải cuộn dọc
      const MIN_SWIPE = 60;
      if (Math.abs(deltaX) < MIN_SWIPE) return;
      if (Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

      // Vuốt trái -> danh mục kế tiếp; vuốt phải -> danh mục trước đó
      goToAdjacentCategory(deltaX < 0 ? 1 : -1);
    },
    [goToAdjacentCategory],
  );

  const filteredProducts = useMemo(() => {
    const keyword = normalizeTextKey(query);
    const activeCategoryKey = normalizeTextKey(activeCategoryTab);
    const shouldSearchAllCategories = keyword.length > 0;

    const matchedProducts = products.filter((product) => {
      const productCategoryKey = normalizeTextKey(product.category);
      const matchesCategory =
        shouldSearchAllCategories ||
        activeCategoryTab === "all" ||
        productCategoryKey === activeCategoryKey;
      const content = normalizeTextKey(
        `${product.name} ${product.description} ${product.priceText} ${product.category}`,
      );
      const matchesKeyword = !keyword || content.includes(keyword);

      return matchesCategory && matchesKeyword;
    });

    return sortProductsByCategoryThenDoneThenPrice(
      matchedProducts,
      pendingDoneProductIds,
    );
  }, [activeCategoryTab, pendingDoneProductIds, products, query]);

  const groupedProductsByCategory = useMemo(() => {
    return createGroupedProducts(filteredProducts, pendingDoneProductIds);
  }, [filteredProducts, pendingDoneProductIds]);

  const copyableProductGroups = useMemo(() => {
    return createGroupedProducts(
      filteredProducts.filter((product) => !product.isDone),
      pendingDoneProductIds,
    );
  }, [filteredProducts, pendingDoneProductIds]);

  const copyableProductCount = useMemo(() => {
    return copyableProductGroups.reduce(
      (total, group) => total + group.products.length,
      0,
    );
  }, [copyableProductGroups]);

  const soldProductCount = useMemo(() => {
    return filteredProducts.filter((product) => product.isDone).length;
  }, [filteredProducts]);

  const activeProductCount = useMemo(() => {
    return filteredProducts.filter((product) => !product.isDone).length;
  }, [filteredProducts]);

  const downloadableProducts = useMemo(() => {
    return products.filter((product) => !product.isDone);
  }, [products]);

  const totalImages = useMemo(() => {
    return downloadableProducts.reduce(
      (total, product) =>
        total + product.images.length + product.internalImages.length,
      0,
    );
  }, [downloadableProducts]);

  const representativeImageCategoryOptions = useMemo(() => {
    const categoryMap = new Map<string, { name: string; count: number }>();

    downloadableProducts.forEach((product) => {
      if (!product.images[0]) return;

      const categoryName =
        normalizeCategoryName(product.category) || "Chưa phân loại";
      const categoryKey = normalizeTextKey(categoryName);
      const currentCategory = categoryMap.get(categoryKey);

      categoryMap.set(categoryKey, {
        name: currentCategory?.name ?? categoryName,
        count: (currentCategory?.count ?? 0) + 1,
      });
    });

    return Array.from(categoryMap.values()).sort((first, second) =>
      normalizeTextKey(first.name).localeCompare(
        normalizeTextKey(second.name),
        "vi",
      ),
    );
  }, [downloadableProducts]);

  const totalRepresentativeImages = useMemo(() => {
    return representativeImageCategoryOptions.reduce(
      (total, category) => total + category.count,
      0,
    );
  }, [representativeImageCategoryOptions]);

  const representativeImageProducts = useMemo(() => {
    const selectedCategoryKey = normalizeTextKey(imageDownloadCategory);

    return downloadableProducts.filter((product) => {
      if (!product.images[0]) return false;
      if (imageDownloadCategory === "all") return true;

      const productCategory =
        normalizeCategoryName(product.category) || "Chưa phân loại";

      return normalizeTextKey(productCategory) === selectedCategoryKey;
    });
  }, [downloadableProducts, imageDownloadCategory]);

  useEffect(() => {
    if (imageDownloadCategory === "all") return;

    const selectedCategoryExists = representativeImageCategoryOptions.some(
      (category) =>
        normalizeTextKey(category.name) ===
        normalizeTextKey(imageDownloadCategory),
    );

    if (!selectedCategoryExists) {
      setImageDownloadCategory("all");
    }
  }, [imageDownloadCategory, representativeImageCategoryOptions]);

  const scheduleResult = useMemo(() => {
    return buildRandomSchedule(
      products,
      scheduleConfig,
      settings.commonDescription,
      activeContactText,
      settings.includeSocialTags,
    );
  }, [
    activeContactText,
    products,
    scheduleConfig,
    settings.commonDescription,
    settings.includeSocialTags,
  ]);

  const scheduleTaskIndexes = useMemo(() => {
    return Array.from(
      { length: Math.max(1, scheduleConfig.taskCount) },
      (_, index) => index,
    );
  }, [scheduleConfig.taskCount]);

  const scheduleTimes = useMemo(() => {
    return createDailyTimes(
      scheduleConfig.startTime,
      scheduleConfig.endTime,
      scheduleConfig.gapHours,
    ).times;
  }, [
    scheduleConfig.endTime,
    scheduleConfig.gapHours,
    scheduleConfig.startTime,
  ]);

  const todaySlots = useMemo(() => {
    return scheduleResult.slots.filter((slot) => slot.date === today);
  }, [scheduleResult.slots, today]);

  const postedIds = useMemo(() => {
    return new Set(postedRecords.map((record) => record.slotId));
  }, [postedRecords]);

  const selectedAlbumImage = useMemo(() => {
    if (!albumSource || albumSource.images.length === 0) return null;

    return (
      albumSource.images.find((image) => image.id === selectedAlbumImageId) ??
      albumSource.images[0] ??
      null
    );
  }, [albumSource, selectedAlbumImageId]);

  const activeScheduleProducts = useMemo(() => {
    return products.filter((product) => !product.isDone);
  }, [products]);

  const scheduleProducts = useMemo(() => {
    if (scheduleConfig.selectedCategories.length === 0) {
      return activeScheduleProducts;
    }

    const selectedCategoryKeys = new Set(
      scheduleConfig.selectedCategories.map((category) =>
        normalizeTextKey(category),
      ),
    );

    return activeScheduleProducts.filter((product) =>
      selectedCategoryKeys.has(normalizeTextKey(product.category)),
    );
  }, [activeScheduleProducts, scheduleConfig.selectedCategories]);

  const filteredScheduleProducts = useMemo(() => {
    const keyword = normalizeTextKey(scheduleQuery);

    return activeScheduleProducts.filter((product) => {
      const content = normalizeTextKey(
        `${product.name} ${product.description} ${product.priceText} ${product.category}`,
      );

      return !keyword || content.includes(keyword);
    });
  }, [activeScheduleProducts, scheduleQuery]);

  const todayPostedProductKeys = useMemo(() => {
    return new Set(
      postedRecords
        .map((record) => record.slotId)
        .filter((slotId) => slotId.startsWith(`${today}::task`)),
    );
  }, [postedRecords, today]);

  const todayPostedProductIds = useMemo(() => {
    const result = new Set<string>();

    postedRecords.forEach((record) => {
      if (!record.slotId.startsWith(`${today}::task`)) return;

      const assignedProductId = scheduleAssignments[record.slotId];

      if (assignedProductId) {
        result.add(assignedProductId);
        return;
      }

      const legacyProductId = record.slotId.split("::").at(-1) ?? "";

      if (legacyProductId && !legacyProductId.startsWith("slot")) {
        result.add(legacyProductId);
      }
    });

    return result;
  }, [postedRecords, scheduleAssignments, today]);

  const postedTodayCount = useMemo(() => {
    return todayPostedProductKeys.size;
  }, [todayPostedProductKeys]);

  const totalTodayTaskCount = useMemo(() => {
    return scheduleTimes.length * scheduleTaskIndexes.length;
  }, [scheduleTaskIndexes.length, scheduleTimes.length]);

  const remainingTodayCount = useMemo(() => {
    return Math.max(totalTodayTaskCount - postedTodayCount, 0);
  }, [postedTodayCount, totalTodayTaskCount]);

  const todayScheduledProductIds = useMemo(() => {
    return new Set(todaySlots.map((slot) => slot.productId));
  }, [todaySlots]);

  const loadProducts = async (): Promise<void> => {
    const list = await getAllProductsFromDb();
    const sortedList = list.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    setProducts(sortedList);
  };

  useEffect(() => {
    setSettings(loadGlobalSettings());
    setPostedRecords(loadPostedRecords());
    setIsSettingsReady(true);
    void loadProducts();
  }, []);

  useEffect(() => {
    if (!isSettingsReady) return;

    const shouldContinueBackupRestore =
      window.sessionStorage.getItem(RESTORE_BACKUP_AFTER_RELOAD_KEY) === "1";
    if (!shouldContinueBackupRestore) return;

    window.sessionStorage.removeItem(RESTORE_BACKUP_AFTER_RELOAD_KEY);
    setIsBackupRestoreReady(true);
    setModalStack(["importExport"]);
    setPendingConfirm({
      title: "Chọn tệp backup mới",
      description:
        "Dữ liệu hiện tại đã được xóa. Chọn tệp JSON hoặc JSON.GZ để khôi phục dữ liệu mới.",
      confirmLabel: "Chọn tệp backup",
      cancelLabel: "Để sau",
      tone: "default",
      onConfirm: () => {
        const input = window.document.getElementById(
          IMPORT_BACKUP_INPUT_ID,
        ) as HTMLInputElement | null;

        if (!input) {
          throw new Error("Không thể mở trình chọn tệp backup");
        }

        input.click();
      },
    });
  }, [isSettingsReady]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTick(new Date());
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    saveScheduleConfig(scheduleConfig);
  }, [scheduleConfig]);

  useEffect(() => {
    saveScheduleAssignments(scheduleAssignments);
  }, [scheduleAssignments]);

  useEffect(() => {
    if (scheduleTimes.length === 0) return;

    setScheduleAssignments((current) => {
      let changed = false;
      const nextAssignments: ScheduleAssignmentMap = { ...current };

      Object.entries(current).forEach(([key, value]) => {
        const match = key.match(/^(\d{4}-\d{2}-\d{2})::task(\d+)::(.+)$/);

        if (!match) return;

        const [, date, taskNumberText, legacyTime] = match;

        if (!date || !taskNumberText || !legacyTime) return;
        if (legacyTime.startsWith("slot")) return;

        const slotIndex = scheduleTimes.indexOf(legacyTime);

        if (slotIndex < 0) return;

        const taskIndex = Number(taskNumberText) - 1;
        const nextKey = createScheduleAssignmentKey(date, slotIndex, taskIndex);

        if (!nextAssignments[nextKey]) {
          nextAssignments[nextKey] = value as string;
        }

        delete nextAssignments[key];
        changed = true;
      });

      return changed ? nextAssignments : current;
    });
  }, [scheduleTimes]);

  useEffect(() => {
    if (scheduleTimes.length === 0) return;

    setPostedRecords((current) => {
      let changed = false;
      const nextRecords = current.map((record) => {
        const match = record.slotId.match(
          /^(\d{4}-\d{2}-\d{2})::task(\d+)::(.+)$/,
        );

        if (!match) return record;

        const [, date, taskNumberText, legacyValue] = match;

        if (!date || !taskNumberText || !legacyValue) return record;
        if (legacyValue.startsWith("slot")) return record;

        const taskIndex = Number(taskNumberText) - 1;
        const legacyProduct = products.find(
          (product) => product.id === legacyValue,
        );

        if (!legacyProduct) return record;

        const matchedEntry = Object.entries(scheduleAssignments).find(
          ([key, value]) => {
            if (value !== legacyProduct.id) return false;
            return key.startsWith(`${date}::task${taskIndex + 1}::slot`);
          },
        );

        if (!matchedEntry) return record;

        changed = true;

        return {
          ...record,
          slotId: matchedEntry[0],
        };
      });

      if (changed) {
        const uniqueRecords = Array.from(
          new Map(
            nextRecords.map((record) => [record.slotId, record]),
          ).values(),
        ) as PostedRecord[];

        savePostedRecords(uniqueRecords);
        return uniqueRecords;
      }

      return current;
    });
  }, [products, scheduleAssignments, scheduleTimes]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.code === "Space" &&
        !activeModal &&
        !pendingDownload &&
        !pendingShare &&
        !pendingBackup &&
        !pendingConfirm &&
        !pendingBlobUpload &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (event.key !== "Escape") return;

      if (pendingDownload) {
        setPendingDownload(null);
        setSkipInternalDownloadImages(false);
        return;
      }

      if (pendingShare) {
        if (!isShareExecuting) {
          if (shareDialogStep === "facebookGroup") {
            setShareDialogStep("share");
            return;
          }

          setPendingShare(null);
          setIncludeInternalShareImages(false);
        }
        return;
      }

      if (pendingBackup) {
        if (!isBackupSaving) setPendingBackup(null);
        return;
      }

      if (pendingConfirm) {
        if (!isConfirmExecuting) {
          pendingConfirm.onCancel?.();
          setPendingConfirm(null);
        }
        return;
      }

      if (pendingBlobUpload) {
        pendingBlobUpload.onCancel?.();
        setPendingBlobUpload(null);
        setBlobUploadPassword("");
        return;
      }

      if (activeModal) {
        closeModal();
      }
    };

    const eventWindows = [window, pictureInPictureWindow].filter(
      (targetWindow, index, windowList): targetWindow is Window =>
        targetWindow !== null && windowList.indexOf(targetWindow) === index,
    );

    eventWindows.forEach((targetWindow) => {
      targetWindow.addEventListener("keydown", handleKeyDown);
    });

    return () => {
      eventWindows.forEach((targetWindow) => {
        targetWindow.removeEventListener("keydown", handleKeyDown);
      });
    };
  }, [
    activeModal,
    pendingDownload,
    pendingShare,
    shareDialogStep,
    isShareExecuting,
    pendingBackup,
    isBackupSaving,
    pendingConfirm,
    isConfirmExecuting,
    pendingBlobUpload,
    pictureInPictureWindow,
  ]);

  useEffect(() => {
    if (!isSettingsReady) return;

    saveGlobalSettings({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  }, [
    settings.commonDescription,
    settings.globalNote,
    settings.contactOptions,
    settings.selectedContactId,
    settings.includeSocialTags,
    isSettingsReady,
  ]);

  useEffect(() => {
    if (activeCategoryTab === "all") return;

    const categoryKeys = new Set(
      categories.map((category) => normalizeTextKey(category)),
    );

    if (categoryKeys.has(normalizeTextKey(activeCategoryTab))) return;

    setActiveCategoryTab("all");
  }, [activeCategoryTab, categories]);

  useEffect(() => {
    if (categories.length === 0) return;

    const categoryKeys = new Set(
      categories.map((category) => normalizeTextKey(category)),
    );

    setScheduleConfig((current) => {
      const keptCategories = current.selectedCategories.filter((category) =>
        categoryKeys.has(normalizeTextKey(category)),
      );

      const taskNames = Array.from(
        { length: Math.max(1, current.taskCount) },
        (_, index) => current.taskNames[index] || `Task ${index + 1}`,
      );

      if (
        keptCategories.length === current.selectedCategories.length &&
        taskNames.length === current.taskNames.length
      ) {
        return current;
      }

      return {
        ...current,
        taskNames,
        selectedCategories: keptCategories,
      };
    });
  }, [categories]);

  useEffect(() => {
    const activeScheduleProductIds = new Set(
      activeScheduleProducts.map((product) => product.id),
    );
    const removedAssignmentKeys: string[] = [];
    const nextAssignments: ScheduleAssignmentMap = {};

    Object.entries(scheduleAssignments).forEach(([key, value]) => {
      if (activeScheduleProductIds.has(value)) {
        nextAssignments[key] = value as string;
        return;
      }

      removedAssignmentKeys.push(key);
    });

    if (removedAssignmentKeys.length === 0) return;

    setScheduleAssignments(nextAssignments);

    setPostedRecords((current) => {
      const removedKeySet = new Set(removedAssignmentKeys);
      const nextRecords = current.filter(
        (record) => !removedKeySet.has(record.slotId),
      );

      if (nextRecords.length !== current.length) {
        savePostedRecords(nextRecords);
      }

      return nextRecords;
    });
  }, [activeScheduleProducts, scheduleAssignments]);

  const updateDraftField = <Key extends keyof ProductDraft>(
    key: Key,
    value: ProductDraft[Key],
  ): void => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateSettingField = <Key extends keyof GlobalSettings>(
    key: Key,
    value: GlobalSettings[Key],
  ): void => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const addContactOption = (): void => {
    const text = contactDraft.trim();

    if (!text) {
      Toastify("Vui lòng nhập nội dung liên hệ", 400);
      return;
    }

    setSettings((current) => {
      const existingOption = current.contactOptions.find(
        (option) => option.text.trim() === text,
      );

      if (existingOption) {
        return {
          ...current,
          selectedContactId: existingOption.id,
        };
      }

      const option: ContactOption = {
        id: crypto.randomUUID(),
        text,
      };

      return {
        ...current,
        contactOptions: [...current.contactOptions, option],
        selectedContactId: option.id,
      };
    });

    setContactDraft("");
  };

  const updateContactOptionText = (id: string, text: string): void => {
    setSettings((current) => ({
      ...current,
      contactOptions: current.contactOptions.map((option) =>
        option.id === id ? { ...option, text } : option,
      ),
    }));
  };

  const selectContactOption = (id: string): void => {
    setSettings((current) => ({
      ...current,
      selectedContactId: id,
    }));
  };

  const removeContactOption = (id: string): void => {
    setSettings((current) => {
      const contactOptions = current.contactOptions.filter(
        (option) => option.id !== id,
      );
      const selectedContactId =
        current.selectedContactId === id
          ? (contactOptions[0]?.id ?? "")
          : current.selectedContactId;

      return {
        ...current,
        contactOptions,
        selectedContactId,
      };
    });
  };

  const updateScheduleField = <Key extends keyof ScheduleConfig>(
    key: Key,
    value: ScheduleConfig[Key],
  ): void => {
    setScheduleConfig((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const openModal = (modalName: Exclude<ModalName, "">): void => {
    setModalStack((current) => {
      const currentTopModal = current[current.length - 1];

      if (currentTopModal === modalName) return current;

      return [...current, modalName];
    });
  };

  const closeModal = (): void => {
    setModalStack((current) => {
      const closingModal = current[current.length - 1] ?? "";

      if (closingModal === "slotDetail") {
        setSelectedSlotId("");
      }

      if (closingModal === "imageAlbum") {
        setSelectedAlbumImageId("");
        setSelectedAlbumImageIds(new Set<string>());
        setAlbumSource(null);
      }

      if (closingModal === "imageDownload") {
        setImageDownloadCategory("all");
      }

      return current.slice(0, -1);
    });
  };

  const closeAllModals = (): void => {
    setModalStack([]);
    setSelectedSlotId("");
    setSelectedAlbumImageId("");
    setSelectedAlbumImageIds(new Set<string>());
    setAlbumSource(null);
    setImageDownloadCategory("all");
    setPendingConfirm(null);
    setPendingBackup(null);
    setPendingBlobUpload(null);
    setBlobUploadPassword("");
    setPendingDownload(null);
    setSkipInternalDownloadImages(false);
    setPendingShare(null);
    setIncludeInternalShareImages(false);
    setShareDialogStep("share");
  };

  const closeAllProductModals = (): void => {
    setModalStack((current) =>
      current.filter((modalName) => modalName !== "product"),
    );
  };

  const openProductModalForCreate = (): void => {
    setEditingId("");
    setDraft(emptyDraft);
    openModal("product");
  };

  const appendImagesToDraft = async (
    files: File[],
    imageField: ProductImageField = "images",
  ): Promise<void> => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      Toastify("Không tìm thấy file ảnh phù hợp", 400);
      return;
    }

    setIsProcessingImages(true);

    try {
      const images = await convertFilesToImages(imageFiles);

      setDraft((current) => ({
        ...current,
        [imageField]: renameDraftImagesByField(
          [...images, ...current[imageField]],
          imageField,
        ),
      }));

      Toastify(
        `Đã thêm ${images.length} ${imageField === "internalImages" ? "ảnh nội bộ" : "ảnh chính"}`,
        200,
      );
    } catch {
      Toastify("Không thể xử lý ảnh", 400);
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleImageInput = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = Array.from(event.target.files ?? []) as File[];

    await appendImagesToDraft(files);

    event.target.value = "";
  };

  const handleInternalImageInput = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = Array.from(event.target.files ?? []) as File[];

    await appendImagesToDraft(files, "internalImages");

    event.target.value = "";
  };

  const handlePaste = async (
    event: ClipboardEvent<HTMLElement>,
  ): Promise<void> => {
    const files = Array.from(event.clipboardData.files) as File[];
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    await appendImagesToDraft(imageFiles);
  };

  const handleInternalImagePaste = async (
    event: ClipboardEvent<HTMLElement>,
  ): Promise<void> => {
    const files = Array.from(event.clipboardData.files) as File[];
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    event.stopPropagation();
    await appendImagesToDraft(imageFiles, "internalImages");
  };

  const handleDrop = async (
    event: DragEvent<HTMLLabelElement>,
    imageField: ProductImageField = "images",
  ): Promise<void> => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files) as File[];

    await appendImagesToDraft(files, imageField);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const removeDraftImage = (
    imageId: string,
    imageField: ProductImageField = "images",
  ): void => {
    setDraft((current) => ({
      ...current,
      [imageField]: renameDraftImagesByField(
        current[imageField].filter((image) => image.id !== imageId),
        imageField,
      ),
    }));
  };

  const reorderDraftImage = (
    sourceImageId: string,
    targetImageId: string,
    imageField: ProductImageField = "images",
  ): void => {
    if (!sourceImageId || !targetImageId || sourceImageId === targetImageId)
      return;

    setDraft((current) => {
      const sourceIndex = current[imageField].findIndex(
        (image) => image.id === sourceImageId,
      );
      const targetIndex = current[imageField].findIndex(
        (image) => image.id === targetImageId,
      );

      if (sourceIndex < 0 || targetIndex < 0) return current;

      const nextImages = [...current[imageField]];
      const [movedImage] = nextImages.splice(sourceIndex, 1);

      if (!movedImage) return current;

      nextImages.splice(targetIndex, 0, movedImage);

      return {
        ...current,
        [imageField]: renameDraftImagesByField(nextImages, imageField),
      };
    });
  };

  const resetForm = (): void => {
    setDraft(emptyDraft);
    setEditingId("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const now = new Date().toISOString();
    const rawName = draft.name.trim();
    const description = draft.description.trim();
    const pin = draft.pin.trim();
    const status = draft.status.trim();
    const priceText = draft.priceText.trim();
    const category = draft.category.trim();

    if (!rawName) {
      Toastify("Vui lòng nhập tên sản phẩm", 400);
      return;
    }

    const currentProduct = products.find((product) => product.id === editingId);
    const name = normalizeDoneProductName(
      rawName,
      currentProduct?.isDone ?? false,
    );

    const product: LocalProduct = {
      id: currentProduct?.id ?? crypto.randomUUID(),
      name,
      description,
      pin,
      status,
      price: parsePriceNumber(priceText),
      priceText,
      category,
      images: draft.images,
      internalImages: draft.internalImages,
      isDone: currentProduct?.isDone ?? false,
      doneAt: currentProduct?.doneAt ?? "",
      createdAt: currentProduct?.createdAt ?? now,
      updatedAt: now,
    };

    setPageLoadingText(editingId ? "Đang cập nhật sản phẩm..." : "Đang thêm sản phẩm...");

    try {
      await saveProductToDb(product);
      await loadProducts();

      resetForm();
      closeAllModals();
      Toastify(editingId ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm", 200);
    } catch {
      Toastify(editingId ? "Không thể cập nhật sản phẩm" : "Không thể thêm sản phẩm", 400);
    } finally {
      setPageLoadingText("");
    }
  };

  const handleEdit = (product: LocalProduct): void => {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      description: product.description,
      pin: product.pin,
      status: product.status,
      priceText: product.priceText,
      category: product.category,
      images: product.images,
      internalImages: product.internalImages,
    });

    openModal("product");
  };

  const handleDelete = async (id: string): Promise<void> => {
    const product = products.find((item) => item.id === id);
    const productName = product?.name ?? "sản phẩm này";

    requestConfirm({
      title: "Xóa sản phẩm?",
      description: `Xóa vĩnh viễn ${productName}? Dữ liệu sản phẩm và ảnh đã lưu trong trình duyệt sẽ bị xóa.`,
      confirmLabel: "Xóa sản phẩm",
      tone: "danger",
      onConfirm: async () => {
        await deleteProductFromDb(id);

        setSelectedProductId((current) => (current === id ? "" : current));
        setExpandedProductIds((current) => {
          if (!current.has(id)) return current;

          const nextIds = new Set(current);
          nextIds.delete(id);

          return nextIds;
        });
        setScheduleAssignments((current) => {
          const nextAssignments: ScheduleAssignmentMap = {};

          Object.entries(current).forEach(([key, value]) => {
            if (value !== id) {
              nextAssignments[key] = value as string;
            }
          });

          return nextAssignments;
        });
        setPostedRecords((current) => {
          const nextRecords = current.filter(
            (record) => !record.slotId.endsWith(`::${id}`),
          );

          if (nextRecords.length !== current.length) {
            savePostedRecords(nextRecords);
          }

          return nextRecords;
        });

        await loadProducts();
        Toastify("Đã xóa vĩnh viễn sản phẩm", 200);
      },
    });
  };

  const toggleProductDone = async (productId: string): Promise<void> => {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      Toastify("Không tìm thấy sản phẩm", 400);
      return;
    }

    const nextIsDone = !product.isDone;
    const now = new Date().toISOString();
    const nextProduct: LocalProduct = {
      ...product,
      name: normalizeDoneProductName(product.name, nextIsDone),
      isDone: nextIsDone,
      doneAt: nextIsDone ? now : "",
      updatedAt: now,
    };

    if (nextIsDone) {
      setPendingDoneProductIds((current) => {
        const nextIds = new Set(current);
        nextIds.add(productId);

        return nextIds;
      });

      window.setTimeout(() => {
        setPendingDoneProductIds((current) => {
          if (!current.has(productId)) return current;

          const nextIds = new Set(current);
          nextIds.delete(productId);

          return nextIds;
        });
      }, 2000);
    } else {
      setPendingDoneProductIds((current) => {
        if (!current.has(productId)) return current;

        const nextIds = new Set(current);
        nextIds.delete(productId);

        return nextIds;
      });
    }

    await saveProductToDb(nextProduct);

    setProducts((current) =>
      current.map((item) => (item.id === productId ? nextProduct : item)),
    );

    Toastify(
      product.isDone
        ? "Đã bỏ trạng thái DONE"
        : "Đã đánh dấu DONE, sản phẩm sẽ tự xuống cuối sau 2 giây",
      200,
    );
  };

  const handleCopyField = async (
    key: string,
    label: string,
    value: string,
  ): Promise<void> => {
    if (!value.trim()) {
      Toastify(`${label} đang trống`, 300);
      return;
    }

    try {
      await copyText(value);
      setCopiedKey(key);
      Toastify(`Đã copy ${label}`, 200);

      getActiveInteractionWindow().setTimeout(() => {
        setCopiedKey((current) => (current === key ? "" : current));
      }, 1200);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : `Không thể copy ${label}`;

      Toastify(message, 400);
    }
  };

  const handleCopyProductRepresentativeImage = async (
    product: LocalProduct,
  ): Promise<void> => {
    const representativeImage = product.images[0];

    if (!representativeImage) {
      Toastify("Sản phẩm chưa có ảnh đại diện để copy", 300);
      return;
    }

    const copyKey = `cover-${product.id}`;

    try {
      await copyImageToClipboard(representativeImage);
      setCopiedKey(copyKey);
      Toastify("Đã copy ảnh đại diện", 200);

      getActiveInteractionWindow().setTimeout(() => {
        setCopiedKey((current) => (current === copyKey ? "" : current));
      }, 1200);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể copy ảnh đại diện";
      Toastify(message, 400);
    }
  };

  const handleCopyProductList = async (): Promise<void> => {
    if (copyableProductCount === 0) {
      Toastify("Không có sản phẩm đang hoạt động để copy", 300);
      return;
    }

    const textValue = buildCopyableProductListText(copyableProductGroups);

    try {
      await copyText(textValue);
      setCopiedKey("product-list-copy");
      Toastify(`Đã copy ${copyableProductCount} sản phẩm đang hoạt động`, 200);

      getActiveInteractionWindow().setTimeout(() => {
        setCopiedKey((current) =>
          current === "product-list-copy" ? "" : current,
        );
      }, 1200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể copy danh sách sản phẩm";

      Toastify(message, 400);
    }
  };

  const handleExportProductsCsv = (): void => {
    if (copyableProductCount === 0) {
      Toastify("Không có sản phẩm đang hoạt động để xuất Excel", 300);
      return;
    }

    const csvContent = buildProductsCsvContent(copyableProductGroups);
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8",
    });

    downloadBlob(blob, `danh-sach-san-pham-${Date.now()}.csv`);
    Toastify(`Đã xuất ${copyableProductCount} sản phẩm sang Excel`, 200);
  };

  const prepareBackupFile = async (
    extension: "json" | "json.gz",
  ): Promise<void> => {
    const isCompressed = extension === "json.gz";

    setPageLoadingText(
      isCompressed
        ? "Đang tạo và nén file backup..."
        : "Đang tạo file backup JSON...",
    );
    await waitForUiPaint();

    try {
      const payload = createExportPayload({
        settings,
        products,
        scheduleConfig,
        scheduleAssignments,
        postedRecords,
      });

      // Dùng JSON compact để giảm bộ nhớ, thời gian và dung lượng trên iPhone.
      const content = JSON.stringify(payload);
      const blob = isCompressed
        ? await textToGzipBlob(content)
        : new Blob([content], {
          type: "application/json;charset=utf-8",
        });

      setPendingBackup({
        blob,
        filename: createBackupFileName(extension),
        label: isCompressed ? "JSON.GZ" : "JSON",
      });
    } finally {
      setPageLoadingText("");
    }
  };

  const handleExportJson = (): void => {
    requestConfirm({
      title: "Tạo file backup JSON?",
      description:
        "Hệ thống sẽ chuẩn bị file trước. Trên iPhone, nhấn Lưu file rồi chọn Lưu vào Tệp trong bảng chia sẻ.",
      confirmLabel: "Tạo file JSON",
      tone: "default",
      onConfirm: async () => {
        await prepareBackupFile("json");
      },
    });
  };

  const handleExportJsonGzip = (): void => {
    requestConfirm({
      title: "Tạo file backup JSON.GZ?",
      description:
        "Định dạng nén phù hợp hơn khi dữ liệu và ảnh lớn. Sau khi chuẩn bị xong, nhấn Lưu file để mở bảng chia sẻ trên iPhone.",
      confirmLabel: "Tạo file JSON.GZ",
      tone: "default",
      onConfirm: async () => {
        await prepareBackupFile("json.gz");
      },
    });
  };

  const handleSavePreparedBackup = async (): Promise<void> => {
    if (!pendingBackup || isBackupSaving) return;

    setIsBackupSaving(true);

    try {
      const result = await saveBackupBlob(
        pendingBackup.blob,
        pendingBackup.filename,
      );

      setPendingBackup(null);
      Toastify(
        result === "shared"
          ? "Đã mở bảng chia sẻ. Hãy chọn Lưu vào Tệp."
          : "Đã gửi file đến trình quản lý tải xuống.",
        200,
      );
    } catch (error) {
      if (isAbortError(error)) return;

      const message =
        error instanceof Error ? error.message : "Không thể lưu file backup";
      Toastify(message, 400);
    } finally {
      setIsBackupSaving(false);
    }
  };

  const openBackupFilePicker = (): void => {
    const input = getActiveInteractionWindow().document.getElementById(
      IMPORT_BACKUP_INPUT_ID,
    ) as HTMLInputElement | null;

    if (!input) {
      Toastify("Không thể mở trình chọn tệp backup", 400);
      return;
    }

    input.click();
  };

  const handleBeginBackupRestore = (): void => {
    if (isBackupRestoreReady) {
      openBackupFilePicker();
      return;
    }

    requestConfirm({
      title: "Xóa dữ liệu hiện tại trước khi khôi phục?",
      description:
        "Toàn bộ sản phẩm, ảnh và dữ liệu ứng dụng hiện tại sẽ bị xóa. Sau đó trang sẽ tải lại và mở bước chọn tệp backup mới.",
      confirmLabel: "Xóa và tiếp tục",
      tone: "danger",
      onConfirm: async () => {
        setPageLoadingText("Đang xóa toàn bộ dữ liệu hiện tại...");
        await waitForUiPaint();

        try {
          window.sessionStorage.setItem(
            RESTORE_BACKUP_AFTER_RELOAD_KEY,
            "1",
          );
          await clearAllLocalProductData();
          window.location.reload();
        } catch (error) {
          window.sessionStorage.removeItem(RESTORE_BACKUP_AFTER_RELOAD_KEY);
          setPageLoadingText("");
          throw error;
        }
      },
    });
  };

  const handleClearAllLocalData = (): void => {
    requestConfirm({
      title: "Xóa toàn bộ dữ liệu local?",
      description:
        "Toàn bộ sản phẩm và ảnh trong IndexedDB cùng dữ liệu ứng dụng trong localStorage sẽ bị xóa.",
      confirmLabel: "Xóa toàn bộ dữ liệu",
      tone: "danger",
      onConfirm: async () => {
        setPageLoadingText("Đang xóa toàn bộ dữ liệu local...");
        await waitForUiPaint();

        try {
          await clearAllLocalProductData();
          resetLocalProductState();
          closeAllModals();
          Toastify("Đã xóa toàn bộ dữ liệu local", 200);
        } finally {
          setPageLoadingText("");
        }
      },
    });
  };

  const resetLocalProductState = (): void => {
    const today = getTodayString();
    const nextSettings: GlobalSettings = {
      ...defaultSettings,
      contactOptions: [],
    };
    const nextScheduleConfig: ScheduleConfig = {
      ...defaultScheduleConfig,
      dateFrom: today,
      dateTo: today,
      taskNames: [...defaultScheduleConfig.taskNames],
      selectedCategories: [],
    };

    setProducts([]);
    setSettings(nextSettings);
    setContactDraft("");
    setPostedRecords([]);
    setScheduleConfig(nextScheduleConfig);
    setScheduleAssignments({});
    setDraft(emptyDraft);
    setEditingId("");
    setQuery("");
    setActiveCategoryTab("all");
  };

  const replaceLocalDataFromBackup = async (
    payload: ParsedImportPayload,
    clearExistingData = true,
  ): Promise<void> => {
    try {
      if (clearExistingData) {
        setPageLoadingText("Đang xóa dữ liệu hiện tại...");
        await waitForUiPaint();
        await clearAllLocalProductData();
        resetLocalProductState();
      }

      setPageLoadingText(
        `Đang import ${payload.products.length} sản phẩm vào local...`,
      );
      await waitForUiPaint();

      await restorePayloadToLocal(payload, {
        setSettings,
        setScheduleConfig,
        setScheduleAssignments,
        setPostedRecords,
        loadProducts,
      });

      setContactDraft("");
      closeAllModals();
      Toastify(
        `Đã import ${payload.products.length} sản phẩm vào local`,
        200,
      );
    } finally {
      setPageLoadingText("");
    }
  };

  const handleImportJson = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    // Reset ngay để có thể chọn lại cùng một file, kể cả khi modal đổi trạng thái.
    input.value = "";

    if (!file) return;

    setPageLoadingText("Đang đọc và kiểm tra file backup...");
    await waitForUiPaint();

    try {
      const text = await readJsonOrGzipFileText(file);
      const payload = parseJsonTextToPayload(text);

      if (!payload || payload.products.length === 0) {
        throw new Error("File backup không đúng cấu trúc hoặc không có sản phẩm");
      }

      setPageLoadingText("");

      if (isBackupRestoreReady) {
        await replaceLocalDataFromBackup(payload, false);
        setIsBackupRestoreReady(false);
        return;
      }

      requestConfirm({
        title: "Thay thế bằng dữ liệu mới?",
        description: `File ${isGzipFile(file) ? "JSON.GZ" : "JSON"} có ${payload.products.length} sản phẩm (${formatFileSize(file.size)}). Khi đồng ý, toàn bộ dữ liệu hiện tại sẽ được xóa hoàn tất trước, sau đó tệp mới mới bắt đầu được import.`,
        confirmLabel: "Đồng ý, thay thế",
        tone: "warning",
        onConfirm: () => replaceLocalDataFromBackup(payload),
      });
    } catch (error) {
      const message =
        error instanceof SyntaxError
          ? "File JSON không hợp lệ hoặc đã bị hỏng"
          : error instanceof Error
            ? error.message
            : "Không thể import file backup";

      Toastify(message, 400);
      setPageLoadingText("");
    }
  };

  const uploadJsonGzipToBlobWithPassword = async (
    uploadKey: string,
  ): Promise<void> => {
    const cleanUploadKey = uploadKey.trim();

    if (!cleanUploadKey) {
      Toastify("Vui lòng nhập mật khẩu upload", 400);
      return;
    }

    setPageLoadingText("Đang thay thế file backup trên Vercel Blob...");

    try {
      const payload = createExportPayload({
        settings,
        products,
        scheduleConfig,
        scheduleAssignments,
        postedRecords,
      });

      const content = JSON.stringify(payload);
      const gzipBlob = await textToGzipBlob(content);
      const contentType = "application/gzip";

      const presignResponse = await fetch("/api/blob/local-products-upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          uploadKey: cleanUploadKey,
          contentType,
          size: gzipBlob.size,
        }),
      });

      if (!presignResponse.ok) {
        const errorPayload = (await presignResponse.json().catch(() => null)) as
          | { message?: string }
          | null;

        Toastify(errorPayload?.message ?? "Không thể tạo link upload Blob", 400);
        return;
      }

      const presignPayload = (await presignResponse.json()) as {
        pathname: string;
        presignedUrl: string;
      };

      const uploadResponse = await fetch(presignPayload.presignedUrl, {
        method: "PUT",
        headers: {
          "content-type": contentType,
        },
        body: gzipBlob,
      });

      if (!uploadResponse.ok) {
        Toastify("Upload JSON.GZ lên Blob thất bại", 400);
        return;
      }

      await copyText(presignPayload.pathname);
      Toastify("Đã thay thế file JSON.GZ hiện tại trên Blob", 200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể upload JSON.GZ lên Blob";

      Toastify(message, 400);
    } finally {
      setPageLoadingText("");
    }
  };

  const handleUploadJsonGzipToBlob = async (): Promise<void> => {
    setBlobUploadPassword("");
    setPendingBlobUpload({
      title: "Upload Blob",
      description: "",
      confirmLabel: "Upload",
      cancelLabel: "Hủy",
      onConfirm: uploadJsonGzipToBlobWithPassword,
    });
  };

  const handleRestoreLatestBackupFromBlob = async (): Promise<void> => {
    requestConfirm({
      title: "Thay thế bằng dữ liệu mới?",
      description:
        "Hệ thống sẽ tải bản JSON.GZ mới nhất từ Vercel Blob. Dữ liệu hiện tại trong IndexedDB và localStorage sẽ được xóa sạch trước khi thay thế.",
      confirmLabel: "Tải về local",
      tone: "warning",
      onConfirm: async () => {
        setPageLoadingText("Đang tải backup từ Vercel Blob về local...");

        try {
          const latestResponse = await fetch(
            `/api/blob/local-products-latest?t=${Date.now()}`,
            {
              cache: "no-store",
            },
          );

          if (!latestResponse.ok) {
            Toastify("Chưa tìm thấy bản backup online", 400);
            return;
          }

          const latest = (await latestResponse.json()) as LatestBlobBackup;

          const fileResponse = await fetch(latest.downloadUrl, {
            cache: "no-store",
          });

          if (!fileResponse.ok) {
            Toastify("Không thể tải file backup từ Blob", 400);
            return;
          }

          const gzipBlob = await fileResponse.blob();
          const text = await gzipBlobToText(gzipBlob);
          const payload = parseJsonTextToPayload(text);

          if (!payload || payload.products.length === 0) {
            Toastify("File backup online không đúng cấu trúc", 400);
            return;
          }

          await restorePayloadToLocal(payload, {
            setSettings,
            setScheduleConfig,
            setScheduleAssignments,
            setPostedRecords,
            loadProducts,
          });

          setContactDraft("");
          closeAllModals();
          Toastify("Đã tải backup online và thay thế toàn bộ dữ liệu local", 200);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Không thể tải backup online";

          Toastify(message, 400);
        } finally {
          setPageLoadingText("");
        }
      },
    });
  };

  const requestDownload = (request: DownloadRequest): void => {
    setSkipInternalDownloadImages(false);
    setPendingDownload(request);
  };

  const getDownloadImages = (request: DownloadRequest): ProductImage[] => {
    if (skipInternalDownloadImages) return request.images;

    return [...request.images, ...(request.internalImages ?? [])];
  };

  const copyDownloadTextIfNeeded = async (
    request: DownloadRequest,
  ): Promise<void> => {
    if (request.textToCopy === undefined) return;

    const sourceText = request.textToCopy.trim();

    const textToCopy = composeCopyText(
      sourceText,
      activeContactText,
      settings.includeSocialTags,
    );

    if (!textToCopy) return;

    try {
      await copyText(textToCopy);
      setCopiedKey("download-description");
      Toastify("Đã tự động copy nội dung Post", 200);

      window.setTimeout(() => {
        setCopiedKey((current) =>
          current === "download-description" ? "" : current,
        );
      }, 1200);
    } catch {
      Toastify("Không thể tự động copy nội dung Post", 300);
    }
  };

  const executeDownloadRequest = async (): Promise<void> => {
    if (!pendingDownload) return;

    const request = pendingDownload;
    const images = getDownloadImages(request);

    if (images.length === 0) {
      Toastify("Không còn ảnh phù hợp để tải", 300);
      return;
    }

    await copyDownloadTextIfNeeded(request);

    images.forEach((image, index) => {
      window.setTimeout(() => {
        void downloadImageAsJpg(image, request.startIndex + index);
      }, index * 180);
    });

    Toastify(`Đang tải ${images.length} ảnh JPG`, 200);
    setPendingDownload(null);
    setSkipInternalDownloadImages(false);
  };

  const executeDownloadToFolder = async (): Promise<void> => {
    if (!pendingDownload) return;

    const request = pendingDownload;
    const images = getDownloadImages(request);

    if (images.length === 0) {
      Toastify("Không còn ảnh phù hợp để tải", 300);
      return;
    }

    try {
      await copyDownloadTextIfNeeded(request);
      await saveImagesToChosenFolder({ ...request, images });
      Toastify(`Đã lưu ${images.length} ảnh vào thư mục đã chọn`, 200);
      setPendingDownload(null);
      setSkipInternalDownloadImages(false);
    } catch {
      Toastify(
        "Trình duyệt chưa cho phép chọn thư mục hoặc thao tác đã bị hủy",
        400,
      );
    }
  };

  const handleDownloadProductImages = (product: LocalProduct): void => {
    const totalProductImages =
      product.images.length + product.internalImages.length;

    if (totalProductImages === 0) {
      Toastify("Sản phẩm chưa có ảnh để tải", 300);
      return;
    }

    const postText =
      product.description.trim() || settings.commonDescription.trim();

    requestDownload({
      title: "Tải ảnh sản phẩm",
      description:
        "Tải ảnh của sản phẩm này về máy? Toàn bộ Post sẽ được tự động copy trước khi tải.",
      mode: "multiple",
      images: product.images,
      internalImages: product.internalImages,
      startIndex: 0,
      textToCopy: postText,
    });
  };

  const openImageAlbum = (source: AlbumSource): void => {
    if (source.images.length === 0) {
      Toastify("Chưa có ảnh để xem", 300);
      return;
    }

    const firstImageId = source.images[0]?.id ?? "";

    setAlbumSource(source);
    setSelectedAlbumImageId(firstImageId);
    setSelectedAlbumImageIds(
      firstImageId ? new Set<string>([firstImageId]) : new Set<string>(),
    );
    openModal("imageAlbum");
  };

  const toggleSelectedAlbumImage = (imageId: string): void => {
    setSelectedAlbumImageId(imageId);

    setSelectedAlbumImageIds((current) => {
      const nextIds = new Set(current);

      if (nextIds.has(imageId)) {
        nextIds.delete(imageId);
        return nextIds;
      }

      nextIds.add(imageId);
      return nextIds;
    });
  };

  const handleShareProduct = (product: LocalProduct): void => {
    const descriptionText =
      product.description.trim() || settings.commonDescription.trim();

    setShareDialogStep("share");
    setIncludeInternalShareImages(false);
    setPendingShare({
      title: product.name,
      images: product.images,
      internalImages: product.internalImages,
      postText: descriptionText,
      commentText: buildCommentContentText(
        product.name,
        descriptionText,
        product.priceText,
        "",
      ),
      shareKey: `share-product-${product.id}`,
      successMessage: "Đã mở bảng chia sẻ sản phẩm",
    });
  };

  const handleShareSelectedAlbumImages = (): void => {
    if (!albumSource) {
      Toastify("Chưa có album để chia sẻ", 300);
      return;
    }

    const selectedImages = albumSource.images.filter((image) =>
      selectedAlbumImageIds.has(image.id),
    );

    if (selectedImages.length === 0) {
      Toastify("Chưa chọn ảnh để chia sẻ", 300);
      return;
    }

    setShareDialogStep("share");
    setIncludeInternalShareImages(false);
    setPendingShare({
      title: albumSource.title,
      images: selectedImages,
      internalImages: albumSource.internalImages ?? [],
      postText: albumSource.description,
      commentText: buildCommentContentText(
        albumSource.title,
        albumSource.description,
        albumSource.priceText,
        "",
      ),
      shareKey: "album-share-selected",
      successMessage: "Đã mở bảng chia sẻ ảnh",
    });
  };

  const executeShareRequest = async (
    mode: ShareContentMode,
    shareImagesOnly = mode === "imagesOnly",
  ): Promise<void> => {
    if (!pendingShare || isShareExecuting) return;

    const request = pendingShare;
    const shareImages = includeInternalShareImages
      ? [...request.images, ...(request.internalImages ?? [])]
      : request.images;
    const textValue =
      mode === "post"
        ? composeCopyText(
          request.postText,
          activeContactText,
          settings.includeSocialTags,
        )
        : mode === "comment"
          ? composeCopyText(
            request.commentText,
            activeContactText,
            false,
          )
          : "";
    const contentLabel = mode === "post" ? "Post" : "Cmt";
    const shouldCopyText = mode !== "imagesOnly";
    const shareNavigator = getNativeShareNavigator();
    let copiedToClipboard = false;

    const markShared = (): void => {
      setCopiedKey(request.shareKey);

      getActiveInteractionWindow().setTimeout(() => {
        setCopiedKey((current) =>
          current === request.shareKey ? "" : current,
        );
      }, 1200);
    };

    setIsShareExecuting(true);

    try {
      if (shouldCopyText && textValue) {
        try {
          await copyText(textValue);
          copiedToClipboard = true;
        } catch {
          copiedToClipboard = false;
        }
      }

      const files = await Promise.all(
        shareImages.map((image, index) =>
          dataUrlToShareFile(
            image.dataUrl,
            image.name || createSystemImageFilename(index, image.id),
          ),
        ),
      );

      if (shareImagesOnly && files.length === 0) {
        Toastify("Chưa có ảnh để chia sẻ", 300);
        return;
      }

      if (shareNavigator?.share) {
        const shareData: NativeShareData =
          shareImagesOnly
            ? { files }
            : { title: request.title, text: textValue, files };
        const canShareWithFiles =
          files.length > 0 &&
          (shareNavigator.canShare?.(shareData) ?? true);

        if (canShareWithFiles) {
          await shareNavigator.share(shareData);
          markShared();
          Toastify(
            shouldCopyText
              ? copiedToClipboard
                ? shareImagesOnly
                  ? `Đã copy ${contentLabel} và mở chia sẻ chỉ hình ảnh`
                  : `Đã copy ${contentLabel} và mở bảng chia sẻ`
                : "Đã mở bảng chia sẻ nhưng không thể tự động copy nội dung"
              : request.successMessage,
            shouldCopyText && !copiedToClipboard ? 300 : 200,
          );
          return;
        }

        if (shareImagesOnly) {
          Toastify(
            copiedToClipboard
              ? `Đã copy ${contentLabel} nhưng thiết bị chưa hỗ trợ chia sẻ ảnh đã chọn`
              : "Thiết bị chưa hỗ trợ chia sẻ ảnh đã chọn",
            copiedToClipboard ? 300 : 400,
          );
          return;
        }

        await shareNavigator.share({
          title: request.title,
          text: textValue,
        });
        markShared();
        Toastify(
          copiedToClipboard
            ? files.length > 0
              ? `Đã copy ${contentLabel}; thiết bị chỉ mở chia sẻ nội dung`
              : `Đã copy ${contentLabel} và mở bảng chia sẻ`
            : files.length > 0
              ? "Thiết bị chỉ mở chia sẻ nội dung và không thể tự động copy"
              : "Đã mở bảng chia sẻ nhưng không thể tự động copy nội dung",
          copiedToClipboard ? 200 : 300,
        );
        return;
      }

      if (shareImagesOnly) {
        Toastify(
          copiedToClipboard
            ? `Đã copy ${contentLabel} nhưng trình duyệt chưa hỗ trợ chia sẻ chỉ hình ảnh`
            : "Trình duyệt chưa hỗ trợ chia sẻ chỉ hình ảnh",
          copiedToClipboard ? 300 : 400,
        );
        return;
      }

      if (copiedToClipboard) {
        markShared();
        Toastify(
          `Trình duyệt chưa hỗ trợ chia sẻ, đã copy ${contentLabel}`,
          200,
        );
        return;
      }

      Toastify("Trình duyệt chưa hỗ trợ chia sẻ hoặc clipboard", 400);
    } catch (error) {
      if (isAbortError(error)) {
        if (copiedToClipboard) {
          markShared();
          Toastify(`Đã copy ${contentLabel}`, 200);
        }
        return;
      }

      if (shareImagesOnly) {
        Toastify(
          copiedToClipboard
            ? `Đã copy ${contentLabel} nhưng không thể chia sẻ ảnh đã chọn`
            : "Không thể chia sẻ ảnh đã chọn",
          copiedToClipboard ? 300 : 400,
        );
        return;
      }

      if (copiedToClipboard) {
        markShared();
        Toastify(`Không thể mở chia sẻ, đã copy ${contentLabel}`, 300);
        return;
      }

      Toastify("Không thể chia sẻ hoặc copy nội dung", 400);
    } finally {
      setPendingShare(null);
      setIncludeInternalShareImages(false);
      setShareDialogStep("share");
      setIsShareExecuting(false);
    }
  };

  const handleDownloadSelectedAlbumImages = (): void => {
    if (!albumSource) {
      Toastify("Chưa có album để tải", 300);
      return;
    }

    const selectedImages = albumSource.images.filter((image) =>
      selectedAlbumImageIds.has(image.id),
    );

    if (selectedImages.length === 0) {
      Toastify("Chưa chọn ảnh để tải", 300);
      return;
    }

    requestDownload({
      title: "Tải ảnh đã chọn",
      description: `Tải ${selectedImages.length} ảnh đã chọn về máy? Toàn bộ Post sẽ được tự động copy trước khi tải.`,
      mode: selectedImages.length === 1 ? "single" : "multiple",
      images: selectedImages,
      startIndex: 0,
      textToCopy: albumSource.description,
    });
  };

  const handleSelectAllAlbumImages = (): void => {
    if (!albumSource) return;

    setSelectedAlbumImageIds(
      new Set<string>(albumSource.images.map((image) => image.id)),
    );
  };

  const handleClearSelectedAlbumImages = (): void => {
    setSelectedAlbumImageIds(new Set<string>());
  };

  const handleDownloadAlbumImages = (): void => {
    const internalImages = albumSource?.internalImages ?? [];
    const totalAlbumImages =
      (albumSource?.images.length ?? 0) + internalImages.length;

    if (!albumSource || totalAlbumImages === 0) {
      Toastify("Album chưa có ảnh để tải", 300);
      return;
    }

    requestDownload({
      title: "Tải toàn bộ album",
      description:
        "Tải toàn bộ ảnh trong album về máy? Toàn bộ Post sẽ được tự động copy trước khi tải.",
      mode: totalAlbumImages === 1 ? "single" : "multiple",
      images: albumSource.images,
      internalImages,
      startIndex: 0,
      textToCopy: albumSource.description,
    });
  };

  const handleDownloadRepresentativeImages = (): void => {
    const representativeImages = representativeImageProducts
      .map((product) => product.images[0])
      .filter((image): image is ProductImage => Boolean(image));

    if (representativeImages.length === 0) {
      Toastify("Danh mục đã chọn chưa có ảnh đại diện để tải", 300);
      return;
    }

    const categoryLabel =
      imageDownloadCategory === "all"
        ? "tất cả danh mục"
        : `danh mục ${imageDownloadCategory}`;

    requestDownload({
      title: "Tải ảnh đại diện",
      description: `Tải ${representativeImages.length} ảnh đại diện, là ảnh đầu tiên có index 0 của mỗi sản phẩm thuộc ${categoryLabel}, về máy?`,
      mode: representativeImages.length === 1 ? "single" : "multiple",
      images: representativeImages,
      startIndex: 0,
    });
  };

  const handleDownloadAllImages = (): void => {
    const allMainImages = downloadableProducts.flatMap(
      (product) => product.images,
    );
    const allInternalImages = downloadableProducts.flatMap(
      (product) => product.internalImages,
    );
    const totalDownloadImages =
      allMainImages.length + allInternalImages.length;

    if (totalDownloadImages === 0) {
      Toastify("Chưa có ảnh của sản phẩm chưa DONE để tải", 300);
      return;
    }

    const activeDescriptions = downloadableProducts
      .map((product) => {
        const description =
          product.description.trim() || settings.commonDescription.trim();

        return [product.name, description].filter(Boolean).join("\n");
      })
      .filter(Boolean)
      .join("\n\n---\n\n");

    requestDownload({
      title: "Tải toàn bộ ảnh",
      description:
        "Tải ảnh của tất cả sản phẩm chưa DONE về máy? Toàn bộ nội dung Post của các sản phẩm này sẽ được tự động copy trước khi tải.",
      mode: "multiple",
      images: allMainImages,
      internalImages: allInternalImages,
      startIndex: 0,
      textToCopy: activeDescriptions,
    });
  };

  const toggleScheduleCategory = (category: string): void => {
    setScheduleConfig((current) => {
      const categoryKey = normalizeTextKey(category);
      const exists = current.selectedCategories.some(
        (item) => normalizeTextKey(item) === categoryKey,
      );

      return {
        ...current,
        selectedCategories: exists
          ? current.selectedCategories.filter(
            (item) => normalizeTextKey(item) !== categoryKey,
          )
          : [...current.selectedCategories, normalizeCategoryName(category)],
      };
    });
  };

  const getAssignedProduct = (
    date: string,
    time: string,
    slotIndex: number,
    taskIndex: number,
  ): LocalProduct | undefined => {
    const assignmentKey = createScheduleAssignmentKey(
      date,
      slotIndex,
      taskIndex,
    );
    const legacyAssignmentKey = createLegacyScheduleAssignmentKey(
      date,
      time,
      taskIndex,
    );

    const productId =
      scheduleAssignments[assignmentKey] ??
      scheduleAssignments[legacyAssignmentKey];

    return products.find(
      (product) => product.id === productId && !product.isDone,
    );
  };

  const assignProductToSchedule = (
    date: string,
    time: string,
    slotIndex: number,
    taskIndex: number,
    productId: string,
  ): void => {
    const assignmentKey = createScheduleAssignmentKey(
      date,
      slotIndex,
      taskIndex,
    );
    const legacyAssignmentKey = createLegacyScheduleAssignmentKey(
      date,
      time,
      taskIndex,
    );
    const postedKey = createPostedKey(date, slotIndex, taskIndex);

    if (productId) {
      const selectedProduct = products.find(
        (product) => product.id === productId,
      );

      if (!selectedProduct) {
        Toastify("Không tìm thấy sản phẩm để xếp lịch", 400);
        return;
      }

      if (selectedProduct.isDone) {
        Toastify("Sản phẩm đã DONE nên không thể đưa vào lịch", 300);
        return;
      }
    }

    const currentProductId =
      scheduleAssignments[assignmentKey] ??
      scheduleAssignments[legacyAssignmentKey] ??
      "";

    if (currentProductId !== productId) {
      setPostedRecords((current) => {
        const nextRecords = current.filter(
          (record) => record.slotId !== postedKey,
        );

        if (nextRecords.length !== current.length) {
          savePostedRecords(nextRecords);
        }

        return nextRecords;
      });
    }

    setScheduleAssignments((current) => {
      const nextAssignments: ScheduleAssignmentMap = { ...current };

      delete nextAssignments[legacyAssignmentKey];

      if (!productId) {
        delete nextAssignments[assignmentKey];
        return nextAssignments;
      }

      const duplicatedInSameTask = Object.entries(nextAssignments).some(
        ([key, value]) => {
          if (key === assignmentKey) return false;
          if (value !== productId) return false;

          return key.startsWith(`${date}::task${taskIndex + 1}::`);
        },
      );

      if (duplicatedInSameTask) {
        Toastify("Sản phẩm này đã có trong task này hôm nay", 300);
        return current;
      }

      const duplicatedInSameTime = Object.entries(nextAssignments).some(
        ([key, value]) => {
          if (key === assignmentKey) return false;
          if (value !== productId) return false;

          return (
            key.match(
              new RegExp(`^${date}::task\\d+::slot${slotIndex + 1}$`),
            ) !== null
          );
        },
      );

      if (duplicatedInSameTime) {
        Toastify("Sản phẩm này đã có ở task khác trong cùng khung giờ", 300);
        return current;
      }

      nextAssignments[assignmentKey] = productId;
      setSelectedProductId(productId);

      return nextAssignments;
    });
  };

  const handleScheduleDrop = (
    event: DragEvent<HTMLElement>,
    date: string,
    time: string,
    slotIndex: number,
    taskIndex: number,
  ): void => {
    event.preventDefault();

    const productId =
      event.dataTransfer.getData("text/plain") || draggingProductId;
    const sourceAssignmentKey = event.dataTransfer.getData(
      "application/x-schedule-assignment-key",
    );
    const targetAssignmentKey = createScheduleAssignmentKey(
      date,
      slotIndex,
      taskIndex,
    );

    if (!productId) return;

    if (sourceAssignmentKey) {
      moveScheduleAssignment(
        sourceAssignmentKey,
        targetAssignmentKey,
        productId,
      );
      setDraggingProductId("");
      return;
    }

    assignProductToSchedule(date, time, slotIndex, taskIndex, productId);
    setDraggingProductId("");
  };

  const addScheduleTask = (): void => {
    setScheduleConfig((current) => {
      const nextTaskCount = Math.min(64, current.taskCount + 1);

      return {
        ...current,
        taskCount: nextTaskCount,
        taskNames: Array.from(
          { length: nextTaskCount },
          (_, index) => current.taskNames[index] || `Task ${index + 1}`,
        ),
      };
    });
  };

  const requestRemoveScheduleTask = (taskIndex: number): void => {
    if (scheduleConfig.taskCount <= 1) {
      Toastify("Cần giữ lại ít nhất một task", 300);
      return;
    }

    setPendingRemoveTaskIndex(taskIndex);
  };

  const removeScheduleTask = (taskIndexToRemove: number): void => {
    setScheduleConfig((current) => {
      const nextTaskCount = Math.max(1, current.taskCount - 1);
      const nextTaskNames = current.taskNames.filter(
        (_, index) => index !== taskIndexToRemove,
      );

      setScheduleAssignments((assignments) => {
        const nextAssignments: ScheduleAssignmentMap = {};

        Object.entries(assignments).forEach(([key, value]) => {
          const match = key.match(/::task(\d+)::/);
          const taskNumber = match ? Number(match[1]) : 0;
          const taskIndex = taskNumber - 1;

          if (taskIndex === taskIndexToRemove) return;

          if (taskIndex > taskIndexToRemove) {
            const shiftedKey = key.replace(
              `::task${taskNumber}::`,
              `::task${taskNumber - 1}::`,
            );
            nextAssignments[shiftedKey] = value as string;
            return;
          }

          nextAssignments[key] = value as string;
        });

        return nextAssignments;
      });

      return {
        ...current,
        taskCount: nextTaskCount,
        taskNames: Array.from(
          { length: nextTaskCount },
          (_, index) => nextTaskNames[index] || `Task ${index + 1}`,
        ),
      };
    });

    setActiveScheduleTaskIndex((current) =>
      Math.min(current, Math.max(0, scheduleConfig.taskCount - 2)),
    );
    setPendingRemoveTaskIndex(null);
    Toastify("Đã xoá đúng task đã chọn", 200);
  };

  const updateScheduleTaskName = (taskIndex: number, value: string): void => {
    setScheduleConfig((current) => {
      const taskNames = Array.from(
        { length: Math.max(1, current.taskCount) },
        (_, index) => current.taskNames[index] || `Task ${index + 1}`,
      );

      taskNames[taskIndex] = value;

      return {
        ...current,
        taskNames,
      };
    });
  };

  const duplicateFirstScheduleTask = (): void => {
    if (scheduleConfig.taskCount <= 1) {
      Toastify("Cần ít nhất hai task lịch để nhân bản", 300);
      return;
    }

    Toastify(
      "Không nên nhân bản task vì dễ trùng sản phẩm cùng khung giờ. Hãy dùng Tự rải lịch.",
      300,
    );
  };

  const autoFillScheduleAssignments = (): void => {
    const targetDate = today;
    const targetPrefix = `${targetDate}::task`;
    const slotCount = scheduleTimes.length;

    if (slotCount === 0) {
      Toastify("Khung giờ chưa hợp lệ để tự rải lịch", 400);
      return;
    }

    const availableProducts = scheduleProducts.filter(
      (product) => !product.isDone,
    );

    if (availableProducts.length === 0) {
      Toastify("Không có sản phẩm khả dụng để tự rải lịch", 400);
      return;
    }

    const orderedProducts = createCategoryBalancedProducts(availableProducts);
    const requiredTaskCount = Math.max(
      1,
      Math.ceil(orderedProducts.length / slotCount),
    );
    const nextTaskNames = Array.from(
      { length: requiredTaskCount },
      (_, index) => scheduleConfig.taskNames[index] || `Task ${index + 1}`,
    );
    const nextAssignments: ScheduleAssignmentMap = {};

    Object.entries(scheduleAssignments).forEach(([key, value]) => {
      if (!key.startsWith(targetPrefix)) {
        nextAssignments[key] = value as string;
      }
    });

    let productIndex = 0;

    for (let taskIndex = 0; taskIndex < requiredTaskCount; taskIndex += 1) {
      const usedProductIdsInTask = new Set<string>();

      for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
        const product = orderedProducts[productIndex];

        if (!product) break;

        if (usedProductIdsInTask.has(product.id)) {
          continue;
        }

        const assignmentKey = createScheduleAssignmentKey(
          targetDate,
          slotIndex,
          taskIndex,
        );
        nextAssignments[assignmentKey] = product.id;
        usedProductIdsInTask.add(product.id);
        productIndex += 1;
      }
    }

    const nextConfig: ScheduleConfig = {
      ...scheduleConfig,
      dateFrom: targetDate,
      dateTo: targetDate,
      taskCount: requiredTaskCount,
      taskNames: nextTaskNames,
    };

    const nextRecords = postedRecords.filter(
      (record) => !record.slotId.startsWith(targetPrefix),
    );

    setScheduleConfig(nextConfig);
    saveScheduleConfig(nextConfig);
    setActiveScheduleTaskIndex(0);
    setScheduleAssignments(nextAssignments);
    saveScheduleAssignments(nextAssignments);
    setPostedRecords(nextRecords);
    savePostedRecords(nextRecords);

    Toastify(
      `Đã rải đúng ${productIndex}/${orderedProducts.length} sản phẩm vào ${requiredTaskCount} task`,
      productIndex === orderedProducts.length ? 200 : 300,
    );
  };

  const resetActiveScheduleTaskAssignments = (): void => {
    const taskPrefix = `${today}::task${activeScheduleTaskIndex + 1}::`;

    setScheduleAssignments((current) => {
      const nextAssignments: ScheduleAssignmentMap = {};

      Object.entries(current).forEach(([key, value]) => {
        if (!key.startsWith(taskPrefix)) {
          nextAssignments[key] = value as string;
        }
      });

      return nextAssignments;
    });

    setPostedRecords((current) => {
      const nextRecords = current.filter(
        (record) => !record.slotId.startsWith(taskPrefix),
      );

      if (nextRecords.length !== current.length) {
        savePostedRecords(nextRecords);
      }

      return nextRecords;
    });

    Toastify(
      `Đã xóa sản phẩm khỏi ${getTaskName(scheduleConfig, activeScheduleTaskIndex)}`,
      200,
    );
  };

  const resetAllScheduleAssignments = (): void => {
    const todayPrefix = `${today}::`;

    setScheduleAssignments((current) => {
      const nextAssignments: ScheduleAssignmentMap = {};

      Object.entries(current).forEach(([key, value]) => {
        if (!key.startsWith(todayPrefix)) {
          nextAssignments[key] = value as string;
        }
      });

      return nextAssignments;
    });

    setPostedRecords((current) => {
      const nextRecords = current.filter(
        (record) => !record.slotId.startsWith(todayPrefix),
      );

      if (nextRecords.length !== current.length) {
        savePostedRecords(nextRecords);
      }

      return nextRecords;
    });

    Toastify("Đã xóa toàn bộ sản phẩm khỏi lịch hôm nay", 200);
  };

  const getTodayProductScheduleLabels = (productId: string): string[] => {
    return Object.entries(scheduleAssignments)
      .filter(
        ([key, value]) =>
          key.startsWith(`${today}::task`) && value === productId,
      )
      .map(([key]) => {
        const match = key.match(/^\d{4}-\d{2}-\d{2}::task(\d+)::slot(\d+)$/);

        if (!match) return "Đã xếp";

        const taskIndex = Number(match[1]) - 1;
        const slotIndex = Number(match[2]) - 1;
        const taskName = getTaskName(scheduleConfig, taskIndex);
        const time = scheduleTimes[slotIndex] ?? `Bài ${slotIndex + 1}`;

        return `${taskName} · ${time}`;
      });
  };

  const swapPostedRecordKeys = (sourceKey: string, targetKey: string): void => {
    setPostedRecords((current) => {
      const sourceRecord = current.find(
        (record) => record.slotId === sourceKey,
      );
      const targetRecord = current.find(
        (record) => record.slotId === targetKey,
      );
      const nextRecords = current.filter(
        (record) => record.slotId !== sourceKey && record.slotId !== targetKey,
      );

      if (sourceRecord) {
        nextRecords.push({
          ...sourceRecord,
          slotId: targetKey,
        });
      }

      if (targetRecord) {
        nextRecords.push({
          ...targetRecord,
          slotId: sourceKey,
        });
      }

      savePostedRecords(nextRecords);

      return nextRecords;
    });
  };

  const moveScheduleAssignment = (
    sourceKey: string,
    targetKey: string,
    productId: string,
  ): void => {
    if (!sourceKey || sourceKey === targetKey) return;

    setScheduleAssignments((current) => {
      const sourceProductId = current[sourceKey] ?? productId;
      const targetProductId = current[targetKey];

      if (!sourceProductId) return current;

      const nextAssignments: ScheduleAssignmentMap = { ...current };

      nextAssignments[targetKey] = sourceProductId;

      if (targetProductId) {
        nextAssignments[sourceKey] = targetProductId;
      } else {
        delete nextAssignments[sourceKey];
      }

      return nextAssignments;
    });

    swapPostedRecordKeys(sourceKey, targetKey);
    setSelectedProductId(productId);
    Toastify("Đã đổi vị trí bài trong task", 200);
  };

  const toggleExpandedProduct = (productId: string): void => {
    setExpandedProductIds((current) => {
      const next = new Set(current);

      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }

      return next;
    });
  };

  const togglePostedProduct = (
    date: string,
    slotIndex: number,
    taskIndex = 0,
  ): void => {
    const postedKey = createPostedKey(date, slotIndex, taskIndex);

    setPostedRecords((current) => {
      const exists = current.some((record) => record.slotId === postedKey);

      const nextRecords = exists
        ? current.filter((record) => record.slotId !== postedKey)
        : [
          ...current,
          {
            slotId: postedKey,
            postedAt: new Date().toISOString(),
          },
        ];

      savePostedRecords(nextRecords);
      Toastify(exists ? "Đã chuyển về chưa đăng" : "Đã đánh dấu DONE", 200);

      return nextRecords;
    });
  };

  const togglePostedSlot = (
    date: string,
    slotIndex: number,
    taskIndex = 0,
  ): void => {
    togglePostedProduct(date, slotIndex, taskIndex);
  };

  const openAssignedSlotModal = (
    date: string,
    slotIndex: number,
    taskIndex: number,
  ): void => {
    setSelectedSlotId(createScheduleAssignmentKey(date, slotIndex, taskIndex));
    openModal("slotDetail");
  };

  const selectedAssignedSlot = useMemo(() => {
    const match = selectedSlotId.match(
      /^(\d{4}-\d{2}-\d{2})::task(\d+)::slot(\d+)$/,
    );

    if (!match) return null;

    const [, date, taskNumberText, slotNumberText] = match;

    if (!date || !taskNumberText || !slotNumberText) return null;

    const taskIndex = Number(taskNumberText) - 1;
    const slotIndex = Number(slotNumberText) - 1;
    const time = scheduleTimes[slotIndex] ?? "";
    const product = getAssignedProduct(date, time, slotIndex, taskIndex);

    if (!product) return null;

    const description =
      product.description.trim() || settings.commonDescription.trim();

    return {
      key: selectedSlotId,
      date,
      time,
      slotIndex,
      taskIndex,
      taskName: getTaskName(scheduleConfig, taskIndex),
      product,
      description,
      postText: buildPostText(
        product,
        settings.commonDescription,
        activeContactText,
        settings.includeSocialTags,
      ),
      done: postedIds.has(createPostedKey(date, slotIndex, taskIndex)),
    };
  }, [
    selectedSlotId,
    scheduleTimes,
    scheduleAssignments,
    products,
    activeContactText,
    settings.includeSocialTags,
    settings.commonDescription,
    scheduleConfig,
    postedIds,
  ]);

  const requestConfirm = (request: ConfirmRequest): void => {
    setPendingConfirm(request);
  };

  const closeConfirm = (): void => {
    if (isConfirmExecuting) return;

    pendingConfirm?.onCancel?.();
    setPendingConfirm(null);
  };

  const executeConfirm = async (): Promise<void> => {
    if (!pendingConfirm || isConfirmExecuting) return;

    const request = pendingConfirm;

    setIsConfirmExecuting(true);

    try {
      await request.onConfirm();
      setPendingConfirm(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể thực hiện thao tác";
      Toastify(message, 400);
    } finally {
      setIsConfirmExecuting(false);
    }
  };

  const closeBlobUploadConfirm = (): void => {
    pendingBlobUpload?.onCancel?.();
    setPendingBlobUpload(null);
    setBlobUploadPassword("");
  };

  const executeBlobUploadConfirm = async (): Promise<void> => {
    if (!pendingBlobUpload) return;

    const uploadKey = blobUploadPassword.trim();

    if (!uploadKey) {
      Toastify("Vui lòng nhập mật khẩu upload Blob", 400);
      return;
    }

    const action = pendingBlobUpload.onConfirm;

    closeAllModals();
    await action(uploadKey);
  };

  const getSelectedTextFromDescriptionContainer = (
    container: HTMLElement,
  ): string => {
    if (typeof window === "undefined") return "";

    const selection = getActiveInteractionWindow().getSelection();

    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return "";
    }

    const selectedText = selection.toString().trim();

    if (!selectedText) return "";

    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;

    if (!anchorNode || !focusNode) return "";
    if (!container.contains(anchorNode) || !container.contains(focusNode)) {
      return "";
    }

    const range = selection.getRangeAt(0);
    const lineElements = Array.from(
      container.querySelectorAll<HTMLElement>("[data-description-line='true']"),
    );

    const selectedLines = lineElements
      .filter((element) => range.intersectsNode(element))
      .map((element) => element.dataset.descriptionLineText ?? element.textContent ?? "")
      .map((line) => line.trim())
      .filter(Boolean);

    if (selectedLines.length === 0) return selectedText;

    return Array.from(new Set(selectedLines)).join("\n");
  };

  const updateSelectedDescriptionCopy = (
    productId: string,
    container: HTMLElement,
  ): boolean => {
    const selectedText = getSelectedTextFromDescriptionContainer(container);

    if (!selectedText) {
      setSelectedDescriptionCopy((current) =>
        current?.productId === productId ? null : current,
      );

      return false;
    }

    setSelectedDescriptionCopy({
      productId,
      text: selectedText,
    });

    return true;
  };

  const handleCopySelectedDescription = async (
    productId: string,
  ): Promise<void> => {
    if (!selectedDescriptionCopy || selectedDescriptionCopy.productId !== productId) {
      Toastify("Chưa có nội dung mô tả được chọn", 300);
      return;
    }

    const copyKey = `selected-description-${productId}`;

    await handleCopyField(copyKey, "nội dung đã chọn", selectedDescriptionCopy.text);
    getActiveInteractionWindow().getSelection()?.removeAllRanges();
    setSelectedDescriptionCopy(null);
  };

  const renderCopyIcon = (key: string) => {
    return copiedKey === key ? (
      <FiCheckCircle aria-hidden="true" className={iconClassName} />
    ) : (
      <FiCopy aria-hidden="true" className={iconClassName} />
    );
  };

  const renderDescriptionText = (
    productId: string,
    description: string,
    expanded: boolean,
  ) => {
    if (!expanded) {
      return description || "Chưa có mô tả";
    }

    const lines = description.split(/\r?\n/u);

    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      const copyKey = `plus-line-${productId}-${index}`;
      const isPlusLine = trimmedLine.startsWith("+");

      if (!trimmedLine) {
        return <br key={`${productId}-empty-${index}`} />;
      }

      if (!isPlusLine) {
        return (
          <span
            key={`${productId}-line-${index}`}
            className="block min-w-0 max-w-full whitespace-pre-wrap [overflow-wrap:anywhere]"
            data-description-line="true"
            data-description-line-text={line}
          >
            {line}
          </span>
        );
      }

      return (
        <button
          key={`${productId}-plus-${index}`}
          type="button"
          data-description-line="true"
          data-description-line-text={trimmedLine}
          className={`my-0.5 block w-full min-w-0 max-w-full select-text whitespace-pre-wrap rounded-md px-0.5 py-1 text-left [overflow-wrap:anywhere] transition ${copiedKey === copyKey
            ? "bg-amber-200 text-slate-950"
            : "bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
            }`}
          onClick={(event) => {
            event.stopPropagation();
            void handleCopyField(copyKey, "dòng mô tả", trimmedLine);
          }}
        >
          {trimmedLine}
        </button>
      );
    });
  };

  const renderDraftImageCollection = (
    imageField: ProductImageField,
    label: string,
  ) => {
    const images = draft[imageField];

    if (images.length === 0) return null;

    return (
      <div className="flex min-h-0 min-w-0 flex-col rounded-md border border-white/10 bg-slate-950/70 p-2.5">
        <div
          data-editor-toolbar="true"
          className="mb-2 flex min-w-0 items-center justify-between gap-2"
        >
          <span className="flex min-w-0 items-center gap-2 whitespace-nowrap text-xs font-black text-white">
            <FiImage aria-hidden="true" className={iconClassName} />
            {images.length} {label}
          </span>

          <button
            type="button"
            className="flex shrink-0 items-center gap-2 rounded-md border border-white/10 bg-slate-800 p-2 text-xs font-bold text-slate-300 transition hover:bg-slate-700"
            onClick={() => updateDraftField(imageField, [])}
            title={`Xóa toàn bộ ${label}`}
          >
            <FiTrash2 aria-hidden="true" className={iconClassName} />
          </button>
        </div>

        <div className="grid min-w-0 max-h-[260px] grid-cols-3 gap-1.5 overflow-x-hidden overflow-y-auto overscroll-contain pr-1 sm:max-h-[320px] sm:grid-cols-4 md:grid-cols-5 xl:max-h-[calc(90dvh-190px)] xl:grid-cols-4 2xl:grid-cols-5">
          {images.map((image, index) => {
            const isDraggingImage = draggingDraftImageId === image.id;

            return (
              <div
                key={image.id}
                draggable
                className={`group relative h-[88px] cursor-grab overflow-hidden rounded-md bg-slate-900 transition active:cursor-grabbing sm:h-[96px] xl:h-[108px] ${isDraggingImage ? "scale-95 opacity-60" : ""}`}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", image.id);
                  setDraggingDraftImageId(image.id);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourceImageId =
                    event.dataTransfer.getData("text/plain") ||
                    draggingDraftImageId;

                  reorderDraftImage(sourceImageId, image.id, imageField);
                  setDraggingDraftImageId("");
                }}
                onDragEnd={() => setDraggingDraftImageId("")}
              >
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  width={1200}
                  height={1200}
                  className="h-full w-full object-contain"
                />

                <div className="absolute left-1 top-1 rounded-md bg-black/70 px-1.5 py-0.5 whitespace-nowrap text-[10px] font-black text-white">
                  {index + 1}
                </div>

                <button
                  type="button"
                  data-image-control="true"
                  title={`Xóa ${label} ${index + 1}`}
                  aria-label={`Xóa ${label} ${index + 1}`}
                  className="absolute right-1 top-1 z-20 flex h-6 w-6 items-center justify-center rounded-md border border-white/35 bg-rose-500 text-xs text-white opacity-100 shadow-[0_6px_16px_rgba(0,0,0,0.45)] transition hover:border-white/60 hover:bg-rose-400"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeDraftImage(image.id, imageField);
                  }}
                >
                  <FiX aria-hidden="true" className={iconClassName} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isSettingsReady) {
    return (
      <main className="min-h-dvh w-full bg-[#050a11] text-slate-100">
        <ToastContainer style={{ zIndex: 1000000 }} />
        <LoadingOverlay text="Đang tải dữ liệu local, vui lòng chờ..." />
      </main>
    );
  }

  const localProductsWorkspace = (
    <main
      className={`local-products-workspace min-h-dvh w-full overflow-x-hidden bg-[#050a11] text-slate-100 ${pictureInPictureWindow
        ? "pb-[50px]"
        : "pb-[100px] xl:pb-[50px]"
        }`}
      onPaste={(event) => {
        void handlePaste(event);
      }}
      onKeyDown={handleLocalWorkspaceKeyDown}
    >
      <ToastContainer style={{ zIndex: 1000000 }} />

      <input
        id={IMPORT_BACKUP_INPUT_ID}
        type="file"
        accept=".json,.json.gz,.gz,application/json,application/gzip,application/x-gzip"
        className="sr-only"
        onChange={(event) => {
          void handleImportJson(event);
        }}
      />

      {pageLoadingText ? <LoadingOverlay text={pageLoadingText} /> : null}

      <style>{`
        .local-products-workspace {
          --luxury-ink: #07090d;
          --luxury-panel: #0b0e14;
          --luxury-panel-raised: #11151d;
          --luxury-gold: #d8c99f;
          --luxury-gold-bright: #f1e5c2;
          --luxury-line: rgba(216, 201, 159, 0.2);
          --luxury-line-soft: rgba(255, 255, 255, 0.075);
          color-scheme: dark;
          background:
            linear-gradient(rgba(216, 201, 159, 0.011) 1px, transparent 1px),
            linear-gradient(90deg, rgba(216, 201, 159, 0.011) 1px, transparent 1px),
            radial-gradient(circle at 12% -8%, rgba(216, 201, 159, 0.085), transparent 31%),
            radial-gradient(circle at 92% 24%, rgba(87, 96, 117, 0.055), transparent 29%),
            linear-gradient(145deg, #07090d 0%, #0a0d13 52%, #07090d 100%) !important;
          background-attachment: fixed;
          background-size: 42px 42px, 42px 42px, auto, auto, auto;
        }

        .local-products-workspace ::selection {
          background: rgba(216, 201, 159, 0.92);
          color: #151109;
        }

        .local-products-workspace * {
          scrollbar-color: rgba(216, 201, 159, 0.42) rgba(255, 255, 255, 0.025);
          scrollbar-width: thin;
        }

        .local-products-workspace *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .local-products-workspace *::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.025);
        }

        .local-products-workspace *::-webkit-scrollbar-thumb {
          border: 1px solid rgba(7, 9, 13, 0.8);
          background: linear-gradient(180deg, rgba(241, 229, 194, 0.68), rgba(154, 135, 88, 0.55));
        }

        .local-products-workspace button {
          min-width: 0;
          white-space: nowrap;
          flex-wrap: nowrap;
          -webkit-tap-highlight-color: transparent;
        }

        .local-products-workspace button:not([data-description-line="true"]):not([data-category-bubble="true"]):not([data-image-surface="true"]):not([data-image-control="true"]) {
          position: relative;
          isolation: isolate;
          border-radius: 0 !important;
          clip-path: polygon(7px 0, calc(100% - 7px) 0, 100% 7px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0 calc(100% - 7px), 0 7px);
          transition: color 320ms ease, background-color 320ms ease, border-color 320ms ease, box-shadow 320ms ease, filter 320ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .local-products-workspace button:not([data-description-line="true"]):not([data-category-bubble="true"]):not([data-image-surface="true"]):not([data-image-control="true"])::after {
          content: "";
          position: absolute;
          z-index: 2;
          top: -90%;
          bottom: -90%;
          left: -28%;
          width: 10%;
          pointer-events: none;
          opacity: 0;
          transform: skewX(-18deg);
          background: linear-gradient(90deg, transparent, rgba(255, 248, 224, 0.26), transparent);
          animation: luxuryMetalGlint 5.8s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }

        .local-products-workspace button:nth-child(2n)::after {
          animation-delay: 460ms;
        }

        .local-products-workspace button:nth-child(3n)::after {
          animation-delay: 920ms;
        }

        .local-products-workspace button[data-luxury-accent] {
          letter-spacing: 0.035em;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.085), inset 0 -1px 0 rgba(0, 0, 0, 0.22), 0 8px 20px rgba(0, 0, 0, 0.2) !important;
        }

        .local-products-workspace button[data-luxury-accent]::before {
          content: "";
          position: absolute;
          z-index: 1;
          top: 0;
          right: 9px;
          left: 9px;
          height: 1px;
          pointer-events: none;
          opacity: 0.62;
          background: linear-gradient(90deg, transparent, rgba(255, 248, 224, 0.7), transparent);
        }

        .local-products-workspace button[data-luxury-accent="gold"] {
          border-color: rgba(250, 240, 211, 0.88) !important;
          background: linear-gradient(135deg, #f7efd9 0%, #cdbb89 52%, #eee3c4 100%) !important;
          color: #17130a !important;
        }

        .local-products-workspace button[data-luxury-accent="sapphire"] {
          border-color: rgba(142, 187, 225, 0.46) !important;
          background: linear-gradient(145deg, rgba(37, 79, 116, 0.43), rgba(13, 27, 43, 0.94)) !important;
          color: #e1f0fb !important;
        }

        .local-products-workspace button[data-luxury-accent="emerald"] {
          border-color: rgba(125, 202, 169, 0.46) !important;
          background: linear-gradient(145deg, rgba(29, 94, 70, 0.42), rgba(11, 36, 28, 0.94)) !important;
          color: #e1f5ec !important;
        }

        .local-products-workspace button[data-luxury-accent="emerald"][aria-pressed="true"] {
          border-color: rgba(203, 239, 221, 0.7) !important;
          background: linear-gradient(135deg, #d7eee2 0%, #7cab93 56%, #c3dfd0 100%) !important;
          color: #092319 !important;
        }

        .local-products-workspace button[data-luxury-accent="violet"] {
          border-color: rgba(184, 163, 226, 0.45) !important;
          background: linear-gradient(145deg, rgba(82, 60, 129, 0.42), rgba(31, 24, 49, 0.94)) !important;
          color: #f0eafa !important;
        }

        .local-products-workspace button[data-luxury-accent="amber"] {
          border-color: rgba(224, 190, 124, 0.47) !important;
          background: linear-gradient(145deg, rgba(122, 84, 32, 0.42), rgba(47, 33, 15, 0.94)) !important;
          color: #faebc9 !important;
        }

        .local-products-workspace button[data-luxury-accent="rose"] {
          border-color: rgba(220, 154, 169, 0.45) !important;
          background: linear-gradient(145deg, rgba(108, 50, 66, 0.42), rgba(47, 23, 30, 0.94)) !important;
          color: #fae6ea !important;
        }

        .local-products-workspace button[data-luxury-accent="indigo"] {
          border-color: rgba(151, 167, 222, 0.45) !important;
          background: linear-gradient(145deg, rgba(57, 69, 128, 0.42), rgba(24, 29, 58, 0.94)) !important;
          color: #e9ecf9 !important;
        }

        .local-products-workspace button[data-luxury-accent="cyan"] {
          border-color: rgba(121, 197, 206, 0.45) !important;
          background: linear-gradient(145deg, rgba(29, 97, 107, 0.42), rgba(11, 39, 44, 0.94)) !important;
          color: #e1f4f5 !important;
        }

        .local-products-workspace button[data-luxury-accent="amethyst"] {
          border-color: rgba(202, 154, 217, 0.45) !important;
          background: linear-gradient(145deg, rgba(98, 49, 112, 0.42), rgba(42, 21, 49, 0.94)) !important;
          color: #f4e7f7 !important;
        }

        .local-products-workspace button[data-luxury-accent="teal"] {
          border-color: rgba(115, 194, 182, 0.45) !important;
          background: linear-gradient(145deg, rgba(27, 92, 83, 0.42), rgba(11, 38, 35, 0.94)) !important;
          color: #e0f3ee !important;
        }

        .local-products-workspace button[data-luxury-accent="blue"] {
          border-color: rgba(128, 167, 221, 0.45) !important;
          background: linear-gradient(145deg, rgba(41, 81, 137, 0.42), rgba(16, 32, 61, 0.94)) !important;
          color: #e5eefb !important;
        }

        .local-products-workspace button[data-luxury-accent]:hover {
          border-color: rgba(245, 235, 205, 0.58) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.11), inset 0 -1px 0 rgba(0, 0, 0, 0.22), 0 11px 26px rgba(0, 0, 0, 0.28), 0 0 14px rgba(216, 201, 159, 0.07) !important;
        }

        .local-products-workspace button:not(:disabled),
        .local-products-workspace label[for],
        .local-products-workspace input[type="radio"],
        .local-products-workspace [role="button"] {
          cursor: pointer;
        }

        .local-products-workspace button:not(:disabled):not([data-description-line="true"]):not([data-image-surface="true"]):not([data-image-control="true"]):hover {
          transform: translateY(-1px);
          filter: brightness(1.035);
        }

        .local-products-workspace button[data-image-control="true"] {
          position: absolute !important;
          isolation: auto;
          clip-path: none !important;
        }

        .local-products-workspace button[data-image-control="true"]::before,
        .local-products-workspace button[data-image-control="true"]::after {
          display: none !important;
        }

        .local-products-workspace button:not(:disabled):active {
          transform: scale(0.975);
        }

        .local-products-workspace button:focus-visible,
        .local-products-workspace input:focus-visible,
        .local-products-workspace textarea:focus-visible,
        .local-products-workspace select:focus-visible,
        .local-products-workspace [role="button"]:focus-visible {
          outline: 1px solid rgba(241, 229, 194, 0.88);
          outline-offset: 2px;
        }

        .local-products-workspace button:disabled {
          cursor: not-allowed;
          filter: saturate(0.35);
        }

        .local-products-workspace button[class~="bg-cyan-300"],
        .local-products-workspace button[class~="bg-sky-300"],
        .local-products-workspace button[class~="bg-amber-300"],
        .local-products-workspace button[class~="bg-violet-200"] {
          border: 1px solid rgba(241, 229, 194, 0.76) !important;
          background: linear-gradient(135deg, #f2e8cd 0%, #c6b079 54%, #e8dab3 100%) !important;
          color: #17130a !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.58), 0 10px 26px rgba(190, 164, 99, 0.14);
        }

        .local-products-workspace button[class~="bg-cyan-300"]:hover,
        .local-products-workspace button[class~="bg-sky-300"]:hover,
        .local-products-workspace button[class~="bg-amber-300"]:hover,
        .local-products-workspace button[class~="bg-violet-200"]:hover {
          border-color: #fff2cf !important;
          filter: brightness(1.055);
        }

        .local-products-workspace button > span {
          min-width: 0;
          white-space: nowrap;
        }

        .local-products-workspace button[data-description-line="true"] {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
          flex-wrap: wrap;
        }

        .local-products-workspace button[data-description-line="true"] > span {
          min-width: 0;
          max-width: 100%;
          white-space: inherit;
          overflow-wrap: inherit;
          word-break: inherit;
        }

        .local-products-workspace input:not([type="radio"]):not([type="checkbox"]):not([type="file"]),
        .local-products-workspace textarea,
        .local-products-workspace select {
          border-radius: 2px !important;
          border-color: rgba(216, 201, 159, 0.24) !important;
          background: linear-gradient(145deg, rgba(13, 17, 23, 0.97), rgba(22, 28, 37, 0.94)) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045), 0 8px 24px rgba(0, 0, 0, 0.14);
          transition: border-color 240ms ease, box-shadow 240ms ease, background-color 240ms ease;
        }

        .local-products-workspace input:not([type="radio"]):not([type="checkbox"]):not([type="file"]):focus,
        .local-products-workspace textarea:focus,
        .local-products-workspace select:focus {
          border-color: rgba(241, 229, 194, 0.62) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 0 3px rgba(216, 201, 159, 0.075), 0 14px 34px rgba(0, 0, 0, 0.2);
        }

        .local-products-workspace [class*="rounded-md"][class*="border"][class*="bg-slate-950"],
        .local-products-workspace [class*="rounded-xl"][class*="border"][class*="bg-slate-950"] {
          border-color: rgba(216, 201, 159, 0.23);
          background: linear-gradient(145deg, rgba(14, 18, 25, 0.99), rgba(21, 27, 36, 0.98));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045), 0 18px 42px rgba(0, 0, 0, 0.2);
        }

        .local-products-workspace [class*="rounded-md"][class*="border"][class*="bg-slate-900"],
        .local-products-workspace [class*="rounded-md"][class*="border"][class*="bg-slate-800"] {
          border-color: rgba(216, 201, 159, 0.22);
          background: linear-gradient(145deg, rgba(25, 31, 41, 0.96), rgba(15, 20, 27, 0.98));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.045);
        }

        .luxury-header {
          clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%, 0 12px);
          border-color: rgba(216, 201, 159, 0.14) !important;
          background: linear-gradient(180deg, rgba(11, 13, 18, 0.975), rgba(7, 9, 13, 0.96)) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025), 0 18px 52px rgba(0, 0, 0, 0.36) !important;
        }

        .luxury-header::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -35%;
          width: 16%;
          pointer-events: none;
          background: linear-gradient(105deg, transparent, rgba(241, 229, 194, 0.04), transparent);
          animation: luxuryVectorSweep 7.8s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }

        .luxury-content-panel {
          position: relative;
          border-color: rgba(216, 201, 159, 0.2) !important;
          background: linear-gradient(180deg, rgba(16, 21, 29, 0.92), rgba(8, 12, 17, 0.82)) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.022), inset 0 -1px 0 rgba(0, 0, 0, 0.3), 0 28px 76px rgba(0, 0, 0, 0.27);
        }

        .luxury-search {
          clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
          border-color: rgba(216, 201, 159, 0.28) !important;
          background: linear-gradient(135deg, rgba(14, 18, 24, 0.98), rgba(24, 30, 39, 0.94)) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.24), 0 14px 36px rgba(0, 0, 0, 0.2);
        }

        .luxury-product-card {
          position: relative;
          clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
          border-color: rgba(226, 214, 180, 0.3) !important;
          background: linear-gradient(155deg, rgba(34, 42, 54, 0.99), rgba(16, 22, 30, 0.995)) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.075), inset 0 -2px 0 rgba(0, 0, 0, 0.32), 0 3px 0 rgba(255, 255, 255, 0.015), 0 18px 42px rgba(0, 0, 0, 0.34), 0 8px 18px rgba(0, 0, 0, 0.24);
        }

        .luxury-product-card::before {
          content: "";
          position: absolute;
          z-index: 6;
          top: 0;
          right: 14px;
          left: 14px;
          height: 1px;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(247, 237, 207, 0.62), transparent);
        }

        .luxury-product-card::after {
          content: "";
          position: absolute;
          z-index: 5;
          top: -40%;
          bottom: -40%;
          left: -42%;
          width: 9%;
          pointer-events: none;
          opacity: 0;
          transform: skewX(-17deg);
          background: linear-gradient(90deg, transparent, rgba(241, 229, 194, 0.1), transparent);
          animation: luxuryCardGlint 8.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }

        .local-products-workspace .luxury-product-card[data-active="true"] {
          border-color: rgba(247, 237, 207, 0.72) !important;
          background: linear-gradient(155deg, rgba(47, 47, 42, 0.99), rgba(22, 27, 33, 0.997)) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.095), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(216, 201, 159, 0.14), 0 26px 58px rgba(0, 0, 0, 0.4), 0 9px 20px rgba(0, 0, 0, 0.25);
        }

        .luxury-product-card:hover {
          border-color: rgba(235, 224, 192, 0.48) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.09), inset 0 -2px 0 rgba(0, 0, 0, 0.32), 0 28px 62px rgba(0, 0, 0, 0.4), 0 10px 22px rgba(0, 0, 0, 0.24);
        }

        .luxury-product-image {
          background:
            radial-gradient(circle at 50% 36%, rgba(216, 201, 159, 0.09), transparent 44%),
            linear-gradient(145deg, #1a212b, #0d1219) !important;
        }

        .luxury-category-bar {
          border-color: rgba(216, 201, 159, 0.18) !important;
          background: rgba(5, 7, 10, 0.94) !important;
          box-shadow: 0 -14px 38px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(18px);
        }

        .luxury-modal-overlay {
          background: rgba(3, 5, 8, 0.78) !important;
          backdrop-filter: blur(14px) saturate(0.8);
        }

        .luxury-modal,
        .luxury-dialog,
        .luxury-modal-overlay > div,
        .luxury-modal-overlay > form {
          animation: luxuryModalIn 440ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .luxury-modal,
        .luxury-dialog {
          clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
          border-color: rgba(216, 201, 159, 0.24) !important;
          background: linear-gradient(145deg, rgba(8, 10, 15, 0.995), rgba(14, 17, 23, 0.99)) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035), 0 34px 90px rgba(0, 0, 0, 0.56);
        }

        .luxury-modal-titlebar {
          position: relative;
          border-color: rgba(216, 201, 159, 0.14) !important;
          background: linear-gradient(90deg, rgba(216, 201, 159, 0.08), rgba(14, 17, 23, 0.96) 38%, rgba(7, 9, 13, 0.98)) !important;
        }

        .luxury-modal-titlebar::after {
          content: "";
          position: absolute;
          right: 2rem;
          bottom: -1px;
          left: 2rem;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(216, 201, 159, 0.48), transparent);
        }

        .local-products-workspace .Toastify__toast {
          border: 1px solid rgba(216, 201, 159, 0.22);
          border-radius: 2px;
          background: linear-gradient(145deg, rgba(13, 16, 22, 0.98), rgba(6, 8, 12, 0.99));
          color: #eef0f4;
          box-shadow: 0 20px 52px rgba(0, 0, 0, 0.42);
          clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
        }

        .local-products-workspace .Toastify__progress-bar {
          background: linear-gradient(90deg, #9f8b55, #f1e5c2, #b8a16a);
        }

        @keyframes luxuryVectorSweep {
          0%, 68% { transform: translateX(0); opacity: 0; }
          76% { opacity: 1; }
          100% { transform: translateX(620%); opacity: 0; }
        }

        @keyframes luxuryMetalGlint {
          0%, 48% { left: -34%; opacity: 0; }
          54% { opacity: 0.56; }
          72% { left: 122%; opacity: 0; }
          100% { left: 122%; opacity: 0; }
        }

        @keyframes luxuryCardGlint {
          0%, 42% { left: -42%; opacity: 0; }
          49% { opacity: 0.5; }
          69% { left: 126%; opacity: 0; }
          100% { left: 126%; opacity: 0; }
        }

        @keyframes luxuryModalIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.985); filter: blur(5px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes productWaveIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.975); filter: blur(4px); }
          52% { opacity: 1; transform: translateY(-3px) scale(1); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        .product-wave-card {
          animation: productWaveIn 680ms cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: transform, opacity;
        }

        /* Tactical inventory HUD theme. */
        .local-products-workspace {
          --hud-ink: #050a11;
          --hud-panel: #0a1420;
          --hud-surface: #101f2e;
          --hud-cyan: #8ba9b2;
          --hud-gold: #e6cf8b;
          --hud-violet: #a99bf2;
          --hud-green: #69d5a3;
          color: #e6edf3;
          background:
            linear-gradient(rgba(230, 207, 139, 0.024) 1px, transparent 1px),
            linear-gradient(90deg, rgba(230, 207, 139, 0.024) 1px, transparent 1px),
            linear-gradient(rgba(139, 169, 178, 0.011) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 169, 178, 0.011) 1px, transparent 1px),
            radial-gradient(circle at 14% -6%, rgba(230, 207, 139, 0.14), transparent 29%),
            radial-gradient(circle at 92% 16%, rgba(169, 155, 242, 0.075), transparent 25%),
            linear-gradient(145deg, #050a11 0%, #08111b 52%, #04080e 100%) !important;
          background-attachment: fixed;
          background-size: 48px 48px, 48px 48px, 12px 12px, 12px 12px, auto, auto, auto;
        }

        .local-products-workspace ::selection {
          background: rgba(230, 207, 139, 0.88);
          color: #17130a;
        }

        .local-products-workspace * {
          scrollbar-color: rgba(230, 207, 139, 0.56) rgba(255, 255, 255, 0.025);
        }

        .local-products-workspace *::-webkit-scrollbar-thumb {
          border-color: rgba(5, 10, 17, 0.88);
          background: linear-gradient(180deg, rgba(230, 207, 139, 0.86), rgba(142, 116, 57, 0.72));
        }

        .local-products-workspace button[data-luxury-accent] {
          text-shadow: 0 0 12px currentColor;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 7px 18px rgba(0, 0, 0, 0.28) !important;
        }

        .local-products-workspace button[data-luxury-accent]::before {
          height: 2px;
          opacity: 0.78;
          background: linear-gradient(90deg, transparent, currentColor, transparent);
        }

        .local-products-workspace button[data-luxury-accent]:hover {
          border-color: rgba(245, 233, 199, 0.76) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), inset 0 -2px 0 rgba(0, 0, 0, 0.28), 0 10px 24px rgba(0, 0, 0, 0.34), 0 0 17px rgba(230, 207, 139, 0.14) !important;
        }

        .local-products-workspace button[class~="bg-cyan-300"],
        .local-products-workspace button[class~="bg-sky-300"],
        .local-products-workspace button[class~="bg-amber-300"],
        .local-products-workspace button[class~="bg-violet-200"] {
          border-color: rgba(245, 233, 199, 0.82) !important;
          background: linear-gradient(135deg, #f5e9c7 0%, #d6ba6b 58%, #b99a4e 100%) !important;
          color: #17130a !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72), inset 0 -2px 0 rgba(95, 68, 16, 0.32), 0 8px 22px rgba(154, 119, 42, 0.22) !important;
        }

        .local-products-workspace input:not([type="radio"]):not([type="checkbox"]):not([type="file"]),
        .local-products-workspace textarea,
        .local-products-workspace select {
          border-color: rgba(230, 207, 139, 0.27) !important;
          background:
            linear-gradient(90deg, rgba(230, 207, 139, 0.035) 1px, transparent 1px),
            linear-gradient(145deg, rgba(10, 20, 31, 0.99), rgba(15, 29, 43, 0.97)) !important;
          background-size: 18px 18px, auto;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055), inset 3px 0 0 rgba(230, 207, 139, 0.2), 0 8px 24px rgba(0, 0, 0, 0.18);
        }

        .local-products-workspace input:not([type="radio"]):not([type="checkbox"]):not([type="file"]):focus,
        .local-products-workspace textarea:focus,
        .local-products-workspace select:focus {
          border-color: rgba(230, 207, 139, 0.72) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), inset 3px 0 0 rgba(230, 207, 139, 0.48), 0 0 0 2px rgba(230, 207, 139, 0.09), 0 14px 34px rgba(0, 0, 0, 0.24);
        }

        .local-products-workspace [class*="rounded-md"][class*="border"][class*="bg-slate-950"],
        .local-products-workspace [class*="rounded-xl"][class*="border"][class*="bg-slate-950"],
        .local-products-workspace [class*="rounded-md"][class*="border"][class*="bg-slate-900"],
        .local-products-workspace [class*="rounded-md"][class*="border"][class*="bg-slate-800"] {
          border-color: rgba(230, 207, 139, 0.19);
          background: linear-gradient(145deg, rgba(14, 27, 41, 0.99), rgba(7, 15, 24, 0.995));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 16px 38px rgba(0, 0, 0, 0.25);
        }

        .luxury-header {
          clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 12px);
          border-color: rgba(230, 207, 139, 0.27) !important;
          background:
            linear-gradient(rgba(230, 207, 139, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(230, 207, 139, 0.025) 1px, transparent 1px),
            linear-gradient(180deg, rgba(12, 25, 38, 0.985), rgba(5, 11, 18, 0.98)) !important;
          background-size: 28px 28px, 28px 28px, auto;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055), inset 0 -2px 0 rgba(230, 207, 139, 0.12), 0 18px 52px rgba(0, 0, 0, 0.42) !important;
        }

        .luxury-header::after {
          background: linear-gradient(105deg, transparent, rgba(230, 207, 139, 0.1), rgba(245, 233, 199, 0.05), transparent);
          animation-duration: 10.5s;
        }

        .luxury-content-panel {
          border-color: rgba(230, 207, 139, 0.2) !important;
          background: linear-gradient(180deg, rgba(10, 21, 33, 0.94), rgba(5, 11, 18, 0.88)) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035), inset 0 -1px 0 rgba(0, 0, 0, 0.36), 0 28px 76px rgba(0, 0, 0, 0.32);
        }

        .luxury-search {
          border-color: rgba(230, 207, 139, 0.34) !important;
          background: linear-gradient(135deg, rgba(9, 19, 30, 0.99), rgba(18, 34, 49, 0.96)) !important;
          box-shadow: inset 3px 0 0 rgba(230, 207, 139, 0.46), inset 0 1px 0 rgba(255, 255, 255, 0.055), 0 13px 34px rgba(0, 0, 0, 0.24);
        }

        .luxury-product-card {
          clip-path: polygon(12px 0, calc(100% - 5px) 0, 100% 5px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 5px 100%, 0 calc(100% - 5px), 0 12px);
          border-color: rgba(230, 207, 139, 0.31) !important;
          background:
            linear-gradient(135deg, rgba(230, 207, 139, 0.065), transparent 28%),
            linear-gradient(155deg, rgba(22, 39, 55, 0.995), rgba(8, 17, 27, 0.998)) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.09), inset 3px 0 0 rgba(230, 207, 139, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.38), 0 19px 44px rgba(0, 0, 0, 0.38), 0 8px 18px rgba(0, 0, 0, 0.25);
        }

        .luxury-product-card::before {
          right: 10px;
          left: 10px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(230, 207, 139, 0.88), rgba(245, 233, 199, 0.62), transparent);
        }

        .luxury-product-card::after {
          background: linear-gradient(90deg, transparent, rgba(230, 207, 139, 0.13), transparent);
          animation-duration: 11.5s;
        }

        .local-products-workspace .luxury-product-card[data-active="true"] {
          border-color: rgba(245, 233, 199, 0.84) !important;
          background:
            linear-gradient(135deg, rgba(230, 207, 139, 0.12), transparent 34%),
            linear-gradient(155deg, rgba(49, 43, 28, 0.995), rgba(12, 21, 29, 0.998)) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.13), inset 3px 0 0 rgba(230, 207, 139, 0.38), inset 0 -2px 0 rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(230, 207, 139, 0.17), 0 0 22px rgba(230, 207, 139, 0.13), 0 27px 60px rgba(0, 0, 0, 0.43);
        }

        .luxury-product-card:hover {
          border-color: rgba(245, 233, 199, 0.64) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 3px 0 0 rgba(230, 207, 139, 0.22), inset 0 -2px 0 rgba(0, 0, 0, 0.34), 0 0 18px rgba(230, 207, 139, 0.1), 0 29px 64px rgba(0, 0, 0, 0.42);
        }

        .luxury-product-image {
          background:
            linear-gradient(rgba(230, 207, 139, 0.026) 1px, transparent 1px),
            linear-gradient(90deg, rgba(230, 207, 139, 0.026) 1px, transparent 1px),
            radial-gradient(circle at 50% 38%, rgba(230, 207, 139, 0.11), transparent 47%),
            linear-gradient(145deg, #101e2b, #060d16) !important;
          background-size: 24px 24px, 24px 24px, auto, auto;
        }

        #mobile-category-menu button[data-category-bubble="true"] {
          border-color: rgba(230, 207, 139, 0.37) !important;
          background: linear-gradient(145deg, rgba(16, 34, 49, 0.98), rgba(6, 14, 23, 0.995)) !important;
          color: #f1e5c2 !important;
          box-shadow: inset 3px 0 0 rgba(230, 207, 139, 0.28), 0 16px 42px rgba(0, 0, 0, 0.48) !important;
        }

        #mobile-category-menu button[data-category-bubble="true"][data-active="true"] {
          border-color: rgba(245, 233, 199, 0.86) !important;
          background: linear-gradient(135deg, #f5e9c7, #d6ba6b) !important;
          color: #17130a !important;
          box-shadow: inset 3px 0 0 rgba(255, 248, 224, 0.58), 0 0 18px rgba(230, 207, 139, 0.22), 0 16px 42px rgba(0, 0, 0, 0.44) !important;
        }

        .local-products-workspace button[aria-controls="mobile-category-menu"] {
          border-color: rgba(230, 207, 139, 0.5) !important;
          background: linear-gradient(145deg, rgba(18, 39, 56, 0.99), rgba(7, 16, 26, 0.995)) !important;
          color: #f1e5c2 !important;
          box-shadow: inset 3px 0 0 rgba(230, 207, 139, 0.5), 0 14px 38px rgba(0, 0, 0, 0.48) !important;
        }

        .local-products-workspace button[aria-controls="mobile-category-menu"][aria-expanded="true"] {
          background: linear-gradient(135deg, #f5e9c7, #d6ba6b) !important;
          color: #17130a !important;
        }

        .luxury-category-bar {
          overflow-y: hidden !important;
          overscroll-behavior-x: contain;
          overscroll-behavior-y: none;
          scrollbar-width: none;
          touch-action: pan-x;
          white-space: nowrap;
          border-color: rgba(230, 207, 139, 0.34) !important;
          background: rgba(4, 10, 17, 0.97) !important;
          box-shadow: inset 0 2px 0 rgba(230, 207, 139, 0.1), 0 -14px 38px rgba(0, 0, 0, 0.42);
        }

        .luxury-category-bar::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .luxury-category-bar button {
          flex: 0 0 auto;
          min-width: max-content;
          white-space: nowrap;
          border-color: rgba(230, 207, 139, 0.16) !important;
          background: rgba(10, 23, 35, 0.88) !important;
          color: #c6d7df !important;
        }

        .luxury-category-bar button[aria-pressed="true"] {
          background: linear-gradient(135deg, #f5e9c7, #d6ba6b) !important;
          color: #17130a !important;
          box-shadow: inset 0 -3px 0 rgba(255, 248, 224, 0.62) !important;
        }

        .luxury-modal-overlay {
          background: rgba(2, 6, 11, 0.84) !important;
          backdrop-filter: blur(15px) saturate(0.88);
        }

        .luxury-modal,
        .luxury-dialog {
          border-color: rgba(230, 207, 139, 0.32) !important;
          background:
            linear-gradient(rgba(230, 207, 139, 0.019) 1px, transparent 1px),
            linear-gradient(90deg, rgba(230, 207, 139, 0.019) 1px, transparent 1px),
            linear-gradient(145deg, rgba(12, 25, 38, 0.998), rgba(4, 10, 17, 0.998)) !important;
          background-size: 32px 32px, 32px 32px, auto;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055), inset 3px 0 0 rgba(230, 207, 139, 0.14), 0 34px 90px rgba(0, 0, 0, 0.62);
        }

        .luxury-modal-titlebar {
          border-color: rgba(230, 207, 139, 0.24) !important;
          background: linear-gradient(90deg, rgba(230, 207, 139, 0.13), rgba(10, 22, 34, 0.98) 42%, rgba(4, 10, 17, 0.995)) !important;
        }

        .luxury-modal-titlebar::after {
          background: linear-gradient(90deg, transparent, rgba(230, 207, 139, 0.74), rgba(245, 233, 199, 0.46), transparent);
        }

        .product-editor,
        .product-editor section,
        .product-editor label,
        .product-editor div {
          min-width: 0;
        }

        .product-editor input,
        .product-editor textarea {
          width: 100%;
          max-width: 100%;
        }

        .product-editor [data-editor-toolbar="true"] {
          flex-wrap: wrap;
        }

        .local-products-workspace .Toastify__toast {
          border-color: rgba(230, 207, 139, 0.37);
          background: linear-gradient(145deg, rgba(13, 28, 41, 0.99), rgba(4, 10, 17, 0.998));
          color: #f5edda;
          box-shadow: inset 3px 0 0 rgba(230, 207, 139, 0.44), 0 20px 52px rgba(0, 0, 0, 0.46);
        }

        .local-products-workspace .Toastify__progress-bar {
          background: linear-gradient(90deg, #8f763d, #e6cf8b, #f5e9c7);
        }

        @media (prefers-reduced-motion: reduce) {
          .local-products-workspace *,
          .local-products-workspace *::before,
          .local-products-workspace *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      <section className="flex w-full flex-col xl:min-h-[calc(100dvh-4rem)]">
        <header className="luxury-header sticky top-0 z-30 overflow-hidden border border-white/[0.08] bg-[#090b10]/95 shadow-[0_16px_46px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d8c99f]/[0.55] to-transparent"
          />

          <div className="relative grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="grid min-w-0 grid-cols-4 divide-x divide-[#d8c99f]/10 overflow-hidden border border-[#d8c99f]/[0.15] bg-[linear-gradient(135deg,rgba(216,201,159,0.055),rgba(255,255,255,0.012))] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] xl:w-fit">
              <span className="flex min-w-0 items-center justify-center gap-1 whitespace-nowrap px-2 py-1.5 text-[9px] font-medium text-slate-500">
                <span className="font-bold tabular-nums text-[#d8c99f]">
                  {activeProductCount}
                </span>
                đang bán
              </span>
              <span className="flex min-w-0 items-center justify-center gap-1 whitespace-nowrap px-2 py-1.5 text-[9px] font-medium text-slate-500">
                <span className="font-bold tabular-nums text-[#d8c99f]">
                  {soldProductCount}
                </span>
                đã bán
              </span>
              <span className="flex min-w-0 items-center justify-center gap-1 whitespace-nowrap px-2 py-1.5 text-[9px] font-medium text-slate-500">
                <span className="font-bold tabular-nums text-[#d8c99f]">
                  {totalImages}
                </span>
                ảnh
              </span>
              <span className="flex min-w-0 items-center justify-center gap-1 whitespace-nowrap px-2 py-1.5 text-[9px] font-medium text-slate-500">
                <span className="font-bold tabular-nums text-[#d8c99f]">
                  {postedTodayCount}/{totalTodayTaskCount}
                </span>
                đã đăng
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 border border-[#d8c99f]/10 bg-black/25 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] xl:min-w-[1040px] xl:grid-cols-11">
              <button
                type="button"
                data-luxury-accent="gold"
                title="Thêm sản phẩm"
                aria-label="Thêm sản phẩm"
                className={`${headerActionButtonBaseClassName} ${headerPrimaryButtonClassName}`}
                onClick={openProductModalForCreate}
              >
                <FiPlus aria-hidden="true" className={iconClassName} />
                Thêm
              </button>

              <button
                type="button"
                data-luxury-accent="sapphire"
                title="Import Export dữ liệu"
                aria-label="Import Export dữ liệu"
                className={`${headerActionButtonBaseClassName} ${headerNeutralButtonClassName}`}
                onClick={() => openModal("importExport")}
              >
                <FiArchive aria-hidden="true" className={iconClassName} />
                Data
              </button>

              <button
                type="button"
                data-luxury-accent="emerald"
                title={settings.includeSocialTags ? "Tắt Tag khi copy" : "Bật Tag khi copy"}
                aria-label={settings.includeSocialTags ? "Tắt Tag khi copy" : "Bật Tag khi copy"}
                aria-pressed={settings.includeSocialTags}
                className={`${headerActionButtonBaseClassName} min-w-0 ${settings.includeSocialTags
                  ? headerActiveButtonClassName
                  : headerNeutralButtonClassName
                  }`}
                onClick={() =>
                  updateSettingField(
                    "includeSocialTags",
                    !settings.includeSocialTags,
                  )
                }
              >
                <span
                  aria-hidden="true"
                  className={`relative h-3 w-[18px] flex-none overflow-hidden border transition-colors duration-200 ${settings.includeSocialTags
                    ? "border-[#17130a]/45 bg-[#17130a]/20"
                    : "border-white/20 bg-black/30"
                    }`}
                >
                  <span
                    className={`absolute top-[2px] h-1.5 w-1.5 transition-[left,background-color] duration-200 ${settings.includeSocialTags
                      ? "left-[10px] bg-[#17130a]"
                      : "left-[2px] bg-slate-400"
                      }`}
                  />
                </span>
                <span className="min-w-0 truncate">
                  {settings.includeSocialTags ? "Bật Tag" : "Tắt Tag"}
                </span>
              </button>

              <button
                type="button"
                data-luxury-accent="violet"
                title="Bảng sản phẩm"
                aria-label="Bảng sản phẩm"
                className={`${headerActionButtonBaseClassName} ${headerNeutralButtonClassName}`}
                onClick={() => openModal("productList")}
              >
                <FiDatabase aria-hidden="true" className={iconClassName} />
                List
              </button>

              <button
                type="button"
                data-luxury-accent="amber"
                title="Lịch đăng"
                aria-label="Lịch đăng"
                className={`${headerActionButtonBaseClassName} ${headerNeutralButtonClassName}`}
                onClick={() => openModal("schedule")}
              >
                <FiCalendar aria-hidden="true" className={iconClassName} />
                Lịch
              </button>

              <button
                type="button"
                data-luxury-accent="rose"
                title="Ghi chú"
                aria-label="Ghi chú"
                className={`${headerActionButtonBaseClassName} ${headerNeutralButtonClassName}`}
                onClick={() => openModal("globalNote")}
              >
                <FiClipboard aria-hidden="true" className={iconClassName} />
                Ghi chú
              </button>

              <button
                type="button"
                data-luxury-accent="indigo"
                title="Mô tả chung"
                aria-label="Mô tả chung"
                className={`${headerActionButtonBaseClassName} ${headerNeutralButtonClassName}`}
                onClick={() => openModal("globalDescription")}
              >
                <FiFileText aria-hidden="true" className={iconClassName} />
                Mô tả
              </button>

              <button
                type="button"
                data-luxury-accent="cyan"
                title="Tải ảnh"
                aria-label="Tải ảnh"
                className={`${headerActionButtonBaseClassName} ${headerNeutralButtonClassName}`}
                onClick={() => openModal("imageDownload")}
              >
                <FiDownload aria-hidden="true" className={iconClassName} />
                Ảnh
              </button>

              <button
                type="button"
                data-luxury-accent="amethyst"
                title={
                  pictureInPictureWindow
                    ? "Đóng cửa sổ nổi và trở lại tab"
                    : "Mở Local Product Manager dạng cửa sổ nổi"
                }
                aria-label={
                  pictureInPictureWindow
                    ? "Đóng cửa sổ nổi và trở lại tab"
                    : "Mở Local Product Manager dạng cửa sổ nổi"
                }
                className={`${headerActionButtonBaseClassName} ${headerNeutralButtonClassName}`}
                onClick={() => {
                  if (pictureInPictureWindow) {
                    handleClosePictureInPicture();
                    return;
                  }

                  void handleOpenPictureInPicture();
                }}
              >
                <FiMonitor aria-hidden="true" className={iconClassName} />
                {pictureInPictureWindow ? "Về tab" : "Nổi"}
              </button>

              <button
                type="button"
                data-luxury-accent="teal"
                title="Liên hệ khi copy Post hoặc Cmt"
                aria-label="Liên hệ khi copy Post hoặc Cmt"
                className={`${headerActionButtonBaseClassName} ${headerNeutralButtonClassName}`}
                onClick={() => openModal("contact")}
              >
                <FiPhone aria-hidden="true" className={iconClassName} />
                Liên hệ
              </button>

              <button
                type="button"
                data-luxury-accent="blue"
                title="Đồng bộ dữ liệu từ Vercel Blob về local"
                aria-label="Đồng bộ dữ liệu từ Vercel Blob về local"
                className={`${headerActionButtonBaseClassName} ${headerNeutralButtonClassName}`}
                onClick={() => void handleRestoreLatestBackupFromBlob()}
              >
                <FiRefreshCcw aria-hidden="true" className={iconClassName} />
                Đồng bộ
              </button>
            </div>
          </div>
        </header>

        <section className="luxury-content-panel border p-3">
          <div className="mb-3">
            <label className="luxury-search flex items-center gap-2 border px-3 py-2 text-slate-400 transition focus-within:text-[#eadfbe]">
              <FiSearch
                aria-hidden="true"
                className={`${iconClassName} shrink-0`}
              />
              <input
                ref={searchInputRef}
                // autoFocus
                type="text"
                value={query}
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder:text-slate-500"
                placeholder="Tìm tất cả sản phẩm"
              />
            </label>
          </div>

          <AnimatePresence initial={false}>
            {isMobileCategoryMenuOpen ? (
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.1 : 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="fixed inset-0 z-[999] touch-none bg-black/60 backdrop-blur-[2px] md:hidden"
                onClick={() => setIsMobileCategoryMenuOpen(false)}
              />
            ) : null}
          </AnimatePresence>

          <div className="fixed bottom-3 right-2 z-[1000] md:hidden">
            <AnimatePresence initial={false}>
              {isMobileCategoryMenuOpen ? (
                <motion.div
                  id="mobile-category-menu"
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: 24, scale: 0.98 }
                  }
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: 20, scale: 0.98 }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0.12 : 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute bottom-[calc(100%+0.65rem)] right-0 flex max-h-[68dvh] w-[min(84vw,320px)] touch-pan-y flex-col items-end gap-2 overflow-x-hidden overflow-y-auto overscroll-x-none overscroll-y-contain py-2 pl-8 pr-1 [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_95%,transparent)]"
                >
                  {orderedCategoryTabs.map((category, index) => {
                    const isActive =
                      normalizeTextKey(activeCategoryTab) ===
                      normalizeTextKey(category);

                    return (
                      <motion.button
                        key={category}
                        type="button"
                        data-category-bubble="true"
                        data-active={isActive}
                        initial={
                          prefersReducedMotion
                            ? { opacity: 0 }
                            : {
                              opacity: 0,
                              x: 48,
                              y: index % 2 === 0 ? 11 : -5,
                              scale: 0.92,
                            }
                        }
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        exit={
                          prefersReducedMotion
                            ? { opacity: 0 }
                            : { opacity: 0, x: 28, scale: 0.94 }
                        }
                        transition={
                          prefersReducedMotion
                            ? { duration: 0.1 }
                            : {
                              delay: index * 0.045,
                              type: "spring",
                              stiffness: 270,
                              damping: 24,
                              mass: 0.78,
                            }
                        }
                        whileTap={
                          prefersReducedMotion ? undefined : { scale: 0.96, x: -3 }
                        }
                        className={`relative flex w-fit max-w-[calc(50vw-8px)] items-center justify-end rounded-[18px] border px-4 py-2.5 text-right text-xs font-black uppercase tracking-[0.055em] backdrop-blur-xl ${isActive
                          ? "border-[#f1e5c2]/75 bg-[linear-gradient(135deg,#f2e8cd,#bda66d)] text-[#17130a] shadow-[0_16px_42px_rgba(190,164,99,0.24)]"
                          : "border-[#d8c99f]/[0.18] bg-[linear-gradient(145deg,rgba(15,18,25,0.96),rgba(6,8,12,0.98))] text-slate-200 shadow-[0_16px_42px_rgba(0,0,0,0.48)]"
                          }`}
                        onClick={() => {
                          setActiveCategoryTab(category);
                          setIsMobileCategoryMenuOpen(false);
                        }}
                      >
                        <span className="block max-w-[calc(50vw-40px)] overflow-hidden text-ellipsis whitespace-nowrap">
                          {category === "all" ? "Tất cả" : category}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`absolute -bottom-1 right-4 h-2.5 w-2.5 rotate-45 border-b border-r ${isActive
                            ? "border-[#f1e5c2]/70 bg-[#cdbb88]"
                            : "border-[#d8c99f]/[0.18] bg-[#090c11]"
                            }`}
                        />
                      </motion.button>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.button
              type="button"
              aria-controls="mobile-category-menu"
              aria-expanded={isMobileCategoryMenuOpen}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              className={`flex min-h-11 min-w-24 items-center justify-center border px-4 text-xs font-black tracking-[0.08em] backdrop-blur-xl transition ${isMobileCategoryMenuOpen
                ? "border-[#f1e5c2]/80 bg-[linear-gradient(135deg,#f2e8cd,#bda66d)] text-[#17130a] shadow-[0_14px_38px_rgba(190,164,99,0.26)]"
                : "border-[#d8c99f]/25 bg-[linear-gradient(145deg,rgba(15,18,25,0.96),rgba(5,7,10,0.98))] text-[#eadfbe] shadow-[0_14px_38px_rgba(0,0,0,0.52)]"
                }`}
              onClick={() =>
                setIsMobileCategoryMenuOpen((current) => !current)
              }
            >
              {isMobileCategoryMenuOpen ? "Đóng" : "Danh mục"}
            </motion.button>
          </div>

          <div
            ref={categoryTabsRef}
            className="luxury-category-bar fixed bottom-0 left-0 right-0 z-bar hidden h-[36px] items-stretch overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-none whitespace-nowrap border-t md:flex"
          >
            <button
              type="button"
              data-category-tab="all"
              aria-pressed={activeCategoryTab === "all"}
              className={`flex h-[35px] shrink-0 items-center justify-center border-r border-[#d8c99f]/10 px-5 text-xs font-black uppercase tracking-[0.08em] transition ${activeCategoryTab === "all"
                ? "bg-[linear-gradient(135deg,#f2e8cd,#bda66d)] text-[#17130a]"
                : "bg-black/20 text-slate-300 hover:bg-[#d8c99f]/10 hover:text-[#eadfbe]"
                }`}
              onClick={() => setActiveCategoryTab("all")}
            >
              Tất cả
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                data-category-tab={normalizeTextKey(category)}
                aria-pressed={
                  normalizeTextKey(activeCategoryTab) ===
                  normalizeTextKey(category)
                }
                className={`flex h-[35px] shrink-0 items-center justify-center border-r border-[#d8c99f]/10 px-5 text-xs font-black uppercase tracking-[0.08em] transition ${normalizeTextKey(activeCategoryTab) ===
                  normalizeTextKey(category)
                  ? "bg-[linear-gradient(135deg,#f2e8cd,#bda66d)] text-[#17130a]"
                  : "bg-black/20 text-slate-200 hover:bg-[#d8c99f]/10 hover:text-[#eadfbe]"
                  }`}
                onClick={() => setActiveCategoryTab(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div
            onTouchStart={handleProductsTouchStart}
            onTouchEnd={handleProductsTouchEnd}
          >
            {filteredProducts.length === 0 ? (
              <div className="luxury-dialog border p-5 text-center text-xs font-semibold tracking-wide text-slate-400">
                Chưa có sản phẩm phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 xl:gap-4 2xl:[grid-template-columns:repeat(auto-fill,minmax(218px,1fr))]">
                {filteredProducts.map((product, index) => {
                  const descriptionPreview =
                    product.description.trim() ||
                    settings.commonDescription.trim();
                  const active = selectedProductId === product.id;
                  const expanded = expandedProductIds.has(product.id);
                  const productDone = product.isDone;
                  const pinText = product.pin.trim();
                  const statusText = product.status.trim();

                  return (
                    <article
                      key={`${activeCategoryTab}-${product.id}`}
                      data-active={active}
                      data-done={productDone}
                      style={{ animationDelay: `${Math.min(index * 34, 340)}ms` }}
                      className={`luxury-product-card product-wave-card group min-w-0 overflow-hidden border transition duration-300 hover:-translate-y-1 ${productDone ? "opacity-65" : ""
                        } ${active
                          ? "border-[#e8d9ae]/70 bg-[#15140f]"
                          : "border-[#d8c99f]/[0.15] bg-[#0b0e14]"
                        }`}
                      onClick={() => {
                        setSelectedProductId(product.id);
                        handleEdit(product);
                      }}
                    >
                      <button
                        type="button"
                        data-image-surface="true"
                        className={`luxury-product-image relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden ${productDone
                          ? "after:absolute after:inset-0 after:bg-slate-950/30"
                          : ""
                          }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          openImageAlbum({
                            title: product.name,
                            description: descriptionPreview,
                            priceText: product.priceText,
                            images: product.images,
                            internalImages: product.internalImages,
                          });
                        }}
                      >
                        {product.images[0] ? (
                          <img
                            src={product.images[0].dataUrl}
                            alt={product.name}
                            width={1200}
                            height={1200}
                            className={`h-full w-full object-contain transition glass duration-500 group-hover:scale-105 ${productDone ? "blur-[2px] grayscale opacity-40" : ""
                              }`}
                          />
                        ) : (
                          <FiImage
                            aria-hidden="true"
                            className={`${iconClassName} text-slate-600`}
                          />
                        )}

                        <div className="absolute left-2 top-2 z-10 flex items-center gap-1 border border-[#d8c99f]/20 bg-black/70 px-2 py-0.5 text-[10px] font-black text-[#eadfbe] backdrop-blur-md [clip-path:polygon(5px_0,100%_0,100%_calc(100%_-_5px),calc(100%_-_5px)_100%,0_100%,0_5px)]">
                          <FiImage aria-hidden="true" className={iconClassName} />
                          {product.images.length}
                        </div>

                        <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">
                          {pinText ? (
                            <span
                              title={`Pin: ${pinText}`}
                              className="flex max-w-[120px] items-center gap-1 border border-emerald-200/25 bg-black/70 px-2 py-0.5 text-[10px] font-black text-emerald-100 backdrop-blur-md [clip-path:polygon(5px_0,100%_0,100%_calc(100%_-_5px),calc(100%_-_5px)_100%,0_100%,0_5px)]"
                            >
                              <FiBattery
                                aria-hidden="true"
                                className={iconClassName}
                              />
                              <span className="truncate">{pinText}</span>
                            </span>
                          ) : null}

                          {statusText ? (
                            <span
                              title={`Trạng thái: ${statusText}`}
                              className="max-w-[120px] truncate border border-[#d8c99f]/25 bg-black/70 px-2 py-0.5 text-[9px] font-black text-[#eadfbe] backdrop-blur-md [clip-path:polygon(5px_0,100%_0,100%_calc(100%_-_5px),calc(100%_-_5px)_100%,0_100%,0_5px)]"
                            >
                              {statusText}
                            </span>
                          ) : null}

                          {productDone ? (
                            <span className="border border-white/35 bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-950 [clip-path:polygon(5px_0,100%_0,100%_calc(100%_-_5px),calc(100%_-_5px)_100%,0_100%,0_5px)]">
                              DONE
                            </span>
                          ) : null}

                          {active ? (
                            <span className="border border-[#f1e5c2]/80 bg-[linear-gradient(135deg,#f2e8cd,#bda66d)] px-2 py-1 text-[10px] font-black text-[#17130a] [clip-path:polygon(5px_0,100%_0,100%_calc(100%_-_5px),calc(100%_-_5px)_100%,0_100%,0_5px)]">
                              ACTIVE
                            </span>
                          ) : null}
                        </div>
                      </button>

                      <div className="flex min-w-0 flex-col gap-2 p-2">
                        <div className="">
                          {product.category ? (
                            <div className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-[#cdbf98]">
                              {product.category}
                            </div>
                          ) : null}

                          <h3 className="line-clamp-2 min-h-9 text-[12px] font-black leading-[18px] text-white">
                            {product.name}
                          </h3>
                          <div className="mt-1 truncate text-xs font-black text-[#f1e5c2]">
                            {product.priceText || "Chưa có giá"}
                          </div>
                        </div>

                        <div
                          role={descriptionPreview.length > 90 ? "button" : undefined}
                          tabIndex={descriptionPreview.length > 90 ? 0 : undefined}
                          aria-expanded={descriptionPreview.length > 90 ? expanded : undefined}
                          className={`w-full min-w-0 border border-[#d8c99f]/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] p-2 [clip-path:polygon(7px_0,100%_0,100%_calc(100%_-_7px),calc(100%_-_7px)_100%,0_100%,0_7px)] ${descriptionPreview.length > 90
                            ? "cursor-pointer transition hover:border-[#d8c99f]/30 hover:bg-[#d8c99f]/[0.045]"
                            : ""
                            }`}
                          onMouseUp={(event) => {
                            event.stopPropagation();
                            updateSelectedDescriptionCopy(
                              product.id,
                              event.currentTarget,
                            );
                          }}
                          onTouchEnd={(event) => {
                            event.stopPropagation();
                            updateSelectedDescriptionCopy(
                              product.id,
                              event.currentTarget,
                            );
                          }}
                          onClick={(event) => {
                            event.stopPropagation();

                            const hasSelectedText = updateSelectedDescriptionCopy(
                              product.id,
                              event.currentTarget,
                            );

                            if (hasSelectedText) return;

                            if (descriptionPreview.length > 90) {
                              toggleExpandedProduct(product.id);
                            }
                          }}
                          onKeyDown={(event) => {
                            event.stopPropagation();

                            if (
                              descriptionPreview.length > 90 &&
                              (event.key === "Enter" || event.key === " ")
                            ) {
                              event.preventDefault();
                              toggleExpandedProduct(product.id);
                            }
                          }}
                        >
                          <div
                            className={`${expanded ? "line-clamp-none" : "line-clamp-2"
                              } w-full min-w-0 whitespace-pre-wrap p-1 text-[11px] leading-[18px] text-slate-300 [overflow-wrap:anywhere]`}
                          >
                            {renderDescriptionText(
                              product.id,
                              descriptionPreview,
                              expanded,
                            )}
                          </div>
                          {selectedDescriptionCopy?.productId === product.id &&
                            selectedDescriptionCopy.text ? (
                            <button
                              type="button"
                              data-luxury-accent="emerald"
                              className="mt-2 inline-flex w-full items-center justify-center gap-1 border border-emerald-300/40 bg-emerald-300/[0.07] px-1.5 py-1 text-[9px] font-black text-emerald-100 transition hover:border-emerald-200/60 hover:bg-emerald-300/[0.12] active:opacity-80"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleCopySelectedDescription(product.id);
                              }}
                            >
                              {renderCopyIcon(`selected-description-${product.id}`)}
                              Copy phần đã chọn
                            </button>
                          ) : null}
                          {descriptionPreview.length > 90 ? (
                            <button
                              type="button"
                              className="mt-2 text-[11px] font-black text-slate-300"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleExpandedProduct(product.id);
                              }}
                            >
                              {expanded ? "Thu gọn" : "Xem thêm"}
                            </button>
                          ) : null}
                        </div>

                        <div className="grid  grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            data-luxury-accent="cyan"
                            title="Copy ảnh chính"
                            aria-label="Copy ảnh chính"
                            className={`${productActionButtonBaseClassName} border-[#d8c99f]/[0.32] bg-[#d8c99f]/[0.055] text-[#eadfbe] hover:border-[#f1e5c2]/[0.55] hover:bg-[#d8c99f]/10`}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleCopyProductRepresentativeImage(product);
                            }}
                          >
                            {renderCopyIcon(`cover-${product.id}`)}
                            <span className=" truncate whitespace-nowrap">Ảnh Chính</span>
                          </button>

                          <button
                            type="button"
                            data-luxury-accent="sapphire"
                            title="Chia sẻ sản phẩm"
                            aria-label="Chia sẻ sản phẩm"
                            className={`${productActionButtonBaseClassName} border-[#d8c99f]/[0.32] bg-[#d8c99f]/[0.055] text-[#eadfbe] hover:border-[#f1e5c2]/[0.55] hover:bg-[#d8c99f]/10`}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleShareProduct(product);
                            }}
                          >
                            {copiedKey === `share-product-${product.id}` ? (
                              <FiCheck
                                aria-hidden="true"
                                className={iconClassName}
                              />
                            ) : (
                              <FiShare2
                                aria-hidden="true"
                                className={iconClassName}
                              />
                            )}
                            <span className=" truncate whitespace-nowrap">Chia sẻ</span>
                          </button>

                          <button
                            type="button"
                            data-luxury-accent="indigo"
                            title="Copy nguyên bản mô tả"
                            aria-label="Copy nguyên bản mô tả"
                            className={`${productActionButtonBaseClassName} border-white/[0.12] bg-white/[0.025] text-slate-200 hover:border-[#d8c99f]/[0.35] hover:bg-[#d8c99f]/[0.055] hover:text-[#eadfbe]`}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleCopyField(
                                `post-${product.id}`,
                                "post",
                                composeCopyText(
                                  descriptionPreview,
                                  activeContactText,
                                  settings.includeSocialTags,
                                ),
                              );
                            }}
                          >
                            {renderCopyIcon(`post-${product.id}`)}
                            <span className=" truncate whitespace-nowrap">Post</span>
                          </button>

                          <button
                            type="button"
                            data-luxury-accent="amber"
                            title="Copy comment sản phẩm"
                            aria-label="Copy comment sản phẩm"
                            className={`${productActionButtonBaseClassName} border-[#d8c99f]/[0.42] bg-[#d8c99f]/[0.07] text-[#f1e5c2] hover:border-[#f1e5c2]/[0.65] hover:bg-[#d8c99f]/[0.12]`}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleCopyField(
                                `cmt-${product.id}`,
                                "cmt",
                                buildCommentContentText(
                                  product.name,
                                  descriptionPreview,
                                  product.priceText,
                                  activeContactText,
                                ),
                              );
                            }}
                          >
                            {renderCopyIcon(`cmt-${product.id}`)}
                            <span className=" truncate whitespace-nowrap">Cmt</span>
                          </button>

                          <button
                            type="button"
                            data-luxury-accent="violet"
                            title="Copy tên sản phẩm"
                            aria-label="Copy tên sản phẩm"
                            className={`${productActionButtonBaseClassName} border-white/[0.12] bg-white/[0.025] text-slate-200 hover:border-[#d8c99f]/[0.35] hover:bg-[#d8c99f]/[0.055] hover:text-[#eadfbe]`}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleCopyField(
                                `name-${product.id}`,
                                "tên",
                                product.name,
                              );
                            }}
                          >
                            {renderCopyIcon(`name-${product.id}`)}
                            <span className=" truncate whitespace-nowrap">Tên</span>
                          </button>

                          <button
                            type="button"
                            data-luxury-accent={productDone ? "sapphire" : "emerald"}
                            title={productDone ? "Bỏ DONE" : "Đánh dấu DONE"}
                            aria-label={productDone ? "Bỏ DONE" : "Đánh dấu DONE"}
                            className={`${productActionButtonBaseClassName} ${productDone
                              ? "border-white/20 bg-white/[0.055] text-slate-100 hover:border-white/35 hover:bg-white/[0.08]"
                              : "border-emerald-300/[0.38] bg-emerald-300/[0.06] text-emerald-100 hover:border-emerald-200/60 hover:bg-emerald-300/10"
                              }`}
                            onClick={(event) => {
                              event.stopPropagation();
                              void toggleProductDone(product.id);
                            }}
                          >
                            <FiCheckCircle
                              aria-hidden="true"
                              className={iconClassName}
                            />
                            <span className=" truncate whitespace-nowrap">
                              {productDone ? "DONE" : "Chưa bán"}
                            </span>
                          </button>
                          <button
                            type="button"
                            data-luxury-accent="teal"
                            title="Tải ảnh sản phẩm"
                            aria-label="Tải ảnh sản phẩm"
                            className={`${productActionButtonBaseClassName} border-[#b9c4d6]/25 bg-[#b9c4d6]/[0.045] text-[#d9e1ed] hover:border-[#d8c99f]/40 hover:bg-[#d8c99f]/[0.065] hover:text-[#eadfbe]`}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDownloadProductImages(product);
                            }}
                          >
                            <FiDownload
                              aria-hidden="true"
                              className={iconClassName}
                            />
                            <span className=" truncate whitespace-nowrap">Tải ảnh</span>
                          </button>

                          <button
                            type="button"
                            data-luxury-accent="rose"
                            title="Xóa sản phẩm"
                            aria-label="Xóa sản phẩm"
                            className={`${productActionButtonBaseClassName} border-rose-300/[0.28] bg-rose-300/[0.045] text-rose-100 hover:border-rose-300/[0.55] hover:bg-rose-300/[0.08]`}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDelete(product.id);
                            }}
                          >
                            <FiTrash2
                              aria-hidden="true"
                              className={iconClassName}
                            />
                            <span className=" truncate whitespace-nowrap">Xóa</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </section>

      {activeModal ? (
        <div className="luxury-modal-overlay fixed inset-0 z-modal flex h-dvh w-full items-center justify-center overflow-hidden p-2 xl:p-8">
          <div className="luxury-modal flex h-[calc(100dvh-1rem)] w-full min-w-0 flex-col overflow-hidden border xl:h-[calc(100dvh-4rem)]">
            <div className="luxury-modal-titlebar flex min-w-0 shrink-0 items-center justify-between gap-3 border-b p-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#d8c99f]/30 bg-[#d8c99f]/[0.07] text-[#eadfbe] [clip-path:polygon(7px_0,100%_0,100%_calc(100%_-_7px),calc(100%_-_7px)_100%,0_100%,0_7px)]">
                  {activeModal === "product" ? (
                    <FiPlus aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "productList" ? (
                    <FiDatabase aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "schedule" ? (
                    <FiCalendar aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "globalNote" ? (
                    <FiClipboard aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "globalDescription" ? (
                    <FiFileText aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "contact" ? (
                    <FiPhone aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "importExport" ? (
                    <FiArchive aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "slotDetail" ? (
                    <FiClipboard aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "imageAlbum" ? (
                    <FiImage aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "imageDownload" ? (
                    <FiDownload aria-hidden="true" className={iconClassName} />
                  ) : null}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-xs font-black text-white">
                    {activeModal === "product"
                      ? editingId
                        ? "Sửa sản phẩm"
                        : "Thêm sản phẩm"
                      : null}
                    {activeModal === "productList"
                      ? "Bảng sản phẩm"
                      : null}
                    {activeModal === "schedule" ? "Cấu hình lịch đăng" : null}
                    {activeModal === "globalNote" ? "Ghi chú" : null}
                    {activeModal === "globalDescription" ? "Mô tả chung" : null}
                    {activeModal === "contact" ? "Liên hệ khi copy" : null}
                    {activeModal === "importExport"
                      ? "Import / Export Data"
                      : null}
                    {activeModal === "slotDetail" ? "Chi tiết bài đăng" : null}
                    {activeModal === "imageAlbum" ? "Album ảnh" : null}
                    {activeModal === "imageDownload" ? "Tải ảnh" : null}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="group flex h-8 w-8 shrink-0 items-center justify-center border border-[#d8c99f]/20 bg-white/[0.025] text-slate-300 transition hover:border-[#d8c99f]/[0.45] hover:bg-[#d8c99f]/[0.07] hover:text-[#eadfbe] active:opacity-80"
                onClick={closeModal}
              >
                <FiX aria-hidden="true" className={iconClassName} />
              </button>
            </div>

            <div
              className={`min-h-0 min-w-0 flex-1 overflow-x-hidden bg-[radial-gradient(circle_at_50%_0,rgba(216,201,159,0.035),transparent_36%)] p-2 ${activeModal === "imageAlbum" || activeModal === "productList" || activeModal === "product" ? "overflow-hidden" : "overflow-y-auto"}`}
            >
              {activeModal === "imageDownload" ? (
                <section className="grid w-full grid-cols-1 gap-3 xl:grid-cols-2">
                  <article className="flex flex-col rounded-md border border-white/10 bg-slate-900 p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-100">
                        <FiArchive
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                      </div>

                      <div className="">
                        <h3 className="text-sm font-black text-white">
                          Tải tất cả ảnh
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Tải toàn bộ ảnh của các sản phẩm chưa DONE. Sản phẩm
                          đã DONE sẽ luôn được loại khỏi danh sách tải.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-md border border-white/10 bg-slate-950 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                        Tổng ảnh chưa DONE
                      </p>
                      <p className="mt-1 text-xl font-black text-white">
                        {totalImages}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="mt-3 flex items-center justify-center gap-2 rounded-md bg-sky-300 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-sky-200 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={totalImages === 0}
                      onClick={handleDownloadAllImages}
                    >
                      <FiDownload
                        aria-hidden="true"
                        className={iconClassName}
                      />
                      Tải tất cả ảnh
                    </button>
                  </article>

                  <article className="flex flex-col rounded-md border border-white/10 bg-slate-900 p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                        <FiImage aria-hidden="true" className="h-4 w-4" />
                      </div>

                      <div className="">
                        <h3 className="text-sm font-black text-white">
                          Tải ảnh đại diện
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Chỉ tải ảnh index 0 của mỗi sản phẩm chưa DONE. Có
                          thể chọn một danh mục hoặc tải tất cả danh mục.
                        </p>
                      </div>
                    </div>

                    <label className="mt-3 block">
                      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Danh mục cần tải
                      </span>
                      <select
                        value={imageDownloadCategory}
                        className="min-h-10 w-full rounded-md border border-slate-600 bg-slate-950 px-2 text-xs font-bold text-white transition focus:border-cyan-300"
                        onChange={(event) =>
                          setImageDownloadCategory(event.target.value)
                        }
                      >
                        <option value="all">
                          Tất cả danh mục ({totalRepresentativeImages})
                        </option>
                        {representativeImageCategoryOptions.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.name} ({category.count})
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="mt-3 rounded-md border border-white/10 bg-slate-950 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                        Ảnh đại diện chưa DONE sẽ tải
                      </p>
                      <p className="mt-1 text-xl font-black text-white">
                        {representativeImageProducts.length}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="mt-3 flex items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={representativeImageProducts.length === 0}
                      onClick={handleDownloadRepresentativeImages}
                    >
                      <FiDownload
                        aria-hidden="true"
                        className={iconClassName}
                      />
                      Tải ảnh đại diện
                    </button>
                  </article>
                </section>
              ) : null}

              {activeModal === "productList" ? (
                <section className="flex h-full flex-col gap-2">
                  <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
                    <div className="">
                      <h3 className="text-xs font-black text-white">
                        Bảng sản phẩm
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-md border border-white/10 bg-slate-800 p-2">
                        <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
                          Tổng
                        </p>
                        <p className="mt-1 text-sm font-black text-white">
                          {filteredProducts.length}
                        </p>
                      </div>

                      <div className="rounded-md border border-emerald-400/20 bg-emerald-400/10 p-2">
                        <p className="text-[9px] font-black uppercase tracking-wide text-slate-300/80">
                          Đã bán
                        </p>
                        <p className="mt-1 text-sm font-black text-emerald-100">
                          {soldProductCount}
                        </p>
                      </div>

                      <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 p-2">
                        <p className="text-[9px] font-black uppercase tracking-wide text-cyan-200/80">
                          Chưa bán
                        </p>
                        <p className="mt-1 text-sm font-black text-cyan-100">
                          {activeProductCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_110px_110px_90px]">
                    <label className="flex items-center gap-2 rounded-md border border-slate-600 bg-slate-950/70 px-2 py-1.5 text-slate-400 transition focus-within:border-slate-300 focus-within:bg-slate-950">
                      <FiSearch
                        aria-hidden="true"
                        className={`${iconClassName} shrink-0`}
                      />

                      <input
                        // autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => event.stopPropagation()}
                        className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder:text-slate-500"
                        placeholder="Tìm tên, giá hoặc danh mục"
                      />
                    </label>

                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-slate-800 px-2 py-2 whitespace-nowrap text-xs font-black text-white transition hover:bg-slate-700 active:opacity-80"
                      onClick={() => void handleCopyProductList()}
                    >
                      {copiedKey === "product-list-copy" ? (
                        <FiCheck aria-hidden="true" className={iconClassName} />
                      ) : (
                        <FiCopy aria-hidden="true" className={iconClassName} />
                      )}
                      Copy
                    </button>

                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-slate-800 px-2 py-2 whitespace-nowrap text-xs font-black text-white transition hover:bg-slate-700 active:opacity-80"
                      onClick={handleExportProductsCsv}
                    >
                      <FiFileText
                        aria-hidden="true"
                        className={iconClassName}
                      />
                      Excel
                    </button>

                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-md bg-cyan-300 px-2 py-2 whitespace-nowrap text-xs font-black text-slate-950 transition hover:bg-cyan-200 active:opacity-80"
                      onClick={openProductModalForCreate}
                    >
                      <FiPlus aria-hidden="true" className={iconClassName} />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto rounded-md border border-white/10 bg-slate-950">
                    {groupedProductsByCategory.length > 0 ? (
                      <div className="min-w-[860px]">
                        <div className="sticky top-0 z-10 grid grid-cols-[170px_minmax(360px,1fr)_120px_90px_140px] border-b border-white/10 bg-slate-900 text-[10px] font-black uppercase tracking-wide text-slate-400">
                          <div className="border-r border-white/10 px-2 py-2">
                            Danh mục
                          </div>

                          <div className="border-r border-white/10 px-2 py-2">
                            Sản phẩm / Giá
                          </div>

                          <div className="border-r border-white/10 px-2 py-2">
                            Trạng thái
                          </div>

                          <div className="border-r border-white/10 px-2 py-2">
                            Ảnh
                          </div>

                          <div className="px-2 py-2">Cập nhật</div>
                        </div>

                        {groupedProductsByCategory.map((group) => {
                          const groupSoldCount = group.products.filter(
                            (product) => product.isDone,
                          ).length;
                          const groupActiveCount =
                            group.products.length - groupSoldCount;

                          return (
                            <div key={group.category}>
                              <div className="grid grid-cols-[170px_minmax(360px,1fr)_120px_90px_140px] border-b border-[#d8c99f]/20 bg-[#d8c99f]/[0.065] text-xs font-black text-[#eadfbe]">
                                <div className="border-r border-[#d8c99f]/20 px-2 py-2">
                                  {group.category}
                                </div>

                                <div className="border-r border-[#d8c99f]/20 px-2 py-2">
                                  {group.products.length} sản phẩm
                                </div>

                                <div className="border-r border-[#d8c99f]/20 px-2 py-2">
                                  {groupSoldCount} bán / {groupActiveCount} còn
                                </div>

                                <div className="border-r border-[#d8c99f]/20 px-2 py-2" />

                                <div className="px-2 py-2" />
                              </div>

                              {group.products.map((product) => {
                                const isSelected =
                                  selectedProductId === product.id;
                                const statusLabel = product.isDone
                                  ? "Đã bán"
                                  : "Chưa bán";

                                return (
                                  <div
                                    key={product.id}
                                    className={`grid grid-cols-[170px_minmax(360px,1fr)_120px_90px_140px] border-b border-white/10 text-xs transition ${isSelected
                                      ? "bg-cyan-300/10 text-white"
                                      : product.isDone
                                        ? "bg-emerald-400/[0.04] text-slate-300 hover:bg-emerald-400/10"
                                        : "bg-slate-950 text-slate-300 hover:bg-slate-800"
                                      }`}
                                    onClick={() =>
                                      setSelectedProductId(product.id)
                                    }
                                  >
                                    <div className="flex items-center border-r border-white/10 px-2 py-2 text-[11px] font-bold text-slate-500">
                                      {group.category}
                                    </div>

                                    <button
                                      type="button"
                                      className=" border-r border-white/10 px-2 py-2 text-left transition hover:bg-slate-800"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleEdit(product);
                                      }}
                                    >
                                      <div className="flex  items-center gap-2">
                                        {product.isDone ? (
                                          <span className="shrink-0 rounded-md bg-emerald-300 px-1.5 py-0.5 text-[9px] font-black text-slate-950">
                                            Đã bán
                                          </span>
                                        ) : null}

                                        <p className="line-clamp-1 text-xs font-black leading-5 text-white xl:text-sm xl:leading-6">
                                          {product.name}
                                        </p>
                                      </div>

                                      <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <span className="rounded-md bg-cyan-300 px-2 py-1 text-xs font-black text-slate-950">
                                          {product.priceText || "Chưa có giá"}
                                        </span>

                                        <span className="text-[10px] font-bold text-slate-500">
                                          Bấm vào tên để sửa
                                        </span>
                                      </div>
                                    </button>

                                    <div className="flex items-center border-r border-white/10 px-2 py-2">
                                      <button
                                        type="button"
                                        className={`w-full rounded-md px-2 py-1.5 text-[10px] font-black transition active:opacity-80 ${product.isDone
                                          ? "bg-emerald-300 text-slate-950 hover:bg-emerald-200"
                                          : "border border-slate-500/40 bg-slate-800 text-slate-300 hover:bg-slate-700"
                                          }`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          void toggleProductDone(product.id);
                                        }}
                                      >
                                        {statusLabel}
                                      </button>
                                    </div>

                                    <div className="flex items-center border-r border-white/10 px-2 py-2 text-xs font-black text-slate-300">
                                      {product.images.length}
                                    </div>

                                    <div className="flex flex-col justify-center px-2 py-1.5 text-[10px] text-slate-500">
                                      <span>
                                        {new Date(
                                          product.updatedAt,
                                        ).toLocaleDateString("vi-VN")}
                                      </span>

                                      {product.doneAt ? (
                                        <span className="mt-0.5 text-slate-300/80">
                                          Bán:{" "}
                                          {new Date(
                                            product.doneAt,
                                          ).toLocaleDateString("vi-VN")}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex h-full min-h-[260px] items-center justify-center p-2 text-center">
                        <div>
                          <p className="text-xs font-black text-white">
                            Chưa có sản phẩm
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Thêm sản phẩm hoặc đổi từ khóa tìm kiếm để xem danh
                            sách.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              ) : null}

              {activeModal === "product" ? (
                <form
                  className="product-editor flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
                  onSubmit={(event) => void handleSubmit(event)}
                >
                  <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-1">
                    <div className="grid min-h-full min-w-0 grid-cols-1 items-start gap-3 pb-24 xl:grid-cols-[minmax(320px,0.92fr)_minmax(360px,1.08fr)] xl:pb-2">
                      <section className="order-2 flex min-h-0 min-w-0 flex-col gap-3 xl:order-1">
                        <label className="flex min-w-0 flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-300">
                            Tên sản phẩm
                          </span>
                          <input
                            value={draft.name}
                            onChange={(event) =>
                              updateDraftField("name", event.target.value)
                            }
                            className="w-full min-w-0 rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                            placeholder="Dell Latitude 7440 i5 13th"
                          />
                        </label>

                        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                          <label className="flex min-w-0 flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-300">
                              Giá
                            </span>
                            <input
                              value={draft.priceText}
                              onChange={(event) =>
                                updateDraftField(
                                  "priceText",
                                  event.target.value,
                                )
                              }
                              className="w-full min-w-0 rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                              placeholder="13tr8"
                            />
                          </label>

                          <label className="flex min-w-0 flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-300">
                              Danh mục
                            </span>
                            <input
                              value={draft.category}
                              list="local-product-category-options"
                              onChange={(event) =>
                                updateDraftField("category", event.target.value)
                              }
                              className="w-full min-w-0 rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                              placeholder="Laptop Dell"
                            />
                            <datalist id="local-product-category-options">
                              {categories.map((category) => (
                                <option key={category} value={category} />
                              ))}
                            </datalist>
                          </label>
                        </div>

                        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                          <label className="flex min-w-0 flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-300">
                              Pin
                            </span>
                            <input
                              value={draft.pin}
                              maxLength={20}
                              onChange={(event) =>
                                updateDraftField("pin", event.target.value)
                              }
                              className="w-full min-w-0 rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/60"
                              placeholder="8x%, 9x%, New"
                            />
                          </label>

                          <label className="flex min-w-0 flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-300">
                              Trạng thái
                            </span>
                            <input
                              value={draft.status}
                              maxLength={40}
                              onChange={(event) =>
                                updateDraftField("status", event.target.value)
                              }
                              className="w-full min-w-0 rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/60"
                              placeholder="Nguyên zin"
                            />
                          </label>
                        </div>

                        <label className="flex min-h-0 min-w-0 flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-300">
                            Mô tả sản phẩm
                          </span>
                          <textarea
                            value={draft.description}
                            onChange={(event) =>
                              updateDraftField(
                                "description",
                                event.target.value,
                              )
                            }
                            rows={8}
                            className="min-h-[220px] w-full min-w-0 resize-y rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 sm:min-h-[260px] xl:min-h-[calc(90dvh-260px)] xl:resize-none"
                            placeholder="Để trống nếu muốn dùng mô tả chung..."
                          />
                        </label>
                      </section>

                      <section className="order-1 flex min-h-0 min-w-0 flex-col gap-3 xl:order-2">
                        <label
                          className={`min-w-0 cursor-pointer rounded-md border border-dashed p-3 text-center transition ${isDragging
                            ? "border-cyan-300/80 bg-cyan-300/10"
                            : "border-white/15 bg-slate-950/70 hover:border-cyan-300/50 hover:bg-cyan-300/5"
                            }`}
                          onDrop={(event) => void handleDrop(event)}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          <div className="flex items-center justify-center gap-2 text-xs font-black text-white">
                            <FiUploadCloud
                              aria-hidden="true"
                              className={iconClassName}
                            />
                            Ảnh chính
                          </div>
                          <div className="mt-1 break-words text-[11px] leading-5 text-slate-400">
                            {isProcessingImages
                              ? "Đang xử lý ảnh..."
                              : "Chọn, kéo thả hoặc paste ảnh sản phẩm. Hỗ trợ nhiều ảnh, tự nén JPG."}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(event) => void handleImageInput(event)}
                          />
                        </label>

                        {renderDraftImageCollection("images", "ảnh chính")}

                        <label
                          tabIndex={0}
                          className={`min-w-0 cursor-pointer rounded-md border border-dashed p-3 text-center transition ${isDragging
                            ? "border-amber-300/80 bg-amber-300/10"
                            : "border-amber-300/20 bg-amber-300/[0.04] hover:border-amber-300/50 hover:bg-amber-300/[0.08]"
                            }`}
                          onDrop={(event) =>
                            void handleDrop(event, "internalImages")
                          }
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onPaste={(event) =>
                            void handleInternalImagePaste(event)
                          }
                        >
                          <div className="flex items-center justify-center gap-2 text-xs font-black text-amber-100">
                            <FiUploadCloud
                              aria-hidden="true"
                              className={iconClassName}
                            />
                            Ảnh nội bộ
                          </div>
                          <div className="mt-1 break-words text-[11px] leading-5 text-slate-400">
                            {isProcessingImages
                              ? "Đang xử lý ảnh..."
                              : "Ảnh model, dung lượng pin hoặc thông tin kiểm tra máy."}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(event) =>
                              void handleInternalImageInput(event)
                            }
                          />
                        </label>

                        {renderDraftImageCollection(
                          "internalImages",
                          "ảnh nội bộ",
                        )}
                      </section>
                    </div>
                  </div>

                  <div className="min-w-0 shrink-0 border-t border-white/10 bg-slate-950/95 p-2">
                    <button
                      type="submit"
                      className="flex min-h-9 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 p-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200 active:opacity-80"
                    >
                      {editingId ? (
                        <FiRefreshCcw
                          aria-hidden="true"
                          className={iconClassName}
                        />
                      ) : (
                        <FiPlus aria-hidden="true" className={iconClassName} />
                      )}
                      {editingId ? "Lưu thay đổi" : "Thêm sản phẩm"}
                    </button>
                  </div>
                </form>
              ) : null}

              {activeModal === "schedule" ? (
                <section className="flex min-h-full flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2 xl:grid-cols-8">
                    <div className="rounded-md border border-white/10 bg-slate-900 p-1">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Khung giờ
                      </div>
                      <div className="text-xs font-black text-white">
                        {scheduleTimes.length}
                      </div>
                    </div>

                    <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 p-1">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-cyan-200">
                        Tổng task
                      </div>
                      <div className="text-xs font-black text-white">
                        {totalTodayTaskCount}
                      </div>
                    </div>

                    <div className="rounded-md border border-emerald-400/20 bg-emerald-400/10 p-1">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-300">
                        DONE
                      </div>
                      <div className="text-xs font-black text-white">
                        {postedTodayCount}
                      </div>
                    </div>

                    <div className="rounded-md border border-rose-400/20 bg-rose-400/10 p-1">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-rose-200">
                        Còn lại
                      </div>
                      <div className="text-xs font-black text-white">
                        {remainingTodayCount}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-md border border-white/10 bg-slate-800 p-1 text-left transition hover:bg-slate-700"
                      onClick={() =>
                        setCompactScheduleConfig((current) => !current)
                      }
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Cấu hình
                      </div>
                      <div className="text-xs font-black text-white">
                        {compactScheduleConfig ? "Mở" : "Thu gọn"}
                      </div>
                    </button>

                    <button
                      type="button"
                      className="rounded-md border border-violet-300/30 bg-violet-300/10 p-1 text-left transition hover:bg-violet-300/20"
                      onClick={autoFillScheduleAssignments}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-violet-200">
                        Tự động
                      </div>
                      <div className="text-xs font-black text-white">
                        Rải lịch
                      </div>
                    </button>

                    <button
                      type="button"
                      className="rounded-md border border-white/10 bg-slate-800 p-1 text-left transition hover:bg-slate-700"
                      onClick={resetActiveScheduleTaskAssignments}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Task
                      </div>
                      <div className="text-xs font-black text-white">
                        Xóa task
                      </div>
                    </button>

                    <button
                      type="button"
                      className="rounded-md border border-rose-400/30 bg-rose-400/10 p-1 text-left transition hover:bg-rose-400/20"
                      onClick={resetAllScheduleAssignments}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-rose-200">
                        Tất cả
                      </div>
                      <div className="text-xs font-black text-white">
                        Xóa lịch
                      </div>
                    </button>
                  </div>

                  {!compactScheduleConfig ? (
                    <div className="rounded-md border border-white/10 bg-slate-950/70 p-2">
                      <div className="grid grid-cols-2 gap-2 xl:grid-cols-8">
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-300">
                            Từ ngày
                          </span>
                          <input
                            type="date"
                            value={scheduleConfig.dateFrom}
                            onChange={(event) =>
                              updateScheduleField(
                                "dateFrom",
                                event.target.value,
                              )
                            }
                            className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
                          />
                        </label>

                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-300">
                            Đến ngày
                          </span>
                          <input
                            type="date"
                            value={scheduleConfig.dateTo}
                            onChange={(event) =>
                              updateScheduleField("dateTo", event.target.value)
                            }
                            className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
                          />
                        </label>

                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-300">
                            Bài đầu
                          </span>
                          <input
                            type="time"
                            value={scheduleConfig.startTime}
                            onChange={(event) =>
                              updateScheduleField(
                                "startTime",
                                event.target.value,
                              )
                            }
                            className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
                          />
                        </label>

                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-300">
                            Bài cuối
                          </span>
                          <input
                            type="time"
                            value={scheduleConfig.endTime}
                            onChange={(event) =>
                              updateScheduleField("endTime", event.target.value)
                            }
                            className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
                          />
                        </label>

                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-300">
                            Khoảng cách
                          </span>
                          <select
                            value={scheduleConfig.gapHours}
                            onChange={(event) =>
                              updateScheduleField(
                                "gapHours",
                                Number(event.target.value),
                              )
                            }
                            className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
                          >
                            {[1, 2, 3, 4, 5, 6].map((hour) => (
                              <option key={hour} value={hour}>
                                {hour} tiếng
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-300">
                            Số task
                          </span>
                          <select
                            value={scheduleConfig.taskCount}
                            onChange={(event) => {
                              const taskCount = Number(event.target.value);
                              setScheduleConfig((current) => ({
                                ...current,
                                taskCount,
                                taskNames: Array.from(
                                  { length: taskCount },
                                  (_, index) =>
                                    current.taskNames[index] ||
                                    `Task ${index + 1}`,
                                ),
                              }));
                            }}
                            className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                              <option key={count} value={count}>
                                {count} task
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 border-t border-white/10 pt-2">
                        <button
                          type="button"
                          className="rounded-md border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[11px] font-black text-cyan-100 transition hover:bg-cyan-300/20"
                          onClick={addScheduleTask}
                        >
                          Thêm task
                        </button>

                        <button
                          type="button"
                          className="rounded-md border border-violet-300/30 bg-violet-300/10 px-2 py-1 text-[11px] font-black text-violet-100 transition hover:bg-violet-300/20"
                          onClick={autoFillScheduleAssignments}
                        >
                          Tự rải đầy task
                        </button>

                        <button
                          type="button"
                          className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-[11px] font-black text-slate-100 transition hover:bg-slate-700"
                          onClick={duplicateFirstScheduleTask}
                        >
                          Nhân bản task 1
                        </button>
                      </div>

                      <div className="mt-2 rounded-md border border-white/10 bg-black/20 p-2">
                        <div className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                          Danh mục dùng để xếp lịch
                        </div>
                        {categories.length === 0 ? (
                          <p className="text-[10px] text-slate-400">
                            Chưa có danh mục. Thêm hoặc import sản phẩm trước.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {categories.map((category) => {
                              const active =
                                scheduleConfig.selectedCategories.some(
                                  (item) =>
                                    normalizeTextKey(item) ===
                                    normalizeTextKey(category),
                                );

                              return (
                                <button
                                  key={category}
                                  type="button"
                                  className={`rounded-md border px-2 py-1 text-[11px] font-black transition ${active
                                    ? "border-slate-200 bg-slate-100 text-slate-950"
                                    : "border-slate-600 bg-slate-900 text-slate-200 hover:border-slate-400 hover:bg-slate-800"
                                    }`}
                                  onClick={() =>
                                    toggleScheduleCategory(category)
                                  }
                                >
                                  {category}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {scheduleResult.warnings.length > 0 ? (
                    <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-2 text-xs text-amber-100">
                      {scheduleResult.warnings.map((warning) => (
                        <p key={warning.message}>{warning.message}</p>
                      ))}
                    </div>
                  ) : null}

                  <div className="grid min-h-0 flex-1 grid-cols-1 gap-1 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <section className=" rounded-md border border-white/10 bg-slate-950/70 p-1">
                      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                        {scheduleTaskIndexes.map((taskIndex) => {
                          const active = activeScheduleTaskIndex === taskIndex;

                          return (
                            <div
                              key={taskIndex}
                              className={`flex min-w-44 shrink-0 items-center gap-1 rounded-md border p-1 ${active
                                ? "border-cyan-300/60 bg-cyan-300/10"
                                : "border-white/10 bg-white/[0.03]"
                                }`}
                            >
                              <button
                                type="button"
                                className="shrink-0 rounded-md bg-slate-800 px-2 py-1 whitespace-nowrap text-[10px] font-black text-white"
                                onClick={() =>
                                  setActiveScheduleTaskIndex(taskIndex)
                                }
                              >
                                {taskIndex + 1}
                              </button>
                              <input
                                value={getTaskName(scheduleConfig, taskIndex)}
                                onChange={(event) =>
                                  updateScheduleTaskName(
                                    taskIndex,
                                    event.target.value,
                                  )
                                }
                                onFocus={() =>
                                  setActiveScheduleTaskIndex(taskIndex)
                                }
                                onKeyDown={(event) => event.stopPropagation()}
                                className=" flex-1 bg-transparent text-xs font-black text-white outline-none placeholder:text-slate-600"
                              />
                              <button
                                type="button"
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-rose-400/30 bg-rose-400/10 text-rose-100 transition hover:bg-rose-400/20"
                                onClick={() =>
                                  requestRemoveScheduleTask(taskIndex)
                                }
                                title="Xoá task này"
                              >
                                <FiTrash2
                                  aria-hidden="true"
                                  className={iconClassName}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {scheduleTimes.length === 0 ? (
                        <div className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-center text-xs text-slate-400">
                          Khung giờ chưa hợp lệ.
                        </div>
                      ) : (
                        <div className="max-h-[62dvh] overflow-auto pr-1">
                          <div className="grid grid-cols-1 gap-2">
                            {scheduleTimes.map((time, timeIndex) => {
                              const nextTime =
                                scheduleTimes[timeIndex + 1] ??
                                scheduleConfig.endTime;
                              const assignedProduct = getAssignedProduct(
                                today,
                                time,
                                timeIndex,
                                activeScheduleTaskIndex,
                              );
                              const postedKey = createPostedKey(
                                today,
                                timeIndex,
                                activeScheduleTaskIndex,
                              );
                              const done = postedIds.has(postedKey);

                              return (
                                <article
                                  key={`${time}-${activeScheduleTaskIndex}`}
                                  draggable={Boolean(assignedProduct)}
                                  className={`rounded-md border p-1 transition ${assignedProduct ? "cursor-grab active:cursor-grabbing" : ""} ${done
                                    ? "border-emerald-400/30 bg-emerald-400/10"
                                    : assignedProduct
                                      ? "border-cyan-300/30 bg-cyan-300/10"
                                      : "border-white/10 bg-slate-900"
                                    }`}
                                  onDragStart={(event) => {
                                    if (!assignedProduct) return;

                                    const assignmentKey =
                                      createScheduleAssignmentKey(
                                        today,
                                        timeIndex,
                                        activeScheduleTaskIndex,
                                      );

                                    event.dataTransfer.setData(
                                      "text/plain",
                                      assignedProduct.id,
                                    );
                                    event.dataTransfer.setData(
                                      "application/x-schedule-assignment-key",
                                      assignmentKey,
                                    );
                                    setDraggingProductId(assignedProduct.id);
                                  }}
                                  onDragEnd={() => setDraggingProductId("")}
                                  onDragOver={(event) => event.preventDefault()}
                                  onDrop={(event) =>
                                    handleScheduleDrop(
                                      event,
                                      today,
                                      time,
                                      timeIndex,
                                      activeScheduleTaskIndex,
                                    )
                                  }
                                >
                                  <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-1 xl:grid-cols-[58px_160px_minmax(0,1fr)_82px] xl:items-center">
                                    <div className="rounded-md border border-white/10 bg-slate-950 p-1">
                                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                        Bài {timeIndex + 1}
                                      </div>
                                      <div className="text-xs font-black text-white">
                                        {time}
                                      </div>
                                      <div className="text-[9px] text-slate-500">
                                        đến {nextTime}
                                      </div>
                                    </div>

                                    <select
                                      value={assignedProduct?.id ?? ""}
                                      onChange={(event) =>
                                        assignProductToSchedule(
                                          today,
                                          time,
                                          timeIndex,
                                          activeScheduleTaskIndex,
                                          event.target.value,
                                        )
                                      }
                                      className="col-span-1 rounded-md border border-white/10 bg-slate-950 p-1.5 text-[11px] font-bold text-white outline-none focus:border-cyan-300/60 xl:col-span-1"
                                    >
                                      <option value="">Chọn sản phẩm</option>
                                      {activeScheduleProducts.map((product) => {
                                        const currentAssignmentKey =
                                          createScheduleAssignmentKey(
                                            today,
                                            timeIndex,
                                            activeScheduleTaskIndex,
                                          );
                                        const sameTimePattern = new RegExp(
                                          `^${today}::task\\d+::slot${timeIndex + 1}$`,
                                        );
                                        const usedProductIds = new Set(
                                          Object.entries(scheduleAssignments)
                                            .filter(([key]) => {
                                              if (key === currentAssignmentKey)
                                                return false;

                                              return (
                                                key.startsWith(
                                                  `${today}::task${activeScheduleTaskIndex + 1}::`,
                                                ) || sameTimePattern.test(key)
                                              );
                                            })
                                            .map(([, value]) => value),
                                        );

                                        return (
                                          <option
                                            key={product.id}
                                            value={product.id}
                                            disabled={usedProductIds.has(
                                              product.id,
                                            )}
                                          >
                                            {product.name}{" "}
                                            {product.priceText
                                              ? `- ${product.priceText}`
                                              : ""}
                                          </option>
                                        );
                                      })}
                                    </select>

                                    <div className="col-span-2 flex  gap-1 xl:col-span-1">
                                      <button
                                        type="button"
                                        className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-900"
                                        onClick={() =>
                                          assignedProduct
                                            ? openImageAlbum({
                                              title: assignedProduct.name,
                                              description:
                                                assignedProduct.description.trim() ||
                                                settings.commonDescription.trim(),
                                              priceText: assignedProduct.priceText,
                                              images: assignedProduct.images,
                                              internalImages:
                                                assignedProduct.internalImages,
                                            })
                                            : undefined
                                        }
                                      >
                                        {assignedProduct?.images[0] ? (<img
                                          src={
                                            assignedProduct.images[0].dataUrl
                                          }
                                          alt={assignedProduct.name}
                                          width={1200}
                                          height={1200}
                                          className="h-full w-full object-contain"
                                        />
                                        ) : (
                                          <FiImage
                                            aria-hidden="true"
                                            className={`${iconClassName} text-slate-600`}
                                          />
                                        )}
                                      </button>

                                      <div className=" flex-1">
                                        <h4 className="line-clamp-2 text-[11px] font-black leading-4 text-white">
                                          {assignedProduct?.name ??
                                            "Kéo sản phẩm vào đây hoặc chọn từ danh sách"}
                                        </h4>
                                        <p className="mt-0.5 truncate text-[10px] font-black text-cyan-200">
                                          {assignedProduct?.priceText ??
                                            "Chưa có giá"}
                                        </p>
                                        <p className="mt-0.5 truncate text-[9px] font-bold text-slate-400">
                                          {assignedProduct?.category ??
                                            "Chưa có danh mục"}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="col-span-2 grid grid-cols-2 gap-1 xl:col-span-1 xl:grid-cols-1">
                                      <button
                                        type="button"
                                        title="Xem chi tiết lịch"
                                        aria-label="Xem chi tiết lịch"
                                        disabled={!assignedProduct}
                                        className={`flex items-center justify-center gap-2 rounded-md p-1.5 text-[10px] font-black transition ${done
                                          ? "bg-emerald-300 text-slate-950 hover:bg-emerald-200"
                                          : assignedProduct
                                            ? "border border-white/10 bg-slate-800 text-white hover:bg-slate-700"
                                            : "cursor-not-allowed border border-white/10 bg-white/[0.03] text-slate-600"
                                          }`}
                                        onClick={() =>
                                          assignedProduct &&
                                          togglePostedProduct(
                                            today,
                                            timeIndex,
                                            activeScheduleTaskIndex,
                                          )
                                        }
                                      >
                                        {done ? "DONE" : "Chưa đăng"}
                                      </button>

                                      <button
                                        type="button"
                                        title="Xem chi tiết lịch"
                                        aria-label="Xem chi tiết lịch"
                                        disabled={!assignedProduct}
                                        className={`flex items-center justify-center gap-2 rounded-md p-1.5 text-[10px] font-black transition ${assignedProduct
                                          ? "border border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
                                          : "cursor-not-allowed border border-white/10 bg-white/[0.03] text-slate-600"
                                          }`}
                                        onClick={() =>
                                          assignedProduct &&
                                          openAssignedSlotModal(
                                            today,
                                            timeIndex,
                                            activeScheduleTaskIndex,
                                          )
                                        }
                                      >
                                        <FiClipboard
                                          aria-hidden="true"
                                          className={iconClassName}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </section>

                    <aside className=" rounded-md border border-white/10 bg-slate-950/70 p-1 ">
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <div>
                          <h3 className="text-xs font-black text-white">
                            Sản phẩm khả dụng
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Kéo thả vào khung giờ hoặc click để active.
                          </p>
                        </div>
                        <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-black text-slate-300">
                          {filteredScheduleProducts.length}
                        </span>
                      </div>

                      <label className="mb-1 flex items-center gap-1 rounded-md border border-white/10 bg-slate-950/80 p-1.5 text-slate-400">
                        <FiSearch
                          aria-hidden="true"
                          className={`${iconClassName} shrink-0`}
                        />
                        <input
                          value={scheduleQuery}
                          onChange={(event) =>
                            setScheduleQuery(event.target.value)
                          }
                          onKeyDown={(event) => event.stopPropagation()}
                          className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder:text-slate-500"
                          placeholder="Tìm tất cả sản phẩm"
                        />
                      </label>

                      <div className="grid max-h-[62dvh] grid-cols-1 gap-1 overflow-y-auto pr-1">
                        {filteredScheduleProducts.map((product, index) => {
                          const scheduleLabels = getTodayProductScheduleLabels(
                            product.id,
                          );
                          const usedToday = scheduleLabels.length > 0;
                          const doneToday = todayPostedProductIds.has(
                            product.id,
                          );
                          const active = selectedProductId === product.id;

                          return (
                            <article
                              key={`${activeCategoryTab}-${product.id}`}
                              style={{ animationDelay: `${Math.min(index * 34, 340)}ms` }}
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.setData(
                                  "text/plain",
                                  product.id,
                                );
                                setDraggingProductId(product.id);
                                setSelectedProductId(product.id);
                              }}
                              onDragEnd={() => setDraggingProductId("")}
                              onClick={() => setSelectedProductId(product.id)}
                              className={`cursor-grab rounded-md border p-1 transition active:cursor-grabbing ${active
                                ? "border-cyan-300/60 bg-cyan-300/10  "
                                : "border-white/10 bg-slate-950/80 hover:border-cyan-300/30"
                                }`}
                            >
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-900"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openImageAlbum({
                                      title: product.name,
                                      description:
                                        product.description.trim() ||
                                        settings.commonDescription.trim(),
                                      priceText: product.priceText,
                                      images: product.images,
                                      internalImages: product.internalImages,
                                    });
                                  }}
                                >
                                  {product.images[0] ? (<img
                                    src={product.images[0].dataUrl}
                                    alt={product.name}
                                    width={1200}
                                    height={1200}
                                    className="h-full w-full object-contain"
                                  />
                                  ) : (
                                    <FiImage
                                      aria-hidden="true"
                                      className={`${iconClassName} text-slate-600`}
                                    />
                                  )}
                                </button>

                                <div className=" flex-1">
                                  <h4 className="line-clamp-2 text-[11px] font-black leading-4 text-white">
                                    {product.name}
                                  </h4>
                                  <p className="mt-0.5 truncate text-[10px] font-black text-cyan-200">
                                    {product.priceText || "Chưa có giá"}
                                  </p>
                                  <p className="mt-0.5 truncate text-[9px] font-bold text-slate-400">
                                    {product.category || "Chưa có danh mục"}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {active ? (
                                  <span className="rounded-md bg-cyan-300 px-1.5 py-0.5 text-[9px] font-black text-slate-950">
                                    ACTIVE
                                  </span>
                                ) : null}
                                {scheduleLabels.map((label) => (
                                  <span
                                    key={label}
                                    className="rounded-md bg-cyan-300/10 px-1.5 py-0.5 text-[9px] font-black text-cyan-100"
                                  >
                                    {label}
                                  </span>
                                ))}
                                {doneToday ? (
                                  <span className="rounded-md bg-emerald-300 px-1.5 py-0.5 text-[9px] font-black text-slate-950">
                                    DONE
                                  </span>
                                ) : null}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </aside>
                  </div>
                </section>
              ) : null}

              {activeModal === "globalNote" ? (
                <section className="flex h-full min-h-0 flex-col overflow-hidden">
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 p-2">
                    <label
                      htmlFor="global-note-input"
                      className="text-xs font-black text-white"
                    >
                      Ghi chú
                    </label>

                    <button
                      type="button"
                      className="flex shrink-0 items-center justify-center gap-2 rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 whitespace-nowrap text-xs font-black text-white transition hover:bg-slate-700 active:opacity-80"
                      onClick={() =>
                        void handleCopyField(
                          "global-note",
                          "ghi chú",
                          settings.globalNote,
                        )
                      }
                    >
                      {renderCopyIcon("global-note")}
                      Copy
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 p-2">
                    <textarea
                      id="global-note-input"
                      value={settings.globalNote}
                      onChange={(event) =>
                        updateSettingField("globalNote", event.target.value)
                      }
                      className="h-full min-h-0 w-full resize-none rounded-md border border-white/10 bg-slate-900/70 p-2 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:bg-slate-900 xl:text-xs xl:leading-6"
                      placeholder="Nhập ghi chú..."
                    />
                  </div>
                </section>
              ) : null}

              {activeModal === "globalDescription" ? (
                <section className="flex h-full min-h-0 flex-col overflow-hidden">
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 p-2">
                    <label
                      htmlFor="global-description-input"
                      className="text-xs font-black text-white"
                    >
                      Mô tả chung
                    </label>

                    <button
                      type="button"
                      className="flex shrink-0 items-center justify-center gap-2 rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 whitespace-nowrap text-xs font-black text-white transition hover:bg-slate-700 active:opacity-80"
                      onClick={() =>
                        void handleCopyField(
                          "global-description",
                          "mô tả chung",
                          settings.commonDescription,
                        )
                      }
                    >
                      {renderCopyIcon("global-description")}
                      Copy
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 p-2">
                    <textarea
                      id="global-description-input"
                      value={settings.commonDescription}
                      onChange={(event) =>
                        updateSettingField(
                          "commonDescription",
                          event.target.value,
                        )
                      }
                      className="h-full min-h-0 w-full resize-none rounded-md border border-white/10 bg-slate-900/70 p-2 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:bg-slate-900 xl:text-xs xl:leading-6"
                      placeholder="Nhập mô tả chung..."
                    />
                  </div>
                </section>
              ) : null}

              {activeModal === "contact" ? (
                <section className="grid w-full grid-cols-1 gap-2">
                  <article className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-white">
                          Thêm nội dung liên hệ
                        </h3>
                        <p className="mt-1 text-[10px] leading-4 text-emerald-100/80">
                          Liên hệ được chọn sẽ cách nội dung Post hoặc Cmt một dòng trống và được lưu trong file backup JSON.
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-emerald-300 px-2 py-1 text-[9px] font-black text-slate-950">
                        Chọn 1
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_auto]">
                      <textarea
                        value={contactDraft}
                        onChange={(event) => setContactDraft(event.target.value)}
                        className="min-h-24 w-full resize-y rounded-md border border-emerald-300/20 bg-slate-950/70 p-2 text-xs leading-5 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50"
                        placeholder="Nhập nội dung liên hệ..."
                      />
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-md bg-emerald-300 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-emerald-200 active:opacity-80 xl:self-stretch"
                        onClick={addContactOption}
                      >
                        <FiPlus aria-hidden="true" className={iconClassName} />
                        Thêm liên hệ
                      </button>
                    </div>
                  </article>

                  <article className="grid grid-cols-1 gap-2 rounded-md border border-white/10 bg-slate-950/60 p-2">
                    {settings.contactOptions.length > 0 ? (
                      settings.contactOptions.map((option, index) => (
                        <div
                          key={option.id}
                          className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 rounded-md border p-2 ${settings.selectedContactId === option.id
                            ? "border-emerald-300/60 bg-emerald-300/15"
                            : "border-white/10 bg-slate-900/70"
                            }`}
                        >
                          <input
                            type="radio"
                            name="selected-contact-option"
                            checked={settings.selectedContactId === option.id}
                            onChange={() => selectContactOption(option.id)}
                            className="mt-2 h-4 w-4 accent-emerald-300"
                            aria-label={`Chọn liên hệ ${index + 1}`}
                          />
                          <textarea
                            value={option.text}
                            onChange={(event) =>
                              updateContactOptionText(
                                option.id,
                                event.target.value,
                              )
                            }
                            className="min-h-20 w-full resize-y rounded-md border border-white/10 bg-slate-900/80 p-2 text-xs leading-5 text-white outline-none transition focus:border-emerald-300/40"
                            aria-label={`Nội dung liên hệ ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-300/30 bg-rose-300/10 text-rose-100 transition hover:bg-rose-300/20 active:opacity-80"
                            onClick={() => removeContactOption(option.id)}
                            title="Xóa liên hệ"
                            aria-label={`Xóa liên hệ ${index + 1}`}
                          >
                            <FiTrash2
                              aria-hidden="true"
                              className={iconClassName}
                            />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-md border border-dashed border-white/10 bg-slate-950/40 p-3 text-center text-[10px] text-slate-400">
                        Chưa có nội dung liên hệ.
                      </p>
                    )}
                  </article>
                </section>
              ) : null}

              {activeModal === "importExport" ? (
                <section className="grid w-full grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <article className="rounded-md border border-cyan-300/20 bg-cyan-300/10 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="">
                        <h3 className="text-xs font-black text-white">
                          Backup dữ liệu tổng
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-cyan-100/90">
                          Bao gồm sản phẩm, ảnh, mô tả chung, ghi chú, cấu hình
                          lịch, sản phẩm đã xếp trong lịch và trạng thái DONE.
                        </p>
                      </div>
                      <span className="rounded-md bg-slate-200 px-2 py-1 text-[10px] font-black text-slate-950">
                        An toàn
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 p-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200"
                        onClick={handleExportJson}
                        title="Export JSON"
                      >
                        <FiDownload
                          aria-hidden="true"
                          className={iconClassName}
                        />
                        <span>Export JSON</span>
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 p-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/20"
                        onClick={() => void handleExportJsonGzip()}
                        title="Export JSON.GZ"
                      >
                        <FiArchive
                          aria-hidden="true"
                          className={iconClassName}
                        />
                        <span>Export JSON.GZ</span>
                      </button>
                    </div>
                  </article>

                  <article className="rounded-md border border-amber-300/20 bg-amber-300/10 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="">
                        <h3 className="text-xs font-black text-white">
                          Khôi phục dữ liệu
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-amber-100/90">
                          Import file sẽ thay thế toàn bộ dữ liệu hiện tại trong trình duyệt.
                        </p>
                      </div>
                      <span className="rounded-md bg-amber-300 px-2 py-1 text-[10px] font-black text-slate-950">
                        Cẩn thận
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-amber-300/40 bg-amber-300/15 p-2 text-xs font-black text-amber-50 transition hover:bg-amber-300/25 active:opacity-80"
                        title="Import JSON hoặc JSON.GZ"
                        onClick={handleBeginBackupRestore}
                      >
                        <FiUploadCloud
                          aria-hidden="true"
                          className={iconClassName}
                        />
                        <span>
                          {isBackupRestoreReady
                            ? "Chọn tệp backup mới"
                            : "Chọn file backup"}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 p-2 text-xs font-black text-slate-100 transition hover:bg-slate-700"
                        onClick={() => void handleUploadJsonGzipToBlob()}
                        title="Upload JSON.GZ lên Blob"
                      >
                        <FiUploadCloud
                          aria-hidden="true"
                          className={iconClassName}
                        />
                        <span>Upload Blob</span>
                      </button>
                    </div>
                  </article>

                  <article className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-2 xl:col-span-2">
                    <div className="grid grid-cols-1 items-center gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div>
                        <h3 className="text-xs font-black text-white">
                          Xóa dữ liệu local
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-rose-100/75">
                          Xóa toàn bộ sản phẩm, ảnh và dữ liệu ứng dụng đang lưu trong trình duyệt.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-rose-300/40 bg-rose-300/10 p-2 text-xs font-black text-rose-100 transition hover:bg-rose-300/20 active:opacity-80"
                        onClick={handleClearAllLocalData}
                        title="Xóa toàn bộ dữ liệu local"
                      >
                        <FiTrash2
                          aria-hidden="true"
                          className={iconClassName}
                        />
                        <span>Xóa toàn bộ dữ liệu</span>
                      </button>
                    </div>
                  </article>
                </section>
              ) : null}

              {activeModal === "slotDetail" ? (
                selectedAssignedSlot ? (
                  <section className="grid grid-cols-1 gap-2 xl:grid-cols-[360px_1fr]">
                    <article className="rounded-md border border-white/10 bg-slate-950/70 p-2">
                      <button
                        type="button"
                        className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-slate-900"
                        onClick={() =>
                          openImageAlbum({
                            title: selectedAssignedSlot.product.name,
                            description: selectedAssignedSlot.description,
                            priceText: selectedAssignedSlot.product.priceText,
                            images: selectedAssignedSlot.product.images,
                            internalImages:
                              selectedAssignedSlot.product.internalImages,
                          })
                        }
                      >
                        {selectedAssignedSlot.product.images[0] ? (<img
                          src={selectedAssignedSlot.product.images[0].dataUrl}
                          alt={selectedAssignedSlot.product.name}
                          width={1200}
                          height={1200}
                          className="h-full w-full object-contain"
                        />
                        ) : (
                          <FiImage
                            aria-hidden="true"
                            className={`${iconClassName} text-slate-600`}
                          />
                        )}
                      </button>

                      {selectedAssignedSlot.product.images.length > 1 ? (
                        <div className="mt-2 grid grid-cols-5 gap-2">
                          {selectedAssignedSlot.product.images
                            .slice(0, 10)
                            .map((image) => (
                              <button
                                key={image.id}
                                type="button"
                                className="aspect-square overflow-hidden rounded-md bg-slate-900   transition "
                                onClick={() =>
                                  openImageAlbum({
                                    title: selectedAssignedSlot.product.name,
                                    description:
                                      selectedAssignedSlot.description,
                                    priceText: selectedAssignedSlot.product.priceText,
                                    images: selectedAssignedSlot.product.images,
                                    internalImages:
                                      selectedAssignedSlot.product.internalImages,
                                  })
                                }
                              > <img
                                  src={image.dataUrl}
                                  alt={image.name}
                                  width={1200}
                                  height={1200}
                                  className="h-full w-full object-contain"
                                />
                              </button>
                            ))}
                        </div>
                      ) : null}

                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className={`flex items-center justify-center gap-2 rounded-md p-1.5 text-[10px] font-black transition ${selectedAssignedSlot.done
                            ? "bg-emerald-300 text-slate-950 hover:bg-emerald-200"
                            : "border border-white/10 bg-slate-800 text-white hover:bg-slate-700"
                            }`}
                          onClick={() =>
                            togglePostedSlot(
                              selectedAssignedSlot.date,
                              selectedAssignedSlot.slotIndex,
                              selectedAssignedSlot.taskIndex,
                            )
                          }
                        >
                          <FiCheck
                            aria-hidden="true"
                            className={iconClassName}
                          />
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-slate-800 p-2 whitespace-nowrap text-xs font-bold text-white transition hover:bg-slate-700"
                          onClick={() =>
                            handleDownloadProductImages(
                              selectedAssignedSlot.product,
                            )
                          }
                        >
                          <FiDownload
                            aria-hidden="true"
                            className={iconClassName}
                          />
                        </button>
                      </div>
                    </article>

                    <article className="rounded-md border border-white/10 bg-slate-950/70 p-2">
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <div className="">
                          <div className="inline-flex rounded-md bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">
                            {selectedAssignedSlot.date} ·{" "}
                            {selectedAssignedSlot.time} ·{" "}
                            {selectedAssignedSlot.taskName} · Bài{" "}
                            {selectedAssignedSlot.slotIndex + 1}
                          </div>
                          <h3 className="mt-2 text-sm font-black text-white">
                            {selectedAssignedSlot.product.name}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            {selectedAssignedSlot.product.category ||
                              "Chưa có danh mục"}
                          </p>
                          <p className="mt-1 text-xs font-black text-cyan-200">
                            {selectedAssignedSlot.product.priceText ||
                              "Chưa có giá"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-slate-800 p-2 whitespace-nowrap text-xs font-bold text-white transition hover:bg-slate-700"
                          onClick={() =>
                            void handleCopyField(
                              `slot-name-${selectedAssignedSlot.key}`,
                              "tên sản phẩm",
                              selectedAssignedSlot.product.name,
                            )
                          }
                        >
                          {renderCopyIcon(
                            `slot-name-${selectedAssignedSlot.key}`,
                          )}
                          Copy tên
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-slate-800 p-2 whitespace-nowrap text-xs font-bold text-white transition hover:bg-slate-700"
                          onClick={() =>
                            void handleCopyField(
                              `slot-post-${selectedAssignedSlot.key}`,
                              "bài viết",
                              selectedAssignedSlot.postText,
                            )
                          }
                        >
                          {renderCopyIcon(
                            `slot-post-${selectedAssignedSlot.key}`,
                          )}
                          Copy bài
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-md bg-cyan-300 p-2 whitespace-nowrap text-xs font-black text-slate-950 transition hover:bg-cyan-200"
                          onClick={() =>
                            void handleCopyField(
                              `slot-desc-${selectedAssignedSlot.key}`,
                              "mô tả",
                              selectedAssignedSlot.description,
                            )
                          }
                        >
                          {renderCopyIcon(
                            `slot-desc-${selectedAssignedSlot.key}`,
                          )}
                          Copy mô tả
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-slate-800 p-2 whitespace-nowrap text-xs font-bold text-white transition hover:bg-slate-700"
                          onClick={() =>
                            handleEdit(selectedAssignedSlot.product)
                          }
                        >
                          <FiEdit3
                            aria-hidden="true"
                            className={iconClassName}
                          />
                        </button>
                      </div>

                      <pre className="mt-2 max-h-[50dvh] overflow-y-auto whitespace-pre-wrap rounded-md border border-white/10 bg-slate-950 p-2 text-xs leading-6 text-slate-200">
                        {selectedAssignedSlot.postText ||
                          "Chưa có nội dung bài viết"}
                      </pre>
                    </article>
                  </section>
                ) : (
                  <div className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-center text-xs text-slate-400">
                    Chưa tìm thấy bài đã xếp trong lịch.
                  </div>
                )
              ) : null}

              {activeModal === "imageAlbum" && albumSource ? (
                <section className="grid h-full min-h-0  grid-rows-[minmax(0,1fr)_minmax(170px,30dvh)] gap-2 overflow-hidden md:grid-rows-[minmax(0,1fr)_minmax(190px,28dvh)] xl:grid-cols-[minmax(0,1fr)_310px] xl:grid-rows-1">
                  <article className="flex min-h-0  flex-col overflow-hidden rounded-md border border-white/10 bg-slate-900 p-2 ">
                    <div className="mb-2 grid  grid-cols-1 gap-2 rounded-md border border-white/10 bg-slate-900 p-2   xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                      <div className=" rounded-md bg-black/20 px-2 py-1">
                        <h3 className="truncate whitespace-nowrap text-xs font-black text-white">
                          {albumSource.title}
                        </h3>
                        <p className="truncate whitespace-nowrap text-[10px] text-slate-400">
                          {albumSource.images.length} ảnh trong album · đang xem{" "}
                          {selectedAlbumImage
                            ? albumSource.images.findIndex(
                              (image) => image.id === selectedAlbumImage.id,
                            ) + 1
                            : 0}
                          /{albumSource.images.length} · đã chọn{" "}
                          {selectedAlbumImageIds.size}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1 overflow-x-auto pb-1 xl:justify-end xl:overflow-visible xl:pb-0">
                        <button
                          type="button"
                          data-luxury-accent="indigo"
                          className={albumActionButtonBaseClassName}
                          onClick={() =>
                            void handleCopyField(
                              `album-post-${albumSource.title}`,
                              "post",
                              composeCopyText(
                                albumSource.description,
                                activeContactText,
                                settings.includeSocialTags,
                              ),
                            )
                          }
                        >
                          {renderCopyIcon(`album-post-${albumSource.title}`)}
                          Post
                        </button>

                        <button
                          type="button"
                          data-luxury-accent="sapphire"
                          className={albumActionButtonBaseClassName}
                          onClick={() => void handleShareSelectedAlbumImages()}
                          title="Chia sẻ ảnh đã chọn"
                          aria-label="Chia sẻ ảnh đã chọn"
                          disabled={selectedAlbumImageIds.size === 0}
                        >
                          {copiedKey === "album-share-selected" ? (
                            <FiCheck
                              aria-hidden="true"
                              className={iconClassName}
                            />
                          ) : (
                            <FiShare2
                              aria-hidden="true"
                              className={iconClassName}
                            />
                          )}
                          Chia sẻ {selectedAlbumImageIds.size}
                        </button>

                        <button
                          type="button"
                          data-luxury-accent="emerald"
                          className={albumActionButtonBaseClassName}
                          onClick={handleDownloadSelectedAlbumImages}
                          title="Tải ảnh đã chọn"
                          aria-label="Tải ảnh đã chọn"
                        >
                          <FiDownload
                            aria-hidden="true"
                            className={iconClassName}
                          />
                          Tải đã chọn {selectedAlbumImageIds.size}
                        </button>

                        <button
                          type="button"
                          data-luxury-accent="gold"
                          className={albumActionButtonBaseClassName}
                          onClick={handleSelectAllAlbumImages}
                          title="Chọn tất cả ảnh"
                          aria-label="Chọn tất cả ảnh"
                        >
                          <FiCheckCircle
                            aria-hidden="true"
                            className={iconClassName}
                          />
                          Tất cả
                        </button>

                        <button
                          type="button"
                          data-luxury-accent="rose"
                          className={albumActionButtonBaseClassName}
                          onClick={handleClearSelectedAlbumImages}
                          title="Bỏ chọn ảnh"
                          aria-label="Bỏ chọn ảnh"
                        >
                          <FiX
                            aria-hidden="true"
                            className={iconClassName}
                          />
                          Bỏ
                        </button>

                        <button
                          type="button"
                          data-luxury-accent="amber"
                          className={albumActionButtonBaseClassName}
                          onClick={handleDownloadAlbumImages}
                          title="Tải toàn bộ album"
                          aria-label="Tải toàn bộ album"
                        >
                          <FiArchive
                            aria-hidden="true"
                            className={iconClassName}
                          />
                          Tải toàn bộ
                        </button>
                      </div>
                    </div>

                    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black/35 p-2  ">
                      {selectedAlbumImage ? (
                        <div className="flex h-full min-h-0 w-full  items-center justify-center overflow-hidden">
                          <img
                            src={selectedAlbumImage.dataUrl}
                            alt={selectedAlbumImage.name}
                            width={1600}
                            height={1600}
                            className="block h-auto max-h-full w-auto max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <FiImage
                          aria-hidden="true"
                          className={`${iconClassName} text-slate-600`}
                        />
                      )}
                    </div>
                  </article>

                  <aside className="flex min-h-0  flex-col overflow-hidden rounded-md border border-white/10 bg-slate-900 p-2 ">
                    <div className="mb-2 flex items-center justify-between gap-2 rounded-md border border-white/10 bg-black/25 px-2 py-1.5">
                      <h3 className="text-xs font-black text-white">
                        Tất cả ảnh
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400">
                        {selectedAlbumImage
                          ? `${albumSource.images.findIndex((image) => image.id === selectedAlbumImage.id) + 1}/${albumSource.images.length}`
                          : `0/${albumSource.images.length}`}
                      </span>
                    </div>

                    <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-3 content-start gap-2 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-2">
                      {albumSource.images.map((image, index) => {
                        const active = image.id === selectedAlbumImage?.id;
                        const checked = selectedAlbumImageIds.has(image.id);

                        return (
                          <button
                            key={image.id}
                            type="button"
                            className={`group relative aspect-square w-full shrink-0 overflow-hidden rounded-md bg-slate-900 transition active:opacity-80 ${checked
                              ? " "
                              : active
                                ? " "
                                : " "
                              }`}
                            onClick={() => toggleSelectedAlbumImage(image.id)}
                            title={`Ảnh ${index + 1}`}
                          >
                            <img
                              src={image.dataUrl}
                              alt={image.name}
                              width={1200}
                              height={1200}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <span
                              className={`absolute left-1 top-1 rounded-md px-1.5 py-0.5 text-[10px] font-black ${active
                                ? "bg-amber-200 text-slate-950"
                                : "bg-black/70 text-white"
                                }`}
                            >
                              {index + 1}
                            </span>

                            {checked ? (
                              <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-emerald-300 text-slate-950  ">
                                <FiCheck
                                  aria-hidden="true"
                                  className="h-3.5 w-3.5"
                                />
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </aside>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {pendingBlobUpload ? (
        <div className="luxury-modal-overlay fixed inset-0 z-modal-top flex h-dvh w-full items-center justify-center p-2">
          <form
            className="luxury-dialog w-full max-w-md border p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void executeBlobUploadConfirm();
            }}
          >
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
              <div className="">
                <h3 className="text-xs font-black text-white">
                  {pendingBlobUpload.title}
                </h3>
                {pendingBlobUpload.description ? (
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {pendingBlobUpload.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-slate-800 text-slate-200  transition hover:bg-slate-700 active:opacity-80"
                onClick={closeBlobUploadConfirm}
              >
                <FiX aria-hidden="true" className={iconClassName} />
              </button>
            </div>

            <label
              htmlFor="blob-upload-password"
              className="mt-2 block text-xs font-black uppercase tracking-[0.2em] text-emerald-100/80"
            >
              Mật khẩu
            </label>
            <input
              id="blob-upload-password"
              type="password"
              value={blobUploadPassword}
              onChange={(event) => setBlobUploadPassword(event.target.value)}
              // autoFocus
              className="mt-2 w-full rounded-md border border-emerald-300/20 bg-slate-900/80 p-2 text-xs font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50"
              placeholder="Nhập mật khẩu"
            />

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-md border border-white/10 bg-slate-800 p-2 text-xs font-bold text-white transition hover:bg-slate-700"
                onClick={closeBlobUploadConfirm}
              >
                {pendingBlobUpload.cancelLabel ?? "Hủy"}
              </button>

              <button
                type="submit"
                className="rounded-md bg-emerald-300 p-2 text-xs font-black text-slate-950 transition hover:bg-emerald-200"
              >
                {pendingBlobUpload.confirmLabel}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {pendingConfirm ? (
        <div className="luxury-modal-overlay fixed inset-0 z-modal-top flex h-dvh w-full items-center justify-center p-2">
          <div className="luxury-dialog w-full max-w-md border p-3">
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
              <div className="">
                <h3 className="text-xs font-black text-white">
                  {pendingConfirm.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {pendingConfirm.description}
                </p>
              </div>
              <button
                type="button"
                disabled={isConfirmExecuting}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-slate-800 text-slate-200 transition hover:bg-slate-700 active:opacity-80 disabled:cursor-wait disabled:opacity-50"
                onClick={closeConfirm}
              >
                <FiX aria-hidden="true" className={iconClassName} />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isConfirmExecuting}
                className="rounded-md border border-white/10 bg-slate-800 p-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-50"
                onClick={closeConfirm}
              >
                {pendingConfirm.cancelLabel ?? "Hủy"}
              </button>

              <button
                type="button"
                disabled={isConfirmExecuting}
                className={`rounded-md p-2 text-xs font-black transition disabled:cursor-wait disabled:opacity-60 ${pendingConfirm.tone === "danger"
                  ? "bg-rose-500 text-white hover:bg-rose-400"
                  : pendingConfirm.tone === "warning"
                    ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
                    : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  }`}
                onClick={() => void executeConfirm()}
              >
                {isConfirmExecuting
                  ? "Đang xử lý..."
                  : pendingConfirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {pendingBackup ? (
        <div className="luxury-modal-overlay fixed inset-0 z-[999999] flex h-dvh w-full items-center justify-center p-2">
          <div className="luxury-dialog w-full max-w-md border p-3">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div className="">
                <h3 className="text-sm font-black text-white">
                  File {pendingBackup.label} đã sẵn sàng
                </h3>
                <p className="mt-2 break-all text-xs leading-5 text-slate-400">
                  {pendingBackup.filename}
                </p>
                <p className="mt-1 text-xs font-bold text-cyan-100">
                  Dung lượng: {formatFileSize(pendingBackup.blob.size)}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Trên iPhone, nhấn Lưu file rồi chọn Lưu vào Tệp trong bảng chia sẻ.
                </p>
              </div>

              <button
                type="button"
                disabled={isBackupSaving}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-slate-800 text-slate-200 transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-50"
                onClick={() => setPendingBackup(null)}
                aria-label="Đóng file backup"
              >
                <FiX aria-hidden="true" className={iconClassName} />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isBackupSaving}
                className="rounded-md border border-white/10 bg-slate-800 p-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-50"
                onClick={() => setPendingBackup(null)}
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={isBackupSaving}
                className="rounded-md bg-cyan-300 p-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"
                onClick={() => void handleSavePreparedBackup()}
              >
                {isBackupSaving ? "Đang mở..." : "Lưu file"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingRemoveTaskIndex !== null ? (
        <div className="luxury-modal-overlay fixed inset-0 z-modal-top flex h-dvh w-full items-center justify-center p-2">
          <div className="luxury-dialog w-full max-w-md border p-3">
            <h3 className="text-xs font-black text-white">Xoá task đã chọn?</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Thao tác này chỉ xoá{" "}
              {getTaskName(scheduleConfig, pendingRemoveTaskIndex)} và dồn các
              task phía sau lên đúng thứ tự.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-md border border-white/10 bg-slate-800 p-2 text-xs font-black text-white transition hover:bg-slate-700"
                onClick={() => setPendingRemoveTaskIndex(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="rounded-md bg-rose-500 p-2 text-xs font-black text-white transition hover:bg-rose-400"
                onClick={() => removeScheduleTask(pendingRemoveTaskIndex)}
              >
                Xoá task
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingShare ? (
        <div className="luxury-modal-overlay fixed inset-0 z-modal-top flex h-dvh w-full items-center justify-center p-2">
          <div className="luxury-dialog w-full max-w-md border p-3">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div className="min-w-0">
                <h2 className="truncate text-xs font-black text-white">
                  {shareDialogStep === "facebookGroup"
                    ? "Chọn nội dung copy cho Group FB"
                    : "Chọn nội dung chia sẻ"}
                </h2>
                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                  {shareDialogStep === "facebookGroup"
                    ? "Nội dung được copy vào clipboard, bảng chia sẻ chỉ gửi hình ảnh."
                    : `${pendingShare.title} · ${pendingShare.images.length + (includeInternalShareImages ? (pendingShare.internalImages?.length ?? 0) : 0)} ảnh`}
                </p>
              </div>

              <button
                type="button"
                disabled={isShareExecuting}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-slate-800 text-slate-200 transition hover:bg-slate-700 active:opacity-80 disabled:cursor-wait disabled:opacity-50"
                onClick={() => {
                  setPendingShare(null);
                  setIncludeInternalShareImages(false);
                  setShareDialogStep("share");
                }}
                aria-label="Đóng chọn nội dung chia sẻ"
              >
                <FiX aria-hidden="true" className={iconClassName} />
              </button>
            </div>

            {(pendingShare.internalImages?.length ?? 0) > 0 ? (
              <button
                type="button"
                disabled={isShareExecuting}
                aria-pressed={includeInternalShareImages}
                className={`mt-2 flex w-full items-center justify-between gap-3 border p-2.5 text-left transition active:opacity-80 disabled:cursor-wait disabled:opacity-50 ${includeInternalShareImages
                  ? "border-amber-200/60 bg-amber-300/15 text-amber-50"
                  : "border-white/10 bg-slate-900/80 text-slate-200 hover:border-amber-300/30"
                  }`}
                onClick={() =>
                  setIncludeInternalShareImages((current) => !current)
                }
              >
                <span className="min-w-0">
                  <span className="block text-xs font-black">
                    Gửi ảnh nội bộ
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-4 text-slate-400">
                    Model, dung lượng pin và thông tin kiểm tra máy
                  </span>
                </span>
                <span
                  className={`shrink-0 px-2 py-1 text-[10px] font-black ${includeInternalShareImages
                    ? "bg-amber-200 text-slate-950"
                    : "bg-slate-800 text-slate-400"
                    }`}
                >
                  {includeInternalShareImages ? "Gửi kèm" : "Không gửi"}
                </span>
              </button>
            ) : null}

            {shareDialogStep === "facebookGroup" ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isShareExecuting}
                  className="rounded-md border border-cyan-300/40 bg-cyan-300/10 p-3 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/20 active:opacity-80 disabled:cursor-wait disabled:opacity-50"
                  onClick={() => void executeShareRequest("post", true)}
                >
                  Copy Post
                </button>
                <button
                  type="button"
                  disabled={isShareExecuting}
                  className="rounded-md border border-amber-300/40 bg-amber-300/10 p-3 text-xs font-black text-amber-100 transition hover:bg-amber-300/20 active:opacity-80 disabled:cursor-wait disabled:opacity-50"
                  onClick={() => void executeShareRequest("comment", true)}
                >
                  Copy Cmt
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isShareExecuting}
                  className="rounded-md border border-cyan-300/40 bg-cyan-300/10 p-3 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/20 active:opacity-80 disabled:cursor-wait disabled:opacity-50"
                  onClick={() => void executeShareRequest("post")}
                >
                  Post
                </button>
                <button
                  type="button"
                  disabled={isShareExecuting}
                  className="rounded-md border border-amber-300/40 bg-amber-300/10 p-3 text-xs font-black text-amber-100 transition hover:bg-amber-300/20 active:opacity-80 disabled:cursor-wait disabled:opacity-50"
                  onClick={() => void executeShareRequest("comment")}
                >
                  Cmt
                </button>
                <button
                  type="button"
                  disabled={isShareExecuting}
                  className="rounded-md border border-white/10 bg-slate-800 p-3 text-xs font-black text-white transition hover:bg-slate-700 active:opacity-80 disabled:cursor-wait disabled:opacity-50"
                  onClick={() => void executeShareRequest("imagesOnly")}
                >
                  Chỉ hình ảnh
                </button>
                <button
                  type="button"
                  disabled={isShareExecuting}
                  className="rounded-md border border-violet-300/30 bg-violet-300/10 p-3 text-[9px] font-black text-violet-100 transition hover:bg-violet-300/20 active:opacity-80 disabled:cursor-wait disabled:opacity-50"
                  onClick={() => setShareDialogStep("facebookGroup")}
                >
                  Gruop FB(Dành cho iPhone)
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {pendingDownload ? (
        <div className="luxury-modal-overlay fixed inset-0 z-modal-top flex h-dvh w-full items-center justify-center p-2">
          <div className="flex h-[90dvh] w-full items-center justify-center bg-transparent p-2">
            <div className="luxury-dialog w-full max-w-md border p-3">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="">
                  <h2 className="truncate text-xs font-black text-white">
                    {pendingDownload.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {pendingDownload.description}
                  </p>
                  <p className="mt-1 text-[10px] font-black text-amber-100">
                    {getDownloadImages(pendingDownload).length} ảnh sẽ được tải
                  </p>
                </div>

                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-slate-800 text-slate-200  transition hover:bg-slate-700 active:opacity-80"
                  onClick={() => {
                    setPendingDownload(null);
                    setSkipInternalDownloadImages(false);
                  }}
                >
                  <FiX aria-hidden="true" className={iconClassName} />
                </button>
              </div>

              {(pendingDownload.internalImages?.length ?? 0) > 0 ? (
                <button
                  type="button"
                  aria-pressed={skipInternalDownloadImages}
                  className={`mt-2 flex w-full items-center justify-between gap-3 border p-2.5 text-left transition active:opacity-80 ${skipInternalDownloadImages
                    ? "border-rose-300/45 bg-rose-300/10 text-rose-50"
                    : "border-amber-300/35 bg-amber-300/[0.07] text-amber-50"
                    }`}
                  onClick={() =>
                    setSkipInternalDownloadImages((current) => !current)
                  }
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-black">
                      Bỏ qua ảnh nội bộ
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-4 text-slate-400">
                      Mặc định tải toàn bộ ảnh chính và ảnh nội bộ
                    </span>
                  </span>
                  <span
                    className={`relative h-5 w-9 shrink-0 border transition ${skipInternalDownloadImages
                      ? "border-rose-200/70 bg-rose-300/40"
                      : "border-amber-200/50 bg-slate-800"
                      }`}
                    aria-hidden="true"
                  >
                    <span
                      className={`absolute top-0.5 h-3.5 w-3.5 bg-white transition-transform ${skipInternalDownloadImages
                        ? "translate-x-[17px]"
                        : "translate-x-0.5"
                        }`}
                    />
                  </span>
                </button>
              ) : null}

              <div className="mt-2 grid grid-cols-1 gap-2">
                {canUseDirectoryPicker() ? (
                  <button
                    type="button"
                    disabled={getDownloadImages(pendingDownload).length === 0}
                    className="rounded-md bg-cyan-300 p-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => void executeDownloadToFolder()}
                  >
                    Chọn thư mục & lưu ảnh
                  </button>
                ) : null}

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    className="rounded-md border border-white/10 bg-slate-800 p-2 text-xs font-bold text-white transition hover:bg-slate-700"
                    onClick={() => {
                      setPendingDownload(null);
                      setSkipInternalDownloadImages(false);
                    }}
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    disabled={getDownloadImages(pendingDownload).length === 0}
                    className="rounded-md bg-cyan-300 p-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => void executeDownloadRequest()}
                  >
                    Tải
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );

  if (!pictureInPictureWindow || pictureInPictureWindow.closed) {
    return localProductsWorkspace;
  }

  return (
    <>
      <main className="flex min-h-dvh w-full items-center justify-center bg-[radial-gradient(circle_at_50%_0,rgba(230,207,139,0.15),transparent_34%),linear-gradient(rgba(230,207,139,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(230,207,139,0.025)_1px,transparent_1px),linear-gradient(145deg,#050a11,#0a1520)] bg-[length:auto,32px_32px,32px_32px,auto] p-4 text-slate-100">
        <section className="w-full max-w-md border border-[#e6cf8b]/35 bg-[linear-gradient(145deg,rgba(14,29,43,0.99),rgba(4,10,17,0.998))] p-5 text-center shadow-[inset_3px_0_0_rgba(230,207,139,0.16),0_32px_90px_rgba(0,0,0,0.6)] [clip-path:polygon(12px_0,calc(100%_-_5px)_0,100%_5px,100%_calc(100%_-_12px),calc(100%_-_12px)_100%,5px_100%,0_calc(100%_-_5px),0_12px)]">
          <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#f5e9c7]/75 bg-[linear-gradient(135deg,#f5e9c7,#d6ba6b)] text-[#17130a] shadow-[0_0_22px_rgba(230,207,139,0.24),0_12px_32px_rgba(0,0,0,0.28)] [clip-path:polygon(8px_0,100%_0,100%_calc(100%_-_8px),calc(100%_-_8px)_100%,0_100%,0_8px)]">
            <FiMonitor aria-hidden="true" className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-sm font-black text-white">
            Local Product Manager đang mở dạng cửa sổ nổi
          </h1>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Chuyển sang Facebook để tiếp tục thao tác trong cửa sổ nổi.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="border border-[#f5e9c7]/80 bg-[linear-gradient(135deg,#f5e9c7,#d6ba6b)] px-3 py-2 text-xs font-black text-[#17130a] shadow-[0_8px_24px_rgba(230,207,139,0.18)] transition hover:brightness-105 active:opacity-80 [clip-path:polygon(7px_0,calc(100%_-_7px)_0,100%_7px,100%_calc(100%_-_7px),calc(100%_-_7px)_100%,7px_100%,0_calc(100%_-_7px),0_7px)]"
              onClick={handleFocusPictureInPicture}
            >
              Hiện cửa sổ nổi
            </button>
            <button
              type="button"
              className="border border-[#e6cf8b]/30 bg-[#0b1824] px-3 py-2 text-xs font-black text-slate-200 transition hover:border-[#e6cf8b]/55 hover:bg-[#102536] hover:text-[#f1e5c2] active:opacity-80 [clip-path:polygon(7px_0,calc(100%_-_7px)_0,100%_7px,100%_calc(100%_-_7px),calc(100%_-_7px)_100%,7px_100%,0_calc(100%_-_7px),0_7px)]"
              onClick={handleClosePictureInPicture}
            >
              Đóng và trở lại tab
            </button>
          </div>
        </section>
      </main>

      {createPortal(
        localProductsWorkspace,
        pictureInPictureWindow.document.body,
      )}
    </>
  );
}