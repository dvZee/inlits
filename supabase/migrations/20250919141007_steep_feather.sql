/*
  # Welcome Email Setup

  1. New Functions
    - `send_welcome_email` - Sends welcome email to new users
    - `handle_new_user_welcome` - Trigger function for new user signup

  2. Email Templates
    - Creates a beautiful welcome email template for new users
    - Includes personalized content based on user role

  3. Triggers
    - Automatically sends welcome email when new user signs up
*/

-- Create function to send welcome email
CREATE OR REPLACE FUNCTION send_welcome_email(user_email text, user_name text, user_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  welcome_subject text;
  welcome_body text;
BEGIN
  -- Set subject based on role
  IF user_role = 'creator' THEN
    welcome_subject := 'Welcome to Inlits - Start Sharing Your Knowledge! 🚀';
  ELSE
    welcome_subject := 'Welcome to Inlits - Your Learning Journey Begins! 📚';
  END IF;

  -- Create beautiful HTML email template
  welcome_body := '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Inlits</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #1f4ead 0%, #355fb5 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .header-text { color: white; font-size: 18px; opacity: 0.9; }
        .content { padding: 40px 20px; }
        .welcome-title { font-size: 28px; font-weight: bold; color: #1a1a1a; margin-bottom: 20px; text-align: center; }
        .welcome-text { font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 30px; }
        .cta-button { display: inline-block; background: #1f4ead; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .features { background: #f8f9fc; padding: 30px 20px; margin: 30px 0; border-radius: 12px; }
        .feature { display: flex; align-items: center; margin-bottom: 20px; }
        .feature-icon { width: 40px; height: 40px; background: #1f4ead; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: white; font-size: 18px; }
        .feature-text { flex: 1; }
        .feature-title { font-weight: 600; color: #1a1a1a; margin-bottom: 5px; }
        .feature-desc { color: #4a5568; font-size: 14px; }
        .footer { background: #1a1a1a; color: #a0a0a0; padding: 30px 20px; text-align: center; }
        .footer a { color: #1f4ead; text-decoration: none; }
        .social-links { margin: 20px 0; }
        .social-links a { display: inline-block; margin: 0 10px; color: #1f4ead; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📚 Inlits</div>
            <div class="header-text">Stories, Ideas, and Communities Unite</div>
        </div>
        
        <div class="content">
            <h1 class="welcome-title">Welcome to Inlits, ' || user_name || '! 🎉</h1>
            
            <p class="welcome-text">
                We''re thrilled to have you join our community of learners and creators. Inlits is your gateway to discovering amazing content, connecting with like-minded individuals, and ' || 
                CASE 
                    WHEN user_role = 'creator' THEN 'sharing your knowledge with the world.'
                    ELSE 'expanding your knowledge through quality content.'
                END || '
            </p>';

  -- Add role-specific content
  IF user_role = 'creator' THEN
    welcome_body := welcome_body || '
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">✍️</div>
                    <div class="feature-text">
                        <div class="feature-title">Create & Publish</div>
                        <div class="feature-desc">Share articles, books, audiobooks, and podcasts with our intuitive creation tools</div>
                    </div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">
                        <div class="feature-title">Track Performance</div>
                        <div class="feature-desc">Monitor your content''s reach and engagement with detailed analytics</div>
                    </div>
                </div>
                <div class="feature">
                    <div class="feature-icon">💰</div>
                    <div class="feature-text">
                        <div class="feature-title">Monetize Content</div>
                        <div class="feature-desc">Earn from your knowledge through subscriptions and content sales</div>
                    </div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🤝</div>
                    <div class="feature-text">
                        <div class="feature-title">Build Community</div>
                        <div class="feature-desc">Connect directly with your audience and build lasting relationships</div>
                    </div>
                </div>
            </div>
            
            <p class="welcome-text">
                Ready to start creating? Set up your creator profile and publish your first piece of content today!
            </p>
            
            <div style="text-align: center;">
                <a href="https://inlits.com/dashboard" class="cta-button">Start Creating →</a>
            </div>';
  ELSE
    welcome_body := welcome_body || '
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📖</div>
                    <div class="feature-text">
                        <div class="feature-title">Discover Content</div>
                        <div class="feature-desc">Explore thousands of articles, books, audiobooks, and podcasts</div>
                    </div>
                </div>
                <div class="feature">
                    <div class="feature-icon">👥</div>
                    <div class="feature-text">
                        <div class="feature-title">Join Communities</div>
                        <div class="feature-desc">Connect with book clubs, study groups, and learning challenges</div>
                    </div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-text">
                        <div class="feature-title">Track Progress</div>
                        <div class="feature-desc">Set learning goals and monitor your reading journey</div>
                    </div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <div class="feature-text">
                        <div class="feature-title">Learn Anywhere</div>
                        <div class="feature-desc">Access your content offline and sync across all devices</div>
                    </div>
                </div>
            </div>
            
            <p class="welcome-text">
                Ready to start learning? Explore our vast library and begin your intellectual journey today!
            </p>
            
            <div style="text-align: center;">
                <a href="https://inlits.com/library" class="cta-button">Explore Library →</a>
            </div>';
  END IF;

  welcome_body := welcome_body || '
        </div>
        
        <div class="footer">
            <p>Questions? We''re here to help!</p>
            <p>Email us at <a href="mailto:support@inlits.com">support@inlits.com</a></p>
            
            <div class="social-links">
                <a href="https://twitter.com/inlits">Twitter</a>
                <a href="https://facebook.com/inlits">Facebook</a>
                <a href="https://linkedin.com/company/inlits">LinkedIn</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
                © 2025 Inlits. All rights reserved.<br>
                You received this email because you signed up for Inlits.
            </p>
        </div>
    </div>
</body>
</html>';

  -- Send the email using Supabase Edge Functions
  -- Note: This would require setting up an email service like Resend or SendGrid
  -- For now, we'll log the email content
  RAISE NOTICE 'Welcome email would be sent to: %', user_email;
  RAISE NOTICE 'Subject: %', welcome_subject;
  
  -- In production, you would call an edge function here:
  -- PERFORM net.http_post(
  --   url := 'https://your-project.supabase.co/functions/v1/send-email',
  --   headers := '{"Authorization": "Bearer ' || current_setting('app.jwt_token') || '", "Content-Type": "application/json"}',
  --   body := json_build_object(
  --     'to', user_email,
  --     'subject', welcome_subject,
  --     'html', welcome_body
  --   )::text
  -- );
END;
$$;

-- Create trigger function for new user welcome
CREATE OR REPLACE FUNCTION handle_new_user_welcome()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Send welcome email after profile is created
  PERFORM send_welcome_email(
    (SELECT email FROM auth.users WHERE id = NEW.id),
    COALESCE(NEW.name, NEW.username, 'Friend'),
    NEW.role
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to send welcome email when profile is created
DROP TRIGGER IF EXISTS send_welcome_email_trigger ON profiles;
CREATE TRIGGER send_welcome_email_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_welcome();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION send_welcome_email TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user_welcome TO authenticated;