#!/usr/bin/env python3
"""
Générateur de rapport PDF de réconciliation journalière
Pour les petites caisses populaires / credit unions
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, 
    Spacer, PageBreak, Image
)
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
import os

def format_currency(amount):
    """Format en devise canadienne"""
    return f"{amount:,.2f} $"

def generate_reconciliation_pdf(output_filename="reconciliation_report.pdf"):
    """
    Génère un rapport PDF de réconciliation journalière
    """
    
    # Créer le document
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Style personnalisé pour le titre
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1B5E20'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Style pour les sections
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2E7D32'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    # Style pour le statut
    status_style = ParagraphStyle(
        'Status',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#7B1FA2'),
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Contenu du document
    story = []
    
    # ===== EN-TÊTE =====
    story.append(Paragraph("RAPPORT DE RÉCONCILIATION JOURNALIÈRE", title_style))
    story.append(Paragraph("Caisse Populaire Desjardins de Gatineau", styles['Normal']))
    story.append(Spacer(1, 12))
    
    # Date et statut
    date_info = [
        ["Date du rapport:", "13 février 2026"],
        ["Statut:", "SOUMIS POUR VALIDATION"],
        ["ID du rapport:", "RPT_20260213"]
    ]
    
    date_table = Table(date_info, colWidths=[2*inch, 3*inch])
    date_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (1, 1), (1, 1), colors.HexColor('#7B1FA2')),
        ('FONTNAME', (1, 1), (1, 1), 'Helvetica-Bold'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(date_table)
    story.append(Spacer(1, 20))
    
    # ===== HORODATAGE - PISTE D'AUDIT =====
    story.append(Paragraph("🕐 HORODATAGE COMPLET — PISTE D'AUDIT", section_style))
    
    audit_data = [
        ["Étape", "Personne", "Date", "Heure"],
        ["Ouverture", "Jean Dupont", "2026-02-13", "08:00"],
        ["Soumission", "Jean Dupont", "2026-02-13", "17:00"],
        ["Révision", "Marie Tremblay", "2026-02-13", "17:30"],
    ]
    
    audit_table = Table(audit_data, colWidths=[1.5*inch, 1.8*inch, 1.3*inch, 1*inch])
    audit_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (2, 1), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F1F8E9')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]))
    story.append(audit_table)
    story.append(Spacer(1, 20))
    
    # ===== RÉSUMÉ CASH =====
    story.append(Paragraph("💰 RÉSUMÉ DES MONTANTS", section_style))
    
    cash_data = [
        ["Description", "Montant"],
        ["Cash d'ouverture", format_currency(2000.00)],
        ["Cash théorique (selon transactions)", format_currency(7130.00)],
        ["Cash réel compté", format_currency(7100.00)],
        ["", ""],
        ["ÉCART TOTAL", format_currency(-30.00)],
    ]
    
    cash_table = Table(cash_data, colWidths=[4*inch, 2*inch])
    cash_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, 3), colors.HexColor('#F1F8E9')),
        ('GRID', (0, 0), (-1, 3), 1, colors.grey),
        ('LINEBELOW', (0, 3), (-1, 3), 2, colors.black),
        ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor('#FFEBEE')),
        ('TEXTCOLOR', (0, 5), (-1, 5), colors.HexColor('#C62828')),
        ('FONTNAME', (0, 5), (-1, 5), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 5), (-1, 5), 12),
        ('TOPPADDING', (0, 5), (-1, 5), 8),
        ('BOTTOMPADDING', (0, 5), (-1, 5), 8),
    ]))
    story.append(cash_table)
    story.append(Spacer(1, 20))
    
    # ===== TABLEAU DES ÉCARTS =====
    story.append(Paragraph("⚠️ ANALYSE DÉTAILLÉE DES ÉCARTS", section_style))
    
    discrepancy_data = [
        ["Source", "Attendu", "Réel", "Écart", "Statut"],
        ["Cash en caisse - Comptage final", "0.00 $", "30.00 $", "-30.00 $", "En attente"],
        ["Bordereau BDP-2026-002", "0.00 $", "20.00 $", "-20.00 $", "Expliqué"],
        ["Agent Julie Leblanc", "0.00 $", "50.00 $", "-50.00 $", "Expliqué"],
        ["", "", "", "", ""],
        ["TOTAL", "", "", "-30.00 $", ""],
    ]
    
    disc_table = Table(discrepancy_data, colWidths=[2.2*inch, 1*inch, 1*inch, 1*inch, 1*inch])
    disc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E65100')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        # Ligne 1 - En attente (orange)
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#FFF3E0')),
        ('TEXTCOLOR', (4, 1), (4, 1), colors.HexColor('#E65100')),
        ('FONTNAME', (4, 1), (4, 1), 'Helvetica-Bold'),
        # Lignes 2-3 - Expliqué (vert pâle)
        ('BACKGROUND', (0, 2), (-1, 3), colors.HexColor('#E8F5E9')),
        ('TEXTCOLOR', (4, 2), (4, 3), colors.HexColor('#2E7D32')),
        ('FONTNAME', (4, 2), (4, 3), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, 3), 1, colors.grey),
        ('FONTNAME', (0, 1), (-1, 3), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, 3), 9),
        ('TOPPADDING', (0, 1), (-1, 3), 5),
        ('BOTTOMPADDING', (0, 1), (-1, 3), 5),
        # Ligne total
        ('LINEABOVE', (0, 5), (-1, 5), 2, colors.black),
        ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor('#FFEBEE')),
        ('FONTNAME', (0, 5), (-1, 5), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 5), (-1, 5), 11),
        ('TEXTCOLOR', (3, 5), (3, 5), colors.HexColor('#C62828')),
        ('TOPPADDING', (0, 5), (-1, 5), 8),
        ('BOTTOMPADDING', (0, 5), (-1, 5), 8),
    ]))
    story.append(disc_table)
    story.append(Spacer(1, 15))
    
    # Notes sur les écarts
    story.append(Paragraph("<b>Notes explicatives:</b>", styles['Normal']))
    notes = [
        "• <b>Bordereau BDP-2026-002:</b> Frais bancaire de 20$ déduit automatiquement par la banque. Confirmé par email de la Banque Nationale.",
        "• <b>Agent Julie Leblanc:</b> Erreur de frappe sur reçu #478. Montant corrigé dans le système. Agent a bien remis le montant exact."
    ]
    for note in notes:
        story.append(Spacer(1, 6))
        story.append(Paragraph(note, styles['Normal']))
    
    story.append(PageBreak())
    
    # ===== PAGE 2 - TRANSACTIONS =====
    story.append(Paragraph("📋 TRANSACTIONS DU JOUR", section_style))
    
    tx_data = [
        ["Heure", "Type", "Membre", "Montant", "Statut"],
        ["09:15", "Dépôt", "Paul Martin", "500.00 $", "Match"],
        ["10:30", "Retrait", "Sophie Lavoie", "200.00 $", "Match"],
        ["11:45", "Remboursement", "Luc Gagnon", "1,500.00 $", "Écart"],
        ["14:20", "Frais", "Anne Côté", "50.00 $", "En attente"],
    ]
    
    tx_table = Table(tx_data, colWidths=[0.8*inch, 1.3*inch, 1.8*inch, 1.2*inch, 1.1*inch])
    tx_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976D2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#E3F2FD')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]))
    story.append(tx_table)
    story.append(Spacer(1, 20))
    
    # ===== DÉPÔTS BANCAIRES =====
    story.append(Paragraph("🏦 DÉPÔTS BANCAIRES", section_style))
    
    bank_data = [
        ["Bordereau", "Attendu", "Confirmé", "Écart", "Statut"],
        ["BDP-2026-001", "5,000.00 $", "5,000.00 $", "0.00 $", "Match"],
        ["BDP-2026-002", "2,500.00 $", "2,480.00 $", "-20.00 $", "Écart"],
    ]
    
    bank_table = Table(bank_data, colWidths=[1.5*inch, 1.2*inch, 1.2*inch, 1*inch, 1.1*inch])
    bank_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976D2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#E3F2FD')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]))
    story.append(bank_table)
    story.append(Spacer(1, 20))
    
    # ===== AGENTS DE CRÉDIT =====
    story.append(Paragraph("👥 ENCAISSEMENTS DES AGENTS", section_style))
    
    agent_data = [
        ["Agent", "Déclaré", "Remis", "Écart", "Reçus", "Statut"],
        ["Pierre Dubois", "1,500.00 $", "1,500.00 $", "0.00 $", "12", "Match"],
        ["Julie Leblanc", "2,200.00 $", "2,150.00 $", "-50.00 $", "18", "Écart"],
        ["Marc Bouchard", "1,800.00 $", "1,800.00 $", "0.00 $", "15", "En attente"],
    ]
    
    agent_table = Table(agent_data, colWidths=[1.5*inch, 1.1*inch, 1.1*inch, 0.9*inch, 0.7*inch, 1*inch])
    agent_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7B1FA2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F3E5F5')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]))
    story.append(agent_table)
    story.append(Spacer(1, 20))
    
    # ===== NOTES DU SUPERVISEUR =====
    story.append(Paragraph("📝 NOTES DU SUPERVISEUR", section_style))
    
    notes_data = [
        ["Auteur", "Date/Heure", "Note"],
        ["Marie Tremblay", "2026-02-13 17:30", 
         "Transaction tx_003: Membre a payé avec un billet de 100$ déchiré, remplacé par billet neuf. Billet abîmé envoyé à la banque."],
        ["Marie Tremblay", "2026-02-13 17:45", 
         "Agent Julie Leblanc: Écart de 50$ expliqué - erreur de frappe sur reçu #478. Montant corrigé."],
    ]
    
    notes_table = Table(notes_data, colWidths=[1.3*inch, 1.3*inch, 3.6*inch])
    notes_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FF6F00')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#FFF3E0')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]))
    story.append(notes_table)
    story.append(Spacer(1, 30))
    
    # ===== SIGNATURES =====
    story.append(Paragraph("✍️ SIGNATURES", section_style))
    story.append(Spacer(1, 20))
    
    sig_data = [
        ["Préparé par:", "Jean Dupont", "Date: ________________"],
        ["", "Signature: _________________________", ""],
        ["", "", ""],
        ["Révisé par:", "Marie Tremblay", "Date: ________________"],
        ["", "Signature: _________________________", ""],
        ["", "", ""],
        ["Approuvé par:", "_________________________", "Date: ________________"],
        ["", "Signature: _________________________", ""],
    ]
    
    sig_table = Table(sig_data, colWidths=[1.5*inch, 2.5*inch, 2.2*inch])
    sig_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(sig_table)
    
    # Pied de page
    story.append(Spacer(1, 40))
    footer_text = "Ce document est confidentiel et destiné uniquement aux audits internes et externes."
    story.append(Paragraph(f"<i>{footer_text}</i>", 
                          ParagraphStyle('Footer', 
                                       parent=styles['Normal'], 
                                       fontSize=8, 
                                       textColor=colors.grey,
                                       alignment=TA_CENTER)))
    
    # Générer le PDF
    doc.build(story)
    print(f"✅ Rapport PDF généré: {output_filename}")
    return output_filename

if __name__ == "__main__":
    # Générer le rapport
    pdf_file = generate_reconciliation_pdf()
    print(f"\n📄 Le rapport est prêt à être utilisé pour:")
    print("   • Les audits internes")
    print("   • Les archives papier")
    print("   • Les signatures officielles")
    print("   • Les inspections externes")
    print(f"\n📂 Fichier: {os.path.abspath(pdf_file)}")