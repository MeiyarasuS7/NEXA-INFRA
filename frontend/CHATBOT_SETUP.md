# NEXA INFRA - AI Chatbot Setup

## Setup Groq API for Chatbot

### 1. Get Your Groq API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up or log in
3. Click "Create API Key"
4. Copy your new API key

### 2. Configure Your Application

Open the `.env` file in the `frontend` directory and add your Groq API key:

```env
# ============================= AI CHATBOT (GROQ) =============================
VITE_GROQ_API_KEY=gsk_your_actual_api_key_here
VITE_GROQ_MODEL=llama-3.1-70b-versatile
VITE_CHATBOT_MAX_TOKENS=1024
VITE_CHATBOT_TEMPERATURE=0.7
```

### 3. Configuration Options

- **VITE_GROQ_API_KEY**: Your Groq API key (required)
- **VITE_GROQ_MODEL**: The AI model to use
  - `llama-3.1-70b-versatile` (recommended) - Best for general conversation
  - `llama-3.1-8b-instant` - Faster responses
  - `mixtral-8x7b-32768` - Good for longer contexts
- **VITE_CHATBOT_MAX_TOKENS**: Maximum length of responses (default: 1024)
- **VITE_CHATBOT_TEMPERATURE**: Creativity level (0.0 to 1.0, default: 0.7)

### 4. Restart Development Server

After updating the `.env` file, restart your dev server:

```bash
npm run dev
```

### 5. Test the Chatbot

1. Click the golden message icon in the bottom-right corner
2. Type a message and press Enter
3. The AI will respond using Groq's LLaMA model

### Demo Mode

If the Groq API key is not configured, the chatbot will show a demo message explaining that it needs configuration.

### Troubleshooting

**Error: "API request failed"**
- Check that your API key is correct
- Ensure you have credits in your Groq account
- Verify your internet connection

**Error: "Please configure the VITE_GROQ_API_KEY"**
- Make sure you've added the API key to `.env`
- Restart the development server after adding the key
- Check that the key doesn't have extra spaces or quotes

**Chatbot not responding**
- Open browser console (F12) to see error messages
- Verify the `.env` file is in the `frontend` directory
- Make sure the API key starts with `gsk_`

### API Rate Limits

Free tier limits:
- 30 requests per minute
- 14,400 requests per day

For higher limits, upgrade your Groq account.

## Security Notes

⚠️ **Important**: Never commit your `.env` file to Git!

The `.env` file is already in `.gitignore` to prevent accidental commits.
