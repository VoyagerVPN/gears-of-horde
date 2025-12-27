import { NextResponse } from 'next/server';

// Временное хранилище в памяти (в реальности это будет База Данных)
const mockSuggestionsDb: unknown[] = [];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body = await request.json();
    const { code, url, author } = body;
    const { slug } = await params;
    const modSlug = slug;

    // Простая валидация
    if (!code || !url || !author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newSuggestion = {
      id: Date.now().toString(),
      modSlug,
      code: code.toUpperCase(),
      url,
      author,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    // Сохраняем в "базу"
    console.log('--- NEW LOCALIZATION SUGGESTION RECEIVED ---');
    console.log(newSuggestion);
    mockSuggestionsDb.push(newSuggestion);
    // ------------------------------------------------------

    return NextResponse.json({ success: true, suggestion: newSuggestion });

  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}