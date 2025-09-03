import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
            .score-card { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #667eea; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; }
            .score { font-size: 3.5em; font-weight: bold; color: #667eea; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin: 25px 0; }
            .metric { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #e9ecef; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .metric h3 { color: #667eea; font-size: 1.8em; margin: 0 0 5px 0; font-weight: bold; }
            .metric p { color: #6c757d; font-size: 0.9em; margin: 0; }
            .recommendations { background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e9ecef; }
            .saas-card { background: white; border-radius: 10px; padding: 20px; margin: 15px 0; border: 1px solid #e9ecef; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .saas-header { display: flex; align-items: center; margin-bottom: 15px; }
            .saas-logo { width: 48px; height: 48px; border-radius: 8px; margin-right: 15px; object-fit: contain; background: #f8f9fa; padding: 5px; }
            .saas-info h4 { margin: 0 0 5px 0; color: #333; font-size: 1.2em; }
            .saas-info .tagline { color: #6c757d; font-size: 0.9em; margin: 0; }
            .saas-price { background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; margin-left: auto; }
            .saas-pros { margin: 10px 0; }
            .saas-pros li { color: #28a745; margin: 5px 0; }
            .cta { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 10px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
            .cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
            .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Votre Diagnostic d'Automatisation Solutio</h1>
              <p>Analyse personnalisée avec recommandations SaaS sur-mesure</p>
            </div>
            
            <div class="content">
              <div class="score-card">
                <div class="score">${diagnosticData.score}%</div>
                <p><strong>Potentiel d'automatisation détecté pour votre entreprise</strong></p>
                <p style="color: #6c757d; font-size: 0.9em; margin-top: 10px;">${diagnosticData.analysis || 'Analyse basée sur vos réponses'}</p>
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
              
              <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📋 Résumé de votre diagnostic</h2>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <ul style="list-style: none; padding: 0;">
                  <li style="margin: 10px 0;"><strong>🎯 Tâche à automatiser :</strong> ${diagnosticData.responses.task}</li>
                  <li style="margin: 10px 0;"><strong>📅 Fréquence :</strong> ${diagnosticData.responses.frequency}</li>
                  <li style="margin: 10px 0;"><strong>🏢 Secteur :</strong> ${diagnosticData.responses.sector}</li>
                  <li style="margin: 10px 0;"><strong>🛠️ Outils actuels :</strong> ${diagnosticData.responses.tools}</li>
                  <li style="margin: 10px 0;"><strong>🎯 Résultat attendu :</strong> ${diagnosticData.responses.expectedResult}</li>
                  <li style="margin: 10px 0;"><strong>⭐ Priorité :</strong> ${diagnosticData.responses.priority}/5</li>
                </ul>
              </div>
              
              <div class="recommendations">
                <h2 style="color: #333; margin-bottom: 20px;">🛠️ Nos recommandations SaaS personnalisées</h2>
                ${diagnosticData.recommendations.map((rec: any, index: number) => {
                  const saas = rec.saasData;
                  if (!saas) {
                    return `
                      <div class="saas-card">
                        <h4>🔧 ${rec.name || rec.tool}</h4>
                        <p>${rec.reason}</p>
                        <p><strong>Priorité:</strong> #${rec.priority}</p>
                      </div>
                    `;
                  }
                  
                  const startingPrice = saas.pricingLinked?.length > 0 ? 
                    saas.pricingLinked[0].price : 
                    saas.priceText || 'Prix sur demande';
                  
                  return `
                    <div class="saas-card">
                      <div class="saas-header">
                        ${saas.logoUrl ? `<img src="${saas.logoUrl}" alt="${saas.name}" class="saas-logo">` : '<div class="saas-logo" style="display: flex; align-items: center; justify-content: center; font-weight: bold; color: #667eea;">📱</div>'}
                        <div class="saas-info">
                          <h4>${saas.name}</h4>
                          <p class="tagline">${saas.tagline || saas.description || ''}</p>
                        </div>
                        <div class="saas-price">À partir de ${startingPrice}</div>
                      </div>
                      
                      <p style="color: #495057; margin: 15px 0;"><strong>💡 Pourquoi ce choix :</strong> ${rec.reason}</p>
                      
                      ${saas.pros?.length > 0 ? `
                        <div class="saas-pros">
                          <strong>✅ Avantages principaux :</strong>
                          <ul style="margin: 10px 0; padding-left: 20px;">
                            ${saas.pros.slice(0, 3).map((pro: string) => `<li>${pro}</li>`).join('')}
                          </ul>
                        </div>
                      ` : ''}
                      
                      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef;">
                        <strong>📊 Scores :</strong>
                        <span style="margin-left: 10px; color: #28a745;">Automatisation: ${saas.automation || 0}%</span>
                        <span style="margin-left: 15px; color: #17a2b8;">Facilité: ${saas.ease || 0}%</span>
                        <span style="margin-left: 15px; color: #ffc107;">Priorité: #${rec.priority}</span>
                      </div>
                      
                      <div style="text-align: center; margin-top: 20px;">
                        ${saas.website ? `<a href="${saas.website}" class="cta" style="margin: 5px;">🌐 Voir le site</a>` : ''}
                        ${saas.trialUrl ? `<a href="${saas.trialUrl}" class="cta" style="margin: 5px; background: #28a745;">🆓 Essai gratuit</a>` : ''}
                        <a href="https://solutio.work/catalogue#${saas.name.toLowerCase().replace(/\s+/g, '-')}" class="cta" style="margin: 5px; background: #17a2b8;">📋 Voir les détails</a>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
              
              <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0;">💡 Prochaine étape recommandée</h3>
                <p style="margin: 0 0 20px 0; opacity: 0.9;">Réservez un appel gratuit de 30 minutes avec notre expert pour créer votre stratégie d'automatisation personnalisée et obtenir un accompagnement sur-mesure.</p>
                <a href="https://calendly.com/tlb-ov_p/30min" style="background: white; color: #28a745; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">📅 Réserver mon appel stratégique gratuit</a>
              </div>
              
              <div class="footer">
                <p><strong>Diagnostic généré par Solutio</strong><br>
                <a href="https://solutio.work" style="color: #667eea;">https://solutio.work</a></p>
                <p style="margin-top: 15px;">Votre partenaire automation pour transformer vos processus métier</p>
                ${acceptMarketing ? '<p style="color: #28a745; font-size: 12px; margin-top: 10px;">✅ Vous avez accepté de recevoir nos conseils personnalisés</p>' : ''}
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