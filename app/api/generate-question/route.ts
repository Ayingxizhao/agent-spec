import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { plannerPrompt } from '../../../prompts/planner';
import { questionTemplates } from '../../../prompts/questionTemplates';
import { mockQuestionPlan } from './mock';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const USE_MOCK_API = process.env.USE_MOCK_API === 'true';

if (!process.env.OPENAI_API_KEY && !USE_MOCK_API) {
  console.error('OPENAI_API_KEY environment variable is not set');
}

export async function POST(request: NextRequest) {
  try {
    const { userInput, requestType } = await request.json();

    if (requestType === 'generate_plan') {
      // Return mock data if enabled
      if (USE_MOCK_API) {
        console.log('🎭 Using mock API data');
        return NextResponse.json(mockQuestionPlan);
      }

      // Check API key only if not using mock
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
          { status: 500 }
        );
      }

      // Generate complete plan from user input
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: plannerPrompt
          },
          {
            role: 'user',
            content: `USER'S PROJECT IDEA: ${userInput}\n\nAnalyze this idea and generate a complete question plan. Respond with valid JSON format.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const responseText = completion.choices[0].message.content || '{}';
      const planData = JSON.parse(responseText);

      // Add template data to each question in the plan and include progress metadata
      const enrichedPlan = planData.question_plan.map((planItem: any, index: number) => {
        const template = questionTemplates[planItem.template_id as keyof typeof questionTemplates];
        if (!template) {
          throw new Error(`Template ${planItem.template_id} not found`);
        }
        
        // Determine SWE phase for this question
        const getPhaseFromTemplateId = (templateId: string) => {
          if (templateId === 'q1') return 'problemDefinition';
          if (templateId.startsWith('q2')) return 'solutionApproach';
          if (templateId.startsWith('q3')) return 'scope';
          if (templateId === 'q4') return 'technical';
          if (templateId === 'q5') return 'execution';
          return 'problemDefinition';
        };
        
        return {
          ...planItem,
          template: {
            ...template,
            text: planItem.adapted_text || template.text,
            preSelected: planItem.pre_selected_options || []
          },
          progressMetadata: {
            phase: getPhaseFromTemplateId(planItem.template_id),
            sequenceNumber: index + 1,
            estimatedTimeMinutes: planItem.status === 'SKIP' ? 0 : 
                                 template.multiSelect ? 2 : 1,
            complexity: template.multiSelect ? 'medium' : 'simple',
            confidence: planData.analysis?.inferred_aspects?.[`${planItem.question_id}_confidence`] || 0.8
          }
        };
      });

      // Calculate phase statistics
      const phaseStats = {
        problemDefinition: { total: 0, toAsk: 0, skipped: 0 },
        solutionApproach: { total: 0, toAsk: 0, skipped: 0 },
        scope: { total: 0, toAsk: 0, skipped: 0 },
        technical: { total: 0, toAsk: 0, skipped: 0 },
        execution: { total: 0, toAsk: 0, skipped: 0 }
      };

      enrichedPlan.forEach((item: any) => {
        const phase = item.progressMetadata.phase as keyof typeof phaseStats;
        phaseStats[phase].total++;
        if (item.status === 'SKIP') {
          phaseStats[phase].skipped++;
        } else {
          phaseStats[phase].toAsk++;
        }
      });

      return NextResponse.json({
        analysis: planData.analysis,
        questionPlan: enrichedPlan,
        totalQuestions: planData.total_questions_to_ask,
        estimatedTime: planData.estimated_completion_time,
        progressMetadata: {
          phaseStatistics: phaseStats,
          overallConfidence: planData.analysis?.confidence_level || 'medium',
          totalEstimatedMinutes: enrichedPlan.reduce((sum: number, item: any) => 
            sum + item.progressMetadata.estimatedTimeMinutes, 0
          ),
          questionsToAsk: enrichedPlan.filter((item: any) => item.status !== 'SKIP').length,
          questionsSkipped: enrichedPlan.filter((item: any) => item.status === 'SKIP').length
        }
      });
    }

    // Invalid request type
    return NextResponse.json(
      { error: 'Invalid request type. Use requestType: "generate_plan"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}