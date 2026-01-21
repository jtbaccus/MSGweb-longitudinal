import { NextRequest, NextResponse } from 'next/server'
import ReactPDF, { Document, Page, Text, View, StyleSheet, DocumentProps } from '@react-pdf/renderer'
import React, { ReactElement } from 'react'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#3366CC',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 24,
    color: '#3366CC',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    borderBottomStyle: 'solid',
  },
  strengthsTitle: {
    color: '#33B34D',
  },
  improvementsTitle: {
    color: '#E63333',
  },
  listItem: {
    fontSize: 12,
    paddingVertical: 8,
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
    borderBottomStyle: 'solid',
  },
  lastListItem: {
    borderBottomWidth: 0,
  },
  bullet: {
    position: 'absolute',
    left: 0,
    color: '#636366',
  },
  emptyMessage: {
    fontSize: 12,
    color: '#636366',
    fontStyle: 'italic',
  },
})

interface StudentSummaryData {
  strengths: Array<{ name: string }>
  areasForImprovement: Array<{ name: string }>
}

function StudentSummaryDocument({ strengths, areasForImprovement }: StudentSummaryData) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'LETTER', style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, 'Feedback Summary')
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          { style: [styles.sectionTitle, styles.strengthsTitle] },
          'Strengths'
        ),
        strengths.length > 0
          ? strengths.map((s, i) =>
              React.createElement(
                View,
                {
                  key: i,
                  style: [
                    styles.listItem,
                    i === strengths.length - 1 ? styles.lastListItem : {},
                  ],
                },
                React.createElement(Text, { style: styles.bullet }, '•'),
                React.createElement(Text, null, s.name)
              )
            )
          : React.createElement(
              Text,
              { style: styles.emptyMessage },
              'No strengths recorded'
            )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          { style: [styles.sectionTitle, styles.improvementsTitle] },
          'Areas for Improvement'
        ),
        areasForImprovement.length > 0
          ? areasForImprovement.map((a, i) =>
              React.createElement(
                View,
                {
                  key: i,
                  style: [
                    styles.listItem,
                    i === areasForImprovement.length - 1 ? styles.lastListItem : {},
                  ],
                },
                React.createElement(Text, { style: styles.bullet }, '•'),
                React.createElement(Text, null, a.name)
              )
            )
          : React.createElement(
              Text,
              { style: styles.emptyMessage },
              'No areas for improvement recorded'
            )
      )
    )
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { strengths, areasForImprovement } = body

    const pdfStream = await ReactPDF.renderToStream(
      React.createElement(StudentSummaryDocument, { strengths, areasForImprovement }) as ReactElement<DocumentProps>
    )

    const chunks: Buffer[] = []
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="student_feedback.pdf"',
      },
    })
  } catch (error) {
    console.error('Error generating student summary PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
