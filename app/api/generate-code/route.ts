import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getLearnedPreferences, buildContextFromPreferences } from '@/lib/learning-store';
import { CodeSuggestion } from '@/types/coding';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function POST(req: NextRequest) {
  try {
    const { taskDescription, taskId } = await req.json();

    if (!taskDescription) {
      return NextResponse.json(
        { error: 'Task description is required' },
        { status: 400 }
      );
    }

    // Get learned preferences
    const preferences = await getLearnedPreferences();
    const contextFromLearning = await buildContextFromPreferences(preferences);

    // Build prompt with learned context
    const systemPrompt = `You are a code generation assistant. Generate clean, production-ready code based on the user's task.${contextFromLearning}

Always follow the learned preferences above when generating code. If no preferences exist yet, use common best practices.

Provide:
1. The code itself
2. Brief explanation of the approach
3. The programming language used`;

    const prompt = `${systemPrompt}\n\nUser Task: ${taskDescription}`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
      },
    });

    const response = result.response.text();

    // Parse response to extract code and explanation
    const codeMatch = response.match(/```(\w+)?\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[2].trim() : response;
    const language = codeMatch ? (codeMatch[1] || 'javascript') : 'javascript';

    // Extract explanation (text before or after code block)
    let explanation = response;
    if (codeMatch) {
      explanation = response.replace(/```[\s\S]*?```/, '').trim();
    }

    const suggestion: CodeSuggestion = {
      taskId,
      code,
      language,
      explanation: explanation || undefined,
      appliedPreferences: preferences.map(p => p.id),
    };

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}
