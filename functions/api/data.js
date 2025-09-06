export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const data = await request.json();
        const { number } = data;

        // Validate 10-digit number
        if (!number || !/^\d{10}$/.test(number)) {
            return new Response(JSON.stringify({ 
                error: 'Please enter a valid 10-digit number' 
            }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const yourBotToken = env.YOUR_BOT_TOKEN;
        const chatId = parseInt(env.TELEGRAM_CHAT_ID);
        
        // Clear pending updates to avoid old messages
        await fetch(`https://api.telegram.org/bot${yourBotToken}/getUpdates?offset=-1`);
        
        // Send command to Telegram group
        const command = `/num ${number}`;
        const sendResponse = await fetch(`https://api.telegram.org/bot${yourBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: command
            })
        });

        if (!sendResponse.ok) {
            const errorData = await sendResponse.json();
            throw new Error(`Failed to send request: ${JSON.stringify(errorData)}`);
        }

        // Wait for bot response (adjust timing as needed)
        await new Promise(resolve => setTimeout(resolve, 3500));

        // Get the latest updates
        const updatesResponse = await fetch(`https://api.telegram.org/bot${yourBotToken}/getUpdates?limit=15`);
        if (!updatesResponse.ok) {
            throw new Error('Failed to retrieve data');
        }

        const updatesData = await updatesResponse.json();
        let botResponse = null;
        
        // Get your bot's ID to distinguish responses
        const botInfo = await fetch(`https://api.telegram.org/bot${yourBotToken}/getMe`);
        const botData = await botInfo.json();
        const yourBotId = botData.result.id;
        
        // Find the data bot's response (most recent message from a bot that's not yours)
        if (updatesData.result && updatesData.result.length > 0) {
            for (let i = updatesData.result.length - 1; i >= 0; i--) {
                const update = updatesData.result[i];
                if (update.message && 
                    update.message.chat.id == chatId && 
                    update.message.from.is_bot === true && 
                    update.message.from.id != yourBotId) {
                    botResponse = update.message.text;
                    break;
                }
            }
        }

        if (botResponse) {
            return new Response(JSON.stringify({ 
                success: true, 
                data: botResponse
            }), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        } else {
            return new Response(JSON.stringify({ 
                success: false, 
                data: "No data found for this number"
            }), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: error.message || 'Failed to retrieve data'
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle CORS preflight requests
export async function onRequestOptions(context) {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
