"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
    type ClipboardEvent,
} from "react";
import { Button, Input, Progress } from "react-daisyui";
import { toast, ToastContainer, type ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type MediaKind = "image" | "video" | "other";

type MediaItem = {
    id: string;
    file: File;
    name: string;
    type: string;
    size: number;
    lastModified: number;
    previewUrl: string;
    kind: MediaKind;
};

type BackupMode = "idle" | "exporting" | "importing";

type ProgressState = {
    mode: BackupMode;
    title: string;
    detail: string;
    processedBytes: number;
    totalBytes: number;
    fileIndex: number;
    fileCount: number;
};

type WritableFileStreamLike = {
    write: (data: Uint8Array | ArrayBuffer | Blob | string) => Promise<void>;
    close: () => Promise<void>;
};

type SaveFileHandleLike = {
    createWritable: () => Promise<WritableFileStreamLike>;
};

type DirectoryHandleLike = {
    getFileHandle: (
        name: string,
        options?: {
            create?: boolean;
        },
    ) => Promise<SaveFileHandleLike>;
    getDirectoryHandle: (
        name: string,
        options?: {
            create?: boolean;
        },
    ) => Promise<DirectoryHandleLike>;
};

type SaveFilePickerOptionsLike = {
    suggestedName?: string;
    types?: Array<{
        description: string;
        accept: Record<string, string[]>;
    }>;
};

type WindowWithFileSystemAccess = Window & {
    showSaveFilePicker?: (
        options?: SaveFilePickerOptionsLike,
    ) => Promise<SaveFileHandleLike>;
    showDirectoryPicker?: () => Promise<DirectoryHandleLike>;
};

type ArchiveStartPayload = {
    kind: "archive-start";
    app: string;
    version: number;
    createdAt: string;
    fileCount: number;
    totalBytes: number;
    chunkSize: number;
};

type FileStartPayload = {
    kind: "file-start";
    index: number;
    name: string;
    type: string;
    size: number;
    lastModified: number;
};

type FileEndPayload = {
    kind: "file-end";
    index: number;
    name: string;
    bytesWritten: number;
    chunkCount: number;
};

type ArchiveEndPayload = {
    kind: "archive-end";
    fileCount: number;
    totalBytes: number;
    finishedAt: string;
};

const MAGIC_TEXT = "7TBK1\n";
const MAGIC_BYTES = new TextEncoder().encode(MAGIC_TEXT);
const SALT_LENGTH = 16;
const AES_GCM_NONCE_LENGTH = 12;
const PBKDF2_ITERATIONS = 250_000;
const DEFAULT_CHUNK_SIZE = 8 * 1024 * 1024;
const HEADER_LENGTH = MAGIC_BYTES.length + SALT_LENGTH + 4 + 4;
const RECORD_HEADER_LENGTH = 1 + AES_GCM_NONCE_LENGTH + 4;

const RECORD_ARCHIVE_START = 1;
const RECORD_FILE_START = 2;
const RECORD_FILE_CHUNK = 3;
const RECORD_FILE_END = 4;
const RECORD_ARCHIVE_END = 5;
const MIN_PASSWORD_LENGTH = 4;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const toCryptoBuffer = (bytes: Uint8Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(bytes.byteLength);

    new Uint8Array(buffer).set(bytes);

    return buffer;
};

const emptyProgress: ProgressState = {
    mode: "idle",
    title: "",
    detail: "",
    processedBytes: 0,
    totalBytes: 0,
    fileIndex: 0,
    fileCount: 0,
};

const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 2600,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
};

const Toastify = (message: string, statusCode: number): void => {
    if (statusCode >= 200 && statusCode < 300) {
        toast.success(message, toastOptions);
        return;
    }

    if (statusCode >= 300 && statusCode < 400) {
        toast.warning(message, toastOptions);
        return;
    }

    if (statusCode >= 400) {
        toast.error(message, toastOptions);
        return;
    }

    toast.info(message, toastOptions);
};

const isValidBackupPassword = (value: string): boolean => {
    return new RegExp(`^\\d{${MIN_PASSWORD_LENGTH},}$`, "u").test(value.trim());
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isFileStartPayload = (value: unknown): value is FileStartPayload => {
    if (!isRecord(value)) return false;

    return (
        value.kind === "file-start" &&
        typeof value.index === "number" &&
        typeof value.name === "string" &&
        typeof value.type === "string" &&
        typeof value.size === "number" &&
        typeof value.lastModified === "number"
    );
};

const isFileEndPayload = (value: unknown): value is FileEndPayload => {
    if (!isRecord(value)) return false;

    return (
        value.kind === "file-end" &&
        typeof value.index === "number" &&
        typeof value.name === "string" &&
        typeof value.bytesWritten === "number" &&
        typeof value.chunkCount === "number"
    );
};

const isArchiveEndPayload = (value: unknown): value is ArchiveEndPayload => {
    if (!isRecord(value)) return false;

    return (
        value.kind === "archive-end" &&
        typeof value.fileCount === "number" &&
        typeof value.totalBytes === "number" &&
        typeof value.finishedAt === "string"
    );
};

const parseJsonPayload = (bytes: Uint8Array): unknown => {
    return JSON.parse(textDecoder.decode(bytes)) as unknown;
};

const jsonToBytes = (value: unknown): Uint8Array => {
    return textEncoder.encode(JSON.stringify(value));
};

const formatBytes = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const value = bytes / 1024 ** exponent;

    return `${value.toFixed(value >= 100 || exponent === 0 ? 0 : 2)} ${units[exponent]}`;
};

const createBackupFileName = (): string => {
    const date = new Date().toISOString().replace(/[:.]/g, "-");

    return `7teck-media-backup-${date}.7tbk`;
};

const createRestoreFolderName = (): string => {
    const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

    return `7teck-restore-${date}`;
};

const getMediaKind = (file: File): MediaKind => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";

    return "other";
};

const createMediaItems = (files: File[]): MediaItem[] => {
    return files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        name: file.name || "media-file",
        type: file.type || "application/octet-stream",
        size: file.size,
        lastModified: file.lastModified,
        previewUrl: URL.createObjectURL(file),
        kind: getMediaKind(file),
    }));
};

const safeFileName = (name: string, fallback: string): string => {
    const trimmedName = name.trim() || fallback;
    const cleanName = trimmedName
        .replace(/[\\/:*?"<>|]+/g, "_")
        .replace(/\s+/g, " ")
        .trim();

    return cleanName || fallback;
};

const createUniqueFileName = (
    name: string,
    usedNames: Map<string, number>,
): string => {
    const cleanName = safeFileName(name, "media-file");
    const lowerName = cleanName.toLowerCase();
    const count = usedNames.get(lowerName) ?? 0;

    usedNames.set(lowerName, count + 1);

    if (count === 0) return cleanName;

    const dotIndex = cleanName.lastIndexOf(".");

    if (dotIndex <= 0) return `${cleanName}-${count + 1}`;

    const baseName = cleanName.slice(0, dotIndex);
    const extension = cleanName.slice(dotIndex);

    return `${baseName}-${count + 1}${extension}`;
};

const createSafeFolderName = (name: string): string => {
    const cleanName = safeFileName(name, createRestoreFolderName()).replace(/\.+$/u, "");

    return cleanName || createRestoreFolderName();
};

const getRestoreDirectory = async (
    parentDirectory: DirectoryHandleLike,
    folderName: string,
): Promise<DirectoryHandleLike> => {
    return parentDirectory.getDirectoryHandle(createSafeFolderName(folderName), {
        create: true,
    });
};

const getWindowFileSystemAccess = (): WindowWithFileSystemAccess => {
    return window as WindowWithFileSystemAccess;
};

const assertCryptoSupport = (): void => {
    if (typeof crypto === "undefined" || !crypto.subtle) {
        throw new Error("Trình duyệt chưa hỗ trợ Web Crypto. Hãy dùng HTTPS hoặc localhost.");
    }
};

const assertExportSupport = (): void => {
    assertCryptoSupport();

    if (!getWindowFileSystemAccess().showSaveFilePicker) {
        throw new Error("Trình duyệt chưa hỗ trợ lưu file lớn. Nên dùng Chrome hoặc Edge bản mới.");
    }
};

const assertImportSupport = (): void => {
    assertCryptoSupport();

    if (!getWindowFileSystemAccess().showDirectoryPicker) {
        throw new Error("Trình duyệt chưa hỗ trợ chọn thư mục khôi phục. Nên dùng Chrome hoặc Edge bản mới.");
    }
};

const deriveBackupKey = async (
    password: string,
    salt: Uint8Array,
): Promise<CryptoKey> => {
    const passwordBytes = textEncoder.encode(password);
    const baseKey = await crypto.subtle.importKey(
        "raw",
        toCryptoBuffer(passwordBytes),
        "PBKDF2",
        false,
        ["deriveKey"],
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: toCryptoBuffer(salt),
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        baseKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        false,
        ["encrypt", "decrypt"],
    );
};

const createBackupHeader = (salt: Uint8Array): Uint8Array => {
    const header = new Uint8Array(HEADER_LENGTH);
    const view = new DataView(header.buffer);

    header.set(MAGIC_BYTES, 0);
    header.set(salt, MAGIC_BYTES.length);
    view.setUint32(MAGIC_BYTES.length + SALT_LENGTH, PBKDF2_ITERATIONS, false);
    view.setUint32(MAGIC_BYTES.length + SALT_LENGTH + 4, DEFAULT_CHUNK_SIZE, false);

    return header;
};

const readHeader = (bytes: Uint8Array): {
    salt: Uint8Array;
    iterations: number;
    chunkSize: number;
} => {
    if (bytes.length !== HEADER_LENGTH) {
        throw new Error("Header file backup không hợp lệ.");
    }

    const magic = textDecoder.decode(bytes.slice(0, MAGIC_BYTES.length));

    if (magic !== MAGIC_TEXT) {
        throw new Error("File không đúng định dạng 7Teck Media Backup.");
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const saltStart = MAGIC_BYTES.length;
    const iterationsOffset = MAGIC_BYTES.length + SALT_LENGTH;
    const chunkSizeOffset = iterationsOffset + 4;

    return {
        salt: bytes.slice(saltStart, saltStart + SALT_LENGTH),
        iterations: view.getUint32(iterationsOffset, false),
        chunkSize: view.getUint32(chunkSizeOffset, false),
    };
};

const encryptRecord = async (
    key: CryptoKey,
    recordType: number,
    payload: Uint8Array,
): Promise<Uint8Array> => {
    const nonce = crypto.getRandomValues(new Uint8Array(AES_GCM_NONCE_LENGTH));
    const additionalData = new Uint8Array([recordType]);
    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: toCryptoBuffer(nonce),
            additionalData: toCryptoBuffer(additionalData),
        },
        key,
        toCryptoBuffer(payload),
    );
    const encrypted = new Uint8Array(encryptedBuffer);
    const record = new Uint8Array(RECORD_HEADER_LENGTH + encrypted.byteLength);
    const view = new DataView(record.buffer);

    record[0] = recordType;
    record.set(nonce, 1);
    view.setUint32(1 + AES_GCM_NONCE_LENGTH, encrypted.byteLength, false);
    record.set(encrypted, RECORD_HEADER_LENGTH);

    return record;
};

const decryptRecordPayload = async (
    key: CryptoKey,
    recordType: number,
    nonce: Uint8Array,
    encrypted: Uint8Array,
): Promise<Uint8Array> => {
    const additionalData = new Uint8Array([recordType]);
    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: toCryptoBuffer(nonce),
            additionalData: toCryptoBuffer(additionalData),
        },
        key,
        toCryptoBuffer(encrypted),
    );

    return new Uint8Array(decryptedBuffer);
};

const getReadableBackupErrorMessage = (error: unknown): string => {
    if (error instanceof DOMException && error.name === "OperationError") {
        return "Mật khẩu không đúng hoặc file backup đã bị sửa/hỏng.";
    }

    if (error instanceof DOMException && error.name === "AbortError") {
        return "Đã hủy thao tác chọn file hoặc thư mục.";
    }

    if (error instanceof Error) return error.message;

    return "Không thể giải mã file backup. Kiểm tra lại mật khẩu hoặc file.";
};

const writeEncryptedRecord = async (
    writable: WritableFileStreamLike,
    key: CryptoKey,
    recordType: number,
    payload: Uint8Array,
): Promise<void> => {
    const record = await encryptRecord(key, recordType, payload);

    await writable.write(record);
};

class StreamByteReader {
    private readonly reader: ReadableStreamDefaultReader<Uint8Array>;

    private readonly chunks: Uint8Array[] = [];

    private bufferedLength = 0;

    constructor(stream: ReadableStream<Uint8Array>) {
        this.reader = stream.getReader();
    }

    async readExactly(length: number): Promise<Uint8Array | null> {
        while (this.bufferedLength < length) {
            const result = await this.reader.read();

            if (result.done) {
                if (this.bufferedLength === 0) return null;

                throw new Error("File backup bị thiếu dữ liệu hoặc đã bị hỏng.");
            }

            if (result.value.byteLength > 0) {
                this.chunks.push(result.value);
                this.bufferedLength += result.value.byteLength;
            }
        }

        const output = new Uint8Array(length);
        let copied = 0;

        while (copied < length) {
            const firstChunk = this.chunks[0];

            if (!firstChunk) {
                throw new Error("Không thể đọc đủ dữ liệu từ file backup.");
            }

            const needed = length - copied;
            const take = Math.min(needed, firstChunk.byteLength);

            output.set(firstChunk.slice(0, take), copied);
            copied += take;

            if (take === firstChunk.byteLength) {
                this.chunks.shift();
            } else {
                this.chunks[0] = firstChunk.slice(take);
            }

            this.bufferedLength -= take;
        }

        return output;
    }
}

const readEncryptedRecord = async (
    byteReader: StreamByteReader,
    key: CryptoKey,
): Promise<{
    recordType: number;
    payload: Uint8Array;
} | null> => {
    const header = await byteReader.readExactly(RECORD_HEADER_LENGTH);

    if (!header) return null;

    const recordType = header[0] ?? 0;
    const nonce = header.slice(1, 1 + AES_GCM_NONCE_LENGTH);
    const view = new DataView(header.buffer, header.byteOffset, header.byteLength);
    const encryptedLength = view.getUint32(1 + AES_GCM_NONCE_LENGTH, false);

    if (encryptedLength <= 0) {
        throw new Error("Record trong file backup không hợp lệ.");
    }

    const encrypted = await byteReader.readExactly(encryptedLength);

    if (!encrypted) {
        throw new Error("File backup bị thiếu payload mã hóa.");
    }

    const payload = await decryptRecordPayload(key, recordType, nonce, encrypted);

    return {
        recordType,
        payload,
    };
};

const createProgressPercent = (progress: ProgressState): number => {
    if (progress.totalBytes <= 0) return 0;

    return Math.min(100, Math.round((progress.processedBytes / progress.totalBytes) * 100));
};

export default function MediaBackupPage() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const backupInputRef = useRef<HTMLInputElement | null>(null);
    const [items, setItems] = useState<MediaItem[]>([]);
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [restorePassword, setRestorePassword] = useState<string>("");
    const [progress, setProgress] = useState<ProgressState>(emptyProgress);
    const [restoreFolderName, setRestoreFolderName] = useState<string>(() => createRestoreFolderName());
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const totalBytes = useMemo(() => {
        return items.reduce((total, item) => total + item.size, 0);
    }, [items]);

    const imageCount = useMemo(() => {
        return items.filter((item) => item.kind === "image").length;
    }, [items]);

    const videoCount = useMemo(() => {
        return items.filter((item) => item.kind === "video").length;
    }, [items]);

    const progressPercent = useMemo(() => {
        return createProgressPercent(progress);
    }, [progress]);

    const canExport = useMemo(() => {
        return (
            items.length > 0 &&
            isValidBackupPassword(password) &&
            password === confirmPassword &&
            progress.mode === "idle"
        );
    }, [confirmPassword, items.length, password, progress.mode]);

    useEffect(() => {
        return () => {
            items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        };
    }, [items]);

    const addFiles = (files: File[]): void => {
        const mediaFiles = files.filter((file) => {
            return file.type.startsWith("image/") || file.type.startsWith("video/");
        });

        if (mediaFiles.length === 0) {
            Toastify("Không tìm thấy ảnh hoặc video phù hợp.", 400);
            return;
        }

        const nextItems = createMediaItems(mediaFiles);

        setItems((current) => [...nextItems, ...current]);
        Toastify(`Đã thêm ${nextItems.length} file media.`, 200);
    };

    const handleFileInput = (event: ChangeEvent<HTMLInputElement>): void => {
        const files = Array.from(event.target.files ?? []);

        addFiles(files);
        event.target.value = "";
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
        event.preventDefault();
        setIsDragging(false);

        addFiles(Array.from(event.dataTransfer.files));
    };

    const handlePaste = (event: ClipboardEvent<HTMLDivElement>): void => {
        const files = Array.from(event.clipboardData.files);

        if (files.length === 0) return;

        addFiles(files);
    };

    const removeItem = (id: string): void => {
        setItems((current) => {
            const target = current.find((item) => item.id === id);

            if (target) URL.revokeObjectURL(target.previewUrl);

            return current.filter((item) => item.id !== id);
        });
    };

    const clearItems = (): void => {
        items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setItems([]);
    };

    const exportEncryptedBackup = async (): Promise<void> => {
        try {
            assertExportSupport();

            if (items.length === 0) {
                Toastify("Chưa có ảnh hoặc video để đóng gói.", 400);
                return;
            }

            if (!isValidBackupPassword(password)) {
                Toastify("Mật khẩu phải gồm tối thiểu 4 số.", 400);
                return;
            }

            if (password !== confirmPassword) {
                Toastify("Mật khẩu xác nhận chưa khớp.", 400);
                return;
            }

            const saveHandle = await getWindowFileSystemAccess().showSaveFilePicker?.({
                suggestedName: createBackupFileName(),
                types: [
                    {
                        description: "7Teck encrypted media backup",
                        accept: {
                            "application/octet-stream": [".7tbk"],
                        },
                    },
                ],
            });

            if (!saveHandle) return;

            const writable = await saveHandle.createWritable();
            const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
            const key = await deriveBackupKey(password, salt);
            const header = createBackupHeader(salt);
            const archiveStartPayload: ArchiveStartPayload = {
                kind: "archive-start",
                app: "7Teck Media Backup",
                version: 1,
                createdAt: new Date().toISOString(),
                fileCount: items.length,
                totalBytes,
                chunkSize: DEFAULT_CHUNK_SIZE,
            };

            setProgress({
                mode: "exporting",
                title: "Đang đóng gói và mã hóa...",
                detail: "Đang tạo file backup",
                processedBytes: 0,
                totalBytes,
                fileIndex: 0,
                fileCount: items.length,
            });

            await writable.write(header);
            await writeEncryptedRecord(
                writable,
                key,
                RECORD_ARCHIVE_START,
                jsonToBytes(archiveStartPayload),
            );

            let processedBytes = 0;

            for (let index = 0; index < items.length; index += 1) {
                const item = items[index];

                if (!item) continue;

                const fileStartPayload: FileStartPayload = {
                    kind: "file-start",
                    index,
                    name: item.name,
                    type: item.type,
                    size: item.size,
                    lastModified: item.lastModified,
                };

                await writeEncryptedRecord(
                    writable,
                    key,
                    RECORD_FILE_START,
                    jsonToBytes(fileStartPayload),
                );

                const reader = item.file.stream().getReader();
                let bytesWritten = 0;
                let chunkCount = 0;

                while (true) {
                    const result = await reader.read();

                    if (result.done) break;
                    if (!result.value || result.value.byteLength === 0) continue;

                    const chunk = result.value;

                    await writeEncryptedRecord(writable, key, RECORD_FILE_CHUNK, chunk);

                    bytesWritten += chunk.byteLength;
                    processedBytes += chunk.byteLength;
                    chunkCount += 1;

                    setProgress({
                        mode: "exporting",
                        title: "Đang đóng gói và mã hóa...",
                        detail: `${index + 1}/${items.length} · ${item.name}`,
                        processedBytes,
                        totalBytes,
                        fileIndex: index + 1,
                        fileCount: items.length,
                    });
                }

                const fileEndPayload: FileEndPayload = {
                    kind: "file-end",
                    index,
                    name: item.name,
                    bytesWritten,
                    chunkCount,
                };

                await writeEncryptedRecord(
                    writable,
                    key,
                    RECORD_FILE_END,
                    jsonToBytes(fileEndPayload),
                );
            }

            const archiveEndPayload: ArchiveEndPayload = {
                kind: "archive-end",
                fileCount: items.length,
                totalBytes,
                finishedAt: new Date().toISOString(),
            };

            await writeEncryptedRecord(
                writable,
                key,
                RECORD_ARCHIVE_END,
                jsonToBytes(archiveEndPayload),
            );
            await writable.close();

            setProgress(emptyProgress);
            Toastify("Đã xuất file backup mã hóa thành công.", 200);
        } catch (error) {
            setProgress(emptyProgress);
            Toastify(error instanceof Error ? error.message : "Không thể xuất backup.", 400);
        }
    };

    const restoreEncryptedBackup = async (backupFile: File): Promise<void> => {
        let currentWritable: WritableFileStreamLike | null = null;

        try {
            assertImportSupport();

            if (!isValidBackupPassword(restorePassword)) {
                Toastify("Vui lòng nhập mật khẩu giải mã tối thiểu 4 số.", 400);
                return;
            }

            const byteReader = new StreamByteReader(backupFile.stream());
            const headerBytes = await byteReader.readExactly(HEADER_LENGTH);

            if (!headerBytes) {
                throw new Error("File backup rỗng hoặc không hợp lệ.");
            }

            const header = readHeader(headerBytes);

            if (header.iterations !== PBKDF2_ITERATIONS) {
                throw new Error("File backup dùng phiên bản mã hóa chưa được page này hỗ trợ.");
            }

            setProgress({
                mode: "importing",
                title: "Đang kiểm tra mật khẩu...",
                detail: "Nếu mật khẩu sai, app sẽ dừng trước khi chọn thư mục xuất file.",
                processedBytes: 0,
                totalBytes: backupFile.size,
                fileIndex: 0,
                fileCount: 0,
            });

            const key = await deriveBackupKey(restorePassword, header.salt);
            const firstRecord = await readEncryptedRecord(byteReader, key);

            if (!firstRecord || firstRecord.recordType !== RECORD_ARCHIVE_START) {
                throw new Error("File backup không có record mở đầu hợp lệ.");
            }

            const firstPayload = parseJsonPayload(firstRecord.payload);

            if (!isRecord(firstPayload) || typeof firstPayload.totalBytes !== "number") {
                throw new Error("Metadata mở đầu file backup không hợp lệ.");
            }

            const totalRestoreBytes = firstPayload.totalBytes;
            const fileCount = typeof firstPayload.fileCount === "number" ? firstPayload.fileCount : 0;

            Toastify("Mật khẩu đúng. Hãy chọn thư mục để app tạo thư mục khôi phục riêng.", 200);

            const parentDirectory = await getWindowFileSystemAccess().showDirectoryPicker?.();

            if (!parentDirectory) {
                setProgress(emptyProgress);
                Toastify("Đã hủy chọn thư mục khôi phục.", 300);
                return;
            }

            const outputDirectory = await getRestoreDirectory(parentDirectory, restoreFolderName);
            const outputFolderName = createSafeFolderName(restoreFolderName);
            const usedNames = new Map<string, number>();
            let currentFileName = "";
            let processedBytes = 0;
            let restoredFileCount = 0;

            setProgress({
                mode: "importing",
                title: "Đang giải mã và khôi phục...",
                detail: `Đang xuất vào thư mục: ${outputFolderName}`,
                processedBytes: 0,
                totalBytes: totalRestoreBytes,
                fileIndex: 0,
                fileCount,
            });

            while (true) {
                const record = await readEncryptedRecord(byteReader, key);

                if (!record) break;

                if (record.recordType === RECORD_FILE_START) {
                    const payload = parseJsonPayload(record.payload);

                    if (!isFileStartPayload(payload)) {
                        throw new Error("Metadata file trong backup không hợp lệ.");
                    }

                    if (currentWritable) {
                        await currentWritable.close();
                        currentWritable = null;
                    }

                    currentFileName = createUniqueFileName(payload.name, usedNames);
                    const fileHandle = await outputDirectory.getFileHandle(currentFileName, {
                        create: true,
                    });

                    currentWritable = await fileHandle.createWritable();
                    restoredFileCount += 1;

                    setProgress({
                        mode: "importing",
                        title: "Đang giải mã và khôi phục...",
                        detail: `${restoredFileCount}/${fileCount || "?"} · ${currentFileName}`,
                        processedBytes,
                        totalBytes: totalRestoreBytes,
                        fileIndex: restoredFileCount,
                        fileCount,
                    });

                    continue;
                }

                if (record.recordType === RECORD_FILE_CHUNK) {
                    if (!currentWritable) {
                        throw new Error("Backup bị lỗi thứ tự dữ liệu file.");
                    }

                    await currentWritable.write(record.payload);
                    processedBytes += record.payload.byteLength;

                    setProgress((current) => ({
                        ...current,
                        detail: currentFileName,
                        processedBytes,
                        totalBytes: totalRestoreBytes,
                    }));

                    continue;
                }

                if (record.recordType === RECORD_FILE_END) {
                    const payload = parseJsonPayload(record.payload);

                    if (!isFileEndPayload(payload)) {
                        throw new Error("Record kết thúc file không hợp lệ.");
                    }

                    if (currentWritable) {
                        await currentWritable.close();
                        currentWritable = null;
                    }

                    currentFileName = "";
                    continue;
                }

                if (record.recordType === RECORD_ARCHIVE_END) {
                    const payload = parseJsonPayload(record.payload);

                    if (!isArchiveEndPayload(payload)) {
                        throw new Error("Record kết thúc backup không hợp lệ.");
                    }

                    break;
                }

                throw new Error("File backup chứa record không được hỗ trợ.");
            }

            if (currentWritable) {
                await currentWritable.close();
            }

            setProgress(emptyProgress);
            Toastify(`Đã khôi phục ${restoredFileCount} file nguyên bản vào thư mục ${outputFolderName}.`, 200);
        } catch (error) {
            if (currentWritable) {
                await currentWritable.close();
            }

            setProgress(emptyProgress);
            Toastify(getReadableBackupErrorMessage(error), 400);
        }
    };

    const handleBackupInput = async (
        event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file) return;

        await restoreEncryptedBackup(file);
    };

    return (
        <main
            className="min-h-screen bg-slate-950 p-3 text-slate-100 xl:p-8"
            onPaste={handlePaste}
        >
            <ToastContainer />

            <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900 p-3 xl:min-h-[calc(100vh-4rem)] xl:p-5">
                <header className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                            7Teck Secure Media Backup
                        </p>
                        <h1 className="text-2xl font-bold text-white xl:text-4xl">
                            Đóng gói ảnh/video nguyên bản và mã hóa
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-slate-300">
                            File ảnh/video được giữ nguyên binary gốc, không resize, không encode lại và không chuyển base64 JSON. Khi khôi phục, app sẽ tạo thư mục riêng để tránh xuất file lộn xộn.
                        </p>
                    </div>

                    <div className="stats stats-vertical border border-slate-800 bg-slate-900 text-slate-100 xl:stats-horizontal">
                        <div className="stat px-4 py-3">
                            <div className="stat-title text-slate-400">Tổng file</div>
                            <div className="stat-value text-xl text-white">{items.length}</div>
                        </div>
                        <div className="stat px-4 py-3">
                            <div className="stat-title text-slate-400">Ảnh / Video</div>
                            <div className="stat-value text-xl text-white">{imageCount}/{videoCount}</div>
                        </div>
                        <div className="stat px-4 py-3">
                            <div className="stat-title text-slate-400">Dung lượng</div>
                            <div className="stat-value text-xl text-white">{formatBytes(totalBytes)}</div>
                        </div>
                    </div>
                </header>

                <section className="grid flex-1 gap-4 xl:grid-cols-[390px_1fr]">
                    <aside className="flex flex-col gap-4">
                        <div
                            className={`rounded-lg border border-dashed p-4 transition ${isDragging
                                ? "border-cyan-500 bg-cyan-950"
                                : "border-slate-700 bg-slate-950"
                                }`}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                className="hidden"
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleFileInput}
                            />
                            <div className="space-y-3 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-2xl">
                                    📦
                                </div>
                                <div>
                                    <h2 className="font-semibold text-white">Thêm ảnh/video</h2>
                                    <p className="mt-1 text-sm leading-6 text-slate-400">
                                        Bấm chọn file, kéo thả hoặc dán ảnh trực tiếp vào page.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn btn-outline btn-info w-full"
                                >
                                    Chọn ảnh/video
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                            <h2 className="text-sm font-semibold text-white">Xuất backup mã hóa</h2>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                Mật khẩu dùng tối thiểu 4 số. Nếu quên mật khẩu thì không thể giải mã lại file backup.
                            </p>
                            <div className="mt-3 space-y-3">
                                <label className="block">
                                    <span className="text-xs font-medium text-slate-300">Mật khẩu mã hóa</span>
                                    <Input
                                        autoFocus
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="mt-1 w-full bg-slate-900 text-white"
                                        placeholder="Tối thiểu 4 số"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-medium text-slate-300">Nhập lại mật khẩu</span>
                                    <Input
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="mt-1 w-full bg-slate-900 text-white"
                                        placeholder="Nhập lại mật khẩu"
                                    />
                                </label>
                                <Button
                                    type="button"
                                    disabled={!canExport}
                                    onClick={() => void exportEncryptedBackup()}
                                    className="btn btn-outline btn-success w-full disabled:cursor-not-allowed"
                                >
                                    Xuất file .7tbk
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                            <h2 className="text-sm font-semibold text-white">Import và giải mã</h2>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                App kiểm tra mật khẩu trước. Nếu đúng, app mới hỏi thư mục cha và tự tạo thư mục con để xuất file gốc.
                            </p>
                            <input
                                ref={backupInputRef}
                                className="hidden"
                                type="file"
                                accept=".7tbk,application/octet-stream"
                                onChange={(event) => void handleBackupInput(event)}
                            />
                            <label className="mt-3 block">
                                <span className="text-xs font-medium text-slate-300">Mật khẩu giải mã</span>
                                <Input
                                    value={restorePassword}
                                    onChange={(event) => setRestorePassword(event.target.value)}
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="mt-1 w-full bg-slate-900 text-white"
                                    placeholder="Tối thiểu 4 số"
                                />
                            </label>
                            <label className="mt-3 block">
                                <span className="text-xs font-medium text-slate-300">Tên thư mục khôi phục sẽ tạo</span>
                                <Input
                                    value={restoreFolderName}
                                    onChange={(event) => setRestoreFolderName(event.target.value)}
                                    type="text"
                                    className="mt-1 w-full bg-slate-900 text-white"
                                    placeholder="7teck-restore"
                                />
                            </label>
                            <Button
                                type="button"
                                disabled={progress.mode !== "idle"}
                                onClick={() => backupInputRef.current?.click()}
                                className="btn btn-outline btn-warning mt-3 w-full disabled:cursor-not-allowed"
                            >
                                Chọn file backup để khôi phục
                            </Button>
                        </div>

                        <div className="alert border border-slate-800 bg-slate-950 text-slate-300">
                            <div className="text-xs leading-6">
                                <p className="font-semibold text-slate-100">Bảo mật</p>
                                <p>
                                    File .7tbk đã mã hóa. Kẻ gian lấy được file vẫn không đọc được ảnh/video nếu không có mật khẩu đúng.
                                </p>
                            </div>
                        </div>
                    </aside>

                    <section className="flex min-h-[520px] flex-col rounded-lg border border-slate-800 bg-slate-950">
                        <div className="flex flex-col gap-3 border-b border-slate-800 p-3 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <h2 className="font-semibold text-white">Danh sách media</h2>
                                <p className="text-xs text-slate-400">
                                    File được ghi theo stream/chunk, không nạp toàn bộ dữ liệu lớn vào RAM.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn btn-outline btn-sm"
                                >
                                    Thêm
                                </Button>
                                <Button
                                    type="button"
                                    disabled={items.length === 0 || progress.mode !== "idle"}
                                    onClick={clearItems}
                                    className="btn btn-outline btn-error btn-sm disabled:cursor-not-allowed"
                                >
                                    Xóa tất cả
                                </Button>
                            </div>
                        </div>

                        {items.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center p-6 text-center text-slate-400">
                                <div>
                                    <p className="text-4xl">🗂️</p>
                                    <p className="mt-3 font-medium text-slate-200">Chưa có file nào</p>
                                    <p className="mt-1 text-sm">
                                        Chọn ảnh/video hoặc dán ảnh vào page để bắt đầu đóng gói.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid max-h-[calc(100vh-220px)] grid-cols-2 gap-2 overflow-y-auto p-3 xl:grid-cols-4 2xl:grid-cols-6">
                                {items.map((item) => (
                                    <article
                                        key={item.id}
                                        className="overflow-hidden rounded-md border border-slate-800 bg-slate-900"
                                    >
                                        <div className="aspect-square bg-slate-950">
                                            {item.kind === "image" ? (
                                                <img
                                                    src={item.previewUrl}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : item.kind === "video" ? (
                                                <video
                                                    src={item.previewUrl}
                                                    className="h-full w-full object-cover"
                                                    controls
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-slate-500">
                                                    FILE
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 p-2">
                                            <p className="line-clamp-2 text-xs font-semibold text-slate-100" title={item.name}>
                                                {item.name}
                                            </p>
                                            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                                                <span>{item.kind.toUpperCase()}</span>
                                                <span>{formatBytes(item.size)}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                disabled={progress.mode !== "idle"}
                                                onClick={() => removeItem(item.id)}
                                                className="btn btn-outline btn-error btn-xs w-full disabled:cursor-not-allowed"
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </section>
            </div>

            {progress.mode !== "idle" ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4">
                    <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-5 text-white">
                        <p className="text-lg font-bold">{progress.title}</p>
                        <p className="mt-2 text-sm text-slate-300">{progress.detail}</p>
                        <Progress
                            value={progressPercent}
                            max={100}
                            className="progress-info mt-4 w-full"
                        />
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                            <span>{progressPercent}%</span>
                            <span>
                                {formatBytes(progress.processedBytes)} / {formatBytes(progress.totalBytes)}
                            </span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-slate-500">
                            Không tắt tab trong lúc đang xử lý file lớn.
                        </p>
                    </div>
                </div>
            ) : null}
        </main>
    );
}
