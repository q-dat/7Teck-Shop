import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCache, CachedItem, keywordMap } from '@/lib/searchCache';

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY! || 'AIzaSyAT4nqOpNNJrP8FoZ00dwqQWYcolh0AkzQ');

// Interface cho intent được phân tích
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

// Hàm chuẩn hóa chuỗi để khớp
function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Hàm kiểm tra query có khớp với tên sản phẩm, hỗ trợ đa từ và viết tắt
function queryMatchesName(query: string, name: string): boolean {
  const qTokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => keywordMap[w] || w)
    .map(normalizeString)
    .filter(Boolean);

  const normalizedName = normalizeString(name);
  return qTokens.every((token) => normalizedName.includes(token));
}

// Hàm trích xuất entities bằng regex, hỗ trợ biến thể và viết tắt
function extractEntities(text: string): string[] {
  const lower = text.toLowerCase();
  const regex =
    /\b(iphone|samsung|macbook|ipad|windows|a36|s25)\s?(\d{1,2})?\s?(pro\s?max|promax|pro|plus|air|mini|ultra|fold|flip)?\s?(\d{2,3}gb)?\s?(xanh|đen|trắng|vàng|bạc|đỏ)?\b/gi;
  const matches = lower.match(regex);
  return matches
    ? [...new Set(matches.map((m) => keywordMap[m.trim()] || m.trim()))] // Áp dụng ánh xạ alias
    : [];
}

// Hàm lọc sản phẩm dựa trên entities và tham số extra
function filterProducts(cachedData: CachedItem[], entities: string[], extra: ParsedIntent['extra'], intent: string = ''): CachedItem[] {
  let filtered = cachedData;

  if (entities.length > 0) {
    filtered = filtered.filter((item) => entities.some((term) => queryMatchesName(term, item.name)));
  }

  if (extra.storage) {
    const storageLower = extra.storage.toLowerCase();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(storageLower));
  }

  if (extra.color) {
    const colorLower = extra.color.toLowerCase();
    filtered = filtered.filter((item) => item.color?.toLowerCase().includes(colorLower));
  }

  if (extra.priceRange || intent === 'cheapest_product' || intent === 'filter_by_price') {
    const range = extra.priceRange.toLowerCase();
    if (range.includes('dưới') || range.includes('under')) {
      const maxPrice = parseInt(range.match(/\d+/)?.[0] || '0') * 1000000;
      filtered = filtered.filter((item) => (item.price || Infinity) * 1000 <= maxPrice);
    } else if (range.includes('rẻ nhất') || range.includes('cheapest') || intent === 'cheapest_product') {
      filtered.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
      filtered = filtered.slice(0, 5);
    }
    // Thêm logic khoảng giá khác nếu cần, ví dụ: 'từ X-Y triệu'
  }

  if (extra.feature || intent === 'filter_by_feature') {
    const featureLower = extra.feature.toLowerCase();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(featureLower));
  }

  return Array.from(new Map(filtered.map((p) => [p._id, p])).values()).slice(0, 10);
}

// Hàm tạo thẻ HTML card cho sản phẩm
function generateCardsFromResults(products: CachedItem[]): string {
  if (!products.length) return '';

  return `
     <div class="w-full">
        <!-- Title -->
        <span>Chúng tôi có một số sản phẩm liên quan:</span>
        <!-- Products grid -->
        <div class="grid grid-cols-2  gap-2">
         ${products
           .map(
             (product) => `
             <a href="${product.link}">
               <div class="bg-white border border-gray-200 rounded-md m p-1 flex flex-col items-center text-start transition">
               <img src="${product.image}" alt="${product.name}" class="w-20 h-20 object-contain mb-3 rounded-md bg-white">
               <div class="w-full">
                   <p class="text-gray-800 font-medium text-xs">${product.name}</p>
                   <p class="text-gray-500 text-xs mb-1">Màu: ${product.color || 'N/A'}</p>
                   <p class="text-price font-semibold text-sm">${((product.price || 0) * 1000).toLocaleString('vi-VN')} VNĐ</p>
                   <span class="text-primary text-xs font-medium hover:underline">Xem chi tiết</span>
                 </div>
                 </div>
             </a>
             `
           )
           .join('')}
       </div>
      </div>

  `;
}

// Các phản hồi hardcoded cho smalltalk
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

    // 1. Kiểm tra smalltalk hardcoded để tiết kiệm quota
    for (const key in smalltalkResponses) {
      if (lowerMessage.includes(key)) {
        console.log('[DEBUG] Trả lời từ smalltalk hardcoded (không từ DB hoặc AI).');
        return NextResponse.json({
          success: true,
          reply: smalltalkResponses[key],
          intent: 'smalltalk',
          entity: '',
          productsFound: 0,
          source: 'smalltalk', // Thêm field debug source
        });
      }
    }

    // 2. Trích xuất entities và xử lý alias
    let entities = extractEntities(message);

    // 3. Tải cache và tìm kiếm trực tiếp từ DB
    const cachedData = await getCache();
    let foundProducts = filterProducts(cachedData, entities, { storage: '', color: '', priceRange: '', feature: '' });

    // 4. Nếu tìm thấy sản phẩm từ DB, render card và trả về mà không gọi AI
    if (foundProducts.length > 0) {
      console.log(`[DEBUG] Lấy dữ liệu từ DB: Tìm thấy ${foundProducts.length} sản phẩm. Không gọi AI.`);
      const reply = generateCardsFromResults(foundProducts);
      return NextResponse.json({
        success: true,
        reply,
        intent: 'search_product',
        entity: entities.join(', '),
        productsFound: foundProducts.length,
        source: 'db', // Thêm field debug source
      });
    }

    // 5. Fallback đến Gemini để phân tích intent (chỉ khi không match DB)
    console.log('[DEBUG] Không tìm thấy từ DB, fallback gọi AI (Gemini) để phân tích intent.');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
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

    // 6. Xử lý smalltalk fallback từ AI
    if (parsed.intent === 'smalltalk') {
      console.log('[DEBUG] Intent là smalltalk từ AI.');
      return NextResponse.json({
        success: true,
        reply: 'Xin chào Anh/Chị! Em là trợ lý AI của 7Teck. Anh/Chị muốn tìm sản phẩm nào hôm nay? Điện thoại, laptop hay máy tính bảng?',
        intent: parsed.intent,
        entity: parsed.entity,
        productsFound: 0,
        source: 'ai', // Thêm field debug source
      });
    }

    // 7. Kết hợp entities từ regex và parsed
    if (parsed.entity) {
      entities = [...new Set([...entities, ...parsed.entity.split(',').map((e) => e.trim())])];
    }

    // 8. Lọc sản phẩm với thông tin parsed đầy đủ
    foundProducts = filterProducts(cachedData, entities, parsed.extra, parsed.intent);

    // 9. Nếu vẫn không tìm thấy và không phải compare, fallback tìm kiếm mở rộng
    if (foundProducts.length === 0 && parsed.intent !== 'compare_products') {
      foundProducts = cachedData.filter((item) => queryMatchesName(parsed.entity.toLowerCase(), item.name)).slice(0, 5);
    }

    // 10. Tạo reply bằng Gemini, sử dụng kiến thức cập nhật 2025
    console.log(`[DEBUG] Gọi AI (Gemini) để tạo reply dựa trên intent. Tìm thấy ${foundProducts.length} sản phẩm từ DB (nếu có).`);
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
    Entity: ${parsed.entity || entities.join(', ') || 'Không có'}
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
      entity: parsed.entity || entities.join(', '),
      productsFound: foundProducts.length,
      source: 'ai', // Thêm field debug source
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
