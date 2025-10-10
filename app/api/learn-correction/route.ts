import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { addLearnedPreference, addTaskToHistory } from '@/lib/learning-store';
import { LearnedPreference, CorrectionFeedback, TaskHistory } from '@/types/coding';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { correction, taskHistory } = await req.json();

    if (!correction || !taskHistory) {
      return NextResponse.json(
        { error: 'Correction and task history are required' },
        { status: 400 }
      );
    }

    const { feedback, correctionType, correctedCode, originalCode } = correction as CorrectionFeedback;
    const task = taskHistory.task;

    // Use AI to extract learnable patterns from the correction
    const analysisPrompt = `Analyze this coding correction and extract a reusable preference or pattern.

Task: ${task.description}

Original Code:
${originalCode}

User's Feedback: ${feedback}

${correctedCode ? `Corrected Code:\n${correctedCode}` : ''}

Extract a clear, reusable preference that should be applied to future tasks. Format as a single sentence describing what to do or avoid.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a pattern extraction assistant. Extract clear, actionable preferences from code corrections. Return only the preference statement, nothing else.'
        },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
    });

    const preferenceDescription = completion.choices[0].message.content?.trim() || feedback;

    // Create learned preference
    const newPreference: LearnedPreference = {
      id: `pref_${Date.now()}`,
      type: correctionType,
      description: preferenceDescription,
      example: correctedCode || undefined,
      timestamp: Date.now(),
      taskContext: task.description,
    };

    // Save preference
    await addLearnedPreference(newPreference);

    // Update task history with correction
    const updatedHistory: TaskHistory = {
      ...taskHistory,
      correction,
      accepted: false,
    };
    await addTaskToHistory(updatedHistory);

    return NextResponse.json({
      success: true,
      learnedPreference: newPreference,
    });
  } catch (error) {
    console.error('Error learning from correction:', error);
    return NextResponse.json(
      { error: 'Failed to learn from correction' },
      { status: 500 }
    );
  }
}
