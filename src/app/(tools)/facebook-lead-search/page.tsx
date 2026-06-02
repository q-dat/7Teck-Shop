"use client";

import { useEffect, useMemo, useState } from "react";

type TimeFilter = "day" | "week" | "month" | "any";
type SearchScope = "natural" | "facebookGroups" | "facebookWide";
type ProductTabKey = "iphone" | "android" | "macbook" | "laptop" | "ipad" | "tablet" | "accessory" | "general";

interface SearchKeyword {
    label: string;
    query: string;
}

interface ProductTab {
    key: ProductTabKey;
    label: string;
    description: string;
    keywords: SearchKeyword[];
}

interface LeadSearchSettings {
    activeTabKey: ProductTabKey;
    timeFilter: TimeFilter;
    searchScope: SearchScope;
    selectedLocations: string[];
    customKeyword: string;
    customLocation: string;
    queueIndex: number;
}

interface GeneratedSearchLink {
    label: string;
    keyword: string;
    location: string;
    fullQuery: string;
    url: string;
}

const storageKey = "facebook-lead-search-pro-settings-v1";

const defaultLocations = ["HCM", "TP.HCM", "TPHCM", "Sài Gòn", "Hồ Chí Minh", "Quận 3", "Gò Vấp", "Bình Thạnh"];

const timeFilterMap: Record<TimeFilter, { label: string; tbs?: string }> = {
    day: {
        label: "Dưới 24 giờ",
        tbs: "qdr:d",
    },
    week: {
        label: "7 ngày qua",
        tbs: "qdr:w",
    },
    month: {
        label: "1 tháng qua",
        tbs: "qdr:m",
    },
    any: {
        label: "Mọi thời gian",
    },
};

const searchScopeMap: Record<SearchScope, { label: string; description: string }> = {
    natural: {
        label: "Tự nhiên",
        description: "Query ít toán tử hơn, phù hợp dùng hằng ngày và hạn chế bị Google đánh dấu truy vấn bất thường.",
    },
    facebookGroups: {
        label: "Group Facebook",
        description: "Tập trung vào group Facebook bằng site:facebook.com/groups. Kết quả sát hơn nhưng nên mở chậm.",
    },
    facebookWide: {
        label: "Facebook rộng",
        description: "Tìm rộng trên Facebook public, có thể ra group, page hoặc profile public.",
    },
};

const defaultSettings: LeadSearchSettings = {
    activeTabKey: "laptop",
    timeFilter: "day",
    searchScope: "natural",
    selectedLocations: ["HCM"],
    customKeyword: "",
    customLocation: "",
    queueIndex: 0,
};

const productTabs: ProductTab[] = [
    {
        key: "iphone",
        label: "iPhone",
        description: "Tìm khách đang cần mua iPhone tại khu vực đã chọn.",
        keywords: [
            { label: "Cần mua iPhone", query: "cần mua iphone" },
            { label: "Tìm mua iPhone", query: "tìm mua iphone" },
            { label: "Ai bán iPhone", query: "ai bán iphone" },
            { label: "Cần iPhone zin", query: "cần iphone zin" },
            { label: "Tìm iPhone zin", query: "tìm iphone zin" },
            { label: "iPhone zin", query: "iphone zin" },
            { label: "iPhone cũ", query: "iphone cũ" },
            { label: "Cần mua iPhone 11", query: "cần mua iphone 11" },
            { label: "Cần mua iPhone 12", query: "cần mua iphone 12" },
            { label: "Cần mua iPhone 13", query: "cần mua iphone 13" },
            { label: "Cần mua iPhone 14", query: "cần mua iphone 14" },
            { label: "Cần mua iPhone 15", query: "cần mua iphone 15" },
            { label: "Cần mua iPhone Pro Max", query: "cần mua iphone pro max" },
            { label: "Tìm iPhone Pro Max", query: "tìm iphone pro max" },
        ],
    },
    {
        key: "android",
        label: "Samsung / Android",
        description: "Tìm khách đang cần mua Samsung và điện thoại Android.",
        keywords: [
            { label: "Cần mua Samsung", query: "cần mua samsung" },
            { label: "Tìm mua Samsung", query: "tìm mua samsung" },
            { label: "Ai bán Samsung", query: "ai bán samsung" },
            { label: "Samsung cũ", query: "samsung cũ" },
            { label: "Cần mua Android", query: "cần mua android" },
            { label: "Tìm mua Android", query: "tìm mua android" },
            { label: "Cần mua Samsung Ultra", query: "cần mua samsung ultra" },
            { label: "Tìm Samsung Ultra", query: "tìm samsung ultra" },
            { label: "Cần mua điện thoại cũ", query: "cần mua điện thoại cũ" },
            { label: "Tìm điện thoại cũ", query: "tìm điện thoại cũ" },
        ],
    },
    {
        key: "macbook",
        label: "MacBook",
        description: "Tìm khách đang cần mua MacBook, MacBook Air, MacBook Pro.",
        keywords: [
            { label: "Cần mua MacBook", query: "cần mua macbook" },
            { label: "Tìm mua MacBook", query: "tìm mua macbook" },
            { label: "Ai bán MacBook", query: "ai bán macbook" },
            { label: "MacBook cũ", query: "macbook cũ" },
            { label: "Cần MacBook Air", query: "cần macbook air" },
            { label: "Tìm MacBook Air", query: "tìm macbook air" },
            { label: "Cần MacBook Pro", query: "cần macbook pro" },
            { label: "Tìm MacBook Pro", query: "tìm macbook pro" },
            { label: "Cần mua MacBook M1", query: "cần mua macbook m1" },
            { label: "Cần mua MacBook M2", query: "cần mua macbook m2" },
            { label: "Cần mua MacBook M3", query: "cần mua macbook m3" },
            { label: "Cần mua MacBook M4", query: "cần mua macbook m4" },
        ],
    },
    {
        key: "laptop",
        label: "Laptop",
        description: "Tìm khách đang cần mua laptop Windows, laptop văn phòng, laptop cũ.",
        keywords: [
            { label: "Tìm laptop", query: "tìm laptop" },
            { label: "Cần mua laptop", query: "cần mua laptop" },
            { label: "Tìm mua laptop", query: "tìm mua laptop" },
            { label: "Ai bán laptop", query: "ai bán laptop" },
            { label: "Laptop cũ", query: "laptop cũ" },
            { label: "Cần laptop cũ", query: "cần laptop cũ" },
            { label: "Cần mua laptop cũ", query: "cần mua laptop cũ" },
            { label: "Tìm laptop cũ", query: "tìm laptop cũ" },
            { label: "Laptop văn phòng", query: "laptop văn phòng" },
            { label: "Cần laptop văn phòng", query: "cần laptop văn phòng" },
            { label: "Tìm laptop văn phòng", query: "tìm laptop văn phòng" },
            { label: "Cần mua Dell", query: "cần mua dell" },
            { label: "Cần mua Latitude", query: "cần mua latitude" },
            { label: "Cần mua ThinkPad", query: "cần mua thinkpad" },
            { label: "Cần mua laptop gaming", query: "cần mua laptop gaming" },
            { label: "Tìm laptop gaming", query: "tìm laptop gaming" },
        ],
    },
    {
        key: "ipad",
        label: "iPad",
        description: "Tìm khách đang cần mua iPad, iPad Air, iPad Pro.",
        keywords: [
            { label: "Cần mua iPad", query: "cần mua ipad" },
            { label: "Tìm mua iPad", query: "tìm mua ipad" },
            { label: "Ai bán iPad", query: "ai bán ipad" },
            { label: "iPad cũ", query: "ipad cũ" },
            { label: "Cần iPad cũ", query: "cần ipad cũ" },
            { label: "Tìm iPad cũ", query: "tìm ipad cũ" },
            { label: "Cần mua iPad Air", query: "cần mua ipad air" },
            { label: "Cần mua iPad Pro", query: "cần mua ipad pro" },
            { label: "Cần mua iPad Gen", query: "cần mua ipad gen" },
            { label: "Tìm iPad học online", query: "tìm ipad học online" },
        ],
    },
    {
        key: "tablet",
        label: "Tablet",
        description: "Tìm khách đang cần mua tablet Android và máy tính bảng.",
        keywords: [
            { label: "Cần mua tablet", query: "cần mua tablet" },
            { label: "Tìm mua tablet", query: "tìm mua tablet" },
            { label: "Ai bán tablet", query: "ai bán tablet" },
            { label: "Tablet cũ", query: "tablet cũ" },
            { label: "Cần tablet cũ", query: "cần tablet cũ" },
            { label: "Tìm tablet cũ", query: "tìm tablet cũ" },
            { label: "Cần mua máy tính bảng", query: "cần mua máy tính bảng" },
            { label: "Tìm mua máy tính bảng", query: "tìm mua máy tính bảng" },
            { label: "Cần mua Samsung Tab", query: "cần mua samsung tab" },
        ],
    },
    {
        key: "accessory",
        label: "Phụ kiện",
        description: "Tìm nhu cầu phụ kiện công nghệ.",
        keywords: [
            { label: "Cần mua AirPods", query: "cần mua airpods" },
            { label: "Tìm mua AirPods", query: "tìm mua airpods" },
            { label: "Ai bán AirPods", query: "ai bán airpods" },
            { label: "Cần mua Apple Watch", query: "cần mua apple watch" },
            { label: "Tìm mua Apple Watch", query: "tìm mua apple watch" },
            { label: "Cần mua sạc MacBook", query: "cần mua sạc macbook" },
            { label: "Cần mua bàn phím", query: "cần mua bàn phím" },
            { label: "Cần mua chuột", query: "cần mua chuột" },
        ],
    },
    {
        key: "general",
        label: "Tổng hợp",
        description: "Bộ key rộng để rà nhu cầu mua thiết bị công nghệ.",
        keywords: [
            { label: "Cần mua điện thoại", query: "cần mua điện thoại" },
            { label: "Tìm mua điện thoại", query: "tìm mua điện thoại" },
            { label: "Ai bán điện thoại", query: "ai bán điện thoại" },
            { label: "Cần mua máy zin", query: "cần mua máy zin" },
            { label: "Tìm máy zin", query: "tìm máy zin" },
            { label: "Cần máy cũ", query: "cần máy cũ" },
            { label: "Tìm máy cũ", query: "tìm máy cũ" },
            { label: "Cần mua thiết bị công nghệ", query: "cần mua thiết bị công nghệ" },
            { label: "Tìm mua thiết bị công nghệ", query: "tìm mua thiết bị công nghệ" },
            { label: "Ai bán máy cũ", query: "ai bán máy cũ" },
        ],
    },
];

function isProductTabKey(value: string): value is ProductTabKey {
    return productTabs.some((tab) => tab.key === value);
}

function isTimeFilter(value: string): value is TimeFilter {
    return value === "day" || value === "week" || value === "month" || value === "any";
}

function isSearchScope(value: string): value is SearchScope {
    return value === "natural" || value === "facebookGroups" || value === "facebookWide";
}

function normalizeTextList(values: string[]) {
    return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function parseStoredSettings(rawValue: string | null): LeadSearchSettings {
    if (!rawValue) return defaultSettings;

    try {
        const parsedValue = JSON.parse(rawValue) as Partial<LeadSearchSettings>;

        const activeTabKey =
            typeof parsedValue.activeTabKey === "string" && isProductTabKey(parsedValue.activeTabKey)
                ? parsedValue.activeTabKey
                : defaultSettings.activeTabKey;

        const timeFilter =
            typeof parsedValue.timeFilter === "string" && isTimeFilter(parsedValue.timeFilter)
                ? parsedValue.timeFilter
                : defaultSettings.timeFilter;

        const searchScope =
            typeof parsedValue.searchScope === "string" && isSearchScope(parsedValue.searchScope)
                ? parsedValue.searchScope
                : defaultSettings.searchScope;

        const selectedLocations = Array.isArray(parsedValue.selectedLocations)
            ? normalizeTextList(parsedValue.selectedLocations.filter((item): item is string => typeof item === "string"))
            : defaultSettings.selectedLocations;

        const queueIndex =
            typeof parsedValue.queueIndex === "number" && Number.isInteger(parsedValue.queueIndex) && parsedValue.queueIndex >= 0
                ? parsedValue.queueIndex
                : defaultSettings.queueIndex;

        return {
            activeTabKey,
            timeFilter,
            searchScope,
            selectedLocations: selectedLocations.length > 0 ? selectedLocations : defaultSettings.selectedLocations,
            customKeyword: typeof parsedValue.customKeyword === "string" ? parsedValue.customKeyword : "",
            customLocation: typeof parsedValue.customLocation === "string" ? parsedValue.customLocation : "",
            queueIndex,
        };
    } catch {
        return defaultSettings;
    }
}

function quoteKeyword(keyword: string) {
    const cleanKeyword = keyword.trim();

    if (!cleanKeyword) return "";

    if (cleanKeyword.startsWith('"') && cleanKeyword.endsWith('"')) {
        return cleanKeyword;
    }

    return `"${cleanKeyword}"`;
}

function buildFullQuery(keyword: string, location: string, searchScope: SearchScope) {
    const quotedKeyword = quoteKeyword(keyword);
    const cleanLocation = location.trim();

    if (searchScope === "natural") {
        return cleanLocation ? `${quotedKeyword} ${cleanLocation} facebook` : `${quotedKeyword} facebook`;
    }

    if (searchScope === "facebookGroups") {
        return cleanLocation
            ? `site:facebook.com/groups ${quotedKeyword} ${cleanLocation}`
            : `site:facebook.com/groups ${quotedKeyword}`;
    }

    return cleanLocation ? `site:facebook.com ${quotedKeyword} ${cleanLocation}` : `site:facebook.com ${quotedKeyword}`;
}

function buildGoogleSearchUrl(keyword: string, location: string, timeFilter: TimeFilter, searchScope: SearchScope) {
    const params = new URLSearchParams({
        q: buildFullQuery(keyword, location, searchScope),
    });

    const tbs = timeFilterMap[timeFilter].tbs;

    if (tbs) {
        params.set("tbs", tbs);
    }

    return `https://www.google.com/search?${params.toString()}`;
}

function openUrl(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
}

export default function FacebookLeadSearchPage() {
    const [settings, setSettings] = useState<LeadSearchSettings>(defaultSettings);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setSettings(parseStoredSettings(window.localStorage.getItem(storageKey)));
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        window.localStorage.setItem(storageKey, JSON.stringify(settings));
    }, [isHydrated, settings]);

    const activeTab = useMemo(() => {
        return productTabs.find((tab) => tab.key === settings.activeTabKey) ?? productTabs[0];
    }, [settings.activeTabKey]);

    const activeLocations = useMemo(() => {
        return normalizeTextList(settings.selectedLocations);
    }, [settings.selectedLocations]);

    const activeSearchLinks = useMemo<GeneratedSearchLink[]>(() => {
        return activeTab.keywords.flatMap((keyword) =>
            activeLocations.map((location) => ({
                label: keyword.label,
                keyword: keyword.query,
                location,
                fullQuery: buildFullQuery(keyword.query, location, settings.searchScope),
                url: buildGoogleSearchUrl(keyword.query, location, settings.timeFilter, settings.searchScope),
            })),
        );
    }, [activeLocations, activeTab.keywords, settings.searchScope, settings.timeFilter]);

    const safeQueueIndex = activeSearchLinks.length > 0 ? settings.queueIndex % activeSearchLinks.length : 0;
    const currentQueueItem = activeSearchLinks[safeQueueIndex] ?? null;

    const customSearchLinks = useMemo<GeneratedSearchLink[]>(() => {
        const cleanKeyword = settings.customKeyword.trim();

        if (!cleanKeyword) return [];

        return activeLocations.map((location) => ({
            label: cleanKeyword,
            keyword: cleanKeyword,
            location,
            fullQuery: buildFullQuery(cleanKeyword, location, settings.searchScope),
            url: buildGoogleSearchUrl(cleanKeyword, location, settings.timeFilter, settings.searchScope),
        }));
    }, [activeLocations, settings.customKeyword, settings.searchScope, settings.timeFilter]);

    const updateSettings = (nextSettings: Partial<LeadSearchSettings>) => {
        setSettings((currentSettings) => ({
            ...currentSettings,
            ...nextSettings,
        }));
    };

    const handleChangeTab = (activeTabKey: ProductTabKey) => {
        updateSettings({
            activeTabKey,
            queueIndex: 0,
        });
    };

    const handleToggleDefaultLocation = (location: string) => {
        setSettings((currentSettings) => {
            const isSelected = currentSettings.selectedLocations.includes(location);
            const nextLocations = isSelected
                ? currentSettings.selectedLocations.filter((item) => item !== location)
                : [...currentSettings.selectedLocations, location];

            return {
                ...currentSettings,
                selectedLocations: nextLocations.length > 0 ? nextLocations : [location],
                queueIndex: 0,
            };
        });
    };

    const handleAddLocation = () => {
        const nextLocation = settings.customLocation.trim();

        if (!nextLocation) return;

        setSettings((currentSettings) => ({
            ...currentSettings,
            customLocation: "",
            selectedLocations: normalizeTextList([...currentSettings.selectedLocations, nextLocation]),
            queueIndex: 0,
        }));
    };

    const handleRemoveLocation = (location: string) => {
        setSettings((currentSettings) => {
            const nextLocations = currentSettings.selectedLocations.filter((item) => item !== location);

            return {
                ...currentSettings,
                selectedLocations: nextLocations.length > 0 ? nextLocations : defaultSettings.selectedLocations,
                queueIndex: 0,
            };
        });
    };

    const handleResetFilters = () => {
        setSettings(defaultSettings);
    };

    const handleCopyText = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    const handleCopyTabQueries = async () => {
        await handleCopyText(activeSearchLinks.map((item) => item.fullQuery).join("\n"));
    };

    const handleCopyCustomQueries = async () => {
        await handleCopyText(customSearchLinks.map((item) => item.fullQuery).join("\n"));
    };

    const handleOpenCurrentQueueItem = () => {
        if (!currentQueueItem) return;

        openUrl(currentQueueItem.url);

        setSettings((currentSettings) => {
            const nextIndex = safeQueueIndex + 1;

            return {
                ...currentSettings,
                queueIndex: nextIndex >= activeSearchLinks.length ? 0 : nextIndex,
            };
        });
    };

    return (
        <main className="min-h-dvh w-full bg-slate-100 text-slate-950">
            <section className="w-full px-3 py-3 xl:px-6 xl:py-6">
                <div className="grid w-full grid-cols-1 gap-4">
                    <header className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="grid w-full grid-cols-1 gap-0 xl:grid-cols-[1fr_420px]">
                            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-primary p-5 text-white xl:p-8">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/60">7Teck Lead Search</p>

                                <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight xl:text-5xl">
                                    Keyfarm tìm bài khách cần mua thiết bị trên Facebook
                                </h1>

                                <p className="mt-4 max-w-4xl text-sm font-medium leading-6 text-white/75 xl:text-base">
                                    Giao diện full width, tập trung vào thao tác hằng ngày: chọn nhóm sản phẩm, xem query, mở từng lượt an
                                    toàn và lưu toàn bộ bộ lọc vào trình duyệt.
                                </p>

                                <div className="mt-5 grid grid-cols-2 gap-2 xl:flex xl:flex-wrap">
                                    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                                        <p className="text-xs font-bold text-white/60">Nhóm hiện tại</p>
                                        <p className="mt-1 text-lg font-black text-white">{activeTab.label}</p>
                                    </div>

                                    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                                        <p className="text-xs font-bold text-white/60">Số query</p>
                                        <p className="mt-1 text-lg font-black text-white">{activeSearchLinks.length}</p>
                                    </div>

                                    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                                        <p className="text-xs font-bold text-white/60">Thời gian</p>
                                        <p className="mt-1 text-lg font-black text-white">{timeFilterMap[settings.timeFilter].label}</p>
                                    </div>

                                    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                                        <p className="text-xs font-bold text-white/60">Kiểu query</p>
                                        <p className="mt-1 text-lg font-black text-white">{searchScopeMap[settings.searchScope].label}</p>
                                    </div>
                                </div>
                            </div>

                            <aside className="flex flex-col justify-between gap-4 bg-white p-5 xl:p-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Hàng đợi an toàn</p>

                                    <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tiến độ</p>
                                                <p className="mt-1 text-3xl font-black text-slate-950">
                                                    {activeSearchLinks.length > 0 ? `${safeQueueIndex + 1}/${activeSearchLinks.length}` : "0/0"}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => updateSettings({ queueIndex: 0 })}
                                                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                            >
                                                Về đầu
                                            </button>
                                        </div>

                                        {currentQueueItem ? (
                                            <div className="mt-4 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                                                        {currentQueueItem.label}
                                                    </span>

                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                                                        {currentQueueItem.location}
                                                    </span>
                                                </div>

                                                <p className="mt-3 break-words font-mono text-xs font-semibold leading-5 text-slate-700">
                                                    {currentQueueItem.fullQuery}
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        type="button"
                                        disabled={!currentQueueItem}
                                        onClick={handleOpenCurrentQueueItem}
                                        className="h-13 rounded-2xl bg-primary px-5 py-4 text-sm font-black text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                        Mở query tiếp theo
                                    </button>

                                    <button
                                        type="button"
                                        disabled={!currentQueueItem}
                                        onClick={() => currentQueueItem && handleCopyText(currentQueueItem.fullQuery)}
                                        className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                    >
                                        Copy query hiện tại
                                    </button>
                                </div>
                            </aside>
                        </div>
                    </header>

                    <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-[300px_1fr]">
                        <aside className="w-full rounded-3xl border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-4 xl:h-[calc(100dvh-2rem)] xl:overflow-y-auto">
                            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Nhóm sản phẩm</p>
                                <p className="mt-1 text-sm font-bold leading-5 text-slate-600">Chọn nhóm để đổi bộ key tìm kiếm.</p>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-1">
                                {productTabs.map((tab) => {
                                    const isActive = tab.key === settings.activeTabKey;

                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => handleChangeTab(tab.key)}
                                            className={[
                                                "rounded-2xl border p-3 text-left transition",
                                                isActive
                                                    ? "border-primary bg-primary text-white shadow-sm"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary",
                                            ].join(" ")}
                                        >
                                            <span className="block text-sm font-black">{tab.label}</span>
                                            <span className={["mt-1 block text-xs font-bold", isActive ? "text-white/75" : "text-slate-400"].join(" ")}>
                                                {tab.keywords.length} key
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>

                        <section className="grid w-full grid-cols-1 gap-4">
                            <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
                                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Bộ lọc</p>
                                            <h2 className="mt-1 text-xl font-black text-slate-950">Cấu hình tìm kiếm</h2>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
                                        <label className="flex flex-col gap-2">
                                            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Thời gian</span>

                                            <select
                                                value={settings.timeFilter}
                                                onChange={(event) => updateSettings({ timeFilter: event.target.value as TimeFilter, queueIndex: 0 })}
                                                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-primary focus:bg-white"
                                            >
                                                {Object.entries(timeFilterMap).map(([key, value]) => (
                                                    <option key={key} value={key}>
                                                        {value.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="flex flex-col gap-2">
                                            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Kiểu query</span>

                                            <select
                                                value={settings.searchScope}
                                                onChange={(event) => updateSettings({ searchScope: event.target.value as SearchScope, queueIndex: 0 })}
                                                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-primary focus:bg-white"
                                            >
                                                {Object.entries(searchScopeMap).map(([key, value]) => (
                                                    <option key={key} value={key}>
                                                        {value.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600 ring-1 ring-slate-200">
                                        {searchScopeMap[settings.searchScope].description}
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Vị trí</p>
                                            <h2 className="mt-1 text-xl font-black text-slate-950">Khu vực đang lọc</h2>
                                        </div>

                                        <span className="rounded-full bg-primary/10 px-3 py-2 text-xs font-black text-primary">
                                            {activeLocations.length} vị trí
                                        </span>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {activeLocations.map((location) => (
                                            <button
                                                key={location}
                                                type="button"
                                                onClick={() => handleRemoveLocation(location)}
                                                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-black text-primary transition hover:border-primary hover:bg-white"
                                            >
                                                {location}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-2 xl:grid-cols-[1fr_auto]">
                                        <input
                                            value={settings.customLocation}
                                            onChange={(event) => updateSettings({ customLocation: event.target.value })}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    handleAddLocation();
                                                }
                                            }}
                                            placeholder="Thêm vị trí, ví dụ: Quận 3, Gò Vấp, Bình Thạnh"
                                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white"
                                        />

                                        <button
                                            type="button"
                                            onClick={handleAddLocation}
                                            className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-primary"
                                        >
                                            Thêm
                                        </button>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {defaultLocations.map((location) => {
                                            const isSelected = settings.selectedLocations.includes(location);

                                            return (
                                                <button
                                                    key={location}
                                                    type="button"
                                                    onClick={() => handleToggleDefaultLocation(location)}
                                                    className={[
                                                        "rounded-full border px-3 py-2 text-xs font-black transition",
                                                        isSelected
                                                            ? "border-primary bg-primary text-white"
                                                            : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary",
                                                    ].join(" ")}
                                                >
                                                    {location}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:p-5">
                                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_auto_auto]">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-xs font-black uppercase tracking-wide text-slate-500">Key nhập riêng</span>

                                        <input
                                            value={settings.customKeyword}
                                            onChange={(event) => updateSettings({ customKeyword: event.target.value })}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" && customSearchLinks.length > 0) {
                                                    event.preventDefault();
                                                    openUrl(customSearchLinks[0].url);
                                                }
                                            }}
                                            placeholder="Ví dụ: tìm laptop, cần mua iphone 13, ai bán macbook"
                                            className="h-13 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white"
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        disabled={customSearchLinks.length === 0}
                                        onClick={handleCopyCustomQueries}
                                        className="h-13 self-end rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                    >
                                        Copy key riêng
                                    </button>

                                    <button
                                        type="button"
                                        disabled={customSearchLinks.length === 0}
                                        onClick={() => customSearchLinks[0] && openUrl(customSearchLinks[0].url)}
                                        className="h-13 self-end rounded-2xl bg-primary px-5 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                        Mở key đầu
                                    </button>
                                </div>

                                {customSearchLinks.length > 0 ? (
                                    <div className="mt-4 grid grid-cols-1 gap-2">
                                        {customSearchLinks.map((item) => (
                                            <div
                                                key={item.fullQuery}
                                                className="grid grid-cols-1 gap-2 rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-200 xl:grid-cols-[110px_1fr_auto_auto]"
                                            >
                                                <span className="rounded-xl bg-white px-3 py-3 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                                                    {item.location}
                                                </span>

                                                <p className="break-words rounded-xl bg-white px-3 py-3 font-mono text-xs font-semibold leading-5 text-slate-600 ring-1 ring-slate-200">
                                                    {item.fullQuery}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyText(item.fullQuery)}
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                                >
                                                    Copy
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openUrl(item.url)}
                                                    className="rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-primary"
                                                >
                                                    Mở
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row xl:items-end xl:justify-between xl:p-5">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Danh sách query</p>
                                        <h2 className="mt-1 text-2xl font-black text-slate-950">{activeTab.label}</h2>
                                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{activeTab.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={handleCopyTabQueries}
                                            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                        >
                                            Copy toàn bộ tab
                                        </button>

                                        <button
                                            type="button"
                                            disabled={!currentQueueItem}
                                            onClick={handleOpenCurrentQueueItem}
                                            className="rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-300"
                                        >
                                            Mở query tiếp theo
                                        </button>
                                    </div>
                                </div>

                                <div className="grid w-full grid-cols-1 gap-3 p-3 xl:p-5">
                                    {activeTab.keywords.map((keyword, index) => {
                                        const linksByLocation = activeLocations.map((location) => ({
                                            location,
                                            fullQuery: buildFullQuery(keyword.query, location, settings.searchScope),
                                            url: buildGoogleSearchUrl(keyword.query, location, settings.timeFilter, settings.searchScope),
                                        }));

                                        return (
                                            <article
                                                key={`${activeTab.key}-${keyword.label}`}
                                                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 transition hover:border-primary/40 hover:bg-white xl:p-4"
                                            >
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-500 ring-1 ring-slate-200">
                                                                {index + 1}
                                                            </span>

                                                            <div className="min-w-0">
                                                                <h3 className="line-clamp-1 text-base font-black text-slate-950">{keyword.label}</h3>
                                                                <p className="mt-1 text-xs font-bold text-slate-400">{linksByLocation.length} vị trí</p>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyText(linksByLocation.map((item) => item.fullQuery).join("\n"))}
                                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                                        >
                                                            Copy nhóm
                                                        </button>
                                                    </div>

                                                    <div className="grid w-full grid-cols-1 gap-2">
                                                        {linksByLocation.map((item) => (
                                                            <div
                                                                key={item.fullQuery}
                                                                className="grid w-full grid-cols-1 gap-2 rounded-2xl bg-white p-2 ring-1 ring-slate-200 xl:grid-cols-[110px_1fr_auto_auto]"
                                                            >
                                                                <span className="rounded-xl bg-slate-100 px-3 py-3 text-xs font-black text-slate-700">
                                                                    {item.location}
                                                                </span>

                                                                <p className="min-w-0 break-words rounded-xl bg-slate-50 px-3 py-3 font-mono text-xs font-semibold leading-5 text-slate-600">
                                                                    {item.fullQuery}
                                                                </p>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopyText(item.fullQuery)}
                                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                                                >
                                                                    Copy
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openUrl(item.url)}
                                                                    className="rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-primary"
                                                                >
                                                                    Mở
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </section>
        </main>
    );
}