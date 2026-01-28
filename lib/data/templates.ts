import { ClerkshipTemplate, PersonalAttribute } from '@/lib/types'

export const defaultTemplates: ClerkshipTemplate[] = [
  {
    id: 'internal-medicine',
    name: 'Internal Medicine',
    description: 'Comprehensive evaluation for Internal Medicine clerkship rotations',
    icon: 'Stethoscope',
    items: [
      // FAIL: Professionalism
      { id: 'im-f-prof-1', name: 'Does not complete assignments in a timely manner', description: 'Does not complete assignments in a timely manner', category: 'fail', section: 'Professionalism' },
      { id: 'im-f-prof-2', name: 'Does not attend required didactics', description: 'Does not attend required didactics', category: 'fail', section: 'Professionalism' },
      { id: 'im-f-prof-3', name: 'Not punctual or any unexcused absences from clinical duties', description: 'Not punctual or any unexcused absences from clinical duties', category: 'fail', section: 'Professionalism' },
      { id: 'im-f-prof-4', name: 'Not dependable to carry out clinical duties', description: 'Not dependable to carry out clinical duties', category: 'fail', section: 'Professionalism' },
      { id: 'im-f-prof-5', name: 'Lapse in honesty reporting patient information', description: 'Lapse in honesty reporting patient information', category: 'fail', section: 'Professionalism' },
      { id: 'im-f-prof-6', name: 'Lack of respect for patients, families, and/or members of the health care team', description: 'Lack of respect for patients, families, and/or members of the health care team', category: 'fail', section: 'Professionalism' },
      { id: 'im-f-prof-7', name: 'Consistent lack of enthusiasm and engagement', description: 'Consistent lack of enthusiasm and engagement', category: 'fail', section: 'Professionalism' },
      { id: 'im-f-prof-8', name: 'Not responsive to feedback', description: 'Not responsive to feedback', category: 'fail', section: 'Professionalism' },
      { id: 'im-f-prof-9', name: 'Lobbies for better grades', description: 'Lobbies for better grades', category: 'fail', section: 'Professionalism' },

      // FAIL: Clinical Duties and Teamwork
      { id: 'im-f-cdt-1', name: 'Functioning exclusively at an observer level', description: 'Functioning exclusively at an observer level', category: 'fail', section: 'Clinical Duties and Teamwork' },
      { id: 'im-f-cdt-2', name: 'Does not show ownership or personal responsibility for patients', description: 'Does not show ownership or personal responsibility for patients', category: 'fail', section: 'Clinical Duties and Teamwork' },
      { id: 'im-f-cdt-3', name: 'Does not take initiative to be an active team member, assist with tasks, and contribute to team function/efficiency', description: 'Does not take initiative to be an active team member, assist with tasks, and contribute to team function/efficiency', category: 'fail', section: 'Clinical Duties and Teamwork' },
      { id: 'im-f-cdt-4', name: 'Does not take initiative to counsel and educate patients on their care plan', description: 'Does not take initiative to counsel and educate patients on their care plan', category: 'fail', section: 'Clinical Duties and Teamwork' },
      { id: 'im-f-cdt-5', name: 'Shows poor understanding of or is disruptive to clinical workflow', description: 'Shows poor understanding of or is disruptive to clinical workflow', category: 'fail', section: 'Clinical Duties and Teamwork' },

      // FAIL: Medical Knowledge and Clinical Reasoning
      { id: 'im-f-mk-1', name: 'Lack of fundamental understanding of patients and their disease processes', description: 'Lack of fundamental understanding of patients and their disease processes', category: 'fail', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'im-f-mk-2', name: 'Minimal or inconsistent evidence of research and preparation for patient care discussions', description: 'Minimal or inconsistent evidence of research and preparation for patient care discussions', category: 'fail', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'im-f-mk-3', name: 'Little or no contribution to care team education', description: 'Little or no contribution to care team education', category: 'fail', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'im-f-mk-4', name: 'Minimal or inconsistent ability to recommend and interpret basic diagnostic and screening tests', description: 'Minimal or inconsistent ability to recommend and interpret basic diagnostic and screening tests', category: 'fail', section: 'Medical Knowledge and Clinical Reasoning' },

      // FAIL: History, Physical Exam, and Procedures
      { id: 'im-f-hpe-1', name: 'History or exam findings show consistent discrepancies or inaccuracies despite corrective feedback', description: 'History or exam findings show consistent discrepancies or inaccuracies despite corrective feedback', category: 'fail', section: 'History, Physical Exam, and Procedures' },
      { id: 'im-f-hpe-2', name: 'Fails to consistently exhibit respect for patients in obtaining histories', description: 'Fails to consistently exhibit respect for patients in obtaining histories', category: 'fail', section: 'History, Physical Exam, and Procedures' },
      { id: 'im-f-hpe-3', name: 'Does not adjust history taking to clinical situation', description: 'Does not adjust history taking to clinical situation', category: 'fail', section: 'History, Physical Exam, and Procedures' },
      { id: 'im-f-hpe-4', name: 'Does not respect patient privacy when performing exam', description: 'Does not respect patient privacy when performing exam', category: 'fail', section: 'History, Physical Exam, and Procedures' },
      { id: 'im-f-hpe-5', name: 'Unable to regularly establish therapeutic alliance or gain trust of patients', description: 'Unable to regularly establish therapeutic alliance or gain trust of patients', category: 'fail', section: 'History, Physical Exam, and Procedures' },

      // FAIL: Presentation and Documentation
      { id: 'im-f-pd-1', name: "Presentations regularly lack expected components and show inability to function consistently as a 'reporter'", description: "Presentations regularly lack expected components and show inability to function consistently as a 'reporter'", category: 'fail', section: 'Presentation and Documentation' },
      { id: 'im-f-pd-2', name: 'Fails to review local and outside information for presentations and documentation', description: 'Fails to review local and outside information for presentations and documentation', category: 'fail', section: 'Presentation and Documentation' },
      { id: 'im-f-pd-3', name: 'Consistently unable to provide a complete/appropriate differential diagnosis and problem list despite feedback and correction', description: 'Consistently unable to provide a complete/appropriate differential diagnosis and problem list despite feedback and correction', category: 'fail', section: 'Presentation and Documentation' },
      { id: 'im-f-pd-4', name: 'Consistently unable to provide evidence for diagnostic and therapeutic recommendations', description: 'Consistently unable to provide evidence for diagnostic and therapeutic recommendations', category: 'fail', section: 'Presentation and Documentation' },
      { id: 'im-f-pd-5', name: 'Unable to prioritize medical problems by severity/urgency despite feedback', description: 'Unable to prioritize medical problems by severity/urgency despite feedback', category: 'fail', section: 'Presentation and Documentation' },

      // PASS: Professionalism
      { id: 'im-p-prof-1', name: 'Completes all tasks, forms, clinical encounters documentation, etc.', description: 'Completes all tasks, forms, clinical encounters documentation, etc.', category: 'pass', section: 'Professionalism' },
      { id: 'im-p-prof-2', name: 'Punctual and attends all required didactics', description: 'Punctual and attends all required didactics', category: 'pass', section: 'Professionalism' },
      { id: 'im-p-prof-3', name: 'Dependable, reliable and honest in carrying out duties and reporting patient information', description: 'Dependable, reliable and honest in carrying out duties and reporting patient information', category: 'pass', section: 'Professionalism' },
      { id: 'im-p-prof-4', name: 'Respectful and professional in interaction with patients, families, and the care team', description: 'Respectful and professional in interaction with patients, families, and the care team', category: 'pass', section: 'Professionalism' },
      { id: 'im-p-prof-5', name: 'Does not lobby for grades', description: 'Does not lobby for grades', category: 'pass', section: 'Professionalism' },
      { id: 'im-p-prof-6', name: 'Enthusiastic and engaged in all aspects of the rotation', description: 'Enthusiastic and engaged in all aspects of the rotation', category: 'pass', section: 'Professionalism' },
      { id: 'im-p-prof-7', name: 'Seeks and responds to feedback', description: 'Seeks and responds to feedback', category: 'pass', section: 'Professionalism' },

      // PASS: Clinical Duties and Teamwork
      { id: 'im-p-cdt-1', name: 'Takes ownership and embraces personal responsibility for patients', description: 'Takes ownership and embraces personal responsibility for patients', category: 'pass', section: 'Clinical Duties and Teamwork' },
      { id: 'im-p-cdt-2', name: 'Takes initiative to be an active team member, assist with tasks, and contribute to team function/efficiency', description: 'Takes initiative to be an active team member, assist with tasks, and contribute to team function/efficiency', category: 'pass', section: 'Clinical Duties and Teamwork' },
      { id: 'im-p-cdt-3', name: 'Works to counsel patients on current status, care plans, and strategies for treatment success', description: 'Works to counsel patients on current status, care plans, and strategies for treatment success', category: 'pass', section: 'Clinical Duties and Teamwork' },
      { id: 'im-p-cdt-4', name: 'Makes effort to understand and contribute to clinical workflow', description: 'Makes effort to understand and contribute to clinical workflow', category: 'pass', section: 'Clinical Duties and Teamwork' },

      // PASS: Medical Knowledge and Clinical Reasoning
      { id: 'im-p-mk-1', name: 'Demonstrates understanding of patients and disease processes', description: 'Demonstrates understanding of patients and disease processes', category: 'pass', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'im-p-mk-2', name: 'Shows evidence of research and preparation for patient care discussions', description: 'Shows evidence of research and preparation for patient care discussions', category: 'pass', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'im-p-mk-3', name: 'Some contribution to care team education', description: 'Some contribution to care team education', category: 'pass', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'im-p-mk-4', name: 'Consistent ability to recommend and interpret basic diagnostic and screening tests', description: 'Consistent ability to recommend and interpret basic diagnostic and screening tests', category: 'pass', section: 'Medical Knowledge and Clinical Reasoning' },

      // PASS: History, Physical Exam, and Procedures
      { id: 'im-p-hpe-1', name: 'Able to obtain a complete, independently verifiable history', description: 'Able to obtain a complete, independently verifiable history', category: 'pass', section: 'History, Physical Exam, and Procedures' },
      { id: 'im-p-hpe-2', name: 'Treats patients with respect and can build therapeutic alliances', description: 'Treats patients with respect and can build therapeutic alliances', category: 'pass', section: 'History, Physical Exam, and Procedures' },
      { id: 'im-p-hpe-3', name: 'Able to perform an appropriately complete, verifiable physical exam', description: 'Able to perform an appropriately complete, verifiable physical exam', category: 'pass', section: 'History, Physical Exam, and Procedures' },
      { id: 'im-p-hpe-4', name: 'Consistently shows regard/respect to patient during exam and history taking', description: 'Consistently shows regard/respect to patient during exam and history taking', category: 'pass', section: 'History, Physical Exam, and Procedures' },

      // PASS: Presentation and Documentation
      { id: 'im-p-pd-1', name: 'Consistently presents and documents expected components in the correct sequence', description: 'Consistently presents and documents expected components in the correct sequence', category: 'pass', section: 'Presentation and Documentation' },
      { id: 'im-p-pd-2', name: 'Information shared is appropriately comprehensive showing review of all local and outside sources of information', description: 'Information shared is appropriately comprehensive showing review of all local and outside sources of information', category: 'pass', section: 'Presentation and Documentation' },
      { id: 'im-p-pd-3', name: 'Able to craft a broad, plausible differential diagnosis', description: 'Able to craft a broad, plausible differential diagnosis', category: 'pass', section: 'Presentation and Documentation' },
      { id: 'im-p-pd-4', name: 'Develops complete problem list with evidence-based diagnostic and therapeutic plan', description: 'Develops complete problem list with evidence-based diagnostic and therapeutic plan', category: 'pass', section: 'Presentation and Documentation' },
      { id: 'im-p-pd-5', name: 'Shows ability to understand prioritization of medical problems', description: 'Shows ability to understand prioritization of medical problems', category: 'pass', section: 'Presentation and Documentation' },

      // HONORS: Professionalism
      { id: 'im-h-prof-1', name: 'Clear examples of going above and beyond noted by peers and evaluators', description: 'Clear examples of going above and beyond noted by peers and evaluators', category: 'honors', section: 'Professionalism' },
      { id: 'im-h-prof-2', name: 'Recognized as an outstanding team member by patients, families, and health professionals', description: 'Recognized as an outstanding team member by patients, families, and health professionals', category: 'honors', section: 'Professionalism' },

      // HONORS: Clinical Duties and Teamwork
      { id: 'im-h-cdt-1', name: 'Takes ownership and embraces personal responsibility for patients at the level of an Acting Intern', description: 'Takes ownership and embraces personal responsibility for patients at the level of an Acting Intern', category: 'honors', section: 'Clinical Duties and Teamwork' },
      { id: 'im-h-cdt-2', name: 'Takes initiative to assist team workflow and function as an active problem solver', description: 'Takes initiative to assist team workflow and function as an active problem solver', category: 'honors', section: 'Clinical Duties and Teamwork' },
      { id: 'im-h-cdt-3', name: 'Displays cultural sensitivity and understands social determinants of health', description: 'Displays cultural sensitivity and understands social determinants of health', category: 'honors', section: 'Clinical Duties and Teamwork' },

      // HONORS: Medical Knowledge and Clinical Reasoning
      { id: 'im-h-mk-1', name: 'Consistently demonstrates advanced understanding of patients and their disease processes', description: 'Consistently demonstrates advanced understanding of patients and their disease processes', category: 'honors', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'im-h-mk-2', name: 'Consistent evidence of independent research and application of knowledge to patient care discussions', description: 'Consistent evidence of independent research and application of knowledge to patient care discussions', category: 'honors', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'im-h-mk-3', name: 'Constant contributor to education of care team', description: 'Constant contributor to education of care team', category: 'honors', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'im-h-mk-4', name: 'Effectively uses external resources to weigh evidence that impact care decisions', description: 'Effectively uses external resources to weigh evidence that impact care decisions', category: 'honors', section: 'Medical Knowledge and Clinical Reasoning' },

      // HONORS: History, Physical Exam, and Procedures
      { id: 'im-h-hpe-1', name: 'History is complete and thorough with evidence of differential diagnosis being considered during its acquisition', description: 'History is complete and thorough with evidence of differential diagnosis being considered during its acquisition', category: 'honors', section: 'History, Physical Exam, and Procedures' },
      { id: 'im-h-hpe-2', name: 'Student consistently gains trust of patient/family as the health care provider', description: 'Student consistently gains trust of patient/family as the health care provider', category: 'honors', section: 'History, Physical Exam, and Procedures' },
      { id: 'im-h-hpe-3', name: 'Evidence of using targeted physical exam to confirm or refute elements of differential diagnosis', description: 'Evidence of using targeted physical exam to confirm or refute elements of differential diagnosis', category: 'honors', section: 'History, Physical Exam, and Procedures' },
      { id: 'im-h-hpe-4', name: 'Genuine and consistent regard for patient comfort and privacy', description: 'Genuine and consistent regard for patient comfort and privacy', category: 'honors', section: 'History, Physical Exam, and Procedures' },

      // HONORS: Presentation and Documentation
      { id: 'im-h-pd-1', name: 'Consistently presents and documents in an organized, sequential, and complete fashion without superfluous information', description: 'Consistently presents and documents in an organized, sequential, and complete fashion without superfluous information', category: 'honors', section: 'Presentation and Documentation' },
      { id: 'im-h-pd-2', name: 'Able to synthesize comprehensive review of outside information into concise presentations and documentation', description: 'Able to synthesize comprehensive review of outside information into concise presentations and documentation', category: 'honors', section: 'Presentation and Documentation' },
      { id: 'im-h-pd-3', name: 'Independently crafts an appropriate differential diagnosis and evidence-based diagnostic and therapeutic plan at the level of an Acting Intern', description: 'Independently crafts an appropriate differential diagnosis and evidence-based diagnostic and therapeutic plan at the level of an Acting Intern', category: 'honors', section: 'Presentation and Documentation' },
      { id: 'im-h-pd-4', name: 'Able to consistently prioritize medical problems by urgency', description: 'Able to consistently prioritize medical problems by urgency', category: 'honors', section: 'Presentation and Documentation' },
    ],
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Comprehensive evaluation for Neurology clerkship rotations',
    icon: 'Brain',
    items: [
      // FAIL: Professionalism
      { id: 'neuro-f-prof-1', name: 'Does not complete assignments in a timely manner', description: 'Does not complete assignments in a timely manner', category: 'fail', section: 'Professionalism' },
      { id: 'neuro-f-prof-2', name: 'Does not attend required didactics', description: 'Does not attend required didactics', category: 'fail', section: 'Professionalism' },
      { id: 'neuro-f-prof-3', name: 'Not punctual or any unexcused absences from clinical duties', description: 'Not punctual or any unexcused absences from clinical duties', category: 'fail', section: 'Professionalism' },
      { id: 'neuro-f-prof-4', name: 'Not dependable to carry out clinical duties', description: 'Not dependable to carry out clinical duties', category: 'fail', section: 'Professionalism' },
      { id: 'neuro-f-prof-5', name: 'Lapse in honesty reporting patient information', description: 'Lapse in honesty reporting patient information', category: 'fail', section: 'Professionalism' },
      { id: 'neuro-f-prof-6', name: 'Lack of respect for patients, families, and/or members of the health care team', description: 'Lack of respect for patients, families, and/or members of the health care team', category: 'fail', section: 'Professionalism' },
      { id: 'neuro-f-prof-7', name: 'Consistent lack of enthusiasm and engagement', description: 'Consistent lack of enthusiasm and engagement', category: 'fail', section: 'Professionalism' },
      { id: 'neuro-f-prof-8', name: 'Not responsive to feedback', description: 'Not responsive to feedback', category: 'fail', section: 'Professionalism' },
      { id: 'neuro-f-prof-9', name: 'Lobbies for better grades', description: 'Lobbies for better grades', category: 'fail', section: 'Professionalism' },

      // FAIL: Clinical Duties and Teamwork
      { id: 'neuro-f-cdt-1', name: 'Functioning exclusively at an observer level', description: 'Functioning exclusively at an observer level', category: 'fail', section: 'Clinical Duties and Teamwork' },
      { id: 'neuro-f-cdt-2', name: 'Does not show ownership or personal responsibility for patients', description: 'Does not show ownership or personal responsibility for patients', category: 'fail', section: 'Clinical Duties and Teamwork' },
      { id: 'neuro-f-cdt-3', name: 'Does not take initiative to be an active team member, assist with tasks, and contribute to team function/efficiency', description: 'Does not take initiative to be an active team member, assist with tasks, and contribute to team function/efficiency', category: 'fail', section: 'Clinical Duties and Teamwork' },
      { id: 'neuro-f-cdt-4', name: 'Does not take initiative to counsel and educate patients on their care plan', description: 'Does not take initiative to counsel and educate patients on their care plan', category: 'fail', section: 'Clinical Duties and Teamwork' },
      { id: 'neuro-f-cdt-5', name: 'Shows poor understanding of or is disruptive to clinical workflow', description: 'Shows poor understanding of or is disruptive to clinical workflow', category: 'fail', section: 'Clinical Duties and Teamwork' },

      // FAIL: Medical Knowledge and Clinical Reasoning
      { id: 'neuro-f-mk-1', name: 'Lack of fundamental understanding of patients and their disease processes', description: 'Lack of fundamental understanding of patients and their disease processes', category: 'fail', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'neuro-f-mk-2', name: 'Minimal or inconsistent evidence of research and preparation for patient care discussions', description: 'Minimal or inconsistent evidence of research and preparation for patient care discussions', category: 'fail', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'neuro-f-mk-3', name: 'Little or no contribution to care team education', description: 'Little or no contribution to care team education', category: 'fail', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'neuro-f-mk-4', name: 'Minimal or inconsistent ability to recommend and interpret basic diagnostic and screening tests', description: 'Minimal or inconsistent ability to recommend and interpret basic diagnostic and screening tests', category: 'fail', section: 'Medical Knowledge and Clinical Reasoning' },

      // FAIL: History, Physical Exam, and Procedures
      { id: 'neuro-f-hpe-1', name: 'History or exam findings show consistent discrepancies or inaccuracies despite corrective feedback', description: 'History or exam findings show consistent discrepancies or inaccuracies despite corrective feedback', category: 'fail', section: 'History, Physical Exam, and Procedures' },
      { id: 'neuro-f-hpe-2', name: 'Fails to consistently exhibit respect for patients in obtaining histories', description: 'Fails to consistently exhibit respect for patients in obtaining histories', category: 'fail', section: 'History, Physical Exam, and Procedures' },
      { id: 'neuro-f-hpe-3', name: 'Does not adjust history taking to clinical situation', description: 'Does not adjust history taking to clinical situation', category: 'fail', section: 'History, Physical Exam, and Procedures' },
      { id: 'neuro-f-hpe-4', name: 'Does not respect patient privacy when performing exam', description: 'Does not respect patient privacy when performing exam', category: 'fail', section: 'History, Physical Exam, and Procedures' },
      { id: 'neuro-f-hpe-5', name: 'Unable to regularly establish therapeutic alliance or gain trust of patients', description: 'Unable to regularly establish therapeutic alliance or gain trust of patients', category: 'fail', section: 'History, Physical Exam, and Procedures' },

      // FAIL: Presentation and Documentation
      { id: 'neuro-f-pd-1', name: "Presentations regularly lack expected components and show inability to function consistently as a 'reporter'", description: "Presentations regularly lack expected components and show inability to function consistently as a 'reporter'", category: 'fail', section: 'Presentation and Documentation' },
      { id: 'neuro-f-pd-2', name: 'Fails to review local and outside information for presentations and documentation', description: 'Fails to review local and outside information for presentations and documentation', category: 'fail', section: 'Presentation and Documentation' },
      { id: 'neuro-f-pd-3', name: 'Consistently unable to provide a complete/appropriate differential diagnosis and problem list despite feedback and correction', description: 'Consistently unable to provide a complete/appropriate differential diagnosis and problem list despite feedback and correction', category: 'fail', section: 'Presentation and Documentation' },
      { id: 'neuro-f-pd-4', name: 'Consistently unable to provide evidence for diagnostic and therapeutic recommendations', description: 'Consistently unable to provide evidence for diagnostic and therapeutic recommendations', category: 'fail', section: 'Presentation and Documentation' },
      { id: 'neuro-f-pd-5', name: 'Unable to prioritize medical problems by severity/urgency despite feedback', description: 'Unable to prioritize medical problems by severity/urgency despite feedback', category: 'fail', section: 'Presentation and Documentation' },

      // PASS: Professionalism
      { id: 'neuro-p-prof-1', name: 'Completes all tasks, forms, clinical encounters documentation, etc.', description: 'Completes all tasks, forms, clinical encounters documentation, etc.', category: 'pass', section: 'Professionalism' },
      { id: 'neuro-p-prof-2', name: 'Punctual and attends all required didactics', description: 'Punctual and attends all required didactics', category: 'pass', section: 'Professionalism' },
      { id: 'neuro-p-prof-3', name: 'Dependable, reliable and honest in carrying out duties and reporting patient information', description: 'Dependable, reliable and honest in carrying out duties and reporting patient information', category: 'pass', section: 'Professionalism' },
      { id: 'neuro-p-prof-4', name: 'Respectful and professional in interaction with patients, families, and the care team', description: 'Respectful and professional in interaction with patients, families, and the care team', category: 'pass', section: 'Professionalism' },
      { id: 'neuro-p-prof-5', name: 'Does not lobby for grades', description: 'Does not lobby for grades', category: 'pass', section: 'Professionalism' },
      { id: 'neuro-p-prof-6', name: 'Enthusiastic and engaged in all aspects of the rotation', description: 'Enthusiastic and engaged in all aspects of the rotation', category: 'pass', section: 'Professionalism' },
      { id: 'neuro-p-prof-7', name: 'Seeks and responds to feedback', description: 'Seeks and responds to feedback', category: 'pass', section: 'Professionalism' },

      // PASS: Clinical Duties and Teamwork
      { id: 'neuro-p-cdt-1', name: 'Takes ownership and embraces personal responsibility for patients', description: 'Takes ownership and embraces personal responsibility for patients', category: 'pass', section: 'Clinical Duties and Teamwork' },
      { id: 'neuro-p-cdt-2', name: 'Takes initiative to be an active team member, assist with tasks, and contribute to team function/efficiency', description: 'Takes initiative to be an active team member, assist with tasks, and contribute to team function/efficiency', category: 'pass', section: 'Clinical Duties and Teamwork' },
      { id: 'neuro-p-cdt-3', name: 'Works to counsel patients on current status, care plans, and strategies for treatment success', description: 'Works to counsel patients on current status, care plans, and strategies for treatment success', category: 'pass', section: 'Clinical Duties and Teamwork' },
      { id: 'neuro-p-cdt-4', name: 'Makes effort to understand and contribute to clinical workflow', description: 'Makes effort to understand and contribute to clinical workflow', category: 'pass', section: 'Clinical Duties and Teamwork' },

      // PASS: Medical Knowledge and Clinical Reasoning
      { id: 'neuro-p-mk-1', name: 'Demonstrates understanding of patients and disease processes', description: 'Demonstrates understanding of patients and disease processes', category: 'pass', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'neuro-p-mk-2', name: 'Shows evidence of research and preparation for patient care discussions', description: 'Shows evidence of research and preparation for patient care discussions', category: 'pass', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'neuro-p-mk-3', name: 'Some contribution to care team education', description: 'Some contribution to care team education', category: 'pass', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'neuro-p-mk-4', name: 'Consistent ability to recommend and interpret basic diagnostic and screening tests', description: 'Consistent ability to recommend and interpret basic diagnostic and screening tests', category: 'pass', section: 'Medical Knowledge and Clinical Reasoning' },

      // PASS: History, Physical Exam, and Procedures
      { id: 'neuro-p-hpe-1', name: 'Able to obtain a complete, independently verifiable history', description: 'Able to obtain a complete, independently verifiable history', category: 'pass', section: 'History, Physical Exam, and Procedures' },
      { id: 'neuro-p-hpe-2', name: 'Treats patients with respect and can build therapeutic alliances', description: 'Treats patients with respect and can build therapeutic alliances', category: 'pass', section: 'History, Physical Exam, and Procedures' },
      { id: 'neuro-p-hpe-3', name: 'Able to perform an appropriately complete, verifiable physical exam', description: 'Able to perform an appropriately complete, verifiable physical exam', category: 'pass', section: 'History, Physical Exam, and Procedures' },
      { id: 'neuro-p-hpe-4', name: 'Consistently shows regard/respect to patient during exam and history taking', description: 'Consistently shows regard/respect to patient during exam and history taking', category: 'pass', section: 'History, Physical Exam, and Procedures' },

      // PASS: Presentation and Documentation
      { id: 'neuro-p-pd-1', name: 'Consistently presents and documents expected components in the correct sequence', description: 'Consistently presents and documents expected components in the correct sequence', category: 'pass', section: 'Presentation and Documentation' },
      { id: 'neuro-p-pd-2', name: 'Information shared is appropriately comprehensive showing review of all local and outside sources of information', description: 'Information shared is appropriately comprehensive showing review of all local and outside sources of information', category: 'pass', section: 'Presentation and Documentation' },
      { id: 'neuro-p-pd-3', name: 'Able to craft a broad, plausible differential diagnosis', description: 'Able to craft a broad, plausible differential diagnosis', category: 'pass', section: 'Presentation and Documentation' },
      { id: 'neuro-p-pd-4', name: 'Develops complete problem list with evidence-based diagnostic and therapeutic plan', description: 'Develops complete problem list with evidence-based diagnostic and therapeutic plan', category: 'pass', section: 'Presentation and Documentation' },
      { id: 'neuro-p-pd-5', name: 'Shows ability to understand prioritization of medical problems', description: 'Shows ability to understand prioritization of medical problems', category: 'pass', section: 'Presentation and Documentation' },

      // HONORS: Professionalism
      { id: 'neuro-h-prof-1', name: 'Clear examples of going above and beyond noted by peers and evaluators', description: 'Clear examples of going above and beyond noted by peers and evaluators', category: 'honors', section: 'Professionalism' },
      { id: 'neuro-h-prof-2', name: 'Recognized as an outstanding team member by patients, families, and health professionals', description: 'Recognized as an outstanding team member by patients, families, and health professionals', category: 'honors', section: 'Professionalism' },

      // HONORS: Clinical Duties and Teamwork
      { id: 'neuro-h-cdt-1', name: 'Takes ownership and embraces personal responsibility for patients at the level of an Acting Intern', description: 'Takes ownership and embraces personal responsibility for patients at the level of an Acting Intern', category: 'honors', section: 'Clinical Duties and Teamwork' },
      { id: 'neuro-h-cdt-2', name: 'Takes initiative to assist team workflow and function as an active problem solver', description: 'Takes initiative to assist team workflow and function as an active problem solver', category: 'honors', section: 'Clinical Duties and Teamwork' },
      { id: 'neuro-h-cdt-3', name: 'Displays cultural sensitivity and understands social determinants of health', description: 'Displays cultural sensitivity and understands social determinants of health', category: 'honors', section: 'Clinical Duties and Teamwork' },

      // HONORS: Medical Knowledge and Clinical Reasoning
      { id: 'neuro-h-mk-1', name: 'Consistently demonstrates advanced understanding of patients and their disease processes', description: 'Consistently demonstrates advanced understanding of patients and their disease processes', category: 'honors', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'neuro-h-mk-2', name: 'Consistent evidence of independent research and application of knowledge to patient care discussions', description: 'Consistent evidence of independent research and application of knowledge to patient care discussions', category: 'honors', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'neuro-h-mk-3', name: 'Constant contributor to education of care team', description: 'Constant contributor to education of care team', category: 'honors', section: 'Medical Knowledge and Clinical Reasoning' },
      { id: 'neuro-h-mk-4', name: 'Effectively uses external resources to weigh evidence that impact care decisions', description: 'Effectively uses external resources to weigh evidence that impact care decisions', category: 'honors', section: 'Medical Knowledge and Clinical Reasoning' },

      // HONORS: History, Physical Exam, and Procedures
      { id: 'neuro-h-hpe-1', name: 'History is complete and thorough with evidence of differential diagnosis being considered during its acquisition', description: 'History is complete and thorough with evidence of differential diagnosis being considered during its acquisition', category: 'honors', section: 'History, Physical Exam, and Procedures' },
      { id: 'neuro-h-hpe-2', name: 'Student consistently gains trust of patient/family as the health care provider', description: 'Student consistently gains trust of patient/family as the health care provider', category: 'honors', section: 'History, Physical Exam, and Procedures' },
      { id: 'neuro-h-hpe-3', name: 'Evidence of using targeted physical exam to confirm or refute elements of differential diagnosis', description: 'Evidence of using targeted physical exam to confirm or refute elements of differential diagnosis', category: 'honors', section: 'History, Physical Exam, and Procedures' },
      { id: 'neuro-h-hpe-4', name: 'Genuine and consistent regard for patient comfort and privacy', description: 'Genuine and consistent regard for patient comfort and privacy', category: 'honors', section: 'History, Physical Exam, and Procedures' },

      // HONORS: Presentation and Documentation
      { id: 'neuro-h-pd-1', name: 'Consistently presents and documents in an organized, sequential, and complete fashion without superfluous information', description: 'Consistently presents and documents in an organized, sequential, and complete fashion without superfluous information', category: 'honors', section: 'Presentation and Documentation' },
      { id: 'neuro-h-pd-2', name: 'Able to synthesize comprehensive review of outside information into concise presentations and documentation', description: 'Able to synthesize comprehensive review of outside information into concise presentations and documentation', category: 'honors', section: 'Presentation and Documentation' },
      { id: 'neuro-h-pd-3', name: 'Independently crafts an appropriate differential diagnosis and evidence-based diagnostic and therapeutic plan at the level of an Acting Intern', description: 'Independently crafts an appropriate differential diagnosis and evidence-based diagnostic and therapeutic plan at the level of an Acting Intern', category: 'honors', section: 'Presentation and Documentation' },
      { id: 'neuro-h-pd-4', name: 'Able to consistently prioritize medical problems by urgency', description: 'Able to consistently prioritize medical problems by urgency', category: 'honors', section: 'Presentation and Documentation' },
    ],
  },
  {
    id: 'surgery',
    name: 'Surgery',
    description: 'Evaluation criteria for Surgery clerkship rotations',
    icon: 'Scissors',
    items: [
      // Placeholder items matching Swift app
      { id: 'surg-f-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'fail', section: 'Placeholder 1' },
      { id: 'surg-p-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'pass', section: 'Placeholder 2' },
      { id: 'surg-h-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'honors', section: 'Placeholder 3' },
    ],
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    description: 'Evaluation criteria for Pediatrics clerkship rotations',
    icon: 'Baby',
    items: [
      // Placeholder items matching Swift app
      { id: 'peds-f-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'fail', section: 'Placeholder 1' },
      { id: 'peds-p-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'pass', section: 'Placeholder 2' },
      { id: 'peds-h-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'honors', section: 'Placeholder 3' },
    ],
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    description: 'Evaluation criteria for Psychiatry clerkship rotations',
    icon: 'Psi',
    items: [
      // Placeholder items matching Swift app
      { id: 'psych-f-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'fail', section: 'Placeholder 1' },
      { id: 'psych-p-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'pass', section: 'Placeholder 2' },
      { id: 'psych-h-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'honors', section: 'Placeholder 3' },
    ],
  },
  {
    id: 'ob-gyn',
    name: 'OB/GYN',
    description: 'Evaluation criteria for Obstetrics and Gynecology clerkship rotations',
    icon: 'Maternity',
    items: [
      // Placeholder items matching Swift app
      { id: 'obgyn-f-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'fail', section: 'Placeholder 1' },
      { id: 'obgyn-p-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'pass', section: 'Placeholder 2' },
      { id: 'obgyn-h-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'honors', section: 'Placeholder 3' },
    ],
  },
  {
    id: 'family-medicine',
    name: 'Family Medicine',
    description: 'Evaluation criteria for Family Medicine clerkship rotations',
    icon: 'Users',
    items: [
      // Placeholder items matching Swift app
      { id: 'fm-f-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'fail', section: 'Placeholder 1' },
      { id: 'fm-p-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'pass', section: 'Placeholder 2' },
      { id: 'fm-h-1', name: 'Placeholder Text', description: 'Placeholder Text', category: 'honors', section: 'Placeholder 3' },
    ],
  },
]

export const defaultPersonalAttributes: PersonalAttribute[] = [
  { id: 'attr-1', name: 'Compassionate', isSelected: false },
  { id: 'attr-2', name: 'Empathetic', isSelected: false },
  { id: 'attr-3', name: 'Diligent', isSelected: false },
  { id: 'attr-4', name: 'Thorough', isSelected: false },
  { id: 'attr-5', name: 'Hardworking', isSelected: false },
  { id: 'attr-6', name: 'Reliable', isSelected: false },
  { id: 'attr-7', name: 'Punctual', isSelected: false },
  { id: 'attr-8', name: 'Professional', isSelected: false },
  { id: 'attr-9', name: 'Respectful', isSelected: false },
  { id: 'attr-10', name: 'Curious', isSelected: false },
  { id: 'attr-11', name: 'Inquisitive', isSelected: false },
  { id: 'attr-12', name: 'Self-motivated', isSelected: false },
  { id: 'attr-13', name: 'Team-oriented', isSelected: false },
  { id: 'attr-14', name: 'Collaborative', isSelected: false },
  { id: 'attr-15', name: 'Communicative', isSelected: false },
  { id: 'attr-16', name: 'Articulate', isSelected: false },
  { id: 'attr-17', name: 'Organized', isSelected: false },
  { id: 'attr-18', name: 'Detail-oriented', isSelected: false },
  { id: 'attr-19', name: 'Adaptable', isSelected: false },
  { id: 'attr-20', name: 'Resilient', isSelected: false },
  { id: 'attr-21', name: 'Enthusiastic', isSelected: false },
  { id: 'attr-22', name: 'Humble', isSelected: false },
  { id: 'attr-23', name: 'Receptive to feedback', isSelected: false },
  { id: 'attr-24', name: 'Shows initiative', isSelected: false },
  { id: 'attr-25', name: 'Critical thinker', isSelected: false },
  { id: 'attr-26', name: 'Patient-centered', isSelected: false },
]
