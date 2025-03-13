const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class ChatServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map для хранения всех подключений
        this.adminConnections = new Set(); // Множество для хранения админских подключений
        this.customerChats = new Map(); // Map для хранения чатов клиентов

        this.wss.on('connection', (ws) => {
            const clientId = uuidv4();
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(ws, clientId, data);
                } catch (e) {
                    console.error('Ошибка обработки сообщения:', e);
                }
            });

            ws.on('close', () => {
                this.handleDisconnect(clientId);
            });
        });
    }

    handleMessage(ws, clientId, data) {
        switch (data.type) {
            case 'auth':
                this.handleAuth(ws, clientId, data);
                break;
            case 'message':
                this.handleChatMessage(clientId, data);
                break;
            case 'typing':
                this.handleTyping(clientId, data);
                break;
        }
    }

    handleAuth(ws, clientId, data) {
        if (data.role === 'admin') {
            this.clients.set(clientId, { ws, role: 'admin' });
            this.adminConnections.add(clientId);
            
            // Отправляем админу список активных чатов
            const activeChats = Array.from(this.customerChats.entries()).map(([id, chat]) => ({
                chatId: id,
                customerName: chat.customerName,
                messages: chat.messages
            }));
            
            ws.send(JSON.stringify({
                type: 'chat_list',
                chats: activeChats
            }));
        } else {
            const customerName = data.name || 'Гость';
            this.clients.set(clientId, { ws, role: 'customer', name: customerName });
            this.customerChats.set(clientId, {
                customerName,
                messages: []
            });

            // Уведомляем админов о новом клиенте
            this.notifyAdmins({
                type: 'new_chat',
                chatId: clientId,
                customerName
            });

            // Подтверждаем подключение клиенту
            ws.send(JSON.stringify({
                type: 'auth_success',
                chatId: clientId
            }));
        }
    }

    handleChatMessage(clientId, data) {
        const sender = this.clients.get(clientId);
        if (!sender) return;

        const message = {
            id: uuidv4(),
            text: data.text,
            timestamp: new Date().toISOString(),
            sender: sender.role,
            senderName: sender.name || (sender.role === 'admin' ? 'Поддержка' : 'Гость')
        };

        if (sender.role === 'customer') {
            // Сообщение от клиента - отправляем всем админам
            const chat = this.customerChats.get(clientId);
            if (chat) {
                chat.messages.push(message);
                this.notifyAdmins({
                    type: 'chat_message',
                    chatId: clientId,
                    message
                });
            }
            // Отправляем подтверждение клиенту
            sender.ws.send(JSON.stringify({
                type: 'message_sent',
                message
            }));
        } else if (sender.role === 'admin') {
            // Сообщение от админа - отправляем конкретному клиенту
            const customerClient = this.clients.get(data.chatId);
            const chat = this.customerChats.get(data.chatId);
            
            if (chat && customerClient) {
                chat.messages.push(message);
                customerClient.ws.send(JSON.stringify({
                    type: 'chat_message',
                    message
                }));
                // Отправляем подтверждение админу
                sender.ws.send(JSON.stringify({
                    type: 'message_sent',
                    chatId: data.chatId,
                    message
                }));
            }
        }
    }

    handleTyping(clientId, data) {
        const sender = this.clients.get(clientId);
        if (!sender) return;

        if (sender.role === 'customer') {
            // Уведомляем админов о печатании клиента
            this.notifyAdmins({
                type: 'typing',
                chatId: clientId,
                isTyping: data.isTyping
            });
        } else if (sender.role === 'admin') {
            // Уведомляем клиента о печатании админа
            const customerClient = this.clients.get(data.chatId);
            if (customerClient) {
                customerClient.ws.send(JSON.stringify({
                    type: 'typing',
                    isTyping: data.isTyping
                }));
            }
        }
    }

    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        if (client.role === 'customer') {
            // Уведомляем админов об отключении клиента
            this.notifyAdmins({
                type: 'chat_closed',
                chatId: clientId
            });
            this.customerChats.delete(clientId);
        } else if (client.role === 'admin') {
            this.adminConnections.delete(clientId);
        }

        this.clients.delete(clientId);
    }

    notifyAdmins(message) {
        this.adminConnections.forEach(adminId => {
            const admin = this.clients.get(adminId);
            if (admin) {
                admin.ws.send(JSON.stringify(message));
            }
        });
    }
}

module.exports = ChatServer; 