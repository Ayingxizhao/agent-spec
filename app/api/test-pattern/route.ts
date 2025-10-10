import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { computeCodeDiff } from '@/lib/diff-utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Hardcoded test examples
const BASIC_LOGIN_ENDPOINT = `const express = require('express');
const app = express();

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Simple authentication
  if (username === 'admin' && password === 'password123') {
    res.json({ success: true, token: 'simple-token-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.listen(3000);`;

const SECURE_LOGIN_ENDPOINT = `const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const app = express();

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

app.post('/api/login',
  loginLimiter,
  // Input validation
  body('username').trim().isLength({ min: 3, max: 50 }).escape(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Fetch user from database (example)
      const user = await getUserFromDB(username);

      if (!user) {
        // Don't reveal whether username exists
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Compare hashed password
      const isValid = await bcrypt.compare(password, user.hashedPassword);

      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Generate secure JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ success: true, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.listen(3000);`;

export async function GET() {
  try {
    // 1. Compute diff
    const diffResult = computeCodeDiff(
      BASIC_LOGIN_ENDPOINT,
      SECURE_LOGIN_ENDPOINT,
      'basic-login.js',
      'secure-login.js'
    );

    // 2. Ask GPT-4o-mini to extract patterns
    const analysisPrompt = `A code generator produced an initial code attempting to made secure and an expert then amended it with stronger security practices and follows better to his company's workflow. Review the diff and capture the concrete security patterns that the expert introduced.

Code Diff:
${diffResult.unifiedDiff}

Identify reusable security patterns that surface from moving the system-generated snippet to the expert version (e.g., input validation, parameterized query, password hashing, token issuance). Each pattern should stand on its own so it can be added to a pattern repository.

For each pattern, provide the following fields:
- name: Concise label for the pattern (e.g., "Input Validation Gate").
- changeNarrative: Two sentences describing what the expert changed compared to the generated code and how it now behaves.
- threatMitigated: The primary risk this pattern addresses (e.g., SQL injection, credential reuse, weak entropy).
- controlLayer: One of ["input-hardening", "credential-hygiene", "session-governance", "network-protection", "monitoring-and-alerting", "operational-guardrail"].
- dependencies: Array of prerequisite or companion controls referenced in the change (validators, password policies, crypto primitives, middleware ordering, etc.).
- operationalNotes: Any implementation or governance considerations the engineering team should remember.
- evidenceFromDiff: Quote or paraphrase the specific diff hunk that demonstrates this pattern.

Respond with a JSON object that has a single top-level key "patterns" whose value is an array of these pattern objects.
Do not add commentary outside the JSON object.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a code security expert who extracts reusable patterns from code diffs. Always respond with valid JSON only.'
        },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content || '{"patterns": []}';

    // Parse the JSON response
    let extractedPatterns;
    try {
      const parsed = JSON.parse(responseText);
      // Normalize different shapes that may come back from the model.
      if (Array.isArray(parsed)) {
        extractedPatterns = parsed;
      } else if (parsed && typeof parsed === 'object') {
        const patternsCandidate = (parsed as { patterns?: unknown }).patterns;
        if (Array.isArray(patternsCandidate)) {
          extractedPatterns = patternsCandidate;
        } else if (
          patternsCandidate &&
          typeof patternsCandidate === 'object'
        ) {
          extractedPatterns = Object.values(patternsCandidate);
        } else {
          extractedPatterns = Object.values(parsed);
        }
      } else {
        extractedPatterns = [];
      }
      extractedPatterns = Array.isArray(extractedPatterns)
        ? extractedPatterns.filter(
            (patternCandidate) =>
              patternCandidate !== null && typeof patternCandidate === 'object'
          )
        : [];
    } catch (e) {
      console.error('Failed to parse GPT response:', responseText);
      extractedPatterns = [];
    }

    return NextResponse.json({
      success: true,
      diff: {
        unified: diffResult.unifiedDiff,
        addedLines: diffResult.addedLines,
        removedLines: diffResult.removedLines,
      },
      originalCode: BASIC_LOGIN_ENDPOINT,
      modifiedCode: SECURE_LOGIN_ENDPOINT,
      extractedPatterns,
      rawGPTResponse: responseText,
    });
  } catch (error) {
    console.error('Error in pattern extraction test:', error);
    return NextResponse.json(
      { error: 'Failed to run pattern extraction test' },
      { status: 500 }
    );
  }
}
