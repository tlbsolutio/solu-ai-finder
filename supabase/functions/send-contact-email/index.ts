import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",  
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, message }: ContactEmailRequest = await req.json();

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "Solutio Contact <no-reply@resend.dev>",
      to: [email],
      subject: "✅ Votre message a été reçu - Solutio",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation de contact - Solutio</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              margin: 0; 
              padding: 0; 
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            }
            .container { 
              max-width: 600px; 
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
              background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
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
            }
            .header p { 
              font-size: 16px; 
              margin: 0; 
              opacity: 0.9; 
            }
            .content { 
              background: white; 
              padding: 40px 30px;
            }
            .confirmation-card {
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              border: 2px solid #10b981;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 20px 0;
            }
            .check-icon {
              width: 60px;
              height: 60px;
              background: #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              color: white;
              font-size: 24px;
              font-weight: bold;
            }
            .message-summary {
              background: #f8fafc;
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 4px solid #4f46e5;
            }
            .message-item {
              margin: 15px 0;
              display: flex;
              align-items: flex-start;
            }
            .message-label {
              font-weight: 600;
              color: #374151;
              min-width: 100px;
              margin-right: 15px;
            }
            .message-value {
              color: #6b7280;
              flex: 1;
            }
            .next-steps {
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              text-align: center;
              margin: 30px 0;
            }
            .cta {
              background: white;
              color: #4f46e5;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
              font-weight: 600;
              margin: 15px 10px 0 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
              transition: all 0.2s ease;
            }
            .cta:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            .footer { 
              text-align: center; 
              color: #64748b; 
              font-size: 14px; 
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
            @media (max-width: 640px) {
              .container { padding: 10px; }
              .header { padding: 30px 20px; }
              .content { padding: 30px 20px; }
              .next-steps { padding: 25px 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <div class="logo">✉️</div>
                <h1>Message bien reçu !</h1>
                <p>Merci pour votre prise de contact</p>
              </div>
              
              <div class="content">
                <div class="confirmation-card">
                  <div class="check-icon">✓</div>
                  <h2 style="margin: 0 0 15px 0; color: #059669;">Votre message a été transmis</h2>
                  <p style="margin: 0; color: #6b7280;">Notre équipe vous répondra dans les plus brefs délais, généralement sous 24h.</p>
                </div>
                
                <h3 style="color: #1e293b; margin: 30px 0 20px 0;">📋 Récapitulatif de votre demande</h3>
                <div class="message-summary">
                  <div class="message-item">
                    <div class="message-label">Nom :</div>
                    <div class="message-value">${name}</div>
                  </div>
                  <div class="message-item">
                    <div class="message-label">Email :</div>
                    <div class="message-value">${email}</div>
                  </div>
                  ${company ? `
                    <div class="message-item">
                      <div class="message-label">Entreprise :</div>
                      <div class="message-value">${company}</div>
                    </div>
                  ` : ''}
                  <div class="message-item">
                    <div class="message-label">Message :</div>
                    <div class="message-value">${message}</div>
                  </div>
                </div>
                
                <div class="next-steps">
                  <h3 style="margin: 0 0 15px 0;">🚀 En attendant notre réponse</h3>
                  <p style="margin: 0 0 20px 0; opacity: 0.9;">Découvrez notre diagnostic d'automatisation gratuit ou explorez notre catalogue de solutions SaaS</p>
                  <a href="https://solutio.work/diagnostic" class="cta">🎯 Diagnostic gratuit</a>
                  <a href="https://solutio.work/catalogue" class="cta">📋 Catalogue SaaS</a>
                </div>
                
                <div class="footer">
                  <div class="footer-logo">S</div>
                  <p><strong>Équipe Solutio</strong><br>
                  <a href="https://solutio.work" style="color: #4f46e5;">https://solutio.work</a></p>
                  <p style="margin-top: 15px; color: #64748b;">Votre partenaire automation pour transformer vos processus métier</p>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Send notification email to Solutio team
    const notificationEmailResponse = await resend.emails.send({
      from: "Solutio Contact <no-reply@resend.dev>",
      to: ["contact@solutio.work"], // Replace with your actual email
      subject: `🔔 Nouveau message de contact - ${name}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouveau contact - Solutio</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              margin: 0; 
              padding: 20px;
              background: #f8fafc;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin-bottom: 30px;
            }
            .contact-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #ef4444;
              margin: 20px 0;
            }
            .contact-item {
              margin: 15px 0;
              display: flex;
              align-items: flex-start;
            }
            .contact-label {
              font-weight: 600;
              color: #374151;
              min-width: 100px;
              margin-right: 15px;
            }
            .contact-value {
              color: #6b7280;
              flex: 1;
            }
            .message-content {
              background: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              margin: 20px 0;
            }
            .urgent {
              background: #fef2f2;
              border: 1px solid #fecaca;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              color: #dc2626;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nouveau message de contact</h1>
              <p>Reçu le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
            
            <div class="urgent">
              <strong>⚡ Action requise :</strong> Un nouveau prospect a pris contact via le site web
            </div>
            
            <h3>👤 Informations du contact</h3>
            <div class="contact-info">
              <div class="contact-item">
                <div class="contact-label">Nom :</div>
                <div class="contact-value"><strong>${name}</strong></div>
              </div>
              <div class="contact-item">
                <div class="contact-label">Email :</div>
                <div class="contact-value"><a href="mailto:${email}">${email}</a></div>
              </div>
              ${company ? `
                <div class="contact-item">
                  <div class="contact-label">Entreprise :</div>
                  <div class="contact-value"><strong>${company}</strong></div>
                </div>
              ` : ''}
            </div>
            
            <h3>💬 Message</h3>
            <div class="message-content">
              <p>${message}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 8px;">
              <p style="margin: 0 0 15px 0; color: #059669;"><strong>🎯 Prochaines étapes recommandées</strong></p>
              <p style="margin: 0; color: #6b7280;">1. Répondre sous 2h si possible<br>
              2. Proposer un appel de découverte<br>
              3. Préparer une présentation personnalisée</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Contact emails sent successfully:", {
      userEmail: userEmailResponse,
      notificationEmail: notificationEmailResponse
    });

    return new Response(JSON.stringify({ 
      success: true,
      userEmailId: userEmailResponse.data?.id,
      notificationEmailId: notificationEmailResponse.data?.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);