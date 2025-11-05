import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFEvaluationData {
  academy: {
    name: string;
  };
  evaluator: {
    full_name: string;
    fmf_credential: string;
  };
  evaluation_date: string;
  total_score: number;
  category: string | null;
  notes: string | null;
  scores: Array<{
    score: number;
    comments: string | null;
    kpi: {
      name: string;
      max_score: number;
      category: {
        name: string;
      };
    };
  }>;
}

export function generateEvaluationPDF(evaluation: PDFEvaluationData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FMF - Sistema de Evaluación', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 7;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Academias de Fútbol', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);

  yPosition += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Evaluación', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const infoData = [
    ['Academia:', evaluation.academy.name],
    ['Evaluador:', `${evaluation.evaluator.full_name} (${evaluation.evaluator.fmf_credential})`],
    ['Fecha:', new Date(evaluation.evaluation_date).toLocaleDateString('es-MX')],
    ['Puntuación Total:', `${evaluation.total_score.toFixed(2)} / 100`],
    ['Categoría:', evaluation.category || 'N/A']
  ];

  autoTable(doc, {
    startY: yPosition,
    body: infoData,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const categoryColor = getCategoryColorForPDF(evaluation.category);
  doc.setFillColor(categoryColor.r, categoryColor.g, categoryColor.b);
  doc.roundedRect(20, yPosition, pageWidth - 40, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Categoría: ${evaluation.category || 'N/A'}`, pageWidth / 2, yPosition + 8, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  yPosition += 20;

  if (evaluation.notes) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Notas Generales:', 20, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(evaluation.notes, pageWidth - 40);
    doc.text(splitNotes, 20, yPosition);
    yPosition += splitNotes.length * 5 + 10;
  }

  const groupedScores = evaluation.scores.reduce((acc, score) => {
    const categoryName = score.kpi.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(score);
    return acc;
  }, {} as Record<string, typeof evaluation.scores>);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Desglose por Categoría KPI', 20, yPosition);
  yPosition += 10;

  Object.entries(groupedScores).forEach(([categoryName, scores]) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(categoryName, 20, yPosition);
    yPosition += 7;

    const tableData = scores.map(score => [
      score.kpi.name,
      `${score.score} / ${score.kpi.max_score}`,
      score.comments || '-'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['KPI', 'Puntuación', 'Comentarios']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 'auto' }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  });

  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Recomendaciones según Categoría', 20, yPosition);
  yPosition += 10;

  const recommendations = getRecommendations(evaluation.category, evaluation.total_score);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  recommendations.forEach((rec, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    const bullet = `${index + 1}. `;
    const textLines = doc.splitTextToSize(rec, pageWidth - 50);
    doc.text(bullet, 25, yPosition);
    doc.text(textLines, 35, yPosition);
    yPosition += textLines.length * 5 + 3;
  });

  const fileName = `Evaluacion_${evaluation.academy.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function getCategoryColorForPDF(category: string | null): { r: number; g: number; b: number } {
  switch (category) {
    case 'Elite':
      return { r: 234, g: 179, b: 8 };
    case 'Avanzado':
      return { r: 34, g: 197, b: 94 };
    case 'Básico':
      return { r: 59, g: 130, b: 246 };
    case 'En Desarrollo':
      return { r: 249, g: 115, b: 22 };
    default:
      return { r: 107, g: 114, b: 128 };
  }
}

function getRecommendations(category: string | null, score: number): string[] {
  const recommendations: string[] = [];

  if (category === 'Elite') {
    recommendations.push(
      'Mantener los altos estándares de calidad en todas las áreas evaluadas.',
      'Compartir mejores prácticas con otras academias para elevar el nivel general.',
      'Continuar invirtiendo en la capacitación continua del personal técnico.',
      'Explorar nuevas tecnologías y metodologías de entrenamiento innovadoras.',
      'Fortalecer los programas de seguimiento de egresados y proyección profesional.'
    );
  } else if (category === 'Avanzado') {
    recommendations.push(
      'Identificar las áreas con menor puntuación para enfocar esfuerzos de mejora.',
      'Establecer alianzas con instituciones educativas para fortalecer el apoyo académico.',
      'Aumentar la inversión en infraestructura y equipamiento deportivo.',
      'Implementar un sistema de evaluación continua de la metodología de entrenamiento.',
      'Desarrollar programas de certificación adicional para el cuerpo técnico.'
    );
  } else if (category === 'Básico') {
    recommendations.push(
      'Priorizar la mejora de la infraestructura y las instalaciones deportivas.',
      'Establecer un plan de desarrollo profesional para el personal técnico.',
      'Crear alianzas estratégicas para acceso a recursos y capacitación.',
      'Implementar un programa estructurado de entrenamiento por categorías.',
      'Desarrollar canales efectivos de comunicación con padres y jugadores.',
      'Buscar certificaciones FMF para el personal técnico.'
    );
  } else {
    recommendations.push(
      'Realizar un diagnóstico integral de todas las áreas operativas.',
      'Establecer un plan de mejora continua con objetivos medibles a corto y mediano plazo.',
      'Buscar asesoría de la FMF para alinearse con los estándares mínimos requeridos.',
      'Priorizar la contratación o capacitación de personal técnico certificado.',
      'Mejorar la infraestructura básica y el equipamiento deportivo.',
      'Implementar sistemas de gestión administrativa y transparencia financiera.',
      'Desarrollar programas de formación en valores y desarrollo integral de los jugadores.'
    );
  }

  if (score < 50) {
    recommendations.push(
      'Se recomienda una revisión urgente del modelo operativo de la academia.',
      'Considerar la implementación de un programa de mentoría con academias de mayor nivel.'
    );
  }

  return recommendations;
}
