import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, acceptMarketing, diagnosticData } = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Solutio Diagnostic <no-reply@resend.dev>",
      to: [email],
      subject: "🎯 Votre diagnostic d'automatisation personnalisé - Solutio",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Diagnostic d'Automatisation - Solutio</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              margin: 0; 
              padding: 0; 
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .container { 
              max-width: 650px; 
              margin: 0 auto; 
              padding: 20px;
            }
            .email-wrapper {
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            .header { 
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .header-content { position: relative; z-index: 1; }
            .logo { 
              width: 60px; 
              height: 60px; 
              background: rgba(255, 255, 255, 0.2); 
              border-radius: 12px; 
              margin: 0 auto 20px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 24px; 
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.3);
            }
            .header h1 { 
              font-size: 28px; 
              font-weight: 700; 
              margin: 0 0 10px 0; 
              letter-spacing: -0.5px;
            }
            .header p { 
              font-size: 16px; 
              margin: 0; 
              opacity: 0.9; 
              font-weight: 400;
            }
            .content { 
              background: white; 
              padding: 40px 30px;
            }
            .score-card { 
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
              border: 3px solid #4f46e5; 
              border-radius: 16px; 
              padding: 35px; 
              text-align: center; 
              margin: 30px 0;
              position: relative;
              overflow: hidden;
            }
            .score-card::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, transparent 70%);
              animation: pulse 3s ease-in-out infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.1); opacity: 0.8; }
            }
            .score { 
              font-size: 4em; 
              font-weight: 800; 
              color: #4f46e5; 
              margin: 0; 
              position: relative;
              z-index: 1;
              text-shadow: 0 4px 8px rgba(79, 70, 229, 0.2);
            }
            .score-subtitle {
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
              margin: 15px 0 10px 0;
              position: relative;
              z-index: 1;
            }
            .score-description {
              color: #64748b; 
              font-size: 14px; 
              margin: 0;
              position: relative;
              z-index: 1;
            }
            .metrics { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
              gap: 20px; 
              margin: 35px 0; 
            }
            .metric { 
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); 
              padding: 25px 20px; 
              border-radius: 12px; 
              text-align: center; 
              border: 1px solid #e2e8f0; 
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .metric:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            }
            .metric h3 { 
              color: #4f46e5; 
              font-size: 24px; 
              margin: 0 0 8px 0; 
              font-weight: 700;
            }
            .metric p { 
              color: #64748b; 
              font-size: 13px; 
              margin: 0; 
              font-weight: 500;
            }
            .section-title {
              color: #1e293b;
              font-size: 22px;
              font-weight: 700;
              border-bottom: 3px solid #4f46e5;
              padding-bottom: 12px;
              margin: 40px 0 25px 0;
              display: inline-block;
            }
            .summary-section {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              padding: 30px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 5px solid #4f46e5;
            }
            .summary-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .summary-item {
              margin: 15px 0;
              padding: 12px 0;
              border-bottom: 1px solid rgba(148, 163, 184, 0.2);
              display: flex;
              align-items: flex-start;
            }
            .summary-item:last-child {
              border-bottom: none;
            }
            .summary-icon {
              margin-right: 12px;
              font-size: 18px;
              min-width: 24px;
            }
            .summary-content {
              flex: 1;
            }
            .summary-label {
              font-weight: 600;
              color: #374151;
              margin-bottom: 4px;
            }
            .summary-value {
              color: #6b7280;
              font-size: 15px;
            }
            .recommendations { 
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
              padding: 30px; 
              border-radius: 12px; 
              margin: 30px 0; 
              border: 1px solid #0ea5e9;
            }
            .saas-card { 
              background: white; 
              border-radius: 12px; 
              padding: 25px; 
              margin: 20px 0; 
              border: 1px solid #e2e8f0; 
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .saas-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            }
            .saas-header { 
              display: flex; 
              align-items: center; 
              margin-bottom: 20px; 
              flex-wrap: wrap;
              gap: 15px;
            }
            .saas-logo { 
              width: 56px; 
              height: 56px; 
              border-radius: 10px; 
              object-fit: contain; 
              background: #f8fafc; 
              padding: 8px;
              border: 1px solid #e2e8f0;
            }
            .saas-info { 
              flex: 1; 
              min-width: 200px;
            }
            .saas-info h4 { 
              margin: 0 0 6px 0; 
              color: #1e293b; 
              font-size: 20px; 
              font-weight: 700;
            }
            .saas-info .tagline { 
              color: #64748b; 
              font-size: 14px; 
              margin: 0; 
              line-height: 1.5;
            }
            .saas-price { 
              background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
              color: white; 
              padding: 8px 16px; 
              border-radius: 20px; 
              font-size: 13px; 
              font-weight: 600;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
            }
            .saas-reason {
              color: #374151;
              margin: 20px 0;
              padding: 15px;
              background: #f9fafb;
              border-radius: 8px;
              border-left: 4px solid #4f46e5;
              font-size: 15px;
              line-height: 1.6;
            }
            .saas-pros { 
              margin: 20px 0; 
            }
            .saas-pros ul {
              margin: 10px 0;
              padding-left: 0;
              list-style: none;
            }
            .saas-pros li { 
              color: #059669; 
              margin: 8px 0;
              padding-left: 24px;
              position: relative;
              font-size: 14px;
            }
            .saas-pros li::before {
              content: '✓';
              position: absolute;
              left: 0;
              color: #059669;
              font-weight: bold;
              font-size: 16px;
            }
            .saas-scores {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              align-items: center;
            }
            .score-badge {
              display: inline-flex;
              align-items: center;
              gap: 5px;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
            .score-automation { background: #dcfce7; color: #166534; }
            .score-ease { background: #dbeafe; color: #1e40af; }
            .score-priority { background: #fef3c7; color: #92400e; }
            .cta-container {
              text-align: center;
              margin-top: 25px;
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              justify-content: center;
            }
            .cta { 
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 8px; 
              display: inline-block; 
              font-weight: 600; 
              font-size: 14px;
              box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
              transition: all 0.2s ease;
              border: none;
            }
            .cta:hover { 
              transform: translateY(-1px); 
              box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4); 
            }
            .cta-primary { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
            .cta-success { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
            .cta-info { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); }
            .next-steps {
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
              color: white;
              padding: 35px 30px;
              border-radius: 16px;
              text-align: center;
              margin: 40px 0;
              position: relative;
              overflow: hidden;
            }
            .next-steps::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
            }
            .next-steps-content { position: relative; z-index: 1; }
            .next-steps h3 { 
              margin: 0 0 15px 0; 
              font-size: 24px; 
              font-weight: 700;
            }
            .next-steps p { 
              margin: 0 0 25px 0; 
              opacity: 0.95; 
              font-size: 16px; 
              line-height: 1.6;
            }
            .cta-main {
              background: white;
              color: #059669;
              padding: 15px 35px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
              font-weight: 700;
              font-size: 16px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
              transition: all 0.2s ease;
            }
            .cta-main:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            .footer { 
              text-align: center; 
              color: #64748b; 
              font-size: 14px; 
              margin-top: 40px; 
              padding: 30px; 
              background: #f8fafc;
              border-top: 1px solid #e2e8f0;
            }
            .footer-logo {
              width: 40px;
              height: 40px;
              background: #4f46e5;
              border-radius: 8px;
              margin: 0 auto 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 16px;
            }
            .footer-brand {
              font-weight: 700;
              color: #1e293b;
              font-size: 16px;
              margin-bottom: 8px;
            }
            .footer-tagline {
              margin-bottom: 15px;
              color: #64748b;
            }
            .footer-links {
              margin-top: 20px;
            }
            .footer-links a {
              color: #4f46e5;
              text-decoration: none;
              margin: 0 10px;
              font-weight: 500;
            }
            .footer-marketing {
              color: #059669;
              font-size: 12px;
              margin-top: 15px;
              padding: 10px;
              background: #f0fdf4;
              border-radius: 6px;
              border: 1px solid #bbf7d0;
            }
            
            /* Mobile responsiveness */
            @media (max-width: 640px) {
              .container { padding: 10px; }
              .header { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
              .content { padding: 30px 20px; }
              .score { font-size: 3em; }
              .metrics { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; }
              .metric { padding: 20px 15px; }
              .metric h3 { font-size: 20px; }
              .saas-header { flex-direction: column; align-items: flex-start; }
              .saas-price { align-self: flex-start; }
              .cta-container { flex-direction: column; align-items: center; }
              .cta { width: 100%; max-width: 280px; text-align: center; }
              .next-steps { padding: 25px 20px; }
              .footer { padding: 25px 15px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <div class="header-content">
                  <div class="logo">🚀</div>
                  <h1>Diagnostic d'Automatisation Solutio</h1>
                  <p>Analyse personnalisée avec recommandations SaaS sur-mesure</p>
                </div>
              </div>
              
              <div class="content">
                <div class="score-card">
                  <div class="score">${diagnosticData.score}%</div>
                  <div class="score-subtitle">Potentiel d'automatisation détecté</div>
                  <p class="score-description">${diagnosticData.analysis || 'Analyse basée sur vos réponses et votre profil d\'entreprise'}</p>
                </div>
                
                <div class="metrics">
                  <div class="metric">
                    <h3>⏱️ ${diagnosticData.financialSavings.hours}h</h3>
                    <p>Temps économisé par mois</p>
                  </div>
                  <div class="metric">
                    <h3>💰 ${diagnosticData.financialSavings.monthly}€</h3>
                    <p>Économies nettes mensuelles</p>
                  </div>
                  <div class="metric">
                    <h3>📈 ${diagnosticData.financialSavings.annual}€</h3>
                    <p>Économies annuelles</p>
                  </div>
                  <div class="metric">
                    <h3>⚙️ ${diagnosticData.financialSavings.calculation?.automationPotential || 75}%</h3>
                    <p>Taux d'automatisation</p>
                  </div>
                </div>
                
                <h2 class="section-title">📋 Résumé de votre diagnostic</h2>
                <div class="summary-section">
                  <ul class="summary-list">
                    <li class="summary-item">
                      <div class="summary-icon">🎯</div>
                      <div class="summary-content">
                        <div class="summary-label">Tâche à automatiser</div>
                        <div class="summary-value">${diagnosticData.responses.task}</div>
                      </div>
                    </li>
                    <li class="summary-item">
                      <div class="summary-icon">📅</div>
                      <div class="summary-content">
                        <div class="summary-label">Fréquence</div>
                        <div class="summary-value">${diagnosticData.responses.frequency}</div>
                      </div>
                    </li>
                    <li class="summary-item">
                      <div class="summary-icon">🏢</div>
                      <div class="summary-content">
                        <div class="summary-label">Secteur d'activité</div>
                        <div class="summary-value">${diagnosticData.responses.sector}</div>
                      </div>
                    </li>
                    <li class="summary-item">
                      <div class="summary-icon">🛠️</div>
                      <div class="summary-content">
                        <div class="summary-label">Outils actuels</div>
                        <div class="summary-value">${diagnosticData.responses.tools}</div>
                      </div>
                    </li>
                    <li class="summary-item">
                      <div class="summary-icon">🎯</div>
                      <div class="summary-content">
                        <div class="summary-label">Résultat attendu</div>
                        <div class="summary-value">${diagnosticData.responses.expectedResult}</div>
                      </div>
                    </li>
                    <li class="summary-item">
                      <div class="summary-icon">⭐</div>
                      <div class="summary-content">
                        <div class="summary-label">Niveau de priorité</div>
                        <div class="summary-value">${diagnosticData.responses.priority}/5</div>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div class="recommendations">
                  <h2 class="section-title">🛠️ Nos recommandations SaaS personnalisées</h2>
                  ${diagnosticData.recommendations.map((rec: any, index: number) => {
                    const saas = rec.saasData;
                    if (!saas) {
                      return `
                        <div class="saas-card">
                          <h4>🔧 ${rec.name || rec.tool}</h4>
                          <div class="saas-reason">
                            <strong>💡 Recommandation :</strong> ${rec.reason}
                          </div>
                          <div class="saas-scores">
                            <span class="score-badge score-priority">Priorité #${rec.priority}</span>
                          </div>
                        </div>
                      `;
                    }
                    
                    const startingPrice = saas.pricingLinked?.length > 0 ? 
                      saas.pricingLinked[0].price : 
                      saas.priceText || 'Prix sur demande';
                    
                    return `
                      <div class="saas-card">
                        <div class="saas-header">
                          ${saas.logoUrl ? `<img src="${saas.logoUrl}" alt="${saas.name}" class="saas-logo">` : '<div class="saas-logo" style="display: flex; align-items: center; justify-content: center; font-weight: bold; color: #4f46e5; font-size: 20px;">📱</div>'}
                          <div class="saas-info">
                            <h4>${saas.name}</h4>
                            <p class="tagline">${saas.tagline || saas.description || 'Solution d\'automatisation recommandée'}</p>
                          </div>
                          <div class="saas-price">À partir de ${startingPrice}</div>
                        </div>
                        
                        <div class="saas-reason">
                          <strong>💡 Pourquoi cette solution :</strong> ${rec.reason}
                        </div>
                        
                        ${saas.pros?.length > 0 ? `
                          <div class="saas-pros">
                            <strong>✅ Avantages principaux :</strong>
                            <ul>
                              ${saas.pros.slice(0, 3).map((pro: string) => `<li>${pro}</li>`).join('')}
                            </ul>
                          </div>
                        ` : ''}
                        
                        <div class="saas-scores">
                          <span class="score-badge score-automation">Automatisation ${saas.automation || 0}%</span>
                          <span class="score-badge score-ease">Facilité ${saas.ease || 0}%</span>
                          <span class="score-badge score-priority">Priorité #${rec.priority}</span>
                        </div>
                        
                        <div class="cta-container">
                          ${saas.website ? `<a href="${saas.website}" class="cta cta-primary">🌐 Découvrir</a>` : ''}
                          ${saas.trialUrl ? `<a href="${saas.trialUrl}" class="cta cta-success">🆓 Essai gratuit</a>` : ''}
                          <a href="https://solutio.work/catalogue#${saas.name.toLowerCase().replace(/\s+/g, '-')}" class="cta cta-info">📋 Voir les détails</a>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
                
                <div class="next-steps">
                  <div class="next-steps-content">
                    <h3>💡 Prochaine étape recommandée</h3>
                    <p>Réservez un appel gratuit de 30 minutes avec notre expert pour créer votre stratégie d'automatisation personnalisée et obtenir un accompagnement sur-mesure.</p>
                    <a href="https://calendly.com/tlb-ov_p/30min" class="cta-main">📅 Réserver mon appel stratégique gratuit</a>
                  </div>
                </div>
                
                <div class="footer">
                  <div class="footer-logo">S</div>
                  <div class="footer-brand">Diagnostic généré par Solutio</div>
                  <div class="footer-tagline">Votre partenaire automation pour transformer vos processus métier</div>
                  <div class="footer-links">
                    <a href="https://solutio.work">Site Web</a>
                    <a href="https://solutio.work/catalogue">Catalogue SaaS</a>
                    <a href="mailto:contact@solutio.work">Contact</a>
                  </div>
                  ${acceptMarketing ? '<div class="footer-marketing">✅ Vous recevrez nos conseils personnalisés et nos dernières recommandations</div>' : ''}
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);
    console.log("Email details:", {
      id: emailResponse.data?.id,
      to: email,
      acceptMarketing: acceptMarketing,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-diagnostic-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);