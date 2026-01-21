import { NextRequest, NextResponse } from 'next/server'
import ReactPDF, { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#666666',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    width: 80,
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'solid',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
  },
  bullet: {
    width: 15,
    fontSize: 11,
  },
  listText: {
    flex: 1,
    fontSize: 11,
  },
  attributesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  attributeText: {
    fontSize: 11,
  },
  narrativeSection: {
    marginTop: 15,
    marginBottom: 10,
  },
  narrativeTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  narrativeSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  narrativeText: {
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  footerText: {
    marginBottom: 2,
  },
})

interface PDFData {
  studentName: string
  evaluatorName: string
  evaluationDate: string
  clerkshipName: string
  performanceLevel: string
  strengths: Array<{ name: string }>
  areasForImprovement: Array<{ name: string }>
  attributes: Array<{ name: string }>
  narrativeText: string
  generatedNarrative: string
}

function EvaluationReportDocument({
  studentName,
  evaluatorName,
  evaluationDate,
  clerkshipName,
  strengths,
  areasForImprovement,
  attributes,
  narrativeText,
  generatedNarrative,
}: PDFData) {
  const formattedDate = new Date(evaluationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'LETTER', style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, 'MEDICAL STUDENT EVALUATION REPORT'),
        React.createElement(Text, { style: styles.subtitle }, 'Comprehensive Performance Assessment'),
        React.createElement(Text, { style: styles.dateText }, `Date: ${formattedDate}`)
      ),

      // Student Information Section
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionHeader }, 'STUDENT INFORMATION'),
        React.createElement(
          View,
          { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Student:'),
          React.createElement(Text, { style: styles.infoValue }, studentName)
        ),
        React.createElement(
          View,
          { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Evaluator:'),
          React.createElement(Text, { style: styles.infoValue }, evaluatorName)
        )
      ),

      // Clerkship Template Section
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionHeader }, 'CLERKSHIP TEMPLATE'),
        React.createElement(
          View,
          { style: styles.infoRow },
          React.createElement(Text, { style: styles.infoLabel }, 'Template:'),
          React.createElement(Text, { style: styles.infoValue }, clerkshipName)
        )
      ),

      // Evaluation Results Section
      React.createElement(Text, { style: styles.sectionHeader }, 'EVALUATION RESULTS'),

      // Strengths
      strengths.length > 0 &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Strengths:'),
          ...strengths.map((s, i) =>
            React.createElement(
              View,
              { key: `strength-${i}`, style: styles.listItem },
              React.createElement(Text, { style: styles.bullet }, '•'),
              React.createElement(Text, { style: styles.listText }, s.name)
            )
          )
        ),

      // Areas for Improvement
      areasForImprovement.length > 0 &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Areas for Improvement:'),
          ...areasForImprovement.map((a, i) =>
            React.createElement(
              View,
              { key: `improvement-${i}`, style: styles.listItem },
              React.createElement(Text, { style: styles.bullet }, '•'),
              React.createElement(Text, { style: styles.listText }, a.name)
            )
          )
        )
    ),

    // Second page for attributes and narrative
    React.createElement(
      Page,
      { size: 'LETTER', style: styles.page },

      // Personal Attributes
      attributes.length > 0 &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionHeader }, 'PERSONAL ATTRIBUTES'),
          React.createElement(
            Text,
            { style: { fontSize: 11, marginBottom: 8 } },
            'Personal qualities noted by the evaluator:'
          ),
          React.createElement(
            Text,
            { style: styles.attributeText },
            attributes.map(a => a.name).join(', ')
          )
        ),

      // Narrative Evaluation
      (generatedNarrative || narrativeText) &&
        React.createElement(
          View,
          { style: styles.narrativeSection },
          React.createElement(Text, { style: styles.sectionHeader }, 'NARRATIVE EVALUATION'),

          generatedNarrative &&
            React.createElement(
              View,
              { style: { marginBottom: 15 } },
              React.createElement(Text, { style: styles.narrativeSubtitle }, 'Generated Summary:'),
              React.createElement(Text, { style: styles.narrativeText }, generatedNarrative)
            ),

          narrativeText &&
            React.createElement(
              View,
              { style: { marginTop: generatedNarrative ? 15 : 0 } },
              React.createElement(Text, { style: styles.narrativeSubtitle }, 'Additional Comments:'),
              React.createElement(Text, { style: styles.narrativeText }, narrativeText)
            )
        ),

      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, 'Generated by Medical Student Grader v1.1 Alpha'),
        React.createElement(
          Text,
          { style: styles.footerText },
          `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
        ),
        React.createElement(
          Text,
          { style: styles.footerText },
          'This report contains confidential medical education information.'
        )
      )
    )
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentName,
      evaluatorName,
      evaluationDate,
      clerkshipName,
      performanceLevel,
      strengths,
      areasForImprovement,
      attributes,
      narrativeText,
      generatedNarrative,
    } = body

    const pdfStream = await ReactPDF.renderToStream(
      React.createElement(EvaluationReportDocument, {
        studentName,
        evaluatorName,
        evaluationDate,
        clerkshipName,
        performanceLevel,
        strengths,
        areasForImprovement,
        attributes,
        narrativeText,
        generatedNarrative,
      })
    )

    const chunks: Uint8Array[] = []
    for await (const chunk of pdfStream) {
      chunks.push(chunk)
    }
    const pdfBuffer = Buffer.concat(chunks)

    const sanitizedName = studentName.replace(/\s+/g, '_')
    const sanitizedDate = evaluationDate.replace(/-/g, '-')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizedName}_${clerkshipName.replace(/\s+/g, '_')}_Report_${sanitizedDate}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
