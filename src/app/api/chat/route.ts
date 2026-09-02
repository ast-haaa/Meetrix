import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { searchMeetingKnowledgeStore, VectorDocument } from '@/lib/ai/vectorStore';
import { MOCK_MEETINGS, MOCK_DECISIONS, MOCK_ACTION_ITEMS } from '@/lib/mockData';
import { z } from 'zod';

const ChatQuerySchema = z.object({
  query: z.string().min(1, 'Query text is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ChatQuerySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid query payload', details: validation.error.flatten() }, { status: 400 });
    }

    const { query } = validation.data;
    const q = query.toLowerCase().trim();

    // 1. Gather Knowledge Base Documents from DB or Mock Store
    const knowledgeDocs: VectorDocument[] = [];

    try {
      const meetings = await prisma.meeting.findMany({
        include: {
          transcriptUtterances: { include: { speaker: { include: { owner: true } } } },
          decisions: true,
          actionItems: true,
        },
      });

      if (meetings.length > 0) {
        for (const m of meetings) {
          const dateStr = new Date(m.scheduledAt || m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          for (const u of m.transcriptUtterances) {
            knowledgeDocs.push({
              id: u.id,
              type: 'UTTERANCE',
              content: u.text,
              meetingId: m.id,
              meetingTitle: m.title,
              date: dateStr,
              speakerName: u.speaker?.owner?.name || u.speaker?.speakerLabel || 'Speaker',
              timestamp: `${Math.floor(u.startTime / 60)}:${String(Math.floor(u.startTime % 60)).padStart(2, '0')}s`,
            });
          }

          for (const d of m.decisions) {
            knowledgeDocs.push({
              id: d.id,
              type: 'DECISION',
              content: `Decision: ${d.title}. Context: ${d.context}`,
              meetingId: m.id,
              meetingTitle: m.title,
              date: dateStr,
            });
          }
        }
      }
    } catch (dbErr) {
      console.warn('[Chat RAG] DB query fallback:', dbErr);
    }

    // Populate mock fallback docs if DB yields insufficient documents
    if (knowledgeDocs.length === 0) {
      for (const m of MOCK_MEETINGS) {
        const dateStr = new Date(m.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        for (const u of m.transcriptUtterances) {
          knowledgeDocs.push({
            id: u.id,
            type: 'UTTERANCE',
            content: u.text,
            meetingId: m.id,
            meetingTitle: m.title,
            date: dateStr,
            speakerName: u.speakerName || u.speakerLabel,
            timestamp: `${Math.floor(u.startTime / 60)}:${String(Math.floor(u.startTime % 60)).padStart(2, '0')}s`,
          });
        }
      }
    }

    // 2. Perform Semantic Vector Search
    const searchResults = await searchMeetingKnowledgeStore(query, knowledgeDocs, 4);
    const retrievedDocs = searchResults.map((r) => r.doc);

    // Build Citation List
    const citations = retrievedDocs.map((doc) => ({
      meetingId: doc.meetingId,
      meetingTitle: doc.meetingTitle,
      date: doc.date,
      speakerName: doc.speakerName || 'Speaker',
      timestamp: doc.timestamp || '0:00s',
      textSnippet: doc.content,
    }));

    // Check Live LLM API Keys
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // 🧠 Omniscient Platform & Architecture Intelligence Engine
      let answer = '';

      // Greetings & Platform Overview
      if (
        /^(hi|hello|hey|greetings|howdy|hola|yo|sup|good morning|good afternoon|good evening)\b/i.test(q) ||
        q.includes('who are you') ||
        q.includes('what can you do') ||
        q.includes('help') ||
        q.includes('what is meetrix')
      ) {
        answer = `Hello! 👋 I am Meetrix AI Assistant, your omniscient platform & decision intelligence bot.\n\nI know everything about Meetrix AI! Ask me about:\n• Tech Architecture & DB Migration (PostgreSQL + Prisma ORM)\n• Speech & Whisper Audio Pipeline (Real-time micro-chunking)\n• Past Decisions & Stale Commitments (/decisions)\n• Action Items, Assigned Tasks & Owners (/action-items)\n• Jira Cloud & Slack Integrations (/settings/integrations)\n• Team Follow-Through & SLA Analytics (/accountability)\n• Admin Audit Logs & Retriggering Workers (/admin/dashboard)`;
      }
      // Gratitude / Conversational Closings
      else if (/^(thanks|thank you|great|awesome|cool|ok|got it|perfect|nice)\b/i.test(q)) {
        answer = `You're welcome! 😊 Ask me anything about your meetings, code architecture, decisions, or team tasks anytime!`;
      }
      // Technical Database Architecture Queries
      else if (q.includes('database') || q.includes('postgres') || q.includes('prisma') || q.includes('mongo') || q.includes('orm') || q.includes('schema') || q.includes('backend')) {
        answer = `Meetrix AI uses PostgreSQL with Prisma ORM for relational type safety, multi-tenant schema isolation, and ACID compliance.\n\nKey details:\n• Migrated from MongoDB for strict relational type safety.\n• Prisma Client handles query building & schema migrations (npx prisma db push).\n• Seed script (prisma/seed.ts) provides clean test data for meetings, utterances, decisions, and action items.\n\nReference: Sprint 14 Planning & DB Architecture (Sarah Connor @ 0:05s)`;
      }
      // Speech & Audio Ingestion Queries
      else if (q.includes('whisper') || q.includes('audio') || q.includes('recording') || q.includes('diarization') || q.includes('mic') || q.includes('chunk') || q.includes('upload') || q.includes('speech')) {
        answer = `Meetrix AI supports both Live Recording and File Uploads for speech ingestion:\n\n• Live Recording: Captures microphone audio in background slices (10s, 12s, 15s) and concatenates audio into one full-length webm/mp4 recording.\n• Transcription: Integrated with OpenAI Whisper API for speech-to-text and Deepgram for speaker diarization.\n• RAG Pipeline: Utterances are embedded into a vector store for semantic search.`;
      }
      // Decision Tracking & Stale Commitments Queries
      else if (q.includes('decision') || q.includes('stale') || q.includes('commit') || q.includes('ledger') || q.includes('fulfilled') || q.includes('unacted')) {
        answer = `Meetrix tracks cross-meeting decisions and automatically monitors follow-through:\n\n1. Migrate core database to PostgreSQL + Prisma ORM — FULFILLED (Impact: 5/5)\n2. Implement Whisper API + Diarization Pipeline — UNACTED_ALERT (Impact: 4/5)\n3. Integrate Slack & Jira Webhooks for Auto-Dispatch — ACTIVE (Impact: 3/5)\n\nDecisions left untouched for >14 days are flagged into the Stale Ledger for executive review.`;
      }
      // Action Items & Task Owners Queries
      else if (q.includes('task') || q.includes('action item') || q.includes('todo') || q.includes('assignee') || q.includes('priya') || q.includes('kavya') || q.includes('arjun') || q.includes('owner') || q.includes('kanban')) {
        answer = `Here are the active team action items:\n\n• Build Whisper API Ingestion Worker — Assigned to Priya Sharma (Priority: URGENT)\n• Configure Jira OAuth2 & Slack Webhook Router — Assigned to Kavya Nair (Priority: MEDIUM)\n• PostgreSQL Schema Isolation Audit — Assigned to Arjun Mehta (Priority: HIGH)\n\nManage and dispatch all tickets on the Action Items Kanban board (/action-items).`;
      }
      // Jira & Slack Integrations Queries
      else if (q.includes('jira') || q.includes('slack') || q.includes('export') || q.includes('integration') || q.includes('webhook') || q.includes('ticket')) {
        answer = `Meetrix AI integrates with Jira Cloud REST API and Slack Webhooks:\n\n• Jira Cloud: Exports action items directly into Jira project backlogs with issue key, assignee, and priority.\n• Slack Webhooks: Dispatches instant real-time notifications to team channels.\n• Manage credentials on the Integrations page (/settings/integrations).`;
      }
      // Team Reliability & SLA Analytics Queries
      else if (q.includes('accountability') || q.includes('reliability') || q.includes('sla') || q.includes('velocity') || q.includes('follow-through') || q.includes('metric') || q.includes('scorecard')) {
        answer = `The Team Reliability dashboard (/accountability) measures commitment execution:\n\n• Follow-Through Rate: 88% - 94% across sprints.\n• Decision Velocity: 1.2d - 2.4d average resolution SLA.\n• Member Scorecards: Tracks individual completion rates and accountability badges.`;
      }
      // Admin Control Room Queries
      else if (q.includes('admin') || q.includes('audit') || q.includes('log') || q.includes('retrigger') || q.includes('security') || q.includes('control room')) {
        answer = `The Admin Control Room (/admin/dashboard) allows workspace administrators to:\n\n• Audit system security logs and API access timestamps.\n• Manage workspace members and role permissions (ADMIN / MEMBER).\n• Retrigger failed transcription or decision-extraction workers.`;
      }
      // Auth & Guest Mode Queries
      else if (q.includes('guest') || q.includes('login') || q.includes('sign in') || q.includes('account') || q.includes('signup') || q.includes('password') || q.includes('forgot')) {
        answer = `Meetrix AI supports both Guest Mode and Full Auth:\n\n• Guest Mode: Lets you explore all features, live recording, and analytics without entering credentials.\n• Full Account: Sign in or create an account from the top navbar or side drawer anytime to save permanent data.`;
      }
      // General Semantic Transcript RAG Match Fallback
      else {
        const topCitation = citations[0];
        if (topCitation && topCitation.textSnippet) {
          answer = `Based on your transcripts from ${topCitation.meetingTitle || 'Sprint Sync'} (${topCitation.date}), ${topCitation.speakerName} mentioned:\n\n"${topCitation.textSnippet}"\n\nReference: ${topCitation.meetingTitle} • ${topCitation.speakerName} @ ${topCitation.timestamp}`;
        } else {
          answer = `I scanned the entire Meetrix knowledge base for "${query}".\n\nI can answer anything about:\n• Tech Stack & PostgreSQL DB Migration\n• Whisper Audio & Live Recording Pipeline\n• Action Items, Decisions & Jira Integrations\n• Team Reliability Metrics & Admin Control Room`;
        }
      }

      return NextResponse.json({
        answer,
        citations,
        isMock: true,
      });
    }

    // Live LLM Call with RAG System Prompt
    const contextPrompt = citations
      .map(
        (c, idx) =>
          `[Source ${idx + 1}] Meeting: "${c.meetingTitle}" (Date: ${c.date}, Speaker: ${c.speakerName}, Time: ${c.timestamp})\nContent: "${c.textSnippet}"`
      )
      .join('\n\n');

    const systemPrompt = `You are the Meetrix AI Assistant. You have complete knowledge of the Meetrix AI SaaS platform including PostgreSQL database architecture, Prisma ORM, Whisper API speech ingestion, Jira & Slack integrations, team accountability metrics, decisions, action items, and admin controls.
Answer the user's question accurately. Include explicit citations referencing meeting title, speaker, and timestamp when referencing meeting transcripts.
Do NOT use markdown bold asterisks. Use clean plain text.`;

    const userPrompt = `RETRIEVED CONTEXT:\n${contextPrompt}\n\nUSER QUESTION: ${query}`;

    const llmRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    const llmData = await llmRes.json();
    const rawAnswer = llmData.choices[0].message.content;
    const answer = rawAnswer.replace(/\*\*/g, '').replace(/\*/g, '');

    return NextResponse.json({
      answer,
      citations,
      isMock: false,
    });
  } catch (error: any) {
    console.error('[API POST /api/chat] RAG Chat Error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
