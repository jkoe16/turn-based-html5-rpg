package com.jkoe16.server;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class GameWebSocketHandler extends TextWebSocketHandler {
    private final Map<String, String> sessionToPlayer = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("WS connected: " + session.getId());
        session.sendMessage(new TextMessage("{\"type\":\"system\",\"message\":\"connected\"}"));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        System.out.println("Received: " + payload);

        try {
            // simple validation: reject malformed JSON
            if (payload == null || payload.trim().isEmpty()) {
                session.sendMessage(new TextMessage("{\"type\":\"error\",\"message\":\"empty payload\"}"));
                return;
            }

            // very lightweight protocol handling
            if (payload.contains("\"type\":\"join\"")) {
                String playerName = payload.contains("\"name\"") ? payload.substring(payload.indexOf("\"name\":\") + 8) : "guest";
                // trim quotes from JSON value
                playerName = playerName.replaceAll("[\\\{\}\"\\:]", "").trim();
                if (playerName.isEmpty()) playerName = "guest";
                sessionToPlayer.put(session.getId(), playerName);

                session.sendMessage(new TextMessage("{\"type\":\"join_ok\",\"player\":\"" + playerName + "\"}"));
                return;
            }

            if (payload.contains("\"type\":\"action\"")) {
                String actionType = payload.contains("\"action\"") ? payload.substring(payload.indexOf("\"action\":\") + 10) : "";
                actionType = actionType.replaceAll("[\\\{\}\"\\:]", "").trim();

                if (actionType.isEmpty()) {
                    session.sendMessage(new TextMessage("{\"type\":\"error\",\"message\":\"missing action\"}"));
                    return;
                }

                session.sendMessage(new TextMessage("{\"type\":\"action_result\",\"status\":\"ok\",\"action\":\"" + actionType + "\"}"));
                return;
            }

            session.sendMessage(new TextMessage("{\"type\":\"server_echo\",\"payload\": " + payload + "}"));
        } catch (Exception e) {
            session.sendMessage(new TextMessage("{\"type\":\"error\",\"message\":\"invalid payload\"}"));
            System.err.println("Invalid payload: " + payload);
        }
    }
}
