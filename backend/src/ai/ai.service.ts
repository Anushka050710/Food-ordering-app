import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // ─── Feature 1: AI Chatbot ───────────────────────────────────────────────────
  async chat(message: string, userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Fetch restaurants available in user's country for context
    const restaurants = await this.prisma.restaurant.findMany({
      where: { country: user!.country },
      include: { menuItems: true },
    });

    const restaurantContext = restaurants
      .map(
        (r) =>
          `${r.name} (${r.cuisine}): ${r.menuItems.map((m) => `${m.name} ₹${m.price}`).join(', ')}`,
      )
      .join('\n');

    const systemPrompt = `You are a helpful food ordering assistant for a food delivery app.
The user is from ${user!.country} and their name is ${user!.name}.
Available restaurants in their area:
${restaurantContext}

Help them with:
- Finding restaurants or dishes
- Understanding menu items
- Placing orders (guide them to the dashboard)
- General food recommendations

Keep responses concise and friendly. If asked about something unrelated to food ordering, politely redirect.`;

    const chat = this.model.startChat({
      history: [{ role: 'user', parts: [{ text: systemPrompt }] }, { role: 'model', parts: [{ text: 'Understood! I am ready to help with food ordering.' }] }],
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  }

  // ─── Feature 2: Restaurant/Dish Recommendations ──────────────────────────────
  async getRecommendations(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Get user's past orders for personalization
    const pastOrders = await this.prisma.order.findMany({
      where: { userId, status: { in: ['CONFIRMED', 'COMPLETED'] } },
      include: { restaurant: true, items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const restaurants = await this.prisma.restaurant.findMany({
      where: { country: user!.country },
      include: { menuItems: true },
    });

    const pastOrdersSummary =
      pastOrders.length > 0
        ? pastOrders
            .map(
              (o) =>
                `${o.restaurant.name}: ${o.items.map((i) => i.menuItem.name).join(', ')}`,
            )
            .join('\n')
        : 'No past orders yet';

    const availableRestaurants = restaurants
      .map(
        (r) =>
          `${r.name} (${r.cuisine}): ${r.menuItems.map((m) => `${m.name} - ${m.category} - ₹${m.price}`).join(', ')}`,
      )
      .join('\n');

    const prompt = `You are a food recommendation engine.
User: ${user!.name} from ${user!.country}
Past orders:
${pastOrdersSummary}

Available restaurants:
${availableRestaurants}

Based on their order history (or if no history, based on popular choices), recommend:
1. Top 3 restaurants with a reason
2. Top 5 dishes they might enjoy

Format as JSON: { "restaurants": [{"name": "", "reason": ""}], "dishes": [{"name": "", "restaurant": "", "reason": ""}] }
Return ONLY valid JSON, no markdown.`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  // ─── Feature 3: Natural Language Search ──────────────────────────────────────
  async naturalLanguageSearch(query: string, userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const restaurants = await this.prisma.restaurant.findMany({
      where: { country: user!.country },
      include: { menuItems: true },
    });

    const searchData = restaurants
      .map((r) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        items: r.menuItems.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          price: m.price,
          category: m.category,
        })),
      }));

    const prompt = `You are a food search engine. Given a natural language query, find matching restaurants and dishes.

Query: "${query}"

Available data (JSON):
${JSON.stringify(searchData, null, 2)}

Return matching results as JSON:
{ "restaurants": [{"id": "", "name": "", "cuisine": "", "matchReason": ""}], "dishes": [{"id": "", "name": "", "restaurantId": "", "restaurantName": "", "price": 0, "matchReason": ""}] }

Match based on: cuisine type, dish name, ingredients, dietary preferences (veg/non-veg), price range, category.
Return ONLY valid JSON, no markdown.`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}
