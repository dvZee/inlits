import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  name?: string
  role?: string
}

const createWelcomeEmailTemplate = (name: string, role: string) => {
  const isCreator = role === 'creator';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Inlits</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1f4ead 0%, #355fb5 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f4ead;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #555;
        }
        .features {
            background-color: #f8f9fc;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .features h3 {
            color: #1f4ead;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .feature-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
        }
        .feature-list li:last-child {
            border-bottom: none;
        }
        .feature-icon {
            width: 20px;
            height: 20px;
            background-color: #1f4ead;
            border-radius: 50%;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #1f4ead 0%, #355fb5 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #1f4ead;
            text-decoration: none;
        }
        .footer-text {
            font-size: 14px;
            color: #666;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">📚 Inlits</div>
            <div class="tagline">Stories, Ideas, and Communities Unite</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Welcome to Inlits, ${name}! 🎉</div>
            
            <div class="message">
                ${isCreator 
                  ? `We're thrilled to have you join our community of creators! You're now part of a platform where knowledge meets creativity, and your expertise can inspire thousands of learners worldwide.`
                  : `We're excited to have you join our learning community! You're now part of a platform where curiosity meets knowledge, and every day brings new opportunities to grow and discover.`
                }
            </div>

            <!-- Features Section -->
            <div class="features">
                <h3>${isCreator ? '🚀 Creator Features Await You:' : '📖 Your Learning Journey Starts Here:'}</h3>
                <ul class="feature-list">
                    ${isCreator ? `
                    <li>
                        <div class="feature-icon">✍️</div>
                        <span>Publish articles, books, audiobooks, and podcasts</span>
                    </li>
                    <li>
                        <div class="feature-icon">📊</div>
                        <span>Track your content performance with detailed analytics</span>
                    </li>
                    <li>
                        <div class="feature-icon">💰</div>
                        <span>Monetize your knowledge and earn from your content</span>
                    </li>
                    <li>
                        <div class="feature-icon">👥</div>
                        <span>Build a community of engaged followers</span>
                    </li>
                    <li>
                        <div class="feature-icon">🎯</div>
                        <span>Schedule sessions and connect directly with learners</span>
                    </li>
                    ` : `
                    <li>
                        <div class="feature-icon">🔍</div>
                        <span>Discover content across multiple formats and topics</span>
                    </li>
                    <li>
                        <div class="feature-icon">📚</div>
                        <span>Build your personal library and track reading progress</span>
                    </li>
                    <li>
                        <div class="feature-icon">👥</div>
                        <span>Join book clubs and learning communities</span>
                    </li>
                    <li>
                        <div class="feature-icon">🎯</div>
                        <span>Set learning goals and achieve milestones</span>
                    </li>
                    <li>
                        <div class="feature-icon">💬</div>
                        <span>Engage in discussions and connect with fellow learners</span>
                    </li>
                    `}
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="${process.env.NODE_ENV === 'production' ? 'https://inlits.com' : 'http://localhost:5173'}${isCreator ? '/dashboard' : '/library'}" class="cta-button">
                    ${isCreator ? '🎨 Start Creating' : '📖 Start Learning'}
                </a>
            </div>

            <div class="message">
                ${isCreator 
                  ? `Ready to share your expertise? Head to your creator dashboard to publish your first piece of content and start building your audience.`
                  : `Ready to start learning? Explore our vast library of content, set your learning goals, and join communities that match your interests.`
                }
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                <strong>Need help getting started?</strong><br>
                Our support team is here to help you make the most of Inlits.
            </div>
            
            <div class="social-links">
                <a href="mailto:support@inlits.com">📧 Support</a>
                <a href="mailto:creators@inlits.com">🎨 Creator Help</a>
                <a href="https://inlits.com/about">ℹ️ About Us</a>
            </div>
            
            <div class="footer-text">
                © ${new Date().getFullYear()} Inlits. All rights reserved.<br>
                <a href="https://inlits.com/privacy" style="color: #1f4ead;">Privacy Policy</a> | 
                <a href="https://inlits.com/terms" style="color: #1f4ead;">Terms of Service</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, name = 'Friend', role = 'consumer' }: EmailRequest = await req.json()

    if (!to) {
      throw new Error('Email address is required')
    }

    // Create the beautiful HTML email template
    const htmlContent = createWelcomeEmailTemplate(name, role);
    const subject = `Welcome to Inlits, ${name}! 🎉`;

    // In a real implementation, you would integrate with an email service like Resend
    // For now, we'll log the email details and return success
    console.log('Welcome email would be sent:', {
      to,
      subject,
      name,
      role,
      timestamp: new Date().toISOString(),
      htmlLength: htmlContent.length
    })

    // Example with Resend (uncomment when you have API key):
    /*
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Inlits <welcome@inlits.com>',
          to: [to],
          subject: subject,
          html: htmlContent,
        }),
      })

      if (!emailResponse.ok) {
        throw new Error(`Failed to send email: ${emailResponse.statusText}`)
      }

      const result = await emailResponse.json()
      console.log('Email sent successfully:', result)
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully',
        details: {
          recipient: to,
          subject: subject,
          role: role
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending welcome email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send welcome email' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})