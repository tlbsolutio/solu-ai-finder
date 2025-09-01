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
      from: "Solutio <onboarding@resend.dev>",
      to: [email],
      subject: "Votre diagnostic d'automatisation - Solutio",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .score-card { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .score { font-size: 3em; font-weight: bold; color: #667eea; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
            .metric { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
            .recommendations { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Votre Diagnostic d'Automatisation</h1>
              <p>Analyse personnalisée de votre potentiel d'automatisation</p>
            </div>
            
            <div class="content">
              <div class="score-card">
                <div class="score">${diagnosticData.score}%</div>
                <p><strong>Potentiel d'automatisation détecté</strong></p>
              </div>
              
              <div class="metrics">
                <div class="metric">
                  <h3>${diagnosticData.financialSavings.hours}h</h3>
                  <p>Temps économisé/mois</p>
                </div>
                <div class="metric">
                  <h3>${diagnosticData.financialSavings.monthly}€</h3>
                  <p>Économies/mois</p>
                </div>
                <div class="metric">
                  <h3>${diagnosticData.financialSavings.annual}€</h3>
                  <p>Économies/an</p>
                </div>
              </div>
              
              <h2>📋 Résumé de vos réponses</h2>
              <ul>
                <li><strong>Tâche :</strong> ${diagnosticData.responses.task}</li>
                <li><strong>Fréquence :</strong> ${diagnosticData.responses.frequency}</li>
                <li><strong>Secteur :</strong> ${diagnosticData.responses.sector}</li>
                <li><strong>Outils actuels :</strong> ${diagnosticData.responses.tools}</li>
                <li><strong>Résultat attendu :</strong> ${diagnosticData.responses.expectedResult}</li>
                <li><strong>Priorité :</strong> ${diagnosticData.responses.priority}/5</li>
              </ul>
              
              <div class="recommendations">
                <h2>🛠️ Nos recommandations</h2>
                <ul>
                  ${diagnosticData.recommendations.map((tool: string) => `<li>${tool}</li>`).join('')}
                </ul>
              </div>
              
              <p>💡 <strong>Prochaine étape :</strong> Réservez un appel gratuit de 30 minutes pour discuter de votre stratégie d'automatisation personnalisée.</p>
              
              <div style="text-align: center;">
                <a href="https://calendly.com/tlb-ov_p/30min" class="cta">📅 Réserver mon appel gratuit</a>
              </div>
              
              <hr style="margin: 30px 0;">
              <p style="text-align: center; color: #666; font-size: 14px;">
                Diagnostic généré par <strong>Solutio</strong><br>
                <a href="https://solutio.work">https://solutio.work</a>
                ${acceptMarketing ? '<br><br>Vous avez accepté d\'être contacté pour des conseils personnalisés.' : ''}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

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