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
  statRow: { flexDirection: 'row', marginBottom: 4 },
  statLabel: { width: 140, fontSize: 10 },
  statValue: { flex: 1, fontSize: 10, fontWeight: 'bold' },
  studentRow: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#eeeeee', borderBottomStyle: 'solid' },
  studentName: { width: 160, fontSize: 10 },
  studentStat: { width: 80, fontSize: 10, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 9, color: '#666666', borderTopWidth: 1, borderTopColor: '#cccccc', borderTopStyle: 'solid', paddingTop: 8 },
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { rotationId } = await request.json();
    if (!rotationId) return apiError('rotationId is required', 400);

    const rotation = await prisma.rotation.findUnique({
      where: { id: rotationId },
      include: {
        clerkship: true,
        enrollments: {
          include: {
            student: true,
            evaluations: { where: { isComplete: true }, orderBy: { periodNumber: 'asc' } },
          },
        },
      },
    });

    if (!rotation) return apiError('Rotation not found', 404);

    const { clerkship, enrollments } = rotation;

    // Calculate stats
    const totalStudents = enrollments.length;
    const totalEvals = enrollments.reduce((sum, e) => sum + e.evaluations.length, 0);
    const levelCounts: Record<string, number> = {};
    enrollments.forEach(e => {
      e.evaluations.forEach(ev => {
        levelCounts[ev.performanceLevel] = (levelCounts[ev.performanceLevel] || 0) + 1;
      });
    });

    const doc = React.createElement(Document, null,
      React.createElement(Page, { size: 'LETTER', style: styles.page },
        // Header
        React.createElement(View, { style: styles.header },
          React.createElement(Text, { style: styles.title }, 'COHORT PERFORMANCE REPORT'),
          React.createElement(Text, { style: styles.subtitle }, `${clerkship.name} — ${rotation.academicYear}`),
          React.createElement(Text, { style: styles.dateText }, `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
        ),

        // Overview Stats
        React.createElement(Text, { style: styles.sectionHeader }, 'OVERVIEW'),
        React.createElement(View, { style: styles.statRow },
          React.createElement(Text, { style: styles.statLabel }, 'Total Students:'),
          React.createElement(Text, { style: styles.statValue }, String(totalStudents))
        ),
        React.createElement(View, { style: styles.statRow },
          React.createElement(Text, { style: styles.statLabel }, 'Total Evaluations:'),
          React.createElement(Text, { style: styles.statValue }, String(totalEvals))
        ),
        React.createElement(View, { style: styles.statRow },
          React.createElement(Text, { style: styles.statLabel }, 'Rotation Dates:'),
          React.createElement(Text, { style: styles.statValue }, `${new Date(rotation.startDate).toLocaleDateString()} — ${new Date(rotation.endDate).toLocaleDateString()}`)
        ),

        // Performance Distribution
        React.createElement(Text, { style: styles.sectionHeader }, 'PERFORMANCE DISTRIBUTION'),
        ...Object.entries(levelCounts).map(([level, count]) =>
          React.createElement(View, { key: level, style: styles.statRow },
            React.createElement(Text, { style: styles.statLabel }, `${level}:`),
            React.createElement(Text, { style: styles.statValue }, `${count} evaluation${count !== 1 ? 's' : ''} (${totalEvals > 0 ? Math.round(count / totalEvals * 100) : 0}%)`)
          )
        ),

        // Per-student summary
        React.createElement(Text, { style: styles.sectionHeader }, 'STUDENT SUMMARIES'),
        React.createElement(View, { style: { ...styles.studentRow, borderBottomWidth: 2, borderBottomColor: '#000000' } },
          React.createElement(Text, { style: { ...styles.studentName, fontWeight: 'bold' } }, 'Student'),
          React.createElement(Text, { style: { ...styles.studentStat, fontWeight: 'bold' } }, 'Evals'),
          React.createElement(Text, { style: { ...styles.studentStat, fontWeight: 'bold' } }, 'Status'),
          React.createElement(Text, { style: { ...styles.studentStat, fontWeight: 'bold' } }, 'Most Recent'),
        ),
        ...enrollments.map((e, i) => {
          const lastEval = e.evaluations[e.evaluations.length - 1];
          return React.createElement(View, { key: i, style: styles.studentRow },
            React.createElement(Text, { style: styles.studentName }, e.student.name),
            React.createElement(Text, { style: styles.studentStat }, String(e.evaluations.length)),
            React.createElement(Text, { style: styles.studentStat }, e.status),
            React.createElement(Text, { style: styles.studentStat }, lastEval?.performanceLevel || '-'),
          );
        }),

        React.createElement(View, { style: styles.footer },
          React.createElement(Text, null, 'Confidential - Medical Education Records')
        )
      )
    ) as ReactElement<DocumentProps>;

    const pdfStream = await ReactPDF.renderToStream(doc);
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Cohort_${clerkship.name.replace(/\s+/g, '_')}_${rotation.academicYear}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating cohort PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
