"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import {
    FiArchive,
    FiClipboard,
    FiCopy,
    FiDatabase,
    FiDownload,
    FiEdit3,
    FiEye,
    FiEyeOff,
    FiFileText,
    FiImage,
    FiPlus,
    FiRefreshCcw,
    FiSearch,
    FiTrash2,
    FiUploadCloud,
    FiX
} from "react-icons/fi";

type ProductStatus = "active" | "hidden";

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
    status: ProductStatus;
    images: ProductImage[];
    createdAt: string;
    updatedAt: string;
};

type ProductDraft = {
    name: string;
    description: string;
    priceText: string;
    category: string;
    status: ProductStatus;
    images: ProductImage[];
};

type GlobalSettings = {
    commonDescription: string;
    globalNote: string;
    updatedAt: string;
};

type ExportPayload = {
    version: 2;
    settings: GlobalSettings;
    products: LocalProduct[];
};

const DB_NAME = "local_product_store";
const DB_VERSION = 1;
const STORE_NAME = "products";
const SETTINGS_KEY = "local_product_global_settings";

const emptyDraft: ProductDraft = {
    name: "",
    description: "",
    priceText: "",
    category: "",
    status: "active",
    images: []
};

const defaultSettings: GlobalSettings = {
    commonDescription: "",
    globalNote: "",
    updatedAt: ""
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
                    keyPath: "id"
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
            resolve(request.result as LocalProduct[]);
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
            commonDescription: typeof record.commonDescription === "string" ? record.commonDescription : "",
            globalNote: typeof record.globalNote === "string" ? record.globalNote : "",
            updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : ""
        };
    } catch {
        return defaultSettings;
    }
};

const saveGlobalSettings = (settings: GlobalSettings): void => {
    if (typeof window === "undefined") return;

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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

    context.drawImage(imageBitmap, 0, 0, width, height);

    return canvas.toDataURL("image/webp", 0.84);
};

const convertFilesToImages = async (files: File[]): Promise<ProductImage[]> => {
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    return Promise.all(
        validFiles.map(async (file) => {
            const now = new Date().toISOString();
            const dataUrl = await fileToCompressedDataUrl(file);

            const image: ProductImage = {
                id: crypto.randomUUID(),
                name: file.name || `image-${Date.now()}.webp`,
                dataUrl,
                size: file.size,
                type: "image/webp",
                createdAt: now
            };

            return image;
        })
    );
};

const isLocalProductArray = (value: unknown): value is LocalProduct[] => {
    if (!Array.isArray(value)) return false;

    return value.every((item) => {
        if (typeof item !== "object" || item === null) return false;

        const record = item as Record<string, unknown>;

        return (
            typeof record.id === "string" &&
            typeof record.name === "string" &&
            typeof record.description === "string" &&
            typeof record.price === "number" &&
            typeof record.priceText === "string" &&
            typeof record.category === "string" &&
            (record.status === "active" || record.status === "hidden") &&
            Array.isArray(record.images) &&
            typeof record.createdAt === "string" &&
            typeof record.updatedAt === "string"
        );
    });
};

const isExportPayload = (value: unknown): value is ExportPayload => {
    if (typeof value !== "object" || value === null) return false;

    const record = value as Record<string, unknown>;
    const settings = record.settings;

    if (!isLocalProductArray(record.products)) return false;
    if (typeof settings !== "object" || settings === null) return false;

    const settingsRecord = settings as Record<string, unknown>;

    return (
        record.version === 2 &&
        typeof settingsRecord.commonDescription === "string" &&
        typeof settingsRecord.globalNote === "string" &&
        typeof settingsRecord.updatedAt === "string"
    );
};

const copyText = async (value: string): Promise<void> => {
    await navigator.clipboard.writeText(value);
};

const buildPostText = (product: LocalProduct, commonDescription: string): string => {
    const description = product.description.trim() || commonDescription.trim();

    const lines = [
        product.name,
        product.priceText ? `Giá: ${product.priceText}` : "",
        product.category ? `Danh mục: ${product.category}` : "",
        description
    ].filter(Boolean);

    return lines.join("\n");
};

const safeFilename = (value: string): string => {
    const filename = value
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

    return filename || "product";
};

const downloadDataUrl = (dataUrl: string, filename: string): void => {
    const link = document.createElement("a");

    link.href = dataUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();
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

export default function LocalProductsPage() {
    const [products, setProducts] = useState<LocalProduct[]>([]);
    const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
    const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
    const [editingId, setEditingId] = useState<string>("");
    const [query, setQuery] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false);
    const [isSettingsReady, setIsSettingsReady] = useState<boolean>(false);

    const filteredProducts = useMemo(() => {
        const keyword = query.trim().toLowerCase();

        if (!keyword) return products;

        return products.filter((product) => {
            const content = `${product.name} ${product.description} ${product.priceText} ${product.category}`.toLowerCase();
            return content.includes(keyword);
        });
    }, [products, query]);

    const visibleProducts = useMemo(() => {
        return products.filter((product) => product.status === "active").length;
    }, [products]);

    const hiddenProducts = useMemo(() => {
        return products.filter((product) => product.status === "hidden").length;
    }, [products]);

    const totalImages = useMemo(() => {
        return products.reduce((total, product) => total + product.images.length, 0);
    }, [products]);

    const loadProducts = async (): Promise<void> => {
        const list = await getAllProductsFromDb();
        const sortedList = list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        setProducts(sortedList);
    };

    useEffect(() => {
        setSettings(loadGlobalSettings());
        setIsSettingsReady(true);
        void loadProducts();
    }, []);

    useEffect(() => {
        if (!isSettingsReady) return;

        saveGlobalSettings({
            ...settings,
            updatedAt: new Date().toISOString()
        });
    }, [settings.commonDescription, settings.globalNote, isSettingsReady]);

    const updateDraftField = <Key extends keyof ProductDraft>(key: Key, value: ProductDraft[Key]): void => {
        setDraft((current) => ({
            ...current,
            [key]: value
        }));
    };

    const updateSettingField = <Key extends keyof GlobalSettings>(key: Key, value: GlobalSettings[Key]): void => {
        setSettings((current) => ({
            ...current,
            [key]: value
        }));
    };

    const appendImagesToDraft = async (files: File[]): Promise<void> => {
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));

        if (imageFiles.length === 0) {
            setMessage("Không tìm thấy file ảnh phù hợp");
            return;
        }

        setIsProcessingImages(true);

        try {
            const images = await convertFilesToImages(imageFiles);

            setDraft((current) => ({
                ...current,
                images: [...current.images, ...images]
            }));

            setMessage(`Đã thêm ${images.length} ảnh`);
        } finally {
            setIsProcessingImages(false);
        }
    };

    const handleImageInput = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const files = Array.from(event.target.files ?? []);
        await appendImagesToDraft(files);
        event.target.value = "";
    };

    const handlePaste = async (event: React.ClipboardEvent): Promise<void> => {
        const files = Array.from(event.clipboardData.files);
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));

        if (imageFiles.length === 0) return;

        await appendImagesToDraft(imageFiles);
    };

    const handleDrop = async (event: DragEvent<HTMLLabelElement>): Promise<void> => {
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
            images: current.images.filter((image) => image.id !== imageId)
        }));
    };

    const moveDraftImage = (imageId: string, direction: "up" | "down"): void => {
        setDraft((current) => {
            const currentIndex = current.images.findIndex((image) => image.id === imageId);

            if (currentIndex === -1) return current;

            const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

            if (targetIndex < 0 || targetIndex >= current.images.length) return current;

            const nextImages = [...current.images];
            const currentImage = nextImages[currentIndex];
            const targetImage = nextImages[targetIndex];

            if (!currentImage || !targetImage) return current;

            nextImages[currentIndex] = targetImage;
            nextImages[targetIndex] = currentImage;

            return {
                ...current,
                images: nextImages
            };
        });
    };

    const resetForm = (): void => {
        setDraft(emptyDraft);
        setEditingId("");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        const now = new Date().toISOString();
        const name = draft.name.trim();
        const description = draft.description.trim();
        const priceText = draft.priceText.trim();
        const category = draft.category.trim();

        if (!name) {
            setMessage("Vui lòng nhập tên sản phẩm");
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
            status: draft.status,
            images: draft.images,
            createdAt: currentProduct?.createdAt ?? now,
            updatedAt: now
        };

        await saveProductToDb(product);
        await loadProducts();

        resetForm();
        setMessage(editingId ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm");
    };

    const handleEdit = (product: LocalProduct): void => {
        setEditingId(product.id);
        setDraft({
            name: product.name,
            description: product.description,
            priceText: product.priceText,
            category: product.category,
            status: product.status,
            images: product.images
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (id: string): Promise<void> => {
        const accepted = window.confirm("Xóa sản phẩm này?");

        if (!accepted) return;

        await deleteProductFromDb(id);
        await loadProducts();
        setMessage("Đã xóa sản phẩm");
    };

    const handleCopyField = async (label: string, value: string): Promise<void> => {
        await copyText(value);
        setMessage(`Đã copy ${label}`);
    };

    const handleExportJson = (): void => {
        const payload: ExportPayload = {
            version: 2,
            settings,
            products
        };

        const content = JSON.stringify(payload, null, 2);
        const blob = new Blob([content], {
            type: "application/json"
        });

        downloadBlob(blob, `local-products-${Date.now()}.json`);
        setMessage("Đã export JSON gồm sản phẩm, mô tả chung và ghi chú global");
    };

    const handleImportJson = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0];

        if (!file) return;

        try {
            const text = await file.text();
            const parsed: unknown = JSON.parse(text);

            const accepted = window.confirm("Import JSON sẽ thay thế toàn bộ dữ liệu sản phẩm hiện tại. Tiếp tục?");

            if (!accepted) {
                event.target.value = "";
                return;
            }

            if (isExportPayload(parsed)) {
                await clearProductsDb();

                for (const product of parsed.products) {
                    await saveProductToDb(product);
                }

                setSettings(parsed.settings);
                await loadProducts();
                setMessage("Đã import JSON đầy đủ");
                event.target.value = "";
                return;
            }

            if (isLocalProductArray(parsed)) {
                await clearProductsDb();

                for (const product of parsed) {
                    await saveProductToDb(product);
                }

                await loadProducts();
                setMessage("Đã import JSON sản phẩm");
                event.target.value = "";
                return;
            }

            setMessage("File JSON không đúng cấu trúc");
        } catch {
            setMessage("Không thể import file JSON");
        } finally {
            event.target.value = "";
        }
    };

    const handleDownloadProductImages = (product: LocalProduct): void => {
        if (product.images.length === 0) {
            setMessage("Sản phẩm chưa có ảnh để tải");
            return;
        }

        const productName = safeFilename(product.name);

        product.images.forEach((image, index) => {
            const filename = `${productName}-${String(index + 1).padStart(2, "0")}.webp`;

            setTimeout(() => {
                downloadDataUrl(image.dataUrl, filename);
            }, index * 180);
        });

        setMessage(`Đang tải ${product.images.length} ảnh của ${product.name}`);
    };

    const handleDownloadAllImages = (): void => {
        const allImages = products.flatMap((product) =>
            product.images.map((image, index) => ({
                productName: product.name,
                image,
                index
            }))
        );

        if (allImages.length === 0) {
            setMessage("Chưa có ảnh để tải");
            return;
        }

        allImages.forEach((item, globalIndex) => {
            const productName = safeFilename(item.productName);
            const filename = `${productName}-${String(item.index + 1).padStart(2, "0")}.webp`;

            setTimeout(() => {
                downloadDataUrl(item.image.dataUrl, filename);
            }, globalIndex * 180);
        });

        setMessage(`Đang tải ${allImages.length} ảnh`);
    };

    return (
        <main
            className="min-h-screen w-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#1e293b_0,#020617_34%,#020617_100%)] p-2 text-slate-100 xl:p-0"
            onPaste={(event) => {
                void handlePaste(event);
            }}
        >
            <section className="flex w-screen flex-col gap-2 xl:min-h-screen xl:p-2">
                <header className="rounded-2xl border border-cyan-400/20 bg-slate-950/80 p-2 shadow-2xl shadow-cyan-950/30 backdrop-blur">
                    <div className="grid grid-cols-1 gap-2 xl:grid-cols-[1fr_auto] xl:items-center">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                                    <FiDatabase />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="truncate text-lg font-black tracking-tight text-white xl:text-xl">Local Product Manager</h1>
                                    <p className="truncate text-xs text-slate-400">
                                        IndexedDB, paste ảnh, mô tả chung, ghi chú global, tải ảnh rời.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 xl:w-[360px]">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-200 active:scale-[0.98]"
                                onClick={handleExportJson}
                            >
                                <FiArchive />
                                Export
                            </button>

                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]">
                                <FiUploadCloud />
                                Import
                                <input type="file" accept="application/json" className="hidden" onChange={(event) => void handleImportJson(event)} />
                            </label>

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

                    <div className="mt-2 grid grid-cols-4 gap-2">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] text-slate-400">Sản phẩm</div>
                            <div className="text-lg font-black text-white">{products.length}</div>
                        </div>

                        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2">
                            <div className="text-[10px] text-emerald-200">Hiện</div>
                            <div className="text-lg font-black text-white">{visibleProducts}</div>
                        </div>

                        <div className="rounded-2xl border border-slate-400/20 bg-slate-400/10 p-2">
                            <div className="text-[10px] text-slate-300">Ẩn</div>
                            <div className="text-lg font-black text-white">{hiddenProducts}</div>
                        </div>

                        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2">
                            <div className="text-[10px] text-cyan-200">Ảnh</div>
                            <div className="text-lg font-black text-white">{totalImages}</div>
                        </div>
                    </div>

                    {message ? (
                        <div className="mt-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-xs text-cyan-100">{message}</div>
                    ) : null}
                </header>

                <section className="grid grid-cols-1 gap-2 xl:grid-cols-[360px_1fr]">
                    <aside className="flex flex-col gap-2">
                        <section className="rounded-2xl border border-fuchsia-400/20 bg-slate-950/70 p-2 shadow-2xl shadow-fuchsia-950/20 backdrop-blur">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200">
                                        <FiFileText />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-black text-white">Global Content</h2>
                                        <p className="truncate text-[11px] text-slate-400">Mô tả chung và ghi chú ngoài sản phẩm.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-300">Mô tả chung</span>
                                    <textarea
                                        value={settings.commonDescription}
                                        onChange={(event) => updateSettingField("commonDescription", event.target.value)}
                                        className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-300/60"
                                        placeholder="Dùng khi sản phẩm không có mô tả riêng..."
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-300">Ghi chú global</span>
                                    <textarea
                                        value={settings.globalNote}
                                        onChange={(event) => updateSettingField("globalNote", event.target.value)}
                                        className="min-h-20 rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-300/60"
                                        placeholder="Ghi chú riêng, không nằm trong sản phẩm..."
                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
                                        onClick={() => void handleCopyField("mô tả chung", settings.commonDescription)}
                                    >
                                        <FiCopy />
                                        Copy mô tả
                                    </button>

                                    <button
                                        type="button"
                                        className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
                                        onClick={() => void handleCopyField("ghi chú global", settings.globalNote)}
                                    >
                                        <FiClipboard />
                                        Copy ghi chú
                                    </button>
                                </div>
                            </div>
                        </section>

                        <form
                            className="rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-2 shadow-2xl shadow-cyan-950/20 backdrop-blur xl:sticky xl:top-2"
                            onSubmit={(event) => void handleSubmit(event)}
                        >
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                                        {editingId ? <FiEdit3 /> : <FiPlus />}
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-black text-white">{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
                                        <p className="truncate text-[11px] text-slate-400">Chọn, kéo thả hoặc paste ảnh.</p>
                                    </div>
                                </div>

                                {editingId ? (
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
                                        onClick={resetForm}
                                    >
                                        <FiX />
                                    </button>
                                ) : null}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-300">Tên sản phẩm</span>
                                    <input
                                        value={draft.name}
                                        onChange={(event) => updateDraftField("name", event.target.value)}
                                        className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                                        placeholder="Dell Latitude 7440 i5 13th"
                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-2">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-slate-300">Giá</span>
                                        <input
                                            value={draft.priceText}
                                            onChange={(event) => updateDraftField("priceText", event.target.value)}
                                            className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                                            placeholder="13tr8"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-slate-300">Danh mục</span>
                                        <input
                                            value={draft.category}
                                            onChange={(event) => updateDraftField("category", event.target.value)}
                                            className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                                            placeholder="Laptop"
                                        />
                                    </label>
                                </div>

                                <label className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-300">Mô tả sản phẩm</span>
                                    <textarea
                                        value={draft.description}
                                        onChange={(event) => updateDraftField("description", event.target.value)}
                                        className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                                        placeholder="Để trống nếu muốn dùng mô tả chung..."
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-300">Trạng thái</span>
                                    <select
                                        value={draft.status}
                                        onChange={(event) => updateDraftField("status", event.target.value as ProductStatus)}
                                        className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-sm text-white outline-none transition focus:border-cyan-300/60"
                                    >
                                        <option value="active">Đang hiển thị</option>
                                        <option value="hidden">Ẩn</option>
                                    </select>
                                </label>

                                <label
                                    className={`cursor-pointer rounded-2xl border border-dashed p-2 text-center transition ${isDragging
                                        ? "border-cyan-300/80 bg-cyan-300/10"
                                        : "border-white/15 bg-slate-950/70 hover:border-cyan-300/50 hover:bg-cyan-300/5"
                                        }`}
                                    onDrop={(event) => void handleDrop(event)}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                >
                                    <div className="flex items-center justify-center gap-2 text-sm font-black text-white">
                                        <FiUploadCloud />
                                        {isProcessingImages ? "Đang xử lý ảnh..." : "Chọn / kéo thả / paste ảnh"}
                                    </div>
                                    <div className="mt-2 text-xs leading-5 text-slate-400">Hỗ trợ nhiều ảnh, tự nén WebP.</div>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => void handleImageInput(event)} />
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
                                                Xóa
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 xl:grid-cols-3">
                                            {draft.images.map((image, index) => (
                                                <div key={image.id} className="group relative overflow-hidden rounded-2xl bg-slate-900">
                                                    <img src={image.dataUrl} alt={image.name} className="aspect-square w-full object-cover" />

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
                                                            onClick={() => moveDraftImage(image.id, "down")}
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

                                <button
                                    type="submit"
                                    className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 p-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200 active:scale-[0.98]"
                                >
                                    {editingId ? <FiRefreshCcw /> : <FiPlus />}
                                    {editingId ? "Cập nhật" : "Lưu sản phẩm"}
                                </button>
                            </div>
                        </form>
                    </aside>

                    <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-2 shadow-2xl shadow-black/30 backdrop-blur">
                        <div className="mb-2 grid grid-cols-1 gap-2 xl:grid-cols-[1fr_360px] xl:items-center">
                            <div className="min-w-0">
                                <h2 className="text-sm font-black text-white">Danh sách sản phẩm</h2>
                                <p className="truncate text-xs text-slate-400">Grid nhỏ gọn, xem nhiều sản phẩm cùng lúc.</p>
                            </div>

                            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 p-2 text-slate-400">
                                <FiSearch className="shrink-0" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                                    placeholder="Tìm sản phẩm"
                                />
                            </label>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-2 text-center text-sm text-slate-400">
                                Chưa có sản phẩm phù hợp.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2 xl:grid-cols-5">
                                {filteredProducts.map((product) => {
                                    const postText = buildPostText(product, settings.commonDescription);
                                    const descriptionPreview = product.description.trim() || settings.commonDescription.trim();

                                    return (
                                        <article
                                            key={product.id}
                                            className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-slate-900"
                                        >
                                            <div className="relative bg-slate-900">
                                                {product.images[0] ? (
                                                    <img src={product.images[0].dataUrl} alt={product.name} className="aspect-[4/3] w-full object-cover" />
                                                ) : (
                                                    <div className="flex aspect-[4/3] items-center justify-center text-sm text-slate-500">
                                                        <FiImage />
                                                    </div>
                                                )}

                                                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-2xl bg-black/70 px-2 py-1 text-[11px] font-bold text-white">
                                                    <FiImage />
                                                    {product.images.length}
                                                </div>

                                                <div
                                                    className={`absolute right-2 top-2 flex items-center gap-1 rounded-2xl px-2 py-1 text-[11px] font-bold ${product.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-600 text-white"
                                                        }`}
                                                >
                                                    {product.status === "active" ? <FiEye /> : <FiEyeOff />}
                                                    {product.status === "active" ? "Hiện" : "Ẩn"}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 p-2">
                                                <div className="min-w-0">
                                                    {product.category ? (
                                                        <div className="truncate text-[10px] font-black uppercase tracking-wide text-cyan-200">{product.category}</div>
                                                    ) : null}

                                                    <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-white">{product.name}</h3>

                                                    <div className="mt-2 truncate text-lg font-black text-cyan-200">{product.priceText || "Chưa có giá"}</div>
                                                </div>

                                                <p className="line-clamp-3 min-h-[3.75rem] whitespace-pre-line rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-xs leading-5 text-slate-300">
                                                    {descriptionPreview || "Chưa có mô tả"}
                                                </p>

                                                {product.images.length > 1 ? (
                                                    <div className="flex gap-2 overflow-x-auto">
                                                        {product.images.slice(1, 5).map((image) => (
                                                            <img key={image.id} src={image.dataUrl} alt={image.name} className="h-9 w-9 shrink-0 rounded-xl object-cover" />
                                                        ))}

                                                        {product.images.length > 5 ? (
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-white">
                                                                +{product.images.length - 5}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                ) : null}

                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-2 text-[11px] font-bold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
                                                        onClick={() => void handleCopyField("tên", product.name)}
                                                    >
                                                        <FiCopy />
                                                        Tên
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-2 text-[11px] font-bold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
                                                        onClick={() => void handleCopyField("giá", product.priceText)}
                                                    >
                                                        <FiCopy />
                                                        Giá
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-2 text-[11px] font-bold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
                                                        onClick={() => void handleCopyField("mô tả", descriptionPreview)}
                                                    >
                                                        <FiFileText />
                                                        Mô tả
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center gap-1 rounded-2xl bg-cyan-300 p-2 text-[11px] font-black text-slate-950 transition hover:bg-cyan-200 active:scale-[0.98]"
                                                        onClick={() => void handleCopyField("bài đăng", postText)}
                                                    >
                                                        <FiClipboard />
                                                        Bài
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-2">
                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-2 text-[11px] font-bold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        <FiEdit3 />
                                                        Sửa
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-2 text-[11px] font-bold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
                                                        onClick={() => handleDownloadProductImages(product)}
                                                    >
                                                        <FiDownload />
                                                        Ảnh
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center gap-1 rounded-2xl bg-red-500 p-2 text-[11px] font-black text-white transition hover:bg-red-400 active:scale-[0.98]"
                                                        onClick={() => void handleDelete(product.id)}
                                                    >
                                                        <FiTrash2 />
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
            </section>
        </main>
    );
}