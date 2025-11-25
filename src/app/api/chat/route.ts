import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CachedItem } from '@/lib/searchCache';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

// Smalltalk hardcoded
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
                   <p class="text-gray-500 text-xs mb-1">Màu: ${product.color || ''}</p>
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

// Helper: gọi search
async function callSearch(baseUrl: string, q: string) {
  try {
    const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success && Array.isArray(data.results) && data.results.length) return data.results;
  } catch (e) {
    console.error('[search] error:', e);
  }
  return null;
}

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

    // Base URL nội bộ
    const url = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;

    // 1) Smalltalk
    const lowerMessage = message.toLowerCase();
    for (const key in smalltalkResponses) {
      if (lowerMessage.includes(key)) {
        return NextResponse.json({
          success: true,
          reply: smalltalkResponses[key],
          intent: 'smalltalk',
          entity: '',
          productsFound: 0,
          source: 'smalltalk',
        });
      }
    }

    // 2) PASS 1: search với input nguyên bản
    const rawResults = await callSearch(baseUrl, message);
    if (rawResults) {
      return NextResponse.json({
        success: true,
        reply: generateCardsFromResults(rawResults),
        intent: 'search_product',
        entity: message,
        productsFound: rawResults.length,
        source: 'search-api:raw',
      });
    }

    // 3) Dùng AI chỉ để rút trích intent/entity/extra (KHÔNG sinh nội dung)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const intentPrompt = `
    Bạn là hệ thống NLP thông minh cho chatbot bán hàng điện thoại, laptop, máy tính bảng tại 7Teck.vn.
    Phân tích tin nhắn người dùng: "${message}".
    Trả về JSON CHÍNH XÁC, chỉ JSON:
    {
      "intent": "ask_price" | "search_product" | "ask_color" | "ask_payment" | "ask_availability" | "smalltalk" | "compare_products" | "cheapest_product" | "filter_by_price" | "filter_by_feature" | "other",
      "entity": "tên sản phẩm hoặc từ khóa chính (ví dụ: iphone 14, samsung s23, macbook air). Nếu nhiều, phân cách bằng dấu phẩy. Nếu không có thì để trống",
      "extra": {
        "storage": "128GB|256GB|... hoặc trống",
        "color": "xanh|đen|... hoặc trống",
        "priceRange": "dưới 10 triệu|15-20 triệu|rẻ nhất|... hoặc trống",
        "feature": "camera tốt|pin lâu|gaming|... hoặc trống"
      }
    }
    Ưu tiên entity cụ thể nhất. Nếu viết tắt (vd: "ip 14") thì mở rộng thành "iphone 14".
    `;

    let parsed: ParsedIntent = { intent: 'other', entity: '', extra: { storage: '', color: '', priceRange: '', feature: '' } };
    try {
      const intentResult = await model.generateContent(intentPrompt);
      const jsonText = intentResult.response
        .text()
        .replace(/```json|```/g, '')
        .trim();
      parsed = JSON.parse(jsonText);
    } catch (err) {
      console.error('[intent parse] error:', err);
    }

    // 4) PASS 2: nếu có entity → search lại bằng entity (ưu tiên tránh hallucination)
    let entityResults: CachedItem[] | null = null;
    if (parsed.entity) {
      // Nếu có nhiều entity, thử từng cái
      const candidates = parsed.entity
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const cand of candidates) {
        const r = await callSearch(baseUrl, cand);
        if (r && r.length) {
          entityResults = r;
          parsed.entity = cand; // chọn entity match
          break;
        }
      }
    }

    if (entityResults) {
      return NextResponse.json({
        success: true,
        reply: generateCardsFromResults(entityResults),
        intent: parsed.intent || 'search_product',
        entity: parsed.entity,
        productsFound: entityResults.length,
        source: 'search-api:entity',
      });
    }

    // 5) Không có dữ liệu trong DB → sinh câu trả lời bằng AI theo prompt cấu hình
    const systemPrompt = `
    Bạn là ChatBot 7Teck, trợ lý bán hàng chuyên nghiệp, thân thiện tại 7Teck.vn - cửa hàng bán điện thoại, laptop, máy tính bảng tích hợp AI.
    Ưu tiên bán hàng: Mô tả sản phẩm hấp dẫn, nhấn mạnh tính năng, khuyến khích mua, cung cấp link chi tiết.
    Sử dụng HTML để định dạng: thẻ card cho sản phẩm (không dùng bảng), class Tailwind, màu primary (#a92d30) cho text/border, primary-lighter (#fee2e2) cho background. Dùng truncate cho tên dài, object-contain cho ảnh để vừa khung chat hẹp (~400px), không thêm text ngoài card để tránh vỡ UI.
    Trả lời bằng tiếng Việt, ngắn gọn, hữu ích.
    Nếu sản phẩm không có trong DB:
  - Không được bịa giá cụ thể.
  - Chỉ được trả lời dạng chung chung: "Sản phẩm này chưa có trong kho của 7Teck. 
    Tuy nhiên, theo tin tức thị trường, đây là model mới, vui lòng theo dõi website hoặc liên hệ để cập nhật."
    - Nếu có sản phẩm tương tự, gợi ý sản phẩm đó.
    Với so sánh: liệt kê khác biệt, ưu/nhược dựa trên kiến thức mới.
    Với tính năng: giải thích chi tiết (camera, pin, hiệu năng...).
    Nếu intent là 'other' hoặc câu hỏi khó, dùng kiến thức cập nhật để trả lời.
    Quan trọng: chỉ gợi ý sản phẩm ngoài DB khi và chỉ khi API Search KHÔNG có kết quả.
    `;

    const userPrompt = `
    Intent: ${parsed.intent}
    Entity: ${parsed.entity || 'Không có'}
    Extra: ${JSON.stringify(parsed.extra)}
    Tin nhắn gốc: "${message}"

    Tạo phản hồi phù hợp với intent:
    ask_price: Luôn báo giá dựa trên dữ liệu sản phẩm trong DB (API Search).
    Nếu sản phẩm không có trong DB → trả lời "Chưa có thông tin giá tại 7Teck".
    Tuyệt đối không tự suy đoán hay cập nhật giá thị trường.
    - search_product: Hiển thị thẻ card sản phẩm đẹp, mô tả ngắn.
    - ask_color: Liệt kê màu sắc có sẵn cho sản phẩm.
    - ask_payment: Giải thích chính sách trả góp (0% lãi, qua ngân hàng,...).
    - ask_availability: Xác nhận còn hàng (giả sử luôn có, hoặc hỏi thêm).
    - compare_products: So sánh các sản phẩm có liên quan, dùng specs mới nhất.
    - cheapest_product: Hiển thị sản phẩm rẻ nhất, lý do chọn.
    - filter_by_price: Liệt kê sản phẩm trong khoảng giá (nếu DB không có, gợi ý theo thị trường).
    - filter_by_feature: Gợi ý sản phẩm phù hợp tính năng, giải thích tại sao.
    - other: Trả lời chung, ưu tiên bán hàng.
    `;

    const replyResult = await model.generateContent([systemPrompt, userPrompt]);
    const reply = replyResult.response.text();

    return NextResponse.json({
      success: true,
      reply: reply || 'Xin lỗi, em chưa tìm thấy thông tin phù hợp. Anh/Chị có thể mô tả rõ hơn ạ?',
      intent: parsed.intent,
      entity: parsed.entity,
      productsFound: 0,
      source: 'ai',
    });
  } catch (err: unknown) {
    console.error('Lỗi server:', err);
    let errorMessage = 'Lỗi server, vui lòng thử lại.';
    if (err instanceof Error && 'response' in err && (err.response as { status: number }).status === 429) {
      errorMessage =
        'Đã vượt quá giới hạn sử dụng API Gemini miễn phí. Vui lòng nâng cấp tài khoản Google AI Studio bằng cách liên kết tài khoản thanh toán tại https://aistudio.google.com/app/apikey để có hạn mức cao hơn. Hoặc thử lại vào ngày mai.';
    }
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
