"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
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
  price: number;
  priceText: string;
  category: string;
  images: ProductImage[];
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
  version: 3;
  settings: GlobalSettings;
  products: LocalProduct[];
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
  images: ProductImage[];
};

type ModalName =
  | "product"
  | "schedule"
  | "global"
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
};

type SlotTimeStatus = "posted" | "next" | "future" | "overdue";

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
          ? Math.max(1, Math.min(8, Math.round(record.taskCount)))
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
      const dataUrl = await fileToCompressedDataUrl(file);

      return {
        id: crypto.randomUUID(),
        name: createSystemImageFilename(index),
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

  return {
    id: record.id,
    name: record.name,
    description,
    price:
      typeof record.price === "number"
        ? record.price
        : parsePriceNumber(priceText),
    priceText,
    category,
    images: normalizeImages(record.images),
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

const parseImportPayload = (
  value: unknown,
): {
  settings?: GlobalSettings;
  products: LocalProduct[];
} | null => {
  if (Array.isArray(value)) {
    const products = normalizeProductsArray(value);

    return {
      products,
    };
  }

  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;
  const products = normalizeProductsArray(record.products);

  if (products.length === 0) return null;

  const settingsRecord = record.settings;

  if (typeof settingsRecord !== "object" || settingsRecord === null) {
    return {
      products,
    };
  }

  const settingsSource = settingsRecord as Record<string, unknown>;

  return {
    settings: {
      commonDescription:
        typeof settingsSource.commonDescription === "string"
          ? settingsSource.commonDescription
          : "",
      globalNote:
        typeof settingsSource.globalNote === "string"
          ? settingsSource.globalNote
          : "",
      updatedAt:
        typeof settingsSource.updatedAt === "string"
          ? settingsSource.updatedAt
          : "",
    },
    products,
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

const createSystemImageFilename = (index: number): string => {
  return `sanpham${index + 1}.jpg`;
};

const convertDataUrlToJpeg = async (dataUrl: string): Promise<string> => {
  if (dataUrl.startsWith("data:image/jpeg")) {
    return dataUrl;
  }

  return new Promise((resolve, reject) => {
    const image = new Image();

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

const copyImageDataUrlAsBlob = async (dataUrl: string): Promise<void> => {
  const jpegDataUrl = await convertDataUrlToJpeg(dataUrl);
  const blob = await dataUrlToBlob(jpegDataUrl);

  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
};

const copyImagesDataUrlAsBlob = async (
  images: ProductImage[],
): Promise<void> => {
  if (images.length === 0) return;

  const items = await Promise.all(
    images.map(async (image) => {
      const jpegDataUrl = await convertDataUrlToJpeg(image.dataUrl);
      const blob = await dataUrlToBlob(jpegDataUrl);

      return new ClipboardItem({
        [blob.type]: blob,
      });
    }),
  );

  await navigator.clipboard.write(items);
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
  dataUrl: string,
  index: number,
): Promise<void> => {
  const jpegDataUrl = await convertDataUrlToJpeg(dataUrl);

  downloadDataUrl(jpegDataUrl, createSystemImageFilename(index));
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

const buildRandomSchedule = (
  products: LocalProduct[],
  config: ScheduleConfig,
  commonDescription: string,
): BuildScheduleResult => {
  if (products.length === 0) {
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
      ? products
      : products.filter((product) =>
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

const getSlotStatus = (
  slot: ScheduleSlot,
  today: string,
  currentTime: string,
  postedIds: Set<string>,
  nextSlotId: string,
): SlotTimeStatus => {
  if (postedIds.has(createSlotPostedKey(slot))) return "posted";
  if (slot.id === nextSlotId) return "next";
  if (slot.date < today) return "overdue";
  if (slot.date === today && toMinutes(slot.time) < toMinutes(currentTime))
    return "overdue";

  return "future";
};

const getStatusLabel = (status: SlotTimeStatus): string => {
  if (status === "posted") return "Đã đăng";
  if (status === "next") return "Đang tới lượt";
  if (status === "overdue") return "Quá giờ";
  return "Chưa tới giờ";
};

export default function LocalProductsPage() {
  const fileImportRef = useRef<HTMLInputElement | null>(null);
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
  const [pendingRemoveTaskIndex, setPendingRemoveTaskIndex] = useState<
    number | null
  >(null);
  const [pendingDownload, setPendingDownload] =
    useState<DownloadRequest | null>(null);
  const [scheduleAssignments, setScheduleAssignments] =
    useState<ScheduleAssignmentMap>(() => loadScheduleAssignments());
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false);
  const [isSettingsReady, setIsSettingsReady] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<ModalName>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedAlbumImageId, setSelectedAlbumImageId] = useState<string>("");
  const [albumSource, setAlbumSource] = useState<AlbumSource | null>(null);
  const [copiedKey, setCopiedKey] = useState<string>("");
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

    return products.filter((product) => {
      const productCategoryKey = normalizeTextKey(product.category);
      const matchesCategory =
        activeCategoryTab === "all" || productCategoryKey === activeCategoryKey;
      const content = normalizeTextKey(
        `${product.name} ${product.description} ${product.priceText} ${product.category}`,
      );
      const matchesKeyword = !keyword || content.includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [activeCategoryTab, products, query]);

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

  const scheduleProducts = useMemo(() => {
    if (scheduleConfig.selectedCategories.length === 0) return products;

    const selectedCategoryKeys = new Set(
      scheduleConfig.selectedCategories.map((category) =>
        normalizeTextKey(category),
      ),
    );

    return products.filter((product) =>
      selectedCategoryKeys.has(normalizeTextKey(product.category)),
    );
  }, [products, scheduleConfig.selectedCategories]);

  const filteredScheduleProducts = useMemo(() => {
    const keyword = normalizeTextKey(scheduleQuery);

    return scheduleProducts.filter((product) => {
      const content = normalizeTextKey(
        `${product.name} ${product.description} ${product.priceText} ${product.category}`,
      );

      return !keyword || content.includes(keyword);
    });
  }, [scheduleProducts, scheduleQuery]);

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
          nextAssignments[nextKey] = value;
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
        const match = record.slotId.match(/^(\d{4}-\d{2}-\d{2})::task(\d+)::(.+)$/);

        if (!match) return record;

        const [, date, taskNumberText, legacyValue] = match;

        if (!date || !taskNumberText || !legacyValue) return record;
        if (legacyValue.startsWith("slot")) return record;

        const taskIndex = Number(taskNumberText) - 1;
        const legacyProduct = products.find((product) => product.id === legacyValue);

        if (!legacyProduct) return record;

        const matchedEntry = Object.entries(scheduleAssignments).find(([key, value]) => {
          if (value !== legacyProduct.id) return false;
          return key.startsWith(`${date}::task${taskIndex + 1}::slot`);
        });

        if (!matchedEntry) return record;

        changed = true;

        return {
          ...record,
          slotId: matchedEntry[0],
        };
      });

      if (changed) {
        const uniqueRecords = Array.from(
          new Map(nextRecords.map((record) => [record.slotId, record])).values(),
        );

        savePostedRecords(uniqueRecords);
        return uniqueRecords;
      }

      return current;
    });
  }, [products, scheduleAssignments, scheduleTimes]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;

      if (pendingDownload) {
        setPendingDownload(null);
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
  }, [activeModal, pendingDownload]);

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

  const openProductModalForCreate = (): void => {
    setEditingId("");
    setDraft(emptyDraft);
    setActiveModal("product");
  };

  const closeModal = (): void => {
    setActiveModal("");
    setSelectedSlotId("");
    setSelectedAlbumImageId("");
    setAlbumSource(null);
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
        images: [...current.images, ...images],
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
    const files = Array.from(event.target.files ?? []);

    await appendImagesToDraft(files);

    event.target.value = "";
  };

  const handlePaste = async (
    event: ClipboardEvent<HTMLElement>,
  ): Promise<void> => {
    const files = Array.from(event.clipboardData.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) return;

    await appendImagesToDraft(imageFiles);
  };

  const handleDrop = async (
    event: DragEvent<HTMLLabelElement>,
  ): Promise<void> => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);

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
      images: current.images.filter((image) => image.id !== imageId),
    }));
  };

  const moveDraftImage = (imageId: string, direction: "up" | "down"): void => {
    setDraft((current) => {
      const currentIndex = current.images.findIndex(
        (image) => image.id === imageId,
      );

      if (currentIndex === -1) return current;

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= current.images.length)
        return current;

      const nextImages = [...current.images];
      const currentImage = nextImages[currentIndex];
      const targetImage = nextImages[targetIndex];

      if (!currentImage || !targetImage) return current;

      nextImages[currentIndex] = targetImage;
      nextImages[targetIndex] = currentImage;

      return {
        ...current,
        images: nextImages,
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
    const name = draft.name.trim();
    const description = draft.description.trim();
    const priceText = draft.priceText.trim();
    const category = draft.category.trim();

    if (!name) {
      Toastify("Vui lòng nhập tên sản phẩm", 400);
      return;
    }

    const currentProduct = products.find((product) => product.id === editingId);

    const product: LocalProduct = {
      id: currentProduct?.id ?? crypto.randomUUID(),
      name,
      description,
      price: parsePriceNumber(priceText),
      priceText,
      category,
      images: draft.images,
      createdAt: currentProduct?.createdAt ?? now,
      updatedAt: now,
    };

    await saveProductToDb(product);
    await loadProducts();

    resetForm();
    setActiveModal("");
    Toastify(editingId ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm", 200);
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

    setActiveModal("product");
  };

  const handleDelete = async (id: string): Promise<void> => {
    const product = products.find((item) => item.id === id);
    const productName = product?.name ?? "sản phẩm này";
    const accepted = window.confirm(
      `Xóa vĩnh viễn ${productName}? Dữ liệu sản phẩm và ảnh đã lưu trong trình duyệt sẽ bị xóa.`,
    );

    if (!accepted) return;

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
          nextAssignments[key] = value;
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
  };

  const handleDeleteProductImage = async (
    productId: string,
    imageId: string,
  ): Promise<void> => {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      Toastify("Không tìm thấy sản phẩm để xóa ảnh", 400);
      return;
    }

    const imageIndex = product.images.findIndex((image) => image.id === imageId);

    if (imageIndex === -1) {
      Toastify("Không tìm thấy ảnh cần xóa", 400);
      return;
    }

    const accepted = window.confirm(
      `Xóa vĩnh viễn ảnh số ${imageIndex + 1} của ${product.name}?`,
    );

    if (!accepted) return;

    const nextProduct: LocalProduct = {
      ...product,
      images: product.images.filter((image) => image.id !== imageId),
      updatedAt: new Date().toISOString(),
    };

    await saveProductToDb(nextProduct);

    setProducts((current) =>
      current.map((item) => (item.id === productId ? nextProduct : item)),
    );

    setDraft((current) => {
      if (editingId !== productId) return current;

      return {
        ...current,
        images: current.images.filter((image) => image.id !== imageId),
      };
    });

    setAlbumSource((current) => {
      if (!current || current.title !== product.name) return current;

      const nextImages = current.images.filter((image) => image.id !== imageId);

      if (nextImages.length === 0) {
        setSelectedAlbumImageId("");
        return {
          ...current,
          images: [],
        };
      }

      setSelectedAlbumImageId((currentImageId) =>
        currentImageId === imageId ? (nextImages[0]?.id ?? "") : currentImageId,
      );

      return {
        ...current,
        images: nextImages,
      };
    });

    Toastify("Đã xóa ảnh khỏi sản phẩm", 200);
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

  const handleExportJson = (): void => {
    const payload: ExportPayload = {
      version: 3,
      settings,
      products,
    };

    const content = JSON.stringify(payload, null, 2);
    const blob = new Blob([content], {
      type: "application/json",
    });

    downloadBlob(blob, `local-products-${Date.now()}.json`);
    Toastify("Đã export JSON", 200);
  };

  const handleExportScheduleJson = (): void => {
    const postedMap = new Map(
      postedRecords.map((record) => [record.slotId, record.postedAt]),
    );

    const data = scheduleResult.slots.map((slot) => ({
      ...slot,
      isPosted: postedMap.has(createSlotPostedKey(slot)),
      postedAt: postedMap.get(createSlotPostedKey(slot)) ?? "",
    }));

    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], {
      type: "application/json",
    });

    downloadBlob(blob, `post-schedule-${Date.now()}.json`);
    Toastify("Đã export lịch đăng", 200);
  };

  const handleImportJson = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const payload = parseImportPayload(parsed);

      if (!payload || payload.products.length === 0) {
        Toastify("File JSON không đúng cấu trúc", 400);
        event.target.value = "";
        return;
      }

      const accepted = window.confirm(
        "Import JSON sẽ thay thế toàn bộ dữ liệu sản phẩm hiện tại. Tiếp tục?",
      );

      if (!accepted) {
        event.target.value = "";
        return;
      }

      await clearProductsDb();

      for (const product of payload.products) {
        await saveProductToDb(product);
      }

      if (payload.settings) {
        setSettings(payload.settings);
      }

      await loadProducts();

      Toastify("Đã import JSON", 200);
    } catch {
      Toastify("Không thể import file JSON", 400);
    } finally {
      event.target.value = "";
    }
  };

  const requestDownload = (request: DownloadRequest): void => {
    setPendingDownload(request);
  };

  const executeDownloadRequest = (): void => {
    if (!pendingDownload) return;

    pendingDownload.images.forEach((image, index) => {
      window.setTimeout(() => {
        void downloadImageAsJpg(
          image.dataUrl,
          pendingDownload.startIndex + index,
        );
      }, index * 180);
    });

    Toastify(`Đang tải ${pendingDownload.images.length} ảnh JPG`, 200);
    setPendingDownload(null);
  };

  const handleDownloadProductImages = (product: LocalProduct): void => {
    if (product.images.length === 0) {
      Toastify("Sản phẩm chưa có ảnh để tải", 300);
      return;
    }

    requestDownload({
      title: "Tải ảnh sản phẩm",
      description: `Bạn có muốn tải ${product.images.length} ảnh của sản phẩm này về máy không?`,
      mode: "multiple",
      images: product.images,
      startIndex: 0,
    });
  };

  const handleDownloadSlotImages = (slot: ScheduleSlot): void => {
    if (slot.images.length === 0) {
      Toastify("Bài này chưa có ảnh để tải", 300);
      return;
    }

    requestDownload({
      title: "Tải ảnh lịch đăng",
      description: `Bạn có muốn tải ${slot.images.length} ảnh của sản phẩm trong lịch về máy không?`,
      mode: "multiple",
      images: slot.images,
      startIndex: 0,
    });
  };

  const openImageAlbum = (source: AlbumSource): void => {
    if (source.images.length === 0) {
      Toastify("Chưa có ảnh để xem", 300);
      return;
    }

    setAlbumSource(source);
    setSelectedAlbumImageId(source.images[0]?.id ?? "");
    setActiveModal("imageAlbum");
  };

  const handleDownloadSelectedAlbumImage = (): void => {
    if (!albumSource || !selectedAlbumImage) {
      Toastify("Chưa chọn ảnh để tải", 300);
      return;
    }

    const selectedIndex = albumSource.images.findIndex(
      (image) => image.id === selectedAlbumImage.id,
    );
    const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;

    requestDownload({
      title: "Tải ảnh đang chọn",
      description: `Bạn có muốn tải ảnh số ${safeIndex + 1} về máy không?`,
      mode: "single",
      images: [selectedAlbumImage],
      startIndex: safeIndex,
    });
  };

  const handleDownloadAlbumImages = (): void => {
    if (!albumSource || albumSource.images.length === 0) {
      Toastify("Album chưa có ảnh để tải", 300);
      return;
    }

    requestDownload({
      title: "Tải toàn bộ album",
      description: `Bạn có muốn tải ${albumSource.images.length} ảnh trong album về máy không?`,
      mode: "multiple",
      images: albumSource.images,
      startIndex: 0,
    });
  };

  const handleDownloadAllImages = (): void => {
    const allImages = products.flatMap((product) => product.images);

    if (allImages.length === 0) {
      Toastify("Chưa có ảnh để tải", 300);
      return;
    }

    requestDownload({
      title: "Tải toàn bộ ảnh",
      description: `Bạn có muốn tải ${allImages.length} ảnh của tất cả sản phẩm về máy không?`,
      mode: "multiple",
      images: allImages,
      startIndex: 0,
    });
  };

  const handleCopySelectedAlbumImageAsBlob = async (): Promise<void> => {
    if (!selectedAlbumImage) {
      Toastify("Chưa chọn ảnh để copy", 300);
      return;
    }

    try {
      await copyImageDataUrlAsBlob(selectedAlbumImage.dataUrl);
      Toastify("Đã copy ảnh vào clipboard", 200);
    } catch {
      Toastify("Trình duyệt không hỗ trợ copy ảnh dạng blob", 400);
    }
  };

  const handleCopyAlbumImagesAsBlob = async (): Promise<void> => {
    if (!albumSource || albumSource.images.length === 0) {
      Toastify("Album chưa có ảnh để copy", 300);
      return;
    }

    try {
      await copyImagesDataUrlAsBlob(albumSource.images);
      Toastify(`Đã copy ${albumSource.images.length} ảnh vào clipboard`, 200);
    } catch {
      Toastify("Trình duyệt có thể chỉ hỗ trợ copy một ảnh mỗi lần", 400);
    }
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
    const assignmentKey = createScheduleAssignmentKey(date, slotIndex, taskIndex);
    const legacyAssignmentKey = createLegacyScheduleAssignmentKey(
      date,
      time,
      taskIndex,
    );

    const productId =
      scheduleAssignments[assignmentKey] ??
      scheduleAssignments[legacyAssignmentKey];

    return products.find((product) => product.id === productId);
  };

  const assignProductToSchedule = (
    date: string,
    time: string,
    slotIndex: number,
    taskIndex: number,
    productId: string,
  ): void => {
    const assignmentKey = createScheduleAssignmentKey(date, slotIndex, taskIndex);
    const legacyAssignmentKey = createLegacyScheduleAssignmentKey(
      date,
      time,
      taskIndex,
    );
    const postedKey = createPostedKey(date, slotIndex, taskIndex);

    const currentProductId =
      scheduleAssignments[assignmentKey] ??
      scheduleAssignments[legacyAssignmentKey] ??
      "";

    if (currentProductId !== productId) {
      setPostedRecords((current) => {
        const nextRecords = current.filter((record) => record.slotId !== postedKey);

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

      const duplicated = Object.entries(nextAssignments).some(([key, value]) => {
        if (key === assignmentKey) return false;
        if (value !== productId) return false;

        return key.startsWith(`${date}::task${taskIndex + 1}::`);
      });

      if (duplicated) {
        Toastify("Sản phẩm này đã có trong task này hôm nay", 300);
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

    if (!productId) return;

    assignProductToSchedule(date, time, slotIndex, taskIndex, productId);
    setDraggingProductId("");
  };

  const addScheduleTask = (): void => {
    setScheduleConfig((current) => {
      const nextTaskCount = Math.min(8, current.taskCount + 1);

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
            nextAssignments[shiftedKey] = value;
            return;
          }

          nextAssignments[key] = value;
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

    setScheduleAssignments((current) => {
      const nextAssignments: ScheduleAssignmentMap = { ...current };

      scheduleTimes.forEach((time, slotIndex) => {
        const sourceKey = createScheduleAssignmentKey(today, slotIndex, 0);
        const legacySourceKey = createLegacyScheduleAssignmentKey(today, time, 0);
        const value = current[sourceKey] ?? current[legacySourceKey];

        if (!value) return;

        for (
          let taskIndex = 1;
          taskIndex < scheduleConfig.taskCount;
          taskIndex += 1
        ) {
          nextAssignments[createScheduleAssignmentKey(today, slotIndex, taskIndex)] =
            value;
        }
      });

      return nextAssignments;
    });

    Toastify("Đã nhân bản task 1 sang các task còn lại", 200);
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

  const resetTodayPosted = (): void => {
    const todayPrefix = `${today}::`;

    setPostedRecords((current) => {
      const nextRecords = current.filter(
        (record) => !record.slotId.startsWith(todayPrefix),
      );

      savePostedRecords(nextRecords);
      Toastify("Đã reset tiến độ đăng hôm nay", 200);

      return nextRecords;
    });
  };

  const resetAllPosted = (): void => {
    setPostedRecords([]);
    savePostedRecords([]);
    Toastify("Đã reset toàn bộ lịch về chưa đăng", 200);
  };

  const openSlotModal = (slot: ScheduleSlot): void => {
    setSelectedSlotId(slot.id);
    setActiveModal("slotDetail");
  };

  const openAssignedSlotModal = (
    date: string,
    slotIndex: number,
    taskIndex: number,
  ): void => {
    setSelectedSlotId(createScheduleAssignmentKey(date, slotIndex, taskIndex));
    setActiveModal("slotDetail");
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

  const renderCopyIcon = (key: string) => {
    return copiedKey === key ? <FiCheckCircle /> : <FiCopy />;
  };

  return (
    <main
      className="min-h-dvh w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#1e293b_0,#020617_34%,#020617_100%)] p-2 text-slate-100 xl:p-0"
      onPaste={(event) => {
        void handlePaste(event);
      }}
    >
      <ToastContainer />

      <section className="mx-auto flex w-full flex-col gap-2 xl:min-h-dvh xl:p-2">
        <header className="rounded-2xl border border-cyan-400/20 bg-slate-950/80 p-2 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-[1fr_auto] xl:items-center">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <FiDatabase />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-black tracking-tight text-white xl:text-xl">
                  Local Product Manager
                </h1>
                <p className="truncate text-xs text-slate-400">
                  {products.length} sản phẩm · {totalImages} ảnh · hôm nay{" "}
                  {postedTodayCount}/{totalTodayTaskCount} bài đã đăng
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 xl:grid-cols-5">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200 active:scale-[0.98]"
                onClick={openProductModalForCreate}
              >
                <FiPlus />
                Thêm
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
                onClick={() => setActiveModal("schedule")}
              >
                <FiCalendar />
                Lịch
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
                onClick={() => setActiveModal("global")}
              >
                <FiFileText />
                Nội dung
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
                onClick={() => setActiveModal("importExport")}
              >
                <FiArchive />
                Data
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
                onClick={handleDownloadAllImages}
              >
                <FiDownload />
                Ảnh
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Sản phẩm
            </div>
            <div className="text-lg font-black text-white">
              {products.length}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Ảnh
            </div>
            <div className="text-lg font-black text-white">{totalImages}</div>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-cyan-200">
              Hôm nay
            </div>
            <div className="text-lg font-black text-white">
              {totalTodayTaskCount}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-200">
              DONE
            </div>
            <div className="text-lg font-black text-white">
              {postedTodayCount}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-rose-200">
              Còn lại
            </div>
            <div className="text-lg font-black text-white">
              {remainingTodayCount}
            </div>
          </div>

          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-left transition hover:bg-white/10 active:scale-[0.99]"
            onClick={() => setActiveModal("schedule")}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Lịch
            </div>
            <div className="truncate text-sm font-black text-white">
              {nextSlot
                ? `${nextSlot.time} · ${nextSlot.productName}`
                : "Mở lịch đăng"}
            </div>
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-2 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-2 grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white">
                Danh sách sản phẩm
              </h2>
              <p className="text-xs text-slate-400">
                Click vào sản phẩm để active. Mô tả mặc định đã thu gọn để nhìn
                được nhiều sản phẩm hơn.
              </p>
            </div>

            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-slate-400">
              <FiSearch className="shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                placeholder="Tìm sản phẩm, giá, danh mục"
              />
            </label>
          </div>

          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              className={`shrink-0 rounded-2xl border px-3 py-1.5 text-xs font-black transition ${activeCategoryTab === "all"
                ? "border-cyan-300/50 bg-cyan-300 text-slate-950"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              onClick={() => setActiveCategoryTab("all")}
            >
              Tất cả
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`shrink-0 rounded-2xl border px-3 py-1.5 text-xs font-black transition ${normalizeTextKey(activeCategoryTab) ===
                  normalizeTextKey(category)
                  ? "border-cyan-300/50 bg-cyan-300 text-slate-950"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                onClick={() => setActiveCategoryTab(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-center text-sm text-slate-400">
              Chưa có sản phẩm phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
              {filteredProducts.map((product) => {
                const descriptionPreview =
                  product.description.trim() ||
                  settings.commonDescription.trim();
                const active = selectedProductId === product.id;
                const expanded = expandedProductIds.has(product.id);

                return (
                  <article
                    key={product.id}
                    className={`overflow-hidden rounded-2xl border shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-slate-900 ${active
                      ? "border-cyan-300/70 bg-cyan-300/10 ring-1 ring-cyan-300/30"
                      : "border-white/10 bg-slate-950/80"
                      }`}
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    <button
                      type="button"
                      className="relative flex aspect-[4/3] w-full items-center justify-center bg-slate-900"
                      onClick={(event) => {
                        event.stopPropagation();
                        openImageAlbum({
                          title: product.name,
                          images: product.images,
                        });
                      }}
                    >
                      {product.images[0] ? (
                        <img
                          src={product.images[0].dataUrl}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <FiImage className="text-slate-600" />
                      )}

                      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-2xl bg-black/70 px-2 py-1 text-[10px] font-bold text-white">
                        <FiImage />
                        {product.images.length}
                      </div>

                      {active ? (
                        <div className="absolute right-2 top-2 rounded-2xl bg-cyan-300 px-2 py-1 text-[10px] font-black text-slate-950">
                          ACTIVE
                        </div>
                      ) : null}
                    </button>

                    {product.images.length > 0 ? (
                      <div className="flex gap-1 overflow-x-auto border-t border-white/10 bg-slate-950/70 p-1">
                        {product.images.slice(0, 6).map((image, imageIndex) => (
                          <div
                            key={image.id}
                            className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900"
                          >
                            <button
                              type="button"
                              className="h-full w-full"
                              title={`Xem ảnh ${imageIndex + 1}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setAlbumSource({
                                  title: product.name,
                                  images: product.images,
                                });
                                setSelectedAlbumImageId(image.id);
                                setActiveModal("imageAlbum");
                              }}
                            >
                              <img
                                src={image.dataUrl}
                                alt={`${product.name} ${imageIndex + 1}`}
                                className="h-full w-full object-contain"
                              />
                            </button>

                            <button
                              type="button"
                              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white opacity-100 transition hover:bg-rose-400 xl:opacity-0 xl:group-hover:opacity-100"
                              title={`Xóa ảnh ${imageIndex + 1}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteProductImage(product.id, image.id);
                              }}
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}

                        {product.images.length > 6 ? (
                          <button
                            type="button"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[10px] font-black text-slate-300"
                            onClick={(event) => {
                              event.stopPropagation();
                              openImageAlbum({
                                title: product.name,
                                images: product.images,
                              });
                            }}
                          >
                            +{product.images.length - 6}
                          </button>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-2 p-2">
                      <div className="min-w-0">
                        {product.category ? (
                          <div className="truncate text-[10px] font-black uppercase tracking-wide text-cyan-200">
                            {product.category}
                          </div>
                        ) : null}

                        <h3 className="line-clamp-2 min-h-9 text-xs font-black leading-4 text-white xl:text-sm xl:leading-5">
                          {product.name}
                        </h3>
                        <div className="mt-1 truncate text-sm font-black text-cyan-200">
                          {product.priceText || "Chưa có giá"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                        <p
                          className={`${expanded ? "line-clamp-none" : "line-clamp-3"} whitespace-pre-line text-[11px] leading-5 text-slate-300`}
                        >
                          {descriptionPreview || "Chưa có mô tả"}
                        </p>
                        {descriptionPreview.length > 90 ? (
                          <button
                            type="button"
                            className="mt-1 text-[11px] font-black text-cyan-200"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleExpandedProduct(product.id);
                            }}
                          >
                            {expanded ? "Thu gọn" : "Xem thêm"}
                          </button>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5 text-[10px] font-bold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
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
                          className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5 text-[10px] font-bold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleCopyField(
                              `desc-${product.id}`,
                              "mô tả",
                              descriptionPreview,
                            );
                          }}
                        >
                          {renderCopyIcon(`desc-${product.id}`)}
                          Mô tả
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5 text-[10px] font-bold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEdit(product);
                          }}
                        >
                          <FiEdit3 />
                          Sửa
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-1 rounded-2xl bg-cyan-300 p-1.5 text-[10px] font-black text-slate-950 transition hover:bg-cyan-200 active:scale-[0.98]"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDownloadProductImages(product);
                          }}
                        >
                          <FiDownload />
                          Ảnh
                        </button>
                      </div>

                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-1 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-1.5 text-[10px] font-black text-rose-100 transition hover:bg-rose-400/20 active:scale-[0.98]"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDelete(product.id);
                        }}
                      >
                        <FiTrash2 />
                        Xóa vĩnh viễn
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>

      {activeModal ? (
        <div className="fixed inset-0 z-[99999] flex h-dvh w-full items-center justify-center overflow-hidden bg-black/70 p-2 backdrop-blur">
          <div className="h-[90dvh] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 p-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  {activeModal === "product" ? <FiPlus /> : null}
                  {activeModal === "schedule" ? <FiCalendar /> : null}
                  {activeModal === "global" ? <FiFileText /> : null}
                  {activeModal === "importExport" ? <FiArchive /> : null}
                  {activeModal === "slotDetail" ? <FiClipboard /> : null}
                  {activeModal === "imageAlbum" ? <FiImage /> : null}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-white">
                    {activeModal === "product"
                      ? editingId
                        ? "Sửa sản phẩm"
                        : "Thêm sản phẩm"
                      : null}
                    {activeModal === "schedule" ? "Cấu hình lịch đăng" : null}
                    {activeModal === "global" ? "Global Content" : null}
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
                onClick={closeModal}
              >
                <FiX />
              </button>
            </div>

            <div className="h-[calc(90dvh-58px)] overflow-y-auto p-2">
              {activeModal === "product" ? (
                <form
                  className="grid grid-cols-1 gap-2 xl:grid-cols-[360px_1fr]"
                  onSubmit={(event) => void handleSubmit(event)}
                >
                  <section className="flex flex-col gap-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-300">
                        Tên sản phẩm
                      </span>
                      <input
                        value={draft.name}
                        onChange={(event) =>
                          updateDraftField("name", event.target.value)
                        }
                        className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                        placeholder="Dell Latitude 7440 i5 13th"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-300">
                          Giá
                        </span>
                        <input
                          value={draft.priceText}
                          onChange={(event) =>
                            updateDraftField("priceText", event.target.value)
                          }
                          className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                          placeholder="13tr8"
                        />
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-300">
                          Danh mục
                        </span>
                        <input
                          value={draft.category}
                          onChange={(event) =>
                            updateDraftField("category", event.target.value)
                          }
                          className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                          placeholder="Laptop Dell"
                        />
                      </label>
                    </div>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-300">
                        Mô tả sản phẩm
                      </span>
                      <textarea
                        value={draft.description}
                        onChange={(event) =>
                          updateDraftField("description", event.target.value)
                        }
                        rows={10}
                        className="min-h-60 rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                        placeholder="Để trống nếu muốn dùng mô tả chung..."
                      />
                    </label>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 p-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200 active:scale-[0.98]"
                    >
                      {editingId ? <FiRefreshCcw /> : <FiPlus />}
                      {editingId ? "Cập nhật" : "Lưu sản phẩm"}
                    </button>
                  </section>

                  <section className="flex flex-col gap-2">
                    <label
                      className={`cursor-pointer rounded-2xl border border-dashed p-4 text-center transition ${isDragging
                        ? "border-cyan-300/80 bg-cyan-300/10"
                        : "border-white/15 bg-slate-950/70 hover:border-cyan-300/50 hover:bg-cyan-300/5"
                        }`}
                      onDrop={(event) => void handleDrop(event)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <div className="flex items-center justify-center gap-2 text-sm font-black text-white">
                        <FiUploadCloud />
                        {isProcessingImages
                          ? "Đang xử lý ảnh..."
                          : "Chọn / kéo thả / paste ảnh"}
                      </div>
                      <div className="mt-2 text-xs leading-5 text-slate-400">
                        Hỗ trợ nhiều ảnh, tự nén JPG.
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
                      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-xs font-black text-white">
                            <FiImage />
                            {draft.images.length} ảnh
                          </span>

                          <button
                            type="button"
                            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs font-bold text-slate-300 transition hover:bg-white/10"
                            onClick={() => updateDraftField("images", [])}
                          >
                            <FiTrash2 />
                            Xóa hết
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 xl:grid-cols-5">
                          {draft.images.map((image, index) => (
                            <div
                              key={image.id}
                              className="group relative overflow-hidden rounded-2xl bg-slate-900"
                            >
                              <img
                                src={image.dataUrl}
                                alt={image.name}
                                className="aspect-square w-full object-contain"
                              />

                              <div className="absolute left-1 top-1 rounded-xl bg-black/70 px-2 py-1 text-[10px] font-black text-white">
                                {index + 1}
                              </div>

                              <div className="absolute inset-x-1 bottom-1 hidden grid-cols-3 gap-1 group-hover:grid">
                                <button
                                  type="button"
                                  className="rounded-xl bg-black/80 p-1 text-[10px] font-bold text-white"
                                  onClick={() => moveDraftImage(image.id, "up")}
                                >
                                  Lên
                                </button>

                                <button
                                  type="button"
                                  className="rounded-xl bg-black/80 p-1 text-[10px] font-bold text-white"
                                  onClick={() =>
                                    moveDraftImage(image.id, "down")
                                  }
                                >
                                  Xuống
                                </button>

                                <button
                                  type="button"
                                  className="rounded-xl bg-red-500 p-1 text-[10px] font-bold text-white"
                                  onClick={() => removeDraftImage(image.id)}
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                </form>
              ) : null}

              {activeModal === "schedule" ? (
                <section className="flex min-h-full flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Khung giờ
                      </div>
                      <div className="text-lg font-black text-white">
                        {scheduleTimes.length}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-cyan-200">
                        Tổng task
                      </div>
                      <div className="text-lg font-black text-white">
                        {totalTodayTaskCount}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                        DONE
                      </div>
                      <div className="text-lg font-black text-white">
                        {postedTodayCount}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-rose-200">
                        Còn lại
                      </div>
                      <div className="text-lg font-black text-white">
                        {remainingTodayCount}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-2xl border border-white/10 bg-white/5 p-2 text-left transition hover:bg-white/10"
                      onClick={() =>
                        setCompactScheduleConfig((current) => !current)
                      }
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Cấu hình
                      </div>
                      <div className="text-sm font-black text-white">
                        {compactScheduleConfig ? "Mở" : "Thu gọn"}
                      </div>
                    </button>

                    <button
                      type="button"
                      className="rounded-2xl border border-white/10 bg-white/5 p-2 text-left transition hover:bg-white/10"
                      onClick={resetTodayPosted}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Tiến độ
                      </div>
                      <div className="text-sm font-black text-white">
                        Reset hôm nay
                      </div>
                    </button>
                  </div>

                  {!compactScheduleConfig ? (
                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                      <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
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
                            className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
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
                            className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
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
                            className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
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
                            className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
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
                            className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
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
                            className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-xs text-white outline-none transition focus:border-cyan-300/60"
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
                          className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-black text-cyan-100 transition hover:bg-cyan-300/20"
                          onClick={addScheduleTask}
                        >
                          Thêm task
                        </button>

                        <button
                          type="button"
                          className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-black text-emerald-100 transition hover:bg-emerald-300/20"
                          onClick={duplicateFirstScheduleTask}
                        >
                          Nhân bản task 1
                        </button>

                        <button
                          type="button"
                          className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-[11px] font-black text-rose-100 transition hover:bg-rose-400/20"
                          onClick={resetAllPosted}
                        >
                          Reset tất cả
                        </button>
                      </div>

                      <div className="mt-2 rounded-2xl border border-white/10 bg-black/20 p-2">
                        <div className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                          Danh mục dùng để xếp lịch
                        </div>
                        {categories.length === 0 ? (
                          <p className="text-xs text-slate-400">
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
                                  className={`rounded-2xl border px-3 py-1.5 text-[11px] font-black transition ${active
                                    ? "border-cyan-300/50 bg-cyan-300 text-slate-950"
                                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
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
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-2 text-xs text-amber-100">
                      {scheduleResult.warnings.map((warning) => (
                        <p key={warning.message}>{warning.message}</p>
                      ))}
                    </div>
                  ) : null}

                  <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                        {scheduleTaskIndexes.map((taskIndex) => {
                          const active = activeScheduleTaskIndex === taskIndex;

                          return (
                            <div
                              key={taskIndex}
                              className={`flex min-w-56 shrink-0 items-center gap-2 rounded-2xl border p-2 ${active
                                ? "border-cyan-300/60 bg-cyan-300/10"
                                : "border-white/10 bg-white/[0.03]"
                                }`}
                            >
                              <button
                                type="button"
                                className="shrink-0 rounded-xl bg-white/5 px-2 py-1 text-[10px] font-black text-white"
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
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-400/10 text-rose-100 transition hover:bg-rose-400/20"
                                onClick={() =>
                                  requestRemoveScheduleTask(taskIndex)
                                }
                                title="Xoá task này"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {scheduleTimes.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-center text-sm text-slate-400">
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
                                  className={`rounded-2xl border p-2 transition ${done
                                    ? "border-emerald-400/30 bg-emerald-400/10"
                                    : assignedProduct
                                      ? "border-cyan-300/30 bg-cyan-300/10"
                                      : "border-white/10 bg-slate-950/80"
                                    }`}
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
                                  <div className="grid grid-cols-[82px_minmax(0,1fr)] gap-2 xl:grid-cols-[96px_170px_minmax(0,1fr)_100px] xl:items-center">
                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-2">
                                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                        Bài {timeIndex + 1}
                                      </div>
                                      <div className="text-sm font-black text-white">
                                        {time}
                                      </div>
                                      <div className="text-[10px] text-slate-500">
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
                                      className="col-span-1 rounded-2xl border border-white/10 bg-slate-950 p-2 text-xs font-bold text-white outline-none focus:border-cyan-300/60 xl:col-span-1"
                                    >
                                      <option value="">Chọn sản phẩm</option>
                                      {scheduleProducts.map((product) => {
                                        const usedProductIds = new Set(
                                          Object.entries(scheduleAssignments)
                                            .filter(
                                              ([key]) =>
                                                key.startsWith(
                                                  `${today}::task${activeScheduleTaskIndex + 1}::`,
                                                ) &&
                                                key !==
                                                createScheduleAssignmentKey(
                                                  today,
                                                  timeIndex,
                                                  activeScheduleTaskIndex,
                                                ),
                                            )
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

                                    <div className="col-span-2 flex min-w-0 gap-2 xl:col-span-1">
                                      <button
                                        type="button"
                                        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-900"
                                        onClick={() =>
                                          assignedProduct
                                            ? openImageAlbum({
                                              title: assignedProduct.name,
                                              images: assignedProduct.images,
                                            })
                                            : undefined
                                        }
                                      >
                                        {assignedProduct?.images[0] ? (
                                          <img
                                            src={
                                              assignedProduct.images[0].dataUrl
                                            }
                                            alt={assignedProduct.name}
                                            className="h-full w-full object-contain"
                                          />
                                        ) : (
                                          <FiImage className="text-slate-600" />
                                        )}
                                      </button>

                                      <div className="min-w-0 flex-1">
                                        <h4 className="line-clamp-2 text-xs font-black text-white">
                                          {assignedProduct?.name ??
                                            "Kéo sản phẩm vào đây hoặc chọn từ danh sách"}
                                        </h4>
                                        <p className="mt-1 truncate text-[11px] font-black text-cyan-200">
                                          {assignedProduct?.priceText ??
                                            "Chưa có giá"}
                                        </p>
                                        <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                                          {assignedProduct?.category ??
                                            "Chưa có danh mục"}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="col-span-2 grid grid-cols-2 gap-2 xl:col-span-1 xl:grid-cols-1">
                                      <button
                                        type="button"
                                        disabled={!assignedProduct}
                                        className={`flex items-center justify-center gap-2 rounded-2xl p-2 text-xs font-black transition ${done
                                          ? "bg-emerald-300 text-slate-950 hover:bg-emerald-200"
                                          : assignedProduct
                                            ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
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
                                        disabled={!assignedProduct}
                                        className={`flex items-center justify-center gap-2 rounded-2xl p-2 text-xs font-black transition ${assignedProduct
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
                                        <FiClipboard />
                                        Chi tiết
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

                    <aside className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-black text-white">
                            Sản phẩm khả dụng
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Kéo thả vào khung giờ hoặc click để active.
                          </p>
                        </div>
                        <span className="rounded-2xl bg-white/5 px-2 py-1 text-[10px] font-black text-slate-300">
                          {filteredScheduleProducts.length}
                        </span>
                      </div>

                      <label className="mb-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-slate-400">
                        <FiSearch className="shrink-0" />
                        <input
                          value={scheduleQuery}
                          onChange={(event) =>
                            setScheduleQuery(event.target.value)
                          }
                          onKeyDown={(event) => event.stopPropagation()}
                          className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
                          placeholder="Tìm trong lịch"
                        />
                      </label>

                      <div className="grid max-h-[58dvh] grid-cols-1 gap-2 overflow-y-auto pr-1">
                        {filteredScheduleProducts.map((product) => {
                          const usedToday = Object.entries(
                            scheduleAssignments,
                          ).some(
                            ([key, value]) =>
                              key.startsWith(`${today}::`) &&
                              value === product.id,
                          );
                          const doneToday = todayPostedProductIds.has(
                            product.id,
                          );
                          const active = selectedProductId === product.id;

                          return (
                            <article
                              key={product.id}
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
                              className={`cursor-grab rounded-2xl border p-2 transition active:cursor-grabbing ${active
                                ? "border-cyan-300/60 bg-cyan-300/10 ring-1 ring-cyan-300/30"
                                : "border-white/10 bg-slate-950/80 hover:border-cyan-300/30"
                                }`}
                            >
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-900"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openImageAlbum({
                                      title: product.name,
                                      images: product.images,
                                    });
                                  }}
                                >
                                  {product.images[0] ? (
                                    <img
                                      src={product.images[0].dataUrl}
                                      alt={product.name}
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <FiImage className="text-slate-600" />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <h4 className="line-clamp-2 text-xs font-black text-white">
                                    {product.name}
                                  </h4>
                                  <p className="mt-1 truncate text-[11px] font-black text-cyan-200">
                                    {product.priceText || "Chưa có giá"}
                                  </p>
                                  <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                                    {product.category || "Chưa có danh mục"}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {active ? (
                                  <span className="rounded-2xl bg-cyan-300 px-2 py-1 text-[10px] font-black text-slate-950">
                                    ACTIVE
                                  </span>
                                ) : null}
                                {usedToday ? (
                                  <span className="rounded-2xl bg-cyan-300/10 px-2 py-1 text-[10px] font-black text-cyan-100">
                                    Đã xếp
                                  </span>
                                ) : null}
                                {doneToday ? (
                                  <span className="rounded-2xl bg-emerald-300 px-2 py-1 text-[10px] font-black text-slate-950">
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

              {activeModal === "global" ? (
                <section className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      Mô tả chung
                    </span>
                    <textarea
                      value={settings.commonDescription}
                      onChange={(event) =>
                        updateSettingField(
                          "commonDescription",
                          event.target.value,
                        )
                      }
                      className="min-h-56 rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-300/60"
                      placeholder="Dùng khi sản phẩm không có mô tả riêng..."
                    />

                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/10 p-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-300/20"
                      onClick={() =>
                        void handleCopyField(
                          "global-description",
                          "mô tả chung",
                          settings.commonDescription,
                        )
                      }
                    >
                      {renderCopyIcon("global-description")}
                      Copy mô tả chung
                    </button>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      Ghi chú global
                    </span>
                    <textarea
                      value={settings.globalNote}
                      onChange={(event) =>
                        updateSettingField("globalNote", event.target.value)
                      }
                      className="min-h-56 rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-300/60"
                      placeholder="Ghi chú ngoài từng bài..."
                    />

                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/10 p-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-300/20"
                      onClick={() =>
                        void handleCopyField(
                          "global-note",
                          "ghi chú global",
                          settings.globalNote,
                        )
                      }
                    >
                      {renderCopyIcon("global-note")}
                      Copy ghi chú
                    </button>
                  </label>
                </section>
              ) : null}

              {activeModal === "importExport" ? (
                <section className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                  <article className="rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                    <h3 className="text-sm font-black text-white">Export</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Tải JSON để backup toàn bộ sản phẩm, ảnh, mô tả chung và
                      ghi chú global.
                    </p>

                    <div className="mt-2 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 p-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
                        onClick={handleExportJson}
                      >
                        <FiDownload />
                        Export toàn bộ JSON
                      </button>

                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-sm font-bold text-white transition hover:bg-white/10"
                        onClick={handleExportScheduleJson}
                      >
                        <FiCalendar />
                        Export lịch đăng
                      </button>
                    </div>
                  </article>

                  <article className="rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                    <h3 className="text-sm font-black text-white">Import</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Import JSON sẽ thay thế toàn bộ dữ liệu sản phẩm hiện tại
                      trong IndexedDB.
                    </p>

                    <input
                      ref={fileImportRef}
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(event) => void handleImportJson(event)}
                    />

                    <button
                      type="button"
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-2 text-sm font-black text-amber-100 transition hover:bg-amber-300/20"
                      onClick={() => fileImportRef.current?.click()}
                    >
                      <FiUploadCloud />
                      Chọn file JSON để import
                    </button>
                  </article>
                </section>
              ) : null}

              {activeModal === "slotDetail" ? (
                selectedAssignedSlot ? (
                  <section className="grid grid-cols-1 gap-2 xl:grid-cols-[360px_1fr]">
                    <article className="rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                      <button
                        type="button"
                        className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900"
                        onClick={() =>
                          openImageAlbum({
                            title: selectedAssignedSlot.product.name,
                            images: selectedAssignedSlot.product.images,
                          })
                        }
                      >
                        {selectedAssignedSlot.product.images[0] ? (
                          <img
                            src={selectedAssignedSlot.product.images[0].dataUrl}
                            alt={selectedAssignedSlot.product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <FiImage className="text-slate-600" />
                        )}
                      </button>

                      {selectedAssignedSlot.product.images.length > 1 ? (
                        <div className="mt-2 grid grid-cols-5 gap-2">
                          {selectedAssignedSlot.product.images.slice(0, 10).map((image) => (
                            <button
                              key={image.id}
                              type="button"
                              className="aspect-square overflow-hidden rounded-xl bg-slate-900 ring-1 ring-white/10 transition hover:ring-cyan-300"
                              onClick={() =>
                                openImageAlbum({
                                  title: selectedAssignedSlot.product.name,
                                  images: selectedAssignedSlot.product.images,
                                })
                              }
                            >
                              <img
                                src={image.dataUrl}
                                alt={image.name}
                                className="h-full w-full object-contain"
                              />
                            </button>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className={`flex items-center justify-center gap-2 rounded-2xl p-2 text-xs font-black transition ${selectedAssignedSlot.done
                            ? "bg-emerald-300 text-slate-950 hover:bg-emerald-200"
                            : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                            }`}
                          onClick={() =>
                            togglePostedSlot(
                              selectedAssignedSlot.date,
                              selectedAssignedSlot.slotIndex,
                              selectedAssignedSlot.taskIndex,
                            )
                          }
                        >
                          <FiCheck />
                          {selectedAssignedSlot.done ? "DONE" : "Chưa đăng"}
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs font-bold text-white transition hover:bg-white/10"
                          onClick={() => handleDownloadProductImages(selectedAssignedSlot.product)}
                        >
                          <FiDownload />
                          Tải ảnh
                        </button>
                      </div>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="inline-flex rounded-2xl bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">
                            {selectedAssignedSlot.date} · {selectedAssignedSlot.time} · {selectedAssignedSlot.taskName} · Bài {selectedAssignedSlot.slotIndex + 1}
                          </div>
                          <h3 className="mt-2 text-base font-black text-white">
                            {selectedAssignedSlot.product.name}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            {selectedAssignedSlot.product.category || "Chưa có danh mục"}
                          </p>
                          <p className="mt-1 text-sm font-black text-cyan-200">
                            {selectedAssignedSlot.product.priceText || "Chưa có giá"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs font-bold text-white transition hover:bg-white/10"
                          onClick={() =>
                            void handleCopyField(
                              `slot-name-${selectedAssignedSlot.key}`,
                              "tên sản phẩm",
                              selectedAssignedSlot.product.name,
                            )
                          }
                        >
                          {renderCopyIcon(`slot-name-${selectedAssignedSlot.key}`)}
                          Copy tên
                        </button>


                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 p-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200"
                          onClick={() =>
                            void handleCopyField(
                              `slot-desc-${selectedAssignedSlot.key}`,
                              "mô tả",
                              selectedAssignedSlot.description,
                            )
                          }
                        >
                          {renderCopyIcon(`slot-desc-${selectedAssignedSlot.key}`)}
                          Copy mô tả
                        </button>


                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs font-bold text-white transition hover:bg-white/10"
                          onClick={() =>
                            void handleCopyField(
                              `slot-post-${selectedAssignedSlot.key}`,
                              "bài viết",
                              selectedAssignedSlot.postText,
                            )
                          }
                        >
                          {renderCopyIcon(`slot-post-${selectedAssignedSlot.key}`)}
                          Copy bài
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs font-bold text-white transition hover:bg-white/10"
                          onClick={() => handleEdit(selectedAssignedSlot.product)}
                        >
                          <FiEdit3 />
                          Sửa
                        </button>
                      </div>

                      <pre className="mt-2 max-h-[50dvh] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/30 p-2 text-sm leading-6 text-slate-200">
                        {selectedAssignedSlot.postText || "Chưa có nội dung bài viết"}
                      </pre>
                    </article>
                  </section>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-center text-sm text-slate-400">
                    Chưa tìm thấy bài đã xếp trong lịch.
                  </div>
                )
              ) : null}

              {activeModal === "imageAlbum" && albumSource ? (
                <section className="grid min-w-0 grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_260px]">
                  <article className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                    <div className="mb-2 flex min-w-0 flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-white">
                          {albumSource.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {albumSource.images.length} ảnh trong album
                        </p>
                      </div>

                      <div className="grid shrink-0 grid-cols-2 gap-2 xl:grid-cols-4">
                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                          onClick={() =>
                            void handleCopySelectedAlbumImageAsBlob()
                          }
                        >
                          <FiCopy />
                          Copy ảnh
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                          onClick={() => void handleCopyAlbumImagesAsBlob()}
                        >
                          <FiClipboard />
                          Copy album
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200"
                          onClick={handleDownloadSelectedAlbumImage}
                        >
                          <FiDownload />
                          Tải ảnh
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                          onClick={handleDownloadAlbumImages}
                        >
                          <FiArchive />
                          Tải album
                        </button>
                      </div>
                    </div>

                    <div className="flex h-[58dvh] max-h-[58dvh] min-h-[260px] items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
                      {selectedAlbumImage ? (
                        <img
                          src={selectedAlbumImage.dataUrl}
                          alt={selectedAlbumImage.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <FiImage className="text-slate-600" />
                      )}
                    </div>
                  </article>

                  <aside className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 p-2">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-white">
                        Thumbnail
                      </h3>
                    </div>

                    <div className="grid max-h-[58dvh] grid-cols-4 gap-2 overflow-y-auto pr-1 xl:grid-cols-2">
                      {albumSource.images.map((image, index) => {
                        const active = image.id === selectedAlbumImage?.id;

                        return (
                          <button
                            key={image.id}
                            type="button"
                            className={`group relative aspect-square overflow-hidden rounded-2xl bg-slate-900 ring-1 transition ${active
                              ? "ring-2 ring-cyan-300"
                              : "ring-white/10 hover:ring-cyan-300/60"
                              }`}
                            onClick={() => setSelectedAlbumImageId(image.id)}
                            title={`Ảnh ${index + 1}`}
                          >
                            <img
                              src={image.dataUrl}
                              alt={image.name}
                              className="h-full w-full object-contain"
                            />
                            <span className="absolute left-1 top-1 rounded-xl bg-black/70 px-2 py-1 text-[10px] font-black text-white">
                              {index + 1}
                            </span>
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

      {pendingRemoveTaskIndex !== null ? (
        <div className="fixed inset-0 z-[100000] flex h-dvh w-full items-center justify-center bg-black/70 p-2 backdrop-blur">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-3 shadow-2xl">
            <h3 className="text-sm font-black text-white">Xoá task đã chọn?</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Thao tác này chỉ xoá{" "}
              {getTaskName(scheduleConfig, pendingRemoveTaskIndex)} và dồn các
              task phía sau lên đúng thứ tự.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-xs font-black text-white transition hover:bg-white/10"
                onClick={() => setPendingRemoveTaskIndex(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="rounded-2xl bg-rose-500 p-2 text-xs font-black text-white transition hover:bg-rose-400"
                onClick={() => removeScheduleTask(pendingRemoveTaskIndex)}
              >
                Xoá task
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingDownload ? (
        <div className="fixed inset-0 z-[100000] flex h-dvh w-full items-center justify-center bg-black/75 p-2 backdrop-blur">
          <div className="flex h-[90dvh] w-full items-center justify-center rounded-3xl border border-white/10 bg-slate-950 p-2 shadow-2xl">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-2">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-white">
                    {pendingDownload.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {pendingDownload.description}
                  </p>
                </div>

                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
                  onClick={() => setPendingDownload(null)}
                >
                  <FiX />
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 p-2 text-sm font-bold text-white transition hover:bg-white/10"
                  onClick={() => setPendingDownload(null)}
                >
                  Hủy
                </button>

                <button
                  type="button"
                  className="rounded-2xl bg-cyan-300 p-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
                  onClick={executeDownloadRequest}
                >
                  Đồng ý tải
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
