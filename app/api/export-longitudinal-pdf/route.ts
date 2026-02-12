import { NextRequest, NextResponse } from 'next/server';
import ReactPDF, { Document, Page, Text, View, StyleSheet, DocumentProps } from '@react-pdf/renderer';
import React, { ReactElement } from 'react';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { apiError } from '@/lib/api-helpers';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11 },
  header: { textAlign: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 2, borderBottomColor: '#000000', borderBottomStyle: 'solid' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#666666', marginBottom: 4 },
  dateText: { fontSize: 10, color: '#666666' },
  sectionHeader: { fontSize: 13, fontWeight: 'bold', marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#cccccc', borderBottomStyle: 'solid' },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  infoLabel: { width: 100, fontWeight: 'bold', fontSize: 10 },
  infoValue: { flex: 1, fontSize: 10 },
  evalCard: { marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#dddddd', borderStyle: 'solid', borderRadius: 4 },
  evalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  evalTitle: { fontSize: 11, fontWeight: 'bold' },
  evalLevel: { fontSize: 10, fontWeight: 'bold' },
  narrativeText: { fontSize: 10, lineHeight: 1.5, marginTop: 4 },
  summarySection: { marginTop: 12, padding: 10, backgroundColor: '#f5f5f5' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 9, color: '#666666', borderTopWidth: 1, borderTopColor: '#cccccc', borderTopStyle: 'solid', paddingTop: 8 },
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { enrollmentId } = await request.json();
    if (!enrollmentId) return apiError('enrollmentId is required', 400);

    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        rotation: { include: { clerkship: true } },
        evaluations: { orderBy: { periodNumber: 'asc' } },
        summaries: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!enrollment) return apiError('Enrollment not found', 404);

    const { student, rotation, evaluations, summaries } = enrollment;
    const clerkship = rotation.clerkship;

    const pages: ReactElement[] = [];

    // Page 1: Overview + evaluations
    pages.push(
      React.createElement(Page, { key: 'p1', size: 'LETTER', style: styles.page },
        React.createElement(View, { style: styles.header },
          React.createElement(Text, { style: styles.title }, 'LONGITUDINAL PROGRESS REPORT'),
          React.createElement(Text, { style: styles.subtitle }, clerkship.name),
          React.createElement(Text, { style: styles.dateText }, `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
        ),
        React.createElement(View, { style: { marginBottom: 12 } },
          React.createElement(View, { style: styles.infoRow },
            React.createElement(Text, { style: styles.infoLabel }, 'Student:'),
            React.createElement(Text, { style: styles.infoValue }, student.name)
          ),
          React.createElement(View, { style: styles.infoRow },
            React.createElement(Text, { style: styles.infoLabel }, 'Academic Year:'),
            React.createElement(Text, { style: styles.infoValue }, rotation.academicYear)
          ),
          React.createElement(View, { style: styles.infoRow },
            React.createElement(Text, { style: styles.infoLabel }, 'Status:'),
            React.createElement(Text, { style: styles.infoValue }, enrollment.status)
          ),
          React.createElement(View, { style: styles.infoRow },
            React.createElement(Text, { style: styles.infoLabel }, 'Evaluations:'),
            React.createElement(Text, { style: styles.infoValue }, `${evaluations.length} completed`)
          ),
        ),
        React.createElement(Text, { style: styles.sectionHeader }, 'EVALUATION TIMELINE'),
        ...evaluations.map((ev, i) =>
          React.createElement(View, { key: `eval-${i}`, style: styles.evalCard },
            React.createElement(View, { style: styles.evalHeader },
              React.createElement(Text, { style: styles.evalTitle }, `Period ${ev.periodNumber} - ${ev.evaluatorName}`),
              React.createElement(Text, { style: styles.evalLevel }, ev.performanceLevel)
            ),
            React.createElement(Text, { style: { fontSize: 9, color: '#888888' } }, new Date(ev.evaluationDate).toLocaleDateString()),
            (ev.editedNarrative || ev.generatedNarrative) &&
              React.createElement(Text, { style: styles.narrativeText }, ev.editedNarrative || ev.generatedNarrative)
          )
        ),
        React.createElement(View, { style: styles.footer },
          React.createElement(Text, null, 'Confidential - Medical Education Records')
        )
      )
    );

    // Page 2: Summaries (if any)
    if (summaries.length > 0) {
      pages.push(
        React.createElement(Page, { key: 'p2', size: 'LETTER', style: styles.page },
          React.createElement(Text, { style: styles.sectionHeader }, 'PROGRESS SUMMARIES'),
          ...summaries.map((s, i) =>
            React.createElement(View, { key: `sum-${i}`, style: styles.summarySection },
              React.createElement(Text, { style: { fontSize: 12, fontWeight: 'bold', marginBottom: 6 } },
                `${s.type.replace('_', ' ')} Summary — ${s.authorName}`
              ),
              React.createElement(Text, { style: { fontSize: 9, color: '#888888', marginBottom: 6 } },
                new Date(s.createdAt).toLocaleDateString()
              ),
              s.strengthsSummary && React.createElement(View, { style: { marginBottom: 6 } },
                React.createElement(Text, { style: { fontSize: 10, fontWeight: 'bold' } }, 'Strengths:'),
                React.createElement(Text, { style: styles.narrativeText }, s.strengthsSummary)
              ),
              s.growthAreasSummary && React.createElement(View, { style: { marginBottom: 6 } },
                React.createElement(Text, { style: { fontSize: 10, fontWeight: 'bold' } }, 'Growth Areas:'),
                React.createElement(Text, { style: styles.narrativeText }, s.growthAreasSummary)
              ),
              s.progressNarrative && React.createElement(View, { style: { marginBottom: 6 } },
                React.createElement(Text, { style: { fontSize: 10, fontWeight: 'bold' } }, 'Progress:'),
                React.createElement(Text, { style: styles.narrativeText }, s.editedNarrative || s.progressNarrative)
              ),
              s.recommendations && React.createElement(View, null,
                React.createElement(Text, { style: { fontSize: 10, fontWeight: 'bold' } }, 'Recommendations:'),
                React.createElement(Text, { style: styles.narrativeText }, s.recommendations)
              ),
            )
          ),
          React.createElement(View, { style: styles.footer },
            React.createElement(Text, null, 'Confidential - Medical Education Records')
          )
        )
      );
    }

    const doc = React.createElement(Document, null, ...pages) as ReactElement<DocumentProps>;
    const pdfStream = await ReactPDF.renderToStream(doc);

    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    const sanitizedName = student.name.replace(/\s+/g, '_');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizedName}_${clerkship.name.replace(/\s+/g, '_')}_Progress.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating longitudinal PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
