// Initialize conversationHistory globally
let conversationHistory = [];

document.addEventListener('DOMContentLoaded', function() {
    // AI Chat functionality
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('ai-chat-input');
    const sendButton = document.getElementById('ai-send-button');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    
    // Add event listeners to suggestion chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const question = this.textContent;
            chatInput.value = question;
            sendMessage();
        });
    });
    
    // Add event listener to send button
    sendButton.addEventListener('click', sendMessage);
    
    // Add event listener to input for Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Function to send message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;
        
        // Add user message to UI
        addMessageToUI('user', message);
        
        // Clear input
        chatInput.value = '';
        
        // Show thinking animation
        const thinkingElement = document.createElement('div');
        thinkingElement.className = 'ai-thinking';
        thinkingElement.innerHTML = `
            <div class="ai-message-avatar">
                <span class="material-icons">psychology</span>
            </div>
            <div class="ai-thinking-dots">
                <span class="ai-thinking-dot"></span>
                <span class="ai-thinking-dot"></span>
                <span class="ai-thinking-dot"></span>
            </div>
        `;
        chatMessages.appendChild(thinkingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add user message to conversation history
        const userMessage = {
            role: "user",
            content: message
        };
        conversationHistory.push(userMessage);
        
        // Only keep the last 10 messages to avoid context length issues
        conversationHistory = conversationHistory.slice(-10);
        
        // Process with AI (simulated response for now)
        setTimeout(async () => {
            // Remove thinking animation
            chatMessages.removeChild(thinkingElement);
            
            try {
                // Get response from AI
                const completion = await getAIResponse(message);
                
                // Add AI response to UI
                addMessageToUI('ai', completion.content);
                
                // Add AI response to conversation history
                conversationHistory.push(completion);
                
            } catch (error) {
                console.error('Error getting AI response:', error);
                addMessageToUI('ai', '抱歉，我遇到了一些问题。请稍后再试。');
            }
        }, 1500);
    }
    
    // Function to add message to UI
    function addMessageToUI(type, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `ai-message ${type}`;
        
        const avatar = type === 'user' 
            ? '<span class="material-icons">person</span>' 
            : '<span class="material-icons">psychology</span>';
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="ai-message-avatar">
                ${avatar}
            </div>
            <div class="ai-message-content">
                <div class="ai-message-bubble">${message}</div>
                <div class="ai-message-time">${time}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to get AI response
    async function getAIResponse(message) {
        try {
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `你是一位专业的中医养生顾问，专注于辟谷养生领域。
                        以友好、专业的语气回答用户关于辟谷、养生和传统医学的问题。
                        提供科学且有根据的建议，同时尊重传统中医理论。
                        避免夸大辟谷功效，强调安全和适度。
                        当涉及健康风险时，建议用户咨询专业医师。
                        如果不确定答案，坦诚承认并提供可靠的信息来源。
                        每个回答保持在300字以内，简明扼要。`
                    },
                    ...conversationHistory
                ]
            });
            
            return completion;
        } catch (error) {
            console.error('Error in AI response:', error);
            throw error;
        }
    }
});
