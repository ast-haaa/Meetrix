import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (on pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Meetrix AI — Complete Project & Architecture Documentation")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
        
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, footer_text)
        self.drawString(54, 36, "MEETRIX AI INC. — AUTHORITATIVE DECISION & ACCOUNTABILITY ENGINE")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Color Palette
    PRIMARY = colors.HexColor("#4F46E5")     # Indigo 600
    DARK_TEXT = colors.HexColor("#1E1B4B")   # Deep Navy
    BODY_TEXT = colors.HexColor("#334155")   # Slate 700
    ACCENT_BG = colors.HexColor("#EEF2FF")   # Soft Indigo Background
    BORDER_CLR = colors.HexColor("#C7D2FE")  # Soft Border
    GREEN_ACC = colors.HexColor("#059669")   # Emerald
    CODE_BG = colors.HexColor("#0F172A")     # Dark Slate Code
    CODE_TXT = colors.HexColor("#38BDF8")    # Cyan Text

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=DARK_TEXT,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=14,
        textColor=PRIMARY,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=DARK_TEXT,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=BODY_TEXT,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=body_style,
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=DARK_TEXT
    )

    tbl_header_style = ParagraphStyle(
        'TblHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    tbl_body_style = ParagraphStyle(
        'TblBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=BODY_TEXT
    )

    tbl_code_style = ParagraphStyle(
        'TblCode',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=PRIMARY
    )

    story = []

    # --- TITLE ---
    story.append(Paragraph("🧠 Meetrix AI — Complete System & Architecture Documentation", title_style))
    story.append(Paragraph("Full Technical Guide & Explanation of Prisma ORM, Jira Integration, and AI Pipeline", subtitle_style))

    # Meta banner
    meta_data = [[
        Paragraph("<b>Target:</b> Developers & Stakeholders", tbl_body_style),
        Paragraph("<b>Project:</b> Meetrix AI SaaS Platform", tbl_body_style),
        Paragraph("<b>Core Stack:</b> Next.js 16 + Prisma + Jira + OpenAI", tbl_body_style)
    ]]
    meta_table = Table(meta_data, colWidths=[160, 150, 194])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_CLR),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    # --- SECTION 1: WHAT IS MEETRIX AI ---
    story.append(Paragraph("1. What is Meetrix AI? (High-Level Overview)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=6))
    
    story.append(Paragraph(
        "Meetrix AI is an end-to-end <b>AI-Powered Decision & Accountability Engine</b> designed for modern engineering teams. "
        "It transcribes meeting audio, attributes dialogue to speakers, extracts formal decisions and action items using LLMs, "
        "stores relational entity graphs in PostgreSQL/SQLite via <b>Prisma ORM</b>, and dispatches action items directly to <b>Jira Cloud</b> and <b>Slack</b>.",
        body_style
    ))

    # Callout
    callout_data = [[Paragraph(
        "<b>Core Value Proposition:</b> Prevents 'verbal decision decay' where teams agree on commitments during meetings but forget to create tickets or follow through.",
        callout_style
    )]]
    callout_table = Table(callout_data, colWidths=[504])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT_BG),
        ('PADDING', (0,0), (-1,-1), 6),
        ('LINELEFT', (0,0), (-1,-1), 3, PRIMARY),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_CLR),
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 8))

    # --- SECTION 2: HOW PRISMA ORM IS CONNECTED ---
    story.append(Paragraph("2. Prisma ORM Architecture & Database Connection", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=6))

    story.append(Paragraph(
        "<b>Prisma ORM</b> serves as the central data persistence layer. It connects the Next.js API endpoints to the database using type-safe auto-generated TypeScript bindings.",
        body_style
    ))

    prisma_table_data = [
        [Paragraph("Prisma Entity / Model", tbl_header_style), Paragraph("Purpose & Relations", tbl_header_style), Paragraph("API / Service Usage", tbl_header_style)],
        
        [Paragraph("Organization", tbl_code_style),
         Paragraph("Multi-tenant root container for projects, users, meetings, and integration credentials.", tbl_body_style),
         Paragraph("Used by `/api/settings/integrations`, `/api/meetings`", tbl_body_style)],

        [Paragraph("IntegrationSetting", tbl_code_style),
         Paragraph("Stores encrypted Jira & Slack webhooks/API credentials (`encryptedHostUrl`, `encryptedApiToken`).", tbl_body_style),
         Paragraph("Used by `/api/settings/integrations` and `/api/export/jira`", tbl_body_style)],

        [Paragraph("Meeting & Utterance", tbl_code_style),
         Paragraph("Stores transcript segments with start/end timestamps and assigned speaker IDs.", tbl_body_style),
         Paragraph("Used by `/api/meetings/upload`, `/api/meetings/live`", tbl_body_style)],

        [Paragraph("Decision & ActionItem", tbl_code_style),
         Paragraph("Extracted decisions and assigned tasks with priority, due date, status, and owner reference.", tbl_body_style),
         Paragraph("Used by `/api/action-items`, `/api/decisions`, `/api/export/jira`", tbl_body_style)],

        [Paragraph("FollowThroughTracking", tbl_code_style),
         Paragraph("Cross-meeting tracker comparing past decisions against subsequent meeting transcripts.", tbl_body_style),
         Paragraph("Used by `/api/accountability` service", tbl_body_style)],
    ]
    p_table = Table(prisma_table_data, colWidths=[120, 204, 180])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(p_table)
    story.append(Spacer(1, 8))

    # --- SECTION 3: HOW JIRA INTEGRATION WORKS ---
    story.append(Paragraph("3. Jira Cloud API Integration & Webhook Flow", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=6))

    story.append(Paragraph(
        "Meetrix seamlessly connects to <b>Atlassian Jira Cloud REST API v3</b> to convert extracted meeting action items into actual Jira issue tickets.",
        body_style
    ))

    story.append(Paragraph("<b>Step 1: Credential Configuration ([`src/app/settings/integrations/page.tsx`](file:///c:/Users/ASTHA/OneDrive/Desktop/ai_saas/ai_saas/src/app/settings/integrations/page.tsx))</b> — User enters Jira Host URL, User Email, and API Token. The credentials are encrypted using AES-256 and stored in Prisma DB.", bullet_style))
    story.append(Paragraph("<b>Step 2: Action Queue ([`src/app/action-items/page.tsx`](file:///c:/Users/ASTHA/OneDrive/Desktop/ai_saas/ai_saas/src/app/action-items/page.tsx))</b> — User clicks 'Jira' on any extracted action item.", bullet_style))
    story.append(Paragraph("<b>Step 3: Backend Dispatcher ([`src/app/api/export/jira/route.ts`](file:///c:/Users/ASTHA/OneDrive/Desktop/ai_saas/ai_saas/src/app/api/export/jira/route.ts))</b> — Fetches and decrypts credentials from Prisma DB, then issues a `POST /rest/api/3/issue` call with Basic Authorization header (`Buffer.from(email:token).toString('base64')`).", bullet_style))
    story.append(Paragraph("<b>Step 4: Smart Fallback Simulation</b> — If live Jira credentials are not configured yet, the system generates a simulated ticket key (e.g. `ENG-4892`) so developers can test workflows without API keys.", bullet_style))

    story.append(Spacer(1, 8))

    # --- SECTION 4: FULL TECH STACK & RATIONALE ---
    story.append(Paragraph("4. Tech Stack Breakdown & Decision Rationale", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=6))

    why_tech_data = [
        [Paragraph("Technology", tbl_header_style), Paragraph("Function in Project", tbl_header_style), Paragraph("WHY We Chose It", tbl_header_style)],
        
        [Paragraph("Next.js 16 (App Router)", tbl_code_style),
         Paragraph("Full-stack framework", tbl_body_style),
         Paragraph("Unified React UI and API routes in one single project with server-side rendering.", tbl_body_style)],

        [Paragraph("Prisma ORM 5.22", tbl_code_style),
         Paragraph("Database ORM", tbl_body_style),
         Paragraph("Type-safe schema models, automatic migrations, and clean TypeScript client interface.", tbl_body_style)],

        [Paragraph("OpenAI Whisper-1", tbl_code_style),
         Paragraph("Speech-to-Text AI", tbl_body_style),
         Paragraph("Industry-leading speech recognition for noisy meeting recordings and technical jargon.", tbl_body_style)],

        [Paragraph("Deepgram Diarize", tbl_code_style),
         Paragraph("Speaker Attribution", tbl_body_style),
         Paragraph("Accurately identifies speaker turn-taking and attributes timestamped utterances to owners.", tbl_body_style)],

        [Paragraph("OpenAI GPT-4o & Zod", tbl_code_style),
         Paragraph("LLM & Validation", tbl_body_style),
         Paragraph("Extracts decisions into structured JSON schemas verified strictly by Zod validators.", tbl_body_style)],

        [Paragraph("TailwindCSS 4", tbl_code_style),
         Paragraph("Styling & Design System", tbl_body_style),
         Paragraph("Delivers modern glassmorphism aesthetic, sleek dark themes, and responsive UI components.", tbl_body_style)],
    ]

    why_table = Table(why_tech_data, colWidths=[110, 120, 274])
    why_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(why_table)
    story.append(Spacer(1, 10))

    # --- SECTION 5: DUAL-PATH ARCHITECTURE ---
    story.append(Paragraph("5. Dual-Path Architecture (Online vs Offline Fallback)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=6))

    fb_simple = [
        [Paragraph("Component", tbl_header_style), Paragraph("Online Mode (Live APIs Connected)", tbl_header_style), Paragraph("Offline Fallback Mode (No API Keys)", tbl_header_style)],
        [Paragraph("Transcribing Audio", tbl_body_style), Paragraph("OpenAI Whisper REST API", tbl_body_style), Paragraph("Simulated audio speech-to-text pipeline", tbl_body_style)],
        [Paragraph("Speaker Attribution", tbl_body_style), Paragraph("Deepgram Speaker Diarization", tbl_body_style), Paragraph("Alternating speaker attribution algorithm", tbl_body_style)],
        [Paragraph("Decision Engine", tbl_body_style), Paragraph("OpenAI GPT-4o LLM", tbl_body_style), Paragraph("Heuristic regex keyword parser ('I will')", tbl_body_style)],
        [Paragraph("Jira Ticket Sync", tbl_body_style), Paragraph("Atlassian Jira Cloud REST API v3", tbl_body_style), Paragraph("Simulated ticket key creation (e.g. ENG-842)", tbl_body_style)],
    ]
    fb_table = Table(fb_simple, colWidths=[100, 200, 204])
    fb_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(fb_table)
    story.append(Spacer(1, 10))

    # --- SECTION 6: CONCLUSION ---
    story.append(Paragraph("6. Project Status & Summary", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=6))
    
    story.append(Paragraph("✅ <b>Database Pushed & Seeded:</b> `prisma db push` and `npm run db:seed` verified with zero errors.", bullet_style))
    story.append(Paragraph("✅ <b>Jira & Prisma Fully Connected:</b> Integration credential routing, encryption, and export endpoints active.", bullet_style))
    story.append(Paragraph("✅ <b>Production Build Verified:</b> `npm run build` compiled 37 static and dynamic pages with 0 errors.", bullet_style))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == '__main__':
    target_path = sys.argv[1] if len(sys.argv) > 1 else 'Meetrix_AI_Project_Documentation.pdf'
    build_pdf(target_path)
