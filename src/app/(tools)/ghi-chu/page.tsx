"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  FiArchive,
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
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiShare2,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import LoadingSpinner from "@/components/orther/loading/LoadingSpinner";
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
  price: number;
  priceText: string;
  category: string;
  images: ProductImage[];
  isDone: boolean;
  doneAt: string;
  createdAt: string;
  updatedAt: string;
};

type ProductDraft = {
  name: string;
  description: string;
  priceText: string;
  category: string;
  images: ProductImage[];
};

type GlobalSettings = {
  commonDescription: string;
  globalNote: string;
  updatedAt: string;
};

type ExportPayload = {
  version: 4;
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
};

type ModalName =
  | "product"
  | "productList"
  | "schedule"
  | "globalNote"
  | "globalDescription"
  | "importExport"
  | "slotDetail"
  | "imageAlbum"
  | "";

type CategoryTab = "all" | string;

type DownloadMode = "single" | "multiple";

type DownloadRequest = {
  title: string;
  description: string;
  mode: DownloadMode;
  images: ProductImage[];
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
  priceText: "",
  category: "",
  images: [],
};

const defaultSettings: GlobalSettings = {
  commonDescription: "",
  globalNote: "",
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

const BLOB_BACKUP_PATHNAME = "local-products/backups/local-products-current.json.gz";

const iconClassName = "h-3.5 w-3.5 shrink-0";

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
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
      reject(new Error("Không thể mở IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
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

const getAllProductsFromDb = async (): Promise<LocalProduct[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error("Không thể đọc danh sách sản phẩm"));
    };

    request.onsuccess = () => {
      const rawProducts = request.result as unknown[];
      const products = normalizeProductsArray(rawProducts);

      resolve(products);
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
};

const saveProductToDb = async (product: LocalProduct): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(product);

    request.onerror = () => {
      reject(new Error("Không thể lưu sản phẩm"));
    };

    request.onsuccess = () => {
      resolve();
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
};

const deleteProductFromDb = async (id: string): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => {
      reject(new Error("Không thể xóa sản phẩm"));
    };

    request.onsuccess = () => {
      resolve();
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
};

const clearProductsDb = async (): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => {
      reject(new Error("Không thể xóa dữ liệu cũ"));
    };

    request.onsuccess = () => {
      resolve();
    };

    transaction.oncomplete = () => {
      database.close();
    };
  });
};

const loadGlobalSettings = (): GlobalSettings => {
  if (typeof window === "undefined") return defaultSettings;

  const raw = localStorage.getItem(SETTINGS_KEY);

  if (!raw) return defaultSettings;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) return defaultSettings;

    const record = parsed as Record<string, unknown>;

    return {
      commonDescription:
        typeof record.commonDescription === "string"
          ? record.commonDescription
          : "",
      globalNote:
        typeof record.globalNote === "string" ? record.globalNote : "",
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
  const category = typeof record.category === "string" ? record.category : "";
  const isDone =
    typeof record.isDone === "boolean"
      ? record.isDone
      : hasDoneProductPrefix(record.name);

  return {
    id: record.id,
    name: normalizeDoneProductName(record.name, isDone),
    description,
    price:
      typeof record.price === "number"
        ? record.price
        : parsePriceNumber(priceText),
    priceText,
    category,
    images: normalizeImages(record.images),
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

  return {
    commonDescription:
      typeof record.commonDescription === "string"
        ? record.commonDescription
        : "",
    globalNote: typeof record.globalNote === "string" ? record.globalNote : "",
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

const copyText = async (value: string): Promise<void> => {
  await navigator.clipboard.writeText(value);
};

const buildPostText = (
  product: LocalProduct,
  commonDescription: string,
): string => {
  const description = product.description.trim() || commonDescription.trim();

  const lines = [
    product.name,
    product.priceText ? `Giá: ${product.priceText}` : "",
    product.category ? `Danh mục: ${product.category}` : "",
    description,
  ].filter(Boolean);

  return lines.join("\n");
};

const buildShareContentText = (
  title: string,
  description: string,
  priceText: string,
): string => {
  const cleanTitle = title.trim();
  const plusLines = description
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("+"));
  const cleanPrice = priceText
    .trim()
    .replace(/^📌?\s*giá\s*:\s*/iu, "")
    .trim();

  return [
    cleanTitle,
    plusLines.length > 0 ? plusLines.join("\n") : "",
    cleanPrice ? `📌Giá: ${cleanPrice}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
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

  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    throw new Error("Trình duyệt chưa hỗ trợ copy ảnh vào clipboard");
  }

  const pngBlob = await dataUrlToPngBlob(image.dataUrl);

  await navigator.clipboard.write([
    new ClipboardItem({
      "image/png": pngBlob,
    }),
  ]);
};

const downloadDataUrl = (dataUrl: string, filename: string): void => {
  const link = document.createElement("a");

  link.href = dataUrl;
  link.download = filename;

  document.body.appendChild(link);
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
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

const createExportPayload = (params: {
  settings: GlobalSettings;
  products: LocalProduct[];
  scheduleConfig: ScheduleConfig;
  scheduleAssignments: ScheduleAssignmentMap;
  postedRecords: PostedRecord[];
}): ExportPayload => {
  return {
    version: 4,
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
  await clearProductsDb();

  for (const product of payload.products) {
    await saveProductToDb(product);
  }

  if (payload.settings) {
    params.setSettings(payload.settings);
    saveGlobalSettings(payload.settings);
  }

  if (payload.scheduleConfig) {
    params.setScheduleConfig(payload.scheduleConfig);
    saveScheduleConfig(payload.scheduleConfig);
  }

  if (payload.scheduleAssignments) {
    params.setScheduleAssignments(payload.scheduleAssignments);
    saveScheduleAssignments(payload.scheduleAssignments);
  }

  if (payload.postedRecords) {
    params.setPostedRecords(payload.postedRecords);
    savePostedRecords(payload.postedRecords);
  }

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

  return (
    typeof (window as DirectoryPickerWindow).showDirectoryPicker === "function"
  );
};

const saveImagesToChosenFolder = async (
  request: DownloadRequest,
): Promise<void> => {
  const directoryPicker = (window as DirectoryPickerWindow).showDirectoryPicker;

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
      const postText = buildPostText(candidate, commonDescription);

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
  const fileImportRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [editingId, setEditingId] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [activeCategoryTab, setActiveCategoryTab] =
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
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmRequest | null>(
    null,
  );
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

  const today = useMemo(() => nowTick.toISOString().slice(0, 10), [nowTick]);
  const currentTime = useMemo(() => getCurrentTimeString(), [nowTick]);

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

  const totalImages = useMemo(() => {
    return products.reduce(
      (total, product) => total + product.images.length,
      0,
    );
  }, [products]);

  const scheduleResult = useMemo(() => {
    return buildRandomSchedule(
      products,
      scheduleConfig,
      settings.commonDescription,
    );
  }, [products, scheduleConfig, settings.commonDescription]);

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

  const nextSlot = useMemo(() => {
    return todaySlots.find(
      (slot) =>
        !postedIds.has(createSlotPostedKey(slot)) &&
        toMinutes(slot.time) >= toMinutes(currentTime),
    );
  }, [todaySlots, postedIds, currentTime]);

  const overdueSlots = useMemo(() => {
    return todaySlots.filter(
      (slot) =>
        !postedIds.has(createSlotPostedKey(slot)) &&
        toMinutes(slot.time) < toMinutes(currentTime),
    );
  }, [todaySlots, postedIds, currentTime]);

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
        return;
      }

      if (pendingConfirm) {
        pendingConfirm.onCancel?.();
        setPendingConfirm(null);
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

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal, pendingDownload, pendingConfirm, pendingBlobUpload]);

  useEffect(() => {
    if (!isSettingsReady) return;

    saveGlobalSettings({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  }, [settings.commonDescription, settings.globalNote, isSettingsReady]);

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

      return current.slice(0, -1);
    });
  };

  const closeAllModals = (): void => {
    setModalStack([]);
    setSelectedSlotId("");
    setSelectedAlbumImageId("");
    setSelectedAlbumImageIds(new Set<string>());
    setAlbumSource(null);
    setPendingConfirm(null);
    setPendingBlobUpload(null);
    setBlobUploadPassword("");
    setPendingDownload(null);
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

  const appendImagesToDraft = async (files: File[]): Promise<void> => {
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
        images: renameImagesByOrder([...images, ...current.images]),
      }));

      Toastify(`Đã thêm ${images.length} ảnh`, 200);
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

  const handlePaste = async (
    event: ClipboardEvent<HTMLElement>,
  ): Promise<void> => {
    const files = Array.from(event.clipboardData.files) as File[];
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    await appendImagesToDraft(imageFiles);
  };

  const handleDrop = async (
    event: DragEvent<HTMLLabelElement>,
  ): Promise<void> => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files) as File[];

    await appendImagesToDraft(files);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const removeDraftImage = (imageId: string): void => {
    setDraft((current) => ({
      ...current,
      images: renameImagesByOrder(
        current.images.filter((image) => image.id !== imageId),
      ),
    }));
  };

  const reorderDraftImage = (
    sourceImageId: string,
    targetImageId: string,
  ): void => {
    if (!sourceImageId || !targetImageId || sourceImageId === targetImageId)
      return;

    setDraft((current) => {
      const sourceIndex = current.images.findIndex(
        (image) => image.id === sourceImageId,
      );
      const targetIndex = current.images.findIndex(
        (image) => image.id === targetImageId,
      );

      if (sourceIndex < 0 || targetIndex < 0) return current;

      const nextImages = [...current.images];
      const [movedImage] = nextImages.splice(sourceIndex, 1);

      if (!movedImage) return current;

      nextImages.splice(targetIndex, 0, movedImage);

      return {
        ...current,
        images: renameImagesByOrder(nextImages),
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
      price: parsePriceNumber(priceText),
      priceText,
      category,
      images: draft.images,
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
      priceText: product.priceText,
      category: product.category,
      images: product.images,
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

    await copyText(value);
    setCopiedKey(key);
    Toastify(`Đã copy ${label}`, 200);

    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? "" : current));
    }, 1200);
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

      window.setTimeout(() => {
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

    await copyText(textValue);
    setCopiedKey("product-list-copy");
    Toastify(`Đã copy ${copyableProductCount} sản phẩm đang hoạt động`, 200);

    window.setTimeout(() => {
      setCopiedKey((current) =>
        current === "product-list-copy" ? "" : current,
      );
    }, 1200);
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

  const handleExportJson = (): void => {
    requestConfirm({
      title: "Export JSON?",
      description:
        "File JSON sẽ được tải về máy hiện tại. Dữ liệu local không bị thay đổi.",
      confirmLabel: "Export JSON",
      tone: "default",
      onConfirm: () => {
        const payload = createExportPayload({
          settings,
          products,
          scheduleConfig,
          scheduleAssignments,
          postedRecords,
        });

        const content = JSON.stringify(payload, null, 2);
        const blob = new Blob([content], {
          type: "application/json;charset=utf-8",
        });

        downloadBlob(blob, createBackupFileName("json"));
        Toastify("Đã export JSON", 200);
      },
    });
  };

  const handleExportJsonGzip = async (): Promise<void> => {
    requestConfirm({
      title: "Export JSON.GZ?",
      description:
        "File JSON sẽ được nén gzip rồi tải về máy hiện tại. Dữ liệu sau khi giải nén vẫn giữ nguyên.",
      confirmLabel: "Export JSON.GZ",
      tone: "default",
      onConfirm: async () => {
        try {
          const payload = createExportPayload({
            settings,
            products,
            scheduleConfig,
            scheduleAssignments,
            postedRecords,
          });

          const content = JSON.stringify(payload);
          const blob = await textToGzipBlob(content);

          downloadBlob(blob, createBackupFileName("json.gz"));
          Toastify("Đã export JSON.GZ", 200);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Không thể export JSON.GZ";

          Toastify(message, 400);
        }
      },
    });
  };

  const handleImportJson = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await readJsonOrGzipFileText(file);
      const payload = parseJsonTextToPayload(text);

      if (!payload || payload.products.length === 0) {
        Toastify("File backup không đúng cấu trúc", 400);
        event.target.value = "";
        return;
      }

      requestConfirm({
        title: isGzipFile(file)
          ? "Import dữ liệu JSON.GZ?"
          : "Import dữ liệu JSON?",
        description:
          "Import sẽ thay thế toàn bộ dữ liệu sản phẩm hiện tại trong IndexedDB. File .json.gz sẽ được tự giải nén và đọc như JSON thường.",
        confirmLabel: "Import dữ liệu",
        tone: "warning",
        onCancel: () => {
          event.target.value = "";
        },
        onConfirm: async () => {
          setPageLoadingText("Đang import dữ liệu vào local...");

          try {
            await restorePayloadToLocal(payload, {
              setSettings,
              setScheduleConfig,
              setScheduleAssignments,
              setPostedRecords,
              loadProducts,
            });

            event.target.value = "";
            closeAllModals();
            Toastify("Đã import dữ liệu vào local", 200);
          } finally {
            setPageLoadingText("");
          }
        },
      });
    } catch {
      Toastify("Không thể import file backup", 400);
    } finally {
      event.target.value = "";
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
      title: "Tải backup online về local?",
      description:
        "Hệ thống sẽ tải bản JSON.GZ mới nhất từ Vercel Blob, giải nén và thay thế toàn bộ dữ liệu hiện tại trong IndexedDB.",
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
    setPendingDownload(request);
  };

  const copyDownloadTextIfNeeded = async (
    request: DownloadRequest,
  ): Promise<void> => {
    const textToCopy = request.textToCopy?.trim();

    if (!textToCopy) return;

    try {
      await copyText(textToCopy);
      setCopiedKey("download-description");
      Toastify("Đã tự động copy mô tả sản phẩm", 200);

      window.setTimeout(() => {
        setCopiedKey((current) =>
          current === "download-description" ? "" : current,
        );
      }, 1200);
    } catch {
      Toastify("Không thể tự động copy mô tả", 300);
    }
  };

  const executeDownloadRequest = async (): Promise<void> => {
    if (!pendingDownload) return;

    const request = pendingDownload;

    await copyDownloadTextIfNeeded(request);

    request.images.forEach((image, index) => {
      window.setTimeout(() => {
        void downloadImageAsJpg(image, request.startIndex + index);
      }, index * 180);
    });

    Toastify(`Đang tải ${request.images.length} ảnh JPG`, 200);
    setPendingDownload(null);
  };

  const executeDownloadToFolder = async (): Promise<void> => {
    if (!pendingDownload) return;

    const request = pendingDownload;

    try {
      await copyDownloadTextIfNeeded(request);
      await saveImagesToChosenFolder(request);
      Toastify(`Đã lưu ${request.images.length} ảnh vào thư mục đã chọn`, 200);
      setPendingDownload(null);
    } catch {
      Toastify(
        "Trình duyệt chưa cho phép chọn thư mục hoặc thao tác đã bị hủy",
        400,
      );
    }
  };

  const handleDownloadProductImages = (product: LocalProduct): void => {
    if (product.images.length === 0) {
      Toastify("Sản phẩm chưa có ảnh để tải", 300);
      return;
    }

    const descriptionText =
      product.description.trim() || settings.commonDescription.trim();

    requestDownload({
      title: "Tải ảnh sản phẩm",
      description: `Bạn có muốn tải ${product.images.length} ảnh của sản phẩm này về máy không? Mô tả sản phẩm sẽ được tự động copy trước khi tải.`,
      mode: "multiple",
      images: product.images,
      startIndex: 0,
      textToCopy: descriptionText,
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

  const handleShareProduct = async (product: LocalProduct): Promise<void> => {
    const shareNavigator = getNativeShareNavigator();
    const shareKey = `share-product-${product.id}`;
    const descriptionText =
      product.description.trim() || settings.commonDescription.trim();
    const textValue = buildShareContentText(
      product.name,
      descriptionText,
      product.priceText,
    );

    const markShared = (): void => {
      setCopiedKey(shareKey);

      window.setTimeout(() => {
        setCopiedKey((current) => (current === shareKey ? "" : current));
      }, 1200);
    };

    try {
      if (shareNavigator?.share) {
        if (product.images.length > 0) {
          const files = await Promise.all(
            product.images.map((image, index) =>
              dataUrlToShareFile(
                image.dataUrl,
                image.name || createSystemImageFilename(index, image.id),
              ),
            ),
          );
          const shareDataWithFiles: NativeShareData = {
            title: product.name,
            text: textValue,
            files,
          };

          if (shareNavigator.canShare?.(shareDataWithFiles)) {
            await shareNavigator.share(shareDataWithFiles);
            markShared();
            Toastify("Đã mở bảng chia sẻ sản phẩm", 200);
            return;
          }
        }

        await shareNavigator.share({
          title: product.name,
          text: textValue,
        });
        markShared();
        Toastify("Thiết bị chưa hỗ trợ gửi toàn bộ ảnh, đã mở chia sẻ nội dung", 200);
        return;
      }

      await copyText(textValue);
      markShared();
      Toastify("Trình duyệt chưa hỗ trợ chia sẻ, đã copy nội dung", 200);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      try {
        await copyText(textValue);
        markShared();
        Toastify("Không thể mở chia sẻ, đã copy nội dung", 300);
      } catch {
        Toastify("Không thể chia sẻ sản phẩm", 400);
      }
    }
  };

  const handleShareSelectedAlbumImages = async (): Promise<void> => {
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

    const shareNavigator = getNativeShareNavigator();
    const shareKey = "album-share-selected";
    const textValue = buildShareContentText(
      albumSource.title,
      albumSource.description,
      albumSource.priceText,
    );

    const markShared = (): void => {
      setCopiedKey(shareKey);

      window.setTimeout(() => {
        setCopiedKey((current) => (current === shareKey ? "" : current));
      }, 1200);
    };

    try {
      if (shareNavigator?.share) {
        const files = await Promise.all(
          selectedImages.map((image, index) =>
            dataUrlToShareFile(
              image.dataUrl,
              image.name || createSystemImageFilename(index, image.id),
            ),
          ),
        );
        const shareDataWithFiles: NativeShareData = {
          title: albumSource.title,
          text: textValue,
          files,
        };

        if (shareNavigator.canShare?.(shareDataWithFiles)) {
          await shareNavigator.share(shareDataWithFiles);
          markShared();
          Toastify("Đã mở bảng chia sẻ ảnh", 200);
          return;
        }

        await shareNavigator.share({
          title: albumSource.title,
          text: textValue,
        });
        markShared();
        Toastify("Thiết bị chưa hỗ trợ gửi nhiều ảnh, đã mở chia sẻ nội dung", 200);
        return;
      }

      await copyText(textValue);
      markShared();
      Toastify("Trình duyệt chưa hỗ trợ chia sẻ, đã copy nội dung", 200);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      try {
        await copyText(textValue);
        markShared();
        Toastify("Không thể mở chia sẻ, đã copy nội dung", 300);
      } catch {
        Toastify("Không thể chia sẻ ảnh đã chọn", 400);
      }
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
      description: `Bạn có muốn tải ${selectedImages.length} ảnh đã chọn về máy không? Mô tả sản phẩm sẽ được tự động copy trước khi tải.`,
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
    if (!albumSource || albumSource.images.length === 0) {
      Toastify("Album chưa có ảnh để tải", 300);
      return;
    }

    requestDownload({
      title: "Tải toàn bộ album",
      description: `Bạn có muốn tải ${albumSource.images.length} ảnh trong album về máy không? Mô tả sản phẩm sẽ được tự động copy trước khi tải.`,
      mode: "multiple",
      images: albumSource.images,
      startIndex: 0,
      textToCopy: albumSource.description,
    });
  };

  const handleDownloadAllImages = (): void => {
    const allImages = products.flatMap((product) => product.images);

    if (allImages.length === 0) {
      Toastify("Chưa có ảnh để tải", 300);
      return;
    }

    const activeDescriptions = products
      .filter((product) => !product.isDone)
      .map((product) => {
        const description =
          product.description.trim() || settings.commonDescription.trim();

        return [product.name, description].filter(Boolean).join("\n");
      })
      .filter(Boolean)
      .join("\n\n---\n\n");

    requestDownload({
      title: "Tải toàn bộ ảnh",
      description: `Bạn có muốn tải ${allImages.length} ảnh của tất cả sản phẩm về máy không? Mô tả của các sản phẩm đang hoạt động sẽ được tự động copy trước khi tải.`,
      mode: "multiple",
      images: allImages,
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
      postText: buildPostText(product, settings.commonDescription),
      done: postedIds.has(createPostedKey(date, slotIndex, taskIndex)),
    };
  }, [
    selectedSlotId,
    scheduleTimes,
    scheduleAssignments,
    products,
    settings.commonDescription,
    scheduleConfig,
    postedIds,
  ]);

  const requestConfirm = (request: ConfirmRequest): void => {
    setPendingConfirm(request);
  };

  const closeConfirm = (): void => {
    pendingConfirm?.onCancel?.();
    setPendingConfirm(null);
  };

  const executeConfirm = async (): Promise<void> => {
    if (!pendingConfirm) return;

    const action = pendingConfirm.onConfirm;

    setPendingConfirm(null);
    await action();
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

    const selection = window.getSelection();

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
    window.getSelection()?.removeAllRanges();
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

    const lines = description.split("\n");

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
            className="block"
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
          className={`my-0.5 block w-full select-text rounded-md px-0.5 py-1 text-left transition ${copiedKey === copyKey
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

  if (pageLoadingText) {
    return (
      <main className="min-h-dvh w-full bg-[#0b1220] text-slate-100">
        <ToastContainer />
        <LoadingSpinner text={pageLoadingText} />
      </main>
    );
  }

  if (!isSettingsReady) {
    return (
      <main className="min-h-dvh w-full bg-[#0b1220] text-slate-100">
        <ToastContainer />
        <LoadingSpinner text="Đang tải dữ liệu local, vui lòng chờ..." />
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh w-full overflow-x-hidden bg-[#0b1220] p-2 text-slate-100 "
      onPaste={(event) => {
        void handlePaste(event);
      }}
    >
      <ToastContainer />

      <style>{`
 @keyframes productWaveIn {
 0% { opacity: 0; transform: translateY(18px) scale(0.985); }
 45% { opacity: 1; transform: translateY(-4px) scale(1); }
 100% { opacity: 1; transform: translateY(0) scale(1); }
 }
 .product-wave-card {
 animation: productWaveIn 460ms cubic-bezier(0.22, 1, 0.36, 1) both;
 will-change: transform, opacity;
 }
 `}</style>

      <section className="flex w-full flex-col gap-4 xl:min-h-[calc(100dvh-4rem)]">
        <header className="sticky z-30 rounded-md border border-slate-700/70 bg-slate-900/95 p-3 backdrop-blur">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-600 bg-slate-800 text-slate-100 ">
                <FiDatabase aria-hidden="true" className={iconClassName} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-sm font-black tracking-tight text-white xl:text-sm">
                  Local Product Manager
                </h1>
                <p className="truncate text-[11px] font-semibold text-slate-400">
                  {products.length} sản phẩm · {totalImages} ảnh · hôm nay{" "}
                  {postedTodayCount}/{totalTodayTaskCount} bài đã đăng
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 xl:min-w-[780px]">
              <button
                type="button"
                title="Thêm sản phẩm"
                aria-label="Thêm sản phẩm"
                className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-300 bg-slate-100 px-2 py-1.5 text-[11px] font-black text-slate-950  transition hover:bg-white active:opacity-80"
                onClick={openProductModalForCreate}
              >
                <FiPlus aria-hidden="true" className={iconClassName} />
                Thêm
              </button>

              <button
                type="button"
                title="Import Export dữ liệu"
                aria-label="Import Export dữ liệu"
                className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-amber-300/80 bg-amber-200 px-2 py-1.5 text-[11px] font-black text-amber-950  transition hover:bg-amber-100 active:opacity-80"
                onClick={() => openModal("importExport")}
              >
                <FiArchive aria-hidden="true" className={iconClassName} />
                Data
              </button>

              <button
                type="button"
                title="Bảng sản phẩm"
                aria-label="Bảng sản phẩm"
                className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5 text-[11px] font-black text-slate-100  transition hover:border-slate-400 hover:bg-slate-700 active:opacity-80"
                onClick={() => openModal("productList")}
              >
                <FiDatabase aria-hidden="true" className={iconClassName} />
                List
              </button>

              <button
                type="button"
                title="Lịch đăng"
                aria-label="Lịch đăng"
                className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5 text-[11px] font-black text-slate-100  transition hover:border-slate-400 hover:bg-slate-700 active:opacity-80"
                onClick={() => openModal("schedule")}
              >
                <FiCalendar aria-hidden="true" className={iconClassName} />
                Lịch
              </button>

              <button
                type="button"
                title="Ghi chú"
                aria-label="Ghi chú"
                className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5 text-[11px] font-black text-slate-100  transition hover:border-slate-400 hover:bg-slate-700 active:opacity-80"
                onClick={() => openModal("globalNote")}
              >
                <FiClipboard aria-hidden="true" className={iconClassName} />
                Ghi chú
              </button>

              <button
                type="button"
                title="Mô tả chung"
                aria-label="Mô tả chung"
                className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5 text-[11px] font-black text-slate-100  transition hover:border-slate-400 hover:bg-slate-700 active:opacity-80"
                onClick={() => openModal("globalDescription")}
              >
                <FiFileText aria-hidden="true" className={iconClassName} />
                Mô tả
              </button>


              <button
                type="button"
                title="Tải toàn bộ ảnh"
                aria-label="Tải toàn bộ ảnh"
                className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5 text-[11px] font-black text-slate-100  transition hover:border-slate-400 hover:bg-slate-700 active:opacity-80"
                onClick={handleDownloadAllImages}
              >
                <FiDownload aria-hidden="true" className={iconClassName} />
                Ảnh
              </button>

              <button
                type="button"
                title="Đồng bộ dữ liệu từ Vercel Blob về local"
                aria-label="Đồng bộ dữ liệu từ Vercel Blob về local"
                className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-emerald-300/80 bg-emerald-200 px-2 py-1.5 text-[11px] font-black text-emerald-950  transition hover:bg-emerald-100 active:opacity-80"
                onClick={() => void handleRestoreLatestBackupFromBlob()}
              >
                <FiRefreshCcw aria-hidden="true" className={iconClassName} />
                Đồng bộ
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-md border border-slate-700/70 bg-slate-900/70 mt-2 p-3 (0,0,0,0.22)]">
          <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto text-[11px] font-black text-slate-300">
              <span className="shrink-0 rounded-md border border-emerald-300/40 bg-emerald-950/50 px-2 py-1 text-emerald-100 ">
                {activeProductCount} đang bán
              </span>
              <span className="shrink-0 rounded-md border border-rose-300/40 bg-rose-950/45 px-2 py-1 text-rose-100 ">
                {soldProductCount} đã bán
              </span>
              <span className="shrink-0 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-slate-100 ">
                {totalImages} ảnh
              </span>
            </div>

            <label className="flex items-center gap-2 rounded-md border border-slate-600 bg-slate-950/70 px-2 py-1.5 text-slate-400 transition focus-within:border-slate-300 focus-within:bg-slate-950">
              <FiSearch
                aria-hidden="true"
                className={`${iconClassName} shrink-0`}
              />
              <input
                ref={searchInputRef}
                autoFocus
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

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              className={`shrink-0 rounded-md border px-4 py-2 text-xs font-black tracking-wide  transition ${activeCategoryTab === "all"
                ? "border-slate-200 bg-slate-100 text-slate-950"
                : "border-slate-600 bg-slate-900 text-slate-200 hover:border-slate-400 hover:bg-slate-800"
                }`}
              onClick={() => setActiveCategoryTab("all")}
            >
              Tất cả
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`shrink-0 rounded-md uppercase border px-4 py-2 text-xs font-black tracking-wide  transition ${normalizeTextKey(activeCategoryTab) ===
                  normalizeTextKey(category)
                  ? "border-slate-200 bg-slate-100 text-slate-950"
                  : "border-slate-600 bg-white/20 text-slate-200 hover:border-slate-400 hover:bg-slate-800"
                  }`}
                onClick={() => setActiveCategoryTab(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-md border border-slate-700 bg-slate-900 p-3 text-center text-xs font-semibold text-slate-400 ">
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

                return (
                  <article
                    key={`${activeCategoryTab}-${product.id}`}
                    style={{ animationDelay: `${Math.min(index * 34, 340)}ms` }}
                    className={`product-wave-card group overflow-hidden rounded-md border  transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-800 ${productDone ? "opacity-70" : ""
                      } ${active
                        ? "border-slate-200 bg-slate-800  "
                        : "border-slate-700 bg-slate-900"
                      }`}
                    onClick={() => {
                      setSelectedProductId(product.id);
                      handleEdit(product);
                    }}
                  >
                    <button
                      type="button"
                      className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-slate-900 ${productDone
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
                        });
                      }}
                    >
                      {product.images[0] ? (
                        <img
                          src={product.images[0].dataUrl}
                          alt={product.name}
                          width={1200}
                          height={1200}
                          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${productDone ? "blur-[2px] grayscale opacity-40" : ""
                            }`}
                        />
                      ) : (
                        <FiImage
                          aria-hidden="true"
                          className={`${iconClassName} text-slate-600`}
                        />
                      )}

                      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md border border-white/10 bg-black/65 px-2 py-0.5 text-[10px] font-black text-white  ">
                        <FiImage aria-hidden="true" className={iconClassName} />
                        {product.images.length}
                      </div>

                      <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                        {productDone ? (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-950">
                            DONE
                          </span>
                        ) : null}

                        {active ? (
                          <span className="rounded-md bg-slate-200 px-2 py-1 text-[10px] font-black text-slate-950">
                            ACTIVE
                          </span>
                        ) : null}
                      </div>
                    </button>

                    <div className="flex flex-col gap-2 p-2">
                      <div className="min-w-0">
                        {product.category ? (
                          <div className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
                            {product.category}
                          </div>
                        ) : null}

                        <h3 className="line-clamp-2 min-h-9 text-[12px] font-black leading-[18px] text-white">
                          {product.name}
                        </h3>
                        <div className="mt-1 truncate text-xs font-black text-amber-100">
                          {product.priceText || "Chưa có giá"}
                        </div>
                      </div>

                      <div
                        role={descriptionPreview.length > 90 ? "button" : undefined}
                        tabIndex={descriptionPreview.length > 90 ? 0 : undefined}
                        aria-expanded={descriptionPreview.length > 90 ? expanded : undefined}
                        className={`rounded-md border bg-white/10 border-white/10  p-2 ${descriptionPreview.length > 90
                          ? "cursor-pointer transition hover:border-slate-400/40 hover:bg-slate-800"
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
                          className={`${expanded ? "line-clamp-none" : "line-clamp-2"}  whitespace-pre-line text-[11px] leading-[18px] text-slate-300`}
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
                            className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-full border border-emerald-300/70 bg-emerald-300/10 px-0.5 py-1 text-[9px] font-black text-emerald-100 transition hover:bg-emerald-300/15 active:opacity-80"
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

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          title="Copy ảnh chính"
                          aria-label="Copy ảnh chính"
                          className="flex items-center justify-center gap-1 rounded-full border border-cyan-400/70 bg-cyan-400/10 px-0.5 py-1 text-[9px] font-black text-cyan-100  transition hover:bg-cyan-400/15 active:opacity-80"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleCopyProductRepresentativeImage(product);
                          }}
                        >
                          {renderCopyIcon(`cover-${product.id}`)}
                          Ảnh Chính
                        </button>

                        <button
                          type="button"
                          title="Chia sẻ sản phẩm"
                          aria-label="Chia sẻ sản phẩm"
                          className="flex items-center justify-center gap-1 rounded-full border border-cyan-400/70 bg-cyan-400/10 px-0.5 py-1 text-[9px] font-black text-cyan-100  transition hover:bg-cyan-400/15 active:opacity-80"
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
                          Chia sẻ
                        </button>

                        <button
                          type="button"
                          title="Copy nguyên bản mô tả"
                          aria-label="Copy nguyên bản mô tả"
                          className="flex items-center justify-center gap-1 rounded-full border border-slate-500/90 bg-slate-400/10 px-0.5 py-1 text-[9px] font-black text-slate-100  transition hover:border-slate-300 hover:bg-slate-400/15 active:opacity-80"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleCopyField(
                              `post-${product.id}`,
                              "post",
                              descriptionPreview,
                            );
                          }}
                        >
                          {renderCopyIcon(`post-${product.id}`)}
                          Post
                        </button>

                        <button
                          type="button"
                          title="Copy comment sản phẩm"
                          aria-label="Copy comment sản phẩm"
                          className="flex items-center justify-center gap-1 rounded-full border border-amber-300/70 bg-amber-300/10 px-0.5 py-1 text-[9px] font-black text-amber-100  transition hover:bg-amber-300/15 active:opacity-80"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleCopyField(
                              `cmt-${product.id}`,
                              "cmt",
                              buildShareContentText(
                                product.name,
                                descriptionPreview,
                                product.priceText,
                              ),
                            );
                          }}
                        >
                          {renderCopyIcon(`cmt-${product.id}`)}
                          Cmt
                        </button>

                        <button
                          type="button"
                          title="Copy tên sản phẩm"
                          aria-label="Copy tên sản phẩm"
                          className="flex items-center justify-center gap-1 rounded-full border border-slate-500/90 bg-slate-400/10 px-0.5 py-1 text-[9px] font-black text-slate-100  transition hover:border-slate-300 hover:bg-slate-400/15 active:opacity-80"
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
                          Tên
                        </button>

                        <button
                          type="button"
                          title={productDone ? "Bỏ DONE" : "Đánh dấu DONE"}
                          aria-label={productDone ? "Bỏ DONE" : "Đánh dấu DONE"}
                          className={`flex w-full items-center justify-center gap-1 rounded-full px-0.5 py-1 text-[9px] font-black transition active:opacity-80 ${productDone
                            ? "border border-slate-400/80 bg-slate-400/10 text-slate-100  hover:bg-slate-400/15"
                            : "border border-emerald-300/70 bg-emerald-300/10 text-emerald-100  hover:bg-emerald-300/15"
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
                          {productDone ? "DONE" : "Chưa bán"}
                        </button>
                        <button
                          type="button"
                          title="Tải ảnh sản phẩm"
                          aria-label="Tải ảnh sản phẩm"
                          className="flex items-center justify-center gap-1 rounded-full border border-sky-400/70 bg-sky-400/10 px-0.5 py-1 whitespace-nowrap text-[9px] font-black text-sky-100  transition hover:bg-sky-400/15 active:opacity-80"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDownloadProductImages(product);
                          }}
                        >
                          <FiDownload
                            aria-hidden="true"
                            className={iconClassName}
                          />
                          Tải ảnh
                        </button>

                        <button
                          type="button"
                          title="Xóa sản phẩm"
                          aria-label="Xóa sản phẩm"
                          className="flex items-center justify-center gap-1 rounded-full border border-rose-400/70 bg-rose-400/10 px-0.5 py-1 text-[9px] font-black text-rose-100  transition hover:bg-rose-400/15 active:opacity-80"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDelete(product.id);
                          }}
                        >
                          <FiTrash2
                            aria-hidden="true"
                            className={iconClassName}
                          />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>

      {activeModal ? (
        <div className="fixed inset-0 z-[99999] flex h-dvh w-full items-center justify-center overflow-hidden bg-black/75 p-3 xl:p-8">
          <div className="h-[calc(100dvh-1.5rem)] w-full overflow-hidden rounded-md border border-slate-700 bg-slate-950  xl:h-[calc(100dvh-4rem)]">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-slate-900 p-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-600 bg-slate-800 text-slate-100 ">
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
                  {activeModal === "importExport" ? (
                    <FiArchive aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "slotDetail" ? (
                    <FiClipboard aria-hidden="true" className={iconClassName} />
                  ) : null}
                  {activeModal === "imageAlbum" ? (
                    <FiImage aria-hidden="true" className={iconClassName} />
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
                    {activeModal === "importExport"
                      ? "Import / Export Data"
                      : null}
                    {activeModal === "slotDetail" ? "Chi tiết bài đăng" : null}
                    {activeModal === "imageAlbum" ? "Album ảnh" : null}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-slate-800 text-slate-200  transition hover:bg-slate-700 active:opacity-80"
                onClick={closeModal}
              >
                <FiX aria-hidden="true" className={iconClassName} />
              </button>
            </div>

            <div
              className={`h-[calc(92dvh-66px)] p-2 ${activeModal === "imageAlbum" || activeModal === "productList" ? "overflow-hidden" : "overflow-y-auto"}`}
            >
              {activeModal === "productList" ? (
                <section className="flex h-full flex-col gap-2">
                  <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
                    <div className="min-w-0">
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
                        autoFocus
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
                              <div className="grid grid-cols-[170px_minmax(360px,1fr)_120px_90px_140px] border-b border-cyan-400/20 bg-cyan-400/10 text-xs font-black text-cyan-100">
                                <div className="border-r border-cyan-400/20 px-2 py-2">
                                  {group.category}
                                </div>

                                <div className="border-r border-cyan-400/20 px-2 py-2">
                                  {group.products.length} sản phẩm
                                </div>

                                <div className="border-r border-cyan-400/20 px-2 py-2">
                                  {groupSoldCount} bán / {groupActiveCount} còn
                                </div>

                                <div className="border-r border-cyan-400/20 px-2 py-2" />

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
                                      className="min-w-0 border-r border-white/10 px-2 py-2 text-left transition hover:bg-slate-800"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleEdit(product);
                                      }}
                                    >
                                      <div className="flex min-w-0 items-center gap-2">
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
                  className="flex h-full min-h-0 flex-col overflow-hidden"
                  onSubmit={(event) => void handleSubmit(event)}
                >
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                    <div className="grid min-h-full grid-cols-1 gap-2 pb-24 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:pb-2">
                      <section className="order-2 flex min-h-0 flex-col gap-2 xl:order-1">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-300">
                            Tên sản phẩm
                          </span>
                          <input
                            value={draft.name}
                            onChange={(event) =>
                              updateDraftField("name", event.target.value)
                            }
                            className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                            placeholder="Dell Latitude 7440 i5 13th"
                          />
                        </label>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <label className="flex flex-col gap-1.5">
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
                              className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                              placeholder="13tr8"
                            />
                          </label>

                          <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-300">
                              Danh mục
                            </span>
                            <input
                              value={draft.category}
                              list="local-product-category-options"
                              onChange={(event) =>
                                updateDraftField("category", event.target.value)
                              }
                              className="rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                              placeholder="Laptop Dell"
                            />
                            <datalist id="local-product-category-options">
                              {categories.map((category) => (
                                <option key={category} value={category} />
                              ))}
                            </datalist>
                          </label>
                        </div>

                        <label className="flex min-h-0 flex-col gap-1.5">
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
                            className="min-h-[220px] w-full resize-y rounded-md border border-white/10 bg-slate-950/80 p-2 text-xs leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 sm:min-h-[260px] xl:min-h-[calc(90dvh-260px)] xl:resize-none"
                            placeholder="Để trống nếu muốn dùng mô tả chung..."
                          />
                        </label>
                      </section>

                      <section className="order-1 flex min-h-0 flex-col gap-2 xl:order-2">
                        <label
                          className={`cursor-pointer rounded-md border border-dashed p-2 text-center transition ${isDragging
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
                          </div>
                          <div className="mt-1 text-[11px] leading-4 text-slate-400">
                            {isProcessingImages
                              ? "Đang xử lý ảnh..."
                              : "Chọn, kéo thả hoặc paste ảnh. Hỗ trợ nhiều ảnh, tự nén JPG."}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(event) => void handleImageInput(event)}
                          />
                        </label>

                        {draft.images.length > 0 ? (
                          <div className="flex min-h-0 flex-col rounded-md border border-white/10 bg-slate-950/70 p-2">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="flex items-center gap-2 text-xs font-black text-white">
                                <FiImage
                                  aria-hidden="true"
                                  className={iconClassName}
                                />
                                {draft.images.length} ảnh
                              </span>

                              <button
                                type="button"
                                className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-800 p-2 text-xs font-bold text-slate-300 transition hover:bg-slate-700"
                                onClick={() => updateDraftField("images", [])}
                              >
                                <FiTrash2
                                  aria-hidden="true"
                                  className={iconClassName}
                                />
                              </button>
                            </div>

                            <div className="grid max-h-[260px] grid-cols-3 gap-1.5 overflow-y-auto overscroll-contain pr-1 sm:max-h-[320px] sm:grid-cols-4 md:grid-cols-5 xl:max-h-[calc(90dvh-190px)] xl:grid-cols-4 2xl:grid-cols-5">
                              {draft.images.map((image, index) => {
                                const isDraggingImage =
                                  draggingDraftImageId === image.id;

                                return (
                                  <div
                                    key={image.id}
                                    draggable
                                    className={`group relative h-[88px] cursor-grab overflow-hidden rounded-md bg-slate-900  transition active:cursor-grabbing sm:h-[96px] xl:h-[108px] ${isDraggingImage
                                      ? "scale-95 opacity-60 "
                                      : " "
                                      }`}
                                    onDragStart={(event) => {
                                      event.dataTransfer.setData(
                                        "text/plain",
                                        image.id,
                                      );
                                      setDraggingDraftImageId(image.id);
                                    }}
                                    onDragOver={(event) =>
                                      event.preventDefault()
                                    }
                                    onDrop={(event) => {
                                      event.preventDefault();
                                      const sourceImageId =
                                        event.dataTransfer.getData(
                                          "text/plain",
                                        ) || draggingDraftImageId;

                                      reorderDraftImage(
                                        sourceImageId,
                                        image.id,
                                      );
                                      setDraggingDraftImageId("");
                                    }}
                                    onDragEnd={() =>
                                      setDraggingDraftImageId("")
                                    }
                                  > <img
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
                                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-rose-500 text-xs text-white opacity-100 transition hover:bg-rose-400 xl:opacity-0 xl:group-hover:opacity-100"
                                      onClick={() => removeDraftImage(image.id)}
                                    >
                                      <FiX
                                        aria-hidden="true"
                                        className={iconClassName}
                                      />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </section>
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-white/10 bg-slate-950/95 p-2">
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
                    <section className="min-w-0 rounded-md border border-white/10 bg-slate-950/70 p-1">
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
                                className="min-w-0 flex-1 bg-transparent text-xs font-black text-white outline-none placeholder:text-slate-600"
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

                                    <div className="col-span-2 flex min-w-0 gap-1 xl:col-span-1">
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

                                      <div className="min-w-0 flex-1">
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

                    <aside className="min-w-0 rounded-md border border-white/10 bg-slate-950/70 p-1 ">
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

                                <div className="min-w-0 flex-1">
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

              {activeModal === "importExport" ? (
                <section className="grid w-full grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <article className="rounded-md border border-cyan-300/20 bg-cyan-300/10 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
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
                      <div className="min-w-0">
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

                    <input
                      ref={fileImportRef}
                      type="file"
                      accept="application/json,.json,.json.gz,.gz,application/gzip,application/x-gzip"
                      className="hidden"
                      onChange={(event) => void handleImportJson(event)}
                    />

                    <div className="mt-2 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-amber-300/40 bg-amber-300/15 p-2 text-xs font-black text-amber-50 transition hover:bg-amber-300/25"
                        onClick={() => fileImportRef.current?.click()}
                        title="Import JSON hoặc JSON.GZ"
                      >
                        <FiUploadCloud
                          aria-hidden="true"
                          className={iconClassName}
                        />
                        <span>Import file</span>
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
                        <div className="min-w-0">
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
                <section className="grid h-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_minmax(170px,30dvh)] gap-2 overflow-hidden md:grid-rows-[minmax(0,1fr)_minmax(190px,28dvh)] xl:grid-cols-[minmax(0,1fr)_310px] xl:grid-rows-1">
                  <article className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-md border border-white/10 bg-slate-900 p-2 ">
                    <div className="mb-2 grid min-w-0 grid-cols-1 gap-2 rounded-md border border-white/10 bg-slate-900 p-2   xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                      <div className="min-w-0 rounded-md bg-black/20 px-2 py-1">
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
                          className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 whitespace-nowrap text-[10px] font-black text-white  transition hover:bg-slate-700 active:opacity-80"
                          onClick={() =>
                            void handleCopyField(
                              `album-post-${albumSource.title}`,
                              "post",
                              albumSource.description,
                            )
                          }
                        >
                          {renderCopyIcon(`album-post-${albumSource.title}`)}
                          Post
                        </button>

                        <button
                          type="button"
                          className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-sky-200/50 bg-sky-300/12 px-2 py-1.5 whitespace-nowrap text-[10px] font-black text-sky-100  transition hover:bg-sky-300/20 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
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
                          className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-emerald-200/70 bg-emerald-500 px-2 py-1.5 whitespace-nowrap text-[10px] font-black text-slate-950  transition hover:bg-emerald-400 active:opacity-80"
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
                          className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 whitespace-nowrap text-[10px] font-black text-white  transition hover:bg-slate-700 active:opacity-80"
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
                          className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 whitespace-nowrap text-[10px] font-black text-white  transition hover:bg-slate-700 active:opacity-80"
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
                          className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 whitespace-nowrap text-[10px] font-black text-white  transition hover:bg-slate-700 active:opacity-80"
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
                        <div className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden">
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

                  <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-md border border-white/10 bg-slate-900 p-2 ">
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
        <div className="fixed inset-0 z-[100000] flex h-dvh w-full items-center justify-center bg-black/75 p-2 ">
          <form
            className="w-full max-w-md rounded-md border border-emerald-300/20 bg-slate-950 p-2 "
            onSubmit={(event) => {
              event.preventDefault();
              void executeBlobUploadConfirm();
            }}
          >
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
              <div className="min-w-0">
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
              autoFocus
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
        <div className="fixed inset-0 z-[100000] flex h-dvh w-full items-center justify-center bg-black/75 p-2 ">
          <div className="w-full max-w-md rounded-md border border-white/10 bg-slate-950 p-2 ">
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
              <div className="min-w-0">
                <h3 className="text-xs font-black text-white">
                  {pendingConfirm.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {pendingConfirm.description}
                </p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-slate-800 text-slate-200  transition hover:bg-slate-700 active:opacity-80"
                onClick={closeConfirm}
              >
                <FiX aria-hidden="true" className={iconClassName} />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-md border border-white/10 bg-slate-800 p-2 text-xs font-bold text-white transition hover:bg-slate-700"
                onClick={closeConfirm}
              >
                {pendingConfirm.cancelLabel ?? "Hủy"}
              </button>

              <button
                type="button"
                className={`rounded-md p-2 text-xs font-black transition ${pendingConfirm.tone === "danger"
                  ? "bg-rose-500 text-white hover:bg-rose-400"
                  : pendingConfirm.tone === "warning"
                    ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
                    : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  }`}
                onClick={() => void executeConfirm()}
              >
                {pendingConfirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {pendingRemoveTaskIndex !== null ? (
        <div className="fixed inset-0 z-[100000] flex h-dvh w-full items-center justify-center bg-black/70 p-2 ">
          <div className="w-full max-w-md rounded-md border border-white/10 bg-slate-950 p-2 ">
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

      {pendingDownload ? (
        <div className="fixed inset-0 z-[100000] flex h-dvh w-full items-center justify-center bg-black/75 p-2 ">
          <div className="flex h-[90dvh] w-full items-center justify-center rounded-md border border-white/10 bg-slate-950 p-2 ">
            <div className="w-full max-w-md rounded-md border border-white/10 bg-slate-900 p-2">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="min-w-0">
                  <h2 className="truncate text-xs font-black text-white">
                    {pendingDownload.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {pendingDownload.description}
                  </p>
                </div>

                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-slate-800 text-slate-200  transition hover:bg-slate-700 active:opacity-80"
                  onClick={() => setPendingDownload(null)}
                >
                  <FiX aria-hidden="true" className={iconClassName} />
                </button>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2">
                {canUseDirectoryPicker() ? (
                  <button
                    type="button"
                    className="rounded-md bg-cyan-300 p-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200"
                    onClick={() => void executeDownloadToFolder()}
                  >
                    Chọn thư mục & lưu ảnh
                  </button>
                ) : null}

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    className="rounded-md border border-white/10 bg-slate-800 p-2 text-xs font-bold text-white transition hover:bg-slate-700"
                    onClick={() => setPendingDownload(null)}
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    className="rounded-md bg-cyan-300 p-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200"
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
}
