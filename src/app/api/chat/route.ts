import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCache, CachedItem } from '@/lib/searchCache';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY! || 'AIzaSyAT4nqOpNNJrP8FoZ00dwqQWYcolh0AkzQ');

// Định nghĩa interface cho dữ liệu phân tích
interface ParsedIntent {
  intent: string;
  entity: string;
  extra: {
    storage: string;
    color: string;
    priceRange: string;
    feature: string;
  };
}

// Bảng ánh xạ từ khóa để hỗ trợ viết tắt như 'ip' -> 'iphone'
const keywordMap: Record<string, string> = {
  ip: 'iphone',
  ss: 'samsung',
  mb: 'macbook',
  mtb: 'ipad',
  wm: 'windows',
  gb: 'gb',
  pr: 'pro',
  prx: 'promax',
  prm: 'promax',
  pls: 'plus',
};

// Hàm chuẩn hóa chuỗi: loại bỏ dấu và khoảng trắng
function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Hàm kiểm tra query có khớp với tên sản phẩm (hỗ trợ nhiều từ, viết tắt)
function queryMatchesName(query: string, name: string): boolean {
  const qTokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => keywordMap[w] || w)
    .map(normalizeString)
    .filter(Boolean);

  const normalizedName = normalizeString(name);

  // Tất cả từ query phải xuất hiện trong tên sản phẩm
  return qTokens.every((token) => normalizedName.includes(token));
}

// Regex để trích xuất các entity sản phẩm, hỗ trợ nhiều biến thể
function extractEntities(text: string): string[] {
  const lower = text.toLowerCase();
  const regex =
    /\b(iphone|samsung|macbook|ipad|windows)\s?(\d{1,2})\s?(pro\s?max|promax|pro|plus|air|mini|ultra|fold|flip)?\s?(\d{2,3}gb)?\s?(xanh|đen|trắng|vàng|bạc|đỏ)?\b/gi;
  const matches = lower.match(regex);
  return matches ? [...new Set(matches.map((m) => m.trim()))] : []; // Loại bỏ trùng lặp
}

// Hàm lọc sản phẩm dựa trên intent và extra, sử dụng các field như name, color, price
function filterProducts(cachedData: CachedItem[], parsed: ParsedIntent, entities: string[]): CachedItem[] {
  let filtered = cachedData;

  // Lọc theo entity hoặc entities từ regex, sử dụng queryMatchesName để hỗ trợ viết tắt
  const searchTerms =
    entities.length > 0
      ? entities
      : parsed.entity
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
  if (searchTerms.length > 0) {
    filtered = filtered.filter((item) => searchTerms.some((term) => queryMatchesName(term, item.name)));
  }

  // Lọc theo dung lượng lưu trữ (storage) trong field name
  if (parsed.extra.storage) {
    const storageLower = parsed.extra.storage.toLowerCase();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(storageLower));
  }

  // Lọc theo màu sắc dựa trên field color
  if (parsed.extra.color) {
    const colorLower = parsed.extra.color.toLowerCase();
    filtered = filtered.filter((item) => item.color?.toLowerCase().includes(colorLower));
  }

  // Lọc theo khoảng giá dựa trên field price (giả sử price là nghìn VNĐ, chuyển sang đầy đủ)
  if (parsed.extra.priceRange) {
    const range = parsed.extra.priceRange.toLowerCase();
    if (range.includes('dưới') || range.includes('under')) {
      const maxPrice = parseInt(range.match(/\d+/)?.[0] || '0') * 1000000; // Chuyển triệu VNĐ
      filtered = filtered.filter((item) => (item.price || Infinity) * 1000 <= maxPrice); // Nhân 1000 vì price là nghìn VNĐ
    } else if (range.includes('rẻ nhất') || range.includes('cheapest')) {
      filtered.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
      filtered = filtered.slice(0, 5); // Top 5 rẻ nhất
    }
    // Có thể thêm logic cho khoảng giá khác (trên X triệu, từ X-Y triệu)
  }

  // Lọc theo tính năng dựa trên field name (có thể mở rộng sau nếu có field riêng)
  if (parsed.extra.feature) {
    const featureLower = parsed.extra.feature.toLowerCase();
    filtered = filtered.filter(
      (item) => item.name.toLowerCase().includes(featureLower) // Giả sử tên chứa hint tính năng
    );
  }

  // Loại bỏ trùng lặp và giới hạn số lượng
  return Array.from(new Map(filtered.map((p) => [p._id, p])).values()).slice(0, 10);
}

// Các phản hồi hardcoded cho smalltalk để tiết kiệm quota API
const smalltalkResponses: Record<string, string> = {
  // Chào hỏi
  'xin chào': 'Xin chào Anh/Chị! Em là trợ lý AI của 7Teck. Anh/Chị đang tìm sản phẩm nào hôm nay? Điện thoại, laptop hay máy tính bảng?',
  hello: 'Em rất sẵn lòng hỗ trợ Anh/Chị 😊. Anh/Chị cần tư vấn sản phẩm gì?',
  hi: 'Hi! Em là trợ lý bán hàng của 7Teck.vn. Hãy cho em biết Anh/Chị quan tâm đến iPhone, Samsung hay MacBook nhé!',
  'chào shop': 'Dạ em chào Anh/Chị ạ 👋. Em có thể hỗ trợ Anh/Chị tìm sản phẩm nhanh chóng nhất.',
  alo: 'Dạ em nghe ạ 😄. Anh/Chị muốn tham khảo dòng sản phẩm nào của 7Teck?',
  'good morning': 'Good morning Anh/Chị 🌞. Anh/Chị cần tham khảo sản phẩm nào cho hôm nay?',
  'good evening': 'Chào buổi tối Anh/Chị 🌙. Anh/Chị muốn em tư vấn điện thoại, laptop hay phụ kiện ạ?',

  // Cảm ơn
  'cảm ơn': 'Dạ em cảm ơn Anh/Chị đã tin tưởng 7Teck ạ 🙏. Nếu cần thêm hỗ trợ, em luôn sẵn sàng.',
  thanks: 'You’re welcome Anh/Chị! Em luôn sẵn lòng hỗ trợ ạ 😊.',
  'thank you': 'Rất vui được hỗ trợ Anh/Chị 💙. Nếu còn thắc mắc, Anh/Chị cứ hỏi em nhé!',

  // Hỏi thăm
  'khỏe không': 'Dạ em luôn sẵn sàng để phục vụ Anh/Chị ạ 💪. Anh/Chị thì sao ạ?',
  'how are you': 'I’m great, thank you! 😊 Sẵn sàng tư vấn cho Anh/Chị bất kỳ sản phẩm nào ở 7Teck.',

  // Tạm biệt
  'tạm biệt': 'Dạ em chào Anh/Chị 👋. Hẹn gặp lại Anh/Chị tại 7Teck.vn nhé!',
  bye: 'Bye Anh/Chị, chúc Anh/Chị một ngày tốt lành 🌟.',
  'see you': 'See you again soon, Anh/Chị! Em luôn ở đây hỗ trợ ạ.',

  // Các câu phổ biến khác
  '7teck là gì':
    '7Teck là hệ thống bán lẻ các sản phẩm công nghệ chính hãng: điện thoại, laptop, tablet và phụ kiện. Anh/Chị cần em giới thiệu danh mục nào ạ?',
  'có freeship không': 'Dạ, 7Teck có hỗ trợ freeship cho đơn hàng đủ điều kiện 🎁. Anh/Chị muốn em kiểm tra chi tiết giúp không ạ?',
  'giờ mở cửa': '7Teck.vn hỗ trợ online 24/7. Nếu Anh/Chị cần đến cửa hàng, giờ mở cửa là 8:00 - 21:30 hằng ngày.',
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { message: string };
    const { message } = body;
    if (!message) {
      return NextResponse.json({ success: false, message: 'Thiếu tin nhắn' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, message: 'Chưa cấu hình API key cho Gemini.' }, { status: 500 });
    }

    const lowerMessage = message.toLowerCase();

    // Xử lý smalltalk hardcoded để tiết kiệm quota
    for (const key in smalltalkResponses) {
      if (lowerMessage.includes(key)) {
        return NextResponse.json({
          success: true,
          reply: smalltalkResponses[key],
          intent: 'smalltalk',
          entity: '',
        });
      }
    }

    // 1. Gọi Gemini để phân tích intent (cải tiến prompt cho chính xác hơn)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }); // Sử dụng model mới nhất
    const intentPrompt = `
    Bạn là hệ thống NLP thông minh cho chatbot bán hàng điện thoại, laptop, máy tính bảng tại 7Teck.vn.
    Phân tích tin nhắn người dùng: "${message}".
    
    Trả về JSON chính xác với cấu trúc sau (không thêm gì ngoài JSON):
    {
      "intent": "ask_price" | "search_product" | "ask_color" | "ask_payment" | "ask_availability" | "smalltalk" | "compare_products" | "cheapest_product" | "filter_by_price" | "filter_by_feature" | "other",
      "entity": "tên sản phẩm hoặc từ khóa chính (ví dụ: iphone 14, samsung s23, macbook air). Nếu nhiều, phân cách bằng dấu phẩy. Nếu không có thì để trống",
      "extra": {
        "storage": "dung lượng lưu trữ (ví dụ: 128GB, 256GB). Nếu không có thì để trống",
        "color": "màu sắc (ví dụ: xanh, đen). Nếu không có thì để trống",
        "priceRange": "khoảng giá (ví dụ: dưới 10 triệu, từ 15-20 triệu, rẻ nhất). Nếu không có thì để trống",
        "feature": "tính năng cụ thể (ví dụ: camera tốt, pin lâu, gaming, màn hình lớn). Nếu không có thì để trống"
      }
    }
    
    Quy tắc phân loại intent:
    - Hỏi giá sản phẩm: "ask_price"
    - Tìm kiếm hoặc hỏi về sản phẩm cụ thể: "search_product"
    - Hỏi về màu sắc có sẵn: "ask_color"
    - Hỏi về trả góp, thanh toán: "ask_payment"
    - Hỏi còn hàng, tồn kho: "ask_availability"
    - Chào hỏi, trò chuyện xã giao: "smalltalk"
    - So sánh giữa các sản phẩm: "compare_products"
    - Tìm sản phẩm rẻ nhất trong loại: "cheapest_product"
    - Lọc theo khoảng giá: "filter_by_price"
    - Lọc theo tính năng: "filter_by_feature"
    - Không khớp: "other"
    - Ưu tiên intent cụ thể nhất, dựa trên từ khóa trong tin nhắn.
    - Entity: Trích xuất chính xác tên sản phẩm, hỗ trợ nhiều (ví dụ: "iphone 14, samsung s23"). Nếu viết tắt như "ip 14" thì mở rộng thành "iphone 14".
    `;

    let parsed: ParsedIntent = { intent: 'other', entity: '', extra: { storage: '', color: '', priceRange: '', feature: '' } };
    try {
      const intentResult = await model.generateContent(intentPrompt);
      const jsonText = intentResult.response
        .text()
        .replace(/```json|```/g, '')
        .trim();
      parsed = JSON.parse(jsonText);
    } catch (error) {
      console.error('Lỗi parse intent:', error);
      parsed.intent = 'smalltalk';
    }

    // 2. Xử lý smalltalk nếu fallback từ API
    if (parsed.intent === 'smalltalk') {
      return NextResponse.json({
        success: true,
        reply: 'Xin chào Anh/Chị! Em là trợ lý AI của 7Teck. Anh/Chị! muốn tìm sản phẩm nào hôm nay? Điện thoại, laptop hay máy tính bảng?',
        intent: parsed.intent,
        entity: parsed.entity,
      });
    }

    // 3. Trích xuất entities bổ sung từ regex
    const regexEntities = extractEntities(message);

    // 4. Lấy cache và lọc sản phẩm dựa trên intent/extra
    const cachedData = await getCache();
    let foundProducts = filterProducts(cachedData, parsed, regexEntities);

    // Nếu không tìm thấy, mở rộng tìm kiếm (fallback)
    if (foundProducts.length === 0 && parsed.intent !== 'compare_products') {
      foundProducts = cachedData.filter((item) => queryMatchesName(parsed.entity.toLowerCase(), item.name)).slice(0, 5);
    }

    // 5. Sử dụng Gemini để generate reply dựa trên intent và products, cải tiến để khai thác dữ liệu bên ngoài nếu cần
    const systemPrompt = `
    Bạn là ChatBot 7Teck, trợ lý bán hàng chuyên nghiệp, thân thiện tại 7Teck.vn - cửa hàng bán điện thoại, laptop, máy tính bảng tích hợp AI.
    Ưu tiên bán hàng: Mô tả sản phẩm hấp dẫn, nhấn mạnh tính năng, khuyến khích mua, cung cấp link chi tiết.
    Sử dụng HTML để định dạng: thẻ card cho sản phẩm (không dùng bảng để tránh tràn nội dung), với class Tailwind, sử dụng màu primary (#a92d30) cho text và border, primary-lighter (#fee2e2) cho background (ví dụ: <div class="flex flex-col gap-4"> cho nhiều card, mỗi card: <div class="bg-primary-lighter border border-primary rounded-lg p-2 flex flex-col items-center text-center max-w-full overflow-hidden">, <img src="..." alt="..." class="w-16 h-16 object-contain mb-2 rounded">, <p class="text-primary font-bold text-sm truncate w-full">{tên}</p>, <p class="text-primary text-xs">Màu: {màu}</p>, <p class="text-primary font-semibold text-sm">{giá} VNĐ</p>, <a href="..." class="text-primary text-xs hover:underline">Xem chi tiết</a>), sử dụng truncate cho tên dài, object-contain cho ảnh để vừa khung chat hẹp (400px), không thêm text ngoài card để tránh vỡ UI.
    Trả lời bằng tiếng Việt, ngắn gọn, hữu ích.
    Nếu không có sản phẩm trong DB, sử dụng kiến thức cập nhật của bạn về sản phẩm mới nhất năm 2025 (như iPhone 17 series với giá từ 22 triệu VND cho bản tiêu chuẩn, 42 triệu cho Pro, camera 24MP, ra mắt tháng 9/2025; Samsung Galaxy S25, iPad Air M3, MacBook Air M4, Windows laptops như Surface Laptop 7) để gợi ý, dựa trên dữ liệu web mới nhất, và gợi ý tìm kiếm thêm hoặc liên hệ cửa hàng.
    Đối với so sánh: Liệt kê điểm khác biệt, ưu nhược điểm dựa trên kiến thức chung và dữ liệu mới nhất.
    Đối với tính năng: Sử dụng kiến thức AI để giải thích chi tiết (camera, pin, hiệu năng,...), khai thác thông tin bên ngoài nếu cần.
    Nếu intent là 'other' hoặc câu hỏi khó, sử dụng kiến thức cập nhật để trả lời, ví dụ: giá mới nhất, specs từ 2025.
    `;

    const userPrompt = `
    Intent của người dùng: ${parsed.intent}
    Entity: ${parsed.entity || regexEntities.join(', ') || 'Không có'}
    Extra: ${JSON.stringify(parsed.extra)}
    
    Sản phẩm tìm thấy từ DB (ưu tiên hiển thị dưới dạng thẻ card HTML đẹp nếu phù hợp, với cấu trúc: Hình ảnh, Tên (truncate), Màu, Giá (định dạng số nghìn VNĐ, ví dụ: 11.000.000 VNĐ), Link; không thêm text ngoài card để tránh vỡ UI):
    ${foundProducts.length > 0 ? JSON.stringify(foundProducts, null, 2) : 'Không tìm thấy sản phẩm khớp. Hãy sử dụng kiến thức cập nhật để gợi ý sản phẩm tương tự hoặc mới nhất từ 2025 dựa trên intent.'}
    
    Tin nhắn gốc: "${message}"
    
    Tạo phản hồi phù hợp với intent:
    - ask_price: Báo giá chi tiết, khuyến mãi nếu có, cập nhật giá 2025 nếu cần.
    - search_product: Hiển thị thẻ card sản phẩm đẹp, mô tả ngắn.
    - ask_color: Liệt kê màu sắc có sẵn cho sản phẩm.
    - ask_payment: Giải thích chính sách trả góp (0% lãi, qua ngân hàng,...).
    - ask_availability: Xác nhận còn hàng (giả sử luôn có, hoặc hỏi thêm).
    - compare_products: So sánh các sản phẩm tìm thấy, sử dụng specs mới nhất.
    - cheapest_product: Hiển thị sản phẩm rẻ nhất, lý do chọn.
    - filter_by_price: Liệt kê sản phẩm trong khoảng giá dưới dạng thẻ card.
    - filter_by_feature: Gợi ý sản phẩm phù hợp tính năng, giải thích tại sao.
    - other: Trả lời chung, ưu tiên bán hàng, sử dụng dữ liệu bên ngoài cho câu hỏi khó.
    `;

    const replyResult = await model.generateContent([systemPrompt, userPrompt]);
    const reply = replyResult.response.text();

    return NextResponse.json({
      success: true,
      reply: reply || 'Xin lỗi, em không hiểu câu hỏi. Anh/Chị có thể mô tả chi tiết hơn?',
      intent: parsed.intent,
      entity: parsed.entity || regexEntities.join(', '),
      productsFound: foundProducts.length,
    });
  } catch (err: unknown) {
    console.error('Lỗi server:', err);
    let errorMessage = 'Lỗi server, vui lòng thử lại.';
    if (err instanceof Error && 'response' in err && (err.response as { status: number }).status === 429) {
      errorMessage =
        'Đã vượt quá giới hạn sử dụng API Gemini miễn phí (50 yêu cầu/ngày). Vui lòng nâng cấp tài khoản Google AI Studio bằng cách liên kết tài khoản thanh toán tại https://aistudio.google.com/app/apikey để có hạn mức cao hơn. Hoặc thử lại vào ngày mai.';
    }
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
